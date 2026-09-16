import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const mobileDevices = mysqlTable("studio_mobile_devices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  expoPushToken: varchar("expoPushToken", { length: 255 }).notNull().unique(),
  platform: mysqlEnum("platform", ["android", "ios", "web"]).notNull(),
  status: mysqlEnum("status", ["active", "revoked"]).default("active").notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const workspaces = mysqlTable("studio_workspaces", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const workspaceMemberships = mysqlTable("studio_workspace_memberships", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "operator", "reviewer", "viewer"]).notNull(),
  status: mysqlEnum("status", ["active", "suspended"]).default("active").notNull(),
  grantedBy: int("grantedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const tasks = mysqlTable("studio_tasks", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  createdBy: int("createdBy").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  goal: text("goal").notNull(),
  status: mysqlEnum("status", [
    "draft",
    "ready",
    "queued",
    "running",
    "waiting_for_approval",
    "succeeded",
    "failed",
    "cancelled",
    "expired",
  ]).default("draft").notNull(),
  cancelRequested: boolean("cancelRequested").default(false).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  startedAt: timestamp("startedAt"),
  finishedAt: timestamp("finishedAt"),
});

export const taskSteps = mysqlTable("studio_task_steps", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  sequence: int("sequence").notNull(),
  kind: mysqlEnum("kind", ["planning", "analysis", "execution", "result"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "running", "blocked", "succeeded", "failed", "skipped"]).default("pending").notNull(),
  startedAt: timestamp("startedAt"),
  finishedAt: timestamp("finishedAt"),
  errorCode: varchar("errorCode", { length: 120 }),
});

export const taskMessages = mysqlTable("studio_task_messages", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const artifacts = mysqlTable("studio_artifacts", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  taskId: int("taskId"),
  storageKey: varchar("storageKey", { length: 500 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mediaType: varchar("mediaType", { length: 160 }).notNull(),
  sizeBytes: int("sizeBytes").notNull(),
  sha256: varchar("sha256", { length: 64 }).notNull(),
  purpose: mysqlEnum("purpose", ["input", "output", "intermediate"]).notNull(),
  status: mysqlEnum("status", ["pending_upload", "scanning", "available", "quarantined", "deleted"]).default("pending_upload").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const approvalRequests = mysqlTable("studio_approval_requests", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  requestedBy: int("requestedBy").notNull(),
  actionType: mysqlEnum("actionType", ["file_read", "network_access", "sandbox_execute", "publish", "delete", "role_change"]).notNull(),
  resourceScope: text("resourceScope").notNull(),
  riskSummary: text("riskSummary").notNull(),
  requestingService: varchar("requestingService", { length: 120 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "denied", "expired", "cancelled"]).default("pending").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const approvalDecisions = mysqlTable("studio_approval_decisions", {
  id: int("id").autoincrement().primaryKey(),
  approvalRequestId: int("approvalRequestId").notNull(),
  decidedBy: int("decidedBy").notNull(),
  decision: mysqlEnum("decision", ["approved", "denied"]).notNull(),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const sandboxSessions = mysqlTable("studio_sandbox_sessions", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  runnerType: mysqlEnum("runnerType", ["agent_control_plane", "isolated_worker"]).notNull(),
  status: mysqlEnum("status", ["requested", "provisioning", "ready", "running", "stopping", "closed", "failed", "expired"]).notNull(),
  imageDigest: varchar("imageDigest", { length: 255 }),
  runtimeLimitSeconds: int("runtimeLimitSeconds").notNull(),
  memoryLimitMb: int("memoryLimitMb").notNull(),
  networkPolicy: varchar("networkPolicy", { length: 120 }).notNull(),
  filePolicy: varchar("filePolicy", { length: 160 }).notNull(),
  startedAt: timestamp("startedAt"),
  endedAt: timestamp("endedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const toolInvocations = mysqlTable("studio_tool_invocations", {
  id: int("id").autoincrement().primaryKey(),
  taskStepId: int("taskStepId").notNull(),
  toolName: varchar("toolName", { length: 120 }).notNull(),
  inputDigest: varchar("inputDigest", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["requested", "succeeded", "failed", "denied"]).notNull(),
  outputArtifactId: int("outputArtifactId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  finishedAt: timestamp("finishedAt"),
});

export const auditEvents = mysqlTable("studio_audit_events", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  taskId: int("taskId"),
  actorType: mysqlEnum("actorType", ["user", "system", "agent"]).notNull(),
  actorId: int("actorId"),
  eventType: varchar("eventType", { length: 160 }).notNull(),
  metadata: text("metadata"),
  previousHash: varchar("previousHash", { length: 64 }),
  eventHash: varchar("eventHash", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contextGrants = mysqlTable("studio_context_grants", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  sourceApp: varchar("sourceApp", { length: 120 }).notNull(),
  resourceType: varchar("resourceType", { length: 120 }).notNull(),
  resourceId: varchar("resourceId", { length: 160 }).notNull(),
  scope: text("scope").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Workspace = typeof workspaces.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TaskStep = typeof taskSteps.$inferSelect;
export type AuditEvent = typeof auditEvents.$inferSelect;
export type ApprovalRequest = typeof approvalRequests.$inferSelect;
export type SandboxSession = typeof sandboxSessions.$inferSelect;
export type MobileDevice = typeof mobileDevices.$inferSelect;
