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
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const authChallenges = mysqlTable("studio_auth_challenges", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const authSessions = mysqlTable("studio_auth_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionHash: varchar("sessionHash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
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
  plan: mysqlEnum("plan", ["free", "creator", "studio", "enterprise"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const studioProjects = mysqlTable("studio_projects", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  createdBy: int("createdBy").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull(),
  target: mysqlEnum("target", ["web", "web_native"]).notNull(),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  brief: text("brief").notNull(),
  defaultBranch: varchar("defaultBranch", { length: 120 }).default("main").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projectBriefs = mysqlTable("studio_project_briefs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().unique(),
  targetUsers: text("targetUsers").notNull(),
  platforms: text("platforms").notNull(),
  dataSensitivity: mysqlEnum("dataSensitivity", ["public", "internal", "confidential", "regulated"]).notNull(),
  integrations: text("integrations").notNull(),
  deliveryScope: text("deliveryScope").notNull(),
  budgetCents: int("budgetCents").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projectPlans = mysqlTable("studio_project_plans", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  version: int("version").default(1).notNull(),
  status: mysqlEnum("status", ["draft", "approved", "superseded"]).default("draft").notNull(),
  requirements: text("requirements").notNull(),
  architecture: text("architecture").notNull(),
  testPlan: text("testPlan").notNull(),
  risks: text("risks").notNull(),
  estimatedBudgetCents: int("estimatedBudgetCents").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const projectFiles = mysqlTable("studio_project_files", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  content: text("content").notNull(),
  contentHash: varchar("contentHash", { length: 64 }).notNull(),
  version: int("version").default(1).notNull(),
  updatedBy: int("updatedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projectChanges = mysqlTable("studio_project_changes", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  createdBy: int("createdBy").notNull(),
  kind: mysqlEnum("kind", ["draft_patch", "commit", "revert"]).notNull(),
  summary: varchar("summary", { length: 500 }).notNull(),
  patch: text("patch").notNull(),
  status: mysqlEnum("status", ["draft", "approved", "applied", "rejected"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const projectEnvironments = mysqlTable("studio_project_environments", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  environment: mysqlEnum("environment", ["preview", "staging"]).notNull(),
  status: mysqlEnum("status", ["not_ready", "awaiting_approval", "ready", "expired", "blocked"]).default("not_ready").notNull(),
  buildSha: varchar("buildSha", { length: 64 }),
  previewUrl: varchar("previewUrl", { length: 500 }),
  expiresAt: timestamp("expiresAt"),
  approvedBy: int("approvedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const projectEnvironmentApprovals = mysqlTable("studio_project_environment_approvals", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  environment: mysqlEnum("environment", ["preview", "staging"]).notNull(),
  requestedBy: int("requestedBy").notNull(),
  decidedBy: int("decidedBy"),
  status: mysqlEnum("status", ["pending", "approved", "denied", "expired"]).default("pending").notNull(),
  reason: text("reason"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  decidedAt: timestamp("decidedAt"),
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

export const agentRuns = mysqlTable("studio_agent_runs", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  requestedBy: int("requestedBy").notNull(),
  status: mysqlEnum("status", ["queued", "running", "succeeded", "failed", "cancelled", "dead_letter"]).default("queued").notNull(),
  attempt: int("attempt").default(0).notNull(),
  maxAttempts: int("maxAttempts").default(3).notNull(),
  availableAt: timestamp("availableAt").defaultNow().notNull(),
  leaseOwner: varchar("leaseOwner", { length: 160 }),
  leaseExpiresAt: timestamp("leaseExpiresAt"),
  cancelRequested: boolean("cancelRequested").default(false).notNull(),
  cancelReason: varchar("cancelReason", { length: 500 }),
  checkpoint: text("checkpoint"),
  result: text("result"),
  lastError: text("lastError"),
  startedAt: timestamp("startedAt"),
  finishedAt: timestamp("finishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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

export const usageLedger = mysqlTable("studio_usage_ledger", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  kind: mysqlEnum("kind", ["llm", "video", "worker", "storage", "adjustment"]).notNull(),
  provider: varchar("provider", { length: 120 }).notNull(),
  units: int("units").notNull(),
  unitCostCents: int("unitCostCents").notNull(),
  totalCostCents: int("totalCostCents").notNull(),
  status: mysqlEnum("status", ["estimated", "reserved", "settled", "voided"]).default("estimated").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const videoJobs = mysqlTable("studio_video_jobs", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  createdBy: int("createdBy").notNull(),
  status: mysqlEnum("status", ["estimated", "awaiting_approval", "queued", "running", "succeeded", "failed", "cancelled"]).default("estimated").notNull(),
  durationSeconds: int("durationSeconds").notNull(),
  quality: mysqlEnum("quality", ["draft", "standard", "high"]).notNull(),
  voice: mysqlEnum("voice", ["none", "synthetic", "premium"]).notNull(),
  music: boolean("music").default(false).notNull(),
  clips: int("clips").default(1).notNull(),
  provider: varchar("provider", { length: 120 }).default("not_configured").notNull(),
  estimatedCredits: int("estimatedCredits").notNull(),
  estimatedCostCents: int("estimatedCostCents").notNull(),
  artifactId: int("artifactId"),
  errorCode: varchar("errorCode", { length: 160 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type AuthChallenge = typeof authChallenges.$inferSelect;
export type AuthSession = typeof authSessions.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type StudioProject = typeof studioProjects.$inferSelect;
export type ProjectBrief = typeof projectBriefs.$inferSelect;
export type ProjectPlan = typeof projectPlans.$inferSelect;
export type ProjectFile = typeof projectFiles.$inferSelect;
export type ProjectChange = typeof projectChanges.$inferSelect;
export type ProjectEnvironment = typeof projectEnvironments.$inferSelect;
export type ProjectEnvironmentApproval = typeof projectEnvironmentApprovals.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type AgentRun = typeof agentRuns.$inferSelect;
export type TaskStep = typeof taskSteps.$inferSelect;
export type AuditEvent = typeof auditEvents.$inferSelect;
export type ApprovalRequest = typeof approvalRequests.$inferSelect;
export type SandboxSession = typeof sandboxSessions.$inferSelect;
export type MobileDevice = typeof mobileDevices.$inferSelect;
export type UsageLedgerEntry = typeof usageLedger.$inferSelect;
export type VideoJob = typeof videoJobs.$inferSelect;
