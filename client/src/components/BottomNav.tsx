import { useLocation } from "wouter";
import { Link } from "wouter";
import { Leaf, BookOpen, Store, Sparkles, Users, User } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const NAV_ITEMS = [
  { href: "/discover", label: "Entdecken", icon: Leaf },
  { href: "/knowledge", label: "Wissen", icon: BookOpen },
  { href: "/marketplace", label: "Markt", icon: Store },
  { href: "/ai", label: "KI", icon: Sparkles },
  { href: "/feed", label: "Community", icon: Users },
  { href: "/profile", label: "Profil", icon: User },
];

export default function BottomNav() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: "rgba(7,10,8,0.95)",
        backdropFilter: "blur(24px) saturate(1.6)",
        WebkitBackdropFilter: "blur(24px) saturate(1.6)",
        borderTop: "1px solid rgba(45,107,63,0.28)",
        boxShadow: "0 -1px 0 rgba(212,175,55,0.06), 0 -4px 20px rgba(0,0,0,0.30)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-0 h-20 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <button
                className="relative flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 active:scale-95"
                style={{
                  color: isActive ? "#34D399" : "rgba(255,255,255,0.45)",
                  background: isActive ? "rgba(45,155,110,0.10)" : "transparent",
                  minWidth: 52,
                }}
              >
                {/* Aktiver Indikator oben */}
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                    style={{ background: "#34D399", boxShadow: "0 0 8px rgba(52,211,153,0.60)" }}
                  />
                )}
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
