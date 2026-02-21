"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { 
    Plus, 
    FileText, 
    Calendar,
    Clock,
    RefreshCw,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProposalStageTracker, ProposalStage } from "./proposal-stage-tracker";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MyProposalsTabProps {
    onRequestNew: () => void;
}

const STATUS_COLORS: Record<ProposalStage, string> = {
    pending:    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
    accepted:   "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
    building:   "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50",
    testing:    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
    deployed:   "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
    integrated: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/50",
    rejected:   "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50",
};

const STATUS_LABELS: Record<ProposalStage, string> = {
    pending:    "⏳ Pending Review",
    accepted:   "✅ Accepted",
    building:   "🔨 Building",
    testing:    "🧪 Testing",
    deployed:   "🚀 Deployed",
    integrated: "🔗 Integrated",
    rejected:   "❌ Rejected",
};

export const MyProposalsTab = ({ onRequestNew }: MyProposalsTabProps) => {
    const trpc = useTRPC();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const { data: proposals, isLoading, refetch, isFetching } = useQuery({
        ...trpc.customization.getMyProposals.queryOptions(),
        refetchInterval: 30_000, // auto-refresh every 30s to catch admin updates
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                ))}
            </div>
        );
    }

    if (!proposals || proposals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-20 w-20 rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-5">
                    <FileText className="w-9 h-9 text-zinc-400" />
                </div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-2">
                    No Proposals Yet
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                    You haven't submitted any custom agent requests. Start by describing your ideal AI voice agent.
                </p>
                <Button
                    onClick={onRequestNew}
                    className="premium-gradient border-none rounded-2xl px-6 h-11 font-bold shadow-xl shadow-indigo-500/20"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Request Custom Agent
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                        My Proposals
                        <span className="ml-2 text-sm font-bold text-muted-foreground">
                            ({proposals.length})
                        </span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Status refreshes automatically every 30 seconds
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        className="rounded-xl"
                        disabled={isFetching}
                    >
                        <RefreshCw className={cn("mr-2 h-3 w-3", isFetching && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        onClick={onRequestNew}
                        className="premium-gradient border-none rounded-xl font-bold shadow-lg shadow-indigo-500/15"
                    >
                        <Plus className="mr-2 h-3 w-3" />
                        New Request
                    </Button>
                </div>
            </div>

            {/* Proposal Cards */}
            <div className="space-y-4">
                {proposals.map((proposal) => {
                    const isExpanded = expandedId === proposal.id;
                    const status = proposal.status as ProposalStage;

                    return (
                        <div
                            key={proposal.id}
                            className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            {/* Card Header (always visible) */}
                            <div
                                className="flex items-center gap-4 p-5 cursor-pointer"
                                onClick={() => setExpandedId(isExpanded ? null : proposal.id)}
                            >
                                {/* Status dot */}
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0",
                                    status === "integrated" && "bg-violet-100 dark:bg-violet-950/50",
                                    status === "deployed"   && "bg-blue-100 dark:bg-blue-950/50",
                                    status === "testing"    && "bg-amber-100 dark:bg-amber-950/50",
                                    status === "building"   && "bg-indigo-100 dark:bg-indigo-950/50",
                                    status === "accepted"   && "bg-emerald-100 dark:bg-emerald-950/50",
                                    status === "pending"    && "bg-zinc-100 dark:bg-zinc-900",
                                    status === "rejected"   && "bg-red-100 dark:bg-red-950/50",
                                )}>
                                    {status === "pending" ? "📤" :
                                     status === "accepted" ? "✅" :
                                     status === "building" ? "🔨" :
                                     status === "testing" ? "🧪" :
                                     status === "deployed" ? "🚀" :
                                     status === "integrated" ? "🔗" : "❌"}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                            {proposal.agentName}
                                        </h3>
                                        <Badge
                                            variant="outline"
                                            className={cn("text-[10px] font-bold h-5 px-2 border", STATUS_COLORS[status])}
                                        >
                                            {STATUS_LABELS[status]}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        <span className="text-xs text-muted-foreground">
                                            {proposal.useCase}
                                        </span>
                                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(proposal.createdAt), "MMM d, yyyy")}
                                        </span>
                                        {proposal.statusUpdatedAt && status !== "pending" && (
                                            <>
                                                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Updated {format(new Date(proposal.statusUpdatedAt), "MMM d")}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Compact tracker - always visible */}
                                <div className="hidden sm:block">
                                    <ProposalStageTracker status={status} compact />
                                </div>

                                {/* Expand chevron */}
                                <button className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex-shrink-0">
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-zinc-400" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                                    )}
                                </button>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="border-t border-zinc-100 dark:border-zinc-900 p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Full stage tracker */}
                                    <div className="overflow-x-auto">
                                        <ProposalStageTracker status={status} />
                                    </div>

                                    {/* Proposal Details Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        {[
                                            { label: "Use Case", value: proposal.useCase },
                                            { label: "Voice Style", value: proposal.voiceStyle },
                                            { label: "Language", value: proposal.language },
                                            { label: "Contact Email", value: proposal.contactEmail },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                                    {label}
                                                </p>
                                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                                                    {value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                                            Behavior Description
                                        </p>
                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                            {proposal.behaviorDescription}
                                        </p>
                                    </div>

                                    {proposal.additionalNotes && (
                                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                                                Additional Notes
                                            </p>
                                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                                {proposal.additionalNotes}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            Proposal ID:
                                        </span>
                                        <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded">
                                            #{proposal.id}
                                        </code>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
