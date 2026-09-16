import { useLocation, Link } from "wouter";
import { Home, Compass, Users, User, Bot } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Bottom-Navigation (Mobile)
 * Regelwerk:
 *   - 5 Haupt-Tabs: Home, Entdecken, Community, KI, Profil
 *   - Glassmorphism-Hintergrund (backdrop-blur-xl, bg-black/60, border-t border-white/10)
 *   - Aktiver Tab: Smaragd (#2D9B6E) Icon + Label
 *   - Inaktiv: rgba(255,255,255,0.6)
 *   - Sanfte Übergangsanimation beim Tab-Wechsel
 *   - Zentraler Schnellaktionskreis lebt innerhalb der Home-/Feed-Ansicht
 */

const NAV_ITEMS = [
  { href: "/",         label: "Home",      icon: Home },
  { href: "/discover", label: "Entdecken", icon: Compass },
  { href: "/feed",     label: "Community", icon: Users },
  { href: "/ai",       label: "KI",        icon: Bot },
  { href: "/profile",  label: "Profil",    icon: User },
];

export default function BottomNav() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  // Aktiv-Check: Home nur exakt auf "/"
  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location === href || location.startsWith(href + "/");
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(24px) saturate(1.6)",
        WebkitBackdropFilter: "blur(24px) saturate(1.6)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 -4px 32px rgba(0,0,0,0.4)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div
        className="flex items-end justify-around"
        style={{ height: 64, maxWidth: 480, margin: "0 auto", padding: "0 8px" }}
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
          color: active ? "#2D9B6E" : "rgba(255,255,255,0.6)",
          background: active ? "rgba(45,155,110,0.12)" : "transparent",
          padding: "6px 10px",
        }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.15 }}
      >
        {/* Aktiv-Indikator oben */}
        <AnimatePresence>
          {active && (
            <motion.span
              layoutId="nav-indicator"
              className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: 24,
                height: 3,
                background: "#2D9B6E",
                boxShadow: "0 0 8px rgba(45,155,110,0.7)",
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
          style={{ color: active ? "#2D9B6E" : "rgba(255,255,255,0.6)" }}
        >
          {label}
        </span>
      </motion.button>
    </Link>
  );
}
