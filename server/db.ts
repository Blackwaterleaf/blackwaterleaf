import { createHash } from "node:crypto";
import { and, desc, eq, gt, inArray, isNull, lt, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  agentRuns,
  mobileDevices,
  approvalDecisions,
  approvalRequests,
  artifacts,
  auditEvents,
  projectChanges,
  projectEnvironments,
  projectFiles,
  projectBriefs,
  projectPlans,
  projectEnvironmentApprovals,
  studioProjects,
  sandboxSessions,
  taskMessages,
  taskSteps,
  tasks,
  users,
  workspaceMemberships,
  workspaces,
  usageLedger,
  videoJobs,
  authChallenges,
  authSessions,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { hashEvidence } from "./safety";
import { getProjectTemplate } from "./projectTemplates";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Studio database is not available");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  updateSet.lastSignedIn ??= new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function createAuthChallenge(input: { email: string; tokenHash: string; expiresAt: Date }) {
  const db = await requireDb();
  await db.update(authChallenges).set({ usedAt: new Date() }).where(and(eq(authChallenges.email, input.email), isNull(authChallenges.usedAt)));
  const result = await db.insert(authChallenges).values(input);
  return Number(result[0].insertId);
}

export async function consumeAuthChallenge(input: { email: string; tokenHash: string }) {
  const db = await requireDb();
  const now = new Date();
  const rows = await db.select().from(authChallenges).where(and(eq(authChallenges.email, input.email), eq(authChallenges.tokenHash, input.tokenHash), isNull(authChallenges.usedAt), gt(authChallenges.expiresAt, now))).limit(1);
  const challenge = rows[0];
  if (!challenge) return false;
  const result = await db.update(authChallenges).set({ usedAt: now }).where(and(eq(authChallenges.id, challenge.id), isNull(authChallenges.usedAt)));
  return Number(result[0].affectedRows ?? 0) === 1;
}

export async function hasLocalUsers() {
  const db = await requireDb();
  const rows = await db.select({ id: users.id }).from(users).where(sql`${users.openId} like 'local:%'`).limit(1);
  return rows.length > 0;
}

export async function createOrGetLocalUser(email: string, role: "user" | "admin" = "user") {
  const openId = `local:${email}`;
  await upsertUser({ openId, email, name: email.split("@")[0], loginMethod: "magic_link", role, lastSignedIn: new Date() });
  return await getUserByOpenId(openId);
}

export async function getLocalUserByEmail(email: string) {
  const db = await requireDb();
  const rows = await db.select().from(users).where(and(eq(users.email, email), sql`${users.openId} like 'local:%'`)).limit(1);
  return rows[0];
}

export async function createLocalPasswordUser(input: { email: string; passwordHash: string; role: "user" | "admin" }) {
  const openId = `local:${input.email}`;
  await upsertUser({ openId, email: input.email, name: input.email.split("@")[0], loginMethod: "password", role: input.role, lastSignedIn: new Date(), passwordHash: input.passwordHash });
  return getUserByOpenId(openId);
}

