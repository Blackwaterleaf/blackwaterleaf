import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { adminProcedure, protectedProcedure, router, staffProcedure } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import {
  aiRateLimiter,
  authRateLimiter,
  communityRateLimiter,
  localAuthRateLimiter,
  uploadRateLimiter,
  weatherRateLimiter,
} from "./security";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: 1,
      openId: "verified-account",
      name: "Verified account",
      username: null,
      email: null,
      loginMethod: "manus",
      role: "user",
      status: "active",
      locale: "de",
      unitSystem: "metric",
      profileVisibility: "private",
      avatarUrl: null,
      avatarStorageKey: null,
      bio: null,
      location: null,
      socialInstagram: null,
      socialTiktok: null,
      socialYoutube: null,
      socialFacebook: null,
      socialWebsite: null,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
      ...overrides,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const accessRouter = router({
  protected: protectedProcedure.query(() => "protected"),
  staff: staffProcedure.query(() => "staff"),
  admin: adminProcedure.query(() => "admin"),
});

async function assertRateLimit(limit: number, limiter: express.RequestHandler) {
  const app = express();
  app.set("trust proxy", 1);
  app.get("/test", limiter, (_req, res) => res.status(200).json({ ok: true }));

  for (let index = 0; index < limit; index += 1) {
    const response = await request(app).get("/test");
    expect(response.status).toBe(200);
  }

  const blocked = await request(app).get("/test");
  expect(blocked.status).toBe(429);
}

describe("tRPC access procedures", () => {
  it("rejects suspended users from protected procedures", async () => {
    const caller = accessRouter.createCaller(createContext({ status: "suspended" }));
    await expect(caller.protected()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects normal users from staff and admin procedures", async () => {
    const caller = accessRouter.createCaller(createContext({ role: "user" }));
    await expect(caller.staff()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows only active server roles into their matching procedures", async () => {
    const moderator = accessRouter.createCaller(createContext({ role: "moderator" }));
    const admin = accessRouter.createCaller(createContext({ role: "admin" }));
    await expect(moderator.staff()).resolves.toBe("staff");
    await expect(admin.admin()).resolves.toBe("admin");
  });
});

describe("session application binding", () => {
  it("rejects a correctly signed token issued for another application", async () => {
    const foreignToken = await sdk.signSession({
      openId: "verified-account",
      appId: "foreign-application",
      name: "Verified account",
    });
    await expect(sdk.verifySession(foreignToken)).resolves.toBeNull();
  });

  it("marks a locally issued session so it can never trigger OAuth synchronization", async () => {
    const token = await sdk.createLocalSessionToken("local_account", { name: "Local account" });
    await expect(sdk.verifySession(token)).resolves.toMatchObject({
      openId: "local_account",
      provider: "local",
    });
  });
});

describe("rate limiter boundaries", () => {
  it("blocks authentication traffic after its configured allowance", async () => {
    await assertRateLimit(30, authRateLimiter);
  });

  it("blocks local password and verification-token attempts after 12 requests", async () => {
    await assertRateLimit(12, localAuthRateLimiter);
  });

  it("blocks upload traffic after its configured allowance", async () => {
    await assertRateLimit(10, uploadRateLimiter);
  });

  it("blocks community traffic after its configured allowance", async () => {
    await assertRateLimit(120, communityRateLimiter);
  });

  it("blocks AI traffic after its configured allowance", async () => {
    await assertRateLimit(20, aiRateLimiter);
  });

  it("bounds anonymous weather requests without retaining location data", async () => {
    await assertRateLimit(30, weatherRateLimiter);
  });
});
