import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Calculator, CheckCircle2, Coins, Film, Mail, Server, ShieldCheck, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";

type Quality = "draft" | "standard" | "high";
type Voice = "none" | "synthetic" | "premium";

export default function CostCenter() {
  const runtime = trpc.studio.runtimeStatus.useQuery();
  const pricing = trpc.studio.pricing.useQuery();
  const usage = trpc.studio.usage.useQuery();
  const [duration, setDuration] = useState("30");
  const [quality, setQuality] = useState<Quality>("standard");
  const [voice, setVoice] = useState<Voice>("synthetic");
  const [music, setMusic] = useState(true);
  const seconds = Math.max(1, Number(duration) || 1);
  const estimate = trpc.studio.videoEstimate.useQuery({ durationSeconds: seconds, quality, voice, music, clips: 1 });
  const createVideoJob = trpc.studio.createVideoJob.useMutation();
  const status = runtime.data;
  const usedCredits = usage.data?.reduce((sum, entry) => sum + Number(entry.units ?? 0), 0) ?? 0;
  const estimatedSpendCents = usage.data?.reduce((sum, entry) => sum + Number(entry.totalCostCents ?? 0), 0) ?? 0;
  const usageByKind = useMemo(() => {
    const grouped = new Map<string, number>();
    usage.data?.forEach(entry => grouped.set(entry.kind, (grouped.get(entry.kind) ?? 0) + Number(entry.units ?? 0)));
    return Array.from(grouped.entries());
  }, [usage.data]);
  const rates = pricing.data?.video;
  const perMinute = rates ? rates.baseCreditsPerMinute[quality] + rates.voiceCreditsPerMinute[voice] + (music ? rates.musicCreditsPerMinute : 0) : 0;

  return <div className="space-y-5">
    <section className="hero-panel"><div className="hero-kicker"><span className="hero-kicker-dot" /> KOSTEN & INTEGRATIONEN</div><h1>Planbar starten.<br /><span>Kontrolliert skalieren.</span></h1><p>Credits machen jede Agenten- und Videonutzung nachvollziehbar. Richtwerte werden vor dem Start angezeigt; ohne Provider und Freigabe erfolgt keine Abbuchung.</p></section>

    <section>
      <div className="section-heading"><div><div className="studio-small-label">PREISPLÄNE</div><h2>Ein Credit = {pricing.data ? (pricing.data.creditEurCents / 100).toFixed(2).replace(".", ",") : "0,02"} € Richtwert</h2><p>Monatliche Credits verfallen nicht automatisch durch diese Ansicht; reale Abrechnung ist noch nicht aktiviert.</p></div></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{pricing.data?.monthly.map(plan => <div key={plan.id} className="studio-card flex flex-col p-4"><div className="studio-small-label">{plan.name.toUpperCase()}</div><div className="mt-2 text-2xl font-semibold text-[#dff9ed]">{plan.monthlyCents === 0 ? "Kostenlos" : `${(plan.monthlyCents / 100).toFixed(2).replace(".", ",")} € / Monat`}</div><div className="mt-2 text-sm text-[#9ccabb]">{plan.includedCredits.toLocaleString("de-DE")} Credits enthalten</div><div className="mt-1 text-xs text-white/45">{plan.maxProjects} Projekte · {plan.teamMembers} {plan.teamMembers === 1 ? "Nutzer" : "Nutzer"} · {plan.maxActiveRuns} aktive Runs</div><ul className="mt-4 space-y-2 text-xs text-white/65">{plan.features.map(feature => <li key={feature} className="flex gap-2"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-[#7de4bd]" />{feature}</li>)}</ul><div className="mt-auto pt-4 text-xs text-white/45">Maximale Laufzeit: {Math.floor(plan.maxRuntimeSeconds / 60)} Min.</div></div>)}</div>
    </section>

    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <Card className="studio-card"><CardHeader className="studio-card-head"><div><div className="studio-small-label">VIDEO-KALKULATOR</div><CardTitle>Was kostet mein Video?</CardTitle></div><Film size={18} className="text-[#7de4bd]" /></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 gap-3"><label className="text-xs text-white/60">Dauer in Sekunden<Input className="studio-input mt-2" type="number" min="1" max="1800" value={duration} onChange={event => setDuration(event.target.value)} /></label><label className="text-xs text-white/60">Qualität<select className="studio-input mt-2 w-full" value={quality} onChange={event => setQuality(event.target.value as Quality)}><option value="draft">Draft</option><option value="standard">Standard</option><option value="high">High</option></select></label></div><div className="grid grid-cols-2 gap-3"><label className="text-xs text-white/60">Sprecher<select className="studio-input mt-2 w-full" value={voice} onChange={event => setVoice(event.target.value as Voice)}><option value="none">Kein Sprecher</option><option value="synthetic">Synthetisch</option><option value="premium">Premium</option></select></label><label className="flex items-end gap-2 pb-3 text-xs text-white/60"><input type="checkbox" checked={music} onChange={event => setMusic(event.target.checked)} /> Musik</label></div>{estimate.data ? <div className="rounded-2xl border border-[#7de4bd]/20 bg-[#7de4bd]/[0.06] p-5"><div className="studio-small-label">RICHTWERT</div><div className="mt-2 text-3xl font-semibold text-[#dff9ed]">{(estimate.data.estimatedEurCents / 100).toFixed(2).replace(".", ",")} €</div><div className="mt-1 text-sm text-[#9ccabb]">{estimate.data.credits} Credits · vor Provider-Quote</div><div className="mt-3 rounded-xl bg-black/15 p-3 text-xs text-[#b9dfd0]">{pricing.data?.video.renderSetupCredits ?? 10} Setup + ({perMinute} Credits/Minute × {(estimate.data.durationSeconds / 60).toFixed(2).replace(".", ",")} Minuten) × {estimate.data.clips} Clip(s)</div><div className="mt-3 text-xs text-white/45">{estimate.data.assumptions.join(" · ")}</div></div> : null}<Button variant="outline" className="studio-outline-button" onClick={() => estimate.refetch()}><Calculator size={15} /> Kalkulation aktualisieren</Button></CardContent></Card>

      <Card className="studio-card"><CardHeader className="studio-card-head"><div><div className="studio-small-label">VERBRAUCH</div><CardTitle>Workspace-Nutzung</CardTitle></div><Coins size={18} className="text-[#7de4bd]" /></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-3 gap-2"><Metric label="Credits" value={usedCredits.toLocaleString("de-DE")} /><Metric label="Richtwert" value={`${(estimatedSpendCents / 100).toFixed(2).replace(".", ",")} €`} /><Metric label="Ereignisse" value={String(usage.data?.length ?? 0)} /></div>{usageByKind.length ? <div className="space-y-2">{usageByKind.map(([kind, units]) => <div key={kind} className="flex items-center justify-between border-b border-white/5 pb-2 text-xs"><span className="text-white/55">{kind}</span><strong className="text-[#b9dfd0]">{units.toLocaleString("de-DE")} Credits</strong></div>)}</div> : <div className="empty-state min-h-0 py-8"><Coins size={24} /><p>Noch kein Verbrauch im Workspace. Schätzungen werden erst durch einen angelegten Job als Ledger-Ereignis sichtbar.</p></div>}<div className="status-footnote"><TriangleAlert size={14} /> Schätzungen sind keine Abbuchungen. Jeder reale Verbrauch braucht einen konfigurierten Provider und die erforderliche Freigabe.</div></CardContent></Card>
    </div>

    <Card className="studio-card"><CardHeader className="studio-card-head"><div><div className="studio-small-label">READINESS</div><CardTitle>Verbindungen</CardTitle></div><ShieldCheck size={18} className="text-[#7de4bd]" /></CardHeader><CardContent className="grid gap-3 md:grid-cols-3"><Readiness icon={Mail} label="Resend E-Mail" ok={Boolean(status?.resend.configured && status.resend.fromConfigured)} detail={status?.resend.reason ?? "wird geprüft"} /><Readiness icon={Server} label="IONOS Execution" ok={Boolean(status?.ionos?.configured)} detail={status?.ionos?.reason ?? "wird geprüft"} /><Readiness icon={ShieldCheck} label="Isolierte Sandbox" ok={false} detail="bewusst blockiert bis Worker-Abnahme" /><Button variant="outline" className="studio-outline-button md:col-span-3" disabled={!estimate.data || createVideoJob.isPending} onClick={() => estimate.data && createVideoJob.mutate({ durationSeconds: estimate.data.durationSeconds, quality, voice, music, clips: 1 })}><Film size={15} /> {createVideoJob.isPending ? "Wird angelegt…" : "Video-Job zur Freigabe anlegen"}</Button></CardContent></Card>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/5 bg-black/10 p-3"><div className="text-[10px] text-white/45">{label}</div><strong className="mt-1 block text-sm text-[#dff9ed]">{value}</strong></div>; }
function Readiness({ icon: Icon, label, ok, detail }: { icon: typeof Mail; label: string; ok: boolean; detail: string }) { return <div className="admin-status-card"><div className={`admin-status-icon ${ok ? "" : "warn"}`}><Icon size={16} /></div><div><strong>{label}</strong><p>{ok ? <><CheckCircle2 size={12} className="mr-1 inline" /> Aktiv</> : <><TriangleAlert size={12} className="mr-1 inline" /> {detail}</>}</p></div></div>; }
