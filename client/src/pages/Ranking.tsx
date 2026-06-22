import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  Trophy, Flame, Star, Award, Calendar, Target, Crown, Medal, Sparkles, Lock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const TIER_STYLES: Record<string, string> = {
  bronze: "text-amber-600 bg-amber-600/10 border-amber-600/30",
  silver: "text-slate-300 bg-slate-300/10 border-slate-300/30",
  gold: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  special: "text-violet-400 bg-violet-400/10 border-violet-400/30",
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
    <div className="container py-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold flex items-center gap-2 gradient-text-gold">
          <Trophy className="w-6 h-6 text-primary" /> Ranking & Erfolge
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sammle XP, halte deinen Streak und steige in der Community auf.
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
          <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
          <p className="font-medium mb-1">Melde dich an, um XP zu sammeln</p>
          <p className="text-sm text-muted-foreground mb-4">Tägliche Belohnungen, Abzeichen und Community-Level warten auf dich.</p>
          <Button asChild className="press-active"><a href={getLoginUrl()}>Anmelden</a></Button>
        </div>
      ) : meLoading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : (
        <>
          {/* Level + XP card */}
          <div className="bg-gradient-to-br from-primary/15 to-card border border-primary/20 rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Level {level?.level}</p>
                <p className="text-xl font-display font-semibold">{level?.title}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-display font-semibold text-primary">{xp}</p>
                <p className="text-xs text-muted-foreground">XP gesamt</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {level?.nextLevelXp
                  ? `Noch ${level.nextLevelXp - xp} XP bis "${level.nextTitle}"`
                  : "Höchstes Level erreicht – Legende!"}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-card border border-border/50 rounded-xl p-4 text-center">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <p className="text-lg font-semibold">{me?.stats?.streak ?? 0}</p>
              <p className="text-xs text-muted-foreground">Tage-Streak</p>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-4 text-center">
              <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-semibold">{me?.badges?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Abzeichen</p>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-4 text-center">
              <Star className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-semibold">{me?.stats?.points ?? 0}</p>
              <p className="text-xs text-muted-foreground">Punkte</p>
            </div>
          </div>

          {/* Daily check-in */}
          <div className="bg-card border border-border/50 rounded-xl p-5 mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Täglicher Check-in</p>
                <p className="text-xs text-muted-foreground">Hol dir XP und halte deinen Streak am Leben.</p>
              </div>
            </div>
            <Button size="sm" className="press-active flex-shrink-0" disabled={checkIn.isPending} onClick={() => checkIn.mutate()}>
              {checkIn.isPending ? "..." : "Einchecken"}
            </Button>
          </div>

          {/* Active challenge */}
          {challenge && (
            <div className="bg-card border border-border/50 rounded-xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Wochen-Challenge</span>
              </div>
              <p className="font-display font-semibold">{challenge.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
              <p className="text-xs text-primary mt-2">Belohnung: +{challenge.rewardXp} XP</p>
            </div>
          )}
        </>
      )}

      {/* Badge catalog */}
      {allBadges && allBadges.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-display font-semibold mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Abzeichen
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allBadges.map((b: any) => {
              const earned = earnedCodes.has(b.code);
              return (
                <div
                  key={b.id}
                  className={cn(
                    "border rounded-xl p-4 text-center transition-all",
                    earned ? TIER_STYLES[b.tier] ?? "border-border/50" : "border-border/40 opacity-50"
                  )}
                >
                  <div className="relative inline-flex">
                    {earned ? <Award className="w-7 h-7 mx-auto mb-1" /> : <Lock className="w-7 h-7 mx-auto mb-1 text-muted-foreground" />}
                  </div>
                  <p className="text-sm font-medium mt-1">{b.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="mt-6">
        <h2 className="text-lg font-display font-semibold mb-3 flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" /> Bestenliste
        </h2>
        <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40">
          {lbLoading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-6 w-full" /></div>)
          ) : leaderboard && leaderboard.length > 0 ? (
            leaderboard.map((entry: any, idx: number) => (
              <div key={entry.userId} className={cn("flex items-center gap-3 p-3.5", entry.userId === user?.id && "bg-primary/5")}>
                <div className="w-6 text-center flex-shrink-0">
                  {idx === 0 ? <Medal className="w-5 h-5 text-amber-400 mx-auto" />
                    : idx === 1 ? <Medal className="w-5 h-5 text-slate-300 mx-auto" />
                    : idx === 2 ? <Medal className="w-5 h-5 text-amber-600 mx-auto" />
                    : <span className="text-sm text-muted-foreground">{idx + 1}</span>}
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={entry.userAvatarUrl ?? undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {entry.userName?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.userName ?? "Mitglied"}</p>
                  <p className="text-xs text-muted-foreground">Level {entry.level} · {entry.streak}d Streak</p>
                </div>
                <span className="text-sm font-semibold text-primary">{entry.xp} XP</span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">Noch keine Einträge – sei der Erste!</div>
          )}
        </div>
      </div>
    </div>
  );
}
