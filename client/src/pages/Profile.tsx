import { useAuth } from "@/_core/hooks/useAuth";
import { HabitatProfiles } from "@/components/HabitatProfiles";
import { LiveSensorStrip } from "@/components/LiveSensorStrip";
import { ReferenceHero } from "@/components/ReferenceOverlay";
import { SmartDeviceDialog } from "@/components/SmartDeviceDialog";
import { StatePanel } from "@/components/StatePanel";
import { useI18n, type AppLocale, type UnitSystem } from "@/i18n";
import { readImageAsBase64 } from "@/lib/files";
import { REFERENCE_ASSETS } from "@/lib/worlds";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Camera, Languages, LockKeyhole, LogOut, Ruler, Save, ShieldCheck, Trophy, UserPlus, UserRound } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";

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
const EMPTY_PROFILE: ProfileForm = {
  name: "", username: "", bio: "", location: "", website: "", instagram: "", tiktok: "", youtube: "", facebook: "", profileVisibility: "private",
};

export default function Profile() {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const { locale, unitSystem, setLocale, setUnitSystem, t } = useI18n();
  const profile = trpc.profile.me.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const consents = trpc.profile.consents.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const experience = trpc.gamification.summary.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const update = trpc.profile.update.useMutation();
  const setConsent = trpc.profile.setConsent.useMutation();
  const uploadAvatar = trpc.profile.uploadAvatar.useMutation();
  const closeAccount = trpc.profile.closeAccount.useMutation();
  const [form, setForm] = useState<ProfileForm>(EMPTY_PROFILE);
  const [status, setStatus] = useState<string | null>(null);
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
  }, [profile.data]);

  useEffect(() => {
    const targetId = window.location.hash.slice(1);
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (target instanceof HTMLDetailsElement) target.open = true;
    window.requestAnimationFrame(() => target?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const consentMap = useMemo(() => new Map(consents.data?.map(item => [item.purpose, item.granted]) ?? []), [consents.data]);

  const updateConsent = async (purpose: "profile_publication" | "observation_publishing" | "media_processing" | "community_publishing" | "ai_processing", granted: boolean) => {
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
      await utils.profile.me.invalidate();
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
      setStatus(error instanceof Error ? error.message : "avatar_upload_failed");
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

  return (
    <div className="reference-page reference-page--botany">
      <LiveSensorStrip compact />
      <ReferenceHero
        tone="botany"
        image={REFERENCE_ASSETS.botany}
        eyebrow={t("profile.eyebrow")}
        title={t("profile.title")}
        subtitle={locale === "de" ? "Privat, sicher und in deiner Hand." : "Private, secure and in your hands."}
        icon={UserRound}
      />

      {!auth.isAuthenticated ? <ProfileAuthOverlay locale={locale} /> : profile.isLoading ? (
        <StatePanel code="PROFILE/LOAD" state="loading" title={t("common.loading")} body={t("profile.signedOut")} />
      ) : profile.isError || !profile.data ? (
        <StatePanel code="PROFILE/ERROR" state="error" title={t("common.error")} body={t("profile.signedOut")} />
      ) : (
        <>
          <section className="profile-card glass-panel">
            <div className="profile-identity">
              <div className="profile-avatar">{profile.data.avatarUrl ? <img src={profile.data.avatarUrl} alt="" /> : <UserRound size={30} />}</div>
              <div><h2>{profile.data.name ?? profile.data.username ?? "BlackWaterLeaf"}</h2><p>{profile.data.email ?? ""}</p></div>
            </div>
            <div className="verified-grid">
              <div><small>{locale === "de" ? "Rolle" : "Role"}</small><strong>{profile.data.role}</strong></div>
              <div><small>{locale === "de" ? "Status" : "Status"}</small><strong>{profile.data.status}</strong></div>
              <div><small>{locale === "de" ? "Sichtbar" : "Visible"}</small><strong>{profile.data.profileVisibility}</strong></div>
            </div>
            {experience.data?.status === "ready" ? (
              <div className="verified-grid">
                <div><small><Trophy size={13} /> XP</small><strong>{experience.data.totalXp}</strong></div>
                <div><small>{locale === "de" ? "Level" : "Level"}</small><strong>{experience.data.level}</strong></div>
                <div><small>{locale === "de" ? "Nächstes Level" : "Next level"}</small><strong>{experience.data.nextLevelXp} XP</strong></div>
              </div>
            ) : <p className="form-status">{locale === "de" ? "XP wird nach der Staging-Migration aktiviert." : "XP activates after the staging migration."}</p>}
            <div id="profile-avatar" className="account-actions">
              <label className="secondary-action file-action"><Camera size={16} />{locale === "de" ? "Profilbild" : "Profile image"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => void changeAvatar(event.target.files?.[0])} /></label>
              <button type="button" className="secondary-action" onClick={() => auth.logout()}><LogOut size={16} />{t("profile.logout")}</button>
            </div>
            {profile.data.role === "admin" ? <a className="primary-action admin-entry" href="/admin"><ShieldCheck size={16} />{locale === "de" ? "ADMIN-DASHBOARD" : "ADMIN DASHBOARD"}</a> : null}
          </section>

          <details id="profile-edit" className="account-section glass-panel">
            <summary><span>{locale === "de" ? "Profil bearbeiten" : "Edit profile"}</span><small>{locale === "de" ? "Anzeigename, Bio & Links" : "Name, bio & links"}</small></summary>
            <form className="profile-form" onSubmit={saveProfile}>
              <div className="form-grid">
                <Field required label={locale === "de" ? "Anzeigename" : "Display name"} value={form.name} onChange={value => setForm(current => ({ ...current, name: value }))} />
                <Field required label={locale === "de" ? "Benutzername" : "Username"} value={form.username} onChange={value => setForm(current => ({ ...current, username: value }))} />
                <Field label={locale === "de" ? "Ort" : "Location"} value={form.location} onChange={value => setForm(current => ({ ...current, location: value }))} />
                <Field label="Website" type="url" value={form.website} onChange={value => setForm(current => ({ ...current, website: value }))} />
                <Field label="Instagram" type="url" value={form.instagram} onChange={value => setForm(current => ({ ...current, instagram: value }))} />
                <Field label="TikTok" type="url" value={form.tiktok} onChange={value => setForm(current => ({ ...current, tiktok: value }))} />
                <Field label="YouTube" type="url" value={form.youtube} onChange={value => setForm(current => ({ ...current, youtube: value }))} />
                <Field label="Facebook" type="url" value={form.facebook} onChange={value => setForm(current => ({ ...current, facebook: value }))} />
                <label className="field"><span>{locale === "de" ? "Profilsichtbarkeit" : "Profile visibility"}</span><select value={form.profileVisibility} onChange={event => setForm(current => ({ ...current, profileVisibility: event.target.value as ProfileForm["profileVisibility"] }))}><option value="private">private</option><option value="unlisted">unlisted</option><option value="public">public</option></select></label>
              </div>
              <label className="field"><span>Bio</span><textarea rows={4} maxLength={2000} value={form.bio} onChange={event => setForm(current => ({ ...current, bio: event.target.value }))} /></label>
              <button type="submit" className="primary-action" disabled={update.isPending}><Save size={16} />{update.isPending ? t("common.loading") : locale === "de" ? "PROFIL SPEICHERN" : "SAVE PROFILE"}</button>
            </form>
          </details>

          <details id="profile-display-settings" className="account-section glass-panel">
            <summary><span>{locale === "de" ? "Datenschutz & Freigaben" : "Privacy & permissions"}</span><small>{locale === "de" ? "Du entscheidest über jede Freigabe" : "You control every permission"}</small></summary>
            <section className="consent-panel">
              <ConsentToggle label={locale === "de" ? "Profil öffentlich anzeigen" : "Publish profile"} checked={Boolean(consentMap.get("profile_publication"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("profile_publication", checked)} />
              <ConsentToggle label={locale === "de" ? "Beobachtungen veröffentlichen" : "Publish observations"} checked={Boolean(consentMap.get("observation_publishing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("observation_publishing", checked)} />
              <ConsentToggle label={locale === "de" ? "Bilder sicher verarbeiten" : "Process images securely"} checked={Boolean(consentMap.get("media_processing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("media_processing", checked)} />
              <ConsentToggle label={locale === "de" ? "Community-Beiträge veröffentlichen" : "Publish community posts"} checked={Boolean(consentMap.get("community_publishing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("community_publishing", checked)} />
              <ConsentToggle label={locale === "de" ? "KI-Anfragen sicher verarbeiten" : "Process AI requests securely"} checked={Boolean(consentMap.get("ai_processing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("ai_processing", checked)} />
            </section>
          </details>

          <div id="profile-tools">
            <HabitatProfiles />
            <section className="smart-device-entry glass-panel"><div><span className="eyebrow">DEINE TECHNIK</span><h2>Smart-Werte verbinden</h2><p>Wähle ein Gerät und lege fest, welche Wasserwerte später automatisch in dein Aquarium fließen dürfen.</p></div><SmartDeviceDialog /></section>
            <section className="account-danger-zone glass-panel" aria-labelledby="account-close-title">
              <div><span className="eyebrow">KONTO</span><h2 id="account-close-title">Konto schließen</h2><p>Deine persönlichen Profildaten werden anonymisiert und der Zugang wird deaktiviert. Dieser Schritt kann nicht rückgängig gemacht werden.</p></div>
              <label className="field"><span>Zur Bestätigung LÖSCHEN eingeben</span><input value={deleteConfirmation} onChange={event => setDeleteConfirmation(event.target.value)} autoComplete="off" /></label>
              <button type="button" className="danger-action" disabled={deleteConfirmation !== "LÖSCHEN" || closeAccount.isPending} onClick={() => void deleteAccount()}><AlertTriangle size={16} />{closeAccount.isPending ? "WIRD GESCHLOSSEN …" : "KONTO SCHLIESSEN"}</button>
            </section>
          </div>

          <section className="reference-settings-grid">
            <article className="reference-setting-card"><Languages size={20} /><strong>{t("common.language")}</strong><div className="segmented-control"><button type="button" className={locale === "de" ? "active" : ""} onClick={() => void changeLocale("de")}>Deutsch</button><button type="button" className={locale === "en" ? "active" : ""} onClick={() => void changeLocale("en")}>English</button></div></article>
            <article className="reference-setting-card"><Ruler size={20} /><strong>{t("common.units")}</strong><div className="segmented-control"><button type="button" className={unitSystem === "metric" ? "active" : ""} onClick={() => void changeUnits("metric")}>{t("common.metric")}</button><button type="button" className={unitSystem === "imperial" ? "active" : ""} onClick={() => void changeUnits("imperial")}>{t("common.imperial")}</button></div></article>
          </section>
          {status ? <p className="form-status" role="status">{status}</p> : null}
        </>
      )}
    </div>
  );
}

function ProfileAuthOverlay({ locale }: { locale: AppLocale }) {
  return (
    <section className="profile-auth-overlay glass-panel" data-state="server-auth-required" role="status">
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

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="field"><span>{label}{required ? " *" : ""}</span><input required={required} type={type} value={value} onChange={event => onChange(event.target.value)} /></label>;
}

function ConsentToggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled: boolean; onChange: (checked: boolean) => void }) {
  return <label className="consent-toggle"><span>{label}</span><input type="checkbox" checked={checked} disabled={disabled} onChange={event => onChange(event.target.checked)} /></label>;
}
