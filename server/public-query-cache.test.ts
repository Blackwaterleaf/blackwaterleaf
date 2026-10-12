import { describe, expect, it, vi } from "vitest";
import { cachedPublicQuery, clearPublicQueryCache } from "./publicQueryCache";

describe("public query cache", () => {
  it("reuses a public result during its TTL", async () => {
    clearPublicQueryCache();
    const loader = vi.fn(async () => ({ title: "Aquarienpflanzen" }));

    const first = await cachedPublicQuery("knowledge:de:botany:20", loader, 10_000);
    const second = await cachedPublicQuery("knowledge:de:botany:20", loader, 10_000);

    expect(first).toEqual(second);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("does not reuse an expired result", async () => {
    clearPublicQueryCache();
    const loader = vi.fn(async () => Date.now());

    await cachedPublicQuery("knowledge:de:expired", loader, 0);
    await cachedPublicQuery("knowledge:de:expired", loader, 0);

    expect(loader).toHaveBeenCalledTimes(2);
  });
});
