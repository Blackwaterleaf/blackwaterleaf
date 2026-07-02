import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

/**
 * Absicherung des Werbe-/Promo-Systems (featured):
 * - öffentliche Listen sind ohne Login abrufbar und liefern Arrays
 * - Admin-only-Prozeduren sind für nicht-eingeloggte/Non-Admin gesperrt
 */

function publicCaller() {
  return appRouter.createCaller({
    user: null,
    req: { headers: {}, cookies: {} } as any,
    res: { clearCookie() {}, cookie() {} } as any,
  } as any);
}

function userCaller() {
  return appRouter.createCaller({
    user: { id: 999, role: "user", name: "Tester", openId: "x" },
    req: { headers: {}, cookies: {} } as any,
    res: { clearCookie() {}, cookie() {} } as any,
  } as any);
}

describe("featured router", () => {
  it("listHome ist öffentlich und liefert ein Array", async () => {
    const caller = publicCaller();
    const res = await caller.featured.listHome();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeLessThanOrEqual(1);
  });

  it("listCommunity ist öffentlich und liefert ein Array (max 6)", async () => {
    const caller = publicCaller();
    const res = await caller.featured.listCommunity();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeLessThanOrEqual(6);
  });

  it("listAll ist ohne Admin-Rechte gesperrt", async () => {
    const caller = userCaller();
    await expect(caller.featured.listAll()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("create ist ohne Admin-Rechte gesperrt", async () => {
    const caller = userCaller();
    await expect(
      caller.featured.create({
        name: "Test",
        platform: "instagram",
        url: "https://instagram.com/test",
        showOnHome: false,
        showInCommunity: true,
        active: true,
        sortOrder: 0,
        isPaid: false,
      } as any),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
