"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PhoneOff, Video, VideoOff, Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
    StreamVideo, 
    StreamCall, 
    useCall,
    useCallStateHooks,
    SpeakerLayout,
    StreamVideoClient,
    ParticipantView,
} from "@stream-io/video-react-sdk";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { authClient } from "@/lib/auth-client";
import { AgentVoiceHandler } from "@/lib/ai/agent-voice";

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
        <div className="flex flex-col h-screen bg-[#202124] overflow-hidden font-sans">
            {/* Main Video Area */}
            <div className="flex-1 relative p-4 flex items-center justify-center min-h-0">
                {/* AI Status (Top Left) */}
                <div className="absolute top-6 left-6 z-50 transition-all duration-300">
                    <div className="bg-[#1e1e1e]/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex items-center gap-x-4 shadow-2xl">
                        <div className="relative">
                            <div className={`size-3.5 rounded-full ${agentHandler ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {agentHandler && <div className="absolute -inset-1 bg-emerald-500/30 rounded-full animate-ping" />}
                        </div>
                        <div className="flex flex-col pr-4">
                            <span className="text-white text-xs font-semibold tracking-wide flex items-center gap-x-2">
                                AI ARIA VOICE
                                {agentHandler && <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] border border-emerald-500/30">ONLINE</span>}
                            </span>
                            <span className="text-gray-400 text-[10px] uppercase font-bold tracking-tighter mt-0.5">
                                {agentHandler ? 'Intelligence Active' : 'Initializing Core...'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className={`w-full h-full max-w-7xl mx-auto grid gap-4 transition-all duration-500 ${
                    (participants.length + 1) === 1 ? 'grid-cols-1 max-w-4xl' : 
                    (participants.length + 1) === 2 ? 'grid-cols-1 md:grid-cols-2' :
                    (participants.length + 1) <= 4 ? 'grid-cols-2' :
                    'grid-cols-2 lg:grid-cols-3'
                }`}>
                    {/* Real Participants */}
                    {participants.map((p) => {
                        const isVideoOff = !p.videoStream;
                        return (
                            <div key={p.sessionId} className={`relative aspect-video bg-[#3c4043] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ring-2 ${
                                p.isSpeaking ? 'ring-[#8ab4f8]' : 'ring-white/5'
                            }`}>
                                {isVideoOff ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#3c4043] to-[#202124]">
                                        <Avatar className="size-28 md:size-40 border-4 border-[#5f6368] shadow-2xl ring-8 ring-black/5 animate-in zoom-in-95 duration-500">
                                            <AvatarImage src={p.image} />
                                            <AvatarFallback className="text-4xl md:text-6xl bg-[#8ab4f8] text-[#202124] font-bold">
                                                {(p.name || p.userId || "U").charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                ) : (
                                    <div className="w-full h-full transform scale-[1.01] animate-in fade-in duration-700">
                                        <ParticipantView participant={p} />
                                    </div>
                                )}
                                
                                {/* Overlay Info */}
                                <div className="absolute bottom-4 left-4 flex items-center gap-x-3 bg-[#202124]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                    {!p.audioStream && (
                                        <MicOff className="size-4 text-red-400" />
                                    )}
                                    <span className="text-white text-xs font-medium">
                                        {p.name || p.userId}
                                        {p.isLocalParticipant && " (You)"}
                                    </span>
                                </div>

                                {/* Active Speaker Pulsing Ring */}
                                {p.isSpeaking && (
                                    <div className="absolute inset-0 border-[4px] border-[#8ab4f8] rounded-2xl pointer-events-none animate-pulse" />
                                )}
                            </div>
                        );
                    })}

                    {/* AI Agent Participant */}
                    {agentHandler && (
                        <div className={`relative aspect-video bg-[#1a1c1e] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ring-4 ${
                            isAgentSpeaking ? 'ring-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'ring-emerald-500/20'
                        }`}>
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1117]">
                                <div className="relative">
                                    <Avatar className={`size-32 md:size-44 border-4 border-emerald-500/30 transition-all duration-500 ${isAgentSpeaking ? 'scale-110' : ''}`}>
                                        <AvatarFallback className="text-5xl bg-emerald-500/10 text-emerald-400 font-black tracking-widest">
                                            ARIA
                                        </AvatarFallback>
                                    </Avatar>
                                    {isAgentSpeaking && (
                                        <div className="absolute -inset-4 border-2 border-emerald-500/50 rounded-full animate-ping opacity-50" />
                                    )}
                                </div>
                                <div className="mt-6 text-center">
                                    <h3 className="text-white font-bold text-lg tracking-wider">ARIA ASSISTANT</h3>
                                    <p className="text-emerald-400 text-[10px] uppercase font-black tracking-[0.2em] mt-1">
                                        {isAgentSpeaking ? 'Generating Speech' : 'Listening...'}
                                    </p>
                                </div>
                            </div>

                            {/* Overlay Info */}
                            <div className="absolute bottom-4 left-4 flex items-center gap-x-3 bg-emerald-500/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/30">
                                <Mic className="size-4 text-emerald-400" />
                                <span className="text-white text-xs font-black tracking-widest">AI AGENT</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Transcription Captions (Google Meet Style) */}
            {lastTranscript && (
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-6 pointer-events-none">
                    <div className="bg-black/70 backdrop-blur-lg px-6 py-3 rounded-xl border border-white/5 text-center shadow-2xl">
                        <p className="text-white text-base md:text-lg font-medium leading-tight opacity-95 tracking-tight">
                            {lastTranscript}
                        </p>
                    </div>
                </div>
            )}
            
            {/* Control Bar */}
            <div className="h-24 flex items-center justify-between px-8 bg-[#202124]">
                <div className="hidden md:flex items-center gap-x-4">
                    <span className="text-white font-medium tracking-tight opacity-80">{meeting.name}</span>
                    <div className="h-4 w-px bg-white/10" />
                    <span className="text-white/40 text-xs font-mono">{meetingId.slice(0, 4)}-{meetingId.slice(4, 7)}</span>
                </div>

                <div className="flex items-center gap-x-4">
                    <Button
                        variant="ghost"
                        onClick={toggleAudio}
                        className={`size-14 rounded-full border-none transition-all duration-300 ${
                            isAudioEnabled ? 'bg-[#3c4043] text-white hover:bg-[#4a4e52]' : 'bg-[#ea4335] text-white hover:bg-[#d93025]'
                        }`}
                    >
                        {isAudioEnabled ? <Mic className="size-6" /> : <MicOff className="size-6" />}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={toggleVideo}
                        className={`size-14 rounded-full border-none transition-all duration-300 ${
                            isVideoEnabled ? 'bg-[#3c4043] text-white hover:bg-[#4a4e52]' : 'bg-[#ea4335] text-white hover:bg-[#d93025]'
                        }`}
                    >
                        {isVideoEnabled ? <Video className="size-6" /> : <VideoOff className="size-6" />}
                    </Button>
                    
                    <div className="w-4" />

                    <Button
                        variant="destructive"
                        onClick={onEndCall}
                        className="h-12 px-8 rounded-full bg-[#ea4335] hover:bg-[#d93025] border-none text-white font-bold tracking-tight shadow-lg shadow-red-500/20"
                    >
                        <PhoneOff className="size-5 mr-3" />
                        Leave Call
                    </Button>
                </div>

                <div className="hidden md:flex items-center gap-x-4">
                    {/* Placeholder for more controls */}
                    <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <div className="size-2 rounded-full bg-blue-400" />
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-y-4">
                <Loader2 className="size-8 animate-spin text-purple-500" />
                <p className="text-lg font-medium">Joining meeting...</p>
            </div>
        );
    }

    if (!isInCall) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#131314] p-6 lg:flex-row lg:gap-x-12">
                {/* Left Side: Video Preview */}
                <div className="w-full max-w-2xl aspect-video bg-[#202124] rounded-3xl overflow-hidden relative shadow-2xl border border-white/5 ring-1 ring-white/10">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-purple-500/10 to-transparent">
                        <Avatar className="size-40 border-8 border-white/5 shadow-2xl ring-1 ring-white/10">
                            <AvatarImage src={user?.image || ""} />
                            <AvatarFallback className="text-6xl bg-purple-600 text-white font-black">
                                {user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    
                    {/* Floating Controls Overlay */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-x-4">
                        <Button variant="ghost" size="lg" className="size-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 text-white transition-all duration-300">
                            <Mic className="size-6" />
                        </Button>
                        <Button variant="ghost" size="lg" className="size-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 text-white transition-all duration-300">
                            <Video className="size-6" />
                        </Button>
                    </div>
                </div>

                {/* Right Side: Join Info */}
                <div className="mt-12 lg:mt-0 w-full max-w-sm flex flex-col items-center lg:items-start">
                    <h2 className="text-4xl text-white font-black tracking-tight mb-2">{meeting.name}</h2>
                    <p className="text-gray-400 font-medium text-lg mb-10 tracking-wide">Ready to join your session?</p>
                    
                    <div className="flex flex-col w-full gap-y-4">
                        <Button
                            onClick={handleJoin}
                            className="w-full py-8 text-xl font-black bg-white text-black hover:bg-gray-200 rounded-2xl shadow-xl transition-all duration-300 transform active:scale-95 group"
                        >
                            Join Now
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/meetings/${meetingId}`)}
                            className="w-full py-6 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl font-bold transition-colors"
                        >
                            Go Back
                        </Button>
                    </div>

                    {/* Participant Hint */}
                    <div className="mt-12 flex items-center gap-x-3 text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        <div className="flex -space-x-3">
                            <div className="size-6 rounded-full bg-purple-500 border-2 border-[#131314]" />
                            <div className="size-6 rounded-full bg-emerald-500 border-2 border-[#131314]" />
                        </div>
                        <span className="text-sm font-bold tracking-tight">AI Agent waits for you</span>
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
