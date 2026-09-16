import { and, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  mobileDevices,
  approvalDecisions,
  approvalRequests,
  auditEvents,
  sandboxSessions,
  taskMessages,
  taskSteps,
  tasks,
  users,
  workspaceMemberships,
  workspaces,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { hashEvidence } from "./safety";

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

export async function updateTask(taskId: number, values: Partial<typeof tasks.$inferInsert>) {
  const db = await requireDb();
  await db.update(tasks).set(values).where(eq(tasks.id, taskId));
}

export async function claimTaskForRun(taskId: number) {
  const db = await requireDb();
  const result = await db.update(tasks).set({ status: "running", cancelRequested: false, startedAt: new Date(), finishedAt: null }).where(and(eq(tasks.id, taskId), inArray(tasks.status, ["ready", "failed"])));
  return Number(result[0]?.affectedRows ?? 0) === 1;
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
