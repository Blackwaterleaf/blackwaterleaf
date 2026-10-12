import { trpc } from "@/lib/trpc";
import { BarChart3, Globe2, LogIn, Timer, UsersRound } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import type { ReactNode } from "react";

function duration(seconds: number) {
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export function AdminAnalyticsPanel() {
  const auth = useAuth();
  const [days, setDays] = useState<1 | 7 | 30>(7);
  const [numbersOnly, setNumbersOnly] = useState(false);
  const analytics = trpc.analytics.overview.useQuery({ days }, { retry: false });
  if (auth.user?.email?.trim().toLowerCase() !== "blackwaterleaf@gmail.com") return <section className="admin-panel"><p className="eyebrow">[ANALYTICS / OWNER_ONLY]</p><h2>Nur für BlackWaterLeaf</h2><p>Diese Reichweitenzahlen sind ausschließlich für das Eigentümerkonto freigegeben.</p></section>;
  if (analytics.isLoading) return <section className="admin-panel"><p className="eyebrow">[ANALYTICS]</p><h2>Reichweite wird geladen</h2><p>Nur aggregierte, datensparsame Zahlen werden geladen.</p></section>;
  if (analytics.isError || !analytics.data) return <section className="admin-panel"><p className="eyebrow">[ANALYTICS / NICHT VERFÜGBAR]</p><h2>Analytics noch nicht aktiviert</h2><p>Die Datenbankmigration muss zuerst angewendet werden. Bis dahin werden keine Werte simuliert.</p></section>;
  const data = analytics.data;
  return <div className="admin-analytics">
    <section className="admin-panel admin-analytics__toolbar"><div><p className="eyebrow">[ECHTE REICHWEITE / ANONYM]</p><h2>Besucher & Nutzung</h2><p>Automatisch aggregiert: keine IP-Adressen, Namen, Konten oder Seiteninhalte. Länder kommen nur als zweistelliger Hosting-Code.</p></div><label className="analytics-period"><span>Zeitraum</span><select value={days} onChange={event => setDays(Number(event.target.value) as 1 | 7 | 30)}><option value={1}>24 Stunden</option><option value={7}>7 Tage</option><option value={30}>30 Tage</option></select></label><label className="analytics-period analytics-period--toggle"><span>Ansicht</span><span><input type="checkbox" checked={numbersOnly} onChange={event => setNumbersOnly(event.target.checked)} /> Nur Zahlen</span></label></section>
    <div className={numbersOnly ? "admin-analytics admin-analytics--numbers" : "admin-analytics"}><section className="admin-metrics"><Metric icon={<UsersRound />} label="Registrierte Konten" value={data.registeredAccounts} /><Metric icon={<BarChart3 />} label="Seitenaufrufe" value={data.pageViews} /><Metric icon={<UsersRound />} label="Besuche" value={data.visitors} /><Metric icon={<Timer />} label="Ø Dauer" value={duration(data.averageDurationSeconds)} /><Metric icon={<LogIn />} label="Logins im Zeitraum" value={data.loginCount} /><Metric icon={<Globe2 />} label="Absprungrate" value={`${data.bounceRate}%`} /></section>{numbersOnly ? null : <section className="admin-analytics__columns"><List title="Beliebte Seiten" rows={data.pages.map(row => ({ label: row.path, value: row.views }))} empty="Noch keine anonymen Seitenaufrufe vorhanden." /><List title="Länder" rows={data.countries.map(row => ({ label: row.countryCode, value: row.visitors, detail: `${row.views} Aufrufe` }))} empty="Noch keine Länderwerte vorhanden." /></section>}</div>
  </div>;
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) { return <div className="admin-metric"><span>{icon}</span><small>{label}</small><strong>{value}</strong></div>; }
function List({ title, rows, empty }: { title: string; rows: Array<{ label: string; value: number; detail?: string }>; empty: string }) { return <section className="admin-panel"><p className="eyebrow">[AUSWERTUNG]</p><h2>{title}</h2>{rows.length === 0 ? <p>{empty}</p> : <ol className="analytics-list">{rows.map(row => <li key={row.label}><span>{row.label}</span><strong>{row.value}</strong>{row.detail ? <small>{row.detail}</small> : null}</li>)}</ol>}</section>; }
