import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User,
  Settings,
  Leaf,
  Waves,
  BookOpen,
  Users,
  Bot,
  Trophy,
  Compass,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const IMG_LOGO = "/manus-storage/logo-circle_c176197b.png";

const NAV_ITEMS = [
  { href: "/discover", label: "Entdecken" },
  { href: "/plants",   label: "Pflanzen" },
  { href: "/knowledge", label: "Wissen" },
  { href: "/feed",     label: "Community" },
  { href: "/ai",       label: "KI Assistent" },
];

const MOBILE_NAV = [
  { href: "/feed",      label: "Feed",        icon: Compass },
  { href: "/plants",    label: "Pflanzen",    icon: Leaf },
  { href: "/aquariums", label: "Aquarien",    icon: Waves },
  { href: "/discover",  label: "Entdecken",   icon: Compass },
  { href: "/knowledge", label: "Wissen",      icon: BookOpen },
  { href: "/ranking",   label: "Ranking",     icon: Trophy },
  { href: "/ai",        label: "KI-Assistent",icon: Bot },
  { href: "/profile",   label: "Mein Profil", icon: User },
];

function TopNav() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "oklch(0.09 0.008 200 / 0.92)",
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        borderBottom: "1px solid oklch(0.22 0.008 200 / 0.6)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-8">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
          <img
            src={IMG_LOGO}
            alt="BlackwaterLeaf"
            className="w-9 h-9 rounded-full transition-transform duration-200 group-hover:scale-105"
            style={{ filter: "drop-shadow(0 0 8px oklch(0.52 0.14 148 / 0.4))" }}
          />
          <div className="hidden sm:block">
            <span
              className="font-brand text-base tracking-widest leading-none block"
              style={{ color: "oklch(0.95 0.005 200)" }}
            >
              BLACKWATER<span style={{ color: "oklch(0.52 0.14 148)" }}>LEAF</span>
            </span>
            <span
              className="text-[9px] tracking-[0.2em] uppercase block leading-none mt-0.5"
              style={{ color: "oklch(0.45 0.008 200)" }}
            >
              Community
            </span>
          </div>
        </Link>

        {/* ── Center Nav ── */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer block"
                  style={{
                    color: isActive ? "oklch(0.65 0.16 148)" : "oklch(0.70 0.008 200)",
                    background: isActive ? "oklch(0.52 0.14 148 / 0.12)" : "transparent",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "oklch(0.90 0.005 200)";
                      (e.currentTarget as HTMLElement).style.background = "oklch(0.16 0.008 200)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "oklch(0.70 0.008 200)";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ── Right Side ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search */}
          <Link href="/discover">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-lg"
              style={{ color: "oklch(0.60 0.008 200)" }}
            >
              <Search className="w-4 h-4" />
            </Button>
          </Link>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Link href="/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 rounded-lg"
                  style={{ color: "oklch(0.60 0.008 200)" }}
                >
                  <Bell className="w-4 h-4" />
                </Button>
              </Link>

              {/* Avatar dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none">
                    <Avatar className="w-8 h-8 ring-2 ring-primary/30">
                      <AvatarImage src={user?.avatarUrl ?? undefined} />
                      <AvatarFallback
                        className="text-xs font-semibold"
                        style={{ background: "oklch(0.52 0.14 148 / 0.2)", color: "oklch(0.65 0.16 148)" }}
                      >
                        {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium max-w-[100px] truncate" style={{ color: "oklch(0.85 0.005 200)" }}>
                      {user?.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 rounded-xl"
                  style={{
                    background: "oklch(0.13 0.008 200)",
                    border: "1px solid oklch(0.22 0.008 200)",
                  }}
                >
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Mein Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="w-4 h-4" />
                      Einstellungen
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator style={{ background: "oklch(0.22 0.008 200)" }} />
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => logoutMutation.mutate()}
                  >
                    <LogOut className="w-4 h-4" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <a
              href={getLoginUrl()}
              className="btn-primary text-sm px-5 py-2"
            >
              Anmelden
            </a>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden w-9 h-9 rounded-lg"
                style={{ color: "oklch(0.60 0.008 200)" }}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 p-0"
              style={{
                background: "oklch(0.10 0.008 200)",
                border: "none",
                borderLeft: "1px solid oklch(0.22 0.008 200)",
              }}
            >
              <MobileMenu user={user} isAuthenticated={isAuthenticated} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ user, isAuthenticated }: { user: any; isAuthenticated: boolean }) {
  const [location] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid oklch(0.18 0.008 200)" }}>
        <img src={IMG_LOGO} alt="BL" className="w-8 h-8 rounded-full" />
        <div>
          <span className="font-brand text-sm tracking-widest block" style={{ color: "oklch(0.95 0.005 200)" }}>
            BLACKWATER<span style={{ color: "oklch(0.52 0.14 148)" }}>LEAF</span>
          </span>
          <span className="text-[9px] tracking-widest uppercase" style={{ color: "oklch(0.40 0.008 200)" }}>
            Nature in Flow
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  background: isActive ? "oklch(0.52 0.14 148 / 0.12)" : "transparent",
                  color: isActive ? "oklch(0.65 0.16 148)" : "oklch(0.65 0.008 200)",
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid oklch(0.18 0.008 200)" }}>
        {isAuthenticated ? (
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: "oklch(0.14 0.008 200)" }}>
              <Avatar className="w-8 h-8 ring-1 ring-primary/30">
                <AvatarImage src={user?.avatarUrl ?? undefined} />
                <AvatarFallback className="text-xs" style={{ background: "oklch(0.52 0.14 148 / 0.2)", color: "oklch(0.65 0.16 148)" }}>
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name ?? "Profil"}</p>
                <p className="text-xs truncate" style={{ color: "oklch(0.45 0.008 200)" }}>{user?.email ?? ""}</p>
              </div>
            </div>
            <button
              onClick={() => logoutMutation.mutate()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-200 hover:bg-white/5"
              style={{ color: "oklch(0.55 0.008 200)" }}
            >
              <LogOut className="w-4 h-4" />
              Abmelden
            </button>
          </div>
        ) : (
          <a href={getLoginUrl()} className="btn-primary w-full justify-center">
            Anmelden
          </a>
        )}
      </div>
    </div>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
  /** For full-height pages (e.g. AI chat) that manage their own bottom spacing.
   *  Disables the global mobile bottom padding to avoid double spacing. */
  fullHeight?: boolean;
}

export default function AppLayout({ children, fullHeight = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen" style={{ background: "oklch(0.09 0.008 200)" }}>
      <TopNav />
      {/* Content below fixed nav. On mobile, reserve space for the fixed bottom nav so content is never hidden. */}
      <main className={fullHeight ? "pt-16" : "pt-16 bl-main-pad"}>
        {children}
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}

function MobileBottomNav() {
  const [location] = useLocation();
  const BOTTOM = [
    { href: "/feed",     label: "Feed",     icon: Compass },
    { href: "/plants",   label: "Pflanzen", icon: Leaf },
    { href: "/ai",       label: "KI",       icon: Bot },
    { href: "/knowledge",label: "Wissen",   icon: BookOpen },
    { href: "/profile",  label: "Profil",   icon: User },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2"
      style={{
        background: "oklch(0.10 0.008 200 / 0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid oklch(0.20 0.008 200)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        height: "calc(56px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {BOTTOM.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href || location.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href}>
            <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer min-w-[52px]">
              <Icon
                className="w-5 h-5 transition-colors duration-200"
                style={{ color: isActive ? "oklch(0.65 0.16 148)" : "oklch(0.50 0.008 200)" }}
              />
              <span
                className="text-[10px] font-medium transition-colors duration-200"
                style={{ color: isActive ? "oklch(0.65 0.16 148)" : "oklch(0.45 0.008 200)" }}
              >
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
