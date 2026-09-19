import { describe, expect, it } from "vitest";
import { getSessionSecret, validateRuntimeEnvironment } from "./env";

describe("session runtime configuration", () => {
  it("uses an isolated fixture key only in test environments", () => {
    const secret = getSessionSecret({ NODE_ENV: "test", JWT_SECRET: "" });
    expect(secret.byteLength).toBeGreaterThanOrEqual(32);
    expect(() => validateRuntimeEnvironment({ NODE_ENV: "test", JWT_SECRET: "" })).not.toThrow();
  });

  it("fails closed for missing or undersized executable secrets", () => {
    expect(() => validateRuntimeEnvironment({ NODE_ENV: "production", JWT_SECRET: "" })).toThrow("JWT_SECRET");
    expect(() => validateRuntimeEnvironment({ NODE_ENV: "development", JWT_SECRET: "too-short" })).toThrow("JWT_SECRET");
  });

  it("accepts a sufficiently strong configured executable secret", () => {
    const environment = { NODE_ENV: "production", JWT_SECRET: "a-production-session-secret-with-32-bytes" };
    expect(() => validateRuntimeEnvironment(environment)).not.toThrow();
    expect(getSessionSecret(environment).byteLength).toBeGreaterThanOrEqual(32);
  });
});
