import { Bot, Compass, Home, Leaf, Search, UserRound, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { resolveAccountLocale, useI18n } from "@/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, type PropsWithChildren } from "react";
import { ConnectionStateBanner } from "./ConnectionStateBanner";

const navigation = [
  { href: "/", label: "tabs.home" as const, icon: Home },
  { href: "/explore", label: "tabs.explore" as const, icon: Compass },
  { href: "/community", label: "tabs.community" as const, icon: UsersRound },
  { href: "/assistant", label: "tabs.assistant" as const, icon: Bot },
  { href: "/profile", label: "tabs.profile" as const, icon: UserRound },
];

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
          {experience.data?.status === "ready" ? <span className="system-chip">LVL_{experience.data.level}</span> : null}
          <span className="system-chip">SYS_01</span>
        </Link>
        <div className="top-actions">
          <Link href="/explore" className="icon-button" aria-label={t("tabs.explore")}><Search size={18} /></Link>
          <Link href="/profile" className="icon-button profile-button" aria-label={t("tabs.profile")}><UserRound size={18} /></Link>
        </div>
      </header>
      <ConnectionStateBanner />
      <main className="app-content">{children}</main>
      <nav className="bottom-navigation" aria-label="Hauptnavigation">
        {navigation.map(item => {
          const Icon = item.icon;
          const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
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
