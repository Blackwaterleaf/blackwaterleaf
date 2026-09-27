import { Bell, Camera, Compass, Mail, Map, Menu, Search, ShoppingBag, UserRound, BookOpen, UsersRound, MessageSquareHeart, Heart, Settings, Sprout } from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_LOCALES, resolveAccountLocale, useI18n, type AppLocale } from "@/i18n";
import { SEO_LOCALES, getSeoMeta } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, useRef, useState, type MouseEvent, type PropsWithChildren } from "react";
import { ConnectionStateBanner } from "./ConnectionStateBanner";
import { AnalyticsTracker } from "./AnalyticsTracker";
import { getBlackWaterLeafSeason } from "@/lib/season";
import { formatDayPhaseTime, getDayPhaseState, parseDayPhaseTime, type DayPhaseState } from "@shared/day-phase";

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
  if (href === "/flow/foto") return location.startsWith("/flow/") || location === "/assistant";
  if (href === "/search") return location.startsWith("/search") || location.startsWith("/catalog") || location.startsWith("/knowledge") || location.startsWith("/plant/") || location.startsWith("/aquarium-fish/");
  if (href === "/profile") return location.startsWith("/profile") || location.startsWith("/saved") || location.startsWith("/ranking") || location.startsWith("/today") || location.startsWith("/notifications") || location.startsWith("/messages");
  return location.startsWith(href);
}

