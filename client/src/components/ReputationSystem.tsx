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
      return 'Botanik';
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
        "bg-[#070A08] border border-[rgba(45,107,63,0.30)]",
        className
      )}
    >
      <h2 className="font-brand text-2xl tracking-widest mb-4"
          style={{ color: "#FFFFFF" }}>
        Dein Ruf
      </h2>

      {/* Overall Level and Progress */}
      <div className="mb-6 p-4 rounded-lg"
           style={{
             background: "#111614",
             border: "1px solid rgba(45,107,63,0.30)",
           }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: "#34D399" }}>
            Level {reputation.level}
          </span>
          <span className="text-xs text-muted-foreground"
                style={{ color: "rgba(255,255,255,0.50)" }}>
            {reputation.currentXp} XP / {reputation.currentXp + reputation.xpToNextLevel} XP
          </span>
        </div>
        <div className="w-full bg-[rgba(45,107,63,0.25)] rounded-full h-2">
          <div
            className="h-2 rounded-full"
            style={{
              width: `${progress}%`,
              background: "#34D399", // Gold/Messing Akzent
            }}
          ></div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Nächster Rang: <span className="font-semibold" style={{ color: "#D4AF37" }}>{reputation.rank}</span>
        </p>
      </div>

      {/* Expertise Ranks */}
      {reputation.expertiseRanks.length > 0 && (
        <div className="mb-6">
          <h3 className="font-brand text-xl tracking-widest mb-3"
              style={{ color: "#FFFFFF" }}>
            Fachgebiete
          </h3>
          <div className="space-y-2">
            {reputation.expertiseRanks.map((er) => (
              <div
                key={er.field}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{
                  background: "#111614",
                  border: "1px solid rgba(45,107,63,0.30)",
                }}
              >
                <div className="flex items-center gap-2">
                  {getExpertiseIcon(er.field)}
                  <span className="text-sm font-medium" style={{ color: "#D4AF37" }}>
                    {getExpertiseLabel(er.field)}
                  </span>
                </div>
                <span className="text-sm font-semibold" style={{ color: "#34D399" }}>
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
              style={{ color: "#FFFFFF" }}>
            Abzeichen
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {reputation.badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center text-center p-4 rounded-lg"
                style={{
                  background: "#111614",
                  border: "1px solid rgba(45,107,63,0.30)",
                }}
                title={badge.description}
              >
                <div className="mb-2" style={{ color: "#D4AF37" }}>
                  {badge.icon}
                </div>
                <span className="text-xs font-medium" style={{ color: "#FFFFFF" }}>
                  {badge.name}
                </span>
                <span className="text-xs text-muted-foreground mt-1"
                      style={{ color: "rgba(255,255,255,0.50)" }}>
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
