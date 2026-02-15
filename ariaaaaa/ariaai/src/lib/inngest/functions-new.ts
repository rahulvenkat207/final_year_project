import { inngest } from "../inngest";
import { db } from "@/db";
import { meetings, agents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createLLMClient, LLMProvider } from "../ai/llm";

// Process meeting transcript and generate summary using alternative LLM
export const processMeetingTranscript = inngest.createFunction(
    { id: "process-meeting-transcript" },
    { event: "meeting.ended" },
    async ({ event, step }) => {
        const { meetingId } = event.data;

        const transcript = await step.run("fetch-transcript", async () => {
            // Fetch transcript from LiveKit or your recording service
            // Note: LiveKit doesn't provide transcripts directly, you'll need to:
            // 1. Use AssemblyAI or Sarvam for transcription during the call
            // 2. Store transcript in database during call
            // 3. Or use a transcription service here
            
            // For now, we'll try to get from database or return placeholder
            const [meeting] = await db
                .select()
                .from(meetings)
                .where(eq(meetings.id, meetingId));

            // If transcript was stored during call, return it
            // Otherwise, you'll need to implement transcription here
            return meeting?.transcriptUrl || "Transcript will be available after processing.";
        });

        // Generate summary using alternative LLM (Grok/Kimi/Gemini)
        const summary = await step.run("generate-summary", async () => {
            const llmProvider = (process.env.LLM_PROVIDER as LLMProvider) || "grok";
            const llmApiKey = process.env.LLM_API_KEY || "";

            if (!llmApiKey) {
                throw new Error("LLM API key not configured");
            }

            const llmClient = createLLMClient({
                provider: llmProvider,
                apiKey: llmApiKey,
            });

            // Get agent instructions for context
            const [meeting] = await db
                .select()
                .from(meetings)
                .where(eq(meetings.id, meetingId));

            if (!meeting) {
                throw new Error("Meeting not found");
            }

            const [agent] = await db
                .select()
                .from(agents)
                .where(eq(agents.id, meeting.agentId));

            const systemPrompt = agent
                ? `You are a helpful assistant that summarizes meeting transcripts. The meeting was with an AI agent that follows these instructions: ${agent.instructions}. Provide a clear, organized summary with key points and action items.`
                : "You are a helpful assistant that summarizes meeting transcripts. Provide a clear, organized summary with key points and action items.";

            const summaryText = await llmClient.summarize(transcript, systemPrompt);
            return summaryText;
        });

        // Update meeting with summary
        await step.run("update-meeting", async () => {
            await db
                .update(meetings)
                .set({
                    summary,
                    status: "completed",
                    // Note: transcriptUrl and recordUrl should be set during/after call
                })
                .where(eq(meetings.id, meetingId));
        });

        return { meetingId, summary };
    }
);

