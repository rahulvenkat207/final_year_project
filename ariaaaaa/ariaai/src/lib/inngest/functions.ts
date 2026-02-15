import { inngest } from "../inngest";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createLLMClient } from "@/lib/ai/llm";

// Process meeting transcript and generate summary
export const processMeetingTranscript = inngest.createFunction(
    { id: "process-meeting-transcript" },
    { event: "meeting.ended" },
    async ({ event, step }) => {
        const { meetingId } = event.data;

        const transcript = await step.run("fetch-transcript", async () => {
            // TODO: Fetch transcript from LiveKit or storage
            // For now, we'll return a placeholder since we switched from Stream to LiveKit
            return "Meeting transcript placeholder. Real transcription storage pending implementation.";
        });

        // Generate summary using LLM (Kimi/Grok/Gemini)
        const summary = await step.run("generate-summary", async () => {
            const llmClient = createLLMClient({
                provider: (process.env.NEXT_PUBLIC_LLM_PROVIDER as any) || "kimi",
                apiKey: process.env.NEXT_PUBLIC_LLM_API_KEY || "",
            });

            try {
                const summaryText = await llmClient.summarize(transcript);
                return summaryText;
            } catch (error) {
                console.error("Error generating summary:", error);
                return "Failed to generate summary.";
            }
        });

        // Update meeting with summary and transcript URL
        await step.run("update-meeting", async () => {
             await db
                .update(meetings)
                .set({
                    summary,
                    status: "completed",
                    // recordUrl: "TODO: LiveKit recording URL", 
                })
                .where(eq(meetings.id, meetingId));
        });

        return { meetingId, summary };
    }
);


