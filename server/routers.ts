import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { ENV } from "./_core/env";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { runControlledAgent } from "./agentRunner";
import { abortActiveRun } from "./runWorker";
import { assertTaskTransition, createRunGuard } from "./safety";
import { CAPABILITY_REGISTRY, evaluatePolicy, hashArtifactBytes, sanitizeResourceScope } from "./policy";
import { getKimiProviderStatus } from "./kimiGateway";
import { getIonosReadiness, runIonosPreflight } from "./ionosGateway";
import { getResendStatus } from "./resendGateway";
import { getRunwayStatus } from "./runwayGateway";
import { estimateVideoCost, getPlanLimits, STUDIO_PRICING } from "./pricing";
import { SANDBOX_PHASE_STATUS, validateSandboxSpec } from "./sandboxContract";
import { storagePut } from "./storage";
import * as db from "./db";
import { issueMagicLink, LOCAL_SESSION_COOKIE, revokeLocalSession } from "./_core/localAuth";
import { PROJECT_TEMPLATES } from "./projectTemplates";

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
    requestMagicLink: publicProcedure
      .input(z.object({ email: z.string().trim().email().max(320) }))
      .mutation(async ({ input }) => {
        try {
          await issueMagicLink(input.email);
          return { sent: true as const };
        } catch (error) {
          if (error instanceof Error && error.message === "LOCAL_AUTH_DISABLED") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Lokale Studio-Anmeldung ist noch nicht aktiviert." });
          if (error instanceof Error && error.message === "LOCAL_AUTH_EMAIL_NOT_CONFIGURED") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Resend ist für lokale Anmeldung noch nicht vollständig konfiguriert." });
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Login-Link konnte nicht versendet werden." });
        }
      }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      await revokeLocalSession(ctx.req).catch(() => undefined);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(LOCAL_SESSION_COOKIE, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  studio: router({
    templates: protectedProcedure.query(() => PROJECT_TEMPLATES.map(({ id, name, description, target, defaultPlatforms }) => ({ id, name, description, target, defaultPlatforms }))),
    overview: protectedProcedure.query(async ({ ctx }) => {
      const membership = await db.getWorkspaceForUser(ctx.user.id);
      if (!membership) {
        return {
          workspace: null,
          membership: null,
          tasks: [],
          approvals: [],
          audit: [],
          execution: { agentControlPlane: "available", isolatedWorker: SANDBOX_PHASE_STATUS.executionPlane, kimi: getKimiProviderStatus().reason, ionos: getIonosReadiness() },
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
        execution: { agentControlPlane: "available", isolatedWorker: SANDBOX_PHASE_STATUS.executionPlane, kimi: getKimiProviderStatus().reason, ionos: getIonosReadiness() },
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

    projects: protectedProcedure.query(async ({ ctx }) => {
      const membership = await requireWorkspace(ctx.user.id);
      return db.listWorkspaceProjects(membership.workspace.id);
    }),

    createProject: protectedProcedure
      .input(z.object({ name: z.string().trim().min(2).max(160), target: z.enum(["web", "web_native"]), templateId: z.string().trim().max(80).optional(), brief: z.string().trim().min(20).max(12000), targetUsers: z.string().trim().min(3).max(2000), platforms: z.string().trim().min(2).max(500), dataSensitivity: z.enum(["public", "internal", "confidential", "regulated"]), integrations: z.string().trim().max(2000), deliveryScope: z.string().trim().min(3).max(3000), budgetCents: z.number().int().min(0).max(100000000) }))
      .mutation(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        requireRole(membership.membership.role, operatorRoles);
        const limits = getPlanLimits(membership.workspace.plan);
        if ((await db.countWorkspaceProjects(membership.workspace.id)) >= limits.maxProjects) throw new TRPCError({ code: "FORBIDDEN", message: `Dein ${membership.workspace.plan}-Tarif erlaubt maximal ${limits.maxProjects} aktive Projekte.` });
        const project = await db.createStudioProject({ workspaceId: membership.workspace.id, createdBy: ctx.user.id, ...input });
        await db.addAuditEvent({ workspaceId: membership.workspace.id, actorType: "user", actorId: ctx.user.id, eventType: "project.created", metadata: { projectId: project.id, target: input.target } });
        return project;
      }),

    projectWorkspace: protectedProcedure
      .input(z.object({ projectId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        const project = await db.getProjectForWorkspace(input.projectId, membership.workspace.id);
        if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project is outside this workspace." });
        return { project, brief: await db.getProjectBrief(project.id), plan: await db.getLatestProjectPlan(project.id), files: await db.listProjectFiles(project.id), changes: await db.listProjectChanges(project.id), environments: await db.listProjectEnvironments(project.id), environmentApproval: await db.getEnvironmentApproval(project.id, "preview") };
      }),

    saveProjectFile: protectedProcedure
      .input(z.object({ projectId: z.number().int().positive(), path: z.string().trim().min(1).max(500), content: z.string().max(300000) }))
      .mutation(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        requireRole(membership.membership.role, operatorRoles);
        if (input.path.startsWith("/") || input.path.split("/").includes("..") || input.path.includes("\\")) throw new TRPCError({ code: "BAD_REQUEST", message: "Project paths must stay inside the workspace." });
        const project = await db.getProjectForWorkspace(input.projectId, membership.workspace.id);
        if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project is outside this workspace." });
        const saved = await db.upsertProjectFile({ projectId: project.id, path: input.path, content: input.content, updatedBy: ctx.user.id });
        await db.addAuditEvent({ workspaceId: membership.workspace.id, actorType: "user", actorId: ctx.user.id, eventType: "project.file.saved", metadata: { projectId: project.id, path: input.path, contentHash: saved.contentHash, version: saved.version } });
        return saved;
      }),

    readProjectFile: protectedProcedure
      .input(z.object({ projectId: z.number().int().positive(), path: z.string().trim().min(1).max(500) }))
      .query(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        const project = await db.getProjectForWorkspace(input.projectId, membership.workspace.id);
        if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project is outside this workspace." });
        const file = await db.getProjectFile(project.id, input.path);
        if (!file) throw new TRPCError({ code: "NOT_FOUND", message: "Project file not found." });
        return file;
      }),

    createDraftPatch: protectedProcedure
      .input(z.object({ projectId: z.number().int().positive(), summary: z.string().trim().min(3).max(500), patch: z.string().min(1).max(500000) }))
      .mutation(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        requireRole(membership.membership.role, operatorRoles);
        const project = await db.getProjectForWorkspace(input.projectId, membership.workspace.id);
        if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project is outside this workspace." });
        const changeId = await db.createProjectChange({ projectId: project.id, createdBy: ctx.user.id, kind: "draft_patch", summary: input.summary, patch: input.patch });
        await db.addAuditEvent({ workspaceId: membership.workspace.id, actorType: "user", actorId: ctx.user.id, eventType: "project.patch.created", metadata: { projectId: project.id, changeId } });
        return { changeId, status: "draft" as const };
      }),

    requestPreview: protectedProcedure
      .input(z.object({ projectId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        requireRole(membership.membership.role, operatorRoles);
        const project = await db.getProjectForWorkspace(input.projectId, membership.workspace.id);
        if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project is outside this workspace." });
        await db.updateProjectEnvironment(project.id, "preview", { status: "awaiting_approval", buildSha: `draft-${Date.now().toString(36)}`, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
        const approvalId = await db.createEnvironmentApproval({ projectId: project.id, environment: "preview", requestedBy: ctx.user.id, expiresAt: new Date(Date.now() + 30 * 60 * 1000) });
        await db.addAuditEvent({ workspaceId: membership.workspace.id, actorType: "user", actorId: ctx.user.id, eventType: "project.preview.requested", metadata: { projectId: project.id, approvalId, execution: "not_configured" } });
        return { status: "awaiting_approval" as const, approvalId, execution: "not_configured" as const };
      }),

    decideEnvironmentApproval: protectedProcedure
      .input(z.object({ approvalId: z.number().int().positive(), projectId: z.number().int().positive(), decision: z.enum(["approved", "denied"]), reason: z.string().max(1000).optional() }))
      .mutation(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        requireRole(membership.membership.role, reviewerRoles);
        const project = await db.getProjectForWorkspace(input.projectId, membership.workspace.id);
        if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project is outside this workspace." });
        await db.decideEnvironmentApproval(input.approvalId, ctx.user.id, input.decision, input.reason);
        await db.updateProjectEnvironment(project.id, "preview", { status: input.decision === "approved" ? "ready" : "blocked", approvedBy: input.decision === "approved" ? ctx.user.id : null });
        await db.addAuditEvent({ workspaceId: membership.workspace.id, actorType: "user", actorId: ctx.user.id, eventType: `project.preview.${input.decision}`, metadata: { projectId: project.id, approvalId: input.approvalId } });
        return { success: true as const };
      }),

    promoteProjectToStaging: protectedProcedure
      .input(z.object({ projectId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        requireRole(membership.membership.role, reviewerRoles);
        const project = await db.getProjectForWorkspace(input.projectId, membership.workspace.id);
        if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project is outside this workspace." });
        const approval = await db.getEnvironmentApproval(project.id, "preview");
        if (!approval || approval.status !== "approved") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Preview approval is required before staging promotion." });
        await db.updateProjectEnvironment(project.id, "staging", { status: "blocked" });
        await db.addAuditEvent({ workspaceId: membership.workspace.id, actorType: "user", actorId: ctx.user.id, eventType: "project.staging.requested", metadata: { projectId: project.id, execution: "not_configured" } });
        return { status: "blocked" as const, execution: "not_configured" as const };
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
        const limits = getPlanLimits(membership.workspace.plan);
        if ((await db.countActiveWorkspaceRuns(membership.workspace.id)) >= limits.maxActiveRuns) throw new TRPCError({ code: "FORBIDDEN", message: `Dein ${membership.workspace.plan}-Tarif erlaubt maximal ${limits.maxActiveRuns} aktive Agent-Runs.` });
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

    capabilityPolicy: protectedProcedure
      .input(z.object({ capability: z.enum(["agent.plan", "artifact.read", "artifact.write", "network.request", "secret.use", "sandbox.execute", "publish", "role.change"]), taskId: z.number().int().positive().optional(), approvalStatus: z.enum(["pending", "approved", "denied", "expired", "cancelled"]).optional(), resourceScope: z.string().max(2000).optional(), networkEnabled: z.boolean().optional(), secretName: z.string().max(120).optional() }))
      .query(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        if (input.taskId) {
          const task = await db.getTaskForWorkspace(input.taskId, membership.workspace.id);
          if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Task is outside this workspace." });
        }
        return { decision: evaluatePolicy({ ...input, workspaceId: membership.workspace.id, resourceScope: input.resourceScope ? sanitizeResourceScope(input.resourceScope) : undefined }), registry: CAPABILITY_REGISTRY };
      }),

    runtimeStatus: protectedProcedure.query(async ({ ctx }) => {
      await requireWorkspace(ctx.user.id);
      return { sandbox: SANDBOX_PHASE_STATUS, builtin: { configured: Boolean(ENV.forgeApiUrl && ENV.forgeApiKey), provider: "manus_builtin" as const, reason: ENV.forgeApiUrl && ENV.forgeApiKey ? "ready_for_server_side_use" as const : "missing_builtin_configuration" as const }, kimi: getKimiProviderStatus(), ionos: getIonosReadiness(), resend: getResendStatus(), runway: getRunwayStatus(), capabilities: CAPABILITY_REGISTRY };
    }),

    adminBusinessMetrics: protectedProcedure.query(async ({ ctx }) => {
      const membership = await requireWorkspace(ctx.user.id);
      requireRole(membership.membership.role, new Set(["owner", "admin"]));
      const metrics = await db.getAdminBusinessMetrics();
      const monthlyRevenueCents = metrics.planCounts.creator * 1490 + metrics.planCounts.studio * 3990 + metrics.planCounts.enterprise * 14900;
      return { ...metrics, monthlyRevenueCents, currency: "EUR" as const };
    }),

    ionosPreflight: protectedProcedure.query(async ({ ctx }) => {
      const membership = await requireWorkspace(ctx.user.id);
      requireRole(membership.membership.role, operatorRoles);
      return runIonosPreflight();
    }),

    pricing: protectedProcedure.query(async ({ ctx }) => {
      await requireWorkspace(ctx.user.id);
      return STUDIO_PRICING;
    }),

    videoEstimate: protectedProcedure
      .input(z.object({ durationSeconds: z.number().int().min(1).max(1800), quality: z.enum(["draft", "standard", "high"]), voice: z.enum(["none", "synthetic", "premium"]), music: z.boolean(), clips: z.number().int().min(1).max(30).optional() }))
      .query(async ({ ctx, input }) => {
        await requireWorkspace(ctx.user.id);
        return estimateVideoCost(input);
      }),

    createVideoJob: protectedProcedure
      .input(z.object({ durationSeconds: z.number().int().min(1).max(1800), quality: z.enum(["draft", "standard", "high"]), voice: z.enum(["none", "synthetic", "premium"]), music: z.boolean(), clips: z.number().int().min(1).max(30).default(1) }))
      .mutation(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        requireRole(membership.membership.role, operatorRoles);
        const estimate = estimateVideoCost(input);
        const jobId = await db.createVideoJob({ workspaceId: membership.workspace.id, createdBy: ctx.user.id, ...input, estimatedCredits: estimate.credits, estimatedCostCents: estimate.estimatedEurCents });
        const provider = getRunwayStatus().configured ? "runway" : "runway_not_configured";
        await db.addAuditEvent({ workspaceId: membership.workspace.id, actorType: "user", actorId: ctx.user.id, eventType: "video.job.estimated", metadata: { jobId, credits: estimate.credits, costCents: estimate.estimatedEurCents, provider } });
        return { jobId, status: "awaiting_approval" as const, estimate, provider };
      }),

    videoJobs: protectedProcedure.query(async ({ ctx }) => {
      const membership = await requireWorkspace(ctx.user.id);
      return db.listWorkspaceVideoJobs(membership.workspace.id);
    }),

    usage: protectedProcedure.query(async ({ ctx }) => {
      const membership = await requireWorkspace(ctx.user.id);
      return db.listWorkspaceUsage(membership.workspace.id);
    }),

    uploadArtifact: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive().optional(), fileName: z.string().trim().min(1).max(255), mediaType: z.enum(["text/plain", "text/markdown", "application/json", "application/pdf", "image/png", "image/jpeg", "audio/mpeg", "video/mp4"]), dataBase64: z.string().max(15_000_000), sha256: z.string().regex(/^[a-f0-9]{64}$/i).optional(), purpose: z.enum(["input", "output", "intermediate"]).default("input") }))
      .mutation(async ({ ctx, input }) => {
        const membership = await requireWorkspace(ctx.user.id);
        requireRole(membership.membership.role, operatorRoles);
        if (input.taskId && !(await db.getTaskForWorkspace(input.taskId, membership.workspace.id))) throw new TRPCError({ code: "NOT_FOUND", message: "Task is outside this workspace." });
        const bytes = Buffer.from(input.dataBase64, "base64");
        if (bytes.length === 0 || bytes.length > 10 * 1024 * 1024) throw new TRPCError({ code: "BAD_REQUEST", message: "Artifact must be between 1 byte and 10 MiB." });
        const sha256 = hashArtifactBytes(bytes);
        if (input.sha256 && input.sha256.toLowerCase() !== sha256) throw new TRPCError({ code: "BAD_REQUEST", message: "Artifact checksum mismatch." });
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const stored = await storagePut(`studio/${membership.workspace.id}/artifacts/${safeName}`, bytes, input.mediaType);
        const artifactId = await db.createArtifact({ workspaceId: membership.workspace.id, taskId: input.taskId, storageKey: stored.key, fileName: safeName, mediaType: input.mediaType, sizeBytes: bytes.length, sha256, purpose: input.purpose, createdBy: ctx.user.id });
        await db.addAuditEvent({ workspaceId: membership.workspace.id, taskId: input.taskId, actorType: "user", actorId: ctx.user.id, eventType: "artifact.uploaded", metadata: { artifactId, sha256, sizeBytes: bytes.length, mediaType: input.mediaType } });
        return { artifactId, sha256, sizeBytes: bytes.length, url: stored.url };
      }),

    artifacts: protectedProcedure.query(async ({ ctx }) => {
      const membership = await requireWorkspace(ctx.user.id);
      return db.listWorkspaceArtifacts(membership.workspace.id);
    }),

    validateSandbox: protectedProcedure
      .input(z.unknown())
      .query(({ input }) => {
        try { return { valid: true as const, spec: validateSandboxSpec(input) }; }
        catch (error) { return { valid: false as const, reason: error instanceof Error ? error.message : "SANDBOX_SPEC_INVALID" }; }
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
