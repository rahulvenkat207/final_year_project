import { inngest } from "../inngest";
import { db } from "@/db";
import { meetings, agents } from "@/db/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { getStreamServerClient } from "../stream";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Process meeting transcript and generate summary
export const processMeetingTranscript = inngest.createFunction(
    { id: "process-meeting-transcript" },
    { event: "meeting.ended" },
    async ({ event, step }) => {
        const { meetingId } = event.data;

        const transcript = await step.run("fetch-transcript", async () => {
            // Fetch transcript from Stream Video API
            const streamClient = getStreamServerClient();
            const call = streamClient.video.call("default", meetingId);
            
            try {
                // Get recording and transcript from Stream
                const recordings = await call.listRecordings();
                const latestRecording = recordings.recordings?.[0];
                
                if (latestRecording?.transcription) {
                    // Stream provides transcription data
                    const transcriptText = latestRecording.transcription.transcript
                        .map((t: any) => `${t.user?.name || "User"}: ${t.text}`)
                        .join("\n");
                    
                    return transcriptText;
                }
                
                // Fallback: return placeholder if no transcript available
                return "Transcript will be available after processing.";
            } catch (error) {
                console.error("Error fetching transcript from Stream:", error);
                return "Transcript processing failed.";
            }
        });

        // Generate summary using OpenAI
        const summary = await step.run("generate-summary", async () => {
            // TODO: Implement OpenAI summarization
            // This will use OpenAI API to generate a summary from the transcript
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that summarizes meeting transcripts. Provide a clear, organized summary with key points and action items.",
                    },
                    {
                        role: "user",
                        content: `Please summarize this meeting transcript:\n\n${transcript}`,
                    },
                ],
            });

            return response.choices[0]?.message?.content || "";
        });

        // Update meeting with summary and transcript URL
        await step.run("update-meeting", async () => {
            const streamClient = getStreamServerClient();
            const call = streamClient.video.call("default", meetingId);
            
            let transcriptUrl = null;
            let recordUrl = null;
            
            try {
                const recordings = await call.listRecordings();
                const latestRecording = recordings.recordings?.[0];
                
                if (latestRecording) {
                    recordUrl = latestRecording.url;
                    // Store transcript as text in database, or save to file storage
                    // For now, we'll store it in the summary field along with summary
                }
            } catch (error) {
                console.error("Error fetching recording URL:", error);
            }

            await db
                .update(meetings)
                .set({
                    summary,
                    status: "completed",
                    recordUrl,
                    // Note: transcriptUrl can be stored in a separate table or file storage
                    // For now, transcript is included in the summary processing
                })
                .where(eq(meetings.id, meetingId));
        });

        return { meetingId, summary };
    }
);

