import { useEffect, useState } from "react";
import { Link } from "wouter";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Bell,
  Bot,
  BookOpen,
  Camera,
  ChevronRight,
  CirclePlay,
  Droplets,
  FileText,
  Fish,
  Home,
  Leaf,
  LibraryBig,
  Plus,
  Radio,
  ScanSearch,
  Search,
  Send,
  Sparkles,
  Sprout,
  Upload,
  UserRound,
  Users,
  Video,
  Waves,
} from "lucide-react";
import LivingSensorRail from "@/components/LivingSensorRail";
import "@/styles/living-flow.css";

type FlowSlug = "botanik" | "aquaristik" | "terraristik" | "ki-assistent" | "live" | "foto" | "beitrag";
type FlowTone = "botany" | "aquarium" | "terrarium" | "ai" | "neutral";

type FlowAction = { label: string; note: string; href: string; icon: LucideIcon };
type FlowConfig = {
  slug: FlowSlug;
  eyebrow: string;
  title: string;
  subtitle: string;
  tone: FlowTone;
  icon: LucideIcon;
  image: string;
  actions: FlowAction[];
  mode?: "capture-photo" | "capture-video" | "live" | "post";
};

const IMAGES = {
  botany: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/qmloFTGSjCFRoVJv.jpg",
  aquarium: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/IdfRorWpbjjRkmWY.jpg",
  terrarium: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/JyzIvRjtPdIvwWWD.jpg",
  ai: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/PSZueuRMSmSZbPaL.jpg",
};

const FLOWS: Record<FlowSlug, FlowConfig> = {
  botanik: {
    slug: "botanik", eyebrow: "PFLANZEN WORLD", title: "BOTANIK", subtitle: "Dokumentiere, pflege und entdecke deine Pflanzen.", tone: "botany", icon: Leaf, image: IMAGES.botany,
    actions: [
      { label: "Meine Pflanzen", note: "Sammlung öffnen", href: "/plants", icon: LibraryBig },
      { label: "Pflanze hinzufügen", note: "Mit Foto starten", href: "/plants/new", icon: Plus },
      { label: "Pflanze bestimmen", note: "KI-Assistent öffnen", href: "/ai?context=plant", icon: ScanSearch },
      { label: "Pflegewissen", note: "Guides entdecken", href: "/knowledge", icon: BookOpen },
    ],
  },
  aquaristik: {
    slug: "aquaristik", eyebrow: "AQUARISTIK", title: "AQUARISTIK", subtitle: "Dein Becken, deine Wasserwerte, deine Unterwasserwelt.", tone: "aquarium", icon: Waves, image: IMAGES.aquarium,
    actions: [
      { label: "Meine Aquarien", note: "Becken öffnen", href: "/aquariums", icon: Fish },
      { label: "Aquarium hinzufügen", note: "Neues Becken dokumentieren", href: "/aquariums/new", icon: Plus },
      { label: "Wasserwerte", note: "Zu deinen Becken", href: "/aquariums", icon: Droplets },
      { label: "KI zur Aquaristik", note: "Frage stellen", href: "/ai?context=aquarium", icon: Bot },
    ],
  },
  terraristik: {
    slug: "terraristik", eyebrow: "TERRARISTIK", title: "TERRARISTIK", subtitle: "Regenwald im Kleinen – beobachten, festhalten, dazulernen.", tone: "terrarium", icon: Sprout, image: IMAGES.terrarium,
    actions: [
      { label: "Terrarium fotografieren", note: "Foto erfassen", href: "/flow/foto", icon: Camera },
      { label: "Terrarium entdecken", note: "Inspiration finden", href: "/discover", icon: Sparkles },
      { label: "Wissen", note: "Pflege & Arten", href: "/knowledge", icon: BookOpen },
      { label: "KI fragen", note: "Antwort erhalten", href: "/ai", icon: Bot },
    ],
  },
  "ki-assistent": {
    slug: "ki-assistent", eyebrow: "BLACKWATERLEAF KI", title: "KI-ASSISTENT", subtitle: "Dein ruhiger Begleiter für Pflanzen, Aquarien und Terrarien.", tone: "ai", icon: Bot, image: IMAGES.ai,
    actions: [
      { label: "Chat starten", note: "Frage direkt stellen", href: "/ai", icon: Send },
      { label: "Pflanze bestimmen", note: "Mit Bild analysieren", href: "/ai?context=plant", icon: ScanSearch },
      { label: "Aquarium fragen", note: "Wasser & Besatz", href: "/ai?context=aquarium", icon: Fish },
      { label: "Wissen durchsuchen", note: "Guides öffnen", href: "/knowledge", icon: BookOpen },
    ],
  },
  live: {
    slug: "live", eyebrow: "LIVE-BEREICH", title: "DEINE WELT LIVE", subtitle: "Sensoren, Kamera und Tagesstimmung – erst mit echter Verbindung aktiv.", tone: "aquarium", icon: Radio, image: IMAGES.aquarium, mode: "live",
    actions: [
      { label: "Kamera starten", note: "Foto aufnehmen", href: "/flow/foto", icon: Camera },
      { label: "Wasserwerte ansehen", note: "Zu deinen Becken", href: "/aquariums", icon: Droplets },
      { label: "Benachrichtigungen", note: "Aktuelle Hinweise", href: "/notifications", icon: Bell },
      { label: "Entdecken", note: "Community öffnen", href: "/discover", icon: Search },
    ],
  },
  foto: {
    slug: "foto", eyebrow: "MOMENT FESTHALTEN", title: "FOTO", subtitle: "Nimm eine Beobachtung auf und wähle anschließend ihren Platz in deiner Welt.", tone: "botany", icon: Camera, image: IMAGES.botany, mode: "capture-photo",
    actions: [
      { label: "Als Pflanzenfoto", note: "Pflanze hinzufügen", href: "/plants/new", icon: Leaf },
      { label: "Als Aquariumfoto", note: "Becken hinzufügen", href: "/aquariums/new", icon: Fish },
      { label: "Mit KI bestimmen", note: "Assistent öffnen", href: "/ai", icon: Bot },
      { label: "Zum Feed", note: "Beitrag verfassen", href: "/flow/beitrag", icon: FileText },
    ],
  },
  beitrag: {
    slug: "beitrag", eyebrow: "COMMUNITY", title: "BEITRAG", subtitle: "Teile eine Beobachtung, Frage oder Inspiration mit der BlackwaterLeaf-Community.", tone: "neutral", icon: FileText, image: IMAGES.botany, mode: "post",
    actions: [
      { label: "Beitrag im Feed verfassen", note: "Editor öffnen", href: "/feed", icon: Send },
      { label: "Foto auswählen", note: "Moment erfassen", href: "/flow/foto", icon: Camera },
      { label: "Video auswählen", note: "Clip aufnehmen", href: "/flow/live", icon: Video },
      { label: "Community entdecken", note: "Feed öffnen", href: "/feed", icon: Users },
    ],
  },
};