export async function setLocalPassword(userId: number, passwordHash: string) {
  const db = await requireDb();
  await db.update(users).set({ passwordHash, loginMethod: "password", lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function getAdminBusinessMetrics() {
  const db = await requireDb();
  const [userRows, workspaceRows] = await Promise.all([
    db.select({ id: users.id }).from(users),
    db.select({ plan: workspaces.plan, status: workspaces.status }).from(workspaces),
  ]);
  const planCounts = { free: 0, creator: 0, studio: 0, enterprise: 0 };
  for (const row of workspaceRows) if (row.status === "active") planCounts[row.plan] += 1;
  return { totalUsers: userRows.length, activeWorkspaces: workspaceRows.filter(row => row.status === "active").length, planCounts };
}

export async function createAuthSession(input: { userId: number; sessionHash: string; expiresAt: Date }) {
  const db = await requireDb();
  await db.insert(authSessions).values(input);
}

export async function getUserBySessionHash(sessionHash: string) {
  const db = await requireDb();
  const rows = await db.select({ user: users }).from(authSessions).innerJoin(users, eq(authSessions.userId, users.id)).where(and(eq(authSessions.sessionHash, sessionHash), gt(authSessions.expiresAt, new Date()))).limit(1);
  return rows[0]?.user;
}

export async function revokeAuthSession(sessionHash: string) {
  const db = await requireDb();
  await db.delete(authSessions).where(eq(authSessions.sessionHash, sessionHash));
}

export async function registerMobileDevice(input: { userId: number; expoPushToken: string; platform: "android" | "ios" | "web" }) {
  const db = await requireDb();
  await db.insert(mobileDevices).values({ ...input, status: "active", lastSeenAt: new Date() }).onDuplicateKeyUpdate({ set: { userId: input.userId, platform: input.platform, status: "active", lastSeenAt: new Date() } });
  return { success: true as const };
}

export async function listActiveMobilePushTokens(userIds: number[]) {
  if (userIds.length === 0) return [];
  const db = await requireDb();
  return db.select({ userId: mobileDevices.userId, expoPushToken: mobileDevices.expoPushToken }).from(mobileDevices).where(and(inArray(mobileDevices.userId, userIds), eq(mobileDevices.status, "active")));
}

export async function listWorkspaceReviewerIds(workspaceId: number) {
  const db = await requireDb();
  const rows = await db.select({ userId: workspaceMemberships.userId }).from(workspaceMemberships).where(and(eq(workspaceMemberships.workspaceId, workspaceId), eq(workspaceMemberships.status, "active"), inArray(workspaceMemberships.role, ["owner", "admin", "reviewer"])));
  return rows.map(row => row.userId);
}

export async function getWorkspaceForUser(userId: number) {
  const db = await requireDb();
  const result = await db
    .select({ workspace: workspaces, membership: workspaceMemberships })
    .from(workspaceMemberships)
    .innerJoin(workspaces, eq(workspaceMemberships.workspaceId, workspaces.id))
    .where(and(eq(workspaceMemberships.userId, userId), eq(workspaceMemberships.status, "active")))
    .orderBy(desc(workspaces.updatedAt))
    .limit(1);
  return result[0];
}

export async function getWorkspaceMembership(userId: number, workspaceId: number) {
  const db = await requireDb();
  const result = await db
    .select()
    .from(workspaceMemberships)
    .where(
      and(
        eq(workspaceMemberships.userId, userId),
        eq(workspaceMemberships.workspaceId, workspaceId),
        eq(workspaceMemberships.status, "active"),
      ),
    )
    .limit(1);
  return result[0];
}

export async function createWorkspace(userId: number, name: string) {
  const db = await requireDb();
  const result = await db.insert(workspaces).values({ ownerId: userId, name });
  const workspaceId = Number(result[0].insertId);
  await db.insert(workspaceMemberships).values({ workspaceId, userId, role: "owner", grantedBy: userId });
  return { id: workspaceId, name };
}

function projectSlug(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 160) || "studio-project";
}

export async function createStudioProject(input: { workspaceId: number; createdBy: number; name: string; target: "web" | "web_native"; templateId?: string; brief: string; targetUsers: string; platforms: string; dataSensitivity: "public" | "internal" | "confidential" | "regulated"; integrations: string; deliveryScope: string; budgetCents: number }) {
  const db = await requireDb();
  const slug = `${projectSlug(input.name)}-${Date.now().toString(36)}`;
  const result = await db.insert(studioProjects).values({ workspaceId: input.workspaceId, createdBy: input.createdBy, name: input.name, target: input.target, brief: input.brief, slug, status: "active", defaultBranch: "main" });
  const projectId = Number(result[0].insertId);
  await db.insert(projectBriefs).values({ projectId, targetUsers: input.targetUsers, platforms: input.platforms, dataSensitivity: input.dataSensitivity, integrations: input.integrations, deliveryScope: input.deliveryScope, budgetCents: input.budgetCents });
  await db.insert(projectPlans).values({ projectId, requirements: input.brief, architecture: input.target === "web_native" ? "Web client plus separate Expo/React Native client with shared contracts." : "Responsive web client with managed backend services.", testPlan: "Typecheck, unit tests, build, preview smoke tests, then bounded browser E2E.", risks: input.dataSensitivity === "regulated" ? "Regulated data requires explicit compliance and residency review." : "Sandbox execution and external integrations remain approval-gated.", estimatedBudgetCents: input.budgetCents });
  await db.insert(projectEnvironments).values([
    { projectId, environment: "preview", status: "not_ready" },
    { projectId, environment: "staging", status: "blocked" },
  ]);
  const template = getProjectTemplate(input.templateId, input.target);
  for (const file of template.files) {
    const contentHash = createHash("sha256").update(file.content).digest("hex");
    await db.insert(projectFiles).values({ projectId, path: file.path, content: file.content, contentHash, version: 1, updatedBy: input.createdBy });
  }
  return { id: projectId, slug };
}

export async function listWorkspaceProjects(workspaceId: number) {
  const db = await requireDb();
  return db.select().from(studioProjects).where(eq(studioProjects.workspaceId, workspaceId)).orderBy(desc(studioProjects.updatedAt));
}

export async function countWorkspaceProjects(workspaceId: number) {
  const db = await requireDb();
  const rows = await db.select({ count: sql<number>`count(*)` }).from(studioProjects).where(and(eq(studioProjects.workspaceId, workspaceId), eq(studioProjects.status, "active")));
  return Number(rows[0]?.count ?? 0);
}

export async function countActiveWorkspaceRuns(workspaceId: number) {
  const db = await requireDb();
  const rows = await db.select({ count: sql<number>`count(*)` }).from(agentRuns).where(and(eq(agentRuns.workspaceId, workspaceId), inArray(agentRuns.status, ["queued", "running"])));
  return Number(rows[0]?.count ?? 0);
}

export async function getProjectBrief(projectId: number) {
  const db = await requireDb();
  const rows = await db.select().from(projectBriefs).where(eq(projectBriefs.projectId, projectId)).limit(1);
  return rows[0];
}

export async function getLatestProjectPlan(projectId: number) {
  const db = await requireDb();
  const rows = await db.select().from(projectPlans).where(eq(projectPlans.projectId, projectId)).orderBy(desc(projectPlans.version)).limit(1);
  return rows[0];
}

export async function createEnvironmentApproval(input: { projectId: number; environment: "preview" | "staging"; requestedBy: number; expiresAt: Date }) {
  const db = await requireDb();
  const result = await db.insert(projectEnvironmentApprovals).values({ ...input, status: "pending" });
  return Number(result[0].insertId);
}

export async function getEnvironmentApproval(projectId: number, environment: "preview" | "staging") {
  const db = await requireDb();
  const rows = await db.select().from(projectEnvironmentApprovals).where(and(eq(projectEnvironmentApprovals.projectId, projectId), eq(projectEnvironmentApprovals.environment, environment))).orderBy(desc(projectEnvironmentApprovals.createdAt)).limit(1);
  return rows[0];
}

export async function decideEnvironmentApproval(id: number, decidedBy: number, status: "approved" | "denied", reason?: string) {
  const db = await requireDb();
  await db.update(projectEnvironmentApprovals).set({ status, decidedBy, reason, decidedAt: new Date() }).where(and(eq(projectEnvironmentApprovals.id, id), eq(projectEnvironmentApprovals.status, "pending")));
}

export async function getProjectForWorkspace(projectId: number, workspaceId: number) {
  const db = await requireDb();
  const rows = await db.select().from(studioProjects).where(and(eq(studioProjects.id, projectId), eq(studioProjects.workspaceId, workspaceId))).limit(1);
  return rows[0];
}

export async function listProjectFiles(projectId: number) {
  const db = await requireDb();
  return db.select({ id: projectFiles.id, path: projectFiles.path, contentHash: projectFiles.contentHash, version: projectFiles.version, updatedBy: projectFiles.updatedBy, updatedAt: projectFiles.updatedAt }).from(projectFiles).where(eq(projectFiles.projectId, projectId)).orderBy(projectFiles.path);
}

export async function getProjectFile(projectId: number, path: string) {
  const db = await requireDb();
  const rows = await db.select().from(projectFiles).where(and(eq(projectFiles.projectId, projectId), eq(projectFiles.path, path))).limit(1);
  return rows[0];
}

export async function upsertProjectFile(input: { projectId: number; path: string; content: string; updatedBy: number }) {
  const db = await requireDb();
  const contentHash = createHash("sha256").update(input.content).digest("hex");
  const current = await getProjectFile(input.projectId, input.path);
  if (current) {
    await db.update(projectFiles).set({ content: input.content, contentHash, version: current.version + 1, updatedBy: input.updatedBy }).where(eq(projectFiles.id, current.id));
    return { id: current.id, version: current.version + 1, contentHash };
  }
  const result = await db.insert(projectFiles).values({ ...input, contentHash, version: 1 });
  return { id: Number(result[0].insertId), version: 1, contentHash };
}

export async function createProjectChange(input: { projectId: number; createdBy: number; kind: "draft_patch" | "commit" | "revert"; summary: string; patch: string }) {
  const db = await requireDb();
  const result = await db.insert(projectChanges).values({ ...input, status: "draft" });
  return Number(result[0].insertId);
}

export async function listProjectChanges(projectId: number) {
  const db = await requireDb();
  return db.select().from(projectChanges).where(eq(projectChanges.projectId, projectId)).orderBy(desc(projectChanges.createdAt)).limit(50);
}

export async function listProjectEnvironments(projectId: number) {
  const db = await requireDb();
  return db.select().from(projectEnvironments).where(eq(projectEnvironments.projectId, projectId)).orderBy(projectEnvironments.environment);
}

export async function updateProjectEnvironment(projectId: number, environment: "preview" | "staging", values: Partial<typeof projectEnvironments.$inferInsert>) {
  const db = await requireDb();
  await db.update(projectEnvironments).set(values).where(and(eq(projectEnvironments.projectId, projectId), eq(projectEnvironments.environment, environment)));
}

export async function listWorkspaceTasks(workspaceId: number) {
  const db = await requireDb();
  return db.select().from(tasks).where(eq(tasks.workspaceId, workspaceId)).orderBy(desc(tasks.updatedAt)).limit(25);
}

export async function listWorkspaceAudit(workspaceId: number) {
  const db = await requireDb();
  return db.select().from(auditEvents).where(eq(auditEvents.workspaceId, workspaceId)).orderBy(desc(auditEvents.createdAt)).limit(25);
}

export async function listWorkspaceApprovals(taskIds: number[]) {
  if (taskIds.length === 0) return [];
  const db = await requireDb();
  return db
    .select()
    .from(approvalRequests)
    .where(inArray(approvalRequests.taskId, taskIds))
    .orderBy(desc(approvalRequests.createdAt))
    .limit(100);
}

export async function listPendingWorkspaceApprovals(taskIds: number[]) {
  if (taskIds.length === 0) return [];
  const db = await requireDb();
  return db.select().from(approvalRequests).where(and(inArray(approvalRequests.taskId, taskIds), eq(approvalRequests.status, "pending"))).orderBy(desc(approvalRequests.createdAt)).limit(100);
}

export async function listTaskSteps(taskId: number) {
  const db = await requireDb();
  return db.select().from(taskSteps).where(eq(taskSteps.taskId, taskId)).orderBy(taskSteps.sequence);
}

export async function listTaskMessages(taskId: number) {
  const db = await requireDb();
  return db.select().from(taskMessages).where(eq(taskMessages.taskId, taskId)).orderBy(taskMessages.createdAt);
}

export async function getTaskForWorkspace(taskId: number, workspaceId: number) {
  const db = await requireDb();
  const result = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)))
    .limit(1);
  return result[0];
}

