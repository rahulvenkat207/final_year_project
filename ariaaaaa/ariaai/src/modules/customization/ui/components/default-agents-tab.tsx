"use client";

import { Bot, Headphones, BarChart3, Shield, Zap, Globe, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface DefaultAgent {
    id: string;
    name: string;
    role: string;
    description: string;
    voiceStyle: string;
    specialty: string[];
    gradient: string;
    icon: React.ElementType;
    accentColor: string;
    badge: string;
}

const DEFAULT_AGENTS: DefaultAgent[] = [
    {
        id: "aria",
        name: "Aria",
        role: "General Meeting Intelligence",
        description:
            "Your all-purpose AI meeting companion. Aria listens, synthesizes, and provides real-time intelligence during any meeting — from standups to board reviews. Calm, professional, and always precise.",
        voiceStyle: "Professional & Calm",
        specialty: ["Meeting Summaries", "Action Items", "Q&A", "Real-time Notes"],
        gradient: "from-indigo-500 to-violet-600",
        icon: Bot,
        accentColor: "indigo",
        badge: "Core Agent",
    },
    {
        id: "nova",
        name: "Nova",
        role: "Sales & CRM Assistant",
        description:
            "Engineered for sales teams. Nova tracks prospects, suggests follow-ups, fills CRM fields in real time, and coaches your team with live battle cards. High-energy, persuasive, and results-driven.",
        voiceStyle: "Friendly & Persuasive",
        specialty: ["Lead Tracking", "CRM Updates", "Objection Handling", "Pipeline Reviews"],
        gradient: "from-rose-500 to-orange-500",
        icon: BarChart3,
        accentColor: "rose",
        badge: "Sales Agent",
    },
    {
        id: "atlas",
        name: "Atlas",
        role: "Technical Support Expert",
        description:
            "Built for engineering and support teams. Atlas parses technical jargon, logs bugs, references documentation on the fly, and escalates issues with surgical precision. Methodical and detail-oriented.",
        voiceStyle: "Precise & Analytical",
        specialty: ["Bug Triage", "Docs Reference", "Code Review", "Escalation Routing"],
        gradient: "from-cyan-500 to-blue-600",
        icon: Shield,
        accentColor: "cyan",
        badge: "Tech Agent",
    },
];

const FEATURE_PILLS = [
    { icon: Zap, label: "Real-time Processing" },
    { icon: Globe, label: "Multi-language" },
    { icon: Headphones, label: "Voice Optimized" },
    { icon: Star, label: "Always Available" },
];

export const DefaultAgentsTab = () => {
    return (
        <div className="space-y-10">
            {/* Section intro */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                        Built-in Voice Agents
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1 font-medium">
                        3 production-ready AI agents included in every Aria workspace, available immediately.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {FEATURE_PILLS.map(({ icon: Icon, label }) => (
                        <div
                            key={label}
                            className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400"
                        >
                            <Icon className="w-3 h-3" />
                            {label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Agent Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {DEFAULT_AGENTS.map((agent) => {
                    const Icon = agent.icon;
                    return (
                        <Card
                            key={agent.id}
                            className="group relative overflow-hidden border border-zinc-200/60 dark:border-zinc-800/60 rounded-[28px] bg-white dark:bg-zinc-950 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500"
                        >
                            {/* Top gradient band */}
                            <div className={`h-2 w-full bg-gradient-to-r ${agent.gradient}`} />

                            <CardHeader className="p-8 pb-4">
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:rotate-6 transition-transform duration-500`}
                                    >
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <Badge
                                            variant="outline"
                                            className="text-[9px] font-black uppercase tracking-widest border-zinc-200 dark:border-zinc-800 text-zinc-500 px-2 h-4 leading-none"
                                        >
                                            {agent.badge}
                                        </Badge>
                                        <h3 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
                                            {agent.name}
                                        </h3>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                            {agent.role}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="px-8 pb-8 space-y-6">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {agent.description}
                                </p>

                                {/* Voice Style */}
                                <div className="flex items-center gap-2">
                                    <Headphones className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Voice:
                                    </span>
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                        {agent.voiceStyle}
                                    </span>
                                </div>

                                {/* Specialties */}
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
                                        Specialties
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {agent.specialty.map((s) => (
                                            <span
                                                key={s}
                                                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800`}
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-glow shadow-emerald-500" />
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        Always Active
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-auto">
                                        Available in all meetings
                                    </span>
                                </div>
                            </CardContent>

                            {/* hover glow overlay */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                            />
                        </Card>
                    );
                })}
            </div>

            {/* Info Banner */}
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 flex items-start gap-4">
                <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <p className="text-sm font-bold text-indigo-800 dark:text-indigo-300">
                        Need something more specific?
                    </p>
                    <p className="text-sm text-indigo-700/70 dark:text-indigo-400/70 mt-0.5">
                        Our built-in agents cover most workflows. For specialized industries or unique behaviors, use the{" "}
                        <strong>Request Custom Agent</strong> tab to submit your requirements.
                    </p>
                </div>
            </div>
        </div>
    );
};
