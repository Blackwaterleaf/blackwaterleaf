import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, CloudCog, GitBranch, KeyRound, LockKeyhole, RefreshCw, ServerCog, ShieldCheck, TerminalSquare, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

type Props = { role?: string };

export default function AdminPanel({ role }: Props) {
  const runtime = trpc.studio.runtimeStatus.useQuery(undefined, { refetchInterval: 15_000 });
  const isAdmin = role === "owner" || role === "admin";
  const preflight = trpc.studio.ionosPreflight.useQuery(undefined, { enabled: isAdmin, retry: false });
  const ionos = runtime.data?.ionos;
  const sandbox = runtime.data?.sandbox;
  const builtin = runtime.data?.builtin;
  const kimi = runtime.data?.kimi;

  const gated = (label: string) => toast.info(`${label} bleibt gesperrt, bis SSH-Preflight und IONOS-Readiness erfolgreich sind.`);

  return (
    <div className="page-section">
      <div className="section-heading">
        <div><div className="studio-small-label">UNABHÄNGIGER BETRIEB</div><h1>Admin-Konsole</h1><p>BlackWaterLeaf Studio wird später unabhängig von Manus auf IONOS betrieben.</p></div>
        <Button variant="outline" className="studio-outline-button" onClick={() => void runtime.refetch()}><RefreshCw size={14} /> Status prüfen</Button>
      </div>
      <div className="admin-banner"><ShieldCheck size={18} /><div><strong>Safety-Gate aktiv</strong><p>Keine freie Shell-Ausführung und kein Deployment, solange Server-IP, SSH-Preflight und Deployment-Freigabe fehlen.</p></div></div>
      <div className="admin-grid">
        <AdminStatusCard icon={CloudCog} label="IONOS Cloud" value={preflight.data?.ok ? "API erreichbar" : ionos?.executionServerConfigured ? "Konfiguriert" : "Noch nicht verbunden"} detail={preflight.data?.reason ?? ionos?.reason ?? "Provisionierung oder API-Verbindung ausstehend."} tone={preflight.data?.ok ? "good" : ionos?.executionServerConfigured ? "neutral" : "warn"} />
        <AdminStatusCard icon={KeyRound} label="SSH-Preflight" value="Noch nicht ausgeführt" detail="Benötigt öffentliche Server-IP und Admin-Schlüssel." tone="warn" />
        <AdminStatusCard icon={TerminalSquare} label="Execution Plane" value={sandbox?.executionPlane ?? "not_configured"} detail="Eine VM ist noch keine isolierte Agenten-Sandbox." tone={sandbox?.executionPlane !== "not_configured" ? "good" : "neutral"} />
        <AdminStatusCard icon={CloudCog} label="Manus Built-in-KI" value={builtin?.configured ? "Serverseitig bereit" : "Nicht konfiguriert"} detail={builtin?.reason ?? "Serverstatus wird geprüft."} tone={builtin?.configured ? "good" : "warn"} />
        <AdminStatusCard icon={GitBranch} label="Kimi-Provider" value={kimi?.enabled ? "Aktiv" : "Deaktiviert"} detail={kimi?.reason ?? "Serverseitiger Opt-in erforderlich."} tone={kimi?.enabled ? "good" : "neutral"} />
      </div>
      <div className="admin-section-grid">
        <Card className="studio-card"><CardHeader className="studio-card-head"><div><div className="studio-small-label">ERLAUBTE AKTIONEN</div><CardTitle>Serververwaltung</CardTitle></div><ServerCog size={17} className="text-white/35" /></CardHeader><CardContent><div className="admin-actions"><AdminAction icon={CloudCog} title="IONOS-Preflight ausführen" detail="Cloud-API und ausgewählten Execution-Server schreibgeschützt prüfen" disabled={!isAdmin || preflight.isFetching} onClick={() => void preflight.refetch()} /><AdminAction icon={LockKeyhole} title="SSH-Preflight ausführen" detail="Host-Key, Systemd und Release-Verzeichnis prüfen" disabled={!isAdmin} onClick={() => gated("SSH-Preflight")} /><AdminAction icon={GitBranch} title="Staging deployen" detail="Nur ein festgelegter Git-Commit, Tests und Health-Check" disabled={!isAdmin || !preflight.data?.ok} onClick={() => gated("Staging-Deployment")} /><AdminAction icon={RefreshCw} title="Rollback" detail="Letzte bekannte Release-Version wieder aktivieren" disabled={!isAdmin || !preflight.data?.ok} onClick={() => gated("Rollback")} /></div></CardContent></Card>
        <Card className="studio-card"><CardHeader className="studio-card-head"><div><div className="studio-small-label">SICHERHEIT</div><CardTitle>Unabhängigkeit</CardTitle></div><ShieldCheck size={17} className="text-white/35" /></CardHeader><CardContent><div className="admin-checklist"><CheckItem done label="Manus bleibt optional" /><CheckItem done label="Keine Secrets im Frontend" /><CheckItem done label="Rollen- und Workspace-Isolation" /><CheckItem done={Boolean(preflight.data?.ok)} label="IONOS-Server online und erreichbar" /><CheckItem done={false} label="Systemd-/TLS-Betrieb eingerichtet" /><CheckItem done={false} label="Deployment-API freigeschaltet" /></div><div className="admin-note"><TriangleAlert size={14} /> Mutierende Aktionen werden erst nach erfolgreicher Serverprüfung aktiviert.</div></CardContent></Card>
      </div>
    </div>
  );
}

function AdminStatusCard({ icon: Icon, label, value, detail, tone }: { icon: typeof CloudCog; label: string; value: string; detail: string; tone: "good" | "warn" | "neutral" }) {
  return <div className="admin-status-card"><div className={`admin-status-icon ${tone}`}><Icon size={17} /></div><div className="min-w-0"><div className="studio-small-label">{label}</div><strong>{value}</strong><p>{detail}</p></div><span className={`status-ring ${tone === "good" ? "good" : "neutral"}`} /></div>;
}
function AdminAction({ icon: Icon, title, detail, disabled, onClick }: { icon: typeof LockKeyhole; title: string; detail: string; disabled: boolean; onClick: () => void }) {
  return <button className={`admin-action ${disabled ? "disabled" : ""}`} disabled={disabled} onClick={onClick}><span className="admin-action-icon"><Icon size={15} /></span><span className="min-w-0 flex-1"><strong>{title}</strong><small>{detail}</small></span><Badge className="admin-gate-badge">GATE</Badge></button>;
}
function CheckItem({ done, label }: { done: boolean; label: string }) { return <div className="admin-check-item"><span className={done ? "admin-check done" : "admin-check"}>{done ? "✓" : "–"}</span><span>{label}</span></div>; }
