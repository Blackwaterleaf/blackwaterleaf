import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { StatePanel } from "@/components/StatePanel";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { readImageAsBase64 } from "@/lib/files";
import { trpc } from "@/lib/trpc";
import { Activity, BadgeCheck, Check, Coins, Edit3, EyeOff, ImagePlus, LayoutDashboard, Megaphone, MessageSquareHeart, Plus, RotateCcw, Shield, ShieldAlert, SlidersHorizontal, UsersRound, Send, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { AdminAnalyticsPanel } from "@/components/AdminAnalyticsPanel";

const menuItems: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Übersicht", path: "/admin" },
  { icon: ShieldAlert, label: "Moderation", path: "/admin/moderation" },
  { icon: UsersRound, label: "Konten", path: "/admin/accounts" },
  { icon: Megaphone, label: "Händlerfreigaben", path: "/admin/merchant-approvals" },
  { icon: Activity, label: "Analytics", path: "/admin/analytics" },
  { icon: Coins, label: "KI-Kontingente", path: "/admin/ai-usage" },
];

function roleLabel(role: "user" | "moderator" | "admin" | "merchant") {
  return role === "admin" ? "ADMIN" : role === "moderator" ? "MODERATOR" : role === "merchant" ? "HÄNDLER" : "NUTZER";
}

type SelectableRole = "admin" | "moderator" | "merchant";

function RolePicker({ account, currentUserId, pending, onSave, disabled }: { account: { id: number; roles: SelectableRole[]; role: "user" | "moderator" | "admin" }; currentUserId?: number; pending: boolean; onSave: (roles: SelectableRole[]) => void; disabled: boolean }) {
  const [roles, setRoles] = useState<SelectableRole[]>(account.roles);
  useEffect(() => setRoles(account.roles), [account.roles]);
  return <div className="role-picker" aria-label={`Rollen für Konto ${account.id}`}>
    <div className="role-picker__options">{(["admin", "moderator", "merchant"] as const).map(role => <label key={role}><input type="checkbox" checked={roles.includes(role)} disabled={disabled || pending || account.id === currentUserId} onChange={event => setRoles(current => event.target.checked ? [...current, role] : current.filter(item => item !== role))} />{roleLabel(role)}</label>)}</div>
    <button type="button" className="secondary-action" disabled={disabled || pending || account.id === currentUserId} onClick={() => { if (window.confirm("Die ausgewählten Kontorollen wirklich speichern?")) onSave(roles); }}>ROLLEN SPEICHERN</button>
  </div>;
}

function ProAccessPicker({ account, pending, onSave }: { account: { id: number; proAccess: { active: boolean; manuallyGranted: boolean; forcedFree: boolean; source: "admin" | "admin_grant" | "stripe" | "none"; expiresAt: Date | null } }; pending: boolean; onSave: (active: boolean) => void }) {
  const [active, setActive] = useState(account.proAccess.manuallyGranted);
  useEffect(() => setActive(account.proAccess.manuallyGranted), [account.proAccess.manuallyGranted]);
  const label = account.proAccess.source === "admin" ? "ADMIN · VOLLZUGRIFF" : account.proAccess.source === "admin_grant" ? "FULL ABO · ADMIN-FREIGEGEBEN" : account.proAccess.forcedFree ? "FREE · ADMIN ERZWUNGEN" : account.proAccess.source === "stripe" ? "STRIPE · PRO AKTIV" : "FREE / KAUF ERFORDERLICH";
  return <div className="pro-access-picker" aria-label={`Pro-Freigabe für Konto ${account.id}`}>
    <span className={`system-chip ${account.proAccess.active ? "" : "system-chip--pending"}`}>{label}</span>
    <button type="button" className="secondary-action" disabled={pending || account.proAccess.source === "admin"} onClick={() => { const next = !active; if (window.confirm(next ? "Full Abo für dieses Konto freischalten? Ein bestehendes Stripe-Pro wird damit ebenfalls übersteuert." : "Für dieses Konto Free erzwingen und Pro sperren?")) { setActive(next); onSave(next); } }}>{account.proAccess.source === "admin" ? "AUTOMATISCH AKTIV" : active ? "FREE SETZEN" : "FULL ABO FREIGEBEN · PRO FREISCHALTEN"}</button>
  </div>;
}

export default function AdminDashboard() {
  const auth = useAuth();
  const [location, setLocation] = useLocation();
  const isStaff = auth.user?.status === "active" && (auth.user.role === "moderator" || auth.user.role === "admin");
  const section = location.split("/")[2]?.split("?")[0] ?? "overview";
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const focus = params.get("focus");
    if (!focus) return;
    window.requestAnimationFrame(() => document.getElementById(focus === "partner" ? "partner-inquiry-inbox" : "feedback-inbox")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [location]);

  if (auth.loading) return <StatePanel code="ADMIN/LOAD" state="loading" title="KONTROLLZENTRUM WIRD GEPRÜFT" body="Die serverseitige Berechtigung wird geladen." />;
  if (!auth.isAuthenticated) return <StatePanel code="ADMIN/AUTH" title="ANMELDUNG ERFORDERLICH" body="Das Kontrollzentrum ist ausschließlich für verifizierte Teamkonten erreichbar." action={<button type="button" className="primary-action" onClick={startLogin}>ANMELDEN</button>} />;
  if (!isStaff) return <StatePanel code="ADMIN/FORBIDDEN" state="locked" title="KEINE TEAMBERECHTIGUNG" body="Diese Route ist serverseitig für aktive Moderations- und Adminrollen geschützt." />;

  return (
    <DashboardLayout menuItems={auth.user?.role === "admin" ? menuItems : menuItems.slice(0, 2)} title="BLACKWATERLEAF ADMIN">
      <div className="admin-console">
        <header className="admin-console__header">
          <div><p className="eyebrow">[SERVER_VERIFIED / {roleLabel(auth.user!.role)}]</p><h1>Kontrollzentrum</h1></div>
          <button className="secondary-action" type="button" onClick={() => setLocation("/profile")}><Shield size={16} />ZUM PROFIL</button>
        </header>
        {section === "moderation" ? <ModerationPanel /> : section === "accounts" ? <AccountsPanel /> : section === "partners" ? <><PartnersPanel /><PartnerInquiryInbox /></> : section === "merchant-approvals" ? <PartnersPanel /> : section === "analytics" ? <AdminAnalyticsPanel /> : section === "ai-usage" ? <AiUsagePanel /> : <OverviewPanel onOpenModeration={() => setLocation("/admin/moderation")} onOpenAccounts={() => setLocation("/admin/accounts")} onOpenPartners={() => setLocation("/admin/merchant-approvals")} />}
      </div>
    </DashboardLayout>
  );
}

