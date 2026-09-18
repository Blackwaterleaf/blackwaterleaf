import { useAuth } from "@/_core/hooks/useAuth";
import { HabitatProfiles } from "@/components/HabitatProfiles";
import { SmartDeviceDialog } from "@/components/SmartDeviceDialog";
import { StatePanel } from "@/components/StatePanel";
import { useI18n, type AppLocale, type UnitSystem } from "@/i18n";
import { imageErrorMessage, readImageAsBase64 } from "@/lib/files";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Camera, Leaf, LockKeyhole, Ruler, Save, ShieldCheck, Trophy, UserPlus, UserRound } from "lucide-react";
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

  return (
    <div className="reference-page reference-page--botany profile-page-only">
      {!auth.isAuthenticated ? <ProfileAuthOverlay locale={locale} /> : profile.isLoading ? (
        <StatePanel code="PROFILE/LOAD" state="loading" title={t("common.loading")} body={t("profile.signedOut")} />
      ) : profile.isError || !profile.data ? (
        <StatePanel code="PROFILE/ERROR" state="error" title={t("common.error")} body={t("profile.signedOut")} />
      ) : (
        <>
          <details id="profile-private" className="profile-page-actions glass-panel" open>
            <summary><span>AKTIONEN</span><small>Privat verwalten</small><b>+</b></summary>
            <nav className="profile-page-actions__menu" aria-label="Profilaktionen">
              <Link href="#profile-edit">01 · Privat</Link>
              <Link href="#profile-privacy">Datenschutz & Freigaben</Link>
              <Link href="#profile-habitats">02 · Anlagen</Link>
              <Link href="#progress">03 · Punkte</Link>
              <Link href="#profile-preferences">Sprache & Einheiten</Link>
              <Link href="#profile-tools">Weitere Werkzeuge</Link>
            </nav>
          </details>
          <section className="profile-card glass-panel" id="progress">
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

          <details id="profile-privacy" className="profile-display-settings glass-panel">
            <summary><span>ANZEIGEN</span><small>Welche Anlagen sollen im Profil erscheinen?</small><b>+</b></summary>
            <div className="profile-display-settings__items">
              {([['plant', 'Pflanzen', Leaf], ['aquarium', 'Aquarium', null], ['terrarium', 'Terraristik', null]] as const).map(([kind, label, Icon]) => <button key={kind} type="button" className={visibleKinds.includes(kind) ? "is-selected" : ""} onClick={() => toggleVisibleKind(kind)}>{Icon ? <Icon size={15} /> : <span className="profile-display-settings__dot" />}<span>{label}</span><b>{visibleKinds.includes(kind) ? "✓" : "○"}</b></button>)}
            </div>
          </details>

          <details id="profile-consents" className="account-section glass-panel profile-menu-only">
            <summary><span>DATENSCHUTZ & FREIGABEN</span><small>Du entscheidest über jede Freigabe</small></summary>
            <section className="profile-consent-list">
              <ConsentToggle label="Profil veröffentlichen" checked={Boolean(consentMap.get("profile_publication"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("profile_publication", checked)} />
              <ConsentToggle label="Beobachtungen veröffentlichen" checked={Boolean(consentMap.get("observation_publishing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("observation_publishing", checked)} />
              <ConsentToggle label="Bilder sicher verarbeiten" checked={Boolean(consentMap.get("media_processing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("media_processing", checked)} />
              <ConsentToggle label="Community-Beiträge veröffentlichen" checked={Boolean(consentMap.get("community_publishing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("community_publishing", checked)} />
              <ConsentToggle label="KI-Anfragen sicher verarbeiten" checked={Boolean(consentMap.get("ai_processing"))} disabled={setConsent.isPending} onChange={checked => void updateConsent("ai_processing", checked)} />
            </section>
          </details>

          <details id="profile-edit" className="account-section glass-panel profile-menu-only">
            <summary><span>{locale === "de" ? "Profil bearbeiten" : "Edit profile"}</span><small>{locale === "de" ? "Anzeigename, Bio & Links" : "Name, bio & links"}</small></summary>
            <form className="profile-form" onSubmit={saveProfile}>
              <label id="profile-avatar" className="secondary-action file-action"><Camera size={16} />{locale === "de" ? "Profilbild ändern" : "Change profile image"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => void changeAvatar(event.target.files?.[0])} /></label>
              <div className="form-grid profile-short-edit">
                <Field label={locale === "de" ? "Anzeigename" : "Display name"} value={form.name} onChange={value => setForm(current => ({ ...current, name: value }))} />
                <Field label={locale === "de" ? "Benutzername" : "Username"} value={form.username} onChange={value => setForm(current => ({ ...current, username: value }))} />
              </div>
              <label className="field"><span>Bio</span><textarea rows={4} maxLength={2000} value={form.bio} onChange={event => setForm(current => ({ ...current, bio: event.target.value }))} /></label>
              <button type="submit" className="primary-action" disabled={update.isPending}><Save size={16} />{update.isPending ? t("common.loading") : locale === "de" ? "PROFIL SPEICHERN" : "SAVE PROFILE"}</button>
            </form>
          </details>

          <section id="habitats" className="profile-habitats-section"><HabitatProfiles visibleKinds={visibleKinds} /></section>

          <details id="profile-tools" className="profile-secondary-tools account-section glass-panel">
            <summary><span>WEITERE WERKZEUGE</span><small>Nur bei Bedarf öffnen</small></summary>
            <div className="profile-secondary-tools__body">
              <Link className="secondary-action" href="/habitat-builder"><Ruler size={16} />HABITAT PLANEN</Link>
              <div className="profile-secondary-tools__smart"><span className="eyebrow">SMART-WERTE</span><span className="sr-only">Smart-Werte verbinden</span><SmartDeviceDialog /></div>
              <section className="account-danger-zone glass-panel" aria-labelledby="account-close-title">
                <div><span className="eyebrow">KONTO</span><h2 id="account-close-title">Konto schließen</h2><p>Deine persönlichen Profildaten werden anonymisiert und der Zugang wird deaktiviert. Dieser Schritt kann nicht rückgängig gemacht werden.</p></div>
                <label className="field"><span>Zur Bestätigung LÖSCHEN eingeben</span><input value={deleteConfirmation} onChange={event => setDeleteConfirmation(event.target.value)} autoComplete="off" /></label>
                <button type="button" className="danger-action" disabled={deleteConfirmation !== "LÖSCHEN" || closeAccount.isPending} onClick={() => void deleteAccount()}><AlertTriangle size={16} />{closeAccount.isPending ? "WIRD GESCHLOSSEN …" : "KONTO SCHLIESSEN"}</button>
              </section>
            </div>
          </details>

          <details id="profile-preferences" className="profile-secondary-tools account-section glass-panel">
            <summary><span>SPRACHE & EINHEITEN</span><small>Persönliche Darstellung</small></summary>
            <div className="profile-preferences-grid">
              <div><span className="eyebrow">SPRACHE</span><button type="button" className={locale === "de" ? "is-selected" : ""} onClick={() => void changeLocale("de")}>Deutsch</button><button type="button" className={locale === "en" ? "is-selected" : ""} onClick={() => void changeLocale("en")}>English</button></div>
              <div><span className="eyebrow">EINHEITEN</span><button type="button" className={unitSystem === "metric" ? "is-selected" : ""} onClick={() => void changeUnits("metric")}>Metrisch</button><button type="button" className={unitSystem === "imperial" ? "is-selected" : ""} onClick={() => void changeUnits("imperial")}>Imperial</button></div>
            </div>
          </details>

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

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="field"><span>{label}</span><input type={type} value={value} onChange={event => onChange(event.target.value)} /></label>;
}

function ConsentToggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled: boolean; onChange: (checked: boolean) => void }) {
  return <label className="consent-toggle"><span>{label}</span><input type="checkbox" checked={checked} disabled={disabled} onChange={event => onChange(event.target.checked)} /></label>;
}
