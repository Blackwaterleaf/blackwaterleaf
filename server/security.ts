import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";

export function isSessionPayloadBoundToApp(
  payload: Record<string, unknown>,
  expectedAppId: string,
): payload is Record<string, unknown> & { openId: string; appId: string; name: string } {
  return (
    typeof payload.openId === "string" &&
    payload.openId.length > 0 &&
    typeof payload.appId === "string" &&
    payload.appId === expectedAppId &&
    typeof payload.name === "string" &&
    payload.name.length > 0
  );
}

export function isActiveAccountWithRole(
  account: { status?: string; role?: string } | null | undefined,
  allowedRoles: readonly string[],
): boolean {
  return Boolean(account && account.status === "active" && account.role && allowedRoles.includes(account.role));
}

function forwardedHost(req: Request): string {
  const forwarded = req.header("x-forwarded-host")?.split(",")[0]?.trim();
  return forwarded || req.header("host") || "";
}

export function sameOriginMutationGuard(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }

  // Native clients authenticate with an Authorization bearer token and are not
  // vulnerable to browser cookie CSRF. Cookie-based browser mutations must be
  // same-origin and therefore require a matching Origin header.
  if (req.header("authorization")?.startsWith("Bearer ")) {
    next();
    return;
  }

  const origin = req.header("origin");
  if (!origin) {
    res.status(403).json({ error: "origin_required" });
    return;
  }

  try {
    const originUrl = new URL(origin);
    if (originUrl.host !== forwardedHost(req)) {
      res.status(403).json({ error: "origin_mismatch" });
      return;
    }
  } catch {
    res.status(403).json({ error: "origin_invalid" });
    return;
  }

  next();
}

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      connectSrc: ["'self'", "https:", ...(IS_DEVELOPMENT ? ["ws:", "wss:"] : [])],
      fontSrc: ["'self'", "https:", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      imgSrc: ["'self'", "https:", "data:", "blob:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'", ...(IS_DEVELOPMENT ? ["'unsafe-inline'"] : [])],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "rate_limit_exceeded" },
});

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "upload_rate_limit_exceeded" },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "auth_rate_limit_exceeded" },
});

/** Restricts password and email-token attempts more tightly than generic API traffic. */
export const localAuthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 12,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "local_auth_rate_limit_exceeded" },
});

export const communityRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "community_rate_limit_exceeded" },
});

export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "ai_rate_limit_exceeded" },
});

/** Keeps the public weather pass-through bounded without recording user locations. */
export const weatherRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "weather_rate_limit_exceeded" },
});
