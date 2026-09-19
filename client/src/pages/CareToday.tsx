import { useMemo, useState } from "react";
import { Check, Clock3, Leaf, Plus, SkipForward, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const realmLabel = { botany: "Botanik", aquarium: "Aquaristik", terrarium: "Terraristik" } as const;

export default function CareToday() {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const today = trpc.care.today.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const mine = trpc.care.mine.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const createPlan = trpc.care.createPlan.useMutation({ onSuccess: () => { void utils.care.mine.invalidate(); } });
  const createTask = trpc.care.createTask.useMutation({ onSuccess: () => { void utils.care.today.invalidate(); void utils.care.mine.invalidate(); } });
  const updateTask = trpc.care.updateTask.useMutation({ onSuccess: () => { void utils.care.today.invalidate(); void utils.care.mine.invalidate(); } });
  const addJournal = trpc.care.addJournal.useMutation({ onSuccess: () => { void utils.care.mine.invalidate(); setJournal(""); } });
  const [planTitle, setPlanTitle] = useState("");
  const [planRealm, setPlanRealm] = useState<keyof typeof realmLabel>("botany");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPlan, setTaskPlan] = useState("");
  const [journal, setJournal] = useState("");
  const plans = mine.data?.plans ?? [];
  const openTasks = useMemo(() => (today.data?.tasks ?? []).filter(task => task.status === "open" || task.status === "snoozed"), [today.data?.tasks]);

  if (!auth.isAuthenticated) return <section className="reference-page route-botany"><div className="reference-hero"><span className="reference-hero__eyebrow">PFLEGE · PRIVAT</span><h1>DEIN HEUTE.</h1><p>Melde dich an, damit private Aufgaben und Journale nur in deinem Konto bleiben.</p><Link className="button button-primary" href="/login">ANMELDEN</Link></div></section>;

  const busy = createPlan.isPending || createTask.isPending || updateTask.isPending || addJournal.isPending;
  return <section className="reference-page care-page route-botany">
    <div className="reference-hero care-page__hero"><span className="reference-hero__eyebrow">PRIVATE CARE · {today.data?.date ?? "HEUTE"}</span><h1>HEUTE.</h1><p>Eine klare Handlung nach der anderen. Deine Pflege bleibt privat, steuerbar und nachvollziehbar.</p><div className="care-page__hero-actions"><Link className="button button-secondary" href="/profile/habitats">ANLAGEN</Link><span className="care-page__privacy"><Leaf size={14} /> PRIVAT ALS STANDARD</span></div></div>
    <section className="care-panel" aria-labelledby="care-open-heading"><div className="care-panel__heading"><div><span className="reference-hero__eyebrow">JETZT</span><h2 id="care-open-heading">Offene Aufgaben</h2></div><span className="care-count">{openTasks.length}</span></div>
      {today.isLoading ? <p className="form-status" aria-live="polite">Heute wird geladen …</p> : null}
      {!today.isLoading && openTasks.length === 0 ? <p className="care-empty">Für heute ist nichts offen. Lege unten eine Aufgabe an oder halte einen Pflege-Moment im Journal fest.</p> : null}
      <div className="care-task-list">{openTasks.map(task => <article className="care-task" key={task.id}><div className="care-task__icon"><Clock3 size={18} /></div><div className="care-task__copy"><strong>{task.title}</strong><span>{new Date(task.dueAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} · {task.status === "snoozed" ? "verschoben" : "offen"}</span></div><div className="care-task__actions"><button className="icon-button" type="button" onClick={() => updateTask.mutate({ taskId: Number(task.id), status: "done" })} disabled={busy} aria-label="Aufgabe erledigen"><Check size={17} /></button><button className="icon-button" type="button" onClick={() => updateTask.mutate({ taskId: Number(task.id), status: "snoozed", reason: "Später" })} disabled={busy} aria-label="Aufgabe verschieben"><SkipForward size={17} /></button></div></article>)}</div>
    </section>
    <div className="care-grid"><section className="care-panel"><div className="care-panel__heading"><div><span className="reference-hero__eyebrow">PLAN</span><h2>Pflege anlegen</h2></div><Sparkles size={19} /></div><form className="care-form" onSubmit={event => { event.preventDefault(); if (!planTitle.trim()) return; createPlan.mutate({ title: planTitle.trim(), realm: planRealm }); setPlanTitle(""); }}><label>Bereich<select value={planRealm} onChange={event => setPlanRealm(event.target.value as keyof typeof realmLabel)}><option value="botany">Botanik</option><option value="aquarium">Aquaristik</option><option value="terrarium">Terraristik</option></select></label><label>Planname<input value={planTitle} onChange={event => setPlanTitle(event.target.value)} placeholder="z. B. Morgenpflege" maxLength={160} /></label><button className="button button-primary" disabled={busy || !planTitle.trim()}><Plus size={16} /> PLAN SPEICHERN</button></form></section>
      <section className="care-panel"><div className="care-panel__heading"><div><span className="reference-hero__eyebrow">AUFGABE</span><h2>Für heute planen</h2></div></div>{plans.length === 0 ? <p className="care-empty">Zuerst einen privaten Plan anlegen.</p> : <form className="care-form" onSubmit={event => { event.preventDefault(); if (!taskTitle.trim() || !taskPlan) return; createTask.mutate({ planId: Number(taskPlan), title: taskTitle.trim(), dueAt: new Date() }); setTaskTitle(""); }}><label>Pflegeplan<select value={taskPlan} onChange={event => setTaskPlan(event.target.value)}><option value="">Plan wählen …</option>{plans.map(plan => <option key={plan.id} value={plan.id}>{realmLabel[plan.realm]} · {plan.title}</option>)}</select></label><label>Aufgabe<input value={taskTitle} onChange={event => setTaskTitle(event.target.value)} placeholder="z. B. Feuchtigkeit prüfen" maxLength={160} /></label><button className="button button-secondary" disabled={busy || !taskTitle.trim() || !taskPlan}><Plus size={16} /> AUFGABE SPEICHERN</button></form>}</section></div>
    <section className="care-panel"><div className="care-panel__heading"><div><span className="reference-hero__eyebrow">JOURNAL · PRIVAT</span><h2>Pflegemoment festhalten</h2></div></div><form className="care-form care-form--journal" onSubmit={event => { event.preventDefault(); if (journal.trim()) addJournal.mutate({ note: journal.trim() }); }}><textarea value={journal} onChange={event => setJournal(event.target.value)} placeholder="Was hast du beobachtet oder verändert?" maxLength={4000} /><button className="button button-primary" disabled={busy || !journal.trim()}>JOURNAL SPEICHERN</button></form>{mine.data?.journal?.slice(0, 3).map(entry => <div className="care-journal-entry" key={entry.id}><span>{new Date(entry.observedAt).toLocaleDateString("de-DE")}</span><p>{entry.note}</p></div>)}</section>
  </section>;
}
