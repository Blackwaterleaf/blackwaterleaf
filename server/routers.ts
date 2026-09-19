import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { runControlledAgent } from "./agentRunner";
import { abortActiveRun } from "./runWorker";
import { assertTaskTransition, createRunGuard } from "./safety";
import * as db from "./db";

const operatorRoles = new Set(["owner", "admin", "operator"]);
const reviewerRoles = new Set(["owner", "admin", "reviewer"]);

async function requireWorkspace(userId: number) {
  const membership = await db.getWorkspaceForUser(userId);
  if (!membership) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Create a Studio workspace before continuing." });
  }
  return membership;
}

function requireRole(role: string, allowed: Set<string>) {
  if (!allowed.has(role)) throw new TRPCError({ code: "FORBIDDEN", message: "This Studio action is not allowed for your role." });
}

async function sendApprovalPush(tokens: string[], taskTitle: string, approvalId: number) {
  if (tokens.length === 0) return;
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(tokens.map(to => ({ to, title: "Studio-Freigabe erforderlich", body: `${taskTitle} wartet auf deine Bestätigung.`, data: { type: "approval", approvalId }, channelId: "approvals", sound: "default", priority: "high" }))),
    });
  } catch (error) {
    console.warn("[Push] Approval notification failed:", error);
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  studio: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      const membership = await db.getWorkspaceForUser(ctx.user.id);
      if (!membership) {
        return {
          workspace: null,
          membership: null,
          tasks: [],
          approvals: [],
          audit: [],
          execution: { agentControlPlane: "available", isolatedWorker: "not_configured" },
        } as const;
      }
      const tasks = await db.listWorkspaceTasks(membership.workspace.id);
      const taskIds = tasks.map(task => task.id);
      return {
        workspace: membership.workspace,
        membership: membership.membership,
        tasks,
        approvals: await db.listWorkspaceApprovals(taskIds),
        audit: await db.listWorkspaceAudit(membership.workspace.id),
        execution: { agentControlPlane: "available", isolatedWorker: "not_configured" },
      } as const;
    }),

    createWorkspace: protectedProcedure
      .input(z.object({ name: z.string().trim().min(2).max(160) }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getWorkspaceForUser(ctx.user.id);
        if (existing) return existing.workspace;
        const workspace = await db.createWorkspace(ctx.user.id, input.name);
        await db.addAuditEvent({ workspaceId: workspace.id, actorType: "user", actorId: ctx.user.id, eventType: "workspace.created" });
        return workspace;
      }),

    createTask: protectedProcedure
      .input(z.object({ title: z.string().trim().min(2).max(255), goal: z.string().trim().min(10).max(10000), priority: z.enum(["low", "medium", "high"]).default("medium") }))
      .mutation(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        requireRole(membership.membership.role, operatorRoles);
        const taskId = await db.createTask({ workspaceId: membership.workspace.id, createdBy: ctx.user.id, ...input });
        await db.addAuditEvent({ workspaceId: membership.workspace.id, taskId, actorType: "user", actorId: ctx.user.id, eventType: "task.created" });
        return { taskId };
      }),

    runAgent: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        requireRole(membership.membership.role, operatorRoles);
        const task = await db.getTaskForWorkspace(input.taskId, membership.workspace.id);
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Studio task not found." });
        if (!["ready", "failed"].includes(task.status)) throw new TRPCError({ code: "CONFLICT", message: "Task is not ready for a queued agent run." });
        try { assertTaskTransition(task.status, "queued"); } catch { throw new TRPCError({ code: "CONFLICT", message: "Task state does not allow a new queued run." }); }
        let runId: number;
        try {
          runId = await db.enqueueAgentRun({ taskId: task.id, workspaceId: membership.workspace.id, requestedBy: ctx.user.id });
        } catch (error) {
          if (error instanceof Error && error.message === "TASK_QUEUE_CLAIM_FAILED") throw new TRPCError({ code: "CONFLICT", message: "Task was queued by another operator." });
          throw error;
        }
        await db.addAuditEvent({ workspaceId: membership.workspace.id, taskId: task.id, actorType: "user", actorId: ctx.user.id, eventType: "agent.run.queued", metadata: { runId, execution: "control_plane_only", worker: "optional_queue_worker" } });
        return { status: "queued" as const, runId, worker: "not_configured" as const };
      }),

    runStatus: protectedProcedure
      .input(z.object({ runId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        const run = await db.getAgentRunForWorkspace(input.runId, membership.workspace.id);
        if (!run) throw new TRPCError({ code: "NOT_FOUND", message: "Agent run not found." });
        return run;
      }),

    cancelTask: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        requireRole(membership.membership.role, operatorRoles);
        const task = await db.getTaskForWorkspace(input.taskId, membership.workspace.id);
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Studio task not found." });
        if (!["running", "waiting_for_approval", "queued"].includes(task.status)) throw new TRPCError({ code: "CONFLICT", message: "Task cannot be cancelled from its current state." });
        const latestRun = await db.getLatestAgentRunForTask(task.id, membership.workspace.id);
        if (latestRun && ["queued", "running"].includes(latestRun.status)) {
          await db.requestAgentRunCancellation(latestRun.id, membership.workspace.id, "Cancelled by task kill-switch");
          abortActiveRun(latestRun.id);
        }
        await db.updateTask(task.id, { cancelRequested: true, status: "cancelled", finishedAt: new Date() });
        await db.addAuditEvent({ workspaceId: membership.workspace.id, taskId: task.id, actorType: "user", actorId: ctx.user.id, eventType: "task.cancelled", metadata: { killSwitch: true } });
        return { success: true as const };
      }),

    cancelRun: protectedProcedure
      .input(z.object({ runId: z.number().int().positive(), reason: z.string().trim().min(2).max(500).default("Cancelled by operator") }))
      .mutation(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        requireRole(membership.membership.role, operatorRoles);
        const run = await db.getAgentRunForWorkspace(input.runId, membership.workspace.id);
        if (!run) throw new TRPCError({ code: "NOT_FOUND", message: "Agent run not found." });
        const cancelled = await db.requestAgentRunCancellation(input.runId, membership.workspace.id, input.reason);
        if (!cancelled) throw new TRPCError({ code: "CONFLICT", message: "Run is already finished or was changed concurrently." });
        abortActiveRun(input.runId);
        await db.addAuditEvent({ workspaceId: membership.workspace.id, taskId: run.taskId, actorType: "user", actorId: ctx.user.id, eventType: "agent.run.cancelled", metadata: { runId: input.runId, killSwitch: true, reason: input.reason } });
        return { success: true as const, runId: input.runId };
      }),

    requestApproval: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive(), actionType: z.enum(["file_read", "network_access", "sandbox_execute", "publish", "delete", "role_change"]), resourceScope: z.string().min(1).max(2000), riskSummary: z.string().min(1).max(2000) }))
      .mutation(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        requireRole(membership.membership.role, operatorRoles);
        const task = await db.getTaskForWorkspace(input.taskId, membership.workspace.id);
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Studio task not found." });
        const approvalId = await db.createApproval({ ...input, requestedBy: ctx.user.id, expiresAt: new Date(Date.now() + 30 * 60 * 1000) });
        await db.updateTask(task.id, { status: "waiting_for_approval" });
        await db.addAuditEvent({ workspaceId: membership.workspace.id, taskId: task.id, actorType: "user", actorId: ctx.user.id, eventType: "approval.requested", metadata: { approvalId, actionType: input.actionType } });
        const reviewerIds = await db.listWorkspaceReviewerIds(membership.workspace.id);
        const devices = await db.listActiveMobilePushTokens(reviewerIds);
        void sendApprovalPush(devices.map(device => device.expoPushToken), task.title, approvalId);
        return { approvalId };
      }),

    pendingApprovals: protectedProcedure.query(async ({ ctx }) => {
      const membership = await requireWorkspace(ctx.user.id);
      requireRole(membership.membership.role, reviewerRoles);
      const tasks = await db.listWorkspaceTasks(membership.workspace.id);
      return db.listPendingWorkspaceApprovals(tasks.map(task => task.id));
    }),

    registerMobileDevice: protectedProcedure
      .input(z.object({ expoPushToken: z.string().min(10).max(255), platform: z.enum(["android", "ios", "web"]) }))
      .mutation(async ({ ctx, input }) => db.registerMobileDevice({ userId: ctx.user.id, ...input })),

    decideApproval: protectedProcedure
      .input(z.object({ approvalId: z.number().int().positive(), decision: z.enum(["approved", "denied"]), reason: z.string().max(1000).optional() }))
      .mutation(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        requireRole(membership.membership.role, reviewerRoles);
        const approval = await db.getApprovalForWorkspace(input.approvalId, membership.workspace.id);
        if (!approval) throw new TRPCError({ code: "NOT_FOUND", message: "Approval request not found in this workspace." });
        if (approval.status !== "pending") throw new TRPCError({ code: "CONFLICT", message: "Approval request is no longer pending." });
        await db.decideApproval({ ...input, userId: ctx.user.id });
        await db.addAuditEvent({ workspaceId: membership.workspace.id, taskId: approval.taskId, actorType: "user", actorId: ctx.user.id, eventType: `approval.${input.decision}`, metadata: { approvalId: input.approvalId } });
        return { success: true as const };
      }),

    taskDetail: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        const task = await db.getTaskForWorkspace(input.taskId, membership.workspace.id);
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Studio task not found." });
        return { task, steps: await db.listTaskSteps(task.id), messages: await db.listTaskMessages(task.id) };
      }),

    evidencePack: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        const evidence = await db.getTaskEvidence(input.taskId, membership.workspace.id);
        if (!evidence) throw new TRPCError({ code: "NOT_FOUND", message: "Evidence pack task not found." });
        return { ...evidence, generatedAt: new Date() };
      }),
  }),
});

export type AppRouter = typeof appRouter;
