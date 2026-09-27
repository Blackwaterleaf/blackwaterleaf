import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { adminRouter } from "./routers/admin";
import type { TrpcContext } from "./_core/context";

const root = resolve(import.meta.dirname, "..");
const adminPage = readFileSync(resolve(root, "client/src/pages/AdminDashboard.tsx"), "utf8");

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

  it("exposes correction review only through staff procedures and the moderation panel", () => {
    expect(adminRouter._def.procedures.plantCorrections).toBeDefined();
    expect(adminRouter._def.procedures.reviewPlantCorrection).toBeDefined();
    expect(adminPage).toContain("Pflanzenkorrekturen prüfen");
    expect(adminPage).toContain("BESTÄTIGEN");
    expect(adminPage).toContain("ABLEHNEN");
  });

  it("keeps dashboard hooks stable while auth transitions from loading", () => {
    const loadingGuard = adminPage.indexOf('if (auth.loading) return <StatePanel');
    const focusEffect = adminPage.indexOf('window.requestAnimationFrame');
    expect(focusEffect).toBeGreaterThan(-1);
    expect(focusEffect).toBeLessThan(loadingGuard);
    expect(adminPage).toContain("setAccountProAccess");
    expect(adminPage).toContain("PRO FREISCHALTEN");
  });
});
