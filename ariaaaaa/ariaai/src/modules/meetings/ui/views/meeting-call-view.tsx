"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { 
    StreamVideo, 
    StreamCall, 
    useCallStateHooks,
    ParticipantView,
    CallControls,
    CallParticipantsList,
    SpeakerLayout,
    GridLayout,
} from "@stream-io/video-react-sdk";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { authClient } from "@/lib/auth-client";

interface Props {
    meetingId: string;
}

export const MeetingCallView = ({ meetingId }: Props) => {
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { data: session } = authClient.useSession();
    const user = session?.user;
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isInCall, setIsInCall] = useState(false);
    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    // Initialize Stream Video client and join call
    useEffect(() => {
        if (!user || isInCall) return;

        const initializeCall = async () => {
            try {
                setIsLoading(true);
                
                // Get Stream token
                const tokenResponse = await fetch("/api/stream/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "video" }),
                });

                if (!tokenResponse.ok) {
                    throw new Error("Failed to get Stream token");
                }

                const { token } = await tokenResponse.json();

                // Create Stream Video client
                const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
                if (!apiKey) {
                    throw new Error("Stream API key not configured");
                }

                const client = new StreamVideoClient({
                    apiKey,
                    user: {
                        id: user.id,
                        name: user.name || "User",
                    },
                    token,
                });

                setVideoClient(client);

                // Create/get call
                const callResponse = await fetch("/api/stream/call", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ meetingId }),
                });

                if (!callResponse.ok) {
                    throw new Error("Failed to create call");
                }

                const { callId } = await callResponse.json();
                const streamCall = client.call("default", callId);
                
                // Join call with camera/mic settings
                await streamCall.join({
                    create: true,
                    data: {
                        custom: {
                            meetingId,
                            agentId: meeting.agentId,
                        },
                    },
                });

                setCall(streamCall);
                setIsInCall(true);
                setIsLoading(false);
                toast.success("Joined call");

                // TODO: Join AI agent to call using OpenAI Realtime API
                // This will be implemented in a separate effect

            } catch (error) {
                console.error("Error initializing call:", error);
                toast.error("Failed to join call");
                setIsLoading(false);
            }
        };

        initializeCall();

        // Cleanup on unmount
        return () => {
            if (call) {
                call.leave().catch(console.error);
            }
            if (videoClient) {
                videoClient.disconnectUser().catch(console.error);
            }
        };
    }, [user, meetingId, meeting.agentId]);

    const handleEndCall = async () => {
        try {
            if (call) {
                await call.leave();
            }
            if (videoClient) {
                await videoClient.disconnectUser();
            }
            endMeeting.mutate({ id: meetingId });
        } catch (error) {
            console.error("Error ending call:", error);
            endMeeting.mutate({ id: meetingId });
        }
    };

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

    // Show lobby/pre-call screen
    if (!isInCall || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <h2 className="text-2xl font-bold mb-4">{meeting.name}</h2>
                    <p className="text-gray-600 mb-6">
                        {isLoading ? "Joining call..." : "Prepare to join your meeting"}
                    </p>
                    
                    {!isLoading && (
                        <>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span>Camera</span>
                                    <Button
                                        variant={isVideoEnabled ? "default" : "outline"}
                                        onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                                    >
                                        {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Microphone</span>
                                    <Button
                                        variant={isAudioEnabled ? "default" : "outline"}
                                        onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                                    >
                                        {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/meetings/${meetingId}`)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => setIsInCall(true)}
                                    className="flex-1"
                                >
                                    Join Call
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Show call interface with Stream Video
    if (!videoClient || !call) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <p>Loading call...</p>
            </div>
        );
    }

    return (
        <StreamVideo client={videoClient}>
            <StreamCall call={call}>
                <div className="flex flex-col h-screen bg-gray-900">
                    <div className="flex-1 relative">
                        <SpeakerLayout />
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
            </StreamCall>
        </StreamVideo>
    );
};
