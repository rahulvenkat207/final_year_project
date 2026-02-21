"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    PhoneOff, 
    Video, 
    VideoOff, 
    Mic, 
    MicOff, 
    Loader2, 
    Sparkles, 
    Activity, 
    User,
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { 
    StreamVideo, 
    StreamCall, 
    useCall,
    useCallStateHooks,
    ParticipantView,
    StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { authClient } from "@/lib/auth-client";
import { AgentVoiceHandler } from "@/lib/ai/agent-voice";
import { cn } from "@/lib/utils";

interface Props {
    meetingId: string;
}

// Inner component to safely use Stream hooks
const CallController = ({ 
    meeting, 
    meetingId, 
    onEndCall 
}: { 
    meeting: any; 
    meetingId: string; 
    onEndCall: () => void;
}) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { useParticipants } = useCallStateHooks();
    const call = useCall();
    const participants = useParticipants();
    
    const [agentHandler, setAgentHandler] = useState<AgentVoiceHandler | null>(null);
    const isInitializingAgent = useRef(false);
    const processedParticipantsRef = useRef<Set<string>>(new Set());

    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [lastTranscript, setLastTranscript] = useState("");
    const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);


    const toggleVideo = useCallback(async () => {
        if (!call) return;
        await call.camera.toggle();
        setIsVideoEnabled((prev) => !prev);
    }, [call]);

    const toggleAudio = useCallback(async () => {
        if (!call) return;
        await call.microphone.toggle();
        setIsAudioEnabled((prev) => !prev);
    }, [call]);


    // Initialize AI agent
    useEffect(() => {
        if (!call || isInitializingAgent.current || agentHandler) return;

        const initializeAgent = async () => {
            try {
                isInitializingAgent.current = true;
                const agentResponse = await queryClient.fetchQuery(
                    trpc.agents.getOne.queryOptions({ id: meeting.agentId })
                );
                
                const sstProvider = (process.env.NEXT_PUBLIC_SST_PROVIDER as any) || "webspeech";
                const sstApiKey = sstProvider === "groq" 
                    ? (process.env.NEXT_PUBLIC_LLM_API_KEY || "") 
                    : (process.env.NEXT_PUBLIC_SST_API_KEY || "");

                const handler = new AgentVoiceHandler({
                    sstProvider,
                    sstApiKey,
                    llmProvider: (process.env.NEXT_PUBLIC_LLM_PROVIDER as any) || "groq",
                    llmApiKey: process.env.NEXT_PUBLIC_LLM_API_KEY || "",
                    ttsProvider: (process.env.NEXT_PUBLIC_TTS_PROVIDER as any) || "webspeech",
                    ttsApiKey: process.env.NEXT_PUBLIC_TTS_API_KEY || "",
                    meetingId,
                    agentInstructions: agentResponse.instructions,
                    onTranscript: (text) => {
                        if (text.trim().length > 1) {
                            setLastTranscript(text);
                            // Clear transcript after 5 seconds of silence
                            setTimeout(() => {
                                setLastTranscript(prev => prev === text ? "" : prev);
                            }, 5000);
                        }
                    },
                });

                handler.setIsSpeakingHandler(setIsAgentSpeaking);


                await handler.connect();
                setAgentHandler(handler);
                
                // Say welcome message
                setTimeout(() => {
                    handler.sayWelcome().catch(e => console.error("Welcome speech failed:", e));
                }, 1000);

                console.log("[AI Agent] Online and connected");
            } catch (error) {
                console.error("AI Agent Error:", error);
            }
        };

        initializeAgent();

        return () => {
            const currentHandler = agentHandler;
            if (currentHandler) {
                (currentHandler as AgentVoiceHandler).disconnect();
                setAgentHandler(null);
            }
            isInitializingAgent.current = false;
        };
    }, [call, meeting.agentId, meetingId, queryClient, trpc, agentHandler]);

    // Track audio
    useEffect(() => {
        if (!agentHandler || !participants) return;

        participants.forEach(p => {
            if (processedParticipantsRef.current.has(p.sessionId)) return;
            
            if (p.audioStream) {
                // Ensure we listen to the user (local) with high priority
                const label = p.isLocalParticipant ? 'LOCAL USER' : 'REMOTE';
                console.log(`[AI Agent] Attached to audio stream: ${p.name || p.userId} (${label})`);
                
                agentHandler.processAudioStream(p.audioStream);
                processedParticipantsRef.current.add(p.sessionId);
            }
        });
    }, [participants, agentHandler]);

    const activeAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    // Handle AI Audio Playback
    useEffect(() => {
        if (!agentHandler) return;

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        agentHandler.setAudioResponseHandler(async (audioBuffer) => {
            if (audioBuffer.byteLength === 0) return;

            try {
                if (audioCtx.state === 'suspended') {
                    await audioCtx.resume();
                }
                
                // Stop previous if still playing (though speak buffer usually queues)
                if (activeAudioSourceRef.current) {
                    activeAudioSourceRef.current.stop();
                }

                console.log("Playing AI response, length:", audioBuffer.byteLength);
                
                const int16Data = new Int16Array(audioBuffer);
                const float32Data = new Float32Array(int16Data.length);
                for (let i = 0; i < int16Data.length; i++) {
                    float32Data[i] = int16Data[i] / 32768.0;
                }

                const buffer = audioCtx.createBuffer(1, float32Data.length, 24000);
                buffer.getChannelData(0).set(float32Data);

                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(audioCtx.destination);
                
                activeAudioSourceRef.current = source;
                source.onended = () => {
                    if (activeAudioSourceRef.current === source) {
                        activeAudioSourceRef.current = null;
                    }
                };

                source.start(0);
            } catch (err) {
                console.error("Error playing AI audio:", err);
            }
        });

        agentHandler.setInterruptHandler(() => {
            if (activeAudioSourceRef.current) {
                console.log("[AI Agent] Interrupted by user");
                activeAudioSourceRef.current.stop();
                activeAudioSourceRef.current = null;
            }
        });

        return () => {
            audioCtx.close().catch(() => {});
        };
    }, [agentHandler]);



    return (
        <div className="flex flex-col h-screen bg-[#09090b] overflow-hidden font-sans">
            {/* Main Video Area */}
            <div className="flex-1 relative p-6 flex items-center justify-center min-h-0">
                {/* AI Status (Top Left) */}
                <div className="absolute top-8 left-8 z-50 transition-all duration-300">
                    <div className="bg-zinc-900/80 backdrop-blur-2xl rounded-2xl p-4 border border-white/10 flex items-center gap-x-4 shadow-2xl ring-1 ring-white/5">
                        <div className="relative">
                            <div className={`size-3 rounded-full ${agentHandler ? 'bg-indigo-500' : 'bg-amber-500'}`} />
                            {agentHandler && <div className="absolute -inset-1 bg-indigo-500/40 rounded-full animate-ping" />}
                        </div>
                        <div className="flex flex-col pr-4">
                            <span className="text-white text-[10px] font-black tracking-[0.2em] flex items-center gap-x-2 uppercase">
                                Aria Neural Link
                                {agentHandler && <span className="bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded text-[8px] border border-indigo-500/30">LOCKED</span>}
                            </span>
                            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-tighter mt-1">
                                {agentHandler ? 'Transmitting Insights' : 'Initializing Core...'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className={cn(
                    "w-full h-full max-w-7xl mx-auto grid gap-6 transition-all duration-700",
                    (participants.length + 1) === 1 ? 'grid-cols-1 max-w-4xl' : 
                    (participants.length + 1) === 2 ? 'grid-cols-1 md:grid-cols-2' :
                    (participants.length + 1) <= 4 ? 'grid-cols-2' :
                    'grid-cols-2 lg:grid-cols-3'
                )}>
                    {/* Real Participants */}
                    {participants.map((p) => {
                        const isVideoOff = !p.videoStream;
                        return (
                            <div key={p.sessionId} className={cn(
                                "relative aspect-video bg-zinc-900/50 rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500 border-2",
                                p.isSpeaking ? 'border-primary/50' : 'border-white/5'
                            )}>
                                {isVideoOff ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                                        <div className="relative group">
                                            <Avatar className="size-32 md:size-48 border-4 border-zinc-800 shadow-2xl ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-500">
                                                <AvatarImage src={p.image} />
                                                <AvatarFallback className="text-4xl md:text-6xl bg-indigo-600/10 text-indigo-400 font-extrabold uppercase">
                                                    {(p.name || p.userId || "U").charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {p.isSpeaking && (
                                                <div className="absolute -inset-4 border border-primary/30 rounded-full animate-pulse blur-md" />
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full transform scale-[1.01] animate-in fade-in duration-1000">
                                        <ParticipantView participant={p} />
                                    </div>
                                )}
                                
                                {/* Overlay Info */}
                                <div className="absolute bottom-6 left-6 flex items-center gap-x-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/5 shadow-xl">
                                    {!p.audioStream && (
                                        <MicOff className="size-3.5 text-red-400" />
                                    )}
                                    <span className="text-white text-[11px] font-black uppercase tracking-widest">
                                        {p.name || p.userId}
                                        {p.isLocalParticipant && " (MASTER)"}
                                    </span>
                                </div>

                                {/* Active Speaker Glow */}
                                {p.isSpeaking && (
                                    <div className="absolute inset-0 ring-4 ring-primary/40 ring-inset rounded-[32px] pointer-events-none animate-pulse" />
                                )}
                            </div>
                        );
                    })}

                    {/* AI Agent Participant */}
                    {agentHandler && (
                        <div className={cn(
                            "relative aspect-video bg-black/90 rounded-[32px] overflow-hidden shadow-2xl transition-all duration-700 border-2",
                            isAgentSpeaking ? 'border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.2)] scale-[1.02]' : 'border-indigo-500/20'
                        )}>
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]">
                                <div className="relative">
                                    <div className={cn(
                                        "size-36 md:size-52 rounded-full border-4 border-indigo-500/20 bg-indigo-500/5 flex items-center justify-center transition-all duration-700 z-10 relative",
                                        isAgentSpeaking ? 'scale-110 border-indigo-500/40 bg-indigo-500/10' : ''
                                    )}>
                                        <div className="flex flex-col items-center">
                                            <Sparkles className={cn("size-12 mb-2 transition-all duration-500", isAgentSpeaking ? 'text-indigo-400 scale-125' : 'text-indigo-600/50')} />
                                            <p className="text-indigo-400 text-xs font-black tracking-[0.3em] uppercase">Aria</p>
                                        </div>
                                    </div>
                                    {isAgentSpeaking && (
                                        <>
                                            <div className="absolute -inset-6 border-2 border-indigo-500/30 rounded-full animate-ping opacity-20" />
                                            <div className="absolute -inset-10 border border-indigo-500/10 rounded-full animate-pulse opacity-10" />
                                        </>
                                    )}
                                </div>
                                <div className="mt-8 text-center px-8">
                                    <h3 className="text-white font-black text-sm tracking-[0.2em] uppercase mb-1">Intelligence Module</h3>
                                    <div className="flex items-center gap-3 justify-center">
                                         <div className={cn("h-1 w-12 rounded-full transition-all duration-500", isAgentSpeaking ? 'bg-indigo-500 h-1.5' : 'bg-zinc-800')} />
                                         <p className="text-zinc-500 text-[9px] uppercase font-black tracking-widest whitespace-nowrap">
                                            {isAgentSpeaking ? 'Neural Synthesis Active' : 'Waiting for prompt...'}
                                         </p>
                                         <div className={cn("h-1 w-12 rounded-full transition-all duration-500", isAgentSpeaking ? 'bg-indigo-500 h-1.5' : 'bg-zinc-800')} />
                                    </div>
                                </div>
                            </div>

                            {/* Overlay Info */}
                            <div className="absolute bottom-6 left-6 flex items-center gap-x-3 bg-indigo-600/20 backdrop-blur-xl px-4 py-2 rounded-2xl border border-indigo-500/30 shadow-xl">
                                <Activity className={cn("size-3.5", isAgentSpeaking ? 'text-indigo-400' : 'text-indigo-600')} />
                                <span className="text-white text-[11px] font-black tracking-widest uppercase">Agent Core</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Transcription Captions */}
            {lastTranscript && (
                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-8 pointer-events-none animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white/10 dark:bg-black/80 backdrop-blur-2xl px-8 py-5 rounded-[24px] border border-white/10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <p className="text-white text-lg md:text-xl font-bold leading-tight opacity-95 tracking-tight italic">
                            "{lastTranscript}"
                        </p>
                    </div>
                </div>
            )}
            
            {/* Control Bar */}
            <div className="h-28 flex items-center justify-between px-10 bg-[#09090b] border-t border-white/5">
                <div className="hidden lg:flex items-center gap-x-6">
                    <div className="space-y-1">
                        <span className="text-white text-sm font-black uppercase tracking-widest opacity-90">{meeting.name}</span>
                        <div className="flex items-center gap-3">
                             <div className="flex items-center gap-1.5">
                                <Activity className="size-3 text-indigo-500" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Session Encrypted</span>
                             </div>
                             <span className="text-zinc-800 text-xs">|</span>
                             <span className="text-zinc-600 text-[10px] font-black uppercase tracking-tighter">ID: {meetingId.slice(0, 12)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <Button
                        variant="ghost"
                        onClick={toggleAudio}
                        className={cn(
                            "group relative size-16 rounded-full border border-white/10 transition-all duration-300",
                            isAudioEnabled ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30'
                        )}
                    >
                        {isAudioEnabled ? <Mic className="size-6 transition-transform group-active:scale-90" /> : <MicOff className="size-6" />}
                        {isAudioEnabled && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full shadow-glow" />}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={toggleVideo}
                        className={cn(
                            "group relative size-16 rounded-full border border-white/10 transition-all duration-300",
                            isVideoEnabled ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30'
                        )}
                    >
                        {isVideoEnabled ? <Video className="size-6 transition-transform group-active:scale-90" /> : <VideoOff className="size-6" />}
                        {isVideoEnabled && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full shadow-glow" />}
                    </Button>
                    
                    <div className="hidden sm:block w-px h-10 bg-white/10 mx-3" />

                    <Button
                        variant="destructive"
                        onClick={onEndCall}
                        className="h-14 px-10 rounded-2xl bg-red-600 hover:bg-red-700 border-none text-white font-black uppercase tracking-widest shadow-2xl shadow-red-600/20 group active:scale-95 transition-all"
                    >
                        <PhoneOff className="size-5 mr-3 group-hover:rotate-12 transition-transform" />
                        Abort
                    </Button>
                </div>

                <div className="hidden lg:flex items-center gap-4">
                     <Button variant="ghost" size="icon" className="size-12 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white transition-colors">
                        <Settings className="size-5" />
                     </Button>
                     <div className="flex -space-x-3">
                        {participants.slice(0, 3).map(p => (
                             <div key={p.sessionId} className="size-9 rounded-xl border-2 border-[#09090b] bg-zinc-800 flex items-center justify-center text-[10px] font-black uppercase tracking-tighter">
                                {p.name?.charAt(0) || 'U'}
                             </div>
                        ))}
                        <div className="size-9 rounded-xl border-2 border-[#09090b] bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-[10px] font-black">
                            +{participants.length}
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};


export const MeetingCallView = ({ meetingId }: Props) => {
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { data: session } = authClient.useSession();
    const user = session?.user;

    const [isInCall, setIsInCall] = useState(false);
    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { data: meeting } = useSuspenseQuery(
        trpc.meetings.getOne.queryOptions({ id: meetingId })
    );

    const endMeeting = useMutation(
        trpc.meetings.end.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.meetings.getOne.queryOptions({ id: meetingId }));
                queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
                router.push(`/meetings/${meetingId}`);
            },
            onError: (error) => toast.error(error.message)
        })
    );

    const handleJoin = async () => {
        if (!user) return;
        try {
            setIsLoading(true);
            const tokenResponse = await fetch("/api/stream/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "video" }),
            });
            const { token } = await tokenResponse.json();

            const apiKey = process.env.NEXT_PUBLIC_STREAM_VEDIO_API_KEY;
            if (!apiKey) throw new Error("Stream API Key missing");

            const client = new StreamVideoClient({
                apiKey,
                user: { id: user.id, name: user.name || "User" },
                token,
            });
            setVideoClient(client);

            const callResponse = await fetch("/api/stream/call", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ meetingId }),
            });
            const { callId } = await callResponse.json();

            const streamCall = client.call("default", callId);
            await streamCall.join({ create: true });
            
            setCall(streamCall);
            setIsInCall(true);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to join call");
            setIsLoading(false);
        }
    };

    const handleEndCall = async () => {
        try {
            if (call) {
                // Check if already left to prevent error
                const state = call.state?.callingState;
                if (state !== 'left' && state !== 'leaving') {
                    await call.leave();
                }
            }
            if (videoClient) {
                await videoClient.disconnectUser();
            }
            endMeeting.mutate({ id: meetingId });
        } catch (err) {
            console.error("Error ending call:", err);
            // Fallback push
            router.push(`/meetings/${meetingId}`);
        }
    };


    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] text-white gap-y-6">
                <div className="relative">
                    <Loader2 className="size-16 animate-spin text-indigo-500 opacity-20" />
                    <Sparkles className="absolute inset-x-0 inset-y-0 m-auto size-6 text-indigo-500 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-[0.2em]">Synchronizing</h3>
                    <p className="text-zinc-500 font-bold bg-indigo-500/5 px-4 py-1 rounded-full text-xs">Awaiting Neural Handshake</p>
                </div>
            </div>
        );
    }

    if (!isInCall) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] p-6 lg:flex-row lg:gap-x-24">
                {/* Background Decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px]" />
                </div>

                {/* Left Side: Video Preview */}
                <div className="relative w-full max-w-2xl group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-[32px] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-700" />
                    <div className="relative aspect-video bg-[#131314] rounded-[32px] overflow-hidden shadow-2xl border border-white/5 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent flex items-center justify-center">
                             <div className="relative">
                                <Avatar className="size-48 md:size-56 border-8 border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-700">
                                    <AvatarImage src={user?.image || ""} />
                                    <AvatarFallback className="text-7xl bg-indigo-600/10 text-indigo-400 font-black uppercase">
                                        {user?.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-2 -right-2 p-3 bg-emerald-500 rounded-2xl shadow-xl shadow-emerald-500/20 border-4 border-[#131314]">
                                    <Activity className="size-6 text-white" />
                                </div>
                             </div>
                        </div>
                        
                        {/* Floating Controls Overlay */}
                        <div className="absolute bottom-10 flex items-center gap-x-6 z-20">
                            {[
                                { icon: Mic, active: true },
                                { icon: Video, active: true },
                                { icon: User, active: false }
                            ].map((btn, i) => (
                                <button key={i} className={cn(
                                    "size-14 rounded-2xl backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300",
                                    btn.active ? "bg-white/10 text-white hover:bg-white/20" : "bg-black/40 text-zinc-500 hover:text-white"
                                )}>
                                    <btn.icon className="size-5" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Join Info */}
                <div className="mt-16 lg:mt-0 w-full max-w-sm flex flex-col items-center lg:items-start relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-3 py-1 font-black uppercase tracking-widest text-[10px]">Security Layer v4.0</Badge>
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Active</span>
                    </div>
                    
                    <h2 className="text-5xl text-white font-black tracking-tighter mb-4 leading-none uppercase">{meeting.name}</h2>
                    <p className="text-zinc-400 font-bold text-lg mb-12 tracking-tight">Your neural uplink is ready for synchronization.</p>
                    
                    <div className="flex flex-col w-full gap-y-4">
                        <Button
                            onClick={handleJoin}
                            className="w-full py-10 text-sm font-black uppercase tracking-[0.3em] bg-white text-black hover:bg-zinc-200 rounded-[24px] shadow-2xl transition-all duration-300 group relative overflow-hidden active:scale-95"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Initialize Uplink
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                             <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-black/5 to-transparent group-hover:left-[100%] transition-all duration-1000" />
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/meetings/${meetingId}`)}
                            className="w-full py-8 text-zinc-500 hover:text-white hover:bg-white/5 rounded-[24px] font-black uppercase tracking-[0.2em] transition-colors text-[10px]"
                        >
                            Decline Session
                        </Button>
                    </div>

                    {/* Participant Hint */}
                    <div className="mt-16 flex items-center gap-x-4 bg-zinc-900/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5">
                        <div className="relative">
                            <BotIcon className="size-6 text-indigo-500" />
                            <div className="absolute -top-1 -right-1 size-2.5 bg-emerald-500 rounded-full border-2 border-[#09090b]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black tracking-widest text-zinc-200 uppercase">Aria Assistant</span>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase">Awaiting Master Entry</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    if (!videoClient || !call) return null;

    return (
        <StreamVideo client={videoClient}>
            <StreamCall call={call}>
                <CallController 
                    meeting={meeting} 
                    meetingId={meetingId} 
                    onEndCall={handleEndCall} 
                />
            </StreamCall>
        </StreamVideo>
    );
};

const BotIcon = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
    </svg>
);

const Settings = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
