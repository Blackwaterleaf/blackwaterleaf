import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { observationsRouter } from "./routers/observations";
import { platformRouter } from "./routers/platform";
import { profileRouter } from "./routers/profile";
import { communityRouter } from "./routers/community";
import { knowledgeRouter } from "./routers/knowledge";
import { gamificationRouter } from "./routers/gamification";
import { assistantRouter } from "./routers/assistant";
import { habitatsRouter } from "./routers/habitats";
import { adminRouter } from "./routers/admin";
import { partnersRouter } from "./routers/partners";
import { localAuthRouter } from "./routers/localAuth";
import { sensorsRouter } from "./routers/sensors";
import { smartDevicesRouter } from "./routers/smartDevices";
import { analyticsRouter } from "./routers/analytics";
import { notificationsRouter } from "./routers/notifications";
import { careRouter } from "./routers/care";
import { searchRouter } from "./routers/search";
import { socialRouter } from "./routers/social";
import { challengesRouter } from "./routers/challenges";
import { listActiveSessions, revokeAllSessions, revokeSessionForRequest } from "./sessionRegistry";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  platform: platformRouter,
  profile: profileRouter,
  observations: observationsRouter,
  knowledge: knowledgeRouter,
  community: communityRouter,
  gamification: gamificationRouter,
  assistant: assistantRouter,
  habitats: habitatsRouter,
  admin: adminRouter,
  partners: partnersRouter,
  sensors: sensorsRouter,
  smartDevices: smartDevicesRouter,
  analytics: analyticsRouter,
  notifications: notificationsRouter,
  care: careRouter,
  search: searchRouter,
  social: socialRouter,
  challenges: challengesRouter,
  auth: router({
    ...localAuthRouter._def.record,
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      if (ctx.user) await revokeSessionForRequest(ctx.req, ctx.user.id).catch(() => false);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    revokeAllSessions: protectedProcedure.mutation(async ({ ctx }) => ({
      success: true as const,
      revoked: await revokeAllSessions(ctx.user.id),
    })),
    sessions: protectedProcedure.query(({ ctx }) => listActiveSessions(ctx.user.id)),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
