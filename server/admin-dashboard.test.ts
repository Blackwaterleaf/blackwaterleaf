import { describe, expect, it } from "vitest";
import { adminRouter } from "./routers/admin";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "user" | "moderator" | "admin"): TrpcContext {
  return {
    user: {
      id: 99,
      openId: `test-${role}`,
      name: "Test",
      email: "test@example.com",
      loginMethod: "test",
      role,
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
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin dashboard authorization", () => {
  it("rejects a normal active user before any dashboard data query", async () => {
    const caller = adminRouter.createCaller(contextFor("user"));
    await expect(caller.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.auditTrail()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects moderators from account directory and role-management paths", async () => {
    const caller = adminRouter.createCaller(contextFor("moderator"));
    await expect(caller.accounts()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.setAccountRole({ id: 1, role: "user" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
