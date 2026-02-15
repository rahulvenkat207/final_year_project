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
    Track,
} from "@livekit/components-react";
import { Room, RoomEvent, TrackPublication } from "livekit-client";
import { authClient } from "@/lib/auth-client";
import { AgentVoiceHandler } from "@/lib/ai/agent-voice";

interface Props {
    meetingId: string;
}

export const MeetingCallViewLiveKit = ({ meetingId }: Props) => {
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { data: session } = authClient.useSession();
    const user = session?.user;
    const [token, setToken] = useState<string | null>(null);
    const [roomName, setRoomName] = useState<string | null>(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [room, setRoom] = useState<Room | null>(null);
    const [isLoading, setIsLoading] = useState(true);
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

    // Initialize AI agent voice handler
    useEffect(() => {
        if (!room || !meeting) return;

        const initializeAgent = async () => {
            try {
                // Get agent instructions
                const agentResponse = await trpc.agents.getOne.query({ id: meeting.agentId });
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
                        const audioTrack = await room.localParticipant.publishAudio(
                            new MediaStream([new MediaStreamTrack({ kind: "audio" })])
                        );
                        // Note: Actual implementation would need to convert ArrayBuffer to MediaStreamTrack
                    }
                });

                // Process audio from room
                room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                    if (track.kind === "audio" && participant.identity !== room.localParticipant.identity) {
                        // Get audio stream and process it
                        const mediaStream = new MediaStream([track.mediaStreamTrack]);
                        handler.processLiveKitAudio(mediaStream);
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
        try {
            if (agentVoiceHandlerRef.current) {
                await agentVoiceHandlerRef.current.disconnect();
            }
            if (room) {
                room.disconnect();
            }
            endMeeting.mutate({ id: meetingId });
        } catch (error) {
            console.error("Error ending call:", error);
            endMeeting.mutate({ id: meetingId });
        }
    };

    const toggleVideo = async () => {
        if (!room) return;
        const videoTrack = room.localParticipant.getTrackPublication(Track.Source.Camera);
        if (videoTrack) {
            await room.localParticipant.setCameraEnabled(!isVideoEnabled);
            setIsVideoEnabled((prev) => !prev);
        }
    };

    const toggleAudio = async () => {
        if (!room) return;
        const audioTrack = room.localParticipant.getTrackPublication(Track.Source.Microphone);
        if (audioTrack) {
            await room.localParticipant.setMicrophoneEnabled(!isAudioEnabled);
            setIsAudioEnabled((prev) => !prev);
        }
    };

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
                    <p className="text-gray-600 mb-6">Joining call...</p>
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
            connect={true}
            onConnected={(room) => {
                setRoom(room);
                toast.success("Joined call");
            }}
            onDisconnected={() => {
                router.push(`/meetings/${meetingId}`);
            }}
        >
            <RoomAudioRenderer />
            <div className="flex flex-col h-screen bg-gray-900">
                <div className="flex-1 flex items-center justify-center p-4">
                    <VideoTracks />
                </div>
                
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
            </div>
        </LiveKitRoom>
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