function OverviewPanel({ onOpenModeration, onOpenAccounts, onOpenPartners }: { onOpenModeration: () => void; onOpenAccounts: () => void; onOpenPartners: () => void }) {
  const overview = trpc.admin.overview.useQuery();
  const audit = trpc.admin.auditTrail.useQuery();
  const analytics = trpc.analytics.overview.useQuery({ days: 7 }, { retry: false });
  if (overview.isLoading || audit.isLoading) return <StatePanel code="ADMIN/SYNC" state="loading" title="ECHTE STATUSDATEN WERDEN GELADEN" body="Es werden keine Kennzahlen simuliert." />;
  if (overview.isError || audit.isError || !overview.data || !audit.data) return <StatePanel code="ADMIN/ERROR" state="error" title="KONTROLLZENTRUM NICHT VERFÜGBAR" body="Die serverseitigen Statusdaten konnten nicht verifiziert werden." />;
  return <>
    <section className="admin-metrics">
      <Metric icon={<UsersRound />} label="Konten" value={overview.data.accounts} />
      <Metric icon={<BadgeCheck />} label="Aktiv" value={overview.data.activeAccounts} />
      <Metric icon={<Activity />} label="Öffentliche Beiträge" value={overview.data.publicPosts} />
      <Metric icon={<EyeOff />} label="Ausgeblendet" value={overview.data.hiddenPosts} />
      {analytics.data ? <Metric icon={<EyeOff />} label="Seitenaufrufe · 7 Tage" value={analytics.data.pageViews} /> : null}
      {analytics.data ? <Metric icon={<UsersRound />} label="Besuche · 7 Tage" value={analytics.data.visitors} /> : null}
    </section>
    {!analytics.isLoading && analytics.isError ? <p className="admin-inline-note">Reichweitenwerte sind nur für das Betreiber-Konto freigeschaltet.</p> : null}
    <section className="admin-grid">
      <section className="admin-panel"><p className="eyebrow">[MODERATION]</p><h2>Öffentliche Inhalte</h2><button className="primary-action" type="button" onClick={onOpenModeration}>MODERATION ÖFFNEN</button></section>
      <section className="admin-panel"><p className="eyebrow">[KONTEN]</p><h2>Rollen & Status</h2><button className="primary-action" type="button" onClick={onOpenAccounts}>KONTEN ÖFFNEN</button></section>
      <section className="admin-panel"><p className="eyebrow">[PARTNER]</p><h2>Werbeplätze</h2><button className="primary-action" type="button" onClick={onOpenPartners}>PARTNER ÖFFNEN</button></section>
    </section>
    <BroadcastPanel />
    <FeedbackInbox />
    <PartnerInquiryInbox />
    <section className="admin-panel"><p className="eyebrow">[AUDIT_LEDGER]</p><h2>Letzte nachvollziehbare Aktionen</h2>{audit.data.length === 0 ? <p>Es liegen noch keine signierten Verwaltungsaktionen vor.</p> : <ul className="audit-list">{audit.data.map(entry => <li key={entry.id}><span>{entry.action}</span><small>{entry.targetType} #{entry.targetId} · {new Date(entry.createdAt).toLocaleString("de-DE")}</small></li>)}</ul>}</section>
  </>;
}

function AiUsagePanel() {
  const usage = trpc.admin.aiUsage.useQuery();
  const utils = trpc.useUtils();
  const updatePolicy = trpc.admin.updateAiPolicy.useMutation({ onSuccess: () => void utils.admin.aiUsage.invalidate() });
  const adjustCredits = trpc.admin.adjustAiCredits.useMutation({ onSuccess: () => void utils.admin.aiUsage.invalidate() });
  const [policy, setPolicy] = useState({ freeDailyIdentifications: 2, proMonthlyIdentifications: 60, globalDailyIdentifications: 100 });
  const [delta, setDelta] = useState<Record<number, string>>({});
  useEffect(() => { if (usage.data) setPolicy({ freeDailyIdentifications: usage.data.policy.freeDailyIdentifications, proMonthlyIdentifications: usage.data.policy.proMonthlyIdentifications, globalDailyIdentifications: usage.data.policy.globalDailyIdentifications }); }, [usage.data]);
  if (usage.isLoading) return <StatePanel code="AI_USAGE/LOAD" state="loading" title="KI-KONTINGENTE WERDEN GELADEN" body="Nutzung, Limits und Credit-Guthaben werden serverseitig geprüft." />;
  if (usage.isError || !usage.data) return <StatePanel code="AI_USAGE/ERROR" state="error" title="KI-KONTINGENTE NICHT VERFÜGBAR" body="Die geschützten KI-Nutzungsdaten konnten nicht geladen werden." />;
  const savePolicy = () => void updatePolicy.mutateAsync(policy);
  return <div className="admin-grid admin-grid--single">
    <section className="admin-panel"><p className="eyebrow">[KI_LIMITS / ADMIN_ONLY]</p><h2><SlidersHorizontal size={18} /> Strikte Nutzungssteuerung</h2><p>Diese Grenzen werden vor jedem kostenpflichtigen Bildmodell serverseitig reserviert. Änderungen gelten sofort und können keine bereits verbrauchten Credits zurückholen.</p><div className="form-grid ai-policy-grid"><label className="field"><span>Free pro Tag</span><input type="number" min={0} max={100} value={policy.freeDailyIdentifications} onChange={event => setPolicy(current => ({ ...current, freeDailyIdentifications: Number(event.target.value) }))} /></label><label className="field"><span>Pro pro Monat</span><input type="number" min={0} max={10000} value={policy.proMonthlyIdentifications} onChange={event => setPolicy(current => ({ ...current, proMonthlyIdentifications: Number(event.target.value) }))} /></label><label className="field"><span>Global pro Tag</span><input type="number" min={1} max={1000000} value={policy.globalDailyIdentifications} onChange={event => setPolicy(current => ({ ...current, globalDailyIdentifications: Number(event.target.value) }))} /></label></div><button className="primary-action" type="button" disabled={updatePolicy.isPending} onClick={savePolicy}>LIMITS SPEICHERN</button></section>
    <section className="admin-metrics"><Metric icon={<Coins />} label="Global heute" value={usage.data.globalUsed} /><Metric icon={<UsersRound />} label="Globales Limit" value={usage.data.policy.globalDailyIdentifications} /><Metric icon={<Activity />} label="Free pro Tag" value={usage.data.policy.freeDailyIdentifications} /><Metric icon={<BadgeCheck />} label="Pro pro Monat" value={usage.data.policy.proMonthlyIdentifications} /></section>
    <section className="admin-panel"><p className="eyebrow">[CREDIT_WALLETS / SERVER_VERIFIED]</p><h2>KI-Guthaben pro Konto</h2><p>Gekaufte Credits werden ausschließlich per Stripe-Webhook gutgeschrieben. Manuelle Korrekturen sind auditierbar.</p><div className="admin-list">{usage.data.accounts.map(account => <article className="admin-row" key={account.id}><div><strong>{account.name ?? account.email ?? `Konto #${account.id}`}</strong><small>{account.email ?? "Keine E-Mail"} · heute {account.todayIdentifications} Bestimmungen</small></div><div className="admin-row__actions"><span className="system-chip">{account.credits} Credits</span><input aria-label={`Creditänderung für Konto ${account.id}`} className="admin-credit-input" type="number" min={-10000} max={10000} placeholder="± Credits" value={delta[account.id] ?? ""} onChange={event => setDelta(current => ({ ...current, [account.id]: event.target.value }))} /><button type="button" className="admin-icon-action" title="Credits anpassen" aria-label={`Credits für Konto ${account.id} anpassen`} disabled={adjustCredits.isPending || !delta[account.id]} onClick={() => void adjustCredits.mutateAsync({ userId: account.id, delta: Number(delta[account.id]) }).then(() => setDelta(current => ({ ...current, [account.id]: "" })))}><Coins size={15} /></button></div></article>)}</div></section>
  </div>;
}

function FeedbackInbox() {
  const feedback = trpc.feedback.staffQueue.useQuery();
  if (feedback.isLoading) return <section id="feedback-inbox" className="admin-panel"><p className="eyebrow">[DIRECT_FEEDBACK]</p><h2>Direkter Eingang</h2><p>Feedback wird geladen …</p></section>;
  if (feedback.isError || !feedback.data) return <section id="feedback-inbox" className="admin-panel"><p className="eyebrow">[DIRECT_FEEDBACK]</p><h2>Direkter Eingang</h2><p>Der Feedback-Eingang ist derzeit nicht verfügbar.</p></section>;
  return <section id="feedback-inbox" className="admin-panel"><p className="eyebrow">[DIRECT_FEEDBACK / SERVER_VERIFIED]</p><h2><MessageSquareHeart size={18} /> Meldungen, Probleme & Wünsche</h2>{feedback.data.length === 0 ? <p>Noch keine eingegangenen Rückmeldungen.</p> : <div className="admin-list">{feedback.data.map(item => <FeedbackAdminRow key={item.id} item={item} />)}</div>}</section>;
}

function FeedbackAdminRow({ item }: { item: { id: number; userId: number; kind: "feedback" | "problem" | "wish"; message: string; page: string | null; status: "received" | "reviewing" | "resolved"; adminNote: string | null; responseMessage: string | null; createdAt: Date; userName: string | null; userEmail: string | null } }) {
  const utils = trpc.useUtils();
  const update = trpc.feedback.updateStaffEntry.useMutation({ onSuccess: () => void utils.feedback.staffQueue.invalidate() });
  const [status, setStatus] = useState(item.status);
  const [note, setNote] = useState(item.adminNote ?? "");
  const [response, setResponse] = useState(item.responseMessage ?? "");
  const save = async () => { await update.mutateAsync({ id: item.id, status, adminNote: note.trim() || null, responseMessage: response.trim() || null }); };
  return <article className="admin-row admin-inbox-row"><div className="admin-inbox-copy"><strong>#{item.id} · {item.kind === "problem" ? "Problem" : item.kind === "wish" ? "Wunsch / Verbesserung" : "Feedback"}</strong><p>{item.message}</p><small>{item.userName ?? item.userEmail ?? `Konto #${item.userId}`} · {item.page ?? "ohne Seitenangabe"} · {new Date(item.createdAt).toLocaleString("de-DE")}</small><label className="admin-inbox-field"><span>Interne Bearbeitungsnotiz</span><textarea value={note} onChange={event => setNote(event.target.value)} rows={2} maxLength={2000} placeholder="Nur für das Team sichtbar …" /></label><label className="admin-inbox-field"><span>Antwort an den Absender</span><textarea value={response} onChange={event => setResponse(event.target.value)} rows={2} maxLength={4000} placeholder="Wird als Benachrichtigung gesendet …" /></label></div><div className="admin-row__actions admin-inbox-actions"><select aria-label={`Status für Feedback #${item.id}`} value={status} onChange={event => setStatus(event.target.value as typeof status)}><option value="received">Eingegangen</option><option value="reviewing">In Prüfung</option><option value="resolved">Erledigt</option></select><button type="button" className="admin-icon-action" aria-label={`Feedback #${item.id} speichern`} title="Speichern und Antwort senden" disabled={update.isPending} onClick={() => void save()}>{response.trim() ? <Send size={15} /> : <Save size={15} />}</button></div></article>;
}

function PartnerInquiryInbox() {
  const inquiries = trpc.partners.inquiryQueue.useQuery();
  if (inquiries.isLoading) return <section id="partner-inquiry-inbox" className="admin-panel"><p className="eyebrow">[PARTNER_INQUIRIES]</p><h2>Partneranfragen</h2><p>Anfragen werden geladen …</p></section>;
  if (inquiries.isError || !inquiries.data) return <section id="partner-inquiry-inbox" className="admin-panel"><p className="eyebrow">[PARTNER_INQUIRIES]</p><h2>Partneranfragen</h2><p>Die Partneranfragen sind derzeit nicht verfügbar.</p></section>;
  return <section id="partner-inquiry-inbox" className="admin-panel"><p className="eyebrow">[PARTNER_INQUIRIES / ADMIN_ONLY]</p><h2>Partner werden · Eingang</h2>{inquiries.data.length === 0 ? <p>Noch keine Partneranfragen.</p> : <div className="admin-list">{inquiries.data.map(item => <PartnerInquiryAdminRow key={item.id} item={item} />)}</div>}</section>;
}

function PartnerInquiryAdminRow({ item }: { item: { id: number; userId: number | null; organizationName: string | null; contactName: string | null; organizationType: string | null; contactEmail: string; website: string | null; message: string; status: "received" | "reviewing" | "accepted" | "declined"; adminNote: string | null; responseMessage: string | null; createdAt: Date; userName: string | null } }) {
  const utils = trpc.useUtils();
  const update = trpc.partners.updateInquiry.useMutation({ onSuccess: () => void utils.partners.inquiryQueue.invalidate() });
  const [status, setStatus] = useState(item.status);
  const [note, setNote] = useState(item.adminNote ?? "");
  const [response, setResponse] = useState(item.responseMessage ?? "");
  const save = async () => { await update.mutateAsync({ id: item.id, status, adminNote: note.trim() || null, responseMessage: response.trim() || null }); };
  return <article className="admin-row admin-inbox-row"><div className="admin-inbox-copy"><strong>#{item.id} · {item.organizationName ?? item.userName ?? "Partnerinteressent"}</strong><p>{item.message}</p><small>{item.contactName ? `${item.contactName} · ` : ""}{item.organizationType ? `${item.organizationType} · ` : ""}{item.contactEmail} · {new Date(item.createdAt).toLocaleString("de-DE")}{item.website ? ` · ${item.website}` : ""}</small><label className="admin-inbox-field"><span>Interne Bearbeitungsnotiz</span><textarea value={note} onChange={event => setNote(event.target.value)} rows={2} maxLength={2000} placeholder="Nur für das Team sichtbar …" /></label><label className="admin-inbox-field"><span>Antwort an den Absender</span><textarea value={response} onChange={event => setResponse(event.target.value)} rows={2} maxLength={4000} placeholder="Wird als E-Mail gesendet …" /></label></div><div className="admin-row__actions admin-inbox-actions"><select aria-label={`Status für Partneranfrage #${item.id}`} value={status} onChange={event => setStatus(event.target.value as typeof status)}><option value="received">Eingegangen</option><option value="reviewing">In Prüfung</option><option value="accepted">Angenommen</option><option value="declined">Abgelehnt</option></select><button type="button" className="admin-icon-action" aria-label={`Partneranfrage #${item.id} speichern`} title="Speichern und Antwort senden" disabled={update.isPending} onClick={() => void save()}>{response.trim() ? <Send size={15} /> : <Save size={15} />}</button></div></article>;
}

function BroadcastPanel() {
  const utils = trpc.useUtils();
  const broadcasts = trpc.admin.broadcasts.useQuery();
  const create = trpc.admin.broadcast.useMutation({ onSuccess: () => { void utils.admin.broadcasts.invalidate(); setNewContent(""); setNewPublishAt(""); setNewExpiresAt(""); } });
  const update = trpc.admin.updateBroadcast.useMutation({ onSuccess: () => void utils.admin.broadcasts.invalidate() });
  const retract = trpc.admin.retractBroadcast.useMutation({ onSuccess: () => { void utils.admin.broadcasts.invalidate(); void utils.admin.auditTrail.invalidate(); } });
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPublishAt, setNewPublishAt] = useState("");
  const [newExpiresAt, setNewExpiresAt] = useState("");
  if (broadcasts.isLoading) return <section className="admin-panel"><p>Broadcasts werden geladen …</p></section>;
  if (broadcasts.isError || !broadcasts.data) return <section className="admin-panel"><p>Broadcasts sind derzeit nicht verfügbar.</p></section>;
  return <section className="admin-panel"><p className="eyebrow">[ADMIN_FEED_BROADCASTS]</p><h2>Feed-Broadcasts</h2><form className="admin-broadcast-form" onSubmit={event => { event.preventDefault(); if (!newContent.trim()) return; void create.mutateAsync({ content: newContent.trim(), realm: null, publishAt: newPublishAt ? new Date(newPublishAt) : undefined, expiresAt: newExpiresAt ? new Date(newExpiresAt) : undefined }); }}><textarea value={newContent} onChange={event => setNewContent(event.target.value)} rows={3} placeholder="Neue Information an alle Feeds …" required /><div className="admin-broadcast-form__times"><label>Veröffentlichen ab<input type="datetime-local" value={newPublishAt} onChange={event => setNewPublishAt(event.target.value)} /></label><label>Ausblenden ab<input type="datetime-local" value={newExpiresAt} onChange={event => setNewExpiresAt(event.target.value)} /></label></div><button className="primary-action" type="submit" disabled={create.isPending}>BROADCAST PLANEN / SENDEN</button></form>{broadcasts.data.length === 0 ? <p>Noch keine Admin-Broadcasts.</p> : <div className="admin-list">{broadcasts.data.map(item => <article className="admin-row" key={item.id}><div><strong>#{item.id} · {item.realm ?? "Alle Feeds"} · {item.status}</strong>{editing === item.id ? <textarea value={draft} onChange={event => setDraft(event.target.value)} rows={3} /> : <p>{item.content}</p>}<small>{new Date(item.createdAt).toLocaleString("de-DE")} · {item.publishAt ? `ab ${new Date(item.publishAt).toLocaleString("de-DE")}` : "sofort"}{item.expiresAt ? ` · bis ${new Date(item.expiresAt).toLocaleString("de-DE")}` : ""}</small></div><div className="admin-row__actions">{editing === item.id ? <button type="button" className="admin-icon-action" aria-label="Broadcast speichern" title="Speichern" disabled={update.isPending} onClick={() => void update.mutateAsync({ id: item.id, content: draft, realm: item.realm }) .then(() => setEditing(null))}><Check size={15} /></button> : <button type="button" className="admin-icon-action" aria-label="Broadcast bearbeiten" title="Bearbeiten" onClick={() => { setEditing(item.id); setDraft(item.content); }}><Edit3 size={15} /></button>}{item.status === "published" ? <button type="button" className="admin-icon-action admin-icon-action--danger" aria-label="Broadcast zurückziehen" title="Zurückziehen" disabled={retract.isPending} onClick={() => { if (window.confirm("Diese Information wirklich aus allen Feeds zurückziehen?")) void retract.mutateAsync({ id: item.id }); }}><RotateCcw size={15} /></button> : null}</div></article>)}</div>}</section>;
}

function ModerationPanel() {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const posts = trpc.admin.publicPosts.useQuery();
  const corrections = trpc.admin.plantCorrections.useQuery();
  const observationReviews = trpc.admin.observationReviewQueue.useQuery();
  const moderate = trpc.admin.setPublicPostStatus.useMutation({ onSuccess: () => void utils.admin.publicPosts.invalidate() });
  const deletePost = trpc.admin.deletePublicPost.useMutation({ onSuccess: () => { void utils.admin.publicPosts.invalidate(); void utils.admin.auditTrail.invalidate(); } });
  const review = trpc.admin.reviewPlantCorrection.useMutation({ onSuccess: () => { void utils.admin.plantCorrections.invalidate(); void utils.admin.auditTrail.invalidate(); } });
  const reviewObservation = trpc.admin.reviewObservation.useMutation({ onSuccess: () => { void utils.admin.observationReviewQueue.invalidate(); void utils.admin.auditTrail.invalidate(); } });
  const reviewObservationWithReason = (id: number, evidenceState: "confirmed" | "contextual" | "conflicting" | "insufficient") => { const note = window.prompt("Prüfbegründung für diese Beobachtung:", "") ?? ""; if (!note.trim()) return; void reviewObservation.mutateAsync({ id, evidenceState, note: note.trim() }); };
  const reviewWithReason = (id: number, status: "approved" | "rejected") => { const note = window.prompt(status === "approved" ? "Kurze Prüfbegründung (optional):" : "Warum wird die Korrektur abgelehnt?", "") ?? ""; if (status === "rejected" && !note.trim()) return; void review.mutateAsync({ id, status, note: note.trim() || undefined }); };
  if (posts.isLoading || corrections.isLoading || observationReviews.isLoading) return <StatePanel code="MODERATION/LOAD" state="loading" title="MODERATION WIRD GELADEN" body="Öffentliche Inhalte und KI-Korrekturen werden serverseitig geprüft." />;
  if (posts.isError || corrections.isError || observationReviews.isError || !posts.data || !corrections.data || !observationReviews.data) return <StatePanel code="MODERATION/ERROR" state="error" title="MODERATION NICHT VERFÜGBAR" body="Die serverseitigen Moderationsdaten konnten nicht verifiziert werden." />;
  return <div className="admin-grid admin-grid--single">
    <section className="admin-panel"><p className="eyebrow">[KI_CORRECTIONS / STAFF_ONLY]</p><h2>Pflanzenkorrekturen prüfen</h2><p>Die ursprüngliche KI-Antwort bleibt erhalten. Nutzerkorrekturen werden erst nach Prüfung als geprüft markiert.</p>{corrections.data.length === 0 ? <p>Keine offenen Pflanzenkorrekturen.</p> : <div className="admin-list">{corrections.data.map(correction => <article key={correction.id} className="admin-row"><div><strong>#{correction.id} · {correction.correctedName}</strong><p>{correction.correctionNote ?? "Keine Begründung angegeben."}</p><small>{correction.userName ?? correction.userEmail ?? `Konto #${correction.userId}`} · {new Date(correction.createdAt).toLocaleString("de-DE")}</small><details><summary>Originale KI-Antwort anzeigen</summary><p>{correction.originalAnswer}</p></details></div><div className="admin-row__actions"><button className="secondary-action" disabled={review.isPending} onClick={() => reviewWithReason(correction.id, "approved")}>BESTÄTIGEN</button><button className="secondary-action danger-action" disabled={review.isPending} onClick={() => reviewWithReason(correction.id, "rejected")}>ABLEHNEN</button></div></article>)}</div>}</section>
    <section className="admin-panel"><p className="eyebrow">[PUBLIC_CONTENT_ONLY]</p><h2>Öffentliche Inhalte</h2>{posts.data.length === 0 ? <p>Keine real veröffentlichten Community-Beiträge zur Moderation.</p> : <div className="admin-list">{posts.data.map(post => <article key={post.id} className="admin-row"><div><strong>#{post.id} · {post.realm ?? "ohne Bereich"}</strong><p>{post.content}</p><small>{new Date(post.createdAt).toLocaleString("de-DE")}</small></div><div className="admin-row__actions"><button className="secondary-action" disabled={moderate.isPending} onClick={() => { if (window.confirm("Diesen öffentlichen Beitrag ausblenden?")) void moderate.mutateAsync({ id: post.id, status: "hidden" }); }}>AUSBLENDEN</button>{auth.user?.role === "admin" ? <button className="secondary-action danger-action" disabled={deletePost.isPending} onClick={() => { if (window.confirm("Diesen öffentlichen Beitrag für alle aus dem Feed entfernen?")) void deletePost.mutateAsync({ id: post.id }); }}>LÖSCHEN</button> : null}</div></article>)}</div>}</section>
    <section className="admin-panel"><p className="eyebrow">[OBSERVATIONS / STAFF_ONLY]</p><h2>Beobachtungen prüfen</h2><p>Nur zur Prüfung eingereichte Beobachtungen erscheinen hier. Jede Entscheidung speichert Status, Begründung, prüfende Rolle und Zeitpunkt.</p>{observationReviews.data.length === 0 ? <p>Keine offenen Beobachtungen.</p> : <div className="admin-list">{observationReviews.data.map(observation => <article key={observation.id} className="admin-row"><div><strong>#{observation.id} · {observation.realm} · {observation.subject ?? observation.scientificName ?? "ohne Bestimmung"}</strong><p>{observation.scientificName ?? "Bestimmung offen"}</p><small>{observation.ownerName ?? observation.ownerEmail ?? `Konto #${observation.ownerId}`} · {new Date(observation.updatedAt).toLocaleString("de-DE")}</small></div><div className="admin-row__actions"><button className="secondary-action" disabled={reviewObservation.isPending} onClick={() => reviewObservationWithReason(observation.id, "confirmed")}>BESTÄTIGEN</button><button className="secondary-action danger-action" disabled={reviewObservation.isPending} onClick={() => reviewObservationWithReason(observation.id, "insufficient")}>RÜCKFRAGE</button></div></article>)}</div>}</section>
  </div>;
}

function AccountsPanel() {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const accounts = trpc.admin.accounts.useQuery(undefined, { enabled: auth.user?.role === "admin" });
  const setStatus = trpc.admin.setAccountStatus.useMutation({ onSuccess: () => void utils.admin.accounts.invalidate() });
  const setRole = trpc.admin.setAccountRole.useMutation({ onSuccess: () => void utils.admin.accounts.invalidate() });
  const setRoles = trpc.admin.setAccountRoles.useMutation({ onSuccess: () => void utils.admin.accounts.invalidate() });
  const setProAccess = trpc.admin.setAccountProAccess.useMutation({ onSuccess: () => void utils.admin.accounts.invalidate() });
  if (auth.user?.role !== "admin") return <StatePanel code="ACCOUNTS/ADMIN_ONLY" state="locked" title="ADMINROLLE ERFORDERLICH" body="Moderatoren erhalten keinen Zugriff auf Rollen, E-Mail-Adressen oder Kontostatus anderer Personen." />;
  if (accounts.isLoading) return <StatePanel code="ACCOUNTS/LOAD" state="loading" title="KONTEN WERDEN GELADEN" body="Die serverseitig freigegebene Kontoliste wird geladen." />;
  if (accounts.isError || !accounts.data) return <StatePanel code="ACCOUNTS/ERROR" state="error" title="KONTEN NICHT VERFÜGBAR" body="Die geschützte Kontenabfrage ist fehlgeschlagen." />;
  return <section className="admin-panel admin-accounts-panel"><p className="eyebrow">[ADMIN_ONLY]</p><h2>Reale Konten</h2><p>Admins haben automatisch Vollzugriff. Alle anderen Konten nutzen die Free-Funktionen, kaufen Pro über Stripe oder erhalten hier eine dokumentierte manuelle Freigabe.</p><div className="admin-list">{accounts.data.map(account => <article key={account.id} className="admin-row admin-account-row"><div><strong>{account.name ?? account.username ?? `Konto #${account.id}`}</strong><p>{account.email ?? "Keine E-Mail verfügbar"}</p><small>{roleLabel(account.role)} · {account.status.toUpperCase()} · zuletzt {new Date(account.lastSignedIn).toLocaleString("de-DE")}</small></div><div className="admin-row__actions admin-account-actions"><RolePicker account={account} currentUserId={auth.user?.id} pending={setRoles.isPending} disabled={setRoles.isPending} onSave={roles => void setRoles.mutateAsync({ id: account.id, roles })} /><ProAccessPicker account={account} pending={setProAccess.isPending} onSave={active => void setProAccess.mutate({ id: account.id, active })} /><select aria-label={`Status für Konto ${account.id}`} value={account.status} disabled={account.id === auth.user?.id || setStatus.isPending} onChange={event => { if (window.confirm("Den Kontostatus wirklich ändern?")) void setStatus.mutateAsync({ id: account.id, status: event.target.value as "active" | "suspended" | "banned" }); }}><option value="active">Aktiv</option><option value="suspended">Pausiert</option><option value="banned">Gesperrt</option></select></div></article>)}</div></section>;
}

function PartnersPanel() {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const partners = trpc.partners.approvalQueue.useQuery(undefined, { enabled: auth.user?.role === "admin" });
  const invalidateApprovalQueue = () => { void utils.partners.approvalQueue.invalidate(); void utils.partners.list.invalidate(); void utils.partners.homepage.invalidate(); };
  const create = trpc.partners.create.useMutation({ onSuccess: invalidateApprovalQueue });
  const setPartnerStatus = trpc.partners.setPartnerStatus.useMutation({ onSuccess: invalidateApprovalQueue });
  const setPlacement = trpc.partners.setHomepagePlacement.useMutation({ onSuccess: invalidateApprovalQueue });
  const setAuthorization = trpc.partners.setAuthorization.useMutation({ onSuccess: invalidateApprovalQueue });
  const [form, setForm] = useState({ displayName: "", partyType: "company" as "person" | "company", destinationUrl: "", disclosureLabel: "Werbung", authorizationConfirmed: false });
  const [windows, setWindows] = useState<Record<number, { startsAt: string; endsAt: string }>>({});
  const [status, setStatus] = useState<string | null>(null);

  if (auth.user?.role !== "admin") return <StatePanel code="PARTNER/ADMIN_ONLY" state="locked" title="ADMINROLLE ERFORDERLICH" body="Partnerprofile und Startseitenwerbung dürfen ausschließlich aktive Admins verwalten." />;
  if (partners.isLoading) return <StatePanel code="MERCHANT_APPROVAL/LOAD" state="loading" title="HÄNDLERFREIGABEN WERDEN GELADEN" body="Partnerprofile, Produktbestände und Veröffentlichungsstatus werden serverseitig geprüft." />;
  if (partners.isError || !partners.data) return <StatePanel code="MERCHANT_APPROVAL/ERROR" state="error" title="HÄNDLERFREIGABEN NICHT VERFÜGBAR" body="Die serverseitige Freigabewarteschlange konnte nicht verifiziert werden." />;

  const pendingPartners = partners.data.filter(partner => !partner.readyForPublicPublication).length;
  const pendingProducts = partners.data.reduce((sum, partner) => sum + partner.productCounts.draft, 0);
  const liveProducts = partners.data.reduce((sum, partner) => sum + partner.productCounts.active, 0);
  const pausedProducts = partners.data.reduce((sum, partner) => sum + partner.productCounts.paused, 0);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);
    if (!form.authorizationConfirmed) {
      setStatus("Eine dokumentierte Werbe- und Veröffentlichungsfreigabe ist erforderlich.");
      return;
    }
    try {
      await create.mutateAsync({ displayName: form.displayName, partyType: form.partyType, destinationUrl: form.destinationUrl.trim() || undefined, disclosureLabel: form.disclosureLabel.trim() || "Werbung", authorizationConfirmed: true });
      setForm({ displayName: "", partyType: "company", destinationUrl: "", disclosureLabel: "Werbung", authorizationConfirmed: false });
      setStatus("Partnerentwurf sicher gespeichert. Er erscheint erst nach deiner Genehmigung und aktiver Startseitenplatzierung.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "partner_creation_failed");
    }
  };

  return <div className="admin-grid admin-grid--single">
    <section className="admin-panel merchant-approval-intro"><div><p className="eyebrow">[HÄNDLERFREIGABEN / SERVER_VERIFIED]</p><h2>Prüfen, freigeben, sichtbar machen</h2><p>Jeder Händler bleibt getrennt. Erst ein genehmigtes Profil, eine gültige Autorisierung und eine aktive Platzierung können Produkte öffentlich machen. Zahlungen und bestätigte Verkäufe sind weiterhin nicht Teil dieses Bereichs.</p></div><div className="merchant-approval-rules"><span>1 · PROFIL</span><span>2 · AUTORISIERUNG</span><span>3 · PRODUKTE</span></div></section>
    <section className="admin-metrics merchant-approval-metrics"><Metric icon={<UsersRound />} label="Händler in Prüfung" value={pendingPartners} /><Metric icon={<Activity />} label="Produkte zur Prüfung" value={pendingProducts} /><Metric icon={<BadgeCheck />} label="Aktive Produkte" value={liveProducts} /><Metric icon={<EyeOff />} label="Pausierte Produkte" value={pausedProducts} /></section>
    <form className="admin-panel partner-form" onSubmit={submit}>
      <p className="eyebrow">[ADMIN / NEUER HÄNDLER]</p><h2>Händlerprofil anlegen</h2><p>Erfasse nur Personen oder Firmen, deren Werbe- und Veröffentlichungsfreigabe tatsächlich vorliegt. Der Eintrag bleibt zuerst ein nicht öffentlicher Entwurf.</p>
      <div className="form-grid"><label className="field"><span>Name der Person oder Firma</span><input required maxLength={160} value={form.displayName} onChange={event => setForm(current => ({ ...current, displayName: event.target.value }))} /></label><label className="field"><span>Art</span><select value={form.partyType} onChange={event => setForm(current => ({ ...current, partyType: event.target.value as "person" | "company" }))}><option value="company">Firma</option><option value="person">Privatperson</option></select></label><label className="field"><span>Ziel-URL (optional, nur HTTPS)</span><input type="url" placeholder="https://…" value={form.destinationUrl} onChange={event => setForm(current => ({ ...current, destinationUrl: event.target.value }))} /></label><label className="field"><span>Kennzeichnung</span><input required maxLength={80} value={form.disclosureLabel} onChange={event => setForm(current => ({ ...current, disclosureLabel: event.target.value }))} /></label></div>
      <label className="consent-toggle"><span>Werbe- und Veröffentlichungsfreigabe liegt tatsächlich vor.</span><input type="checkbox" checked={form.authorizationConfirmed} onChange={event => setForm(current => ({ ...current, authorizationConfirmed: event.target.checked }))} /></label>
      <button className="primary-action" type="submit" disabled={create.isPending || !form.authorizationConfirmed}><Plus size={16} />ENTWURF ANLEGEN</button>
      {status ? <p className="form-status" role="status">{status}</p> : null}
    </form>
    <section className="admin-panel"><p className="eyebrow">[FREIGABE & SICHTBARKEIT]</p><h2>Händler-Warteschlange</h2><p>Der Quellname <strong>Kiemen-Kumpel</strong> bleibt unverändert. Bestände werden nicht neu angelegt, wenn bereits ein eindeutiger Quell-Handle vorhanden ist.</p>{partners.data.length === 0 ? <p>Es existieren noch keine real angelegten Händlerprofile.</p> : <div className="admin-list">{partners.data.map(partner => {
      const windowState = windows[partner.id] ?? { startsAt: toDateTimeInput(partner.startsAt), endsAt: toDateTimeInput(partner.endsAt) };
      const authorizationLabel = partner.authorizationState === "granted" ? "BESTÄTIGT" : partner.authorizationState === "revoked" ? "WIDERRUFEN" : "FEHLT";
      return <article className="admin-row partner-admin-row" key={partner.id}><div><strong>{partner.displayName}</strong><p>{partner.partyType === "company" ? "Firma" : "Privatperson"} · Kennzeichnung: {partner.disclosureLabel}</p><small>Profil: {partner.partnerStatus.toUpperCase()} · Startseite: {(partner.placementStatus ?? "draft").toUpperCase()} · Freigabe: {authorizationLabel}</small></div><div className="partner-row-actions"><div className="admin-row__actions"><select aria-label={`Partnerstatus ${partner.displayName}`} value={partner.partnerStatus} disabled={setPartnerStatus.isPending} onChange={event => { if (window.confirm("Partnerstatus wirklich ändern?")) void setPartnerStatus.mutateAsync({ partnerId: partner.id, status: event.target.value as "draft" | "approved" | "paused" | "removed" }); }}><option value="draft">Entwurf</option><option value="approved">Genehmigt</option><option value="paused">Pausiert</option><option value="removed">Entfernt</option></select><select aria-label={`Startseitenplatzierung ${partner.displayName}`} value={partner.placementStatus ?? "draft"} disabled={setPlacement.isPending} onChange={event => { if (window.confirm("Startseitenplatzierung wirklich ändern?")) void setPlacement.mutateAsync({ partnerId: partner.id, status: event.target.value as "draft" | "active" | "paused" | "expired" | "removed" }); }}><option value="draft">Startseite: Entwurf</option><option value="active">Startseite: Aktiv</option><option value="paused">Startseite: Pausiert</option><option value="expired">Startseite: Abgelaufen</option><option value="removed">Startseite: Entfernt</option></select></div><div className="partner-window"><label><span>Start (optional)</span><input type="datetime-local" value={windowState.startsAt} onChange={event => setWindows(current => ({ ...current, [partner.id]: { ...windowState, startsAt: event.target.value } }))} /></label><label><span>Ende (optional)</span><input type="datetime-local" value={windowState.endsAt} onChange={event => setWindows(current => ({ ...current, [partner.id]: { ...windowState, endsAt: event.target.value } }))} /></label></div><div className="partner-actions"><button className="secondary-action" type="button" disabled={setPlacement.isPending} onClick={() => { if (window.confirm("Gültigkeitszeitraum wirklich speichern?")) void setPlacement.mutateAsync({ partnerId: partner.id, status: partner.placementStatus ?? "draft", startsAt: toIsoOrNull(windowState.startsAt), endsAt: toIsoOrNull(windowState.endsAt) }); }}>ZEITEN SPEICHERN</button><button className="secondary-action" type="button" disabled={setAuthorization.isPending} onClick={() => { const nextState = partner.authorizationState === "granted" ? "revoked" : "granted"; if (window.confirm(nextState === "granted" ? "Freigabe wirklich erteilen?" : "Freigabe wirklich widerrufen?")) void setAuthorization.mutateAsync({ partnerId: partner.id, state: nextState }); }}>{partner.authorizationState === "granted" ? "FREIGABE WIDERRUFEN" : "FREIGABE ERTEILEN"}</button></div><PartnerProducts partnerId={partner.id} partnerName={partner.displayName} /></div></article>;
    })}</div>}</section>
  </div>;
}

function PartnerProducts({ partnerId, partnerName }: { partnerId: number; partnerName: string }) {
  const utils = trpc.useUtils();
  const products = trpc.partners.products.useQuery({ partnerId });
  const create = trpc.partners.createProduct.useMutation({ onSuccess: () => void utils.partners.products.invalidate({ partnerId }) });
  const setStatus = trpc.partners.setProductStatus.useMutation({ onSuccess: () => { void utils.partners.products.invalidate({ partnerId }); void utils.partners.homepage.invalidate(); } });
  const uploadImage = trpc.partners.uploadProductImage.useMutation({ onSuccess: () => { void utils.partners.products.invalidate({ partnerId }); void utils.partners.homepage.invalidate(); } });
  const [form, setForm] = useState({ title: "", description: "", destinationUrl: "", priceLabel: "" });
  const [notice, setNotice] = useState<string | null>(null);

  const updateProductStatus = async (productId: number, nextStatus: "draft" | "active" | "paused" | "removed") => {
    setNotice(null);
    try {
      await setStatus.mutateAsync({ productId, status: nextStatus });
      setNotice(nextStatus === "active" ? "Produkt ist aktiv und kann innerhalb der freigegebenen Partnerkarte erscheinen." : "Produktstatus aktualisiert.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setNotice(message.includes("active_authorized_partner_placement_required")
        ? "Aktivierung blockiert: Der Partner muss genehmigt, aktuell autorisiert und auf der Startseite aktiv platziert sein."
        : "Produktstatus konnte nicht geändert werden. Prüfe die Freigabe und versuche es erneut.");
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setNotice(null);
    try {
      await create.mutateAsync({ partnerId, product: { title: form.title, description: form.description.trim() || null, destinationUrl: form.destinationUrl, priceLabel: form.priceLabel.trim() || null } });
      setForm({ title: "", description: "", destinationUrl: "", priceLabel: "" });
      setNotice("Produktentwurf gespeichert. Erst ein aktives Produkt eines aktuell freigegebenen Partners kann öffentlich erscheinen.");
    } catch {
      setNotice("Produkt konnte nicht gespeichert werden. Prüfe Ziel-URL und Eingaben.");
    }
  };

  const selectImage = async (productId: number, file: File | undefined) => {
    if (!file) return;
    setNotice(null);
    try {
      const image = await readImageAsBase64(file);
      await uploadImage.mutateAsync({ productId, ...image });
      setNotice("Produktbild geprüft und gespeichert. Sichtbar wird es erst mit einem aktiven, freigegebenen Produkt.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setNotice(message.includes("unsupported_image_type") ? "Nur JPG, PNG oder WebP sind zulässig." : message.includes("image_size") ? "Das Bild darf höchstens 8 MB groß sein." : "Das Produktbild konnte nicht geprüft oder gespeichert werden.");
    }
  };

  return <section className="partner-products" aria-label={`Händlerprodukte für ${partnerName}`}>
    <p className="eyebrow">[HÄNDLERPRODUKTE]</p><h3>Produkte von {partnerName}</h3><p>Produkte erscheinen nach Freigabe im BlackWaterLeaf-Marktplatz. Die Merkliste bleibt lokal; Zahlung, Versand und Kaufabschluss erfolgen ausschließlich beim jeweiligen Partner.</p>
    <form className="form-grid partner-product-form" onSubmit={submit}>
      <label className="field"><span>Produktname</span><input required maxLength={160} value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} /></label>
      <label className="field"><span>Produkt-URL (nur HTTPS)</span><input required type="url" placeholder="https://…" value={form.destinationUrl} onChange={event => setForm(current => ({ ...current, destinationUrl: event.target.value }))} /></label>
      <label className="field"><span>Preisangabe (optional)</span><input maxLength={80} placeholder="z. B. 19,90 €" value={form.priceLabel} onChange={event => setForm(current => ({ ...current, priceLabel: event.target.value }))} /></label>
      <label className="field field--wide"><span>Beschreibung (optional)</span><textarea rows={2} maxLength={1000} value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} /></label>
      <button className="secondary-action" type="submit" disabled={create.isPending}><Plus size={15} />{create.isPending ? "SPEICHERT …" : "PRODUKTENTWURF ANLEGEN"}</button>
    </form>
    {notice ? <p className="form-status" role="status">{notice}</p> : null}
    {products.isLoading ? <p>Produktentwürfe werden geladen.</p> : products.isError ? <p className="form-status">Produktdaten sind derzeit nicht verfügbar.</p> : products.data?.length ? <div className="partner-product-list">{products.data.map(product => <article key={product.id}>{product.imageUrl ? <img className="partner-product-thumb" src={product.imageUrl} alt="" /> : <span className="partner-product-thumb partner-product-thumb--empty"><ImagePlus size={17} /></span>}<div><strong>{product.title}</strong>{product.priceLabel ? <span>{product.priceLabel}</span> : null}<small>{product.status.toUpperCase()} · <a href={product.destinationUrl} target="_blank" rel="sponsored nofollow noopener">Ziel prüfen</a></small></div><div className="partner-product-controls"><label className="file-field partner-image-picker"><ImagePlus size={14} /><span>{uploadImage.isPending ? "WIRD GEPRÜFT …" : product.imageUrl ? "BILD ERSETZEN" : "BILD HINZUFÜGEN"}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadImage.isPending} onChange={event => { void selectImage(product.id, event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} /></label><select aria-label={`Produktstatus ${product.title}`} value={product.status} disabled={setStatus.isPending} onChange={event => { if (window.confirm("Produktstatus wirklich ändern?")) void updateProductStatus(product.id, event.target.value as "draft" | "active" | "paused" | "removed"); }}><option value="draft">Entwurf</option><option value="active">Aktiv</option><option value="paused">Pausiert</option><option value="removed">Entfernt</option></select></div></article>)}</div> : <p>Für diesen Partner sind noch keine Produkte erfasst.</p>}
  </section>;
}

function toDateTimeInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 16) : "";
}

function toIsoOrNull(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="admin-metric"><span>{icon}</span><small>{label}</small><strong>{value}</strong></div>;
}
