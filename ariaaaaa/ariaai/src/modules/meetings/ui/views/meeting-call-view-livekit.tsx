"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { 
    LiveKitRoom,
    VideoTrack,
    useTracks,
    RoomAudioRenderer,
    useRoomContext
} from "@livekit/components-react";
import { RoomEvent, Track, createLocalVideoTrack, LocalVideoTrack } from "livekit-client";
import { authClient } from "@/lib/auth-client";
import { AgentVoiceHandler } from "@/lib/ai/agent-voice";

interface Props {
    meetingId: string;
}

export const MeetingCallViewLiveKit = ({ meetingId }: Props) => {
    const router = useRouter();
    const session = authClient.useSession();
    const user = session.data?.user;
    const [token, setToken] = useState<string | null>(null);
    const [roomName, setRoomName] = useState<string | null>(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoined, setIsJoined] = useState(false);
    const trpc = useTRPC();

    const [previewTrack, setPreviewTrack] = useState<LocalVideoTrack | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const { data: meeting } = useSuspenseQuery(
        trpc.meetings.getOne.queryOptions({ id: meetingId })
    );

    useEffect(() => {
        let track: LocalVideoTrack | null = null;

        const createPreview = async () => {
            if (!isJoined && isVideoEnabled) {
                try {
                    track = await createLocalVideoTrack({
                        deviceId: undefined, 
                        resolution: { width: 640, height: 480 },
                    });
                    setPreviewTrack(track);
                    if (videoRef.current && track) {
                        track.attach(videoRef.current);
                    }
                } catch (e) {
                    console.error("Failed to create preview track", e);
                }
            } else if (!isVideoEnabled) {
                setPreviewTrack(null);
            }
        };

        createPreview();

        return () => {
            if (track) {
                track.stop();
            }
        };
    }, [isJoined, isVideoEnabled]);

    // Initialize LiveKit token and room
    useEffect(() => {
        if (!user) return;

        const initializeCall = async () => {
            try {
                setIsLoading(true);

                // Get room info
                const roomResponse = await fetch("/api/livekit/room", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ meetingId }),
                });

                if (!roomResponse.ok) {
                    throw new Error("Failed to get room");
                }

                const { roomName: rn } = await roomResponse.json();
                setRoomName(rn);

                // Get LiveKit token
                const tokenResponse = await fetch("/api/livekit/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ roomName: rn }),
                });

                if (!tokenResponse.ok) {
                    throw new Error("Failed to get LiveKit token");
                }

                const { token: livekitToken } = await tokenResponse.json();
                setToken(livekitToken);
                setIsLoading(false);
            } catch (error) {
                console.error("Error initializing call:", error);
                toast.error("Failed to initialize call");
                setIsLoading(false);
            }
        };

        initializeCall();
    }, [user, meetingId]);

    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

    if (!serverUrl) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <p>LiveKit URL not configured. Please set NEXT_PUBLIC_LIVEKIT_URL in your .env file.</p>
            </div>
        );
    }

    if (isLoading || !token || !roomName) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <h2 className="text-2xl font-bold mb-4">{meeting.name}</h2>
                    <p className="text-gray-600 mb-6">Preparing meeting...</p>
                </div>
            </div>
        );
    }

    if (!isJoined) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
                    <h2 className="text-2xl font-bold mb-2 text-center">{meeting.name}</h2>
                    <p className="text-gray-600 mb-6 text-center">Ready to join?</p>
                    
                    <div className="mb-8 aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                         {isVideoEnabled && (
                            <div className="w-full h-full flex items-center justify-center">
                                <video ref={videoRef} className="w-full h-full object-cover transform -scale-x-100" />
                            </div>
                        )}
                        {!isVideoEnabled && (
                            <div className="w-full h-full flex items-center justify-center text-white">
                                <div className="bg-gray-700 rounded-full p-6">
                                    <VideoOff className="h-12 w-12" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium">Camera</span>
                            <Button
                                variant={isVideoEnabled ? "default" : "outline"}
                                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                                className={isVideoEnabled ? "bg-blue-600 hover:bg-blue-700" : ""}
                            >
                                {isVideoEnabled ? <Video className="h-4 w-4 mr-2" /> : <VideoOff className="h-4 w-4 mr-2" />}
                                {isVideoEnabled ? "On" : "Off"}
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium">Microphone</span>
                            <Button
                                variant={isAudioEnabled ? "default" : "outline"}
                                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                                className={isAudioEnabled ? "bg-blue-600 hover:bg-blue-700" : ""}
                            >
                                {isAudioEnabled ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                                {isAudioEnabled ? "On" : "Off"}
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                                if (previewTrack) previewTrack.stop();
                                setIsJoined(true);
                            }}
                        >
                            Join Now
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <LiveKitRoom
            video={isVideoEnabled}
            audio={isAudioEnabled}
            token={token}
            serverUrl={serverUrl}
            connect={isJoined}
            onDisconnected={() => {
                setIsJoined(false);
                router.push(`/meetings/${meetingId}`);
            }}
            data-lk-theme="default"
        >
            <RoomAudioRenderer />
            <div className="flex flex-col h-screen bg-gray-900">
                <div className="flex-1 flex items-center justify-center p-4">
                    <VideoTracks />
                </div>
                
                <RoomController 
                    meetingId={meetingId}
                    isVideoEnabled={isVideoEnabled}
                    isAudioEnabled={isAudioEnabled}
                    setIsVideoEnabled={setIsVideoEnabled}
                    setIsAudioEnabled={setIsAudioEnabled}
                />
            </div>
        </LiveKitRoom>
    );
};

