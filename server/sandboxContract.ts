import { z } from "zod";

export const sandboxSpecSchema = z.object({
  imageDigest: z.string().regex(/^sha256:[a-f0-9]{64}$/, "Sandbox image must be pinned by sha256 digest"),
  runtimeLimitSeconds: z.number().int().min(5).max(900),
  memoryLimitMb: z.number().int().min(128).max(512),
  cpuLimitMilli: z.number().int().min(100).max(1000),
  network: z.object({ mode: z.enum(["disabled", "allowlist"]), domains: z.array(z.string().regex(/^[a-z0-9.-]+$/)).max(20) }),
  mounts: z.array(z.object({ source: z.enum(["task-input", "task-output"]), target: z.string().regex(/^\/[a-zA-Z0-9._/-]+$/), readOnly: z.boolean() })).max(4),
  environment: z.record(z.string().regex(/^[A-Z0-9_]+$/), z.string().max(500)).refine(values => Object.keys(values).every(key => !/(KEY|TOKEN|SECRET|PASSWORD|COOKIE)/i.test(key)), "Secrets cannot be passed as sandbox environment variables"),
});

export type SandboxSpec = z.infer<typeof sandboxSpecSchema>;

export function validateSandboxSpec(spec: unknown) {
  const parsed = sandboxSpecSchema.parse(spec);
  if (parsed.network.mode === "disabled" && parsed.network.domains.length > 0) throw new Error("NETWORK_DOMAINS_REQUIRE_ALLOWLIST_MODE");
  if (parsed.network.mode === "disabled" && parsed.mounts.some(mount => !mount.readOnly && mount.source === "task-input")) throw new Error("TASK_INPUT_MUST_BE_READ_ONLY");
  return parsed;
}

export function buildDefaultSandboxSpec(imageDigest: string): SandboxSpec {
  return validateSandboxSpec({
    imageDigest,
    runtimeLimitSeconds: 180,
    memoryLimitMb: 512,
    cpuLimitMilli: 500,
    network: { mode: "disabled", domains: [] },
    mounts: [{ source: "task-input", target: "/workspace/input", readOnly: true }, { source: "task-output", target: "/workspace/output", readOnly: false }],
    environment: {},
  });
}

export const SANDBOX_PHASE_STATUS = {
  executionPlane: "not_configured",
  imageRegistry: "not_configured",
  networkEgress: "deny_all",
  secretInjection: "disabled",
  hostFilesystem: "not_mounted",
} as const;
