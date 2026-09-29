import { describe, expect, it } from "vitest";
import { assertProductionRuntimeConfiguration } from "./_core/env";

describe("production runtime configuration", () => {
  it("does not require production secrets during development", () => {
    expect(() => assertProductionRuntimeConfiguration({ NODE_ENV: "development" })).not.toThrow();
  });

  it("rejects missing production identity and session secrets", () => {
    expect(() => assertProductionRuntimeConfiguration({ NODE_ENV: "production" })).toThrow(
      "Production runtime requires: VITE_APP_ID, JWT_SECRET",
    );
  });

  it("rejects short production session secrets", () => {
    expect(() => assertProductionRuntimeConfiguration({ NODE_ENV: "production", VITE_APP_ID: "bwl", JWT_SECRET: "too-short" })).toThrow(
      "JWT_SECRET must be at least 32 characters",
    );
  });

  it("accepts a complete production configuration", () => {
    expect(() => assertProductionRuntimeConfiguration({ NODE_ENV: "production", VITE_APP_ID: "bwl", JWT_SECRET: "a".repeat(32) })).not.toThrow();
  });
});
