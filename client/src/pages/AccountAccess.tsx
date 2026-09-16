import { LiveSensorStrip } from "@/components/LiveSensorStrip";
import { ReferenceHero } from "@/components/ReferenceOverlay";
import { REFERENCE_ASSETS } from "@/lib/worlds";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, KeyRound, Leaf, LockKeyhole, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { trpc } from "@/lib/trpc";

type AccessMode = "login" | "register" | "forgot" | "verify" | "reset";

function modeForPath(path: string): AccessMode {
  if (path === "/register") return "register";
  if (path === "/forgot-password") return "forgot";
  if (path === "/verify-email") return "verify";
  if (path === "/reset-password") return "reset";
  return "login";
}

const copy: Record<AccessMode, { eyebrow: string; title: string; body: string }> = {
  login: { eyebrow: "KONTO / ANMELDEN", title: "WILLKOMMEN ZURÜCK", body: "Melde dich mit deiner BlackWaterLeaf-E-Mail-Adresse an." },
  register: { eyebrow: "KONTO / ERSTELLEN", title: "DEIN BEREICH", body: "Ein Konto bündelt deine privaten Aquarien, Pflanzen und Terrarien sicher an einem Ort." },
  forgot: { eyebrow: "KONTO / ZURÜCKSETZEN", title: "ZUGANG WIEDERHERSTELLEN", body: "Wir senden dir einen zeitlich begrenzten Link zum Zurücksetzen deines Passworts." },
  verify: { eyebrow: "KONTO / BESTÄTIGEN", title: "E-MAIL BESTÄTIGEN", body: "Bestätige deine E-Mail-Adresse, um dein Konto freizuschalten." },
  reset: { eyebrow: "KONTO / NEUES PASSWORT", title: "ZUGANG SICHERN", body: "Lege ein neues, sicheres Passwort für dein BlackWaterLeaf-Konto fest." },
};

