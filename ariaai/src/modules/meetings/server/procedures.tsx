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
  create: protectedProcedure.input(meetingsInsertSchema)
  .mutation(async ({ input, ctx }) => {
      const [created] = await db
          .insert(meetings)
          .values({
              ...input,
              userId: ctx.auth.id
          })
          .returning();
          //TODO: Create stream call, upset stream users
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

});