export async function addAuditEvent(input: {
  workspaceId: number;
  taskId?: number;
  actorType: "user" | "system" | "agent";
  actorId?: number;
  eventType: string;
  metadata?: Record<string, unknown>;
}) {
  const db = await requireDb();
  const createdAt = new Date();
  const previous = await db.select({ eventHash: auditEvents.eventHash }).from(auditEvents).where(eq(auditEvents.workspaceId, input.workspaceId)).orderBy(desc(auditEvents.id)).limit(1);
  const previousHash = previous[0]?.eventHash ?? "GENESIS";
  const metadata = input.metadata ? JSON.stringify(input.metadata) : undefined;
  const eventHash = hashEvidence(JSON.stringify({ workspaceId: input.workspaceId, taskId: input.taskId ?? null, actorType: input.actorType, actorId: input.actorId ?? null, eventType: input.eventType, metadata: metadata ?? null, previousHash, createdAt: createdAt.toISOString() }));
  await db.insert(auditEvents).values({
    workspaceId: input.workspaceId,
    taskId: input.taskId,
    actorType: input.actorType,
    actorId: input.actorId,
    eventType: input.eventType,
    metadata,
    previousHash,
    eventHash,
    createdAt,
  });
}

export async function createTask(input: { workspaceId: number; createdBy: number; title: string; goal: string; priority: "low" | "medium" | "high" }) {
  const db = await requireDb();
  const result = await db.insert(tasks).values({ ...input, status: "ready" });
  const taskId = Number(result[0].insertId);
  await db.insert(taskSteps).values([
    { taskId, sequence: 1, kind: "planning", title: "Controlled agent planning", status: "pending" },
    { taskId, sequence: 2, kind: "analysis", title: "Goal analysis and risk review", status: "pending" },
    { taskId, sequence: 3, kind: "execution", title: "Isolated worker execution", status: "blocked" },
    { taskId, sequence: 4, kind: "result", title: "Result review", status: "pending" },
  ]);
  await db.insert(taskMessages).values({ taskId, role: "user", content: input.goal, createdBy: input.createdBy });
  return taskId;
}

