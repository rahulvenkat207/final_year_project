"use client";

import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { 
  PlusCircle, 
  Video, 
  Users, 
  Calendar, 
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Settings
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const HomeView = () => {
    const { data: session } = authClient.useSession();
    const trpc = useTRPC();

    const { data: meetingsData, isLoading: isLoadingMeetings } = useQuery(
        trpc.meetings.getMany.queryOptions({
            page: 1,
            pageSize: 5,
        })
    );

    const { data: agentsData, isLoading: isLoadingAgents } = useQuery(
        trpc.agents.getMany.queryOptions({
            page: 1,
            pageSize: 5,
        })
    );

    const userName = session?.user?.name || "there";

    return (
        <div className="flex flex-col gap-y-8 p-6 lg:p-10 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col gap-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Welcome back, <span className="text-primary italic">{userName}</span> 👋
                </h1>
                <p className="text-muted-foreground text-lg">
                    Here's what's happening with your meetings and AI agents today.
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/meetings" className="group">
                    <Card className="h-full border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 group-hover:scale-110 transition-transform duration-500">
                            <Video className="w-24 h-24 text-primary" />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-x-2">
                                <Video className="w-5 h-5 text-primary" />
                                Start a Meeting
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Schedule or jump into a new AI-powered video call instantly.
                            </p>
                            <Button variant="outline" className="group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                New Meeting <PlusCircle className="ml-2 w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/agents" className="group">
                    <Card className="h-full border-2 border-transparent hover:border-violet-500/20 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-violet-500/10 via-transparent to-transparent overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 group-hover:scale-110 transition-transform duration-500">
                            <BrainCircuit className="w-24 h-24 text-violet-500" />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-x-2">
                                <BrainCircuit className="w-5 h-5 text-violet-500" />
                                Configure Agents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Create and customize specialized AI participants for your calls.
                            </p>
                            <Button variant="outline" className="group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                                manage Agents <PlusCircle className="ml-2 w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/settings" className="group">
                    <Card className="h-full border-2 border-transparent hover:border-gray-500/20 transition-all duration-300 hover:shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 group-hover:scale-110 transition-transform duration-500">
                            <Settings className="w-24 h-24 text-gray-500" />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-x-2">
                                <Settings className="w-5 h-5 text-gray-500" />
                                System Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Personalize your profile, notifications, and integration settings.
                            </p>
                            <Button variant="outline">
                                View Settings <ChevronRight className="ml-1 w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Statistics Card */}
                <Card className="lg:col-span-1 bg-white/40 dark:bg-black/40 backdrop-blur-md shadow-sm border-white/20">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-x-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground font-medium">Total Meetings</p>
                                <p className="text-3xl font-bold">{meetingsData?.total ?? 0}</p>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Calendar className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground font-medium">Active Agents</p>
                                <p className="text-3xl font-bold">{agentsData?.total ?? 0}</p>
                            </div>
                            <div className="p-3 bg-violet-500/10 rounded-xl">
                                <Users className="w-6 h-6 text-violet-500" />
                            </div>
                        </div>
                        <div className="pt-4 border-t">
                            <Link href="/upgrade">
                                <Button className="w-full bg-gradient-to-r from-primary to-violet-600 hover:opacity-90 transition-opacity">
                                    Upgrade to Pro
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Meetings */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg flex items-center gap-x-2">
                            <Video className="w-4 h-4 text-primary" />
                            Recent Meetings
                        </CardTitle>
                        <Link href="/meetings" className="text-sm text-primary hover:underline font-medium">
                            View All
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {isLoadingMeetings ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : meetingsData?.items?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                                <div className="p-4 bg-muted rounded-full">
                                    <Video className="w-8 h-8 text-muted-foreground opacity-50" />
                                </div>
                                <p className="text-muted-foreground">No meetings found. Start your first call!</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {meetingsData?.items?.map((meeting) => (
                                    <Link 
                                        key={meeting.id} 
                                        href={`/meetings/${meeting.id}`}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-x-3">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {meeting.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{meeting.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {meeting.scheduledAt 
                                                        ? `Scheduled: ${new Date(meeting.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                                                        : `Created: ${new Date(meeting.createdAt).toLocaleDateString()}`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-x-4">
                                            <Badge variant={meeting.status === "active" ? "default" : "secondary"} className="capitalize">
                                                {meeting.status}
                                            </Badge>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
