import { Link, useLocation } from "wouter";
import type { LucideIcon } from "lucide-react";
import { Bot, Leaf, Sprout, Waves } from "lucide-react";
import "@/styles/world-controls.css";

export type WorldTone = "botany" | "aquarium" | "terrarium" | "ai";

export type WorldChoice = {
  id: WorldTone;
  label: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  image: string;
};

/**
 * Canonical domain choices for BlackwaterLeaf. The card and icon colors mirror
 * the supplied layout: lime for botany, electric blue for aquatics, olive-lime
 * for terrariums, and neon violet for the AI assistant.
 */
export const WORLD_CHOICES: WorldChoice[] = [
  {
    id: "botany",
    label: "Pflanzen\nWorld",
    subtitle: "Entdecken",
    href: "/flow/botanik",
    icon: Leaf,
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/bIIgwWcVFsAuEvhE.jpg",
  },
  {
    id: "aquarium",
    label: "Aquaristik",
    subtitle: "Entdecken",
    href: "/flow/aquaristik",
    icon: Waves,
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/WzGGUGFNZmLSWrMr.jpg",
  },
  {
    id: "terrarium",
    label: "Terraristik",
    subtitle: "Entdecken",
    href: "/flow/terraristik",
    icon: Sprout,
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/QhxUwiwrRwBwYvdI.jpg",
  },
  {
    id: "ai",
    label: "KI-Assistent",
    subtitle: "Fragen & Helfen",
    href: "/flow/ki-assistent",
    icon: Bot,
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/odpbOWfqtBBNMRrK.jpg",
  },
];

export function WorldIcon({ icon: Icon, tone, size = 18 }: { icon: LucideIcon; tone: WorldTone; size?: number }) {
  return (
    <span className={`bwl-world-icon bwl-world-icon-${tone}`} aria-hidden="true">
      <Icon size={size} strokeWidth={1.7} />
    </span>
  );
}

export function WorldSelector({ heading = "DEINE BEREICHE" }: { heading?: string }) {
  const [location] = useLocation();

  return (
    <section className="bwl-world-selector" aria-label="Bereich auswählen">
      <div className="bwl-world-selector-head">
        <div>
          <p>{heading}</p>
          <span>IN BEWEGUNG</span>
        </div>
        <span className="bwl-world-selector-line" aria-hidden="true" />
      </div>
      <div className="bwl-world-choice-grid">
        {WORLD_CHOICES.map((world) => {
          const Icon = world.icon;
          const isCurrent = location === world.href || location.startsWith(`${world.href}/`);
          return (
            <Link
              key={world.id}
              href={world.href}
              className={`bwl-world-choice bwl-world-choice-${world.id} ${isCurrent ? "is-current" : ""}`}
              aria-current={isCurrent ? "page" : undefined}
            >
              <img src={world.image} alt="" />
              <span className="bwl-world-choice-shade" aria-hidden="true" />
              <span className="bwl-world-choice-copy">
                <strong>{world.label.split("\n").map((line) => <span key={line}>{line}</span>)}</strong>
                <small>{world.subtitle}</small>
              </span>
              <span className="bwl-world-choice-mark" aria-hidden="true"><Icon strokeWidth={1.65} /></span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
