import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

export type WorldTone = "botany" | "aquarium" | "terrarium" | "assistant";

type WorldCardProps = {
  number: string;
  title: string;
  subtitle: string;
  tone: WorldTone;
  imageUrl: string;
  imageAlt: string;
  href: string;
};

export function WorldCard({ number, title, subtitle, tone, imageUrl, imageAlt, href }: WorldCardProps) {
  return (
    <Link href={href} className={`world-card world-${tone}`} aria-label={`${title}: ${subtitle}`}>
      <img className="world-image" src={imageUrl} alt={imageAlt} />
      <span className="world-noise" aria-hidden="true" />
      <span className="world-glow" aria-hidden="true" />
      <span className="world-number">[{number}]</span>
      <span className="world-copy">
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>
      <span className="world-arrow"><ArrowUpRight size={15} /></span>
    </Link>
  );
}