function FlowHeader({ config }: { config: FlowConfig }) {
  const Icon = config.icon;
  return (
    <>
      <header className="bwl-flow-topbar">
        <Link href="/feed" className="bwl-flow-back" aria-label="Zur Community"><ArrowLeft /></Link>
        <Link href="/feed" className="bwl-flow-brand"><span><Leaf /></span><strong>BLACKWATER<span>LEAF</span></strong></Link>
        <div className="bwl-flow-top-tools"><Link href="/discover" aria-label="Entdecken"><Search /></Link><Link href="/notifications" aria-label="Benachrichtigungen"><Bell /><i /></Link></div>
      </header>
      <LivingSensorRail />
      <section className={`bwl-flow-hero bwl-flow-hero-${config.tone}`}>
        <img src={config.image} alt="" />
        <div className="bwl-flow-hero-shade" />
        <div className="bwl-flow-hero-copy">
          <span className="bwl-flow-hero-icon"><Icon /></span>
          <p>{config.eyebrow}</p>
          <h1>{config.title}</h1>
          <span>{config.subtitle}</span>
        </div>
      </section>
    </>
  );
}

function CapturePanel({ kind }: { kind: "photo" | "video" }) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const label = kind === "photo" ? "Foto auswählen oder aufnehmen" : "Video auswählen oder aufnehmen";
  const Icon = kind === "photo" ? Camera : CirclePlay;
  return (
    <section className="bwl-flow-capture" aria-label={label}>
      {preview ? (kind === "photo" ? <img src={preview} alt="Vorschau der aufgenommenen Beobachtung" /> : <video src={preview} controls playsInline />) : <div className="bwl-flow-capture-empty"><Icon /><span>{kind === "photo" ? "Dein Bildausschnitt" : "Dein Videomoment"}</span></div>}
      <label className="bwl-flow-capture-button"><Upload /><span>{label}</span><input type="file" accept={kind === "photo" ? "image/*" : "video/*"} capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; setPreview((previous) => { if (previous) URL.revokeObjectURL(previous); return URL.createObjectURL(file); }); event.target.value = ""; }} /></label>
    </section>
  );
}

