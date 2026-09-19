import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  Cpu,
  Download,
  FileKey2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Network,
  Play,
  PlugZap,
  Plus,
  ScrollText,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  TriangleAlert,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type NavItem = { label: string; icon: typeof LayoutDashboard; key: string };
type AgentRunResult = {
  runId?: number;
  sessionId?: number;
  status?: string;
  worker: string;
  result?: { summary: string; plan: string[]; risks: string[]; nextAction: string };
};
const navItems: NavItem[] = [
  { label: "Arbeitsraum", icon: LayoutDashboard, key: "workspace" },
  { label: "Aufträge", icon: FolderKanban, key: "tasks" },
  { label: "Bibliothek", icon: FileKey2, key: "library" },
  { label: "Integrationen", icon: PlugZap, key: "integrations" },
  { label: "Aktivität", icon: ScrollText, key: "activity" },
];

const statusLabel: Record<string, string> = {
  ready: "Bereit",
  queued: "In Queue",
  running: "Läuft",
  succeeded: "Abgeschlossen",
  failed: "Fehlgeschlagen",
  waiting_for_approval: "Freigabe benötigt",
  draft: "Entwurf",
  cancelled: "Abgebrochen",
  dead_letter: "Manuelle Prüfung",
};

function initials(name?: string | null) {
  return (name ?? "Studio").split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [active, setActive] = useState("workspace");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("Mein Studio");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskGoal, setTaskGoal] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [runningTaskId, setRunningTaskId] = useState<number | null>(null);
  const [queuedRunId, setQueuedRunId] = useState<number | null>(null);
  const [lastRunResult, setLastRunResult] = useState<AgentRunResult | null>(null);
  const [lastRunTaskId, setLastRunTaskId] = useState<number | null>(null);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalDecision, setApprovalDecision] = useState<"approved" | "denied" | null>(null);
  const [evidenceTaskId, setEvidenceTaskId] = useState<number | null>(null);

  const overview = trpc.studio.overview.useQuery(undefined, { enabled: Boolean(user) });
  const evidencePack = trpc.studio.evidencePack.useQuery({ taskId: evidenceTaskId ?? 0 }, { enabled: evidenceTaskId !== null });
  const createWorkspace = trpc.studio.createWorkspace.useMutation({
    onSuccess: () => { overview.refetch(); toast.success("Workspace angelegt"); },
    onError: error => toast.error(error.message),
  });
  const createTask = trpc.studio.createTask.useMutation({
    onSuccess: () => { overview.refetch(); setTaskTitle(""); setTaskGoal(""); setComposerOpen(false); toast.success("Auftrag ist bereit"); },
    onError: error => toast.error(error.message),
  });
  const runAgent = trpc.studio.runAgent.useMutation({
    onMutate: variables => { setRunningTaskId(variables.taskId); setLastRunTaskId(variables.taskId); setLastRunResult(null); },
    onSuccess: result => { setQueuedRunId(result.runId ?? null); setRunningTaskId(null); setLastRunResult(result); overview.refetch(); toast.success(result.status === "queued" ? "Agentenlauf in die persistente Queue eingereiht" : result.worker === "not_configured" ? "Agentenanalyse abgeschlossen; Worker wartet auf Sicherheitskonfiguration" : "Agentenlauf abgeschlossen"); },
    onError: error => { setRunningTaskId(null); overview.refetch(); toast.error(error.message); },
  });
  const runStatus = trpc.studio.runStatus.useQuery(
    { runId: queuedRunId ?? 0 },
    { enabled: queuedRunId !== null, refetchInterval: 3_000 },
  );
  const requestApproval = trpc.studio.requestApproval.useMutation({
    onSuccess: () => { overview.refetch(); toast.success("Freigabeanforderung protokolliert"); },
    onError: error => toast.error(error.message),
  });
  const decideApproval = trpc.studio.decideApproval.useMutation({
    onSuccess: (_, variables) => { setApprovalDecision(variables.decision); overview.refetch(); toast.success(variables.decision === "approved" ? "Sandbox-Schritt freigegeben" : "Sandbox-Schritt abgelehnt"); },
    onError: error => toast.error(error.message),
  });
  const cancelTask = trpc.studio.cancelTask.useMutation({
    onSuccess: () => { setRunningTaskId(null); overview.refetch(); toast.success("Kill-Switch aktiviert: Auftrag gestoppt"); },
    onError: error => toast.error(error.message),
  });
  const cancelRun = trpc.studio.cancelRun.useMutation({
    onSuccess: () => { setQueuedRunId(null); setRunningTaskId(null); setLastRunResult(null); overview.refetch(); toast.success("Kill-Switch aktiviert: Queue-Run gestoppt"); },
    onError: error => toast.error(error.message),
  });

  useEffect(() => {
    const current = runStatus.data;
    if (!current || queuedRunId === null) return;
    if (current.status === "running") {
      setLastRunResult(previous => ({ ...(previous ?? {}), runId: current.id, status: "running", worker: "control_plane_worker" }));
      return;
    }
    if (!["succeeded", "failed", "cancelled", "dead_letter"].includes(current.status)) return;
    let parsedResult: AgentRunResult["result"];
    try { parsedResult = current.result ? JSON.parse(current.result) as AgentRunResult["result"] : undefined; } catch { parsedResult = undefined; }
    setLastRunResult(previous => ({ ...(previous ?? {}), runId: current.id, status: current.status, worker: "control_plane_worker", result: parsedResult }));
    setQueuedRunId(null);
    setRunningTaskId(null);
    overview.refetch();
  }, [runStatus.data, queuedRunId, overview]);

  const tasks = [...(overview.data?.tasks ?? [])];
  const pendingApprovals = overview.data?.approvals.filter(item => item.status === "pending") ?? [];
  const activity = [...(overview.data?.audit ?? [])];
  const latestTask = tasks[0];
  const role = overview.data?.membership?.role;
  const canOperate = role === "owner" || role === "admin" || role === "operator";
  const stats = useMemo(() => ({
    active: tasks.filter(task => ["running", "waiting_for_approval"].includes(task.status)).length,
    completed: tasks.filter(task => task.status === "succeeded").length,
    approvals: pendingApprovals.length,
  }), [tasks, pendingApprovals]);

  if (loading) return <div className="min-h-screen bg-[#07100f]" />;
  if (!user) {
    return (
      <main className="studio-auth-shell">
        <div className="studio-orb studio-orb-a" />
        <div className="studio-orb studio-orb-b" />
        <section className="studio-auth-card">
          <div className="studio-mark"><Sparkles size={18} /></div>
          <p className="eyebrow">BLACKWATERLEAF / STUDIO</p>
          <h1>Arbeite klar.<br /><span>Führe kontrolliert aus.</span></h1>
          <p className="studio-auth-copy">Ein fokussierter Arbeitsraum für Ziele, Agentenarbeit, Freigaben und nachvollziehbare Ergebnisse.</p>
          <Button className="studio-primary-button w-full" size="lg" onClick={() => startLogin()}>Studio öffnen <ArrowUpRight size={16} /></Button>
          <div className="studio-auth-note"><LockKeyhole size={14} /> Authentifizierung und Rollenprüfung sind serverseitig.</div>
        </section>
      </main>
    );
  }

  if (!overview.data?.workspace) {
    return (
      <main className="studio-auth-shell">
        <div className="studio-orb studio-orb-a" />
        <section className="studio-auth-card studio-onboarding-card">
          <div className="studio-mark"><FolderKanban size={18} /></div>
          <p className="eyebrow">ERSTER SCHRITT</p>
          <h1>Dein Studio-<span>Workspace.</span></h1>
          <p className="studio-auth-copy">Lege eine getrennte Arbeitsumgebung an. Es werden keine Natur-App-Daten automatisch übernommen.</p>
          <Input value={workspaceName} onChange={event => setWorkspaceName(event.target.value)} placeholder="Workspace-Name" className="studio-input" />
          <Button className="studio-primary-button w-full" size="lg" disabled={createWorkspace.isPending} onClick={() => createWorkspace.mutate({ name: workspaceName })}>{createWorkspace.isPending ? "Wird angelegt…" : "Workspace anlegen"} <ChevronRight size={16} /></Button>
          <div className="studio-auth-note"><ShieldCheck size={14} /> Zugriff wird pro Workspace und Rolle geprüft.</div>
        </section>
      </main>
    );
  }

  const workspace = overview.data.workspace;
  return (
    <div className="studio-app-shell">
      <aside className={`studio-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="studio-sidebar-head"><div className="studio-brand"><div className="studio-brand-mark"><Sparkles size={15} /></div><span>BlackWaterLeaf <strong>Studio</strong></span></div><button className="mobile-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button></div>
        <div className="studio-workspace-switcher"><div className="workspace-avatar">{initials(workspace.name)}</div><div><div className="studio-small-label">WORKSPACE</div><div className="studio-workspace-name">{workspace.name}</div></div><ChevronRight size={15} className="ml-auto text-white/30" /></div>
        <div className="studio-sidebar-section"><div className="studio-small-label mb-2">NAVIGATION</div>{navItems.map(item => <button key={item.key} className={`studio-nav-item ${active === item.key ? "active" : ""}`} onClick={() => { setActive(item.key); setSidebarOpen(false); }}><item.icon size={17} /><span>{item.label}</span>{item.key === "activity" && activity.length > 0 ? <span className="nav-count">{activity.length}</span> : null}</button>)}</div>
        <div className="studio-sidebar-spacer" />
        <div className="studio-safety-card"><div className="flex items-center gap-2 text-[#7de4bd]"><ShieldCheck size={16} /><span className="font-semibold text-xs">Sicherheitsmodus aktiv</span></div><p>Netzwerk standardmäßig aus. Dateien werden nicht automatisch gemountet.</p></div>
        <div className="studio-user-row"><div className="user-avatar">{initials(user.name)}</div><div className="min-w-0"><div className="text-sm font-semibold truncate">{user.name || "Studio-Nutzer"}</div><div className="studio-muted truncate">{role || "Mitglied"}</div></div><button className="icon-button ml-auto" title="Abmelden" onClick={logout}><LogOut size={15} /></button></div>
      </aside>
      <div className="studio-main">
        <header className="studio-topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button><div><div className="studio-small-label">{active === "workspace" ? "ARBEITSRAUM" : navItems.find(item => item.key === active)?.label.toUpperCase()}</div><h2>{active === "workspace" ? "Guten Morgen, {name}".replace("{name}", user.name?.split(" ")[0] || "Studio") : navItems.find(item => item.key === active)?.label}</h2></div><div className="topbar-actions"><div className="connection-pill"><span className="status-dot" /> Control API online</div><Button className="studio-primary-button" onClick={() => setComposerOpen(true)}><Plus size={16} /> Neuer Auftrag</Button></div></header>
        <main className="studio-content">
          {active === "workspace" ? <>
            {runAgent.isPending || lastRunResult ? <AgentExecutionPanel running={runAgent.isPending || lastRunResult?.status === "running"} queued={lastRunResult?.status === "queued"} result={lastRunResult} approvalDecision={approvalDecision} onOpenApproval={() => setApprovalOpen(true)} onCancel={() => { if (queuedRunId) cancelRun.mutate({ runId: queuedRunId }); else if (runningTaskId) cancelTask.mutate({ taskId: runningTaskId }); }} cancelPending={cancelTask.isPending || cancelRun.isPending} /> : null}
            <section className="hero-grid"><div className="hero-panel"><div className="hero-kicker"><span className="hero-kicker-dot" /> KONTROLLIERTE AGENTENARBEIT</div><h1>Vom Ziel zum<br /><span>klaren Ergebnis.</span></h1><p>Formuliere ein Ziel. Gib nur den nötigen Kontext frei. Verfolge jeden Schritt.</p><Button className="studio-light-button" onClick={() => setComposerOpen(true)}>Arbeitsauftrag starten <ArrowUpRight size={16} /></Button><div className="hero-grid-lines" /></div><div className="hero-signal-panel"><div className="signal-orbit orbit-one" /><div className="signal-orbit orbit-two" /><div className="signal-core"><Bot size={22} /></div><div className="signal-caption"><span className="status-dot" /> Agent Control Plane<div>isolated worker <strong>not configured</strong></div></div></div></section>
            <section className="metric-grid"><Metric label="Aktive Aufträge" value={stats.active} hint="aus echten Statusereignissen" icon={Activity} accent="mint" /><Metric label="Abgeschlossen" value={stats.completed} hint="mit Ergebniszuordnung" icon={CheckCircle2} accent="blue" /><Metric label="Freigaben" value={stats.approvals} hint="wartend auf Entscheidung" icon={ShieldCheck} accent="violet" /></section>
            <section className="dashboard-grid"><Card className="studio-card task-card"><CardHeader className="studio-card-head"><div><div className="studio-small-label">LETZTE AUFTRÄGE</div><CardTitle>Arbeitsstrom</CardTitle></div><Button variant="ghost" size="sm" className="studio-ghost-button" onClick={() => setActive("tasks")}>Alle anzeigen <ChevronRight size={14} /></Button></CardHeader><CardContent>{tasks.length === 0 ? <EmptyState icon={FolderKanban} title="Noch keine Aufträge" copy="Dein erster Arbeitsauftrag erscheint hier mit echtem serverseitigem Status." action="Auftrag anlegen" onAction={() => setComposerOpen(true)} /> : <div className="task-list">{tasks.slice(0, 5).map(task => <div className="task-row" key={task.id}><div className={`task-icon ${task.status}`}><TerminalSquare size={17} /></div><div className="min-w-0 flex-1"><div className="task-title truncate">{task.title}</div><div className="task-meta">#{task.id} · {new Date(task.updatedAt).toLocaleString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div></div><Badge className={`status-badge ${task.status}`}>{statusLabel[task.status] || task.status}</Badge>{task.status === "ready" && canOperate ? <Button size="icon" variant="ghost" className="row-run-button" disabled={runAgent.isPending} onClick={() => runAgent.mutate({ taskId: task.id })}><Play size={14} /></Button> : null}</div>)}</div>}</CardContent></Card><Card className="studio-card activity-card"><CardHeader className="studio-card-head"><div><div className="studio-small-label">SICHERHEIT & SYSTEM</div><CardTitle>Ausführungsstatus</CardTitle></div><LockKeyhole size={17} className="text-white/35" /></CardHeader><CardContent><div className="status-stack"><StatusRow icon={Bot} label="Agent Control Plane" value="Verfügbar" tone="good" /><StatusRow icon={TerminalSquare} label="Isolated Worker" value="Nicht konfiguriert" tone="neutral" /><StatusRow icon={LockKeyhole} label="Netzwerkzugriff" value="Deaktiviert" tone="good" /><StatusRow icon={FileKey2} label="Datei-Mounts" value="Keine" tone="good" /></div><div className="status-footnote"><CircleDashed size={14} /> Jeder echte Worker-Lauf benötigt eine separate Freigabe und Isolation.</div></CardContent></Card></section>
          </> : active === "tasks" ? <TaskView tasks={tasks} canOperate={canOperate} onRun={taskId => runAgent.mutate({ taskId })} running={runAgent.isPending} onNew={() => setComposerOpen(true)} onEvidence={taskId => setEvidenceTaskId(taskId)} /> : active === "activity" ? <ActivityView activity={activity} /> : active === "integrations" ? <IntegrationsView /> : <LibraryView />}
        </main>
      </div>
      {composerOpen ? <TaskComposer title={taskTitle} goal={taskGoal} setTitle={setTaskTitle} setGoal={setTaskGoal} pending={createTask.isPending} onClose={() => setComposerOpen(false)} onSubmit={() => createTask.mutate({ title: taskTitle, goal: taskGoal, priority: "medium" })} /> : null}
      {approvalOpen && lastRunTaskId ? <ApprovalDialog taskId={lastRunTaskId} pending={requestApproval.isPending || decideApproval.isPending} decision={approvalDecision} onClose={() => setApprovalOpen(false)} onDecide={async decision => {
        const request = await requestApproval.mutateAsync({ taskId: lastRunTaskId, actionType: "sandbox_execute", resourceScope: "isolated-worker:task-output", riskSummary: "Der Worker darf ausschließlich freigegebene Task-Eingaben verarbeiten. Netzwerk bleibt deaktiviert; Laufzeit und Speicher sind begrenzt." });
        await decideApproval.mutateAsync({ approvalId: request.approvalId, decision, reason: decision === "approved" ? "Manuell im Ausführungsdialog bestätigt" : "Manuell im Ausführungsdialog abgelehnt" });
      }} /> : null}
      {evidenceTaskId !== null && evidencePack.data ? <EvidencePackModal evidence={evidencePack.data} onClose={() => setEvidenceTaskId(null)} /> : null}
    </div>
  );
}

function ApprovalDialog({ taskId, pending, decision, onClose, onDecide }: { taskId: number; pending: boolean; decision: "approved" | "denied" | null; onClose: () => void; onDecide: (decision: "approved" | "denied") => Promise<void> }) {
  const [confirmStep, setConfirmStep] = useState(false);
  return <div className="composer-backdrop"><div className="approval-dialog"><div className="composer-head"><div><div className="studio-small-label">MANUELLE FREIGABE · TASK #{taskId}</div><h2>Sandbox-Schritt prüfen</h2></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div><div className="approval-risk-banner"><ShieldCheck size={18} /><div><strong>Kontrollierte Ausführung</strong><p>Die Freigabe gilt nur für diesen Auftrag und wird im Auditlog gespeichert.</p></div></div><div className="approval-detail-grid"><ApprovalDetail icon={TerminalSquare} label="Aktion" value="Isolated Worker starten" /><ApprovalDetail icon={FileKey2} label="Dateizugriff" value="Keine Mounts" /><ApprovalDetail icon={Network} label="Netzwerk" value="Deaktiviert" /><ApprovalDetail icon={Clock3} label="Gültigkeit" value="30 Minuten" /></div><div className="approval-scope"><div className="studio-small-label">RESSOURCENUMFANG</div><p>Nur freigegebene Eingaben dieses Auftrags. Keine Produktionsdatenbank, keine dauerhaften Secrets, keine externen Domains.</p></div>{decision ? <div className={`approval-final ${decision}`}><CheckCircle2 size={17} /><span>Diese Ausführung wurde {decision === "approved" ? "freigegeben" : "abgelehnt"}.</span></div> : <div className="approval-actions">{confirmStep ? <><Button variant="ghost" className="studio-ghost-button" disabled={pending} onClick={() => setConfirmStep(false)}>Zurück</Button><Button variant="outline" className="approval-deny-button" disabled={pending} onClick={() => void onDecide("denied")}>Ablehnen</Button><Button className="studio-primary-button" disabled={pending} onClick={() => void onDecide("approved")}>{pending ? "Wird protokolliert…" : "Endgültig freigeben"}</Button></> : <><Button variant="ghost" className="studio-ghost-button" onClick={onClose}>Abbrechen</Button><Button className="studio-primary-button" onClick={() => setConfirmStep(true)}><ShieldCheck size={14} /> Entscheidung fortsetzen</Button></>}</div>}</div></div>;
}
function ApprovalDetail({ icon: Icon, label, value }: { icon: typeof TerminalSquare; label: string; value: string }) { return <div className="approval-detail"><Icon size={15} /><div><div className="studio-small-label">{label}</div><strong>{value}</strong></div></div>; }
function AgentExecutionPanel({ running, queued, result, approvalDecision, onOpenApproval, onCancel, cancelPending }: { running: boolean; queued: boolean; result: AgentRunResult | null; approvalDecision: "approved" | "denied" | null; onOpenApproval: () => void; onCancel: () => void; cancelPending: boolean }) {
  const completed = Boolean(result);
  const steps = [
    { label: "Auftrag angenommen", detail: "Control API bestätigt den Lauf", state: "done", icon: CheckCircle2 },
    { label: "Planung & Risikoanalyse", detail: running ? "Agent analysiert das Ziel…" : "Analyse abgeschlossen", state: running ? "active" : "done", icon: Bot },
    { label: "Sicherheitsgrenzen geprüft", detail: "Netzwerk aus · keine Datei-Mounts", state: "done", icon: ShieldCheck },
    { label: "Isolated Worker", detail: completed ? "Nicht konfiguriert · kein Code ausgeführt" : "Wartet auf Agentenergebnis", state: completed ? "blocked" : "pending", icon: TerminalSquare },
  ];
  return <section className={`execution-panel ${running || queued ? "is-running" : "is-complete"}`}>
    <div className="execution-head"><div><div className="studio-small-label">AGENTEN-AUSFÜHRUNG</div><h3>{running ? "Agent arbeitet an deinem Auftrag" : queued ? "Agent wartet in der Queue" : "Agentenanalyse abgeschlossen"}</h3><p>{running ? "Der Server verarbeitet den Lauf. Du kannst ihn jederzeit abbrechen." : queued ? "Der Run ist dauerhaft gespeichert und wartet auf einen verfügbaren Worker." : "Das Ergebnis stammt aus der Control Plane; der isolierte Worker bleibt gesperrt."}</p></div><div className="execution-head-actions">{running || queued ? <Button variant="outline" size="sm" className="kill-switch-button" disabled={cancelPending} onClick={onCancel}>{cancelPending ? "Stoppt…" : "Kill-Switch"}</Button> : null}<div className="execution-spinner-wrap">{running || queued ? <span className="execution-spinner" /> : <CheckCircle2 size={22} />}</div></div></div>
    <div className="execution-progress"><span style={{ width: running ? "61%" : queued ? "24%" : "86%" }} /></div>
    <div className="execution-steps">{steps.map(step => <div className={`execution-step ${step.state}`} key={step.label}><div className="execution-step-icon">{step.state === "active" ? <span className="mini-spinner" /> : <step.icon size={14} />}</div><div className="flex-1"><div className="execution-step-label">{step.label}</div><div className="execution-step-detail">{step.detail}</div></div><span className={`execution-step-state ${step.state}`}>{step.state === "done" ? "OK" : step.state === "active" ? "LIVE" : step.state === "blocked" ? "BLOCKED" : "WAIT"}</span></div>)}</div>
    {result?.result ? <div className="execution-result"><div className="execution-result-label"><Sparkles size={14} /> ERGEBNIS</div><p>{result.result.summary}</p><div className="execution-result-meta"><span><Cpu size={13} /> Control Plane</span><span><Clock3 size={13} /> Session #{result.sessionId}</span><span><Network size={13} /> Netzwerk aus</span></div></div> : null}
    {result?.worker === "not_configured" ? <div className="execution-warning"><TriangleAlert size={15} /><span>Für beliebige Codeausführung fehlt noch ein isolierter Worker. Studio hat deshalb bewusst keinen Code ausgeführt.</span></div> : null}
    {!running ? <div className="approval-inline"><div><div className="approval-inline-title"><ShieldCheck size={14} /> Freigabe für den nächsten Schritt</div><div className="approval-inline-copy">Isolated Worker · keine Netzwerkverbindung · 180 Sekunden · 512 MB</div></div>{approvalDecision ? <span className={`approval-decision ${approvalDecision}`}>{approvalDecision === "approved" ? "Freigegeben" : "Abgelehnt"}</span> : <Button size="sm" className="studio-primary-button" onClick={onOpenApproval}><ShieldCheck size={14} /> Prüfen & freigeben</Button>}</div> : null}
  </section>;
}
function Metric({ label, value, hint, icon: Icon, accent }: { label: string; value: number; hint: string; icon: typeof Activity; accent: string }) { return <div className={`metric-card ${accent}`}><div className="metric-icon"><Icon size={17} /></div><div><div className="studio-small-label">{label}</div><div className="metric-value">{value}</div><div className="metric-hint">{hint}</div></div></div>; }
function StatusRow({ icon: Icon, label, value, tone }: { icon: typeof Bot; label: string; value: string; tone: string }) { return <div className="status-row"><div className="status-row-icon"><Icon size={16} /></div><div className="flex-1"><div className="text-sm font-medium">{label}</div><div className="studio-muted text-xs mt-0.5">{value}</div></div><span className={`status-ring ${tone}`} /></div>; }
function EmptyState({ icon: Icon, title, copy, action, onAction }: { icon: typeof FolderKanban; title: string; copy: string; action: string; onAction: () => void }) { return <div className="empty-state"><div className="empty-icon"><Icon size={22} /></div><div className="font-semibold">{title}</div><p>{copy}</p><Button variant="outline" className="studio-outline-button" onClick={onAction}>{action} <Plus size={14} /></Button></div>; }
type EvidencePackData = { task: any; steps: any[]; messages: any[]; approvals: any[]; decisions: any[]; sessions: any[]; audit: any[]; generatedAt: Date };
function EvidencePackModal({ evidence, onClose }: { evidence: EvidencePackData; onClose: () => void }) {
  const timeline = [...evidence.audit.map(event => ({ at: event.createdAt, label: event.eventType, detail: `${event.actorType} · EVT-${event.id}`, tone: "audit" })), ...evidence.steps.filter(step => step.startedAt || step.finishedAt).map(step => ({ at: step.finishedAt ?? step.startedAt, label: step.title, detail: `${step.status} · Schritt ${step.sequence}`, tone: step.status === "blocked" ? "blocked" : "step" }))].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const markdown = `# Evidence Pack · Task #${evidence.task.id}\n\n## Auftrag\n\n- Titel: ${evidence.task.title}\n- Status: ${evidence.task.status}\n- Ziel: ${evidence.task.goal}\n- Erstellt: ${new Date(evidence.task.createdAt).toLocaleString("de-DE")}\n- Evidence erstellt: ${new Date(evidence.generatedAt).toLocaleString("de-DE")}\n\n## Timeline\n\n${timeline.map(item => `- ${new Date(item.at).toLocaleString("de-DE")} — **${item.label}** (${item.detail})`).join("\n") || "Keine Ereignisse"}\n\n## Entscheidungen\n\n${evidence.approvals.map(approval => `- ${approval.actionType}: **${approval.status}** — ${approval.resourceScope}\n  Risiko: ${approval.riskSummary}`).join("\n") || "Keine Freigabeentscheidungen"}\n\n## Logs und Ergebnisse\n\n${evidence.messages.map(message => `- ${message.role}: ${message.content}`).join("\n") || "Keine Nachrichten"}\n\n## Sandbox\n\n${evidence.sessions.map(session => `- Session #${session.id}: ${session.status}; Netzwerk ${session.networkPolicy}; Dateien ${session.filePolicy}; Limit ${session.runtimeLimitSeconds}s / ${session.memoryLimitMb}MB`).join("\n") || "Keine Session"}`;
  const download = (format: "md" | "json") => { const content = format === "md" ? markdown : JSON.stringify(evidence, null, 2); const blob = new Blob([content], { type: format === "md" ? "text/markdown;charset=utf-8" : "application/json;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `blackwaterleaf-evidence-task-${evidence.task.id}.${format}`; link.click(); URL.revokeObjectURL(url); };
  return <div className="composer-backdrop"><div className="evidence-modal"><div className="composer-head"><div><div className="studio-small-label">EXPORTIERBARE TASK-AKTE · #{evidence.task.id}</div><h2>{evidence.task.title}</h2><p className="evidence-subtitle">Zusammengeführt aus Audit, Task-Schritten, Logs, Freigaben und Sandbox-Sessions.</p></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div><div className="evidence-toolbar"><Button className="studio-primary-button" onClick={() => download("md")}><Download size={14} /> Markdown exportieren</Button><Button variant="outline" className="studio-outline-button" onClick={() => download("json")}><Download size={14} /> JSON exportieren</Button></div><div className="evidence-summary"><span><strong>{evidence.task.status}</strong><small>Status</small></span><span><strong>{timeline.length}</strong><small>Timeline-Ereignisse</small></span><span><strong>{evidence.approvals.length}</strong><small>Freigaben</small></span><span><strong>{evidence.messages.length}</strong><small>Logs</small></span></div><div className="evidence-section"><div className="studio-small-label">TIMELINE</div>{timeline.length === 0 ? <p className="evidence-empty">Noch keine zeitlich erfassten Ereignisse.</p> : <div className="evidence-timeline">{timeline.map((item, index) => <div className={`evidence-event ${item.tone}`} key={`${item.label}-${index}`}><div className="evidence-event-dot" /><div><strong>{item.label}</strong><small>{item.detail} · {new Date(item.at).toLocaleString("de-DE")}</small></div></div>)}</div>}</div><div className="evidence-section"><div className="studio-small-label">ENTSCHEIDUNGEN</div>{evidence.approvals.length === 0 ? <p className="evidence-empty">Keine Freigaben angefordert.</p> : evidence.approvals.map(approval => <div className="evidence-decision" key={approval.id}><div><strong>{approval.actionType}</strong><small>{approval.resourceScope}</small></div><Badge className={`status-badge ${approval.status}`}>{approval.status}</Badge></div>)}</div></div></div>;
}
function TaskView({ tasks, canOperate, onRun, running, onNew, onEvidence }: { tasks: any[]; canOperate: boolean; onRun: (id: number) => void; running: boolean; onNew: () => void; onEvidence: (id: number) => void }) { return <section className="page-section"><div className="section-heading"><div><div className="studio-small-label">SERVERSEITIG GESPEICHERT</div><h1>Aufträge</h1><p>Nur reale Zustände aus der Studio-Control-API werden angezeigt.</p></div><Button className="studio-primary-button" onClick={onNew}><Plus size={16} /> Neuer Auftrag</Button></div><Card className="studio-card"><CardContent className="p-0"><div className="task-table-head"><span>Auftrag</span><span>Status</span><span>Aktualisiert</span><span /></div>{tasks.length === 0 ? <EmptyState icon={FolderKanban} title="Keine Aufträge vorhanden" copy="Lege einen kontrollierten Arbeitsauftrag an." action="Auftrag anlegen" onAction={onNew} /> : tasks.map(task => <div className="task-table-row" key={task.id}><div><div className="task-title">{task.title}</div><div className="task-meta">#{task.id} · {task.goal.slice(0, 90)}{task.goal.length > 90 ? "…" : ""}</div></div><Badge className={`status-badge ${task.status}`}>{statusLabel[task.status] || task.status}</Badge><span className="task-meta">{new Date(task.updatedAt).toLocaleString("de-DE")}</span><div className="task-row-actions"><Button variant="ghost" size="sm" className="evidence-button" onClick={() => onEvidence(task.id)}><FileText size={14} /> Akte</Button>{task.status === "ready" && canOperate ? <Button variant="outline" size="sm" className="studio-outline-button" disabled={running} onClick={() => onRun(task.id)}><Play size={14} /> Agent starten</Button> : null}</div></div>)}</CardContent></Card></section>; }
function ActivityView({ activity }: { activity: any[] }) { return <section className="page-section"><div className="section-heading"><div><div className="studio-small-label">MANIPULATIONSARME SPUR</div><h1>Aktivität</h1><p>Aufträge, Freigaben und Agentenereignisse aus dem Server-Auditlog.</p></div></div><Card className="studio-card"><CardContent>{activity.length === 0 ? <EmptyState icon={ScrollText} title="Noch keine Aktivität" copy="Echte Ereignisse erscheinen nach der ersten Workspace- oder Auftragsaktion." action="Zurück zum Arbeitsraum" onAction={() => window.history.back()} /> : <div className="audit-list">{activity.map(event => <div className="audit-row" key={event.id}><div className="audit-dot" /><div className="flex-1"><div className="text-sm font-medium">{event.eventType}</div><div className="task-meta">{event.actorType} · {new Date(event.createdAt).toLocaleString("de-DE")}</div></div><span className="audit-id">EVT-{event.id}</span></div>)}</div>}</CardContent></Card></section>; }
function IntegrationsView() { const integrations = [{ name: "GitHub / GitLab", detail: "Repositories, Issues, Pull Requests", icon: FolderKanban }, { name: "Google Workspace", detail: "Drive, Docs und Tabellen", icon: FileKey2 }, { name: "Slack / Teams", detail: "Aufträge und Benachrichtigungen", icon: Activity }, { name: "Jira / Linear", detail: "Tickets und Statusübergaben", icon: ScrollText }]; return <section className="page-section"><div className="section-heading"><div><div className="studio-small-label">ENTERPRISE-ANSCHLÜSSE</div><h1>Integrationen</h1><p>Connectoren werden pro Workspace, Rolle und Auftrag freigegeben. Noch kein Dienst ist automatisch verbunden.</p></div></div><div className="integration-grid">{integrations.map(item => <Card className="studio-card integration-card" key={item.name}><CardContent><div className="integration-icon"><item.icon size={19} /></div><h3>{item.name}</h3><p>{item.detail}</p><Badge className="integration-status">Anschluss vorbereitet</Badge><Button variant="outline" className="studio-outline-button w-full mt-4" onClick={() => toast.info("Connector-Verbindung folgt nach Konfiguration von OAuth und Workspace-Richtlinien.")}><PlugZap size={14} /> Konfiguration vorbereiten</Button></CardContent></Card>)}</div><div className="integration-note"><ShieldCheck size={16} /><span>Enterprise-Regel: keine globale Verbindung, keine automatisch übernommenen Daten und keine Secrets im Agentenkontext ohne task-spezifische Freigabe.</span></div></section>; }
function LibraryView() { return <section className="page-section"><div className="section-heading"><div><div className="studio-small-label">ZWECKGEBUNDENER ZUGRIFF</div><h1>Bibliothek</h1><p>Dateien werden erst nach Upload, Scan und expliziter Freigabe verfügbar.</p></div></div><Card className="studio-card"><CardContent><div className="library-empty"><div className="empty-icon"><FileKey2 size={22} /></div><h3>Keine Dateien verbunden</h3><p>Es gibt keine automatisch übernommenen Natur-App-Daten und keine globalen Dateimounts.</p><div className="library-lock"><LockKeyhole size={14} /> Private Artefakte · signierte Zugriffe · SHA-256-Prüfung</div></div></CardContent></Card></section>; }
function TaskComposer({ title, goal, setTitle, setGoal, pending, onClose, onSubmit }: { title: string; goal: string; setTitle: (value: string) => void; setGoal: (value: string) => void; pending: boolean; onClose: () => void; onSubmit: () => void }) { const ready = title.trim().length >= 2 && goal.trim().length >= 10; return <div className="composer-backdrop"><div className="composer-panel"><div className="composer-head"><div><div className="studio-small-label">NEUER ARBEITSAUFTRAG</div><h2>Ziel definieren</h2></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div><div className="composer-callout"><ShieldCheck size={16} /><span>Der Preflight prüft Ziel, Umfang, Risiken und benötigte Zugriffe, bevor ein Agentenlauf startet.</span></div><label className="studio-label">Titel<Input value={title} onChange={event => setTitle(event.target.value)} placeholder="z. B. Produktrecherche strukturieren" className="studio-input mt-2" /></label><label className="studio-label">Ziel und Kontext<Textarea value={goal} onChange={event => setGoal(event.target.value)} placeholder="Beschreibe, was du erreichen möchtest, welche Grenzen gelten und welches Ergebnis du erwartest…" className="studio-input studio-textarea mt-2" /></label><div className="preflight-box"><div className="preflight-head"><div><div className="studio-small-label">AGENT-PREFLIGHT</div><strong>{ready ? "Bereit für die Kontrollprüfung" : "Noch nicht vollständig"}</strong></div><span className={`preflight-dot ${ready ? "ready" : "waiting"}`} /></div><div className="preflight-grid"><PreflightCheck label="Erfolgskriterium" value={goal.trim().length >= 10 ? "Zielbeschreibung vorhanden" : "Ziel ergänzen"} good={goal.trim().length >= 10} /><PreflightCheck label="Netzwerk" value="Standardmäßig deaktiviert" good /><PreflightCheck label="Dateien" value="Keine globalen Mounts" good /><PreflightCheck label="Freigabe" value="Vor Außenaktion erforderlich" good /></div></div><div className="composer-actions"><Button variant="ghost" className="studio-ghost-button" onClick={onClose}>Abbrechen</Button><Button className="studio-primary-button" disabled={pending || !ready} onClick={onSubmit}>{pending ? "Wird gespeichert…" : "Preflight & Auftrag anlegen"} <ArrowUpRight size={16} /></Button></div></div></div>; }
function PreflightCheck({ label, value, good }: { label: string; value: string; good: boolean }) { return <div className="preflight-check"><span className={`preflight-check-dot ${good ? "good" : "waiting"}`} /><div><strong>{label}</strong><small>{value}</small></div></div>; }
