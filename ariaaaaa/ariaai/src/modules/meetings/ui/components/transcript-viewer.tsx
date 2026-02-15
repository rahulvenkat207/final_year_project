"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
                <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">
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
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <FileText className="size-12 mb-4" />
                <p>Transcript is being processed...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                    <Input
                        placeholder="Search transcript..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {transcriptUrl && (
                    <a
                        href={transcriptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-x-2 text-sm"
                    >
                        <FileText className="size-4" />
                        View Full
                    </a>
                )}
            </div>

            {searchQuery && (
                <p className="text-sm text-gray-600">
                    Found {filteredLines.length} {filteredLines.length === 1 ? "result" : "results"}
                </p>
            )}

            <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                <div className="space-y-2">
                    {filteredLines.length > 0 ? (
                        filteredLines.map((line, index) => (
                            <div
                                key={index}
                                className="text-sm text-gray-700 dark:text-gray-300 py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                {highlightText(line, searchQuery)}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-8">
                            {searchQuery ? "No results found" : "No transcript available"}
                        </p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};