function LivePanel() {
  return (
    <section className="bwl-flow-live-panel" aria-label="Status der Live-Verbindung">
      <div className="bwl-flow-live-rings"><Radio /></div>
      <div><p>LIVE-VERBINDUNG</p><h2>Noch nicht verbunden</h2><span>Sensorwerte und Kamera werden erst gezeigt, wenn eine echte Verbindung freigegeben wurde.</span></div>
    </section>
  );
}

function PostPanel() {
  return (
    <section className="bwl-flow-post-panel">
      <div className="bwl-flow-post-head"><span><Leaf /></span><div><b>Dein Moment</b><small>Wähle im nächsten Schritt den Feed-Editor.</small></div></div>
      <div className="bwl-flow-post-lines"><i /><i /><i /></div>
      <Link href="/feed" className="bwl-flow-post-submit"><Send /> Zum Feed-Editor <ChevronRight /></Link>
    </section>
  );
}

function FlowActions({ actions, tone }: { actions: FlowAction[]; tone: FlowTone }) {
  return (
    <section className="bwl-flow-actions" aria-label="Verfügbare Aktionen">
      <div className="bwl-flow-section-heading"><span>DEINE AUSWAHL</span><i /></div>
      <div className="bwl-flow-action-grid">
        {actions.map((action) => {
          const Icon = action.icon;
          return <Link key={action.label} href={action.href} className={`bwl-flow-action bwl-flow-action-${tone}`}><span className="bwl-flow-action-icon"><Icon /></span><span className="bwl-flow-action-copy"><strong>{action.label}</strong><small>{action.note}</small></span><ChevronRight /></Link>;
        })}
      </div>
    </section>
  );
}

function FlowSwitch() {
  const worlds: Array<{ label: string; href: string; tone: FlowTone; icon: LucideIcon }> = [
    { label: "Botanik", href: "/flow/botanik", tone: "botany", icon: Leaf },
    { label: "Aquaristik", href: "/flow/aquaristik", tone: "aquarium", icon: Waves },
    { label: "Terraristik", href: "/flow/terraristik", tone: "terrarium", icon: Sprout },
    { label: "KI", href: "/flow/ki-assistent", tone: "ai", icon: Bot },
  ];
  return <nav className="bwl-flow-switch" aria-label="Bereich wechseln">{worlds.map(({ label, href, tone, icon: Icon }) => <Link key={label} href={href} className={`bwl-flow-switch-${tone}`}><Icon /><span>{label}</span></Link>)}</nav>;
}

function LivingBottomNav() {
  return (
    <nav className="bwl-flow-bottom-nav" aria-label="Hauptnavigation">
      <Link href="/feed"><Home /><span>Home</span></Link>
      <Link href="/discover"><Search /><span>Entdecken</span></Link>
      <Link href="/feed"><Users /><span>Community</span></Link>
      <Link href="/profile"><UserRound /><span>Profil</span></Link>
    </nav>
  );
}

export default function LivingFlow({ flow }: { flow: string }) {
  const config = FLOWS[flow as FlowSlug] ?? FLOWS.botanik;
  const captureKind = config.mode === "capture-video" ? "video" : "photo";
  return (
    <div className={`bwl-flow-page bwl-flow-page-${config.tone}`}>
      <div className="bwl-flow-glow" aria-hidden="true" />
      <div className="bwl-flow-content">
        <FlowHeader config={config} />
        {config.mode === "capture-photo" && <CapturePanel kind={captureKind} />}
        {config.mode === "live" && <LivePanel />}
        {config.mode === "post" && <PostPanel />}
        <FlowActions actions={config.actions} tone={config.tone} />
        <FlowSwitch />
        <LivingBottomNav />
      </div>
    </div>
  );
}
