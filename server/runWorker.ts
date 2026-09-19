import { randomUUID } from "node:crypto";
import { runControlledAgent } from "./agentRunner";
import * as db from "./db";

const activeControllers = new Map<number, AbortController>();

export function abortActiveRun(runId: number) {
  const controller = activeControllers.get(runId);
  if (!controller) return false;
  controller.abort(new Error("RUN_CANCELLED_BY_KILL_SWITCH"));
  return true;
}

const backoff = (attempt: number) => new Date(Date.now() + Math.min(30_000, 1_000 * 2 ** Math.max(0, attempt - 1)));

export async function processNextAgentRun(workerId = `studio-worker-${randomUUID()}`) {
  const run = await db.claimNextAgentRun(workerId);
  if (!run) return false;
  const controller = new AbortController();
  activeControllers.set(run.id, controller);
  const leaseTimer = setInterval(() => {
    void db.renewAgentRunLease(run.id, workerId).then(renewed => {
      if (!renewed) controller.abort(new Error("RUN_LEASE_LOST"));
    }).catch(() => controller.abort(new Error("RUN_LEASE_RENEWAL_FAILED")));
  }, 15_000);

  let sessionId: number | undefined;
  try {
    const task = await db.getTaskForWorkspace(run.taskId, run.workspaceId);
    if (!task || controller.signal.aborted) throw new Error("RUN_CANCELLED");
    await db.updateTask(task.id, { status: "running", cancelRequested: false, startedAt: task.startedAt ?? new Date(), finishedAt: null });
    await db.updateTaskStep(task.id, 1, { status: "running", startedAt: new Date() });
    await db.saveAgentRunCheckpoint(run.id, workerId, { phase: "planner.start", attempt: run.attempt });
    sessionId = await db.createSandboxSession(task.id);
    const result = await runControlledAgent({ title: task.title, goal: task.goal, signal: controller.signal });
    if (controller.signal.aborted) throw new Error("RUN_CANCELLED");
    await db.saveAgentRunCheckpoint(run.id, workerId, { phase: "planner.completed", attempt: run.attempt });
    await db.updateTaskStep(task.id, 1, { status: "succeeded", finishedAt: new Date() });
    await db.updateTaskStep(task.id, 2, { status: "succeeded", startedAt: new Date(), finishedAt: new Date() });
    await db.updateTaskStep(task.id, 3, { status: "blocked", errorCode: "ISOLATED_WORKER_NOT_CONFIGURED" });
    await db.updateTaskStep(task.id, 4, { status: "succeeded", finishedAt: new Date() });
    await db.addTaskMessage({ taskId: task.id, role: "assistant", content: JSON.stringify(result) });
    await db.finishAgentRun({ runId: run.id, workerId, status: "succeeded", result: JSON.stringify(result) });
    await db.closeSandboxSession(sessionId, "closed");
    await db.addAuditEvent({ workspaceId: run.workspaceId, taskId: task.id, actorType: "agent", eventType: "agent.run.completed", metadata: { runId: run.id, execution: "control_plane_only", worker: "not_configured" } });
  } catch (error) {
    const cancelled = controller.signal.aborted || error instanceof Error && error.message === "RUN_CANCELLED";
    const message = error instanceof Error ? error.message : "UNKNOWN_RUN_ERROR";
    await db.finishAgentRun({ runId: run.id, workerId, status: cancelled ? "cancelled" : "failed", error: message, retryAt: cancelled ? undefined : backoff(run.attempt) });
    if (sessionId) await db.closeSandboxSession(sessionId, cancelled ? "failed" : "failed");
    await db.addAuditEvent({ workspaceId: run.workspaceId, taskId: run.taskId, actorType: "system", eventType: cancelled ? "agent.run.cancelled" : "agent.run.failed", metadata: { runId: run.id, error: message, attempt: run.attempt } });
  } finally {
    clearInterval(leaseTimer);
    activeControllers.delete(run.id);
  }
  return true;
}

export function startQueueWorker(options: { intervalMs?: number; workerId?: string } = {}) {
  const intervalMs = options.intervalMs ?? 5_000;
  const workerId = options.workerId ?? `studio-worker-${randomUUID()}`;
  let stopped = false;
  const tick = async () => {
    if (stopped) return;
    try {
      while (await processNextAgentRun(workerId)) {
        if (stopped) break;
      }
    } catch (error) {
      console.warn("[Studio Queue] tick failed:", error instanceof Error ? error.message : error);
    }
  };
  const timer = setInterval(() => void tick(), intervalMs);
  void tick();
  return () => {
    stopped = true;
    clearInterval(timer);
    for (const controller of Array.from(activeControllers.values())) controller.abort(new Error("QUEUE_WORKER_STOPPED"));
  };
}

export function getActiveRunCount() {
  return activeControllers.size;
}

export function getActiveRunIds() {
  return Array.from(activeControllers.keys());
}

export function resetActiveRunsForTests() {
  for (const controller of Array.from(activeControllers.values())) controller.abort();
  activeControllers.clear();
}

export const QUEUE_WORKER_ENABLED = process.env.STUDIO_QUEUE_WORKER_ENABLED === "true";
