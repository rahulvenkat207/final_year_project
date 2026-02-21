"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";  
import { EmptyState } from "@/components/empty-sate";
import { useAgentsFilters } from "../../hooks/use-agent-filters";
import { DataPagination } from "../components/data-pagination";
import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/error-state";
import { 
  Bot, 
  Plus, 
  ChevronRight, 
  Settings2, 
  Cpu, 
  MessageSquare, 
  Sparkles,
  Search,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const AgentsView = () => {
    const router = useRouter();
    const trpc = useTRPC();
    const [filters, setFilters] = useAgentsFilters();
    const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions({
        ...filters,
    }));

    return (
        <div className="flex-1 flex flex-col gap-y-10 p-6 lg:p-12 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Header with Search and Action */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                        <Cpu className="w-4 h-4" />
                        AI Laboratory
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                        Agent Studio
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">
                        Design and deploy high-performance AI participants for your intelligence workflows.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input 
                            placeholder="Search Agents..." 
                            className="pl-10 h-12 bg-white/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-primary/20"
                        />
                    </div>
                    <Button size="lg" className="premium-gradient border-none h-12 rounded-2xl px-6 shadow-xl shadow-indigo-500/20 font-bold group">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Agent
                    </Button>
                </div>
            </div>

            {/* Main Content: Card Grid */}
            {data.items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <EmptyState 
                        title="Your Studio is Empty" 
                        description="Start by creating an AI Agent to join your meetings. Every agent can be specialized with custom instructions and personalities." 
                    />
                </div>
            ) : (
                <div className="flex flex-col gap-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {data.items.map((agent) => (
                            <Card 
                                key={agent.id} 
                                className="group relative glass-card border-none rounded-[32px] overflow-hidden hover:translate-y-[-8px] transition-all duration-500 cursor-pointer"
                                onClick={() => router.push(`/agents/${agent.id}`)}
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                                        <ArrowRight className="w-5 h-5 text-white" />
                                    </div>
                                </div>

                                <CardHeader className="p-8 pb-0">
                                    <div className="flex items-center gap-5">
                                        <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
                                            <Bot className="w-9 h-9 text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-indigo-200 text-indigo-600 dark:border-indigo-900 dark:text-indigo-400 px-2 leading-none h-5">
                                               Professional
                                            </Badge>
                                            <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors uppercase tracking-tighter">
                                                {agent.name}
                                            </CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-8 pt-6">
                                    <p className="text-sm text-muted-foreground font-medium line-clamp-3 leading-relaxed mb-6">
                                        A specialized intelligence unit configured to handle complex meeting orchestration and real-time synthesis.
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Response</p>
                                            <p className="font-bold text-sm">Ultra-Fast</p>
                                        </div>
                                        <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Accuracy</p>
                                            <p className="font-bold text-sm">High-Precision</p>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="p-8 pt-0 border-t border-zinc-100/50 dark:border-zinc-900/50 mt-2">
                                    <div className="w-full flex items-center justify-between pt-6">
                                        <div className="flex items-center -space-x-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="h-8 w-8 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                                                    <div className="h-full w-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">M{i}</div>
                                                </div>
                                            ))}
                                            <div className="h-8 w-8 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-50 flex items-center justify-center text-[10px] font-bold text-muted-foreground">+12</div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Active System
                                        </div>
                                    </div>
                                </CardFooter>
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </Card>
                        ))}
                    </div>

                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
                        <DataPagination 
                            page={filters.page}
                            totalPages={data.totalPages}
                            onPageChange={(page) => setFilters({ page })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};  

export const AgentsViewLoading = () => {
    return (
        <div className="p-6 lg:p-12 space-y-10">
            <div className="h-20 w-1/3 skeleton" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-[400px] w-full rounded-[30px] bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                ))}
            </div>
        </div>
    );
}

export const AgentsViewError = () => {
    return (
       <ErrorState title="Error Loading Agents" description="Something went wrong while accessing the agent studio database." />
    )
}