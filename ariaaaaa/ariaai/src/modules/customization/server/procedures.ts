import { db } from "@/db";
import { z } from "zod";
import { customAgentProposals } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { sendProposalEmail } from "@/lib/proposal-email";

export const proposalInsertSchema = z.object({
    agentName: z.string().min(2, "Agent name must be at least 2 characters"),
    useCase: z.string().min(1, "Please select a use case"),
    behaviorDescription: z
        .string()
        .min(20, "Please describe the behavior in at least 20 characters"),
    voiceStyle: z.string().min(1, "Please select a voice style"),
    language: z.string().min(1, "Please select a language"),
    contactEmail: z.string().email("Please enter a valid email"),
    additionalNotes: z.string().optional(),
});

export const customizationRouter = createTRPCRouter({
    submitProposal: protectedProcedure
        .input(proposalInsertSchema)
        .mutation(async ({ ctx, input }) => {
            // Save proposal to DB
            const [proposal] = await db
                .insert(customAgentProposals)
                .values({
                    ...input,
                    userId: ctx.auth.id,
                    status: "pending",
                })
                .returning();

            if (!proposal) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create proposal",
                });
            }

            // Send email to admin with magic action buttons
            try {
                await sendProposalEmail({
                    proposalId: proposal.id,
                    agentName: proposal.agentName,
                    useCase: proposal.useCase,
                    behaviorDescription: proposal.behaviorDescription,
                    voiceStyle: proposal.voiceStyle,
                    language: proposal.language,
                    contactEmail: proposal.contactEmail,
                    additionalNotes: proposal.additionalNotes ?? undefined,
                    submittedByName: ctx.auth.name,
                    submittedByEmail: ctx.auth.email,
                });
            } catch (emailError) {
                // Don't fail the whole request if email fails
                console.error("Failed to send proposal email:", emailError);
            }

            return proposal;
        }),

    getMyProposals: protectedProcedure.query(async ({ ctx }) => {
        const proposals = await db
            .select()
            .from(customAgentProposals)
            .where(eq(customAgentProposals.userId, ctx.auth.id))
            .orderBy(desc(customAgentProposals.createdAt));

        return proposals;
    }),

    getProposalById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const [proposal] = await db
                .select()
                .from(customAgentProposals)
                .where(
                    and(
                        eq(customAgentProposals.id, input.id),
                        eq(customAgentProposals.userId, ctx.auth.id)
                    )
                );

            if (!proposal) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Proposal not found",
                });
            }

            return proposal;
        }),
});
