import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Bell,
  Bot,
  Compass,
  Droplets,
  Home,
  Leaf,
  LogOut,
  User,
  BookOpen,
  Trophy,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/feed",         icon: Home,     label: "Feed" },
  { href: "/plants",       icon: Leaf,     label: "Pflanzen" },
  { href: "/aquariums",    icon: Droplets, label: "Aquarien" },
  { href: "/discover",     icon: Compass,  label: "Entdecken" },
  { href: "/knowledge",    icon: BookOpen, label: "Wissen" },
  { href: "/ranking",      icon: Trophy,   label: "Ranking" },
  { href: "/ai",           icon: Bot,      label: "KI-Assistent" },
];

// Compact set for the mobile bottom navigation (max 5 items).
const MOBILE_NAV_ITEMS = [
  { href: "/feed",      icon: Home,     label: "Feed" },
  { href: "/discover",  icon: Compass,  label: "Entdecken" },
  { href: "/knowledge", icon: BookOpen, label: "Wissen" },
  { href: "/ai",        icon: Bot,      label: "KI" },
];

function NavItem({
  href,
  icon: Icon,
  label,
  badge,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/" && location.startsWith(href));

  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 press-active cursor-pointer group relative",
          isActive
            ? "nav-item-active"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
        )}
      >
        <Icon
          className={cn(
            "w-4.5 h-4.5 flex-shrink-0 transition-colors",
            isActive
              ? "text-primary"
              : "text-muted-foreground group-hover:text-foreground"
          )}
        />
        <span className="truncate">{label}</span>
        {badge && badge > 0 ? (
          <Badge className="ml-auto h-4 min-w-4 px-1 text-xs bg-primary text-primary-foreground">
            {badge > 9 ? "9+" : badge}
          </Badge>
        ) : null}
      </div>
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  const { data: unreadData } = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });
  const unreadCount = unreadData?.count ?? 0;

  return (
    <div className="min-h-screen bg-background flex">
      {/* ─── Sidebar – Desktop ─────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 bottom-0 z-40"
        style={{
          background: "linear-gradient(180deg, oklch(0.09 0.010 240) 0%, oklch(0.07 0.008 240) 100%)",
          borderRight: "1px solid oklch(0.18 0.010 240)",
        }}
      >
        {/* ── Logo / Brand ── */}
        <div className="flex items-center gap-3 px-5 h-16"
          style={{ borderBottom: "1px solid oklch(0.18 0.010 240)" }}
        >
          <div className="relative flex-shrink-0">
            <img
              src="/manus-storage/bl-emblem_76cd28a6.png"
              alt="BL"
              className="w-8 h-8 rounded-xl ring-1 ring-inset"
              style={{ outlineColor: "oklch(0.78 0.12 80 / 0.3)" }}
            />
          </div>
          <div className="min-w-0">
            <span className="font-display font-semibold text-base tracking-tight block leading-tight gradient-text-gold">
              BlackwaterLeaf
            </span>
            <span className="text-[10px] text-muted-foreground tracking-widest uppercase leading-tight">
              Community
            </span>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {/* Main nav group */}
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Navigation
          </p>
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}

          {/* Separator */}
          <div className="my-3 mx-3 h-px" style={{ background: "oklch(0.18 0.010 240)" }} />

          {/* Alerts */}
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Konto
          </p>
          <NavItem href="/notifications" icon={Bell} label="Benachrichtigungen" badge={unreadCount} />
          <NavItem href="/profile" icon={User} label="Mein Profil" />
        </nav>

        {/* ── User Profile Footer ── */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid oklch(0.18 0.010 240)" }}>
          {isAuthenticated ? (
            <div className="space-y-1">
              {/* Profile card */}
              <Link href="/profile">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors cursor-pointer group">
                  <Avatar className="w-8 h-8 flex-shrink-0 ring-1 ring-primary/30">
                    <AvatarImage src={user?.avatarUrl ?? undefined} />
                    <AvatarFallback
                      className="text-xs font-semibold"
                      style={{
                        background: "oklch(0.68 0.16 152 / 0.2)",
                        color: "oklch(0.68 0.16 152)",
                      }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name ?? "Profil"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
                  </div>
                  <Settings className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
              {/* Logout */}
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center px-2">
                Melde dich an, um die Community zu nutzen
              </p>
              <Button asChild size="sm" className="w-full press-active btn-glow">
                <a href={getLoginUrl()}>Anmelden</a>
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main Content ──────────────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header
          className="lg:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-md"
          style={{
            paddingTop: "env(safe-area-inset-top, 0px)",
            background: "oklch(0.08 0.009 240 / 0.95)",
            borderBottom: "1px solid oklch(0.18 0.010 240)",
          }}
        >
          <div className="flex items-center justify-between px-4 h-14">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <img
                src="/manus-storage/bl-emblem_76cd28a6.png"
                alt="BL"
                className="w-7 h-7 rounded-lg"
              />
              <span className="font-display font-semibold text-sm gradient-text-gold">
                BlackwaterLeaf
              </span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              <Link href="/notifications">
                <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors active:scale-95">
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              </Link>
              {isAuthenticated ? (
                <Link href="/profile">
                  <Avatar className="w-8 h-8 cursor-pointer active:scale-95 transition-transform ring-1 ring-primary/30">
                    <AvatarImage src={user?.avatarUrl ?? undefined} />
                    <AvatarFallback
                      className="text-xs font-semibold"
                      style={{
                        background: "oklch(0.68 0.16 152 / 0.2)",
                        color: "oklch(0.68 0.16 152)",
                      }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Button size="sm" asChild className="h-8 text-xs press-active">
                  <a href={getLoginUrl()}>Anmelden</a>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div
          className="flex-1 lg:pt-0 lg:pb-0"
          style={{
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 3.5rem)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 4rem)",
          }}
        >
          <div className="lg:pt-0 lg:pb-0" style={{ paddingTop: 0, paddingBottom: 0 }}>
            {children}
          </div>
        </div>
      </main>

      {/* ─── Mobile Bottom Nav ─────────────────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          background: "oklch(0.08 0.009 240 / 0.97)",
          borderTop: "1px solid oklch(0.18 0.010 240)",
        }}
      >
        <div className="flex items-center justify-around h-16 px-1">
          {[...MOBILE_NAV_ITEMS, { href: "/notifications", icon: Bell, label: "Alerts" }].map(
            (item) => {
              const isActive =
                location === item.href ||
                (item.href !== "/" && location.startsWith(item.href));
              const isBell = item.href === "/notifications";
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex flex-col items-center gap-0.5 min-w-[52px] py-2 rounded-xl transition-all duration-150 cursor-pointer relative select-none",
                      "active:scale-90 active:opacity-70",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {isActive && (
                      <span
                        className="absolute top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                        style={{ background: "oklch(0.68 0.16 152)" }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        "w-5 h-5 transition-transform",
                        isActive && "scale-110"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        isActive ? "text-primary" : "text-muted-foreground/70"
                      )}
                    >
                      {item.label}
                    </span>
                    {isBell && unreadCount > 0 && (
                      <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                </Link>
              );
            }
          )}
        </div>
      </nav>
    </div>
  );
}
