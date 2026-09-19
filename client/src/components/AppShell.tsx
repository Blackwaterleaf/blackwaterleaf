import { Bell, Compass, Home, Menu, Ruler, Search, ShoppingBag, UserRound, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { resolveAccountLocale, useI18n } from "@/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, useRef, useState, type MouseEvent, type PropsWithChildren } from "react";
import { ConnectionStateBanner } from "./ConnectionStateBanner";
import { AnalyticsTracker } from "./AnalyticsTracker";
import { getBlackWaterLeafSeason } from "@/lib/season";

const navigation = [
  { href: "/", label: "tabs.home" as const, icon: Home },
  { href: "/explore", label: "tabs.explore" as const, icon: Compass },
  { href: "/marketplace", label: "tabs.marketplace" as const, icon: ShoppingBag },
  { href: "/community", label: "tabs.community" as const, icon: UsersRound },
  { href: "/profile", label: "tabs.profile" as const, icon: UserRound },
];

const adminBuilderNavigation = { href: "/habitat-builder", label: "tabs.builder" as const, icon: Ruler };

function isReferenceNavigationActive(location: string, href: string) {
  if (href === "/") {
    const topLevel = location.split("/")[1] ?? "";
    return location === "/" || location.startsWith("/world/") || location === "/assistant" || location.startsWith("/flow/live") || location.startsWith("/flow/foto") || !["explore", "marketplace", "community", "profile", "habitat-builder"].includes(topLevel);
  }
  if (href === "/explore") return location.startsWith("/explore") || location.startsWith("/knowledge");
  if (href === "/marketplace") return location.startsWith("/marketplace");
  if (href === "/community") return location.startsWith("/community") || location.startsWith("/flow/beitrag");
  return location.startsWith(href);
}

export function AppShell({ children }: PropsWithChildren) {
  const [location, setLocation] = useLocation();
  const season = getBlackWaterLeafSeason();
  const auth = useAuth();
  const { locale, setLocale, t } = useI18n();
  const utils = trpc.useUtils();
  const profile = trpc.profile.me.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const experience = trpc.gamification.summary.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const unreadNotifications = trpc.notifications.unreadCount.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const dailyCheckIn = trpc.gamification.dailyCheckIn.useMutation({
    onSuccess: () => void utils.gamification.summary.invalidate(),
  });
  const bottomNavigation = auth.user?.role === "admin" ? [...navigation, adminBuilderNavigation] : navigation;
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const [contentEntered, setContentEntered] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const tabTransitionTimer = useRef<number | null>(null);
  const routeToneClass = location.startsWith("/marketplace") ? "route-marketplace" : location.startsWith("/world/aquarium") ? "route-aquarium" : location.startsWith("/world/terrarium") ? "route-terrarium" : location === "/assistant" ? "route-ai" : "route-botany";

  useEffect(() => {
    setIsTabSwitching(false);
    setPendingTab(null);
    setContentEntered(false);
    const frame = window.requestAnimationFrame(() => setContentEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, [location]);

  useEffect(() => () => {
    if (tabTransitionTimer.current !== null) window.clearTimeout(tabTransitionTimer.current);
  }, []);

  const handleTabNavigation = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === location || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLocation(href);
      return;
    }
    if (tabTransitionTimer.current !== null) window.clearTimeout(tabTransitionTimer.current);
    setPendingTab(href);
    setContentEntered(false);
    setIsTabSwitching(true);
    tabTransitionTimer.current = window.setTimeout(() => {
      setLocation(href);
      tabTransitionTimer.current = null;
    }, 105);
  };

  useEffect(() => {
    if (!profile.data?.locale) return;
    const accountLocale = resolveAccountLocale(locale, profile.data.locale);
    if (accountLocale !== locale) setLocale(accountLocale);
  }, [locale, profile.data?.locale, setLocale]);

  useEffect(() => {
    if (!auth.isAuthenticated || experience.data?.status !== "ready" || dailyCheckIn.isPending || dailyCheckIn.isSuccess) return;
    dailyCheckIn.mutate();
  }, [auth.isAuthenticated, dailyCheckIn, experience.data?.status]);

  return (
    <div className={`app-frame season-${season} ${routeToneClass} ${isTabSwitching ? "is-tab-switching" : ""}`} data-season={season}>
      <div className="ambient-grid" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <header className="top-shell">
        <Link href="/" className="brand-lockup" aria-label="BlackWaterLeaf Home">
          <span className="brand-mark"><img src="/manus-storage/blackwaterleaf-original-mark-1024_28dcd697.png" alt="" /></span>
          <span className="brand-name">BLACKWATERLEAF</span>
        </Link>
        <nav className="desktop-navigation" aria-label="Hauptnavigation">
          {navigation.map(item => {
            const active = isReferenceNavigationActive(location, item.href);
            return <Link key={item.href} href={item.href} className={active ? "active" : ""}>{t(item.label)}</Link>;
          })}
        </nav>
        <div className="top-actions">
          <Link href="/explore" className="icon-button" aria-label={t("tabs.explore")}><Search size={18} /></Link>
          <Link href="/marketplace" className="icon-button marketplace-header-button" aria-label="Marktplatz"><ShoppingBag size={18} /></Link>
          <Link href="/notifications" className="icon-button notification-button" aria-label="Benachrichtigungen">
            <Bell size={18} />
            {auth.isAuthenticated && unreadNotifications.data?.count ? <span className="notification-badge" aria-label={`${unreadNotifications.data.count} ungelesene Benachrichtigungen`}>{unreadNotifications.data.count > 9 ? "9+" : unreadNotifications.data.count}</span> : null}
          </Link>
          <details className="profile-header-menu">
            <summary className="icon-button profile-button" aria-label="Profilmenü öffnen"><Menu size={20} /></summary>
            <div className="profile-header-menu__panel">
              <span className="profile-header-menu__eyebrow">PROFIL · EINSTELLUNGEN</span>
              <Link href="/profile">Profil öffnen</Link>
              <Link href="/today">Heute · Pflegeaufgaben</Link>
              <Link href="/profile/private">Privatbereich & Profil bearbeiten</Link>
              <Link href="/profile/habitats">Meine Anlagen</Link>
              <Link href="/profile/progress">Punkte & Fortschritt</Link>
              <Link href="/profile/privacy">Datenschutz & Freigaben</Link>
              <Link href="/profile/preferences">Sprache & Einheiten</Link>
              <Link href="/profile/tools">Weitere Werkzeuge</Link>
            </div>
          </details>
        </div>
      </header>
      <ConnectionStateBanner />
      <AnalyticsTracker />
      <main className={`app-content tab-transition-surface ${contentEntered ? "is-entered" : "is-entering"}`} aria-busy={isTabSwitching}>{children}</main>
      <nav className={`bottom-navigation ${auth.user?.role === "admin" ? "bottom-navigation--admin" : ""}`} aria-label="Hauptnavigation">
        {bottomNavigation.map(item => {
          const Icon = item.icon;
          const active = isReferenceNavigationActive(location, item.href);
          return (
            <Link key={item.href} href={item.href} onClick={event => handleTabNavigation(event, item.href)} className={`nav-link ${active ? "active" : ""} ${pendingTab === item.href ? "is-transition-target" : ""}`}>
              <Icon size={19} strokeWidth={active ? 2.2 : 1.6} />
              <span>{t(item.label)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
