import { z } from "zod";

export const agentsInsertSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    instructions: z.string().min(1, { message: "Instructions is required" }),
});

export const agentsUpdateSchema = agentsInsertSchema.extend({
    id: z.string().min(1, { message: "Id is required" }),
});

export const meetingsInsertSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    agentId: z.string().min(1, { message: "agent is required" }),
});

export const meetingsUpdateSchema = meetingsInsertSchema.extend({
    id: z.string().min(1, { message: "Id is required" }),
});