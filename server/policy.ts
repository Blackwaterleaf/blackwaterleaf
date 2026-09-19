import { createHash } from "node:crypto";

export type Capability =
  | "agent.plan"
  | "artifact.read"
  | "artifact.write"
  | "network.request"
  | "secret.use"
  | "sandbox.execute"
  | "publish"
  | "role.change";

export type PolicyContext = {
  capability: Capability;
  taskId?: number;
  workspaceId?: number;
  approvalStatus?: "pending" | "approved" | "denied" | "expired" | "cancelled";
  resourceScope?: string;
  networkEnabled?: boolean;
  secretName?: string;
};

export type PolicyDecision = {
  allowed: boolean;
  requiresApproval: boolean;
  reason: string;
  decisionId: string;
};

const alwaysApproval = new Set<Capability>([
  "network.request",
  "secret.use",
  "sandbox.execute",
  "publish",
  "role.change",
]);

const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export function evaluatePolicy(context: PolicyContext): PolicyDecision {
  const decisionId = digest({ context, policyVersion: "phase-2.1" });
  if (!context.taskId || !context.workspaceId) {
    return { allowed: false, requiresApproval: false, reason: "TASK_AND_WORKSPACE_SCOPE_REQUIRED", decisionId };
  }
  if (context.capability === "network.request" && context.networkEnabled !== true) {
    return { allowed: false, requiresApproval: true, reason: "NETWORK_DISABLED_BY_DEFAULT", decisionId };
  }
  if (context.capability === "secret.use" && !context.secretName) {
    return { allowed: false, requiresApproval: false, reason: "SECRET_NAME_REQUIRED", decisionId };
  }
  if (context.approvalStatus === "approved" && alwaysApproval.has(context.capability)) {
    return { allowed: true, requiresApproval: false, reason: "EXPLICIT_APPROVAL_PRESENT", decisionId };
  }
  if (alwaysApproval.has(context.capability)) {
    return { allowed: false, requiresApproval: true, reason: "EXPLICIT_APPROVAL_REQUIRED", decisionId };
  }
  if (context.approvalStatus && context.approvalStatus !== "approved") {
    return { allowed: false, requiresApproval: false, reason: "APPROVAL_NOT_ACTIVE", decisionId };
  }
  return { allowed: true, requiresApproval: false, reason: "SAFE_CAPABILITY_ALLOWED", decisionId };
}

export function assertPolicy(context: PolicyContext) {
  const decision = evaluatePolicy(context);
  if (!decision.allowed) {
    const error = new Error(decision.reason);
    Object.assign(error, { code: decision.requiresApproval ? "APPROVAL_REQUIRED" : "POLICY_DENIED", decision });
    throw error;
  }
  return decision;
}

export function sanitizeResourceScope(scope: string) {
  return scope.trim().replace(/[\r\n\u0000]/g, "").slice(0, 2000);
}

export function hashArtifactBytes(data: Uint8Array) {
  return createHash("sha256").update(data).digest("hex");
}

export const CAPABILITY_REGISTRY = [
  { name: "agent.plan", risk: "low", default: "allow" },
  { name: "artifact.read", risk: "low", default: "allow" },
  { name: "artifact.write", risk: "medium", default: "allow" },
  { name: "network.request", risk: "high", default: "deny" },
  { name: "secret.use", risk: "critical", default: "deny" },
  { name: "sandbox.execute", risk: "critical", default: "deny" },
  { name: "publish", risk: "high", default: "deny" },
  { name: "role.change", risk: "critical", default: "deny" },
] as const;
