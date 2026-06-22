import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Trophy, Flame, Star, Award, Calendar, Target, Crown, Medal, Sparkles, Lock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const TIER_COLOR: Record<string, string> = {
  bronze:  "oklch(0.65 0.14 55)",
  silver:  "oklch(0.75 0.02 220)",
  gold:    "oklch(0.78 0.14 78)",
  special: "oklch(0.72 0.18 290)",
};

const card = {
  background: "oklch(0.12 0.008 200)",
  border: "1px solid oklch(0.20 0.008 200)",
};

export default function Ranking() {
  const { isAuthenticated, user } = useAuth();
  const utils = trpc.useUtils();
  const { data: me, isLoading: meLoading } = trpc.gamification.me.useQuery(undefined, { enabled: isAuthenticated });
  const { data: allBadges } = trpc.gamification.allBadges.useQuery();
  const { data: leaderboard, isLoading: lbLoading } = trpc.gamification.leaderboard.useQuery({ limit: 10 });
  const { data: challenge } = trpc.gamification.activeChallenge.useQuery();

  const checkIn = trpc.gamification.checkIn.useMutation({
    onSuccess: (res) => {
      if (res.alreadyToday) {
        toast.info("Du hast dich heute bereits eingecheckt.");
      } else {
        toast.success(`Eingecheckt! +${res.xpAwarded} XP · Streak: ${res.streak} Tage`);
      }
      utils.gamification.me.invalidate();
      utils.gamification.leaderboard.invalidate();
    },
    onError: () => toast.error("Check-in fehlgeschlagen."),
  });

  const xp = me?.stats?.xp ?? 0;
  const level = me?.level;
  const progressPct = level?.nextLevelXp
    ? Math.min(100, Math.round(((xp - level.minXp) / (level.nextLevelXp - level.minXp)) * 100))
    : 100;
  const earnedCodes = new Set((me?.badges ?? []).map((b: any) => b.code));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 lg:pb-8">

      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1
          className="font-brand text-4xl leading-none mb-1"
          style={{ color: "oklch(0.95 0.005 200)", letterSpacing: "0.04em" }}
        >
          RANKING & ERFOLGE
        </h1>
        <p className="text-sm" style={{ color: "oklch(0.50 0.008 200)" }}>
          Sammle XP, halte deinen Streak und steige in der Community auf.
        </p>
      </div>

      {/* ── Not logged in ── */}
      {!isAuthenticated ? (
        <div className="rounded-2xl p-10 text-center" style={card}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "oklch(0.52 0.14 148 / 0.10)", border: "1px solid oklch(0.52 0.14 148 / 0.20)" }}
          >
            <Sparkles className="w-7 h-7" style={{ color: "oklch(0.55 0.14 148)" }} />
          </div>
          <p className="font-semibold mb-1" style={{ color: "oklch(0.85 0.005 200)" }}>
            Melde dich an, um XP zu sammeln
          </p>
          <p className="text-sm mb-5" style={{ color: "oklch(0.50 0.008 200)" }}>
            Tägliche Belohnungen, Abzeichen und Community-Level warten auf dich.
          </p>
          <a href={getLoginUrl()} className="btn-primary">Anmelden</a>
        </div>

      ) : meLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />

      ) : (
        <>
          {/* ── Level + XP card ── */}
          <div
            className="rounded-2xl p-5 mb-4"
            style={{
              background: "linear-gradient(135deg, oklch(0.52 0.14 148 / 0.12), oklch(0.12 0.008 200))",
              border: "1px solid oklch(0.52 0.14 148 / 0.25)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "oklch(0.50 0.008 200)" }}>
                  Level {level?.level}
                </p>
                <p className="text-xl font-semibold" style={{ color: "oklch(0.92 0.005 200)" }}>
                  {level?.title}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-brand" style={{ color: "oklch(0.65 0.16 148)", letterSpacing: "0.02em" }}>
                  {xp}
                </p>
                <p className="text-xs" style={{ color: "oklch(0.50 0.008 200)" }}>XP gesamt</p>
              </div>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "oklch(0.20 0.008 200)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, oklch(0.52 0.14 148), oklch(0.65 0.16 148))",
                }}
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: "oklch(0.45 0.008 200)" }}>
              {level?.nextLevelXp
                ? `Noch ${level.nextLevelXp - xp} XP bis "${level.nextTitle}"`
                : "Höchstes Level erreicht – Legende!"}
            </p>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { icon: <Flame className="w-5 h-5" style={{ color: "oklch(0.72 0.18 50)" }} />, value: me?.stats?.streak ?? 0, label: "Tage-Streak" },
              { icon: <Award className="w-5 h-5" style={{ color: "oklch(0.78 0.14 78)" }} />, value: me?.badges?.length ?? 0, label: "Abzeichen" },
              { icon: <Star className="w-5 h-5" style={{ color: "oklch(0.65 0.16 148)" }} />, value: me?.stats?.points ?? 0, label: "Punkte" },
            ].map(({ icon, value, label }) => (
              <div key={label} className="rounded-2xl p-4 text-center" style={card}>
                <div className="flex justify-center mb-1">{icon}</div>
                <p className="text-xl font-semibold" style={{ color: "oklch(0.92 0.005 200)" }}>{value}</p>
                <p className="text-xs" style={{ color: "oklch(0.48 0.008 200)" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* ── Daily check-in ── */}
          <div className="rounded-2xl p-4 mb-4 flex items-center justify-between gap-4" style={card}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(0.52 0.14 148 / 0.12)", border: "1px solid oklch(0.52 0.14 148 / 0.20)" }}
              >
                <Calendar className="w-5 h-5" style={{ color: "oklch(0.65 0.16 148)" }} />
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: "oklch(0.88 0.005 200)" }}>Täglicher Check-in</p>
                <p className="text-xs" style={{ color: "oklch(0.48 0.008 200)" }}>Hol dir XP und halte deinen Streak am Leben.</p>
              </div>
            </div>
            <button
              className="btn-primary text-sm py-2 px-4 flex-shrink-0"
              disabled={checkIn.isPending}
              onClick={() => checkIn.mutate()}
            >
              {checkIn.isPending ? "..." : "Einchecken"}
            </button>
          </div>

          {/* ── Active challenge ── */}
          {challenge && (
            <div className="rounded-2xl p-5 mb-4" style={card}>
              <div className="flex items-center gap-2 mb-2" style={{ color: "oklch(0.65 0.16 148)" }}>
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-widest">Wochen-Challenge</span>
              </div>
              <p className="font-semibold" style={{ color: "oklch(0.90 0.005 200)" }}>{challenge.title}</p>
              <p className="text-sm mt-1" style={{ color: "oklch(0.52 0.008 200)" }}>{challenge.description}</p>
              <p className="text-xs mt-2" style={{ color: "oklch(0.65 0.16 148)" }}>Belohnung: +{challenge.rewardXp} XP</p>
            </div>
          )}
        </>
      )}

      {/* ── Badge catalog ── */}
      {allBadges && allBadges.length > 0 && (
        <div className="mt-8">
          <h2 className="font-brand text-xl tracking-widest mb-4" style={{ color: "oklch(0.88 0.005 200)", letterSpacing: "0.06em" }}>
            ABZEICHEN
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allBadges.map((b: any) => {
              const earned = earnedCodes.has(b.code);
              const color = earned ? (TIER_COLOR[b.tier] ?? "oklch(0.65 0.16 148)") : "oklch(0.35 0.008 200)";
              return (
                <div
                  key={b.id}
                  className="rounded-2xl p-4 text-center transition-all duration-200"
                  style={{
                    background: earned ? `${color.replace(")", " / 0.08)")}` : "oklch(0.12 0.008 200)",
                    border: `1px solid ${earned ? color.replace(")", " / 0.25)") : "oklch(0.18 0.008 200)"}`,
                    opacity: earned ? 1 : 0.5,
                  }}
                >
                  {earned
                    ? <Award className="w-7 h-7 mx-auto mb-1.5" style={{ color }} />
                    : <Lock className="w-7 h-7 mx-auto mb-1.5" style={{ color: "oklch(0.38 0.008 200)" }} />
                  }
                  <p className="text-sm font-medium" style={{ color: earned ? "oklch(0.88 0.005 200)" : "oklch(0.50 0.008 200)" }}>
                    {b.name}
                  </p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: "oklch(0.45 0.008 200)" }}>
                    {b.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Leaderboard ── */}
      <div className="mt-8">
        <h2 className="font-brand text-xl tracking-widest mb-4" style={{ color: "oklch(0.88 0.005 200)", letterSpacing: "0.06em" }}>
          BESTENLISTE
        </h2>
        <div className="rounded-2xl overflow-hidden" style={card}>
          {lbLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4" style={{ borderBottom: "1px solid oklch(0.18 0.008 200)" }}>
                <Skeleton className="h-6 w-full" />
              </div>
            ))
          ) : leaderboard && leaderboard.length > 0 ? (
            leaderboard.map((entry: any, idx: number) => (
              <div
                key={entry.userId}
                className="flex items-center gap-3 p-3.5 transition-colors"
                style={{
                  borderBottom: idx < leaderboard.length - 1 ? "1px solid oklch(0.18 0.008 200)" : "none",
                  background: entry.userId === user?.id ? "oklch(0.52 0.14 148 / 0.06)" : "transparent",
                }}
              >
                <div className="w-6 text-center flex-shrink-0">
                  {idx === 0 ? <Medal className="w-5 h-5 mx-auto" style={{ color: "oklch(0.78 0.14 78)" }} />
                    : idx === 1 ? <Medal className="w-5 h-5 mx-auto" style={{ color: "oklch(0.75 0.02 220)" }} />
                    : idx === 2 ? <Medal className="w-5 h-5 mx-auto" style={{ color: "oklch(0.65 0.14 55)" }} />
                    : <span className="text-sm" style={{ color: "oklch(0.45 0.008 200)" }}>{idx + 1}</span>}
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={entry.userAvatarUrl ?? undefined} />
                  <AvatarFallback
                    className="text-xs font-semibold"
                    style={{ background: "oklch(0.52 0.14 148 / 0.15)", color: "oklch(0.65 0.16 148)" }}
                  >
                    {entry.userName?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "oklch(0.88 0.005 200)" }}>
                    {entry.userName ?? "Mitglied"}
                  </p>
                  <p className="text-xs" style={{ color: "oklch(0.45 0.008 200)" }}>
                    Level {entry.level} · {entry.streak}d Streak
                  </p>
                </div>
                <span className="text-sm font-semibold" style={{ color: "oklch(0.65 0.16 148)" }}>
                  {entry.xp} XP
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm" style={{ color: "oklch(0.45 0.008 200)" }}>
              Noch keine Einträge – sei der Erste!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
