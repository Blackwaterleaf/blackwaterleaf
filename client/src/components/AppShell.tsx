import { Bell, Compass, Home, Leaf, Search, ShoppingBag, UserRound, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { resolveAccountLocale, useI18n } from "@/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, type PropsWithChildren } from "react";
import { ConnectionStateBanner } from "./ConnectionStateBanner";

const navigation = [
  { href: "/", label: "tabs.home" as const, icon: Home },
  { href: "/explore", label: "tabs.explore" as const, icon: Compass },
  { href: "/marketplace", label: "tabs.marketplace" as const, icon: ShoppingBag },
  { href: "/community", label: "tabs.community" as const, icon: UsersRound },
  { href: "/profile", label: "tabs.profile" as const, icon: UserRound },
];

function isReferenceNavigationActive(location: string, href: string) {
  if (href === "/") {
    const topLevel = location.split("/")[1] ?? "";
    return location === "/" || location.startsWith("/world/") || location === "/assistant" || location.startsWith("/flow/live") || location.startsWith("/flow/foto") || !["explore", "marketplace", "community", "profile"].includes(topLevel);
  }
  if (href === "/explore") return location.startsWith("/explore") || location.startsWith("/knowledge");
  if (href === "/marketplace") return location.startsWith("/marketplace");
  if (href === "/community") return location.startsWith("/community") || location.startsWith("/flow/beitrag");
  return location.startsWith(href);
}

export function AppShell({ children }: PropsWithChildren) {
  const [location] = useLocation();
  const auth = useAuth();
  const { locale, setLocale, t } = useI18n();
  const utils = trpc.useUtils();
  const profile = trpc.profile.me.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const experience = trpc.gamification.summary.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const dailyCheckIn = trpc.gamification.dailyCheckIn.useMutation({
    onSuccess: () => void utils.gamification.summary.invalidate(),
  });

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
    <div className="app-frame">
      <div className="ambient-grid" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <header className="top-shell">
        <Link href="/" className="brand-lockup" aria-label="BlackWaterLeaf Home">
          <span className="brand-mark"><Leaf size={21} strokeWidth={1.8} /></span>
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
          <Link href="/community" className="icon-button notification-button" aria-label={t("tabs.community")}><Bell size={18} /></Link>
          <details className="profile-quick-menu">
            <summary className="icon-button profile-button" aria-label={t("tabs.profile")}><UserRound size={18} /></summary>
            <div className="profile-quick-menu__panel">
              <p className="profile-quick-menu__eyebrow">PROFIL · SCHNELLWAHL</p>
              <Link href="/profile" className="profile-quick-menu__item">Profil öffnen</Link>
              <Link href="/profile#profile-edit" className="profile-quick-menu__item">Name &amp; Profil bearbeiten</Link>
              <Link href="/profile#profile-avatar" className="profile-quick-menu__item">Profilbild bearbeiten</Link>
              <Link href="/world/botany" className="profile-quick-menu__item">01 · Botanik</Link>
              <Link href="/world/aquarium" className="profile-quick-menu__item">02 · Aquaristik</Link>
              <Link href="/world/terrarium" className="profile-quick-menu__item">03 · Terraristik</Link>
              <Link href="/profile#profile-tools" className="profile-quick-menu__item">Weitere Werkzeuge</Link>
              {profile.data?.role === "admin" ? <Link href="/admin" className="profile-quick-menu__item profile-quick-menu__item--admin">Admin-Dashboard</Link> : null}
            </div>
          </details>
        </div>
      </header>
      <ConnectionStateBanner />
      <main className="app-content">{children}</main>
      <nav className="bottom-navigation" aria-label="Hauptnavigation">
        {navigation.map(item => {
          const Icon = item.icon;
          const active = isReferenceNavigationActive(location, item.href);
          return (
            <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`}>
              <Icon size={19} strokeWidth={active ? 2.2 : 1.6} />
              <span>{t(item.label)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
