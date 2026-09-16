import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { StatePanel } from "@/components/StatePanel";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { readImageAsBase64 } from "@/lib/files";
import { trpc } from "@/lib/trpc";
import { Activity, BadgeCheck, EyeOff, ImagePlus, LayoutDashboard, Megaphone, Plus, Shield, ShieldAlert, UsersRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";

const menuItems: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Übersicht", path: "/admin" },
  { icon: ShieldAlert, label: "Moderation", path: "/admin/moderation" },
  { icon: UsersRound, label: "Konten", path: "/admin/accounts" },
  { icon: Megaphone, label: "Partner", path: "/admin/partners" },
];

function roleLabel(role: "user" | "moderator" | "admin") {
  return role === "admin" ? "ADMIN" : role === "moderator" ? "MODERATOR" : "NUTZER";
}

export default function AdminDashboard() {
  const auth = useAuth();
  const [location, setLocation] = useLocation();
  const isStaff = auth.user?.status === "active" && (auth.user.role === "moderator" || auth.user.role === "admin");

  if (auth.loading) return <StatePanel code="ADMIN/LOAD" state="loading" title="KONTROLLZENTRUM WIRD GEPRÜFT" body="Die serverseitige Berechtigung wird geladen." />;
  if (!auth.isAuthenticated) return <StatePanel code="ADMIN/AUTH" title="ANMELDUNG ERFORDERLICH" body="Das Kontrollzentrum ist ausschließlich für verifizierte Teamkonten erreichbar." action={<button type="button" className="primary-action" onClick={startLogin}>ANMELDEN</button>} />;
  if (!isStaff) return <StatePanel code="ADMIN/FORBIDDEN" state="locked" title="KEINE TEAMBERECHTIGUNG" body="Diese Route ist serverseitig für aktive Moderations- und Adminrollen geschützt." />;

  const section = location.split("/")[2] ?? "overview";
  return (
    <DashboardLayout menuItems={auth.user?.role === "admin" ? menuItems : menuItems.slice(0, 2)} title="BLACKWATERLEAF ADMIN">
      <div className="admin-console">
        <header className="admin-console__header">
          <div><p className="eyebrow">[SERVER_VERIFIED / {roleLabel(auth.user!.role)}]</p><h1>Kontrollzentrum</h1><p>Nur echte, serverseitig freigegebene Inhalte und Konten werden angezeigt.</p></div>
          <button className="secondary-action" type="button" onClick={() => setLocation("/profile")}><Shield size={16} />ZUM PROFIL</button>
        </header>
        {section === "moderation" ? <ModerationPanel /> : section === "accounts" ? <AccountsPanel /> : section === "partners" ? <PartnersPanel /> : <OverviewPanel onOpenModeration={() => setLocation("/admin/moderation")} onOpenAccounts={() => setLocation("/admin/accounts")} onOpenPartners={() => setLocation("/admin/partners")} />}
      </div>
    </DashboardLayout>
  );
}

