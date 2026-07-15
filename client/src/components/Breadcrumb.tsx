/**
 * BlackWaterLeaf – Breadcrumb Navigation Component
 * Premium-Stil: dunkle Oberflächen, grüne Akzente, elegante Rundungen.
 *
 * Verwendung:
 * <Breadcrumb items={[
 *   { label: "Wissensdatenbank", href: "/knowledge" },
 *   { label: "Aquaristik", href: "/knowledge/category/aquaristik" },
 *   { label: "Schwarzwasser-Biotope", href: "/knowledge/category/schwarzwasser" },
 *   { label: "Channa-Haltung im Schwarzwasser" }
 * ]} />
 */

import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  /** Label des Breadcrumb-Elements */
  label: string;
  /** Optionale URL für klickbare Links. Wenn nicht vorhanden, wird das Element als inaktiv behandelt. */
  href?: string;
}

export interface BreadcrumbProps {
  /** Array von Breadcrumb-Elementen */
  items: BreadcrumbItem[];
  /** Optionale CSS-Klasse für zusätzliche Anpassungen */
  className?: string;
}

/**
 * Breadcrumb Navigation Component
 * Zeigt eine hierarchische Navigation mit Separatoren an.
 * Das letzte Element wird als aktuelle Seite angezeigt (nicht klickbar).
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      className={`flex items-center gap-1 text-sm mb-6 ${className}`}
      aria-label="Breadcrumb Navigation"
    >
      <ol className="flex items-center gap-1 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = item.href && !isLast;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {isClickable ? (
                <Link
                  href={item.href!}
                  className="px-2 py-1.5 rounded-md transition-all duration-150"
                  style={{
                    color: 'oklch(0.65 0.16 148)',
                    backgroundColor: 'oklch(0.52 0.14 148 / 0.08)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      'oklch(0.52 0.14 148 / 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      'oklch(0.52 0.14 148 / 0.08)';
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="px-2 py-1.5 rounded-md"
                  style={{
                    color: isLast
                      ? 'oklch(0.88 0.005 200)'
                      : 'oklch(0.48 0.008 200)',
                  }}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight
                  className="w-4 h-4"
                  style={{ color: 'oklch(0.42 0.008 200)' }}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
