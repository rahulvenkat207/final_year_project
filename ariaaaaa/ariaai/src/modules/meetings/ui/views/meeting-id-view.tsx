"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  Clock, 
  CheckCircle2, 
  XOutline, 
  Loader2, 
  Calendar, 
  FileText, 
  Play, 
  PhoneOff,
  ChevronLeft,
  Share2,
  Download,
  MoreVertical,
  Activity,
  User,
  ExternalLink,
  MessageCircle,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TranscriptViewer } from "../components/transcript-viewer";
import { MeetingChat } from "../components/meeting-chat";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    meetingId: string;
}

const statusConfig = {
    upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
    active: { label: "In Progress", color: "bg-emerald-100 text-emerald-700 animate-pulse dark:bg-emerald-900/30 dark:text-emerald-400", icon: Activity },
    processing: { label: "Analyzing", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Loader2 },
    completed: { label: "Completed", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

const XCircle = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
    </svg>
);

export const MeetingIdView = ({ meetingId }: Props) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));
    
    const status = data.status;
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
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
        <div className="flex-1 flex flex-col gap-y-10 p-6 lg:p-12 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Breadcrumbs & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full border-zinc-200 dark:border-zinc-800"
                        onClick={() => router.push("/meetings")}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                             <Badge className={cn("rounded-full border-none px-3 font-bold text-[10px] uppercase tracking-widest", config.color)}>
                                <StatusIcon className={cn("size-3 mr-1.5", status === "processing" && "animate-spin")} />
                                {config.label}
                            </Badge>
                            <span className="text-muted-foreground text-sm font-medium">Session ID: {meetingId.slice(0, 8)}...</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">{data.name}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-2xl border-zinc-200 dark:border-zinc-800 h-11 font-bold">
                        <Share2 className="mr-2 w-4 h-4" />
                        Share Session
                    </Button>
                    {status === "upcoming" && (
                        <Button 
                            onClick={handleStart} 
                            disabled={startMeeting.isPending}
                            className="premium-gradient border-none h-11 rounded-2xl px-8 shadow-xl shadow-indigo-500/20 font-bold"
                        >
                            {startMeeting.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4 fill-current" />}
                            Start Intelligence Session
                        </Button>
                    )}
                    {status === "active" && (
                        <Button 
                            onClick={handleEnd} 
                            disabled={endMeeting.isPending} 
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-600 border-none h-11 rounded-2xl px-8 shadow-xl shadow-red-500/20 font-bold"
                        >
                            {endMeeting.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PhoneOff className="mr-2 h-4 w-4" />}
                            Terminate Call
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Date Created", val: format(new Date(data.createdAt), "MMM d, yyyy"), icon: Calendar },
                    { label: "Duration", val: status === "completed" ? "42m 12s" : "Scheduled", icon: Clock },
                    { label: "AI Model", val: "Aria Indigo v2", icon: Sparkles },
                    { label: "Participants", val: "6 Active", icon: User },
                ].map((stat, i) => (
                    <Card key={i} className="glass border-none rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-zinc-600">
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                                <p className="font-bold text-sm tracking-tight">{stat.val}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Tabs Area */}
            <Tabs defaultValue={status === "completed" ? "summary" : "details"} className="w-full">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <TabsList className="bg-transparent h-12 p-0 gap-x-8">
                        {status === "completed" && (
                            <>
                                <TabsTrigger value="summary" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-bold px-0 uppercase tracking-widest text-xs">Summary</TabsTrigger>
                                <TabsTrigger value="recording" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-bold px-0 uppercase tracking-widest text-xs">Recording</TabsTrigger>
                                <TabsTrigger value="transcript" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-bold px-0 uppercase tracking-widest text-xs">Full Transcript</TabsTrigger>
                                <TabsTrigger value="chat" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-bold px-0 uppercase tracking-widest text-xs">Session Chat</TabsTrigger>
                            </>
                        )}
                        <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-bold px-0 uppercase tracking-widest text-xs">Meeting Details</TabsTrigger>
                    </TabsList>
                    
                    {status === "completed" && (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                                <Download className="mr-2 w-4 h-4" />
                                Export JSON
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <TabsContent value="summary" className="focus:outline-none">
                        <Card className="glass-card border-none rounded-3xl overflow-hidden p-8">
                            {data.summary ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tight">AI Executive Summary</h3>
                                    </div>
                                    <div className="prose dark:prose-invert max-w-none">
                                        <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
                                            {data.summary}
                                        </p>
                                    </div>
                                    <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Key Decisions</p>
                                            <p className="text-sm font-bold">Model migration approved for Q3 rollout.</p>
                                        </div>
                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Action Items</p>
                                            <p className="text-sm font-bold">Update security manifests before Friday. @John</p>
                                        </div>
                                        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Critical Insight</p>
                                            <p className="text-sm font-bold">Market sentiment is shifting towards edge-first AI.</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center animate-pulse">
                                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                    </div>
                                    <h3 className="text-xl font-bold">Aria is synthesizing insights...</h3>
                                    <p className="text-zinc-500 mt-2">The transcript and summary will be ready in approximately 2 minutes.</p>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="recording" className="focus:outline-none">
                        <Card className="glass-card border-none rounded-3xl overflow-hidden bg-black p-0 shadow-2xl">
                             {data.recordUrl ? (
                                <div className="aspect-video relative group">
                                    <video 
                                        src={data.recordUrl} 
                                        controls 
                                        className="w-full h-full"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video bg-zinc-900 flex flex-col items-center justify-center text-center p-12">
                                     <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                        <Video className="w-8 h-8 text-zinc-500" />
                                    </div>
                                    <h3 className="text-white font-bold text-lg">Recording unavailable</h3>
                                    <p className="text-zinc-500 mt-1">This session was either not recorded or the background processing failed.</p>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="transcript" className="focus:outline-none">
                        <Card className="glass-card border-none rounded-3xl overflow-hidden h-[600px] flex flex-col">
                            <CardHeader className="border-b border-zinc-100 dark:border-zinc-900 px-8">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-black uppercase tracking-tight">Full Session Transcript</CardTitle>
                                    {data.transcriptUrl && (
                                        <Button size="sm" variant="outline" className="rounded-xl" onClick={() => window.open(data.transcriptUrl!, "_blank")}>
                                            <ExternalLink className="mr-2 w-4 h-4" />
                                            Raw Access
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-hidden">
                                <TranscriptViewer 
                                    transcript={data.summary || ""} 
                                    transcriptUrl={data.transcriptUrl || null}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="chat" className="focus:outline-none">
                        <Card className="glass-card border-none rounded-3xl overflow-hidden h-[600px] flex flex-col">
                             <CardHeader className="border-b border-zinc-100 dark:border-zinc-900 px-8">
                                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-indigo-600" />
                                    Internal Dialogue
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-hidden">
                                <MeetingChat meetingId={meetingId} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="details" className="focus:outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="glass-card border-none rounded-3xl p-8">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                                    <Settings2 className="w-5 h-5 text-indigo-600" />
                                    Meeting Configuration
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-900">
                                        <span className="text-muted-foreground font-medium">Session Name</span>
                                        <span className="font-bold">{data.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-900">
                                        <span className="text-muted-foreground font-medium">Owner</span>
                                        <span className="font-bold">You</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-900">
                                        <span className="text-muted-foreground font-medium">Auto-Ingest</span>
                                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-none px-3 font-bold">Enabled</Badge>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-muted-foreground font-medium">Primary Agent</span>
                                        <Badge variant="outline" className="rounded-xl px-4 py-1 font-bold border-zinc-200 dark:border-zinc-800">Agent Alpha</Badge>
                                    </div>
                                </div>
                            </Card>

                            <Card className="glass-card border-none rounded-3xl p-8 bg-zinc-900 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Activity className="w-48 h-48 rotate-12" />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tight mb-6 relative z-10">Real-time Telemetry</h3>
                                <div className="space-y-4 relative z-10">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Model Confidence</span>
                                            <span className="text-sm font-bold">98.4%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 w-[98%]" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Transcription Latency</span>
                                            <span className="text-sm font-bold">120ms</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-[85%]" />
                                        </div>
                                    </div>
                                    <Button className="w-full mt-4 bg-white text-zinc-900 hover:bg-zinc-200 rounded-2xl font-bold h-12">
                                        View Technical Logs
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export const MeetingIdViewLoading = () => {
    return (
        <div className="p-6 lg:p-12 space-y-10">
             <div className="flex items-center gap-6">
                <Skeleton className="size-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-32" />
                </div>
             </div>
             <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
             </div>
             <Skeleton className="h-[600px] w-full rounded-3xl" />
        </div>
    );
};

export const MeetingIdViewError = () => {
    return (
        <ErrorState title="Session Synchronization Error" description="The intelligence session data could not be retrieved from the primary shard." />
    );
};
"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Calendar, 
  FileText, 
  Play, 
  PhoneOff,
  ChevronLeft,
  Share2,
  Download,
  MoreVertical,
  Activity,
  User,
  ExternalLink,
  MessageCircle,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TranscriptViewer } from "../components/transcript-viewer";
import { MeetingChat } from "../components/meeting-chat";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    meetingId: string;
}

const statusConfig = {
    upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
    active: { label: "In Progress", color: "bg-emerald-100 text-emerald-700 animate-pulse dark:bg-emerald-900/30 dark:text-emerald-400", icon: Activity },
    processing: { label: "Analyzing", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Loader2 },
    completed: { label: "Completed", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: Clock },
};

export const MeetingIdView = ({ meetingId }: Props) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));
    
    const status = data.status;
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
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
        <div className="flex-1 flex flex-col gap-y-10 p-6 lg:p-12 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Breadcrumbs & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full border-zinc-200 dark:border-zinc-800"
                        onClick={() => router.push("/meetings")}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                             <Badge className={cn("rounded-full border-none px-3 font-bold text-[10px] uppercase tracking-widest", config.color)}>
                                <StatusIcon className={cn("size-3 mr-1.5", status === "processing" && "animate-spin")} />
                                {config.label}
                            </Badge>
                            <span className="text-muted-foreground text-sm font-medium">Session ID: {meetingId.slice(0, 8)}...</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">{data.name}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-2xl border-zinc-200 dark:border-zinc-800 h-11 font-bold">
                        <Share2 className="mr-2 w-4 h-4" />
                        Share Session
                    </Button>
                    {status === "upcoming" && (
                        <Button 
                            onClick={handleStart} 
                            disabled={startMeeting.isPending}
                            className="premium-gradient border-none h-11 rounded-2xl px-8 shadow-xl shadow-indigo-500/20 font-bold"
                        >
                            {startMeeting.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4 fill-current" />}
                            Start Intelligence Session
                        </Button>
                    )}
                    {status === "active" && (
                        <Button 
                            onClick={handleEnd} 
                            disabled={endMeeting.isPending} 
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-600 border-none h-11 rounded-2xl px-8 shadow-xl shadow-red-500/20 font-bold"
                        >
                            {endMeeting.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PhoneOff className="mr-2 h-4 w-4" />}
                            Terminate Call
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Date Created", val: format(new Date(data.createdAt), "MMM d, yyyy"), icon: Calendar },
                    { label: "Duration", val: status === "completed" ? "42m 12s" : "Scheduled", icon: Clock },
                    { label: "AI Model", val: "Aria Indigo v2", icon: Sparkles },
                    { label: "Participants", val: "6 Active", icon: User },
                ].map((stat, i) => (
                    <Card key={i} className="glass border-none rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-zinc-600">
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                                <p className="font-bold text-sm tracking-tight">{stat.val}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Tabs Area */}
            <Tabs defaultValue={status === "completed" ? "summary" : "details"} className="w-full">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <TabsList className="bg-transparent h-12 p-0 gap-x-8">
                        {status === "completed" && (
                            <>
                                <TabsTrigger value="summary" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-bold px-0 uppercase tracking-widest text-xs">Summary</TabsTrigger>
                                <TabsTrigger value="recording" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-bold px-0 uppercase tracking-widest text-xs">Recording</TabsTrigger>
                                <TabsTrigger value="transcript" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-bold px-0 uppercase tracking-widest text-xs">Full Transcript</TabsTrigger>
                                <TabsTrigger value="chat" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-bold px-0 uppercase tracking-widest text-xs">Session Chat</TabsTrigger>
                            </>
                        )}
                        <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-bold px-0 uppercase tracking-widest text-xs">Meeting Details</TabsTrigger>
                    </TabsList>
                    
                    {status === "completed" && (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                                <Download className="mr-2 w-4 h-4" />
                                Export JSON
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <TabsContent value="summary" className="focus:outline-none">
                        <Card className="glass-card border-none rounded-3xl overflow-hidden p-8">
                            {data.summary ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tight">AI Executive Summary</h3>
                                    </div>
                                    <div className="prose dark:prose-invert max-w-none">
                                        <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
                                            {data.summary}
                                        </p>
                                    </div>
                                    <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Key Decisions</p>
                                            <p className="text-sm font-bold">Model migration approved for Q3 rollout.</p>
                                        </div>
                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Action Items</p>
                                            <p className="text-sm font-bold">Update security manifests before Friday. @John</p>
                                        </div>
                                        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Critical Insight</p>
                                            <p className="text-sm font-bold">Market sentiment is shifting towards edge-first AI.</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center animate-pulse">
                                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                    </div>
                                    <h3 className="text-xl font-bold">Aria is synthesizing insights...</h3>
                                    <p className="text-zinc-500 mt-2">The transcript and summary will be ready in approximately 2 minutes.</p>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="recording" className="focus:outline-none">
                        <Card className="glass-card border-none rounded-3xl overflow-hidden bg-black p-0 shadow-2xl">
                             {data.recordUrl ? (
                                <div className="aspect-video relative group">
                                    <video 
                                        src={data.recordUrl} 
                                        controls 
                                        className="w-full h-full"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video bg-zinc-900 flex flex-col items-center justify-center text-center p-12">
                                     <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                        <Video className="w-8 h-8 text-zinc-500" />
                                    </div>
                                    <h3 className="text-white font-bold text-lg">Recording unavailable</h3>
                                    <p className="text-zinc-500 mt-1">This session was either not recorded or the background processing failed.</p>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="transcript" className="focus:outline-none">
                        <Card className="glass-card border-none rounded-3xl overflow-hidden h-[600px] flex flex-col">
                            <CardHeader className="border-b border-zinc-100 dark:border-zinc-900 px-8">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-black uppercase tracking-tight">Full Session Transcript</CardTitle>
                                    {data.transcriptUrl && (
                                        <Button size="sm" variant="outline" className="rounded-xl" onClick={() => window.open(data.transcriptUrl!, "_blank")}>
                                            <ExternalLink className="mr-2 w-4 h-4" />
                                            Raw Access
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-hidden">
                                <TranscriptViewer 
                                    transcript={data.summary || ""} 
                                    transcriptUrl={data.transcriptUrl || null}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="chat" className="focus:outline-none">
                        <Card className="glass-card border-none rounded-3xl overflow-hidden h-[600px] flex flex-col">
                             <CardHeader className="border-b border-zinc-100 dark:border-zinc-900 px-8">
                                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-indigo-600" />
                                    Internal Dialogue
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-hidden">
                                <MeetingChat meetingId={meetingId} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="details" className="focus:outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="glass-card border-none rounded-3xl p-8">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                                    <Settings2 className="w-5 h-5 text-indigo-600" />
                                    Meeting Configuration
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-900">
                                        <span className="text-muted-foreground font-medium">Session Name</span>
                                        <span className="font-bold">{data.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-900">
                                        <span className="text-muted-foreground font-medium">Owner</span>
                                        <span className="font-bold">You</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-900">
                                        <span className="text-muted-foreground font-medium">Auto-Ingest</span>
                                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-none px-3 font-bold">Enabled</Badge>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-muted-foreground font-medium">Primary Agent</span>
                                        <Badge variant="outline" className="rounded-xl px-4 py-1 font-bold border-zinc-200 dark:border-zinc-800">Agent Alpha</Badge>
                                    </div>
                                </div>
                            </Card>

                            <Card className="glass-card border-none rounded-3xl p-8 bg-zinc-900 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Activity className="w-48 h-48 rotate-12" />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tight mb-6 relative z-10">Real-time Telemetry</h3>
                                <div className="space-y-4 relative z-10">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest model confidence">Confidence Score</span>
                                            <span className="text-sm font-bold">98.4%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 w-[98%]" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Transcription Latency</span>
                                            <span className="text-sm font-bold">120ms</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-[85%]" />
                                        </div>
                                    </div>
                                    <Button className="w-full mt-4 bg-white text-zinc-900 hover:bg-zinc-200 rounded-2xl font-bold h-12">
                                        View Technical Logs
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export const MeetingIdViewLoading = () => {
    return (
        <div className="p-6 lg:p-12 space-y-10">
             <div className="flex items-center gap-6">
                <Skeleton className="size-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-32" />
                </div>
             </div>
             <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
             </div>
             <Skeleton className="h-[600px] w-full rounded-3xl" />
        </div>
    );
};

export const MeetingIdViewError = () => {
    return (
        <ErrorState title="Session Synchronization Error" description="The intelligence session data could not be retrieved from the primary shard." />
    );
};

const Settings2 = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M20 7h-9" />
        <path d="M14 17H5" />
        <circle cx="17" cy="17" r="3" />
        <circle cx="7" cy="7" r="3" />
    </svg>
);
