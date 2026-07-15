import type { User } from "../drizzle/schema";

export type UserRole = "free" | "pro" | "enterprise" | "admin";

export interface FeatureFlags {
  aiOrchestrator: boolean;
  expertVerification: boolean;
  advancedReputationSystem: boolean;
  premiumSupport: boolean;
  adFreeExperience: boolean;
  highResolutionMedia: boolean;
  communityAnalytics: boolean;
  aBTestVariantA: boolean;
}

const defaultFeatureFlags: FeatureFlags = {
  aiOrchestrator: false,
  expertVerification: false,
  advancedReputationSystem: false,
  premiumSupport: false,
  adFreeExperience: false,
  highResolutionMedia: false,
  communityAnalytics: false,
  aBTestVariantA: false,
};

const roleBasedFeatureFlags: Record<UserRole, Partial<FeatureFlags>> = {
  free: {
    aiOrchestrator: true,
  },
  pro: {
    aiOrchestrator: true,
    expertVerification: true,
    advancedReputationSystem: true,
    premiumSupport: true,
    adFreeExperience: true,
    highResolutionMedia: true,
  },
  enterprise: {
    aiOrchestrator: true,
    expertVerification: true,
    advancedReputationSystem: true,
    premiumSupport: true,
    adFreeExperience: true,
    highResolutionMedia: true,
    communityAnalytics: true,
  },
  admin: {
    aiOrchestrator: true,
    expertVerification: true,
    advancedReputationSystem: true,
    premiumSupport: true,
    adFreeExperience: true,
    highResolutionMedia: true,
    communityAnalytics: true,
    aBTestVariantA: true,
  },
};

/**
 * Deterministic A/B-Test-Zuweisung basierend auf User-ID.
 * Nutzt einen stabilen Hash (Modulo), sodass jeder Nutzer immer dieselbe Gruppe erhält.
 */
function isInABTestGroupA(userId: number): boolean {
  return userId % 2 === 0;
}

/**
 * Gibt die aktiven Feature-Flags für einen Nutzer zurück.
 * @param user Der authentifizierte Nutzer oder null für nicht-eingeloggte Nutzer.
 */
export function getFeatureFlags(user: User | null): FeatureFlags {
  const userRole: UserRole =
    user?.plan === "pro"
      ? "pro"
      : user?.plan === "premium"
        ? "pro"
        : user?.role === "admin"
          ? "admin"
          : "free";

  let activeFlags: FeatureFlags = { ...defaultFeatureFlags };

  const overrides = roleBasedFeatureFlags[userRole];
  if (overrides) {
    activeFlags = { ...activeFlags, ...overrides };
  }

  // Deterministische A/B-Test-Zuweisung (kein TODO mehr)
  if (user && isInABTestGroupA(user.id)) {
    activeFlags.aBTestVariantA = true;
  }

  return activeFlags;
}

/**
 * Typsicherer Helper zum Prüfen eines einzelnen Feature-Flags.
 */
export function hasFeature(flags: FeatureFlags, feature: keyof FeatureFlags): boolean {
  return flags[feature];
}
