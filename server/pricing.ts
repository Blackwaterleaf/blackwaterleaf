export type VideoQuality = "draft" | "standard" | "high";
export type VideoVoice = "none" | "synthetic" | "premium";
export type StudioPlanId = "free" | "creator" | "studio" | "enterprise";

export const STUDIO_PRICING = {
  currency: "EUR",
  monthly: [
    {
      id: "free", name: "Free", monthlyCents: 0, includedCredits: 50, maxRuntimeSeconds: 60,
      maxProjects: 1, maxActiveRuns: 1, teamMembers: 1,
      features: ["Workspace und Agenten-Queue", "App-Builder-Projektprofil", "Preview mit Freigabe"],
    },
    {
      id: "creator", name: "Creator", monthlyCents: 1490, includedCredits: 700, maxRuntimeSeconds: 300,
      maxProjects: 3, maxActiveRuns: 3, teamMembers: 1,
      features: ["Alles aus Free", "Web-App-Builder mit Code-Workspace", "Evidence-Pack und Audit-Timeline", "Resend-Magic-Link-Login"],
    },
    {
      id: "studio", name: "Studio", monthlyCents: 3990, includedCredits: 2500, maxRuntimeSeconds: 900,
      maxProjects: 10, maxActiveRuns: 8, teamMembers: 3,
      features: ["Alles aus Creator", "Preview und Staging-Gates", "Mobile-Projektprofil", "Team-Freigaben und Push-Benachrichtigungen"],
    },
    {
      id: "enterprise", name: "Enterprise", monthlyCents: 14900, includedCredits: 10000, maxRuntimeSeconds: 1800,
      maxProjects: 50, maxActiveRuns: 20, teamMembers: 10,
      features: ["Alles aus Studio", "IONOS-Deployment-Readiness", "Erweiterte Audit- und Sicherheitskontrollen", "Priorisierte Betriebsgrenzen"],
    },
  ],
  creditEurCents: 2,
  video: {
    baseCreditsPerMinute: { draft: 18, standard: 42, high: 90 } as Record<VideoQuality, number>,
    voiceCreditsPerMinute: { none: 0, synthetic: 8, premium: 24 } as Record<VideoVoice, number>,
    musicCreditsPerMinute: 6,
    renderSetupCredits: 10,
  },
} as const;

export function getPlanLimits(plan: StudioPlanId) {
  const configured = STUDIO_PRICING.monthly.find(item => item.id === plan) ?? STUDIO_PRICING.monthly[0];
  return { maxProjects: configured.maxProjects, maxActiveRuns: configured.maxActiveRuns, maxRuntimeSeconds: configured.maxRuntimeSeconds, includedCredits: configured.includedCredits };
}

export function estimateVideoCost(input: { durationSeconds: number; quality: VideoQuality; voice: VideoVoice; music: boolean; clips?: number }) {
  const duration = Math.max(1, Math.min(1800, Math.round(input.durationSeconds)));
  const minutes = duration / 60;
  const clips = Math.max(1, Math.min(30, Math.round(input.clips ?? 1)));
  const credits = Math.ceil(
    STUDIO_PRICING.video.renderSetupCredits +
      minutes * (STUDIO_PRICING.video.baseCreditsPerMinute[input.quality] + STUDIO_PRICING.video.voiceCreditsPerMinute[input.voice] + (input.music ? STUDIO_PRICING.video.musicCreditsPerMinute : 0)) * clips,
  );
  return {
    credits,
    estimatedEurCents: credits * STUDIO_PRICING.creditEurCents,
    durationSeconds: duration,
    clips,
    assumptions: ["Richtwert, kein Kauf", "Provider- und Renderingpreise können abweichen", "Finale Kosten erst nach Provider-Quote"],
  } as const;
}
