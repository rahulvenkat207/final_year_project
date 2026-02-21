"use client";

import { useState } from "react";
import { Wand2, Bot, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { DefaultAgentsTab } from "../components/default-agents-tab";
import { RFPForm } from "../components/rfp-form";
import { MyProposalsTab } from "../components/my-proposals-tab";

type Tab = "default-agents" | "my-requests" | "request";

const TABS = [
    { id: "default-agents" as Tab, label: "Default Agents", icon: Bot },
    { id: "my-requests" as Tab, label: "My Requests", icon: FileText },
    { id: "request" as Tab, label: "Request Custom Agent", icon: Wand2 },
];

export const CustomizationView = () => {
    const [activeTab, setActiveTab] = useState<Tab>("default-agents");

    return (
        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="px-6 lg:px-12 pt-10 pb-6 max-w-[1400px] mx-auto w-full">
                <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase mb-3">
                    <Wand2 className="w-4 h-4" />
                    Customization Studio
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none mb-2">
                    Voice Agent Builder
                </h1>
                <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                    Explore our built-in agents or request a fully customized voice AI tailored to your exact workflow.
                </p>
            </div>

            {/* Tab Bar */}
            <div className="px-6 lg:px-12 max-w-[1400px] mx-auto w-full">
                <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-fit">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                                    isActive
                                        ? "bg-white dark:bg-zinc-800 text-primary shadow-sm border border-zinc-200/50 dark:border-zinc-700/50"
                                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-zinc-400")} />
                                {tab.label}
                                {tab.id === "request" && (
                                    <span className="ml-1 text-[9px] font-black uppercase tracking-widest bg-primary text-white px-1.5 py-0.5 rounded-full leading-none">
                                        New
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 px-6 lg:px-12 py-8 max-w-[1400px] mx-auto w-full">
                {activeTab === "default-agents" && <DefaultAgentsTab />}
                {activeTab === "my-requests" && (
                    <MyProposalsTab onRequestNew={() => setActiveTab("request")} />
                )}
                {activeTab === "request" && (
                    <RFPForm onSuccess={() => setActiveTab("my-requests")} />
                )}
            </div>
        </div>
    );
};
