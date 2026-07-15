import React from 'react';
import { Award, Star, TrendingUp, Zap, Leaf, Droplets, PawPrint } from 'lucide-react';
import { cn } from "@/lib/utils";

// Define types for reputation data
export interface UserReputation {
  currentXp: number;
  level: number;
  xpToNextLevel: number;
  rank: string;
  expertiseRanks: ExpertiseRank[];
  badges: Badge[];
}

export interface ExpertiseRank {
  field: 'plant' | 'aquarium' | 'terrarium' | 'community' | 'diagnosis' | 'care';
  rankName: string;
  score: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  earnedAt: Date;
}

interface ReputationSystemProps {
  reputation: UserReputation;
  className?: string;
}

const getExpertiseIcon = (field: ExpertiseRank['field']) => {
  switch (field) {
    case 'plant':
      return <Leaf className="w-3 h-3" />;
    case 'aquarium':
      return <Droplets className="w-3 h-3" />;
    case 'terrarium':
      return <PawPrint className="w-3 h-3" />;
    case 'community':
      return <Award className="w-3 h-3" />;
    case 'diagnosis':
      return <Zap className="w-3 h-3" />;
    case 'care':
      return <Star className="w-3 h-3" />;
    default:
      return null;
  }
};

const getExpertiseLabel = (field: ExpertiseRank['field']) => {
  switch (field) {
    case 'plant':
      return 'Pflanzen';
    case 'aquarium':
      return 'Aquaristik';
    case 'terrarium':
      return 'Terraristik';
    case 'community':
      return 'Community';
    case 'diagnosis':
      return 'Diagnose';
    case 'care':
      return 'Pflege';
    default:
      return '';
  }
};

const ReputationSystem: React.FC<ReputationSystemProps> = ({
  reputation,
  className,
}) => {
  const progress = (reputation.currentXp / (reputation.currentXp + reputation.xpToNextLevel)) * 100;

  return (
    <div
      className={cn(
        "p-6 rounded-xl font-inter",
        "bg-[oklch(0.10_0.008_200)] border border-[oklch(0.20_0.008_200)]",
        className
      )}
    >
      <h2 className="font-brand text-2xl tracking-widest mb-4"
          style={{ color: "oklch(0.92 0.005 200)" }}>
        Dein Ruf
      </h2>

      {/* Overall Level and Progress */}
      <div className="mb-6 p-4 rounded-lg"
           style={{
             background: "oklch(0.13 0.010 240)",
             border: "1px solid oklch(0.22 0.010 240)",
           }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: "oklch(0.65 0.16 148)" }}>
            Level {reputation.level}
          </span>
          <span className="text-xs text-muted-foreground"
                style={{ color: "oklch(0.50 0.008 200)" }}>
            {reputation.currentXp} XP / {reputation.currentXp + reputation.xpToNextLevel} XP
          </span>
        </div>
        <div className="w-full bg-[oklch(0.25_0.008_200)] rounded-full h-2">
          <div
            className="h-2 rounded-full"
            style={{
              width: `${progress}%`,
              background: "oklch(0.65 0.16 148)", // Gold/Messing Akzent
            }}
          ></div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Nächster Rang: <span className="font-semibold" style={{ color: "oklch(0.75 0.18 60)" }}>{reputation.rank}</span>
        </p>
      </div>

      {/* Expertise Ranks */}
      {reputation.expertiseRanks.length > 0 && (
        <div className="mb-6">
          <h3 className="font-brand text-xl tracking-widest mb-3"
              style={{ color: "oklch(0.92 0.005 200)" }}>
            Fachgebiete
          </h3>
          <div className="space-y-2">
            {reputation.expertiseRanks.map((er) => (
              <div
                key={er.field}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{
                  background: "oklch(0.13 0.010 240)",
                  border: "1px solid oklch(0.22 0.010 240)",
                }}
              >
                <div className="flex items-center gap-2">
                  {getExpertiseIcon(er.field)}
                  <span className="text-sm font-medium" style={{ color: "oklch(0.75 0.18 60)" }}>
                    {getExpertiseLabel(er.field)}
                  </span>
                </div>
                <span className="text-sm font-semibold" style={{ color: "oklch(0.65 0.16 148)" }}>
                  {er.rankName} ({er.score} Punkte)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges Overview */}
      {reputation.badges.length > 0 && (
        <div>
          <h3 className="font-brand text-xl tracking-widest mb-3"
              style={{ color: "oklch(0.92 0.005 200)" }}>
            Abzeichen
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {reputation.badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center text-center p-4 rounded-lg"
                style={{
                  background: "oklch(0.13 0.010 240)",
                  border: "1px solid oklch(0.22 0.010 240)",
                }}
                title={badge.description}
              >
                <div className="mb-2" style={{ color: "oklch(0.75 0.18 60)" }}>
                  {badge.icon}
                </div>
                <span className="text-xs font-medium" style={{ color: "oklch(0.92 0.005 200)" }}>
                  {badge.name}
                </span>
                <span className="text-xs text-muted-foreground mt-1"
                      style={{ color: "oklch(0.50 0.008 200)" }}>
                  {badge.earnedAt.toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReputationSystem;
