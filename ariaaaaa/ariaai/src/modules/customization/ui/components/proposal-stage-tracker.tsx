"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";

export type ProposalStage =
    | "pending"
    | "accepted"
    | "building"
    | "testing"
    | "deployed"
    | "integrated"
    | "rejected";

interface Stage {
    key: ProposalStage;
    label: string;
    emoji: string;
    description: string;
}

const STAGES: Stage[] = [
    { key: "pending",    label: "Submitted",  emoji: "📤", description: "Awaiting admin review" },
    { key: "accepted",   label: "Accepted",   emoji: "✅", description: "Proposal approved" },
    { key: "building",   label: "Building",   emoji: "🔨", description: "Agent under construction" },
    { key: "testing",    label: "Testing",    emoji: "🧪", description: "QA & voice testing" },
    { key: "deployed",   label: "Deployed",   emoji: "🚀", description: "Live in environment" },
    { key: "integrated", label: "Integrated", emoji: "🔗", description: "Fully integrated & ready" },
];

const STAGE_ORDER: ProposalStage[] = [
    "pending",
    "accepted",
    "building",
    "testing",
    "deployed",
    "integrated",
];

function getStageIndex(status: ProposalStage): number {
    return STAGE_ORDER.indexOf(status);
}

interface ProposalStageTrackerProps {
    status: ProposalStage;
    compact?: boolean;
}

export const ProposalStageTracker = ({ status, compact = false }: ProposalStageTrackerProps) => {
    const isRejected = status === "rejected";
    const currentIndex = isRejected ? -1 : getStageIndex(status);

    if (isRejected) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">Proposal Rejected</p>
                    <p className="text-xs text-red-500/80">Please contact support or submit a new request.</p>
                </div>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {STAGES.map((stage, idx) => {
                    const isDone    = idx < currentIndex;
                    const isActive  = idx === currentIndex;
                    const isPending = idx > currentIndex;
                    return (
                        <div key={stage.key} className="flex items-center gap-1.5 flex-shrink-0">
                            <div
                                className={cn(
                                    "h-6 w-6 rounded-full flex items-center justify-center text-[10px] border-2 transition-all",
                                    isDone   && "bg-emerald-500 border-emerald-500 text-white",
                                    isActive && "bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-300 dark:ring-indigo-800",
                                    isPending && "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400"
                                )}
                            >
                                {isDone ? "✓" : isActive ? "●" : idx + 1}
                            </div>
                            {idx < STAGES.length - 1 && (
                                <div
                                    className={cn(
                                        "h-0.5 w-5 rounded-full transition-all",
                                        isDone ? "bg-emerald-400" : "bg-zinc-200 dark:bg-zinc-800"
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Steps row */}
            <div className="flex items-start gap-0">
                {STAGES.map((stage, idx) => {
                    const isDone    = idx < currentIndex;
                    const isActive  = idx === currentIndex;
                    const isPending = idx > currentIndex;
                    const isLast    = idx === STAGES.length - 1;

                    return (
                        <div key={stage.key} className="flex items-start flex-1 min-w-0">
                            <div className="flex flex-col items-center flex-shrink-0">
                                {/* Circle */}
                                <div
                                    className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2 shadow-sm transition-all duration-500 z-10",
                                        isDone   && "bg-emerald-500 border-emerald-500 text-white shadow-emerald-200 dark:shadow-emerald-900",
                                        isActive && "bg-white dark:bg-zinc-900 border-indigo-500 text-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-900/50 scale-110",
                                        isPending && "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-400"
                                    )}
                                >
                                    {isDone ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : isActive ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                    ) : (
                                        <span>{stage.emoji}</span>
                                    )}
                                </div>

                                {/* Label below circle */}
                                <div className="mt-2 text-center px-1">
                                    <p
                                        className={cn(
                                            "text-[11px] font-bold leading-tight",
                                            isDone   && "text-emerald-600 dark:text-emerald-400",
                                            isActive && "text-indigo-600 dark:text-indigo-400",
                                            isPending && "text-zinc-400"
                                        )}
                                    >
                                        {stage.label}
                                    </p>
                                    <p className="text-[9px] text-zinc-400 leading-tight mt-0.5 hidden sm:block">
                                        {stage.description}
                                    </p>
                                </div>
                            </div>

                            {/* Connector line */}
                            {!isLast && (
                                <div className="flex-1 mt-5 mx-1">
                                    <div className="h-0.5 w-full relative overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-700",
                                                isDone ? "w-full bg-emerald-400" : "w-0"
                                            )}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Status Text */}
            <div className="mt-6 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground font-medium">Current stage:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                    {status}
                </span>
            </div>
        </div>
    );
};
