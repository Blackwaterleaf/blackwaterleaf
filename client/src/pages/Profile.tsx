import { useAuth } from "@/_core/hooks/useAuth";
import { HabitatProfiles } from "@/components/HabitatProfiles";
import { SmartDeviceDialog } from "@/components/SmartDeviceDialog";
import { StatePanel } from "@/components/StatePanel";
import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { useI18n, type AppLocale, type UnitSystem } from "@/i18n";
import { imageErrorMessage, readImageAsBase64 } from "@/lib/files";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Ban, Camera, Download, Leaf, Loader2, LockKeyhole, LogOut, Save, ShieldCheck, Trophy, UserPlus, UserRound } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";

const POLICY_VERSION = "privacy-2026-09-16-v1";
type ProfileForm = {
  name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  facebook: string;
  profileVisibility: "private" | "unlisted" | "public";
};
type HabitatKind = "plant" | "aquarium" | "terrarium";
const EMPTY_PROFILE: ProfileForm = {
  name: "", username: "", bio: "", location: "", website: "", instagram: "", tiktok: "", youtube: "", facebook: "", profileVisibility: "private",
};

export default function Profile() {
  const auth = useAuth();
  const [location] = useLocation();
  const utils = trpc.useUtils();
  const { locale, unitSystem, setLocale, setUnitSystem, t } = useI18n();
  const profile = trpc.profile.me.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const consents = trpc.profile.consents.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const sessions = trpc.auth.sessions.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const experience = trpc.gamification.summary.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const update = trpc.profile.update.useMutation();
  const setConsent = trpc.profile.setConsent.useMutation();
  const uploadAvatar = trpc.profile.uploadAvatar.useMutation();
  const closeAccount = trpc.profile.closeAccount.useMutation();
  const exportData = trpc.profile.exportData.useQuery(undefined, { enabled: false, retry: false });
  const revokeAllSessions = trpc.auth.revokeAllSessions.useMutation();
  const blockedAccounts = trpc.social.blocked.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const unblockAccount = trpc.social.unblock.useMutation({ onSuccess: () => void blockedAccounts.refetch() });
  const notificationPreferences = trpc.feedback.preferences.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const updateNotificationPreferences = trpc.feedback.updatePreferences.useMutation({ onSuccess: () => void notificationPreferences.refetch() });
  const [form, setForm] = useState<ProfileForm>(EMPTY_PROFILE);
  const [status, setStatus] = useState<string | null>(null);
  const [exportHistory, setExportHistory] = useState<Array<{ id: number; createdAt: string }>>([]);
  const [visibleKinds, setVisibleKinds] = useState<Array<"plant" | "aquarium" | "terrarium">>(["plant", "aquarium", "terrarium"]);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    if (!profile.data) return;
    setForm({
      name: profile.data.name ?? "",
      username: profile.data.username ?? "",
      bio: profile.data.bio ?? "",
      location: profile.data.location ?? "",
      website: profile.data.socialLinks.website ?? "",
      instagram: profile.data.socialLinks.instagram ?? "",
      tiktok: profile.data.socialLinks.tiktok ?? "",
      youtube: profile.data.socialLinks.youtube ?? "",
      facebook: profile.data.socialLinks.facebook ?? "",
      profileVisibility: profile.data.profileVisibility,
    });
    const stored = window.localStorage.getItem(`bwl-profile-kinds-${profile.data.id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        const valid = parsed.filter((kind): kind is "plant" | "aquarium" | "terrarium" => ["plant", "aquarium", "terrarium"].includes(kind));
        if (valid.length) setVisibleKinds(valid);
      } catch { /* ignore malformed local preference */ }
    }
  }, [profile.data]);

  useEffect(() => {
    const kind = new URLSearchParams(location.split("?")[1] ?? "").get("kind");
    if (kind === "plant" || kind === "aquarium" || kind === "terrarium") setVisibleKinds([kind]);
  }, [location]);

  const toggleVisibleKind = (kind: "plant" | "aquarium" | "terrarium") => {
    setVisibleKinds(current => {
      const next = current.includes(kind) ? current.filter(value => value !== kind) : [...current, kind];
      if (profile.data?.id) window.localStorage.setItem(`bwl-profile-kinds-${profile.data.id}`, JSON.stringify(next));
      return next.length ? next : current;
    });
  };

  useEffect(() => {
    const openHashTarget = () => {
      const target = window.location.hash.replace(/^#/, "");
      if (!target) return;
      const element = document.getElementById(target);
      if (element instanceof HTMLDetailsElement) element.open = true;
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    openHashTarget();
    window.addEventListener("hashchange", openHashTarget);
    return () => window.removeEventListener("hashchange", openHashTarget);
  }, []);

  const consentMap = useMemo(() => new Map(consents.data?.map(item => [item.purpose, item.granted]) ?? []), [consents.data]);

  const updateConsent = async (purpose: "profile_publication" | "observation_publishing" | "media_processing" | "community_publishing" | "ai_processing" | "location_processing", granted: boolean) => {
    await setConsent.mutateAsync({ purpose, granted, policyVersion: POLICY_VERSION });
    await utils.profile.consents.invalidate();
  };

  const changeLocale = async (value: AppLocale) => {
    setLocale(value);
    if (auth.isAuthenticated) {
      await update.mutateAsync({ locale: value });
      await utils.profile.me.invalidate();
    }
  };

  const changeUnits = async (value: UnitSystem) => {
    setUnitSystem(value);
    if (auth.isAuthenticated) {
      await update.mutateAsync({ unitSystem: value });
      await utils.profile.me.invalidate();
    }
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);
    try {
      if (form.profileVisibility === "public" && !consentMap.get("profile_publication")) throw new Error("profile_publication_consent_required");
      await update.mutateAsync({
        name: form.name.trim() || null,
        username: form.username.trim() || null,
        bio: form.bio.trim() || null,
        location: form.location.trim() || null,
        profileVisibility: form.profileVisibility,
        socialWebsite: form.website.trim() || null,
        socialInstagram: form.instagram.trim() || null,
        socialTiktok: form.tiktok.trim() || null,
        socialYoutube: form.youtube.trim() || null,
        socialFacebook: form.facebook.trim() || null,
      });
      await Promise.all([utils.profile.me.invalidate(), utils.auth.me.invalidate()]);
      setStatus(locale === "de" ? "Profil sicher gespeichert." : "Profile saved securely.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "profile_update_failed");
    }
  };

  const changeAvatar = async (file: File | undefined) => {
    if (!file) return;
    setStatus(null);
    try {
      if (!consentMap.get("media_processing")) throw new Error("media_processing_consent_required");
      await uploadAvatar.mutateAsync(await readImageAsBase64(file));
      await utils.profile.me.invalidate();
      setStatus(locale === "de" ? "Profilbild sicher gespeichert." : "Profile image saved securely.");
    } catch (error) {
      setStatus(imageErrorMessage(error, locale));
    }
  };

  const deleteAccount = async () => {
    setStatus(null);
    try {
      await closeAccount.mutateAsync({ confirmation: "LÖSCHEN" });
      await auth.logout();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "account_close_failed");
    }
  };

  const downloadAccountExport = async () => {
    setStatus(null);
    try {
      const result = await exportData.refetch();
      if (!result.data) throw new Error("account_export_empty");
      setExportHistory(result.data.exportHistory ?? []);
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `blackwaterleaf-account-export-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus(locale === "de" ? "Datenexport erstellt und heruntergeladen." : "Data export created and downloaded.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "account_export_failed");
    }
  };

  const signOutEverywhere = async () => {
    setStatus(null);
    try {
      await revokeAllSessions.mutateAsync();
      await auth.logout();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "session_revoke_failed");
    }
  };

  const section = location.startsWith("/profile/") ? location.split("/")[2] : "settings";
  const habitatPrefill = useMemo(() => {
    if (!location.startsWith("/profile/habitats")) return undefined;
    const params = new URLSearchParams(location.split("?")[1] ?? "");
    const kind = params.get("kind");
    const name = params.get("prefillName");
    if (!name || (kind !== "plant" && kind !== "aquarium" && kind !== "terrarium")) return undefined;
    return { kind, name, scientificName: params.get("scientificName") ?? undefined } as { kind: HabitatKind; name: string; scientificName?: string };
  }, [location]);
  return (
    <div className={`observatory-route observatory-route--botany profile-page-only profile-settings-page profile-section-${section}`}>
      {!auth.isAuthenticated ? <ProfileAuthOverlay locale={locale} /> : profile.isLoading ? (
        <StatePanel code="PROFILE/LOAD" state="loading" title={t("common.loading")} body={t("profile.signedOut")} />
      ) : profile.isError || !profile.data ? (
        <StatePanel code="PROFILE/ERROR" state="error" title={t("common.error")} body={t("profile.signedOut")} />
      ) : (
        <>
          <Link className="page-back-link" href="/profile">‹ Profil</Link>
          <ObservatoryContextHeader tone="botany" eyebrow="BLACKWATERLEAF · PROFIL" title={section === "private" ? "PRIVATBEREICH" : section === "habitats" ? "MEINE ANLAGEN" : section === "progress" ? "PUNKTE & FORTSCHRITT" : section === "privacy" ? "DATENSCHUTZ & FREIGABEN" : section === "preferences" ? "SPRACHE & EINHEITEN" : section === "tools" ? "WEITERE WERKZEUGE" : "PROFIL EINSTELLUNGEN"} subtitle="Nur die Funktionen dieses Bereichs werden hier angezeigt." icon={UserRound} badge="PRIVAT" />
          <section className="profile-card observatory-data-panel" id="progress">
            <div className="profile-identity">
              <div className="profile-avatar" id="profile-image">{profile.data.avatarUrl ? <img src={profile.data.avatarUrl} alt="" /> : <UserRound size={30} />}</div>
              <div><h2>{profile.data.name ?? profile.data.username ?? "BlackWaterLeaf"}</h2><p>{profile.data.email ?? ""}</p></div>
            </div>
            {experience.data?.status === "ready" ? (
              <div className="verified-grid">
                <div><small><Trophy size={13} /> XP</small><strong>{experience.data.totalXp}</strong></div>
                <div><small>{locale === "de" ? "Level" : "Level"}</small><strong>{experience.data.level}</strong></div>
              </div>
            ) : <p className="form-status">{locale === "de" ? "Punkte werden geladen." : "Points are loading."}</p>}
          </section>

          <details id="profile-privacy" className="profile-display-settings observatory-data-panel">
            <summary><span>ANZEIGEN</span><small>Welche Anlagen sollen im Profil erscheinen?</small><b>+</b></summary>
            <div className="profile-display-settings__items">
              {([['plant', 'Pflanzen', Leaf], ['aquarium', 'Aquarium', null], ['terrarium', 'Terraristik', null]] as const).map(([kind, label, Icon]) => <button key={kind} type="button" className={visibleKinds.includes(kind) ? "is-selected" : ""} onClick={() => toggleVisibleKind(kind)}>{Icon ? <Icon size={15} /> : <span className="profile-display-settings__dot" />}<span>{label}</span><b>{visibleKinds.includes(kind) ? "✓" : "○"}</b></button>)}
            </div>
          </details>

          <details id="profile-consents" className="account-section observatory-data-panel profile-menu-only">
            <summary><span>DATENSCHUTZ & FREIGABEN</span><small>Du entscheidest über jede Freigabe</small></summary>
            <section className="profile-consent-list">
              <ConsentToggle label="Profil veröffentlichen" checked={Boolean(consentMap.get("profile_publication"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("profile_publication", checked)} />
              <ConsentToggle label="Beobachtungen veröffentlichen" checked={Boolean(consentMap.get("observation_publishing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("observation_publishing", checked)} />
              <ConsentToggle label="Bilder sicher verarbeiten" checked={Boolean(consentMap.get("media_processing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("media_processing", checked)} />
              <ConsentToggle label="Community-Beiträge veröffentlichen" checked={Boolean(consentMap.get("community_publishing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("community_publishing", checked)} />
              <ConsentToggle label="KI-Anfragen sicher verarbeiten" checked={Boolean(consentMap.get("ai_processing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("ai_processing", checked)} />
              <ConsentToggle label="Standort grob für aktuelles Wetter verwenden" checked={Boolean(consentMap.get("location_processing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("location_processing", checked)} />
            </section>
            <section className="profile-session-panel" aria-labelledby="active-sessions-title">
              <div><span className="eyebrow">SICHERHEIT</span><h3 id="active-sessions-title">AKTIVE ZUGÄNGE</h3><p>Nur Gerätetyp und letzte Aktivität werden angezeigt. Sitzungstoken bleiben unsichtbar.</p></div>
              {sessions.isLoading ? <p className="form-status"><Loader2 size={14} className="spin" /> Sitzungen werden geladen …</p> : sessions.data?.length ? <div className="profile-session-list">{sessions.data.map(session => <div className="profile-session-row" key={session.id}><span><strong>{session.provider === "local" ? "Lokale Anmeldung" : "Manus-Anmeldung"}</strong><small>{session.deviceId ? `Gerät ${session.deviceId}` : "Gerät nicht benannt"} · zuletzt {new Date(session.lastSeenAt).toLocaleString(locale === "de" ? "de-DE" : "en-US")}</small></span><ShieldCheck size={15} /></div>)}</div> : <p className="form-status">Keine aktiven Sitzungen gefunden.</p>}
              <button className={`secondary-action ${revokeAllSessions.isPending ? "action-loading" : ""}`} type="button" disabled={revokeAllSessions.isPending} onClick={() => void signOutEverywhere()}><LogOut size={15} />{revokeAllSessions.isPending ? "ABMELDUNG …" : "ALLE GERÄTE ABMELDEN"}</button>
            </section>
          </details>

          <details id="profile-edit" className="account-section observatory-data-panel profile-menu-only">
            <summary><span>{locale === "de" ? "Profil bearbeiten" : "Edit profile"}</span><small>{locale === "de" ? "Anzeigename, Bio & Links" : "Name, bio & links"}</small></summary>
            <form className="profile-form" onSubmit={saveProfile}>
              <label id="profile-avatar" className={`secondary-action file-action ${uploadAvatar.isPending ? "action-loading" : ""}`}><>{uploadAvatar.isPending ? <Loader2 size={16} className="spin" /> : <Camera size={16} />}</>{uploadAvatar.isPending ? "BILD WIRD GESPEICHERT …" : locale === "de" ? "Profilbild ändern" : "Change profile image"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadAvatar.isPending} onChange={event => void changeAvatar(event.target.files?.[0])} /></label>
              <div className="form-grid profile-short-edit">
                <Field label={locale === "de" ? "Anzeigename" : "Display name"} value={form.name} onChange={value => setForm(current => ({ ...current, name: value }))} />
                <Field label={locale === "de" ? "Benutzername" : "Username"} value={form.username} onChange={value => setForm(current => ({ ...current, username: value }))} />
              </div>
              <label className="field"><span>Bio</span><textarea rows={4} maxLength={2000} value={form.bio} onChange={event => setForm(current => ({ ...current, bio: event.target.value }))} /></label>
              <button type="submit" className={`primary-action ${update.isPending ? "action-loading" : ""}`} disabled={update.isPending}>{update.isPending ? <Loader2 size={16} className="spin" /> : <Save size={16} />}{update.isPending ? "PROFIL WIRD GESPEICHERT …" : locale === "de" ? "PROFIL SPEICHERN" : "SAVE PROFILE"}</button>
            </form>
          </details>

          <section id="habitats" className="profile-habitats-section"><HabitatProfiles visibleKinds={visibleKinds} prefill={habitatPrefill} defaultOpen={section === "settings" || section === "habitats"} /></section>

          <details id="profile-tools" className="profile-secondary-tools account-section observatory-data-panel">
            <summary><span>WEITERE WERKZEUGE</span><small>Nur bei Bedarf öffnen</small></summary>
            <div className="profile-secondary-tools__body">
              <div className="profile-secondary-tools__smart"><span className="eyebrow">SMART-WERTE</span><span className="sr-only">Smart-Werte verbinden</span><SmartDeviceDialog /></div>
              <section className="profile-blocked-accounts observatory-data-panel" aria-labelledby="blocked-accounts-title"><div><span className="eyebrow">COMMUNITY-SCHUTZ</span><h2 id="blocked-accounts-title">BLOCKIERTE KONTEN</h2><p>Blockierte Konten erscheinen nicht in deinem Community-Feed, in Diskussionen oder im Live-Chat. Eine Entblockung stellt keine frühere Folgebeziehung wieder her.</p></div>{blockedAccounts.isLoading ? <p className="form-status">Blockliste wird geladen …</p> : blockedAccounts.isError ? <p className="form-status" role="alert">Blockliste konnte nicht geladen werden.</p> : blockedAccounts.data?.length ? <div className="profile-blocked-accounts__list">{blockedAccounts.data.map(account => <div key={account.id}><span><strong>{account.name ?? account.username ?? "Konto"}</strong><small>blockiert am {new Date(account.blockedAt).toLocaleDateString(locale === "de" ? "de-DE" : "en-US")}</small></span><button type="button" className="secondary-action" disabled={unblockAccount.isPending} onClick={() => unblockAccount.mutate({ id: Number(account.id) })}><Ban size={15} />ENTBLOCKEN</button></div>)}</div> : <p className="form-status">Du hast keine Konten blockiert.</p>}</section>
              <section className="profile-data-export observatory-data-panel" aria-labelledby="account-export-title"><div><span className="eyebrow">DATENKONTROLLE</span><h2 id="account-export-title">EIGENE DATEN EXPORTIEREN</h2><p>Ein maschinenlesbarer JSON-Export enthält dein Profil, private Anlagen, Beobachtungen, Pflege, Messwerte, Einwilligungen und Medienmetadaten. Geheime Storage-Schlüssel werden nicht ausgegeben.</p></div><button type="button" className={`secondary-action ${exportData.isFetching ? "action-loading" : ""}`} disabled={exportData.isFetching} onClick={() => void downloadAccountExport()}>{exportData.isFetching ? <Loader2 size={16} className="spin" /> : <Download size={16} />}{exportData.isFetching ? "EXPORT WIRD ERSTELLT …" : "DATENEXPORT HERUNTERLADEN"}</button>{exportHistory.length ? <div className="profile-export-history" aria-label="Export-Historie"><span className="eyebrow">EXPORT-HISTORIE</span>{exportHistory.map(entry => <span key={entry.id}>#{entry.id} · {new Date(entry.createdAt).toLocaleString(locale === "de" ? "de-DE" : "en-US")}</span>)}</div> : null}</section>
              <section className="account-danger-zone observatory-data-panel" aria-labelledby="account-close-title">
                <div><span className="eyebrow">KONTO</span><h2 id="account-close-title">Konto schließen</h2><p>Deine persönlichen Profildaten werden anonymisiert und der Zugang wird deaktiviert. Dieser Schritt kann nicht rückgängig gemacht werden.</p></div>
                <label className="field"><span>Zur Bestätigung LÖSCHEN eingeben</span><input value={deleteConfirmation} onChange={event => setDeleteConfirmation(event.target.value)} autoComplete="off" /></label>
                <button type="button" className={`danger-action ${closeAccount.isPending ? "action-loading" : ""}`} disabled={deleteConfirmation !== "LÖSCHEN" || closeAccount.isPending} onClick={() => void deleteAccount()}>{closeAccount.isPending ? <Loader2 size={16} className="spin" /> : <AlertTriangle size={16} />}{closeAccount.isPending ? "WIRD GESCHLOSSEN …" : "KONTO SCHLIESSEN"}</button>
              </section>
            </div>
          </details>

          <details id="profile-preferences" className="profile-secondary-tools account-section observatory-data-panel">
            <summary><span>SPRACHE & EINHEITEN</span><small>Persönliche Darstellung</small></summary>
            <div className="profile-preferences-grid">
              <div><span className="eyebrow">SPRACHE</span><button type="button" className={locale === "de" ? "is-selected" : ""} onClick={() => void changeLocale("de")}>Deutsch</button><button type="button" className={locale === "en" ? "is-selected" : ""} onClick={() => void changeLocale("en")}>English</button></div>
              <div><span className="eyebrow">EINHEITEN</span><button type="button" className={unitSystem === "metric" ? "is-selected" : ""} onClick={() => void changeUnits("metric")}>Metrisch</button><button type="button" className={unitSystem === "imperial" ? "is-selected" : ""} onClick={() => void changeUnits("imperial")}>Imperial</button></div>
            </div>
          </details>

          <details id="profile-notifications" className="profile-secondary-tools account-section observatory-data-panel">
            <summary><span>BENACHRICHTIGUNGEN</span><small>Du bestimmst, was dich erreicht</small></summary>
            <section className="profile-consent-list">
              {([['community', 'Community & Antworten'], ['messages', 'Private Nachrichten'], ['moderation', 'Moderation & Review'], ['system', 'System & Sicherheit']] as const).map(([key, label]) => <ConsentToggle key={key} label={label} checked={notificationPreferences.data?.[key] ?? true} disabled={notificationPreferences.isLoading || updateNotificationPreferences.isPending} onChange={checked => { const current = notificationPreferences.data ?? { community: true, messages: true, moderation: true, system: true }; updateNotificationPreferences.mutate({ ...current, [key]: checked }); }} />)}
            </section>
          </details>

          {status ? <p className="form-status" role="status">{status}</p> : null}
        </>
      )}
    </div>
  );
}

function ProfileAuthOverlay({ locale }: { locale: AppLocale }) {
  return (
    <section className="profile-auth-overlay observatory-state-surface" data-state="server-auth-required" role="status">
      <span className="profile-auth-overlay__orbit" aria-hidden="true"><LockKeyhole size={29} /></span>
      <p className="eyebrow">[AUTH / REQUIRED]</p>
      <h2>{locale === "de" ? "IDENTITÄT BLEIBT VERIFIZIERT" : "IDENTITY STAYS VERIFIED"}</h2>
      <p>{locale === "de" ? "Deine Aquarien, Pflanzen, Terrarien, Einstellungen und Werte werden erst nach einer sicheren Anmeldung geladen." : "Your aquariums, plants, terrariums, settings, and readings load only after a secure sign-in."}</p>
      <div className="profile-auth-overlay__actions">
        <Link className="primary-action" href="/login"><ShieldCheck size={16} />{locale === "de" ? "SICHER ANMELDEN" : "SIGN IN SECURELY"}</Link>
        <Link className="secondary-action" href="/register"><UserPlus size={16} />{locale === "de" ? "KONTO ERSTELLEN" : "CREATE ACCOUNT"}</Link>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="field"><span>{label}</span><input type={type} value={value} onChange={event => onChange(event.target.value)} /></label>;
}

function ConsentToggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled: boolean; onChange: (checked: boolean) => void }) {
  return <label className="consent-toggle"><span>{label}</span>{disabled ? <Loader2 size={13} className="spin" aria-label="Wird gespeichert" /> : null}<input type="checkbox" checked={checked} disabled={disabled} onChange={event => onChange(event.target.checked)} /></label>;
}