function OverviewPanel({ onOpenModeration, onOpenAccounts, onOpenPartners }: { onOpenModeration: () => void; onOpenAccounts: () => void; onOpenPartners: () => void }) {
  const overview = trpc.admin.overview.useQuery();
  const audit = trpc.admin.auditTrail.useQuery();
  if (overview.isLoading || audit.isLoading) return <StatePanel code="ADMIN/SYNC" state="loading" title="ECHTE STATUSDATEN WERDEN GELADEN" body="Es werden keine Kennzahlen simuliert." />;
  if (overview.isError || audit.isError || !overview.data || !audit.data) return <StatePanel code="ADMIN/ERROR" state="error" title="KONTROLLZENTRUM NICHT VERFÜGBAR" body="Die serverseitigen Statusdaten konnten nicht verifiziert werden." />;
  return <>
    <section className="admin-metrics">
      <Metric icon={<UsersRound />} label="Konten" value={overview.data.accounts} />
      <Metric icon={<BadgeCheck />} label="Aktiv" value={overview.data.activeAccounts} />
      <Metric icon={<Activity />} label="Öffentliche Beiträge" value={overview.data.publicPosts} />
      <Metric icon={<EyeOff />} label="Ausgeblendet" value={overview.data.hiddenPosts} />
    </section>
    <section className="admin-grid">
      <section className="admin-panel"><p className="eyebrow">[MODERATION]</p><h2>Öffentliche Inhalte</h2><p>Nur veröffentlichte, öffentliche Community-Beiträge sind für Moderation sichtbar. Private Entwürfe werden nicht angezeigt.</p><button className="primary-action" type="button" onClick={onOpenModeration}>MODERATION ÖFFNEN</button></section>
      <section className="admin-panel"><p className="eyebrow">[KONTEN]</p><h2>Rollen & Status</h2><p>Aktive Admins können reale Kontorollen und Kontostatus ändern. Jede Änderung wird revisionssicher protokolliert.</p><button className="primary-action" type="button" onClick={onOpenAccounts}>KONTEN ÖFFNEN</button></section>
      <section className="admin-panel"><p className="eyebrow">[PARTNER]</p><h2>Werbeplätze</h2><p>Nur reale, autorisierte und ausdrücklich aktivierte Partner erscheinen sichtbar als Werbung auf der Startseite.</p><button className="primary-action" type="button" onClick={onOpenPartners}>PARTNER ÖFFNEN</button></section>
    </section>
    <section className="admin-panel"><p className="eyebrow">[AUDIT_LEDGER]</p><h2>Letzte nachvollziehbare Aktionen</h2>{audit.data.length === 0 ? <p>Es liegen noch keine signierten Verwaltungsaktionen vor.</p> : <ul className="audit-list">{audit.data.map(entry => <li key={entry.id}><span>{entry.action}</span><small>{entry.targetType} #{entry.targetId} · {new Date(entry.createdAt).toLocaleString("de-DE")}</small></li>)}</ul>}</section>
  </>;
}

function ModerationPanel() {
  const utils = trpc.useUtils();
  const posts = trpc.admin.publicPosts.useQuery();
  const moderate = trpc.admin.setPublicPostStatus.useMutation({ onSuccess: () => void utils.admin.publicPosts.invalidate() });
  if (posts.isLoading) return <StatePanel code="MODERATION/LOAD" state="loading" title="ÖFFENTLICHE INHALTE WERDEN GELADEN" body="Private oder nicht veröffentlichte Inhalte bleiben unsichtbar." />;
  if (posts.isError || !posts.data) return <StatePanel code="MODERATION/ERROR" state="error" title="MODERATION NICHT VERFÜGBAR" body="Die serverseitige Inhaltsabfrage ist fehlgeschlagen." />;
  if (posts.data.length === 0) return <StatePanel code="MODERATION/EMPTY" title="KEINE ÖFFENTLICHEN BEITRÄGE" body="Es gibt aktuell keine real veröffentlichten Community-Beiträge zur Moderation." />;
  return <section className="admin-panel"><p className="eyebrow">[PUBLIC_CONTENT_ONLY]</p><h2>Moderationswarteschlange</h2><div className="admin-list">{posts.data.map(post => <article key={post.id} className="admin-row"><div><strong>#{post.id} · {post.realm ?? "ohne Bereich"}</strong><p>{post.content}</p><small>{new Date(post.createdAt).toLocaleString("de-DE")}</small></div><div className="admin-row__actions"><button className="secondary-action" disabled={moderate.isPending} onClick={() => { if (window.confirm("Diesen öffentlichen Beitrag ausblenden?")) void moderate.mutateAsync({ id: post.id, status: "hidden" }); }}>AUSBLENDEN</button><button className="secondary-action danger-action" disabled={moderate.isPending} onClick={() => { if (window.confirm("Diesen öffentlichen Beitrag entfernen?")) void moderate.mutateAsync({ id: post.id, status: "removed" }); }}>ENTFERNEN</button></div></article>)}</div></section>;
}

function AccountsPanel() {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const accounts = trpc.admin.accounts.useQuery(undefined, { enabled: auth.user?.role === "admin" });
  const setStatus = trpc.admin.setAccountStatus.useMutation({ onSuccess: () => void utils.admin.accounts.invalidate() });
  const setRole = trpc.admin.setAccountRole.useMutation({ onSuccess: () => void utils.admin.accounts.invalidate() });
  if (auth.user?.role !== "admin") return <StatePanel code="ACCOUNTS/ADMIN_ONLY" state="locked" title="ADMINROLLE ERFORDERLICH" body="Moderatoren erhalten keinen Zugriff auf Rollen, E-Mail-Adressen oder Kontostatus anderer Personen." />;
  if (accounts.isLoading) return <StatePanel code="ACCOUNTS/LOAD" state="loading" title="KONTEN WERDEN GELADEN" body="Die serverseitig freigegebene Kontoliste wird geladen." />;
  if (accounts.isError || !accounts.data) return <StatePanel code="ACCOUNTS/ERROR" state="error" title="KONTEN NICHT VERFÜGBAR" body="Die geschützte Kontenabfrage ist fehlgeschlagen." />;
  return <section className="admin-panel"><p className="eyebrow">[ADMIN_ONLY]</p><h2>Reale Konten</h2><div className="admin-list">{accounts.data.map(account => <article key={account.id} className="admin-row"><div><strong>{account.name ?? account.username ?? `Konto #${account.id}`}</strong><p>{account.email ?? "Keine E-Mail verfügbar"}</p><small>{roleLabel(account.role)} · {account.status.toUpperCase()} · zuletzt {new Date(account.lastSignedIn).toLocaleString("de-DE")}</small></div><div className="admin-row__actions"><select aria-label={`Rolle für Konto ${account.id}`} value={account.role} disabled={account.id === auth.user?.id || setRole.isPending} onChange={event => { if (window.confirm("Die Kontorolle wirklich ändern?")) void setRole.mutateAsync({ id: account.id, role: event.target.value as "user" | "moderator" | "admin" }); }}><option value="user">Nutzer</option><option value="moderator">Moderator</option><option value="admin">Admin</option></select><select aria-label={`Status für Konto ${account.id}`} value={account.status} disabled={account.id === auth.user?.id || setStatus.isPending} onChange={event => { if (window.confirm("Den Kontostatus wirklich ändern?")) void setStatus.mutateAsync({ id: account.id, status: event.target.value as "active" | "suspended" | "banned" }); }}><option value="active">Aktiv</option><option value="suspended">Pausiert</option><option value="banned">Gesperrt</option></select></div></article>)}</div></section>;
}

function PartnersPanel() {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const partners = trpc.partners.list.useQuery(undefined, { enabled: auth.user?.role === "admin" });
  const create = trpc.partners.create.useMutation({ onSuccess: () => void utils.partners.list.invalidate() });
  const setPartnerStatus = trpc.partners.setPartnerStatus.useMutation({ onSuccess: () => { void utils.partners.list.invalidate(); void utils.partners.homepage.invalidate(); } });
  const setPlacement = trpc.partners.setHomepagePlacement.useMutation({ onSuccess: () => { void utils.partners.list.invalidate(); void utils.partners.homepage.invalidate(); } });
  const setAuthorization = trpc.partners.setAuthorization.useMutation({ onSuccess: () => { void utils.partners.list.invalidate(); void utils.partners.homepage.invalidate(); } });
  const [form, setForm] = useState({ displayName: "", partyType: "company" as "person" | "company", destinationUrl: "", disclosureLabel: "Werbung", authorizationConfirmed: false });
  const [windows, setWindows] = useState<Record<number, { startsAt: string; endsAt: string }>>({});
  const [status, setStatus] = useState<string | null>(null);

  if (auth.user?.role !== "admin") return <StatePanel code="PARTNER/ADMIN_ONLY" state="locked" title="ADMINROLLE ERFORDERLICH" body="Partnerprofile und Startseitenwerbung dürfen ausschließlich aktive Admins verwalten." />;
  if (partners.isLoading) return <StatePanel code="PARTNER/LOAD" state="loading" title="PARTNERSTATUS WIRD GELADEN" body="Es werden keine Partner, Firmen oder Personen simuliert." />;
  if (partners.isError || !partners.data) return <StatePanel code="PARTNER/ERROR" state="error" title="PARTNERDATEN NICHT VERFÜGBAR" body="Die serverseitige Partnerverwaltung konnte nicht verifiziert werden." />;

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
    <form className="admin-panel partner-form" onSubmit={submit}>
      <p className="eyebrow">[NEUER REALER PARTNER]</p><h2>Partner prüfen</h2><p>Erfasse nur Personen oder Firmen, deren Werbe- und Startseitenfreigabe tatsächlich vorliegt. Der Eintrag bleibt zuerst ein nicht öffentlicher Entwurf.</p>
      <div className="form-grid"><label className="field"><span>Name der Person oder Firma</span><input required maxLength={160} value={form.displayName} onChange={event => setForm(current => ({ ...current, displayName: event.target.value }))} /></label><label className="field"><span>Art</span><select value={form.partyType} onChange={event => setForm(current => ({ ...current, partyType: event.target.value as "person" | "company" }))}><option value="company">Firma</option><option value="person">Privatperson</option></select></label><label className="field"><span>Ziel-URL (optional, nur HTTPS)</span><input type="url" placeholder="https://…" value={form.destinationUrl} onChange={event => setForm(current => ({ ...current, destinationUrl: event.target.value }))} /></label><label className="field"><span>Kennzeichnung</span><input required maxLength={80} value={form.disclosureLabel} onChange={event => setForm(current => ({ ...current, disclosureLabel: event.target.value }))} /></label></div>
      <label className="consent-toggle"><span>Werbe- und Veröffentlichungsfreigabe liegt tatsächlich vor.</span><input type="checkbox" checked={form.authorizationConfirmed} onChange={event => setForm(current => ({ ...current, authorizationConfirmed: event.target.checked }))} /></label>
      <button className="primary-action" type="submit" disabled={create.isPending || !form.authorizationConfirmed}><Plus size={16} />ENTWURF ANLEGEN</button>
      {status ? <p className="form-status" role="status">{status}</p> : null}
    </form>
    <section className="admin-panel"><p className="eyebrow">[FREIGABE & SICHTBARKEIT]</p><h2>Reale Partnerprofile</h2>{partners.data.length === 0 ? <p>Es existieren noch keine real angelegten Partnerprofile. Auf der Startseite wird deshalb keine Werbung dargestellt.</p> : <div className="admin-list">{partners.data.map(partner => {
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