export default function AccountAccess() {
  const [location, setLocation] = useLocation();
  const mode = modeForPath(location);
  const utils = trpc.useUtils();
  const status = trpc.auth.status.useQuery(undefined, { retry: false });
  const login = trpc.auth.login.useMutation();
  const register = trpc.auth.register.useMutation();
  const requestReset = trpc.auth.requestPasswordReset.useMutation();
  const verifyEmail = trpc.auth.verifyEmail.useMutation();
  const resetPassword = trpc.auth.resetPassword.useMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = useMemo(() => new URLSearchParams(window.location.search).get("token") ?? "", [location]);
  const isEmailReady = Boolean(status.data?.emailDeliveryConfigured);
  const isWorking = login.isPending || register.isPending || requestReset.isPending || verifyEmail.isPending || resetPassword.isPending;
  const headline = copy[mode];
  const AccessIcon = mode === "register" ? UserPlus : mode === "login" ? KeyRound : ShieldCheck;

  const presentError = (caught: unknown) => {
    const message = caught instanceof Error ? caught.message : "account_request_failed";
    const german: Record<string, string> = {
      invalid_email_or_password: "E-Mail-Adresse oder Passwort sind nicht korrekt.",
      email_not_verified: "Bitte bestätige zuerst deine E-Mail-Adresse. Prüfe dein Postfach.",
      account_not_active: "Dieses Konto ist derzeit nicht aktiv.",
      email_already_registered: "Für diese E-Mail-Adresse existiert bereits ein Konto.",
      account_migration_conflict: "Für diese E-Mail-Adresse gibt es mehrere bestehende Konten. Bitte kontaktiere den Support.",
      password_too_short: "Das Passwort muss mindestens 12 Zeichen lang sein.",
      password_too_long: "Das Passwort ist zu lang.",
      invalid_or_expired_token: "Dieser Link ist ungültig, bereits verwendet oder abgelaufen.",
      local_auth_email_not_configured: "Die E-Mail-Zustellung wird noch eingerichtet. Bitte versuche es später erneut.",
      database_unavailable: "Der Kontodienst ist momentan nicht erreichbar.",
    };
    setError(german[message] ?? "Die Anfrage konnte nicht verarbeitet werden. Bitte versuche es erneut.");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setNotice(null);
    setError(null);
    try {
      if (mode === "login") {
        await login.mutateAsync({ email, password });
        await utils.auth.me.invalidate();
        setLocation("/profile");
      }
      if (mode === "register") {
        await register.mutateAsync({ email, password, ...(displayName.trim() ? { displayName: displayName.trim() } : {}) });
        setNotice("Fast geschafft. Wir haben dir einen Bestätigungslink per E-Mail gesendet.");
      }
      if (mode === "forgot") {
        await requestReset.mutateAsync({ email });
        setNotice("Wenn ein passendes Konto existiert, erhältst du in Kürze eine E-Mail.");
      }
      if (mode === "verify") {
        if (!token) throw new Error("invalid_or_expired_token");
        await verifyEmail.mutateAsync({ token });
        await utils.auth.me.invalidate();
        setNotice("Deine E-Mail-Adresse wurde bestätigt. Dein Konto ist jetzt aktiv.");
        window.setTimeout(() => setLocation("/profile"), 800);
      }
      if (mode === "reset") {
        if (!token) throw new Error("invalid_or_expired_token");
        await resetPassword.mutateAsync({ token, password });
        await utils.auth.me.invalidate();
        setNotice("Dein Passwort wurde aktualisiert. Du wirst zu deinem Profil weitergeleitet.");
        window.setTimeout(() => setLocation("/profile"), 800);
      }
    } catch (caught) {
      presentError(caught);
    }
  };

  const emailNeeded = mode === "login" || mode === "register" || mode === "forgot";
  const passwordNeeded = mode === "login" || mode === "register" || mode === "reset";
  const mailDisabled = (mode === "register" || mode === "forgot") && !isEmailReady;

  return (
    <main className="account-access-page reference-page reference-page--botany">
      <LiveSensorStrip compact />
      <ReferenceHero tone="botany" image={REFERENCE_ASSETS.botany} eyebrow={headline.eyebrow} title={headline.title} subtitle={headline.body} icon={AccessIcon} badge="SICHERER ZUGANG" />
      <section className="account-access-card glass-panel">
        <Link href="/" className="account-back"><ArrowLeft size={16} /> ZURÜCK ZU BLACKWATERLEAF</Link>
        <div className="account-access-mark"><Leaf size={24} /></div>
        <p className="eyebrow">[{headline.eyebrow}]</p>
        <h1 className="glitch-title" data-text={headline.title}>{headline.title}</h1>
        <p className="account-access-intro">{headline.body}</p>

        {mailDisabled ? <p className="form-status" role="status">Die E-Mail-Zustellung wird gerade eingerichtet. Anmeldung mit einem bereits bestätigten Konto bleibt möglich.</p> : null}
        {notice ? <p className="account-success" role="status"><CheckCircle2 size={17} />{notice}</p> : null}
        {error ? <p className="account-error" role="alert">{error}</p> : null}

        <form className="account-form" onSubmit={submit}>
          {mode === "register" ? <label className="field"><span>ANZEIGENAME <em>OPTIONAL</em></span><input value={displayName} maxLength={160} autoComplete="name" onChange={event => setDisplayName(event.target.value)} /></label> : null}
          {emailNeeded ? <label className="field"><span>E-MAIL-ADRESSE</span><div className="account-input"><Mail size={17} /><input value={email} type="email" autoComplete={mode === "login" ? "username" : "email"} required onChange={event => setEmail(event.target.value)} /></div></label> : null}
          {passwordNeeded ? <label className="field"><span>PASSWORT {mode !== "login" ? <em>MIN. 12 ZEICHEN</em> : null}</span><div className="account-input"><LockKeyhole size={17} /><input value={password} type="password" minLength={mode === "login" ? undefined : 12} maxLength={256} autoComplete={mode === "login" ? "current-password" : "new-password"} required onChange={event => setPassword(event.target.value)} /></div></label> : null}
          {mode === "verify" && !token ? <p className="account-error">Der Bestätigungslink enthält keinen gültigen Sicherheitscode.</p> : null}
          <button className="primary-action account-submit" type="submit" disabled={isWorking || mailDisabled || ((mode === "verify" || mode === "reset") && !token)}>
            {mode === "login" ? <KeyRound size={17} /> : mode === "register" ? <UserPlus size={17} /> : <ShieldCheck size={17} />}
            {isWorking ? "WIRD VERARBEITET …" : mode === "login" ? "ANMELDEN" : mode === "register" ? "KONTO ERSTELLEN" : mode === "forgot" ? "RESET-LINK SENDEN" : mode === "verify" ? "E-MAIL BESTÄTIGEN" : "PASSWORT SPEICHERN"}
          </button>
        </form>

        {mode === "login" ? <div className="account-route-links"><Link href="/forgot-password">Passwort vergessen?</Link><Link href="/register">Neues Konto erstellen</Link></div> : null}
        {mode === "register" ? <div className="account-route-links"><Link href="/login">Bereits registriert? Anmelden</Link></div> : null}
        {(mode === "forgot" || mode === "verify" || mode === "reset") ? <div className="account-route-links"><Link href="/login">Zur Anmeldung</Link></div> : null}
        <p className="account-privacy"><ShieldCheck size={14} />Passwörter werden niemals im Klartext gespeichert. Bestätigungs- und Reset-Links sind einmalig und zeitlich begrenzt.</p>
      </section>
    </main>
  );
}
