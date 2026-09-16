import { useAuth } from "@/_core/hooks/useAuth";
import { StatePanel } from "@/components/StatePanel";
import { startLogin } from "@/const";
import { useI18n, type AppLocale, type UnitSystem } from "@/i18n";
import { readImageAsBase64 } from "@/lib/files";
import { trpc } from "@/lib/trpc";
import { Camera, Languages, LogOut, Save, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

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
  name: "",
  username: "",
  bio: "",
  location: "",
  website: "",
  instagram: "",
  tiktok: "",
  youtube: "",
  facebook: "",
  profileVisibility: "private",
};

export default function Profile() {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const { locale, unitSystem, setLocale, setUnitSystem, t } = useI18n();
  const profile = trpc.profile.me.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const consents = trpc.profile.consents.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const update = trpc.profile.update.useMutation();
  const setConsent = trpc.profile.setConsent.useMutation();
  const uploadAvatar = trpc.profile.uploadAvatar.useMutation();
  const [form, setForm] = useState<ProfileForm>(EMPTY_PROFILE);
  const [status, setStatus] = useState<string | null>(null);

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

  const consentMap = useMemo(
    () => new Map(consents.data?.map(item => [item.purpose, item.granted]) ?? []),
    [consents.data],
  );

  const updateConsent = async (
    purpose: "profile_publication" | "observation_publishing" | "media_processing" | "community_publishing",
    granted: boolean,
  ) => {
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
      if (form.profileVisibility === "public" && !consentMap.get("profile_publication")) {
        throw new Error("profile_publication_consent_required");
      }
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
      const image = await readImageAsBase64(file);
      await uploadAvatar.mutateAsync(image);
      await utils.profile.me.invalidate();
      setStatus(locale === "de" ? "Profilbild sicher gespeichert." : "Profile image saved securely.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "avatar_upload_failed");
    }
  };

  return (
    <div className="page-stack">
      <section className="page-hero bracket-panel profile-hero">
        <p className="eyebrow">[{t("profile.eyebrow")}]</p>
        <h1 className="glitch-title" data-text={t("profile.title")}>{t("profile.title")}</h1>
      </section>

      {!auth.isAuthenticated ? (
        <StatePanel code="AUTH/REQUIRED" title={t("profile.signedOut")} body={t("home.truth.body")} action={<button type="button" className="primary-action" onClick={startLogin}><ShieldCheck size={16} />{t("common.signIn")}</button>} />
      ) : profile.isLoading ? (
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
              <div><small>{t("profile.role")}</small><strong>{profile.data.role}</strong></div>
              <div><small>{t("profile.status")}</small><strong>{profile.data.status}</strong></div>
              <div><small>{t("profile.privacy")}</small><strong>{profile.data.profileVisibility}</strong></div>
            </div>
            <label className="secondary-action file-action"><Camera size={16} />{locale === "de" ? "Profilbild wählen" : "Choose profile image"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => void changeAvatar(event.target.files?.[0])} /></label>
            <button type="button" className="secondary-action" onClick={() => auth.logout()}><LogOut size={16} />{t("profile.logout")}</button>
          </section>

          <form className="profile-form glass-panel" onSubmit={saveProfile}>
            <div className="form-grid">
              <Field label={locale === "de" ? "Anzeigename" : "Display name"} value={form.name} onChange={value => setForm(current => ({ ...current, name: value }))} />
              <Field label={locale === "de" ? "Benutzername" : "Username"} value={form.username} onChange={value => setForm(current => ({ ...current, username: value }))} />
              <Field label={locale === "de" ? "Ort" : "Location"} value={form.location} onChange={value => setForm(current => ({ ...current, location: value }))} />
              <Field label="Website" type="url" value={form.website} onChange={value => setForm(current => ({ ...current, website: value }))} />
              <Field label="Instagram" type="url" value={form.instagram} onChange={value => setForm(current => ({ ...current, instagram: value }))} />
              <Field label="TikTok" type="url" value={form.tiktok} onChange={value => setForm(current => ({ ...current, tiktok: value }))} />
              <Field label="YouTube" type="url" value={form.youtube} onChange={value => setForm(current => ({ ...current, youtube: value }))} />
              <Field label="Facebook" type="url" value={form.facebook} onChange={value => setForm(current => ({ ...current, facebook: value }))} />
              <label className="field"><span>{t("profile.privacy")}</span><select value={form.profileVisibility} onChange={event => setForm(current => ({ ...current, profileVisibility: event.target.value as ProfileForm["profileVisibility"] }))}><option value="private">private</option><option value="unlisted">unlisted</option><option value="public">public</option></select></label>
            </div>
            <label className="field"><span>Bio</span><textarea rows={4} maxLength={2000} value={form.bio} onChange={event => setForm(current => ({ ...current, bio: event.target.value }))} /></label>
            <button type="submit" className="primary-action" disabled={update.isPending}><Save size={16} />{update.isPending ? t("common.loading") : locale === "de" ? "PROFIL SPEICHERN" : "SAVE PROFILE"}</button>
          </form>

          <section className="consent-panel glass-panel">
            <p className="eyebrow">[PRIVACY_CONTROL]</p>
            <h2>{locale === "de" ? "DEINE FREIGABEN" : "YOUR PERMISSIONS"}</h2>
            <ConsentToggle label={locale === "de" ? "Profil öffentlich anzeigen" : "Publish profile"} checked={Boolean(consentMap.get("profile_publication"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("profile_publication", checked)} />
            <ConsentToggle label={locale === "de" ? "Beobachtungen veröffentlichen" : "Publish observations"} checked={Boolean(consentMap.get("observation_publishing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("observation_publishing", checked)} />
            <ConsentToggle label={locale === "de" ? "Bilder sicher verarbeiten" : "Process images securely"} checked={Boolean(consentMap.get("media_processing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("media_processing", checked)} />
            <ConsentToggle label={locale === "de" ? "Community-Beiträge veröffentlichen" : "Publish community posts"} checked={Boolean(consentMap.get("community_publishing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("community_publishing", checked)} />
          </section>
        </>
      )}

      <section className="settings-panel glass-panel">
        <div className="settings-title"><Languages size={18} /><span>{t("common.language")}</span></div>
        <div className="segmented-control"><button type="button" className={locale === "de" ? "active" : ""} onClick={() => void changeLocale("de")}>Deutsch</button><button type="button" className={locale === "en" ? "active" : ""} onClick={() => void changeLocale("en")}>English</button></div>
        <div className="settings-title"><span>↔</span><span>{t("common.units")}</span></div>
        <div className="segmented-control"><button type="button" className={unitSystem === "metric" ? "active" : ""} onClick={() => void changeUnits("metric")}>{t("common.metric")}</button><button type="button" className={unitSystem === "imperial" ? "active" : ""} onClick={() => void changeUnits("imperial")}>{t("common.imperial")}</button></div>
      </section>
      {status ? <p className="form-status" role="status">{status}</p> : null}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="field"><span>{label}</span><input type={type} value={value} onChange={event => onChange(event.target.value)} /></label>;
}

function ConsentToggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled: boolean; onChange: (checked: boolean) => void }) {
  return <label className="consent-toggle"><span>{label}</span><input type="checkbox" checked={checked} disabled={disabled} onChange={event => onChange(event.target.checked)} /></label>;
}
