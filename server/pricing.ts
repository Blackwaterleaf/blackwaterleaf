export type VideoQuality = "draft" | "standard" | "high";
export type VideoVoice = "none" | "synthetic" | "premium";

export const STUDIO_PRICING = {
  currency: "EUR",
  monthly: [
    { id: "free", name: "Free", monthlyCents: 0, includedCredits: 20, maxRuntimeSeconds: 60 },
    { id: "creator", name: "Creator", monthlyCents: 1900, includedCredits: 500, maxRuntimeSeconds: 300 },
    { id: "studio", name: "Studio", monthlyCents: 4900, includedCredits: 2000, maxRuntimeSeconds: 900 },
    { id: "enterprise", name: "Enterprise", monthlyCents: 14900, includedCredits: 10000, maxRuntimeSeconds: 1800 },
  ],
  creditEurCents: 2,
  video: {
    baseCreditsPerMinute: { draft: 18, standard: 42, high: 90 } as Record<VideoQuality, number>,
    voiceCreditsPerMinute: { none: 0, synthetic: 8, premium: 24 } as Record<VideoVoice, number>,
    musicCreditsPerMinute: 6,
    renderSetupCredits: 10,
  },
} as const;

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
