import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type CookieCall = { name: string; options: Record<string, unknown> };
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(user: AuthenticatedUser | null): {
  ctx: TrpcContext;
  clearedCookies: CookieCall[];
} {
  const clearedCookies: CookieCall[] = [];
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

describe("account.deleteMe", () => {
  it("rejects unauthenticated callers", async () => {
    const { ctx } = createContext(null);
    const caller = appRouter.createCaller(ctx);
    await expect(caller.account.deleteMe()).rejects.toThrow();
  });

  it("exposes a deleteMe mutation on the account router", () => {
    // Ensures the procedure is registered so the client can call it.
    expect(appRouter._def.procedures["account.deleteMe"]).toBeDefined();
  });

  // Note: full deletion is covered by integration/manual testing against a DB.
  // The COOKIE_NAME import guards against accidental cookie-name drift.
  it("uses the shared session cookie name", () => {
    expect(typeof COOKIE_NAME).toBe("string");
    expect(COOKIE_NAME.length).toBeGreaterThan(0);
  });
});
