import { trpc } from "@/lib/trpc";
import { Seo } from "@/components/Seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Trophy, Flame, Star, Award, Calendar, Target, Crown, Medal, Sparkles, Lock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const TIER_COLOR: Record<string, string> = {
  bronze:  "#C8A020",
  silver:  "#B0B8C0",
  gold:    "#D4AF37",
  special: "rgba(160,120,240,0.90)",
};

const card = {
  background: "#0D110E",
  border: "1px solid rgba(45,107,63,0.30)",
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
      <Seo
        title="Ranking & Challenges – Community Bestenliste"
        path="/ranking"
        description="Die BlackwaterLeaf Bestenliste: aktivste Mitglieder, XP, Abzeichen und Wochen-Challenges der Aquaristik- und Pflanzen-Community."
      />

      {/* ── Page Header ── */}
      <div
        className="relative rounded-3xl overflow-hidden mb-8 p-6"
        style={{
          background: "linear-gradient(135deg, rgba(45,155,110,0.18) 0%, rgba(212,175,55,0.10) 50%, rgba(7,10,8,0.95) 100%)",
          border: "1px solid rgba(45,107,63,0.35)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Glow-Orb oben rechts */}
        <div
          className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 80% 20%, rgba(212,175,55,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5" style={{ color: "#D4AF37" }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#D4AF37", letterSpacing: "0.16em" }}>Community Ranking</span>
        </div>
        <h1
          className="font-brand leading-none mb-1"
          style={{ fontSize: "clamp(2.2rem, 7vw, 3rem)", color: "#FFFFFF", letterSpacing: "0.04em" }}
        >
          RANKING & ERFOLGE
        </h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
          Sammle XP, halte deinen Streak und steige in der Community auf.
        </p>
      </div>

      {/* ── Not logged in ── */}
      {!isAuthenticated ? (
        <div className="rounded-2xl p-10 text-center" style={card}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(45,155,110,0.10)", border: "1px solid rgba(45,155,110,0.20)" }}
          >
            <Sparkles className="w-7 h-7" style={{ color: "#2D9B6E" }} />
          </div>
          <p className="font-semibold mb-1" style={{ color: "rgba(255,255,255,0.85)" }}>
            Melde dich an, um XP zu sammeln
          </p>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.50)" }}>
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
              background: "linear-gradient(135deg, rgba(45,155,110,0.12), #0D110E)",
              border: "1px solid rgba(45,155,110,0.25)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.50)" }}>
                  Level {level?.level}
                </p>
                <p className="text-xl font-semibold" style={{ color: "#FFFFFF" }}>
                  {level?.title}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-brand" style={{ color: "#34D399", letterSpacing: "0.02em" }}>
                  {xp}
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>XP gesamt</p>
              </div>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(45,107,63,0.30)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, #2D9B6E, #34D399)",
                }}
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              {level?.nextLevelXp
                ? `Noch ${level.nextLevelXp - xp} XP bis "${level.nextTitle}"`
                : "Höchstes Level erreicht – Legende!"}
            </p>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { icon: <Flame className="w-5 h-5" style={{ color: "#D4AF37" }} />, value: me?.stats?.streak ?? 0, label: "Tage-Streak" },
              { icon: <Award className="w-5 h-5" style={{ color: "#D4AF37" }} />, value: me?.badges?.length ?? 0, label: "Abzeichen" },
              { icon: <Star className="w-5 h-5" style={{ color: "#34D399" }} />, value: me?.stats?.points ?? 0, label: "Punkte" },
            ].map(({ icon, value, label }) => (
              <div key={label} className="rounded-2xl p-4 text-center" style={card}>
                <div className="flex justify-center mb-1">{icon}</div>
                <p className="text-xl font-semibold" style={{ color: "#FFFFFF" }}>{value}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* ── Daily check-in ── */}
          <div className="rounded-2xl p-4 mb-4 flex items-center justify-between gap-4" style={card}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(45,155,110,0.12)", border: "1px solid rgba(45,155,110,0.20)" }}
              >
                <Calendar className="w-5 h-5" style={{ color: "#34D399" }} />
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: "rgba(255,255,255,0.88)" }}>Täglicher Check-in</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Hol dir XP und halte deinen Streak am Leben.</p>
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
              <div className="flex items-center gap-2 mb-2" style={{ color: "#34D399" }}>
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-widest">Wochen-Challenge</span>
              </div>
              <p className="font-semibold" style={{ color: "rgba(255,255,255,0.90)" }}>{challenge.title}</p>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.52)" }}>{challenge.description}</p>
              <p className="text-xs mt-2" style={{ color: "#34D399" }}>Belohnung: +{challenge.rewardXp} XP</p>
            </div>
          )}
        </>
      )}

      {/* ── Badge catalog ── */}
      {allBadges && allBadges.length > 0 && (
        <div className="mt-8">
          <h2 className="font-brand text-xl tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.88)", letterSpacing: "0.06em" }}>
            ABZEICHEN
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allBadges.map((b: any) => {
              const earned = earnedCodes.has(b.code);
              const color = earned ? (TIER_COLOR[b.tier] ?? "#34D399") : "rgba(45,107,63,0.40)";
              // Compute rgba bg/border from hex or rgba color
              const getBadgeBg = (c: string) => {
                if (c.startsWith("#")) {
                  // hex → parse and create rgba
                  const r = parseInt(c.slice(1,3),16);
                  const g = parseInt(c.slice(3,5),16);
                  const bv = parseInt(c.slice(5,7),16);
                  return { bg: `rgba(${r},${g},${bv},0.10)`, border: `rgba(${r},${g},${bv},0.28)` };
                }
                // already rgba – just replace alpha
                const base = c.replace(/,[^,)]+\)$/, "");
                return { bg: `${base},0.10)`, border: `${base},0.28)` };
              };
              const { bg: badgeBg, border: badgeBorder } = earned ? getBadgeBg(color) : { bg: "rgba(13,17,14,0.85)", border: "rgba(45,107,63,0.18)" };
              return (
                <div
                  key={b.id}
                  className="rounded-2xl p-4 text-center transition-all duration-200"
                  style={{
                    background: badgeBg,
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: `1px solid ${badgeBorder}`,
                    opacity: earned ? 1 : 0.55,
                    boxShadow: earned ? `0 2px 12px ${badgeBg}` : "none",
                  }}
                >
                  {earned
                    ? <Award className="w-7 h-7 mx-auto mb-1.5" style={{ color }} />
                    : <Lock className="w-7 h-7 mx-auto mb-1.5" style={{ color: "rgba(255,255,255,0.38)" }} />
                  }
                  <p className="text-sm font-medium" style={{ color: earned ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.50)" }}>
                    {b.name}
                  </p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: "rgba(255,255,255,0.45)" }}>
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
        <h2 className="font-brand text-xl tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.88)", letterSpacing: "0.06em" }}>
          BESTENLISTE
        </h2>
        <div className="rounded-2xl overflow-hidden" style={card}>
          {lbLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4" style={{ borderBottom: "1px solid #161C19" }}>
                <Skeleton className="h-6 w-full" />
              </div>
            ))
          ) : leaderboard && leaderboard.length > 0 ? (
            leaderboard.map((entry: any, idx: number) => (
              <div
                key={entry.userId}
                className="flex items-center gap-3 p-3.5 transition-colors"
                style={{
                  borderBottom: idx < leaderboard.length - 1 ? "1px solid #161C19" : "none",
                  background: entry.userId === user?.id ? "rgba(45,155,110,0.06)" : "transparent",
                }}
              >
                <div className="w-6 text-center flex-shrink-0">
                  {idx === 0 ? <Medal className="w-5 h-5 mx-auto" style={{ color: "#D4AF37" }} />
                    : idx === 1 ? <Medal className="w-5 h-5 mx-auto" style={{ color: "#B0B8C0" }} />
                    : idx === 2 ? <Medal className="w-5 h-5 mx-auto" style={{ color: "#C8A020" }} />
                    : <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{idx + 1}</span>}
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={entry.userAvatarUrl ?? undefined} />
                  <AvatarFallback
                    className="text-xs font-semibold"
                    style={{ background: "rgba(45,155,110,0.15)", color: "#34D399" }}
                  >
                    {entry.userName?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "rgba(255,255,255,0.88)" }}>
                    {entry.userName ?? "Mitglied"}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                    Level {entry.level} · {entry.streak}d Streak
                  </p>
                </div>
                <span className="text-sm font-semibold" style={{ color: "#34D399" }}>
                  {entry.xp} XP
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Noch keine Einträge – sei der Erste!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
