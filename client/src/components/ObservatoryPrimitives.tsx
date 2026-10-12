import { AlertTriangle, ChevronRight, CircleAlert, Leaf, type LucideIcon } from "lucide-react";
import { Link } from "wouter";
import { useState, type ReactNode } from "react";

export type ObservatoryTone = "botany" | "aquarium" | "terrarium" | "ai" | "marketplace";

export type ObservatoryAction = {
  title: string;
  note: string;
  icon: LucideIcon;
  image?: string;
  href?: string;
  targetId?: string;
  onActivate?: () => void;
  unavailable?: boolean;
};

type ContextHeaderProps = {
  tone: ObservatoryTone;
  image?: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  children?: ReactNode;
};

export function ObservatoryContextHeader({ tone, image, eyebrow, title, subtitle, icon: Icon = Leaf, badge, children }: ContextHeaderProps) {
  return (
    <section className={`observatory-context-header observatory-context-header--${tone}`} aria-label={title}>
      {image ? <div className="observatory-context-header__image" style={{ backgroundImage: `url(${image})` }} aria-hidden="true" /> : null}
      <div className="observatory-context-header__copy">
        <span className="observatory-context-header__icon"><Icon size={18} /></span>
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      {badge ? <span className="observatory-context-header__badge">{badge}</span> : null}
      {children ? <div className="observatory-context-header__actions">{children}</div> : null}
    </section>
  );
}

export function ObservatoryActionCluster({ tone, actions, heading = "KONTEXTAKTIONEN", activeTitle, inlinePanel }: { tone: ObservatoryTone; actions: ObservatoryAction[]; heading?: string; activeTitle?: string; inlinePanel?: ReactNode }) {
  const [unavailableMessage, setUnavailableMessage] = useState<string | null>(null);
  const activate = (action: ObservatoryAction) => {
    if (action.unavailable) {
      setUnavailableMessage(`${action.title} ist in diesem Stand nicht verfügbar.`);
      return;
    }
    action.onActivate?.();
    if (action.targetId) requestAnimationFrame(() => document.getElementById(action.targetId!)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <section className={`observatory-action-cluster observatory-action-cluster--${tone}`} aria-label={heading}>
      <div className="observatory-action-cluster__heading"><span>{heading}</span><i aria-hidden="true" /></div>
      <div className="observatory-action-cluster__grid">
        {actions.map(action => {
          const Icon = action.icon;
          const content = <><span className="observatory-action-cluster__icon"><Icon size={17} /></span><span className="observatory-action-cluster__copy"><strong>{action.title}</strong><small>{action.note}</small></span>{action.unavailable ? <span className="observatory-action-cluster__availability">NICHT VERFÜGBAR</span> : <ChevronRight className="observatory-action-cluster__chevron" size={17} aria-hidden="true" />}</>;
          const imageStyle = action.image ? { backgroundImage: `linear-gradient(90deg, rgba(2, 17, 8, .94), rgba(2, 17, 8, .62)), url("${action.image}")` } : undefined;
          if (action.href && !action.unavailable) return <Link key={action.title} href={action.href} className="observatory-action-row" style={imageStyle}>{content}</Link>;
          return <button key={action.title} type="button" className={`observatory-action-row ${activeTitle === action.title ? "is-active" : ""}`} style={imageStyle} aria-pressed={activeTitle === action.title} aria-disabled={action.unavailable || undefined} onClick={() => activate(action)}>{content}</button>;
        })}
      </div>
      {inlinePanel ? <div className="observatory-action-cluster__inline" role="region" aria-label="Werkzeugauswahl">{inlinePanel}</div> : null}
      {unavailableMessage ? <div className="observatory-action-cluster__message" role="status"><CircleAlert size={16} /><span>{unavailableMessage}</span><button type="button" onClick={() => setUnavailableMessage(null)} aria-label="Hinweis schließen">×</button></div> : null}
    </section>
  );
}

export function ObservatoryStateSurface({ tone, code, title, body, state = "empty", action }: { tone: ObservatoryTone; code: string; title: string; body: string; state?: "empty" | "error"; action?: ReactNode }) {
  const Icon = state === "error" ? AlertTriangle : Leaf;
  return (
    <section className={`observatory-state-surface observatory-state-surface--${tone} observatory-state-surface--${state}`} role={state === "error" ? "alert" : "status"}>
      <span className="observatory-state-surface__icon"><Icon size={23} /></span>
      <div><span className="eyebrow">{code}</span><h2>{title}</h2><p>{body}</p>{action ? <div className="observatory-state-surface__action">{action}</div> : null}</div>
    </section>
  );
}

export function ObservatoryRoutePage({ tone = "botany", className = "", children }: { tone?: ObservatoryTone; className?: string; children: ReactNode }) {
  return <div className={`observatory-route observatory-route--${tone} ${className}`.trim()}>{children}</div>;
}
