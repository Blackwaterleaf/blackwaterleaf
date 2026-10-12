import { useAuth } from "@/_core/hooks/useAuth";
import { StatePanel } from "@/components/StatePanel";
import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { trpc } from "@/lib/trpc";
import { Award, CalendarCheck, Flame, Medal, Star, Target, Trophy } from "lucide-react";
import { Link } from "wouter";

export default function Ranking() {
  const auth = useAuth();
  const summary = trpc.gamification.summary.useQuery(undefined, { enabled: auth.isAuthenticated });
  const leaderboard = trpc.gamification.leaderboard.useQuery(undefined, { enabled: auth.isAuthenticated });
  const challenges = trpc.challenges.listPublished.useQuery({}, { enabled: auth.isAuthenticated });
  const myChallenges = trpc.challenges.myProgress.useQuery(undefined, { enabled: auth.isAuthenticated });
  const checkIn = trpc.gamification.dailyCheckIn.useMutation({ onSuccess: () => void summary.refetch() });
  const joinChallenge = trpc.challenges.join.useMutation({ onSuccess: () => void myChallenges.refetch() });
  if (!auth.isAuthenticated) return <div className="observatory-route observatory-route--botany ranking-page"><StatePanel code="RANKING/AUTH" state="locked" title="ANMELDUNG ERFORDERLICH" body="Melde dich an, um deinen Score und die Bestenliste zu sehen." /></div>;
  if (summary.isLoading) return <div className="observatory-route observatory-route--botany ranking-page"><StatePanel code="RANKING/LOAD" state="loading" title="RANKING WIRD GELADEN" body="Deine echten XP-Daten werden geladen …" /></div>;
  const data = summary.data;
  const xp = data?.status === "ready" ? data.totalXp : 0;
  const level = data?.status === "ready" ? data.level : 1;
  const next = data?.status === "ready" ? data.nextLevelXp : 100;
  return <div className="observatory-route observatory-route--botany ranking-page">
    <div className="ranking-page__back"><Link href="/profile">‹ Profil</Link></div>
    <ObservatoryContextHeader tone="botany" eyebrow="COMMUNITY · XP · FORTSCHRITT" title="RANKING & ERFOLGE" subtitle="Sammle XP, halte deinen Streak und steige in der Community auf." icon={Trophy} badge={`LEVEL ${level}`} />
    <section className="ranking-score observatory-data-panel"><div><span>LEVEL {level}</span><h2>{level < 3 ? "Entdecker" : "Sammler"}</h2><small>Noch {Math.max(0, next - xp)} XP bis zum nächsten Level</small></div><strong>{xp}<small>XP GESAMT</small></strong><div className="ranking-progress"><i style={{ width: `${Math.min(100, Math.round((xp / Math.max(next, 1)) * 100))}%` }} /></div></section>
    <section className="ranking-stat-grid"><div className="observatory-data-panel"><Flame /><strong>—</strong><small>TAGE-STREAK</small></div><div className="observatory-data-panel"><Award /><strong>{data?.recentEvents.length ?? 0}</strong><small>AKTIVE EVENTS</small></div><div className="observatory-data-panel"><Star /><strong>{xp}</strong><small>PUNKTE</small></div></section>
    <section className="ranking-challenges observatory-data-panel"><div className="ranking-section__heading"><Award /><div><span className="eyebrow">NUR NACH TEAM-PRÜFUNG</span><h2>QUALITÄTS-ACHIEVEMENTS</h2></div></div><p>Bestätigte Korrekturen verbessern nicht automatisch Modellgewichte. Sie werden als überprüfbare Fachbeiträge gewertet und fließen erst nach redaktioneller Pflege in den Katalog.</p><div className="challenge-list">{data?.status === "ready" ? data.qualityAchievements.map(achievement => <article className="challenge-card observatory-panel" key={achievement.key}><div><span className="system-chip">{achievement.achieved ? "BESTÄTIGT" : "IN PRÜFUNG"}</span><h3>{achievement.title}</h3><p>{achievement.description}</p></div><div className="challenge-card__action"><strong>{achievement.progress}/{achievement.threshold}</strong><small>BESTÄTIGTE BEITRÄGE</small></div></article>) : <p className="observatory-list-empty">Qualitäts-Achievements werden vorbereitet.</p>}</div></section>
    <section className="ranking-checkin observatory-data-panel"><CalendarCheck /><div><strong>TÄGLICHER CHECK-IN</strong><p>Hol dir XP und halte deinen Streak am Leben.</p></div><button type="button" className="primary-action" disabled={checkIn.isPending} onClick={() => checkIn.mutate()}>{checkIn.isPending ? "WIRD GESPEICHERT …" : "EINCHECKEN"}</button></section>
    <section className="ranking-challenges observatory-data-panel"><div className="ranking-section__heading"><Target /><div><span className="eyebrow">QUALITÄTSGEPRÜFTE EVENTS</span><h2>CHALLENGES</h2></div></div>{challenges.isLoading ? <p className="form-status">Freigegebene Challenges werden geladen …</p> : !challenges.data?.length ? <p className="observatory-list-empty">Aktuell ist keine Challenge veröffentlicht.</p> : <div className="challenge-list">{challenges.data.map(challenge => { const joined = myChallenges.data?.find(item => item.challengeId === challenge.id); return <article className="challenge-card observatory-panel" key={challenge.id}><div><span className="system-chip">{challenge.realm ?? "ALLE BEREICHE"}</span><h3>{challenge.title}</h3><p>{challenge.description}</p><small>{challenge.ruleText}</small></div><div className="challenge-card__action">{joined ? <><strong>{joined.progress}%</strong><small>{joined.status === "completed" ? "ABGESCHLOSSEN" : "TEILGENOMMEN"}</small></> : <button type="button" className="primary-action" disabled={joinChallenge.isPending} onClick={() => joinChallenge.mutate({ challengeId: challenge.id })}>{joinChallenge.isPending ? "…" : "TEILNEHMEN"}</button>}</div></article>; })}</div>}</section>
    <section className="ranking-section observatory-data-panel"><div className="ranking-section__heading"><Trophy /><h2>BESTENLISTE</h2></div>{leaderboard.isLoading ? <p className="form-status">Bestenliste wird geladen …</p> : !leaderboard.data?.length ? <p className="observatory-list-empty">Noch keine öffentliche XP-Bestenliste vorhanden.</p> : <div className="ranking-list">{leaderboard.data.map(row => <div className="ranking-row" key={row.userId}><Medal className={`ranking-medal ranking-medal--${row.rank}`} /><span><strong>{row.name}</strong><small>Level {Math.floor(row.totalXp / 100) + 1}</small></span><b>{row.totalXp} XP</b></div>)}</div>}</section>
  </div>;
}
