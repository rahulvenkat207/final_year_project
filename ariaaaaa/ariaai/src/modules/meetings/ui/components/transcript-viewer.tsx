"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TranscriptViewerProps {
    transcript: string;
    transcriptUrl?: string | null;
}

export const TranscriptViewer = ({ transcript, transcriptUrl }: TranscriptViewerProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    // Split transcript into lines for display
    const transcriptLines = useMemo(() => {
        if (!transcript) return [];
        return transcript.split("\n").filter(line => line.trim());
    }, [transcript]);

    // Highlight search terms in text
    const highlightText = (text: string, query: string) => {
        if (!query.trim()) return text;

        const parts = text.split(new RegExp(`(${query})`, "gi"));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <mark key={index} className="bg-primary/20 text-primary font-bold dark:bg-primary/40 dark:text-white rounded px-0.5">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    // Filter lines that match search query
    const filteredLines = useMemo(() => {
        if (!searchQuery.trim()) return transcriptLines;
        const query = searchQuery.toLowerCase();
        return transcriptLines.filter(line => line.toLowerCase().includes(query));
    }, [transcriptLines, searchQuery]);

    if (!transcript && !transcriptUrl) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-400 text-center">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="size-8 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Synthesizing Audio...</h3>
                <p className="max-w-xs mt-2 font-medium">Please wait while Aria processes the audio stream from our neural cloud.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-y-6 p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4" />
                    <Input
                        placeholder="Search dialogue repository..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 bg-zinc-100/50 dark:bg-zinc-900/50 border-none rounded-2xl focus-visible:ring-primary/20"
                    />
                </div>
                {transcriptUrl && (
                    <Button 
                        variant="outline" 
                        asChild 
                        className="rounded-2xl h-12 px-6 border-zinc-200 dark:border-zinc-800 font-bold"
                    >
                        <a
                            href={transcriptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Download className="mr-2 size-4" />
                            Download TXT
                        </a>
                    </Button>
                )}
            </div>

            <div className="flex items-center justify-between pb-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {searchQuery ? `Found ${filteredLines.length} Matches` : `${transcriptLines.length} Entries in Ledger`}
                </p>
                <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-900 mx-4" />
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Verified</span>
                </div>
            </div>

            <ScrollArea className="flex-1 w-full bg-zinc-50/50 dark:bg-zinc-950/20 rounded-3xl p-6">
                <div className="space-y-4 pr-4">
                    {filteredLines.length > 0 ? (
                        filteredLines.map((line, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 py-3 px-5 rounded-2xl border border-transparent transition-all group",
                                    "hover:bg-white dark:hover:bg-zinc-900 hover:shadow-sm hover:border-zinc-100 dark:hover:border-zinc-800"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-primary transition-colors shrink-0" />
                                    <p className="font-medium">{highlightText(line, searchQuery)}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <FileText className="size-12 text-zinc-200 dark:text-zinc-800 mb-4" />
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                                {searchQuery ? "No entries match search" : "The ledger is empty"}
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
