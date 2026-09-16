import { useLocation, Link } from "wouter";
import { Home, Compass, Users, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Bottom-Navigation (Mobile)
 * Regelwerk:
 *   - 4 Haupt-Tabs wie im verbindlichen Screenshot: Home, Entdecken, Community, Profil
 *   - Schwebende Glassmorphism-Pille mit geschlossener Kontur
 *   - Aktiver Tab: bereichsspezifisches Neon-Grün (#C7F35B) mit Unterstreichung
 *   - Inaktiv: rgba(255,255,255,0.6)
 *   - Sanfte Übergangsanimation beim Tab-Wechsel
 *   - Zentraler Schnellaktionskreis lebt innerhalb der Home-/Feed-Ansicht
 */

const NAV_ITEMS = [
  { href: "/",         label: "Home",      icon: Home },
  { href: "/discover", label: "Entdecken", icon: Compass },
  { href: "/feed",     label: "Community", icon: Users },
  { href: "/profile",  label: "Profil",    icon: User },
];

export default function BottomNav() {
  const [location] = useLocation();

  // Aktiv-Check: Home nur exakt auf "/"
  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location === href || location.startsWith(href + "/");
  };

  return (
    <nav
      className="fixed z-50"
      style={{
        left: "50%",
        bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        width: "min(620px, calc(100vw - 24px))",
        transform: "translateX(-50%)",
        background: "rgba(2,16,10,0.84)",
        backdropFilter: "blur(24px) saturate(1.6)",
        WebkitBackdropFilter: "blur(24px) saturate(1.6)",
        border: "1px solid rgba(218,246,207,0.20)",
        borderRadius: "25px",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 9px 30px rgba(0,0,0,0.52)",
        padding: "2px 6px",
      }}
    >
      <div
        className="flex items-end justify-around"
        style={{ height: 62, margin: "0 auto", padding: "0 4px" }}
      >
        {NAV_ITEMS.map((item) => (
          <NavTab
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item.href)}
          />
        ))}
      </div>
    </nav>
  );
}

/* ── Einzelner Nav-Tab ── */
function NavTab({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link href={href}>
      <motion.button
        className="relative flex flex-col items-center justify-center gap-0.5 rounded-2xl"
        style={{
          minWidth: 52,
          height: 52,
          color: active ? "#C7F35B" : "rgba(255,255,255,0.60)",
          background: active ? "rgba(199,243,91,0.07)" : "transparent",
          padding: "6px 10px",
        }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.15 }}
      >
        {/* Aktiv-Indikator unten – wie in der Referenznavigation */}
        <AnimatePresence>
          {active && (
            <motion.span
              layoutId="nav-indicator"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: 34,
                height: 3,
                background: "#C7F35B",
                boxShadow: "0 0 10px rgba(199,243,91,0.75)",
              }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        <Icon
          className="w-5 h-5"
          strokeWidth={active ? 2.2 : 1.8}
        />
        <span
          className="text-[10px] font-medium tracking-wide leading-none"
          style={{ color: active ? "#C7F35B" : "rgba(255,255,255,0.6)" }}
        >
          {label}
        </span>
      </motion.button>
    </Link>
  );
}
