import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Bell,
  BookOpen,
  Bot,
  Camera,
  ChevronRight,
  Compass,
  Droplets,
  Fish,
  Hand,
  Heart,
  Home,
  Leaf,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Settings2,
  Share2,
  Sparkles,
  Sun,
  Thermometer,
  Upload,
  Video,
  Wind,
} from "lucide-react";
import "@/styles/reference-layout.css";

const ASSETS = {
  leaf: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/qmloFTGSjCFRoVJv.jpg",
  plants: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/qmloFTGSjCFRoVJv.jpg",
  water: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/IdfRorWpbjjRkmWY.jpg",
  terrarium: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/JyzIvRjtPdIvwWWD.jpg",
  ai: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/PSZueuRMSmSZbPaL.jpg",
  logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/qmloFTGSjCFRoVJv.jpg",
};

type ReferenceAction = {
  label: string;
  icon: typeof Video;
  href: string;
  className: string;
};

const radialActions: ReferenceAction[] = [
  { label: "Video", icon: Video, href: "/feed", className: "ref-action-video" },
  { label: "Foto", icon: Camera, href: "/feed", className: "ref-action-photo" },
  { label: "Beitrag", icon: Upload, href: "/feed", className: "ref-action-post" },
  { label: "Pflanze\nhinzufügen", icon: Leaf, href: "/plants/new", className: "ref-action-plant" },
  { label: "Fisch\nhinzufügen", icon: Fish, href: "/aquariums/new", className: "ref-action-fish" },
  { label: "Terrarium\nhinzufügen", icon: Sparkles, href: "/aquariums/new", className: "ref-action-terra" },
  { label: "KI fragen", icon: Bot, href: "/ai", className: "ref-action-ai" },
];

const worlds = [
  { title: "Pflanzen\nWorld", subtitle: "Entdecken", image: ASSETS.plants, icon: Leaf, tone: "plants", href: "/plants" },
  { title: "Aquaristik", subtitle: "Entdecken", image: ASSETS.water, icon: Fish, tone: "water", href: "/aquariums" },
  { title: "Terraristik", subtitle: "Entdecken", image: ASSETS.terrarium, icon: Sparkles, tone: "terra", href: "/discover" },
  { title: "KI-Assistent", subtitle: "Fragen & Helfen", image: ASSETS.ai, icon: Bot, tone: "ai", href: "/ai" },
];

const overlayItems = [
  { icon: Sparkles, title: "GLAS LEBT", copy: "Lichtreflexe wandern sanft über die Glasflächen. Transparenz passt sich dem Hintergrund an." },
  { icon: Droplets, title: "WASSER", copy: "Unter dem Plus-Button entstehen kleine Wellen. Luftblasen steigen im Hintergrund auf." },
  { icon: Leaf, title: "NATUR", copy: "Blätter bewegen sich leicht im Wind. Tau-Effekt morgens auf den Karten." },
  { icon: Hand, title: "INTERAKTIONEN", copy: "Buttons atmen. Karten heben sich beim Antippen leicht an. Sanfter Parallax-Effekt." },
  { icon: Sun, title: "TAGESZEIT", copy: "Morgens: warme Sonnenstrahlen. Tagsüber: klares Licht. Nachts: dunkles Grün mit Lichtpunkten." },
  { icon: Settings2, title: "SENSOR-REAKTION", copy: "Neigung des Handys bewirkt subtile 3D-Tiefe. Lichtreflexe und Wellen reagieren sanft." },
];

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <div className={`ref-brand ${small ? "ref-brand-small" : ""}`}>
      <span className="ref-leaf-mark" aria-hidden="true"><Leaf /></span>
      <span>
        <strong>BLACKWATER<span>LEAF</span></strong>
        {!small && <em>DESIGN KONZEPT · OVERLAY LEBT</em>}
      </span>
    </div>
  );
}

function ActionButton({ action }: { action: ReferenceAction }) {
  const Icon = action.icon;
  return (
    <Link href={action.href} className={`ref-action ${action.className}`}>
      <Icon />
      <span>{action.label.split("\n").map((line) => <span key={line}>{line}</span>)}</span>
    </Link>
  );
}

