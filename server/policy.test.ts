import { describe, expect, it } from "vitest";
import { evaluatePolicy, hashArtifactBytes, sanitizeResourceScope } from "./policy";
import { buildDefaultSandboxSpec, validateSandboxSpec } from "./sandboxContract";
import { getExecutionPlanePreflight } from "./executionPlane";

describe("phase policy gates", () => {
  const base = { taskId: 7, workspaceId: 3 };

  it("denies network and secret use by default", () => {
    expect(evaluatePolicy({ ...base, capability: "network.request", networkEnabled: false })).toMatchObject({ allowed: false, requiresApproval: true });
    expect(evaluatePolicy({ ...base, capability: "secret.use" })).toMatchObject({ allowed: false, requiresApproval: false, reason: "SECRET_NAME_REQUIRED" });
    expect(evaluatePolicy({ ...base, capability: "secret.use", secretName: "KIMI_API_KEY" })).toMatchObject({ allowed: false, requiresApproval: true });
  });

  it("requires an approved request for critical capabilities", () => {
    expect(evaluatePolicy({ ...base, capability: "sandbox.execute", approvalStatus: "pending" }).allowed).toBe(false);
    expect(evaluatePolicy({ ...base, capability: "sandbox.execute", approvalStatus: "approved" }).allowed).toBe(true);
  });

  it("sanitizes scopes and hashes bytes deterministically", () => {
    expect(sanitizeResourceScope(" /workspace/input\n")).toBe("/workspace/input");
    expect(hashArtifactBytes(new TextEncoder().encode("hello"))).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });
});

describe("sandbox contract", () => {
  it("builds a bounded network-disabled default", () => {
    const spec = buildDefaultSandboxSpec("sha256:" + "a".repeat(64));
    expect(spec.network).toEqual({ mode: "disabled", domains: [] });
    expect(spec.memoryLimitMb).toBe(512);
  });

  it("rejects unpinned images and secret-like environment variables", () => {
    expect(() => validateSandboxSpec({ imageDigest: "latest" })).toThrow();
    expect(() => validateSandboxSpec({
      imageDigest: "sha256:" + "a".repeat(64), runtimeLimitSeconds: 60, memoryLimitMb: 256, cpuLimitMilli: 250,
      network: { mode: "disabled", domains: [] }, mounts: [], environment: { API_KEY: "should-not-pass" },
    })).toThrow("Secrets cannot be passed");
  });

  it("keeps the execution plane explicitly unconfigured until an isolated worker exists", () => {
    expect(getExecutionPlanePreflight().configured).toBe(false);
    expect(getExecutionPlanePreflight().plane).toBe("isolated-worker-not-configured");
  });
});
