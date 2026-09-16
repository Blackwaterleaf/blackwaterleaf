import { useState } from "react";
import { Link } from "wouter";
import type { LucideIcon } from "lucide-react";
import { Bot, Camera, Fish, Leaf, PenLine, Sprout, Video } from "lucide-react";
import "@/styles/world-controls.css";

type QuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
  position: string;
  tone: "botany" | "aquarium" | "terrarium" | "ai" | "neutral";
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Video", href: "/feed", icon: Video, position: "north-west", tone: "neutral" },
  { label: "Foto", href: "/feed", icon: Camera, position: "north", tone: "neutral" },
  { label: "Beitrag", href: "/feed", icon: PenLine, position: "north-east", tone: "neutral" },
  { label: "Pflanze\nhinzufügen", href: "/plants/new", icon: Leaf, position: "west", tone: "botany" },
  { label: "Fisch\nhinzufügen", href: "/aquariums/new", icon: Fish, position: "east", tone: "aquarium" },
  { label: "Terrarium\nhinzufügen", href: "/aquariums/new", icon: Sprout, position: "south-west", tone: "terrarium" },
  { label: "KI fragen", href: "/ai", icon: Bot, position: "south-east", tone: "ai" },
];

/** A touch-friendly version of the quick-action wheel shown in the reference layout. */
export default function QuickActionWheel() {
  // The supplied layout keeps the seven choices compact until the user taps
  // the luminous leaf in the center.
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className={`bwl-quick-wheel ${isOpen ? "is-open" : ""}`} aria-label="Schnellaktionen">
      <div className="bwl-quick-water" aria-hidden="true" />
      <div className="bwl-quick-actions" aria-hidden={!isOpen}>
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`bwl-quick-action bwl-quick-action-${action.position} bwl-quick-action-${action.tone}`}
              tabIndex={isOpen ? 0 : -1}
              onClick={() => setIsOpen(false)}
            >
              <Icon strokeWidth={1.7} />
              <span>{action.label.split("\n").map((line) => <span key={line}>{line}</span>)}</span>
            </Link>
          );
        })}
      </div>
      <button
        type="button"
        className="bwl-quick-core"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Schnellaktionen schließen" : "Schnellaktionen öffnen"}
      >
        <span className="bwl-quick-core-ring" aria-hidden="true" />
        <Leaf strokeWidth={1.35} />
      </button>
      <p>{isOpen ? "Auswahl treffen" : "Schnellaktionen"}</p>
    </section>
  );
}
