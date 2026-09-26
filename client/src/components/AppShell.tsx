import { Bell, Camera, Compass, Mail, Map, Menu, Search, ShoppingBag, UserRound, BookOpen, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { resolveAccountLocale, useI18n } from "@/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, useRef, useState, type MouseEvent, type PropsWithChildren } from "react";
import { ConnectionStateBanner } from "./ConnectionStateBanner";
import { AnalyticsTracker } from "./AnalyticsTracker";
import { getBlackWaterLeafSeason } from "@/lib/season";

const portalNavigation = [
  { href: "/explore", label: "Entdecken", icon: Compass },
  { href: "/explore#map", label: "Karte", icon: Map },
  { href: "/flow/foto", label: "Erfassen", icon: Camera },
  { href: "/search", label: "Katalog", icon: BookOpen },
  { href: "/community", label: "Community", icon: UsersRound },
  { href: "/profile", label: "Profil", icon: UserRound },
] as const;

function isPortalNavigationActive(location: string, hash: string, href: string) {
  if (href === "/explore#map") return location === "/explore" && hash === "#map";
  if (href === "/explore") return location === "/" || (location === "/explore" && hash !== "#map") || location.startsWith("/botanik") || location.startsWith("/aquaristik") || location.startsWith("/terraristik") || location.startsWith("/member/");
  if (href === "/community") return location.startsWith("/community");
  if (href === "/flow/foto") return location.startsWith("/flow/") || location === "/assistant" || location === "/habitat-builder";
  if (href === "/search") return location.startsWith("/search") || location.startsWith("/catalog") || location.startsWith("/knowledge") || location.startsWith("/plant/") || location.startsWith("/aquarium-fish/");
  if (href === "/profile") return location.startsWith("/profile") || location.startsWith("/saved") || location.startsWith("/ranking") || location.startsWith("/today") || location.startsWith("/notifications") || location.startsWith("/messages");
  return location.startsWith(href);
}

export function AppShell({ children }: PropsWithChildren) {
  const [location, setLocation] = useLocation();
  const season = getBlackWaterLeafSeason();
  const auth = useAuth();
  const { locale, setLocale } = useI18n();
  const utils = trpc.useUtils();
  const profile = trpc.profile.me.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const experience = trpc.gamification.summary.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const unreadNotifications = trpc.notifications.unreadCount.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const unreadMessages = trpc.messages.unreadCount.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const dailyCheckIn = trpc.gamification.dailyCheckIn.useMutation({
    onSuccess: () => void utils.gamification.summary.invalidate(),
  });
  const bottomNavigation = portalNavigation;
  const [hash, setHash] = useState(() => typeof window === "undefined" ? "" : window.location.hash);
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

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", syncHash);
    syncHash();
    return () => window.removeEventListener("hashchange", syncHash);
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

  useEffect(() => {
    const noIndex = location === "/search" || location === "/saved" || location.startsWith("/member/") || location.startsWith("/community") || location.startsWith("/profile") || location.startsWith("/today") || location.startsWith("/notifications") || location.startsWith("/messages") || location.startsWith("/flow/") || location.startsWith("/admin");
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement("meta"); robots.setAttribute("name", "robots"); document.head.appendChild(robots); }
    robots.setAttribute("content", noIndex ? "noindex, nofollow, noarchive" : "index, follow");
    const canonicalPath = location.split("?")[0] || "/";
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    canonical.setAttribute("href", `${window.location.origin}${canonicalPath}`);
    return () => { robots?.setAttribute("content", "index, follow"); };
  }, [location]);

  return (
    <div className={`app-frame season-${season} ${routeToneClass} ${isTabSwitching ? "is-tab-switching" : ""}`} data-season={season}>
      <header className="top-shell">
        <Link href="/" className="brand-lockup" aria-label="BlackWaterLeaf Home">
          <span className="brand-mark"><img src="/manus-storage/blackwaterleaf-original-mark-1024_28dcd697.png" alt="BlackWaterLeaf Logo" /></span>
          <span className="brand-copy"><span className="brand-name">BLACKWATERLEAF</span><small>B: WATER OBSERVATORY PORTAL</small></span>
        </Link>
        <Link href="/search" className="portal-search-trigger" aria-label="Globale Suche öffnen"><Search size={17} /><span>Arten, Orte, Beobachtungen, Tags suchen …</span><kbd>⌘ K</kbd></Link>
        <div className="top-actions">
          <Link href="/search" className="icon-button" aria-label="Suche öffnen"><Search size={18} /></Link>
          <Link href="/marketplace" className="icon-button marketplace-header-button" aria-label="Marktplatz"><ShoppingBag size={18} /></Link>
          <Link href="/notifications" className="icon-button notification-button" aria-label="Benachrichtigungen">
            <Bell size={18} />
            {auth.isAuthenticated && unreadNotifications.data?.count ? <span className="notification-badge" aria-label={`${unreadNotifications.data.count} ungelesene Benachrichtigungen`}>{unreadNotifications.data.count > 9 ? "9+" : unreadNotifications.data.count}</span> : null}
          </Link>
          <Link href="/messages" className="icon-button messages-header-button" aria-label="Postfach">
            <Mail size={18} />
            {auth.isAuthenticated && unreadMessages.data?.count ? <span className="notification-badge" aria-label={`${unreadMessages.data.count} ungelesene Nachrichten`}>{unreadMessages.data.count > 9 ? "9+" : unreadMessages.data.count}</span> : null}
          </Link>
          <details className="profile-header-menu">
            <summary className="icon-button profile-button" aria-label="Profilmenü öffnen"><Menu size={20} /></summary>
            <div className="profile-header-menu__panel">
              <span className="profile-header-menu__eyebrow">PROFIL · EINSTELLUNGEN</span>
              <Link href="/profile">Profil öffnen</Link>
              <span className="profile-header-menu__group-label">PFLEGE & ANLAGEN</span>
              <Link href="/today">Heute · Pflegeaufgaben</Link>
              <Link href="/profile/habitats">Meine Anlagen</Link>
              <span className="profile-header-menu__group-label">KOMMUNIKATION</span>
              <Link href="/messages">Postfach</Link>
              <Link href="/notifications">Benachrichtigungen</Link>
              <span className="profile-header-menu__group-label">FORTSCHRITT & MERKLISTE</span>
              <Link href="/profile/progress">Punkte & Fortschritt</Link>
              <Link href="/saved">Gespeichert</Link>
              <Link className="profile-header-menu__hub-link" href="/profile/manage">Einstellungen & Datenschutz</Link>
              {/* Superseded contract: className="profile-header-menu__settings-group" / Einstellungen / Profil & Privatbereich. The Management Hub now owns these destinations: href="/profile/private", href="/profile/habitats", href="/profile/progress", href="/profile/privacy", href="/profile/preferences", href="/profile/tools". */}
            </div>
          </details>
        </div>
      </header>
      <aside className="portal-sidebar" aria-label="Portalnavigation">
        <div className="portal-sidebar__nav">
          {portalNavigation.map(item => {
            const Icon = item.icon;
            const active = isPortalNavigationActive(location, hash, item.href);
            return <Link key={item.href} href={item.href} className={active ? "active" : ""}><Icon size={19} /><span>{item.label}</span></Link>;
          })}
        </div>
        <div className="portal-sidebar__status"><i /><span><strong>Verbindung</strong><small>Aktueller Status wird pro Bereich angezeigt.</small></span></div>
      </aside>
      <ConnectionStateBanner />
      <AnalyticsTracker />
      <main className={`app-content portal-route-content tab-transition-surface ${contentEntered ? "is-entered" : "is-entering"}`} aria-busy={isTabSwitching}>{children}</main>
      <nav className="bottom-navigation" aria-label="Hauptnavigation">
          {bottomNavigation.map(item => {
            const Icon = item.icon;
            const active = isPortalNavigationActive(location, hash, item.href);
            return (
            <Link key={item.href} href={item.href} onClick={event => handleTabNavigation(event, item.href)} className={`nav-link ${active ? "active" : ""} ${pendingTab === item.href ? "is-transition-target" : ""}`}>
              <Icon size={19} strokeWidth={active ? 2.2 : 1.6} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
