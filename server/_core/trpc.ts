import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { isActiveAccountWithRole } from "../security";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

type ProcedureRateLimit = {
  scope: string;
  limit: number;
  windowMs: number;
  message: string;
};

type RateLimitBucket = { count: number; resetAt: number };
const procedureRateLimitBuckets = new Map<string, RateLimitBucket>();

function requesterKey(ctx: TrpcContext): string {
  if (ctx.user) return `user:${ctx.user.id}`;
  // Express resolves req.ip according to the app's trusted-proxy policy. Do not
  // read x-forwarded-for directly because an untrusted client could forge it.
  const ip = ctx.req.ip || ctx.req.socket?.remoteAddress || "unknown";
  return `ip:${ip}`;
}

function procedureRateLimit(config: ProcedureRateLimit) {
  return t.middleware(async ({ ctx, next }) => {
    const now = Date.now();
    if (procedureRateLimitBuckets.size >= 1_024) {
      procedureRateLimitBuckets.forEach((bucket, bucketKey) => {
        if (bucket.resetAt <= now) procedureRateLimitBuckets.delete(bucketKey);
      });
    }
    const key = `${config.scope}:${requesterKey(ctx)}`;
    const current = procedureRateLimitBuckets.get(key);
    if (!current || current.resetAt <= now) {
      procedureRateLimitBuckets.set(key, { count: 1, resetAt: now + config.windowMs });
    } else if (current.count >= config.limit) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: config.message });
    } else {
      current.count += 1;
    }
    return next();
  });
}

/** These limits execute for every operation in a tRPC batch, not merely its HTTP envelope. */
export const localAuthProcedure = t.procedure.use(
  procedureRateLimit({
    scope: "local-auth",
    limit: 12,
    windowMs: 15 * 60 * 1_000,
    message: "local_auth_rate_limit_exceeded",
  }),
);

export const communityProcedure = t.procedure.use(
  procedureRateLimit({
    scope: "community",
    limit: 120,
    windowMs: 15 * 60 * 1_000,
    message: "community_rate_limit_exceeded",
  }),
);

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  if (!isActiveAccountWithRole(ctx.user, ["user", "moderator", "admin"])) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Account is not active" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const assistantProcedure = protectedProcedure.use(
  procedureRateLimit({
    scope: "assistant",
    limit: 20,
    windowMs: 15 * 60 * 1_000,
    message: "assistant_rate_limit_exceeded",
  }),
);

export const protectedCommunityProcedure = protectedProcedure.use(
  procedureRateLimit({
    scope: "community",
    limit: 120,
    windowMs: 15 * 60 * 1_000,
    message: "community_rate_limit_exceeded",
  }),
);

export const staffProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    }

    if (!isActiveAccountWithRole(ctx.user, ["moderator", "admin"])) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Active staff role required" });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !isActiveAccountWithRole(ctx.user, ["admin"])) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
