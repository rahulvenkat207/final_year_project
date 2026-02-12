// Server-only module
import { Inngest } from "inngest";

// Ensure this is only used server-side
if (typeof window !== "undefined") {
    throw new Error("Inngest can only be used on the server");
}

export const inngest = new Inngest({
    id: "meet-ai",
    eventKey: process.env.INNGEST_EVENT_KEY,
});

export const getInngest = () => inngest;

