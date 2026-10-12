import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Calculator, CheckCircle2, Film, Mail, Server, ShieldCheck, TriangleAlert } from "lucide-react";
import { useState } from "react";

export default function CostCenter() {
  const runtime = trpc.studio.runtimeStatus.useQuery();
  const [duration, setDuration] = useState("30");
  const [quality, setQuality] = useState("standard");
  const [voice, setVoice] = useState("synthetic");
  const [music, setMusic] = useState(true);
  const estimate = trpc.studio.videoEstimate.useQuery({ durationSeconds: Math.max(1, Number(duration) || 1), quality: quality as "draft" | "standard" | "high", voice: voice as "none" | "synthetic" | "premium", music, clips: 1 });
  const status = runtime.data;
  return <div className="space-y-5">
    <section className="hero-panel"><div className="hero-kicker"><span className="hero-kicker-dot" /> KOSTEN & INTEGRATIONEN</div><h1>Planbar starten.<br /><span>Kontrolliert skalieren.</span></h1><p>Keine automatische Belastung: Studio zeigt Richtwerte und blockiert nicht konfigurierte Dienste.</p></section>
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <Card className="studio-card"><CardHeader className="studio-card-head"><div><div className="studio-small-label">VIDEO-KALKULATOR</div><CardTitle>Was kostet mein Video?</CardTitle></div><Film size={18} className="text-[#7de4bd]" /></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 gap-3"><label className="text-xs text-white/60">Dauer in Sekunden<Input className="studio-input mt-2" type="number" min="1" max="1800" value={duration} onChange={event => setDuration(event.target.value)} /></label><label className="text-xs text-white/60">Qualität<select className="studio-input mt-2 w-full" value={quality} onChange={event => setQuality(event.target.value)}><option value="draft">Draft</option><option value="standard">Standard</option><option value="high">High</option></select></label></div><div className="grid grid-cols-2 gap-3"><label className="text-xs text-white/60">Sprecher<select className="studio-input mt-2 w-full" value={voice} onChange={event => setVoice(event.target.value)}><option value="none">Kein Sprecher</option><option value="synthetic">Synthetisch</option><option value="premium">Premium</option></select></label><label className="flex items-end gap-2 pb-3 text-xs text-white/60"><input type="checkbox" checked={music} onChange={event => setMusic(event.target.checked)} /> Musik</label></div>{estimate.data ? <div className="rounded-2xl border border-[#7de4bd]/20 bg-[#7de4bd]/[0.06] p-5"><div className="studio-small-label">RICHTWERT</div><div className="mt-2 text-3xl font-semibold text-[#dff9ed]">{estimate.data.estimatedEurCents / 100} €</div><div className="mt-1 text-sm text-[#9ccabb]">{estimate.data.credits} Credits · vor Provider-Quote</div><div className="mt-3 text-xs text-white/45">{estimate.data.assumptions.join(" · ")}</div></div> : null}<Button variant="outline" className="studio-outline-button" onClick={() => estimate.refetch()}><Calculator size={15} /> Kalkulation aktualisieren</Button></CardContent></Card>
      <Card className="studio-card"><CardHeader className="studio-card-head"><div><div className="studio-small-label">READINESS</div><CardTitle>Verbindungen</CardTitle></div><ShieldCheck size={18} className="text-[#7de4bd]" /></CardHeader><CardContent className="space-y-3"><Readiness icon={Mail} label="Resend E-Mail" ok={Boolean(status?.resend.configured && status.resend.fromConfigured)} detail={status?.resend.reason ?? "wird geprüft"} /><Readiness icon={Server} label="IONOS Execution" ok={Boolean(status?.ionos?.configured)} detail={status?.ionos?.reason ?? "wird geprüft"} /><Readiness icon={ShieldCheck} label="Isolierte Sandbox" ok={false} detail="bewusst blockiert bis Worker-Abnahme" /><div className="status-footnote"><TriangleAlert size={14} /> Nicht konfigurierte Provider führen zu keinem automatischen Lauf und keiner Abbuchung.</div></CardContent></Card>
    </div>
  </div>;
}
function Readiness({ icon: Icon, label, ok, detail }: { icon: typeof Mail; label: string; ok: boolean; detail: string }) { return <div className="admin-status-card"><div className={`admin-status-icon ${ok ? "" : "warn"}`}><Icon size={16} /></div><div><strong>{label}</strong><p>{ok ? <><CheckCircle2 size={12} className="mr-1 inline" /> Aktiv</> : <><TriangleAlert size={12} className="mr-1 inline" /> {detail}</>}</p></div></div>; }
