"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoIcon, Clock, CheckCircle2, XCircle, Loader2, Calendar, FileText, Play, PhoneOff } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TranscriptViewer } from "../components/transcript-viewer";
import { MeetingChat } from "../components/meeting-chat";

interface Props {
    meetingId: string;
}

const statusConfig = {
    upcoming: { label: "Upcoming", icon: Clock, variant: "outline" as const },
    active: { label: "Active", icon: VideoIcon, variant: "default" as const },
    processing: { label: "Processing", icon: Loader2, variant: "secondary" as const },
    completed: { label: "Completed", icon: CheckCircle2, variant: "default" as const },
    cancelled: { label: "Cancelled", icon: XCircle, variant: "destructive" as const },
};

export const MeetingIdView = ({ meetingId }: Props) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));
    
    const status = data.status;
    const config = statusConfig[status] || statusConfig.upcoming;
    const StatusIcon = config.icon;

    const startMeeting = useMutation(
        trpc.meetings.start.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.meetings.getOne.queryOptions({ id: meetingId }));
                queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
                router.push(`/meetings/${meetingId}/call`);
            },
            onError: (error) => {
                toast.error(error.message);
            }
        })
    );

    const endMeeting = useMutation(
        trpc.meetings.end.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.meetings.getOne.queryOptions({ id: meetingId }));
                queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
                toast.success("Meeting ended. Processing transcript...");
            },
            onError: (error) => {
                toast.error(error.message);
            }
        })
    );

    const handleStart = () => {
        startMeeting.mutate({ id: meetingId });
    };

    const handleEnd = () => {
        endMeeting.mutate({ id: meetingId });
    };

    return (
        <div className="flex-1 py-4 md:px-8 flex flex-col gap-y-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg border shadow-lg">
                <div className="px-4 py-5 gap-y-5 flex flex-col">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-medium text-gray-900">{data.name}</h2>
                        <div className="flex items-center gap-x-2">
                            <Badge variant={config.variant} className="flex items-center gap-x-2">
                                <StatusIcon className="size-4" />
                                {config.label}
                            </Badge>
                            {status === "upcoming" && (
                                <Button onClick={handleStart} disabled={startMeeting.isPending}>
                                    <Play className="mr-2 h-4 w-4" />
                                    {startMeeting.isPending ? "Starting..." : "Start Meeting"}
                                </Button>
                            )}
                            {status === "active" && (
                                <Button onClick={handleEnd} disabled={endMeeting.isPending} variant="destructive">
                                    <PhoneOff className="mr-2 h-4 w-4" />
                                    {endMeeting.isPending ? "Ending..." : "End Meeting"}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.createdAt && (
                            <div className="flex items-center gap-x-2 text-sm text-gray-700">
                                <Calendar className="size-4 text-gray-500" />
                                <span className="text-gray-600">Created:</span>
                                <span className="text-gray-900">{format(new Date(data.createdAt), "MMM d, yyyy 'at' HH:mm")}</span>
                            </div>
                        )}
                        {data.startedAt && (
                            <div className="flex items-center gap-x-2 text-sm text-gray-700">
                                <Play className="size-4 text-gray-500" />
                                <span className="text-gray-600">Started:</span>
                                <span className="text-gray-900">{format(new Date(data.startedAt), "MMM d, yyyy 'at' HH:mm")}</span>
                            </div>
                        )}
                        {data.endedAt && (
                            <div className="flex items-center gap-x-2 text-sm text-gray-700">
                                <CheckCircle2 className="size-4 text-gray-500" />
                                <span className="text-gray-600">Ended:</span>
                                <span className="text-gray-900">{format(new Date(data.endedAt), "MMM d, yyyy 'at' HH:mm")}</span>
                            </div>
                        )}
                    </div>

                    {status === "completed" && (
                        <Tabs defaultValue="summary" className="w-full">
                            <TabsList>
                                <TabsTrigger value="summary">Summary</TabsTrigger>
                                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                                <TabsTrigger value="recording">Recording</TabsTrigger>
                                <TabsTrigger value="chat">Chat</TabsTrigger>
                            </TabsList>
                            <TabsContent value="summary" className="mt-4">
                                {data.summary ? (
                                    <div className="flex flex-col gap-y-2">
                                        <p className="text-lg font-medium text-gray-900">Summary</p>
                                        <p className="text-gray-700 whitespace-pre-wrap">{data.summary}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Summary is being processed...</p>
                                )}
                            </TabsContent>
                            <TabsContent value="transcript" className="mt-4">
                                <TranscriptViewer 
                                    transcript={data.summary || ""} 
                                    transcriptUrl={data.transcriptUrl || null}
                                />
                            </TabsContent>
                            <TabsContent value="recording" className="mt-4">
                                {data.recordUrl ? (
                                    <div className="flex flex-col gap-y-2">
                                        <video 
                                            src={data.recordUrl} 
                                            controls 
                                            className="w-full rounded-lg"
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Recording is being processed...</p>
                                )}
                            </TabsContent>
                            <TabsContent value="chat" className="mt-4">
                                <MeetingChat meetingId={meetingId} />
                            </TabsContent>
                        </Tabs>
                    )}

                    {status !== "completed" && (
                        <>
                            {data.summary && (
                                <div className="flex flex-col gap-y-2">
                                    <p className="text-lg font-medium text-gray-900">Summary</p>
                                    <p className="text-gray-700">{data.summary}</p>
                                </div>
                            )}

                            {data.transcriptUrl && (
                                <div className="flex items-center gap-x-2">
                                    <FileText className="size-4 text-gray-500" />
                                    <a 
                                        href={data.transcriptUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-purple-600 hover:text-purple-700 hover:underline"
                                    >
                                        View Transcript
                                    </a>
                                </div>
                            )}

                            {data.recordUrl && (
                                <div className="flex items-center gap-x-2">
                                    <VideoIcon className="size-4 text-gray-500" />
                                    <a 
                                        href={data.recordUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-purple-600 hover:text-purple-700 hover:underline"
                                    >
                                        View Recording
                                    </a>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export const MeetingIdViewLoading = () => {
    return (
        <LoadingState title="Loading Meeting" description="This may take a few seconds" />
    );
};

export const MeetingIdViewError = () => {
    return (
        <ErrorState title="Error Loading Meeting" description="Something went wrong" />
    );
};

