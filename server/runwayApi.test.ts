import { describe, expect, it } from "vitest";

describe("Runway API credentials", () => {
  it("authenticates without starting a billable generation", async () => {
    const key = process.env.RUNWAY_API_KEY ?? "";
    expect(key, "RUNWAY_API_KEY must be supplied by the secure project secret store").toBeTruthy();

    const response = await fetch("https://api.dev.runwayml.com/v1/tasks/00000000-0000-0000-0000-000000000000", {
      headers: {
        Authorization: `Bearer ${key}`,
        "X-Runway-Version": "2024-11-06",
      },
    });

    expect([401, 403]).not.toContain(response.status);
    expect([200, 400, 404]).toContain(response.status);
  }, 15_000);
});
