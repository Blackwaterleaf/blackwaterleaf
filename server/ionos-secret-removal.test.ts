import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("IONOS secret removal", () => {
  it("does not authenticate to the IONOS models endpoint after token removal", async () => {
    expect(ENV.aiProvider).toBe("forge");
    expect(ENV.ionosApiKey).toBe("REVOKED_DISABLED");

    const response = await fetch(
      `${ENV.ionosApiUrl.replace(/\/$/, "")}/v1/models`,
      { headers: { authorization: `Bearer ${ENV.ionosApiKey}` } }
    );

    expect(response.status).toBe(401);
  }, 30_000);
});
