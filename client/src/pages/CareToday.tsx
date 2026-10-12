import { useMemo, useState } from "react";
import { Check, Clock3, Leaf, Plus, SkipForward, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ObservatoryContextHeader, ObservatoryStateSurface } from "@/components/ObservatoryPrimitives";

const realmLabel = { botany: "Botanik", aquarium: "Aquaristik", terrarium: "Terraristik" } as const;

export default function CareToday() {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const today = trpc.care.today.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const mine = trpc.care.mine.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const habitats = trpc.habitats.mine.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const createPlan = trpc.care.createPlan.useMutation({ onSuccess: () => { void utils.care.mine.invalidate(); } });
  const createTask = trpc.care.createTask.useMutation({ onSuccess: () => { void utils.care.today.invalidate(); void utils.care.mine.invalidate(); } });
  const updateTask = trpc.care.updateTask.useMutation({ onSuccess: () => { void utils.care.today.invalidate(); void utils.care.mine.invalidate(); } });
  const addJournal = trpc.care.addJournal.useMutation({ onSuccess: () => { void utils.care.mine.invalidate(); setJournal(""); } });
  const [planTitle, setPlanTitle] = useState("");
  const [planRealm, setPlanRealm] = useState<keyof typeof realmLabel>("botany");
  const [planHabitat, setPlanHabitat] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPlan, setTaskPlan] = useState("");
  const [repeatEveryDays, setRepeatEveryDays] = useState("0");
  const [journal, setJournal] = useState("");
  const plans = mine.data?.plans ?? [];
  const openTasks = useMemo(() => (today.data?.tasks ?? []).filter(task => task.status === "open" || task.status === "snoozed"), [today.data?.tasks]);

  if (!auth.isAuthenticated) return <section className="observatory-route observatory-route--botany care-page"><ObservatoryStateSurface tone="botany" code="PFLEGE · PRIVAT" title="DEIN HEUTE" body="Melde dich an, damit private Aufgaben und Journale nur in deinem Konto bleiben." action={<Link className="primary-action" href="/login">ANMELDEN</Link>} /></section>;

  const busy = createPlan.isPending || createTask.isPending || updateTask.isPending || addJournal.isPending;
  return <section className="observatory-route observatory-route--botany care-page">
    <ObservatoryContextHeader tone="botany" eyebrow={`PRIVATE CARE · ${today.data?.date ?? "HEUTE"}`} title="HEUTE" subtitle="Eine klare Handlung nach der anderen. Deine Pflege bleibt privat, steuerbar und nachvollziehbar." icon={Leaf} badge="PRIVAT" children={<Link className="secondary-action" href="/profile/habitats">ANLAGEN</Link>} />
    <section className="care-panel observatory-data-panel" aria-labelledby="care-open-heading"><div className="care-panel__heading"><div><span className="eyebrow">JETZT</span><h2 id="care-open-heading">Offene Aufgaben</h2></div><span className="care-count">{openTasks.length}</span></div>
      {today.isLoading ? <p className="form-status" aria-live="polite">Heute wird geladen …</p> : null}
      {!today.isLoading && openTasks.length === 0 ? <p className="care-empty">Für heute ist nichts offen. Lege unten eine Aufgabe an oder halte einen Pflege-Moment im Journal fest.</p> : null}
      <div className="care-task-list">{openTasks.map(task => <article className="care-task" key={task.id}><div className="care-task__icon"><Clock3 size={18} /></div><div className="care-task__copy"><strong>{task.title}</strong><span>{new Date(task.dueAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} · {task.status === "snoozed" ? "verschoben" : "offen"}{task.repeatEveryDays ? ` · alle ${task.repeatEveryDays} Tage` : ""}</span></div><div className="care-task__actions"><button className="icon-button" type="button" onClick={() => updateTask.mutate({ taskId: Number(task.id), status: "done" })} disabled={busy} aria-label="Aufgabe erledigen"><Check size={17} /></button><button className="icon-button" type="button" onClick={() => updateTask.mutate({ taskId: Number(task.id), status: "snoozed", reason: "Später" })} disabled={busy} aria-label="Aufgabe verschieben"><SkipForward size={17} /></button></div></article>)}</div>
    </section>
    <div className="care-grid"><section className="care-panel observatory-data-panel"><div className="care-panel__heading"><div><span className="eyebrow">PLAN</span><h2>Pflege anlegen</h2></div><Sparkles size={19} /></div><form className="care-form" onSubmit={event => { event.preventDefault(); if (!planTitle.trim()) return; createPlan.mutate({ title: planTitle.trim(), realm: planRealm, habitatId: planHabitat ? Number(planHabitat) : null }); setPlanTitle(""); setPlanHabitat(""); }}><label>Bereich<select value={planRealm} onChange={event => setPlanRealm(event.target.value as keyof typeof realmLabel)}><option value="botany">Botanik</option><option value="aquarium">Aquaristik</option><option value="terrarium">Terraristik</option></select></label><label>Anlage<select value={planHabitat} onChange={event => setPlanHabitat(event.target.value)}><option value="">Privater Bereich wählen …</option>{(habitats.data ?? []).map(habitat => <option key={habitat.id} value={habitat.id}>{habitat.name}</option>)}</select></label><label>Planname<input value={planTitle} onChange={event => setPlanTitle(event.target.value)} placeholder="z. B. Morgenpflege" maxLength={160} /></label><button className="primary-action" disabled={busy || !planTitle.trim()}><Plus size={16} /> PLAN SPEICHERN</button></form></section>
      <section className="care-panel observatory-data-panel"><div className="care-panel__heading"><div><span className="eyebrow">AUFGABE</span><h2>Für heute planen</h2></div></div>{plans.length === 0 ? <p className="care-empty">Zuerst einen privaten Plan anlegen.</p> : <form className="care-form" onSubmit={event => { event.preventDefault(); if (!taskTitle.trim() || !taskPlan) return; const interval = Number(repeatEveryDays); createTask.mutate({ planId: Number(taskPlan), title: taskTitle.trim(), dueAt: new Date(), repeatEveryDays: interval > 0 ? interval : null }); setTaskTitle(""); setRepeatEveryDays("0"); }}><label>Pflegeplan<select value={taskPlan} onChange={event => setTaskPlan(event.target.value)}><option value="">Plan wählen …</option>{plans.map(plan => <option key={plan.id} value={plan.id}>{realmLabel[plan.realm]} · {plan.title}</option>)}</select></label><label>Aufgabe<input value={taskTitle} onChange={event => setTaskTitle(event.target.value)} placeholder="z. B. Feuchtigkeit prüfen" maxLength={160} /></label><label>Wiederholung<select value={repeatEveryDays} onChange={event => setRepeatEveryDays(event.target.value)}><option value="0">Keine Wiederholung</option><option value="1">Täglich</option><option value="7">Wöchentlich</option><option value="14">Alle 14 Tage</option><option value="30">Monatlich</option></select></label><button className="secondary-action" disabled={busy || !taskTitle.trim() || !taskPlan}><Plus size={16} /> AUFGABE SPEICHERN</button></form>}</section></div>
    <section className="care-panel observatory-data-panel"><div className="care-panel__heading"><div><span className="eyebrow">JOURNAL · PRIVAT</span><h2>Pflegemoment festhalten</h2></div></div><form className="care-form care-form--journal" onSubmit={event => { event.preventDefault(); if (journal.trim()) addJournal.mutate({ note: journal.trim() }); }}><textarea value={journal} onChange={event => setJournal(event.target.value)} placeholder="Was hast du beobachtet oder verändert?" maxLength={4000} /><button className="primary-action" disabled={busy || !journal.trim()}>JOURNAL SPEICHERN</button></form>{mine.data?.journal?.slice(0, 3).map(entry => <div className="care-journal-entry" key={entry.id}><span>{new Date(entry.observedAt).toLocaleDateString("de-DE")}</span><p>{entry.note}</p></div>)}</section>
  </section>;
}