const RoomController = ({ 
    meetingId,
    isVideoEnabled,
    isAudioEnabled,
    setIsVideoEnabled,
    setIsAudioEnabled
}: {
    meetingId: string;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    setIsVideoEnabled: (v: boolean | ((prev: boolean) => boolean)) => void;
    setIsAudioEnabled: (v: boolean | ((prev: boolean) => boolean)) => void;
}) => {
    const room = useRoomContext();
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();
    const agentVoiceHandlerRef = useRef<AgentVoiceHandler | null>(null);

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
            onError: (error) => {
                toast.error(error.message);
            }
        })
    );

    // Initialize AI agent voice handler
    useEffect(() => {
        if (!room || !meeting) return;

        const initializeAgent = async () => {
            try {
                // Get agent instructions
                const agentResponse = await queryClient.fetchQuery(
                    trpc.agents.getOne.queryOptions({ id: meeting.agentId })
                );
                const agentInstructions = agentResponse.instructions;

                // Initialize agent voice handler
                const handler = new AgentVoiceHandler({
                    sstProvider: (process.env.NEXT_PUBLIC_SST_PROVIDER as any) || "assemblyai",
                    sstApiKey: process.env.NEXT_PUBLIC_SST_API_KEY || "",
                    llmProvider: (process.env.NEXT_PUBLIC_LLM_PROVIDER as any) || "grok",
                    llmApiKey: process.env.NEXT_PUBLIC_LLM_API_KEY || "",
                    ttsProvider: (process.env.NEXT_PUBLIC_TTS_PROVIDER as any) || "elevenlabs",
                    ttsApiKey: process.env.NEXT_PUBLIC_TTS_API_KEY || "",
                    meetingId,
                    agentInstructions,
                    onTranscript: (text) => {
                        console.log("Agent transcript:", text);
                    },
                });

                await handler.connect();
                agentVoiceHandlerRef.current = handler;

                // Set up audio response handler
                handler.setAudioResponseHandler(async (audioBuffer) => {
                    // Play audio through LiveKit room
                    if (room) {
                        try {
                            // TODO: Implement proper audio playback from ArrayBuffer
                            // We need to decode the buffer and play it via AudioContext or publish it
                            console.log("Received audio response from agent, length:", audioBuffer.byteLength);
                            
                            // Placeholder for publishing logic
                            // const audioTrack = await room.localParticipant.publishTrack(
                            //     new LocalAudioTrack(...) 
                            // );
                        } catch (e) {
                            console.error("Failed to play agent audio", e);
                        }
                    }
                });

                // Process audio from room
                room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                    if (track.kind === "audio" && participant.identity !== room.localParticipant.identity) {
                         const mediaStream = new MediaStream([track.mediaStreamTrack]);
                         handler.processAudioStream(mediaStream);
                    }
                });
            } catch (error) {
                console.error("Error initializing agent:", error);
            }
        };

        initializeAgent();

        return () => {
            if (agentVoiceHandlerRef.current) {
                agentVoiceHandlerRef.current.disconnect();
            }
        };
    }, [room, meeting]);

    const handleEndCall = async () => {
        if (agentVoiceHandlerRef.current) {
            await agentVoiceHandlerRef.current.disconnect();
        }
        if (room) {
            room.disconnect();
        }
        endMeeting.mutate({ id: meetingId });
    };

    const toggleVideo = async () => {
        if (!room) return;
        const videoTrack = room.localParticipant.getTrackPublication(Track.Source.Camera);
        if (videoTrack) {
            if (isVideoEnabled) {
                 await room.localParticipant.setCameraEnabled(false);
                 setIsVideoEnabled(false);
            } else {
                 await room.localParticipant.setCameraEnabled(true);
                 setIsVideoEnabled(true);
            }
        }
    };

    const toggleAudio = async () => {
        if (!room) return;
        const audioTrack = room.localParticipant.getTrackPublication(Track.Source.Microphone);
        if (audioTrack) {
             if (isAudioEnabled) {
                 await room.localParticipant.setMicrophoneEnabled(false);
                 setIsAudioEnabled(false);
             } else {
                 await room.localParticipant.setMicrophoneEnabled(true);
                 setIsAudioEnabled(true);
             }
        }
    };

    return (
        <div className="bg-gray-800 p-4 flex items-center justify-center gap-x-4">
            <Button
                variant={isVideoEnabled ? "default" : "outline"}
                onClick={toggleVideo}
                size="lg"
            >
                {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            <Button
                variant={isAudioEnabled ? "default" : "outline"}
                onClick={toggleAudio}
                size="lg"
            >
                {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            <Button
                variant="destructive"
                onClick={handleEndCall}
                disabled={endMeeting.isPending}
                size="lg"
            >
                <PhoneOff className="h-5 w-5 mr-2" />
                {endMeeting.isPending ? "Ending..." : "End Call"}
            </Button>
        </div>
    );
};

const VideoTracks = () => {
    const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });

    if (tracks.length === 0) {
        return (
            <div className="text-white text-center">
                <p>Waiting for participants...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
            {tracks.map((track) => (
                <VideoTrack key={track.participant.identity} trackRef={track} />
            ))}
        </div>
    );
};