function MobileReference() {
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <section className="reference-phone-wrap" aria-label="BlackwaterLeaf mobile app reference">
      <div className="reference-phone">
        <div className="ref-phone-screen">
          <div className="ref-statusbar"><span>9:41</span><div><span>▮▮▮</span><span>◒</span><span>▰</span></div></div>
          <header className="ref-mobile-header">
            <BrandMark small />
            <div className="ref-header-tools">
              <button aria-label="Suche" onClick={() => toast.info("Suche öffnet die Entdecken-Ansicht.")}><Search /></button>
              <Link href="/notifications" aria-label="Benachrichtigungen"><Bell /><i /></Link>
              <Link href="/profile" className="ref-avatar" aria-label="Profil"><img src={ASSETS.logo} alt="" /></Link>
            </div>
          </header>

          <div className="ref-sensor-rail" aria-label="Live-Sensorwerte">
            <div><Thermometer /><span><b>24.3 °C</b><small>Wasser</small></span></div>
            <div><Leaf /><span><b>68 %</b><small>Luftfeuchte</small></span></div>
            <div><Droplets /><span><b>6.2 pH</b><small>pH-Wert</small></span></div>
            <div><Wind /><span><b>Leichter Regen</b><small>Außen</small></span></div>
          </div>

          <article className="ref-feature-post">
            <div className="ref-post-image" style={{ backgroundImage: `url(${ASSETS.leaf})` }} />
            <div className="ref-post-vignette" />
            <div className="ref-post-head">
              <div className="ref-mini-avatar"><Leaf /></div>
              <span><b>PlantLover_88 <i>✿</i></b><small>2 Std. · Alocasia Liebe</small></span>
              <button aria-label="Mehr Optionen"><MoreHorizontal /></button>
            </div>
            <div className="ref-post-copy">
              <h2>Alocasia Silver Dragon</h2>
              <p>Einfach nur verliebt in diese Blattstruktur. Natur ist Art.</p>
              <b className="ref-hashtag">#alocasia</b>
            </div>
            <div className="ref-post-actions">
              <button onClick={() => setLiked(!liked)} aria-label="Gefällt mir" className={liked ? "is-liked" : ""}><Heart fill={liked ? "currentColor" : "none"}/><span>2.4K</span></button>
              <button onClick={() => toast.info("Kommentare werden im Feed geöffnet.")} aria-label="Kommentieren"><MessageCircle /><span>348</span></button>
              <button onClick={() => toast.info("Beitrag gespeichert.")} aria-label="Speichern"><BookOpen /><span>912</span></button>
              <button onClick={() => navigator.share?.({ title: "BlackwaterLeaf", url: window.location.href })} aria-label="Teilen"><Share2 /><span>Teilen</span></button>
            </div>
            <div className="ref-post-foot"><div className="ref-tiny-avatar"><Leaf /></div><span>Gefällt 2.456 Personen</span></div>
          </article>

          <div className="ref-world-row">
            {worlds.map((world) => {
              const Icon = world.icon;
              return (
                <Link href={world.href} className={`ref-world-card ref-world-${world.tone}`} key={world.title}>
                  <img src={world.image} alt="" />
                  <div className="ref-world-shade" />
                  <div className="ref-world-content"><b>{world.title.split("\n").map((line) => <span key={line}>{line}</span>)}</b><small>{world.subtitle}</small></div>
                  <span className="ref-world-icon"><Icon /></span>
                </Link>
              );
            })}
          </div>

          <div className={`ref-orbit-zone ${open ? "is-open" : ""}`}>
            <div className="ref-water-lines" aria-hidden="true" />
            {radialActions.map((action) => <ActionButton action={action} key={action.label} />)}
            <button className="ref-orbit-core" onClick={() => setOpen(!open)} aria-label={open ? "Aktionsmenü schließen" : "Aktionsmenü öffnen"} aria-expanded={open}>
              <span className="ref-core-rings" />
              <Leaf />
            </button>
          </div>

          <nav className="ref-mobile-tabs" aria-label="Hauptnavigation">
            <Link href="/" className="is-active"><Home /><span>Home</span></Link>
            <Link href="/discover"><Compass /><span>Entdecken</span></Link>
            <Link href="/feed"><UsersIcon /><span>Community</span></Link>
            <Link href="/ai"><Bot /><span>KI</span></Link>
            <Link href="/profile"><UserIcon /><span>Profil</span></Link>
          </nav>
          <div className="ref-home-indicator" />
        </div>
      </div>
    </section>
  );
}

function UsersIcon() {
  return <span className="ref-custom-icon"><span /><span /><span /></span>;
}
function UserIcon() {
  return <span className="ref-user-icon"><span /><i /></span>;
}

function ReferenceBrief() {
  return (
    <aside className="reference-brief" aria-label="Design specification">
      <BrandMark />
      <div className="ref-rule" />
      <section className="ref-brief-section">
        <p className="ref-eyebrow">DAS OVERLAY LEBT</p>
        <div className="ref-spec-list">
          {overlayItems.map((item) => {
            const Icon = item.icon;
            return <article key={item.title} className="ref-spec"><span className="ref-spec-icon"><Icon /></span><div><h2>{item.title}</h2><p>{item.copy}</p></div></article>;
          })}
        </div>
      </section>

      <section className="ref-brief-section">
        <p className="ref-eyebrow">STIMMUNG IN DEN BEREICHEN</p>
        <div className="ref-mood-row">
          {worlds.map((world) => {
            const Icon = world.icon;
            return <Link href={world.href} className={`ref-mood-card ref-mood-${world.tone}`} key={world.title}>
              <img src={world.image} alt="" />
              <div /><Icon /><b>{world.title.replace("\n", " ")}</b><small>{world.subtitle}</small>
            </Link>;
          })}
        </div>
      </section>

      <section className="ref-micro-section">
        <p className="ref-eyebrow">MIKROANIMATIONEN – SO FÜHLT ES SICH AN</p>
        <div className="ref-micro-grid">
          {[
            ["GLAS REFLEXE", "Licht wandert sanft über die Glasflächen.", "glass"],
            ["WASSER WELLEN", "Bei jeder Berührung entstehen kleine Wellen.", "water"],
            ["LUFTBLASEN", "Blasen steigen langsam im Hintergrund auf.", "bubble"],
            ["BLÄTTER BEWEGUNG", "Blätter bewegen sich leicht im Wind.", "leaf"],
            ["TAU & REGEN", "Regen am Morgen. Tropfen am Glas.", "rain"],
            ["KARTEN HOVER", "Karte hebt sich leicht und wird weich beschattet.", "card"],
          ].map(([title, copy, kind]) => <article className={`ref-micro ref-micro-${kind}`} key={title}><div className="ref-micro-visual" /><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <footer className="ref-brief-footer"><BrandMark small /><div><strong>EINE APP. EINE ATMOSPHÄRE. EINE LEBENDE ERFAHRUNG.</strong><span>BLACKWATERLEAF · NATUR VERBINDEN. WISSEN TEILEN. GEMEINSAM WACHSEN.</span></div></footer>
    </aside>
  );
}

export default function DesignReference() {
  return (
    <main className="reference-page">
      <div className="reference-grain" />
      <div className="reference-stage">
        <MobileReference />
        <ReferenceBrief />
      </div>
    </main>
  );
}