export async function createArtifact(input: { workspaceId: number; taskId?: number; storageKey: string; fileName: string; mediaType: string; sizeBytes: number; sha256: string; purpose: "input" | "output" | "intermediate"; createdBy: number }) {
  const db = await requireDb();
  const result = await db.insert(artifacts).values({ ...input, taskId: input.taskId ?? null, status: "available" });
  return Number(result[0].insertId);
}

export async function listWorkspaceArtifacts(workspaceId: number) {
  const db = await requireDb();
  return db.select().from(artifacts).where(eq(artifacts.workspaceId, workspaceId)).orderBy(desc(artifacts.createdAt));
}

export async function updateTask(taskId: number, values: Partial<typeof tasks.$inferInsert>) {
  const db = await requireDb();
  await db.update(tasks).set(values).where(eq(tasks.id, taskId));
}

export async function claimTaskForRun(taskId: number) {
  const db = await requireDb();
  const result = await db.update(tasks).set({ status: "running", cancelRequested: false, startedAt: new Date(), finishedAt: null }).where(and(eq(tasks.id, taskId), inArray(tasks.status, ["ready", "failed"])));
  return Number(result[0]?.affectedRows ?? 0) === 1;
}

export async function enqueueAgentRun(input: { taskId: number; workspaceId: number; requestedBy: number }) {
  const db = await requireDb();
  return db.transaction(async tx => {
    const taskClaim = await tx.update(tasks).set({ status: "queued", cancelRequested: false, finishedAt: null }).where(and(eq(tasks.id, input.taskId), eq(tasks.workspaceId, input.workspaceId), inArray(tasks.status, ["ready", "failed"])));
    if (Number(taskClaim[0]?.affectedRows ?? 0) !== 1) throw new Error("TASK_QUEUE_CLAIM_FAILED");
    const result = await tx.insert(agentRuns).values({ ...input, status: "queued", availableAt: new Date() });
    return Number(result[0].insertId);
  });
}

