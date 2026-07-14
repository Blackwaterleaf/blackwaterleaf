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
      className="fixed bottom-0 left-0 right-0 z-40 border-t"
      style={{
        background: "oklch(0.09 0.008 200 / 0.92)",
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        borderColor: "oklch(0.22 0.008 200 / 0.6)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-0 h-20 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <button
                className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-all duration-200 flex-1 h-full"
                style={{
                  color: isActive ? "oklch(0.65 0.16 148)" : "oklch(0.50 0.008 200)",
                }}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
