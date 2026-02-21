"use client";

import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, 
  Video, 
  Users, 
  Calendar, 
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Settings,
  Clock,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
        <div className="min-h-full flex flex-col gap-y-10 p-6 lg:p-12 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
            
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl premium-gradient p-8 md:p-12 shadow-2xl shadow-indigo-500/20">
                <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-10 -translate-y-10 rotate-12 scale-150">
                    <Sparkles className="w-64 h-64 text-white" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                           Intelligence Platform
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                            Welcome back, <span className="underline decoration-indigo-400 decoration-wavy decoration-2 underline-offset-8">{userName}</span> 
                        </h1>
                        <p className="text-indigo-100/80 text-lg md:text-xl font-medium">
                            Aria AI has analyzed your recent calls and synthesized key insights. Ready to start your next meeting?
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link href="/meetings">
                                <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-2xl px-8 shadow-xl">
                                    <Video className="mr-2 w-5 h-5" />
                                    New Meeting
                                </Button>
                            </Link>
                            <Link href="/agents">
                                <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 rounded-2xl px-8 border border-white/20">
                                    Configure AI Agents
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-6">
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10 min-w-[200px]">
                            <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest">Efficiency</p>
                            <p className="text-4xl font-black mt-2 text-white">92%</p>
                            <p className="text-indigo-200/60 text-xs mt-1">+12% vs last month</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10 min-w-[200px]">
                            <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest">Time Saved</p>
                            <p className="text-4xl font-black mt-2 text-white">14h</p>
                            <p className="text-indigo-200/60 text-xs mt-1">This month alone</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Left Column (Main List) */}
                <div className="xl:col-span-8 flex flex-col gap-8">
                    
                    {/* Insights/Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Total Meetings", value: meetingsData?.total ?? 0, icon: Video, color: "text-indigo-600", bg: "bg-indigo-600/10" },
                            { label: "Active Agents", value: agentsData?.total ?? 0, icon: BrainCircuit, color: "text-violet-600", bg: "bg-violet-600/10" },
                            { label: "Hours Transcribed", value: "48.5", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-600/10" },
                            { label: "Team Members", value: "8", icon: Users, color: "text-blue-600", bg: "bg-blue-600/10" },
                        ].map((stat, i) => (
                            <Card key={i} className="glass shadow-none border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-all">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                        <p className="text-xl font-bold tracking-tight">{stat.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Recent Meetings Table/List */}
                    <Card className="glass-card border-none rounded-3xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 px-8 py-6">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-bold tracking-tight">Recent Sessions</CardTitle>
                                <CardDescription>Manage and review your AI-enhanced interactions.</CardDescription>
                            </div>
                            <Link href="/meetings">
                                <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold group rounded-xl">
                                    View Repository
                                    <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoadingMeetings ? (
                                <div className="p-8 space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                                    ))}
                                </div>
                            ) : meetingsData?.items?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                        <Video className="w-10 h-10 text-zinc-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">No meetings yet</h3>
                                    <p className="text-zinc-500 max-w-sm mt-2">Your AI repository is empty. Schedule your first meeting to start generating insights.</p>
                                    <Button className="mt-8 rounded-2xl premium-gradient border-none px-8 py-6 h-auto text-lg shadow-xl shadow-indigo-500/20">
                                        Create First Meeting
                                    </Button>
                                </div>
                            ) : (
                                <div className="">
                                    {meetingsData?.items?.map((meeting, i) => (
                                        <Link 
                                            key={meeting.id} 
                                            href={`/meetings/${meeting.id}`}
                                            className={cn(
                                                "flex items-center justify-between px-8 py-5 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all group border-b last:border-0 border-zinc-100 dark:border-zinc-900",
                                                i === 0 && "bg-indigo-50/30 dark:bg-indigo-950/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-x-5">
                                                <div className="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                                                    <div className="h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold text-xl">
                                                        {meeting.name[0].toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-lg leading-none group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{meeting.name}</p>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {meeting.scheduledAt 
                                                                ? new Date(meeting.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                                : new Date(meeting.createdAt).toLocaleDateString()
                                                            }
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-zinc-300" />
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3.5 h-3.5" />
                                                            AI Participant Active
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-x-6">
                                                <Badge 
                                                    variant="secondary" 
                                                    className={cn(
                                                        "uppercase text-[10px] font-bold tracking-widest px-3 py-1 rounded-full border-none",
                                                        meeting.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                                    )}
                                                >
                                                    {meeting.status}
                                                </Badge>
                                                <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all duration-300 shadow-sm">
                                                    <ArrowUpRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column (Sidebar Content) */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    
                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 gap-4">
                         <Link href="/agents" className="group h-full">
                            <Card className="h-full glass-card border-none rounded-3xl p-6 flex flex-col items-center text-center gap-4 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all">
                                <div className="p-4 bg-violet-600/10 rounded-2xl text-violet-600 group-hover:scale-110 transition-transform">
                                    <BrainCircuit className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold">Agents</h3>
                                    <p className="text-xs text-muted-foreground font-medium">Manage AI</p>
                                </div>
                            </Card>
                        </Link>
                        <Link href="/settings" className="group h-full">
                            <Card className="h-full glass-card border-none rounded-3xl p-6 flex flex-col items-center text-center gap-4 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                                <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                                    <Settings className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold">Setup</h3>
                                    <p className="text-xs text-muted-foreground font-medium">Preferences</p>
                                </div>
                            </Card>
                        </Link>
                    </div>

                    {/* Agent Showcase */}
                    <Card className="glass-card border-none rounded-3xl bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                Featured Agents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoadingAgents ? (
                                <Skeleton className="h-40 w-full rounded-2xl" />
                            ) : agentsData?.items?.slice(0, 3).map((agent) => (
                                <div key={agent.id} className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 hover:bg-black/30 transition-colors border border-white/5 cursor-pointer">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-lg">
                                        <BotIcon className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-white text-sm uppercase tracking-tight">{agent.name}</p>
                                        <p className="text-xs text-zinc-400 font-medium line-clamp-1">Expert Meeting Assistant</p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400 rounded-full h-6">Active</Badge>
                                </div>
                            ))}
                            <Link href="/agents" className="block w-full pt-2">
                                <Button variant="outline" className="w-full rounded-xl border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-11 font-bold">
                                    Explore Studio
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Notification/Banner */}
                    <div className="premium-gradient rounded-3xl p-8 relative overflow-hidden group cursor-pointer shadow-xl shadow-indigo-500/20">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                            <TrendingUp className="w-32 h-32" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
                        <p className="text-indigo-100/80 text-sm mb-6 font-medium">Access unlimited meeting recording and advanced AI analytical models.</p>
                        <Button className="bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl font-bold px-6">
                            Go Pro
                        </Button>
                    </div>
                </div>
            </div>
        </div>
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
