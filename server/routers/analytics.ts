import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getAnalyticsOverview, normalizeSessionKey, recordAnalyticsEvent } from "../analytics";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

const sessionKey = z.string().trim().min(16).max(128);
const path = z.string().trim().min(1).max(255);

export const analyticsRouter = router({
  record: publicProcedure
    .input(z.object({ sessionKey, eventType: z.enum(["page_view", "page_view_end", "session_start"]), path: path.nullable().optional(), durationSeconds: z.number().int().min(0).max(86_400).optional() }))
    .mutation(async ({ ctx, input }) => {
      const key = normalizeSessionKey(input.sessionKey);
      if (!key) throw new TRPCError({ code: "BAD_REQUEST", message: "analytics_session_required" });
      await recordAnalyticsEvent({ ctx, sessionKey: key, eventType: input.eventType, path: input.path, durationSeconds: input.durationSeconds });
      return { recorded: true } as const;
    }),

  overview: adminProcedure
    .input(z.object({ days: z.union([z.literal(1), z.literal(7), z.literal(30)]).default(7) }).optional())
    .query(async ({ ctx, input }) => {
      if (ctx.user.email?.trim().toLowerCase() !== "blackwaterleaf@gmail.com") {
        throw new TRPCError({ code: "FORBIDDEN", message: "owner_analytics_only" });
      }
      return getAnalyticsOverview(input?.days ?? 7);
    }),
});
