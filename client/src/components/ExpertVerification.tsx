import React from 'react';
import { CheckCircle, Award, ShieldCheck, Leaf, Droplets, PawPrint } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ExpertVerificationProps {
  isVerified: boolean;
  expertiseFields: ('plant' | 'aquarium' | 'terrarium' | 'community' | 'diagnosis' | 'care')[];
  trustLevel: 'low' | 'medium' | 'high' | 'very-high';
  className?: string;
}

const getTrustLevelColor = (trustLevel: ExpertVerificationProps['trustLevel']) => {
  switch (trustLevel) {
    case 'low':
      return 'oklch(0.7 0.15 30)'; // A muted gold/orange
    case 'medium':
      return 'oklch(0.75 0.18 60)'; // A warmer gold
    case 'high':
      return 'oklch(0.8 0.2 90)'; // A brighter gold
    case 'very-high':
      return 'oklch(0.85 0.22 120)'; // A very bright, almost white gold
    default:
      return 'oklch(0.5 0 0)'; // Default to a neutral color
  }
};

const getExpertiseIcon = (field: ExpertVerificationProps['expertiseFields'][number]) => {
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
      return <ShieldCheck className="w-3 h-3" />;
    case 'care':
      return <CheckCircle className="w-3 h-3" />;
    default:
      return null;
  }
};

const getExpertiseLabel = (field: ExpertVerificationProps['expertiseFields'][number]) => {
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

const ExpertVerification: React.FC<ExpertVerificationProps> = ({
  isVerified,
  expertiseFields,
  trustLevel,
  className,
}) => {
  if (!isVerified) {
    return null; // Only render if the user is verified
  }

  const trustColor = getTrustLevelColor(trustLevel);

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg font-inter text-xs",
        "bg-[oklch(0.10_0.008_200)] border border-[oklch(0.20_0.008_200)]",
        className
      )}
      style={{
        boxShadow: `0 0 8px 0 ${trustColor.replace('oklch(', 'oklch(').replace(')', ' / 0.3)')}`,
      }}
    >
      <ShieldCheck className="w-4 h-4" style={{ color: trustColor }} />
      <span className="font-semibold" style={{ color: trustColor }}>Verifiziert</span>

      {expertiseFields.length > 0 && (
        <div className="flex items-center gap-1 ml-2">
          {expertiseFields.map((field) => (
            <span
              key={field}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                background: 'oklch(0.15 0.008 200)',
                color: 'oklch(0.7 0.05 150)',
                border: '1px solid oklch(0.25 0.008 200)',
              }}
            >
              {getExpertiseIcon(field)}
              {getExpertiseLabel(field)}
            </span>
          ))}
        </div>
      )}

      <span
        className="ml-auto px-2 py-0.5 rounded-full font-bold"
        style={{
          background: `oklch(0.15 0.008 200)`,
          color: trustColor,
          border: `1px solid ${trustColor.replace('oklch(', 'oklch(').replace(')', ' / 0.5)')}`,
        }}
      >
        Vertrauen: {trustLevel.charAt(0).toUpperCase() + trustLevel.slice(1)}
      </span>
    </div>
  );
};

export default ExpertVerification;
