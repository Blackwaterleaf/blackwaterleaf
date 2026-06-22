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
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/plants", icon: Leaf, label: "Pflanzen" },
  { href: "/aquariums", icon: Droplets, label: "Aquarien" },
  { href: "/discover", icon: Compass, label: "Entdecken" },
  { href: "/knowledge", icon: BookOpen, label: "Wissen" },
  { href: "/ranking", icon: Trophy, label: "Ranking" },
  { href: "/ai", icon: Bot, label: "KI" },
];

// Compact set for the mobile bottom navigation (max 5 items + alerts).
const MOBILE_NAV_ITEMS = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/discover", icon: Compass, label: "Entdecken" },
  { href: "/knowledge", icon: BookOpen, label: "Wissen" },
  { href: "/ai", icon: Bot, label: "KI" },
];

function NavItem({ href, icon: Icon, label, badge }: { href: string; icon: React.ElementType; label: string; badge?: number }) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/" && location.startsWith(href));

  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 press-active cursor-pointer group",
          isActive
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}
      >
        <Icon className={cn("w-4.5 h-4.5 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
        <span className="truncate">{label}</span>
        {badge && badge > 0 ? (
          <Badge className="ml-auto h-4 min-w-4 px-1 text-xs bg-primary text-primary-foreground">{badge > 9 ? "9+" : badge}</Badge>
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
      {/* Sidebar – Desktop */}
      <aside className="hidden lg:flex flex-col w-60 fixed left-0 top-0 bottom-0 border-r border-border/30 bg-background/95 backdrop-blur-sm z-40">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border/30">
          <img src="/manus-storage/bl-emblem_76cd28a6.png" alt="BL" className="w-7 h-7 rounded-lg" />
          <span className="font-display font-semibold text-base tracking-tight">BlackwaterLeaf</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
          <NavItem href="/notifications" icon={Bell} label="Benachrichtigungen" badge={unreadCount} />
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-border/30">
          {isAuthenticated ? (
            <div className="space-y-1">
              <Link href="/profile">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors cursor-pointer group">
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarImage src={user?.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name ?? "Profil"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
                  </div>
                  <User className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </div>
          ) : (
            <Button asChild size="sm" className="w-full press-active">
              <a href={getLoginUrl()}>Anmelden</a>
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 min-h-screen flex flex-col">
        {/* Mobile Header – with safe area top */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-border/30 bg-background/95 backdrop-blur-sm"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-display font-semibold text-sm">BlackwaterLeaf</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/notifications">
                <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors active:scale-95">
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              </Link>
              {isAuthenticated ? (
                <Link href="/profile">
                  <Avatar className="w-8 h-8 cursor-pointer active:scale-95 transition-transform">
                    <AvatarImage src={user?.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
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

        {/* Page Content – with safe area top offset + bottom nav space */}
        <div
          className="flex-1 lg:pt-0 lg:pb-0"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 3.5rem)',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4rem)',
          }}
        >
          <div className="lg:pt-0 lg:pb-0" style={{ paddingTop: 0, paddingBottom: 0 }}>
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav – with safe area bottom */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/30 bg-background/97 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around h-16 px-1">
          {[...MOBILE_NAV_ITEMS, { href: "/notifications", icon: Bell, label: "Alerts" }].map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const isBell = item.href === "/notifications";
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center gap-0.5 min-w-[52px] py-2 rounded-xl transition-all duration-150 cursor-pointer relative select-none",
                  "active:scale-90 active:opacity-70",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {isActive && (
                    <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary" />
                  )}
                  <item.icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                  <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground/70")}>{item.label}</span>
                  {isBell && unreadCount > 0 && (
                    <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
