import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./context";
import { localAuthProcedure, router } from "./trpc";

function anonymousContext(ip: string): TrpcContext {
  return {
    user: null,
    req: { ip, headers: {}, socket: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("tRPC procedure rate limits", () => {
  it("enforces a local-auth allowance for every operation, including direct callers", async () => {
    const limitedRouter = router({ attempt: localAuthProcedure.query(() => "ok") });
    const caller = limitedRouter.createCaller(anonymousContext("198.51.100.40"));

    for (let attempt = 0; attempt < 12; attempt += 1) {
      await expect(caller.attempt()).resolves.toBe("ok");
    }

    await expect(caller.attempt()).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
      message: "local_auth_rate_limit_exceeded",
    });
  });
});
