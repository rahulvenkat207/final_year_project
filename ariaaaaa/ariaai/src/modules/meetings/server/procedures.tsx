import { db } from "@/db";
import { z } from "zod";
import { and, count, desc, eq, getTableColumns } from "drizzle-orm";
import { meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { MIN_PAGE_SIZE, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from "@/constants";
import { ilike } from "drizzle-orm";
import { meetingsInsertSchema } from "../schemas";

export const meetingsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(meetingsInsertSchema)
        .mutation(async ({ input, ctx }) => {
            // Check subscription tier and limits
            const [subscription] = await db
                .select()
                .from(subscriptions)
                .where(eq(subscriptions.userId, ctx.auth.id));

            const tier = subscription?.tier || "free";

            if (tier === "free") {
                // Check meeting count for free tier
                const meetingCount = await db
                    .select({ count: count() })
                    .from(meetings)
                    .where(eq(meetings.userId, ctx.auth.id));

                if ((meetingCount[0]?.count ?? 0) >= FREE_TIER_MEETING_LIMIT) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Free tier limit reached. Please upgrade to create more meetings.",
                    });
                }
            }

            const [created] = await db
                .insert(meetings)
                .values({
                    ...input,
                    userId: ctx.auth.id
                })
                .returning();
            // TODO: Create stream call, upsert stream users
            return created;
        }),
    getOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const [existingMeeting] = await db
                .select({
                    ...getTableColumns(meetings),
                })
                .from(meetings)
                .where(and(
                    eq(meetings.id, input.id),
                    eq(meetings.userId, ctx.auth.id)
                ));

            if (!existingMeeting) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meeting not found",
                });
            }
            return existingMeeting;
        }),
    getMany: protectedProcedure
        .input(
            z.object({
                page: z.number().default(DEFAULT_PAGE),
                pageSize: z
                    .number()
                    .min(MIN_PAGE_SIZE)
                    .max(MAX_PAGE_SIZE)
                    .default(DEFAULT_PAGE_SIZE),
                search: z.string().nullish(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { page, pageSize, search } = input;

            const data = await db
                .select({
                    ...getTableColumns(meetings),
                })
                .from(meetings)
                .where(
                    and(
                        eq(meetings.userId, ctx.auth.id),
                        search ? ilike(meetings.name, `%${search}%`) : undefined
                    )
                )
                .orderBy(desc(meetings.createdAt), desc(meetings.id))
                .limit(pageSize)
                .offset((page - 1) * pageSize);

            const total = await db
                .select({ count: count() })
                .from(meetings)
                .where(
                    and(
                        eq(meetings.userId, ctx.auth.id),
                        search ? ilike(meetings.name, `%${search}%`) : undefined
                    )
                );

            const totalCount = total[0]?.count ?? 0;

            return {
                items: data,
                total: totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
            };
        }),
    start: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const [existingMeeting] = await db
                .select()
                .from(meetings)
                .where(and(
                    eq(meetings.id, input.id),
                    eq(meetings.userId, ctx.auth.id)
                ));

            if (!existingMeeting) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meeting not found",
                });
            }

            if (existingMeeting.status !== "upcoming") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Meeting can only be started if it's upcoming",
                });
            }

            const [updated] = await db
                .update(meetings)
                .set({
                    status: "active",
                    startedAt: new Date(),
                })
                .where(eq(meetings.id, input.id))
                .returning();

            return updated;
        }),
    end: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const [existingMeeting] = await db
                .select()
                .from(meetings)
                .where(and(
                    eq(meetings.id, input.id),
                    eq(meetings.userId, ctx.auth.id)
                ));

            if (!existingMeeting) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meeting not found",
                });
            }

            if (existingMeeting.status !== "active") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Meeting can only be ended if it's active",
                });
            }

            const [updated] = await db
                .update(meetings)
                .set({
                    status: "processing",
                    endedAt: new Date(),
                })
                .where(eq(meetings.id, input.id))
                .returning();

            // Trigger Inngest job to process transcript and summary
            try {
                const { getInngest } = await import("@/lib/inngest");
                await getInngest().send({
                    name: "meeting.ended",
                    data: { meetingId: input.id },
                });
            } catch (error) {
                console.error("Error triggering Inngest job:", error);
                // Don't fail the mutation if Inngest fails
            }

            return updated;
        }),
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            agentId: z.string().min(1).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { id, ...updates } = input;

            const [existingMeeting] = await db
                .select()
                .from(meetings)
                .where(and(
                    eq(meetings.id, id),
                    eq(meetings.userId, ctx.auth.id)
                ));

            if (!existingMeeting) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meeting not found",
                });
            }

            if (existingMeeting.status !== "upcoming") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Only upcoming meetings can be updated",
                });
            }

            const [updated] = await db
                .update(meetings)
                .set(updates)
                .where(eq(meetings.id, id))
                .returning();

            return updated;
        }),
    cancel: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const [existingMeeting] = await db
                .select()
                .from(meetings)
                .where(and(
                    eq(meetings.id, input.id),
                    eq(meetings.userId, ctx.auth.id)
                ));

            if (!existingMeeting) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meeting not found",
                });
            }

            if (existingMeeting.status === "completed" || existingMeeting.status === "cancelled") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Meeting cannot be cancelled",
                });
            }

            const [updated] = await db
                .update(meetings)
                .set({
                    status: "cancelled",
                })
                .where(eq(meetings.id, input.id))
                .returning();

            return updated;
        }),
});