import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeCtx(role: "user" | "moderator" | "admin" | null): TrpcContext {
  const user: AuthenticatedUser | null = role
    ? {
        id: role === "admin" ? 99 : role === "moderator" ? 50 : 1,
        openId: `user-${role}`,
        email: `${role}@example.com`,
        name: `${role} user`,
        loginMethod: "manus",
        role: role,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }
    : null;
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  } as TrpcContext;
}

describe("social module", () => {
  it("verhindert, dass man sich selbst folgt", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.social.follow({ userId: 1 })).rejects.toThrow();
  });

  it("erfordert Authentifizierung für follow", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.social.follow({ userId: 2 })).rejects.toThrow();
  });
});

describe("admin module – Rollen-Guards", () => {
  it("blockiert Nicht-Admins beim Zugriff auf admin.stats", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.admin.stats()).rejects.toThrow(/Admin/i);
  });

  it("blockiert Moderatoren beim Zugriff auf admin.stats", async () => {
    const caller = appRouter.createCaller(makeCtx("moderator"));
    await expect(caller.admin.stats()).rejects.toThrow(/Admin/i);
  });

  it("blockiert Nicht-Admins bei setRole", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.admin.setRole({ userId: 2, role: "moderator" })).rejects.toThrow();
  });
});

describe("moderation module – Rollen-Guards", () => {
  it("blockiert normale Nutzer beim Zugriff auf die Melde-Queue", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.moderation.queue({})).rejects.toThrow(/Moderator|Admin/i);
  });

  it("erlaubt Meldung nur für angemeldete Nutzer", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.moderation.report({ targetType: "post", targetId: 1, reason: "spam" }),
    ).rejects.toThrow();
  });
});

describe("messaging module", () => {
  it("verhindert Chat mit sich selbst", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.messaging.openDirect({ userId: 1 })).rejects.toThrow();
  });
});

describe("groups module – Validierung", () => {
  it("lehnt zu kurze Gruppennamen ab", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.groups.create({ name: "a" })).rejects.toThrow();
  });
});