export function AppShell({ children }: PropsWithChildren) {
  const [location, setLocation] = useLocation();
  const season = getBlackWaterLeafSeason();
  const [dayPhase, setDayPhase] = useState<DayPhaseState>(() => {
    const simulated = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("bwlTime") : null;
    return getDayPhaseState(simulated ? parseDayPhaseTime(simulated) ?? new Date() : new Date());
  });
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const tabTransitionTimer = useRef<number | null>(null);
  const routeToneClass = location.startsWith("/marketplace") ? "route-marketplace" : location.startsWith("/world/aquarium") ? "route-aquarium" : location.startsWith("/world/terrarium") ? "route-terrarium" : location === "/assistant" ? "route-ai" : "route-botany";

  useEffect(() => {
    const refreshDayPhase = () => {
      const simulated = new URLSearchParams(window.location.search).get("bwlTime");
      setDayPhase(getDayPhaseState(simulated ? parseDayPhaseTime(simulated) ?? new Date() : new Date()));
    };
    refreshDayPhase();
    const timer = window.setInterval(refreshDayPhase, 60_000);
    return () => window.clearInterval(timer);
  }, []);

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
    if (window.localStorage.getItem("blackwaterleaf.locale.manual.v1") !== "1") return;
    const accountLocale = resolveAccountLocale(locale, profile.data.locale);
    if (accountLocale !== locale) setLocale(accountLocale);
  }, [locale, profile.data?.locale, setLocale]);

  useEffect(() => {
    if (!auth.isAuthenticated || experience.data?.status !== "ready" || dailyCheckIn.isPending || dailyCheckIn.isSuccess) return;
    dailyCheckIn.mutate();
  }, [auth.isAuthenticated, dailyCheckIn, experience.data?.status]);

  useEffect(() => {
    const pathname = location.split("?")[0] || "/";
    const noIndex = (location === "/search" || pathname === "/search") || pathname === "/saved" || (location.startsWith("/member/") || pathname.startsWith("/member/")) || pathname.startsWith("/community") || (location.startsWith("/profile") || pathname.startsWith("/profile")) || pathname.startsWith("/today") || pathname.startsWith("/notifications") || pathname.startsWith("/messages") || pathname.startsWith("/flow/") || pathname.startsWith("/admin");
    const meta = getSeoMeta(pathname, locale);
    const setMeta = (selector: string, attribute: "name" | "property", value: string) => {
      let element = document.querySelector<HTMLMetaElement>(selector);
      if (!element) { element = document.createElement("meta"); element.setAttribute(attribute, selector.match(/^[^=]+="([^"]+)"/)?.[1] ?? ""); document.head.appendChild(element); }
      element.content = value;
    };
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement("meta"); robots.setAttribute("name", "robots"); document.head.appendChild(robots); }
    robots.setAttribute("content", noIndex ? "noindex, nofollow, noarchive" : "index, follow");
    document.title = meta.title;
    document.documentElement.lang = locale;
    setMeta('meta[name="description"]', "name", meta.description);
    setMeta('meta[name="keywords"]', "name", meta.keywords);
    setMeta('meta[property="og:title"]', "property", meta.title);
    setMeta('meta[property="og:description"]', "property", meta.description);
    setMeta('meta[property="og:type"]', "property", "website");
    setMeta('meta[name="twitter:title"]', "name", meta.title);
    setMeta('meta[name="twitter:description"]', "name", meta.description);
    const localizedUrl = (targetLocale: AppLocale) => {
      const url = new URL(pathname, window.location.origin);
      if (targetLocale !== "de" || window.location.search.includes("lang=")) url.searchParams.set("lang", targetLocale);
      return url.href;
    };
    const canonicalUrl = localizedUrl(locale);
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;
    document.querySelectorAll('link[data-seo-alternate="true"]').forEach(link => link.remove());
    if (!noIndex) {
      for (const targetLocale of SEO_LOCALES) {
        const alternate = document.createElement("link");
        alternate.rel = "alternate";
        alternate.hreflang = targetLocale;
        alternate.href = localizedUrl(targetLocale);
        alternate.dataset.seoAlternate = "true";
        document.head.appendChild(alternate);
      }
      const fallback = document.createElement("link");
      fallback.rel = "alternate";
      fallback.hreflang = "x-default";
      fallback.href = new URL(pathname, window.location.origin).href;
      fallback.dataset.seoAlternate = "true";
      document.head.appendChild(fallback);
    }
  }, [locale, location]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) setProfileMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [profileMenuOpen]);

  return (
    <div className={`app-frame season-${season} day-phase-${dayPhase.phase} ${routeToneClass} ${isTabSwitching ? "is-tab-switching" : ""}`} data-season={season} data-day-phase={dayPhase.phase} data-local-time={formatDayPhaseTime(dayPhase)}>
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
          <Link href="/feedback" className="icon-button feedback-header-button" aria-label="Feedback, Probleme und Wünsche" title="Feedback, Probleme und Wünsche"><MessageSquareHeart size={18} /></Link>
          <Link href="/support" className="icon-button support-header-button" aria-label="BlackWaterLeaf unterstützen" title="Naturprojekt unterstützen"><Heart size={18} /></Link>
          <label className="language-header-control" title="Sprache auswählen">
            <span className="sr-only">Sprache auswählen</span>
            <select value={locale} onChange={event => setLocale(event.target.value as AppLocale)} aria-label="Sprache auswählen">
              {APP_LOCALES.map(option => <option key={option.value} value={option.value}>{option.nativeLabel}</option>)}
            </select>
          </label>
          <div className="profile-header-menu" ref={profileMenuRef}>
            <button type="button" className="icon-button profile-button" aria-label="Profilmenü öffnen" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen(open => !open)}><Menu size={20} /></button>
            {profileMenuOpen ? <div className="profile-header-menu__panel" role="menu" aria-label="Profilmenü">
              <span className="profile-header-menu__eyebrow">PROFIL · MENÜ</span>
              <Link href="/profile" onClick={() => setProfileMenuOpen(false)}><UserRound size={19} /><span><strong>Profil öffnen</strong><small>Dein Konto und deine Inhalte</small></span></Link>
              <Link className="profile-header-menu__settings-link" href="/profile/manage" onClick={() => setProfileMenuOpen(false)}><Settings size={19} /><span><strong>Verwalten · alle Einstellungen</strong><small>Datenschutz, Sprache und Werkzeuge</small></span></Link>
              <Link href="/messages" onClick={() => setProfileMenuOpen(false)}><Mail size={19} /><span><strong>Postfach</strong><small>Nachrichten und Antworten</small></span></Link>
              <Link href="/marketplace" onClick={() => setProfileMenuOpen(false)}><ShoppingBag size={19} /><span><strong>Marketplace</strong><small>Partner und Naturprodukte</small></span></Link>
              <Link href="/today" onClick={() => setProfileMenuOpen(false)}><Sprout size={19} /><span><strong>Heute · Pflegeaufgaben</strong><small>Deine aktuellen Aufgaben</small></span></Link>
            </div> : null}
          </div>
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
        <div className="portal-sidebar__status"><i /><span><strong>Verbindung</strong><small>Aktueller Status wird pro Bereich angezeigt.</small><small className="portal-sidebar__time" aria-label={`Lokale Tageszeit: ${dayPhase.label}, ${formatDayPhaseTime(dayPhase)}`}>{dayPhase.shortLabel} · {formatDayPhaseTime(dayPhase)}</small></span></div>
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
