import { useAuth } from "@/_core/hooks/useAuth";
import { StatePanel } from "@/components/StatePanel";
import { trpc } from "@/lib/trpc";
import { Award, CalendarCheck, Flame, Medal, Star, Trophy } from "lucide-react";
import { Link } from "wouter";

export default function Ranking() {
  const auth = useAuth();
  const summary = trpc.gamification.summary.useQuery(undefined, { enabled: auth.isAuthenticated });
  const leaderboard = trpc.gamification.leaderboard.useQuery(undefined, { enabled: auth.isAuthenticated });
  const checkIn = trpc.gamification.dailyCheckIn.useMutation({ onSuccess: () => void summary.refetch() });
  if (!auth.isAuthenticated) return <div className="reference-page ranking-page"><StatePanel code="RANKING/AUTH" state="locked" title="ANMELDUNG ERFORDERLICH" body="Melde dich an, um deinen Score und die Bestenliste zu sehen." /></div>;
  if (summary.isLoading) return <div className="reference-page ranking-page"><StatePanel code="RANKING/LOAD" state="loading" title="RANKING WIRD GELADEN" body="Deine echten XP-Daten werden geladen …" /></div>;
  const data = summary.data;
  const xp = data?.status === "ready" ? data.totalXp : 0;
  const level = data?.status === "ready" ? data.level : 1;
  const next = data?.status === "ready" ? data.nextLevelXp : 100;
  return <div className="reference-page ranking-page">
    <div className="ranking-page__back"><Link href="/profile">‹ Profil</Link></div>
    <section className="ranking-intro"><span className="eyebrow">COMMUNITY · XP · FORTSCHRITT</span><h1>RANKING & ERFOLGE</h1><p>Sammele XP, halte deinen Streak und steige in der Community auf.</p></section>
    <section className="ranking-score glass-panel"><div><span>LEVEL {level}</span><h2>{level < 3 ? "Entdecker" : "Sammler"}</h2><small>Noch {Math.max(0, next - xp)} XP bis zum nächsten Level</small></div><strong>{xp}<small>XP GESAMT</small></strong><div className="ranking-progress"><i style={{ width: `${Math.min(100, Math.round((xp / Math.max(next, 1)) * 100))}%` }} /></div></section>
    <section className="ranking-stat-grid"><div><Flame /><strong>—</strong><small>TAGE-STREAK</small></div><div><Award /><strong>{data?.recentEvents.length ?? 0}</strong><small>AKTIVE EVENTS</small></div><div><Star /><strong>{xp}</strong><small>PUNKTE</small></div></section>
    <section className="ranking-checkin glass-panel"><CalendarCheck /><div><strong>TÄGLICHER CHECK-IN</strong><p>Hol dir XP und halte deinen Streak am Leben.</p></div><button type="button" className="primary-action" disabled={checkIn.isPending} onClick={() => checkIn.mutate()}>{checkIn.isPending ? "WIRD GESPEICHERT …" : "EINCHECKEN"}</button></section>
    <section className="ranking-section"><div className="ranking-section__heading"><Trophy /><h2>BESTENLISTE</h2></div>{leaderboard.isLoading ? <p className="form-status">Bestenliste wird geladen …</p> : !leaderboard.data?.length ? <p className="reference-list-empty">Noch keine öffentliche XP-Bestenliste vorhanden.</p> : <div className="ranking-list">{leaderboard.data.map(row => <div className="ranking-row" key={row.userId}><Medal className={`ranking-medal ranking-medal--${row.rank}`} /><span><strong>{row.name}</strong><small>Level {Math.floor(row.totalXp / 100) + 1}</small></span><b>{row.totalXp} XP</b></div>)}</div>}</section>
  </div>;
}
