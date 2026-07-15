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
      return 'rgba(212,140,55,0.90)'; // A muted gold/orange
    case 'medium':
      return '#D4AF37'; // A warmer gold
    case 'high':
      return '#D4AF37'; // A brighter gold
    case 'very-high':
      return '#D4AF37'; // A very bright, almost white gold
    default:
      return 'rgba(255,255,255,0.50)'; // Default to a neutral color
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
        "bg-[#070A08] border border-[rgba(45,107,63,0.30)]",
        className
      )}
      style={{
        boxShadow: `0 0 8px 0 ${trustColor.replace('rgba(', 'rgba(').replace(')', '').replace(/,([^,]*)$/, ', 0.3)')}`,
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
                background: '#161C19',
                color: 'rgba(45,155,110,0.70)',
                border: '1px solid rgba(45,107,63,0.35)',
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
          background: `#161C19`,
          color: trustColor,
          border: `1px solid ${trustColor}`,
        }}
      >
        Vertrauen: {trustLevel.charAt(0).toUpperCase() + trustLevel.slice(1)}
      </span>
    </div>
  );
};

export default ExpertVerification;