export async function getAgentRunForWorkspace(runId: number, workspaceId: number) {
  const db = await requireDb();
  const rows = await db.select().from(agentRuns).where(and(eq(agentRuns.id, runId), eq(agentRuns.workspaceId, workspaceId))).limit(1);
  return rows[0];
}

export async function claimNextAgentRun(workerId: string, leaseSeconds = 45) {
  const db = await requireDb();
  const now = new Date();
  const eligible = or(eq(agentRuns.status, "queued"), and(eq(agentRuns.status, "running"), lt(agentRuns.leaseExpiresAt, now)));
  const candidate = await db.select().from(agentRuns).where(and(eq(agentRuns.cancelRequested, false), lte(agentRuns.availableAt, now), eligible)).orderBy(agentRuns.availableAt, agentRuns.id).limit(1);
  const run = candidate[0];
  if (!run) return undefined;
  const leaseExpiresAt = new Date(now.getTime() + leaseSeconds * 1000);
  const result = await db.update(agentRuns).set({ status: "running", attempt: sql`${agentRuns.attempt} + 1`, leaseOwner: workerId, leaseExpiresAt, startedAt: run.startedAt ?? now, lastError: null }).where(and(eq(agentRuns.id, run.id), eq(agentRuns.cancelRequested, false), eligible));
  return Number(result[0]?.affectedRows ?? 0) === 1 ? { ...run, status: "running" as const, leaseOwner: workerId, leaseExpiresAt, attempt: run.attempt + 1 } : undefined;
}

