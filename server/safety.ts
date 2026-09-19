import { createHash } from "node:crypto";

export const SAFETY_LIMITS = {
  maxRuntimeMs: 180_000,
  maxSteps: 30,
  maxToolCalls: 50,
  maxRepeatedAction: 2,
  maxConsecutiveFailures: 3,
} as const;

const TASK_TRANSITIONS: Record<string, string[]> = {
  draft: ["ready", "cancelled"],
  ready: ["queued", "running", "cancelled"],
  queued: ["running", "cancelled", "expired"],
  running: ["waiting_for_approval", "succeeded", "failed", "cancelled"],
  waiting_for_approval: ["running", "succeeded", "failed", "cancelled", "expired"],
  failed: ["ready", "queued", "running", "cancelled"],
  succeeded: [],
  cancelled: [],
  expired: [],
};

export function assertTaskTransition(current: string, next: string) {
  if (!TASK_TRANSITIONS[current]?.includes(next)) throw new Error(`INVALID_TASK_TRANSITION:${current}->${next}`);
}

const INJECTION_PATTERNS = [
  /ignore\s+(all|any|the)\s+(previous|prior|earlier)\s+instructions?/i,
  /reveal\s+(the\s+)?(system|developer)\s+prompt/i,
  /print\s+(the\s+)?(api|access|secret)\s*key/i,
  /disable\s+(all\s+)?safety|bypass\s+(the\s+)?approval/i,
  /upload\s+.*(secret|credential|cookie|token)/i,
];

export function hashEvidence(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function detectPromptInjection(text: string) {
  return INJECTION_PATTERNS.some(pattern => pattern.test(text));
}

export function assertControlledGoal(goal: string) {
  if (detectPromptInjection(goal)) {
    throw new Error("PROMPT_INJECTION_SUSPECTED");
  }
  if (goal.trim().length < 10) throw new Error("GOAL_TOO_SHORT");
}

export function validateAgentResult(result: { summary: string; plan: string[]; risks: string[]; nextAction: string }) {
  if (!result.summary.trim() || !result.nextAction.trim()) throw new Error("INVALID_AGENT_RESULT");
  if (result.plan.length === 0 || result.plan.length > SAFETY_LIMITS.maxSteps) throw new Error("PLAN_STEP_LIMIT_EXCEEDED");
  const normalizedPlan = result.plan.map(step => step.trim().toLowerCase()).filter(Boolean);
  if (new Set(normalizedPlan).size !== normalizedPlan.length) throw new Error("REPEATED_PLAN_STEP_DETECTED");
  if (detectPromptInjection(`${result.summary}\n${result.plan.join("\n")}\n${result.nextAction}`)) throw new Error("PROMPT_INJECTION_SUSPECTED");
  return { ...result, plan: result.plan.map(step => step.trim()).slice(0, SAFETY_LIMITS.maxSteps), risks: result.risks.map(risk => risk.trim()).filter(Boolean) };
}

export function createRunGuard(startedAt = Date.now()) {
  let stepCount = 0;
  let toolCalls = 0;
  let consecutiveFailures = 0;
  const repeatedActions = new Map<string, number>();
  return {
    step(action: string) {
      if (Date.now() - startedAt > SAFETY_LIMITS.maxRuntimeMs) throw new Error("RUN_TIMEOUT");
      stepCount += 1;
      if (stepCount > SAFETY_LIMITS.maxSteps) throw new Error("STEP_LIMIT_EXCEEDED");
      const count = (repeatedActions.get(action) ?? 0) + 1;
      repeatedActions.set(action, count);
      if (count > SAFETY_LIMITS.maxRepeatedAction) throw new Error("REPEATED_ACTION_LIMIT_EXCEEDED");
    },
    toolCall() {
      toolCalls += 1;
      if (toolCalls > SAFETY_LIMITS.maxToolCalls) throw new Error("TOOL_CALL_LIMIT_EXCEEDED");
    },
    failure() {
      consecutiveFailures += 1;
      if (consecutiveFailures >= SAFETY_LIMITS.maxConsecutiveFailures) throw new Error("CONSECUTIVE_FAILURE_LIMIT_EXCEEDED");
    },
    success() { consecutiveFailures = 0; },
    snapshot() { return { stepCount, toolCalls, consecutiveFailures }; },
  };
}
