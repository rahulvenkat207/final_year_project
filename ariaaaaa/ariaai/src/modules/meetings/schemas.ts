import { z } from "zod";

export const meetingsInsertSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    agentId: z.string().min(1, { message: "Agent is required" }),
    invitees: z.array(z.string().email({ message: "Invalid email address" })).default([]),
    scheduledAt: z.date().or(z.string().datetime()).nullable().default(null),
});

export const meetingsUpdateSchema = meetingsInsertSchema.extend({
    id: z.string().min(1, { message: "Id is required" }),
});




