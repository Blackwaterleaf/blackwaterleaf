import { AlertTriangle, ChevronRight, Leaf, X, type LucideIcon } from "lucide-react";
import { Link } from "wouter";
import { useState, type ReactNode } from "react";

export type ReferenceTone = "botany" | "aquarium" | "terrarium" | "ai";

export type ReferenceAction = {
  title: string;
  note: string;
  icon: LucideIcon;
  image: string;
  href?: string;
  onActivate?: () => void;
  unavailable?: boolean;
};

type ReferenceHeroProps = {
  tone: ReferenceTone;
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  badge?: string;
};

export function ReferenceHero({ tone, image, eyebrow, title, subtitle, icon: Icon = Leaf, badge }: ReferenceHeroProps) {
  return (
    <section className={`reference-hero reference-tone--${tone}`} style={{ backgroundImage: `url(${image})` }}>
      <div className="reference-hero__shade" aria-hidden="true" />
      <div className="reference-hero__copy">
        <span className="reference-hero__icon"><Icon size={20} /></span>
        <span className="reference-hero__eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {badge ? <span className="reference-hero__badge">{badge}</span> : null}
    </section>
  );
}

export function ReferenceActionGrid({ tone, actions, heading = "DEINE AUSWAHL" }: { tone: ReferenceTone; actions: ReferenceAction[]; heading?: string }) {
  const [futureMessage, setFutureMessage] = useState<string | null>(null);
  return (
    <section className={`reference-actions reference-tone--${tone}`} aria-label={heading}>
      <div className="reference-actions__heading"><span>{heading}</span><i aria-hidden="true" /></div>
      <div className="reference-action-grid">
        {actions.map(action => {
          const Icon = action.icon;
          const card = <>
            <img src={action.image} alt="" />
            <span className="reference-action__shade" aria-hidden="true" />
            <span className="reference-action__icon"><Icon size={17} /></span>
            <span className="reference-action__copy"><strong>{action.title}</strong><small>{action.note}</small></span>
            <ChevronRight className="reference-action__chevron" size={17} aria-hidden="true" />
            {action.unavailable ? <span className="reference-action__status">KÜNFTIG</span> : null}
          </>;
          if (action.href && !action.unavailable) return <Link key={action.title} href={action.href} className="reference-action">{card}</Link>;
          return <button key={action.title} type="button" className="reference-action" onClick={() => {
            if (action.unavailable) setFutureMessage(`${action.title} ist vorbereitet. Wir arbeiten daran – seid gespannt, was kommt.`);
            action.onActivate?.();
          }}>{card}</button>;
        })}
      </div>
      {futureMessage ? <div className="reference-future-banner" role="status"><Leaf size={18} /><span><strong>SEID GESPANNT</strong><small>{futureMessage}</small></span><button type="button" aria-label="Hinweis schließen" onClick={() => setFutureMessage(null)}><X size={16} /></button></div> : null}
    </section>
  );
}

export function ReferenceEmptyState({ tone, code, title, body, state = "empty", action }: { tone: ReferenceTone; code: string; title: string; body: string; state?: "empty" | "error"; action?: ReactNode }) {
  const Icon = state === "error" ? AlertTriangle : Leaf;
  return (
    <section className={`reference-empty-state reference-empty-state--${state} reference-tone--${tone}`} role={state === "error" ? "alert" : "status"}>
      <span className="reference-empty-state__orbit" aria-hidden="true"><Icon size={31} /></span>
      <span className="reference-empty-state__code">{code}</span>
      <h2>{title}</h2>
      <p>{body}</p>
      {action ? <div className="reference-empty-state__action">{action}</div> : null}
    </section>
  );
}