export async function renewAgentRunLease(runId: number, workerId: string, leaseSeconds = 45) {
  const db = await requireDb();
  const leaseExpiresAt = new Date(Date.now() + leaseSeconds * 1000);
  const result = await db.update(agentRuns).set({ leaseExpiresAt }).where(and(eq(agentRuns.id, runId), eq(agentRuns.status, "running"), eq(agentRuns.leaseOwner, workerId), eq(agentRuns.cancelRequested, false)));
  return Number(result[0]?.affectedRows ?? 0) === 1;
}

export async function saveAgentRunCheckpoint(runId: number, workerId: string, checkpoint: Record<string, unknown>) {
  const db = await requireDb();
  await db.update(agentRuns).set({ checkpoint: JSON.stringify(checkpoint) }).where(and(eq(agentRuns.id, runId), eq(agentRuns.status, "running"), eq(agentRuns.leaseOwner, workerId)));
}

export async function requestAgentRunCancellation(runId: number, workspaceId: number, reason: string) {
  const db = await requireDb();
  const run = await getAgentRunForWorkspace(runId, workspaceId);
  if (!run || ["succeeded", "failed", "cancelled", "dead_letter"].includes(run.status)) return false;
  const result = await db.update(agentRuns).set({ cancelRequested: true, cancelReason: reason, status: "cancelled", finishedAt: new Date(), leaseExpiresAt: null }).where(and(eq(agentRuns.id, runId), eq(agentRuns.workspaceId, workspaceId), inArray(agentRuns.status, ["queued", "running"])));
  if (Number(result[0]?.affectedRows ?? 0) !== 1) return false;
  await db.update(tasks).set({ cancelRequested: true, status: "cancelled", finishedAt: new Date() }).where(and(eq(tasks.id, run.taskId), eq(tasks.workspaceId, workspaceId), inArray(tasks.status, ["queued", "running", "waiting_for_approval"])));
  return true;
}

export async function getLatestAgentRunForTask(taskId: number, workspaceId: number) {
  const db = await requireDb();
  const rows = await db.select().from(agentRuns).where(and(eq(agentRuns.taskId, taskId), eq(agentRuns.workspaceId, workspaceId))).orderBy(desc(agentRuns.createdAt)).limit(1);
  return rows[0];
}

export async function finishAgentRun(input: { runId: number; workerId: string; status: "succeeded" | "failed" | "cancelled" | "dead_letter"; result?: string; error?: string; retryAt?: Date }) {
  const db = await requireDb();
  const rows = await db.select().from(agentRuns).where(and(eq(agentRuns.id, input.runId), eq(agentRuns.leaseOwner, input.workerId))).limit(1);
  const current = rows[0];
  if (!current) return undefined;
  const shouldRetry = input.status === "failed" && current.attempt < current.maxAttempts && !current.cancelRequested;
  const nextStatus = shouldRetry ? "queued" : input.status;
  await db.update(agentRuns).set({ status: nextStatus, result: input.result, lastError: input.error, availableAt: input.retryAt ?? new Date(), leaseExpiresAt: null, leaseOwner: null, finishedAt: nextStatus === "queued" ? null : new Date() }).where(and(eq(agentRuns.id, input.runId), eq(agentRuns.leaseOwner, input.workerId)));
  if (nextStatus !== "queued") {
    const taskStatus = nextStatus === "succeeded" ? "succeeded" : nextStatus === "cancelled" ? "cancelled" : "failed";
    await db.update(tasks).set({ status: taskStatus, finishedAt: new Date() }).where(eq(tasks.id, current.taskId));
  }
  return { ...current, status: nextStatus };
}

export async function addTaskMessage(input: { taskId: number; role: "user" | "assistant" | "system"; content: string; createdBy?: number }) {
  const db = await requireDb();
  await db.insert(taskMessages).values(input);
}

export async function updateTaskStep(taskId: number, sequence: number, values: Partial<typeof taskSteps.$inferInsert>) {
  const db = await requireDb();
  await db.update(taskSteps).set(values).where(and(eq(taskSteps.taskId, taskId), eq(taskSteps.sequence, sequence)));
}

export async function createSandboxSession(taskId: number) {
  const db = await requireDb();
  const result = await db.insert(sandboxSessions).values({
    taskId,
    runnerType: "agent_control_plane",
    status: "running",
    runtimeLimitSeconds: 180,
    memoryLimitMb: 512,
    networkPolicy: "disabled",
    filePolicy: "no_mounts",
    startedAt: new Date(),
  });
  return Number(result[0].insertId);
}

export async function closeSandboxSession(sessionId: number, status: "closed" | "failed") {
  const db = await requireDb();
  await db.update(sandboxSessions).set({ status, endedAt: new Date() }).where(eq(sandboxSessions.id, sessionId));
}

export async function getTaskEvidence(taskId: number, workspaceId: number) {
  const db = await requireDb();
  const task = await getTaskForWorkspace(taskId, workspaceId);
  if (!task) return undefined;
  const [steps, messages, approvals, sessions, audit] = await Promise.all([
    db.select().from(taskSteps).where(eq(taskSteps.taskId, taskId)).orderBy(taskSteps.sequence),
    db.select().from(taskMessages).where(eq(taskMessages.taskId, taskId)).orderBy(taskMessages.createdAt),
    db.select().from(approvalRequests).where(eq(approvalRequests.taskId, taskId)).orderBy(approvalRequests.createdAt),
    db.select().from(sandboxSessions).where(eq(sandboxSessions.taskId, taskId)).orderBy(sandboxSessions.createdAt),
    db.select().from(auditEvents).where(and(eq(auditEvents.workspaceId, workspaceId), eq(auditEvents.taskId, taskId))).orderBy(auditEvents.createdAt),
  ]);
  const approvalIds = approvals.map(approval => approval.id);
  const decisions = approvalIds.length === 0
    ? []
    : await db.select().from(approvalDecisions).where(inArray(approvalDecisions.approvalRequestId, approvalIds)).orderBy(approvalDecisions.createdAt);
  return { task, steps, messages, approvals, decisions, sessions, audit };
}

export async function createApproval(input: {
  taskId: number;
  requestedBy: number;
  actionType: "file_read" | "network_access" | "sandbox_execute" | "publish" | "delete" | "role_change";
  resourceScope: string;
  riskSummary: string;
  expiresAt: Date;
}) {
  const db = await requireDb();
  const result = await db.insert(approvalRequests).values({
    ...input,
    requestingService: "studio-control-api",
    status: "pending",
  });
  return Number(result[0].insertId);
}

export async function getApprovalForWorkspace(approvalId: number, workspaceId: number) {
  const db = await requireDb();
  const rows = await db.select({ approval: approvalRequests }).from(approvalRequests).innerJoin(tasks, eq(approvalRequests.taskId, tasks.id)).where(and(eq(approvalRequests.id, approvalId), eq(tasks.workspaceId, workspaceId))).limit(1);
  return rows[0]?.approval;
}

export async function decideApproval(input: { approvalId: number; userId: number; decision: "approved" | "denied"; reason?: string }) {
  const db = await requireDb();
  await db.update(approvalRequests).set({ status: input.decision }).where(eq(approvalRequests.id, input.approvalId));
  await db.insert(approvalDecisions).values({
    approvalRequestId: input.approvalId,
    decidedBy: input.userId,
    decision: input.decision,
    reason: input.reason,
  });
}

export async function createVideoJob(input: { workspaceId: number; createdBy: number; durationSeconds: number; quality: "draft" | "standard" | "high"; voice: "none" | "synthetic" | "premium"; music: boolean; clips: number; estimatedCredits: number; estimatedCostCents: number }) {
  const db = await requireDb();
  const result = await db.insert(videoJobs).values({ ...input, status: "awaiting_approval", provider: "not_configured" });
  const jobId = Number(result[0].insertId);
  await db.insert(usageLedger).values({ workspaceId: input.workspaceId, userId: input.createdBy, kind: "video", provider: "not_configured", units: input.estimatedCredits, unitCostCents: 2, totalCostCents: input.estimatedCostCents, status: "estimated", metadata: JSON.stringify({ videoJobId: jobId, durationSeconds: input.durationSeconds, quality: input.quality }) });
  return jobId;
}

export async function listWorkspaceVideoJobs(workspaceId: number) {
  const db = await requireDb();
  return db.select().from(videoJobs).where(eq(videoJobs.workspaceId, workspaceId)).orderBy(desc(videoJobs.createdAt)).limit(25);
}

export async function listWorkspaceUsage(workspaceId: number) {
  const db = await requireDb();
  return db.select().from(usageLedger).where(eq(usageLedger.workspaceId, workspaceId)).orderBy(desc(usageLedger.createdAt)).limit(100);
}
