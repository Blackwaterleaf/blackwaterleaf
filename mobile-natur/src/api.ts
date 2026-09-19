import * as SecureStore from "expo-secure-store";

export const API_ORIGIN = "https://blackwaterleaf.com";
export const NATIVE_TOKEN_KEY = "blackwaterleaf.session_token.v1";

type TrpcEnvelope<T> = {
  result?: { data?: { json?: T } };
  error?: { json?: { message?: string } };
};
export type HabitatKind = "aquarium" | "terrarium" | "plant";
export type HabitatPayload =
  | {
      kind: "plant";
      name: string;
      details: {
        scientificName: string | null;
        quantity: number | null;
        location: string | null;
        substrate: string | null;
        potSizeCm: number | null;
        light: string | null;
        watering: string | null;
        humidityPercent: number | null;
        temperatureC: number | null;
        fertilizer: string | null;
        notes: string | null;
      };
    }
  | {
      kind: "aquarium";
      name: string;
      details: {
        volumeLiters: number | null;
        lengthCm: number | null;
        widthCm: number | null;
        heightCm: number | null;
        occupants: string | null;
        plants: string | null;
        temperatureC: number | null;
        ph: number | null;
        gh: number | null;
        kh: number | null;
        nitriteMgL: number | null;
        nitrateMgL: number | null;
        conductivityUs: number | null;
        equipment: string | null;
        notes: string | null;
      };
    }
  | {
      kind: "terrarium";
      name: string;
      details: {
        volumeLiters: number | null;
        lengthCm: number | null;
        widthCm: number | null;
        heightCm: number | null;
        occupants: string | null;
        plants: string | null;
        dayTemperatureC: number | null;
        nightTemperatureC: number | null;
        humidityPercent: number | null;
        substrate: string | null;
        equipment: string | null;
        notes: string | null;
      };
    };

export type PlatformAvailability = {
  api: "available" | "temporarily_unavailable";
  database: "available" | "not_connected" | "temporarily_unavailable";
  authentication: "available";
  mediaStorage: "available" | "not_connected";
  community: "available" | "temporarily_unavailable";
  knowledge: "available" | "temporarily_unavailable";
  aiAssistant: "available" | "not_connected" | "temporarily_unavailable";
  aiReason: string;
};
export type OutdoorWeather = {
  temperatureC: number;
  humidityPercent: number;
  condition: string;
  effect: string;
  observedAt: string;
  source: "open_meteo";
};
export type MarketplaceProduct = {
  id: number;
  partnerId: number;
  partnerName: string;
  partnerType?: "company" | "individual" | "organization" | string;
  partnerUrl?: string | null;
  disclosureLabel: string;
  title: string;
  description: string | null;
  destinationUrl: string;
  priceLabel: string | null;
  imageUrl: string | null;
  imageAltText: string | null;
  marketplaceCategory: string | null;
  productType?: string | null;
  variantSummary?: string | null;
  variantCount?: number | null;
  updatedAt?: string | null;
};
export type CommunityPost = {
  id: string;
  author: { id: string; name: string | null; username: string | null };
  content: string;
  realm: string | null;
  media: Array<{ id: string; accessUrl: string }>;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
};
export type CommunityComment = {
  id: number;
  postId: number;
  parentId: number | null;
  content: string;
  createdAt: string;
  authorId: number;
  authorName: string | null;
  authorUsername: string | null;
};
export type NativeNotification = {
  id: number;
  type: "comment" | "like" | "report" | "moderation" | "system";
  postId: number | null;
  commentId: number | null;
  message: string;
  readAt: string | null;
  createdAt: string;
  actorName: string;
  isRead: boolean;
};
export type OwnCommunityPost = {
  id: number;
  content: string;
  realm: "botany" | "aquarium" | "terrarium" | null;
  visibility: "private" | "public";
  status: string;
  updatedAt: string;
};
export type KnowledgeArticle = {
  id: string;
  title: string;
  excerpt: string;
  realm: string | null;
  evidenceState: string;
  sources: Array<{ label: string; url: string }>;
};
export type Account = {
  id: number;
  name: string | null;
  username: string | null;
  email: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  role: "user" | "moderator" | "admin";
  status: string;
  locale?: "de" | "en";
  unitSystem?: "metric" | "imperial";
};
export type Habitat = {
  id: number;
  kind: HabitatKind;
  name: string;
  details: Record<string, unknown>;
  images?: Array<{ id: string; accessUrl: string; mimeType: string }>;
  updatedAt: string;
};
export type Observation = {
  id: string;
  realm: "botany" | "aquarium" | "terrarium";
  subject: string | null;
  scientificName: string | null;
  note: string | null;
  media: Array<{ accessUrl: string }>;
  createdAt: string;
};
export type ProfileConsent = {
  purpose: "profile_publication" | "observation_publishing" | "media_processing" | "community_publishing" | "ai_processing" | "location_processing";
  granted: boolean;
  policyVersion: string;
  updatedAt: string;
};
export type CareTask = {
  id: string;
  planId: string;
  habitatId: string | null;
  title: string;
  dueAt: string;
  status: "open" | "done" | "snoozed" | "skipped";
  skipReason: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
export type CarePlan = {
  id: number;
  userId: number;
  habitatId: number | null;
  realm: "botany" | "aquarium" | "terrarium";
  title: string;
  timezone: string;
  active: boolean;
};
export type CareJournalEntry = { id: number; note: string; observedAt: string; habitatId: number | null; taskId: number | null };
export type AssistantReply = {
  answer: string;
  model: string;
  xpAwarded: number;
  disclaimer: string;
};
export type PlantIdentificationReply = AssistantReply & {
  assistantUsageId: number;
  needsMoreImages: boolean;
  requestedAdditionalImages: number;
};

function unwrap<T>(payload: TrpcEnvelope<T>): T {
  if (payload.result?.data?.json !== undefined) return payload.result.data.json;
  throw new Error(
    payload.error?.json?.message ??
      "Die BlackWaterLeaf-Daten konnten nicht geladen werden."
  );
}
async function trpc<T>(
  procedure: string,
  input: unknown,
  token: string | null | undefined,
  method: "GET" | "POST"
) {
  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};
  const url = `${API_ORIGIN}/api/trpc/${procedure}`;
  const request =
    method === "GET"
      ? { headers }
      : {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ json: input }),
        };
  const response =
    method === "GET"
      ? await fetch(
          `${url}?input=${encodeURIComponent(JSON.stringify({ json: input }))}`,
          request
        )
      : await fetch(url, request);
  const payload = (await response.json()) as TrpcEnvelope<T>;
  if (!response.ok)
    throw new Error(payload.error?.json?.message ?? `HTTP ${response.status}`);
  return unwrap(payload);
}
export const trpcGet = <T>(
  procedure: string,
  input: unknown,
  token?: string | null
) => trpc<T>(procedure, input, token, "GET");
export const trpcPost = <T>(procedure: string, input: unknown, token: string) =>
  trpc<T>(procedure, input, token, "POST");
export const readToken = () => SecureStore.getItemAsync(NATIVE_TOKEN_KEY);
export const writeToken = (token: string) =>
  SecureStore.setItemAsync(NATIVE_TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
export const clearToken = () => SecureStore.deleteItemAsync(NATIVE_TOKEN_KEY);
export const platformAvailability = () =>
  trpcGet<PlatformAvailability>("platform.availability", null);
export const outdoorWeather = (latitude: number, longitude: number, token?: string | null) =>
  trpcPost<OutdoorWeather>(
    "sensors.outdoor",
    { latitude: Math.round(latitude * 100) / 100, longitude: Math.round(longitude * 100) / 100 },
    token ?? "",
  );
export const marketplace = () =>
  trpcGet<MarketplaceProduct[]>("partners.marketplace", undefined);
export const marketplaceEvent = (input: { eventId: string; productId: number; eventType: "outbound_click" | "purchase_intent" }) =>
  trpcPost<{ recorded: boolean; eventId: string }>("partners.marketplaceEvent", input, "");
export const communityFeed = () =>
  trpcGet<CommunityPost[]>("community.feed", { limit: 40 });
export const communityComments = (postId: number) =>
  trpcGet<CommunityComment[]>("community.comments", { postId });
export const addCommunityComment = (
  token: string,
  input: { postId: number; content: string; parentId?: number | null },
) => trpcPost<{ success: true }>("community.addComment", input, token);
export const likeCommunityPost = (token: string, postId: number) =>
  trpcPost<{ liked: true }>("community.like", { postId }, token);
export const reportCommunityPost = (token: string, input: { postId?: number; commentId?: number; reason: "sexual_content" | "harassment" | "misinformation" | "copyright" | "other"; note?: string }) =>
  trpcPost<{ id: number; status: "pending" }>("community.report", input, token);
export const blockCommunityUser = (token: string, userId: number) =>
  trpcPost<{ blocked: true; userId: number }>("community.blockUser", { userId }, token);
export const unblockCommunityUser = (token: string, userId: number) =>
  trpcPost<{ blocked: false; userId: number }>("community.unblockUser", { userId }, token);
export const notificationFeed = (token: string) =>
  trpcGet<NativeNotification[]>("notifications.feed", undefined, token);
export const markNotificationsRead = (token: string, notificationId?: number) =>
  trpcPost<{ success: true }>("notifications.markRead", { notificationId }, token);
export const myCommunityPosts = (token: string) =>
  trpcGet<OwnCommunityPost[]>("community.myPosts", undefined, token);
export const knowledge = () =>
  trpcGet<KnowledgeArticle[]>("knowledge.listPublished", {
    locale: "de",
    limit: 40,
  });
export const currentAccount = (token: string) =>
  trpcGet<Account | null>("auth.me", undefined, token);
export const updateProfile = (
  token: string,
  input: { name?: string | null; bio?: string | null; locale?: "de" | "en"; unitSystem?: "metric" | "imperial" }
) => trpcPost<Account>("profile.update", input, token);
export const uploadProfileAvatar = (
  token: string,
  input: { base64: string; mimeType: string }
) => trpcPost<{ accessUrl: string }>("profile.uploadAvatar", input, token);
export const privateHabitats = (token: string) =>
  trpcGet<Habitat[]>("habitats.mine", undefined, token);
export const createHabitat = (token: string, input: HabitatPayload) =>
  trpcPost<Habitat>("habitats.create", input, token);
export const uploadHabitatImage = (
  token: string,
  input: { habitatId: number; base64: string; mimeType: string }
) => trpcPost<{ id: string; accessUrl: string }>("habitats.uploadImage", input, token);
export const privateObservations = (token: string) =>
  trpcGet<Observation[]>("observations.mine", undefined, token);
export const publicObservations = (realm?: "botany" | "aquarium" | "terrarium") =>
  trpcGet<Observation[]>("observations.publicFeed", { realm, limit: 20 });
export const createObservation = (
  token: string,
  input: {
    clientId: string;
    realm: "botany" | "aquarium" | "terrarium";
    subject: string | null;
    scientificName: string | null;
    note: string | null;
    metrics: Array<{
      key: string;
      value: string | number | boolean;
      unit?: string;
    }>;
    evidenceState: "unverified";
    visibility: "private";
  }
) => trpcPost<Observation>("observations.create", input, token);
export const uploadObservationImage = (
  token: string,
  input: { observationId: number; base64: string; mimeType: string }
) => trpcPost<{ accessUrl: string }>("observations.uploadImage", input, token);
export const setConsent = (
  token: string,
  input: {
    purpose: "media_processing";
    policyVersion: string;
    granted: boolean;
  }
) => trpcPost<{ success: true }>("profile.setConsent", input, token);
export const profileConsents = (token: string) =>
  trpcGet<ProfileConsent[]>("profile.consents", undefined, token);
export const setProfileConsent = (
  token: string,
  input: {
    purpose: "profile_publication" | "observation_publishing" | "media_processing" | "community_publishing" | "ai_processing" | "location_processing";
    policyVersion: string;
    granted: boolean;
  }
) => trpcPost<{ success: true }>("profile.setConsent", input, token);
export const assistantChat = (
  token: string,
  input: {
    clientRequestId: string;
    realm?: "botany" | "aquarium" | "terrarium";
    message: string;
    history: Array<{ role: "user" | "assistant"; content: string }>;
  }
) => trpcPost<AssistantReply>("assistant.chat", input, token);
export const assistantPlantIdentify = (
  token: string,
  input: {
    clientRequestId: string;
    imageBase64: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp";
    additionalImages?: Array<{
      imageBase64: string;
      mimeType: "image/jpeg" | "image/png" | "image/webp";
    }>;
    note?: string;
  }
) =>
  trpcPost<PlantIdentificationReply>("assistant.plantIdentify", input, token);
export const assistantAquariumAnalyze = (
  token: string,
  input: { clientRequestId: string; habitatId: number; question?: string }
) => trpcPost<AssistantReply>("assistant.aquariumAnalyze", input, token);
export const submitPlantCorrection = (
  token: string,
  input: {
    assistantUsageId?: number;
    originalAnswer: string;
    correctedName: string;
    correctionNote?: string;
  }
) =>
  trpcPost<{ id: number; status: "pending" }>(
    "assistant.submitPlantCorrection",
    input,
    token
  );
export const createCommunityDraft = (
  token: string,
  input: { content: string; realm: "botany" | "aquarium" | "terrarium" | null }
) =>
  trpcPost<{ id: string; status: "draft" }>(
    "community.createDraft",
    input,
    token
  );
export const uploadCommunityDraftImage = (
  token: string,
  input: { postId: number; base64: string; mimeType: "image/jpeg" | "image/png" | "image/webp" }
) =>
  trpcPost<{ id: string; accessUrl: string }>(
    "community.uploadDraftImage",
    input,
    token
  );
export const publishCommunityDraft = (
  token: string,
  input: { postId: number }
) =>
  trpcPost<{ status: "published"; visibility: "public" }>(
    "community.publish",
    input,
    token
  );
export const updateCommunityPost = (
  token: string,
  input: { postId: number; content: string; realm: "botany" | "aquarium" | "terrarium" | null; visibility: "private" | "public" }
) =>
  trpcPost<{ id: string; status: string; visibility: "private" | "public" }>(
    "community.updateMine",
    input,
    token
  );
export const deleteCommunityPost = (token: string, postId: number) =>
  trpcPost<{ deleted: true; id: string }>("community.deleteMine", { postId }, token);
export const careToday = (token: string) =>
  trpcGet<{ date: string; tasks: CareTask[] }>("care.today", undefined, token);
export const careMine = (token: string) =>
  trpcGet<{ plans: CarePlan[]; tasks: CareTask[]; journal: CareJournalEntry[] }>("care.mine", undefined, token);
export const careCreatePlan = (token: string, input: { realm: CarePlan["realm"]; title: string; habitatId?: number | null }) =>
  trpcPost<CarePlan>("care.createPlan", input, token);
export const careCreateTask = (token: string, input: { planId: number; title: string; dueAt: string; habitatId?: number | null }) =>
  trpcPost<CareTask>("care.createTask", input, token);
export const careUpdateTask = (token: string, input: { taskId: number; status: CareTask["status"]; reason?: string | null }) =>
  trpcPost<CareTask>("care.updateTask", input, token);
export const careAddJournal = (token: string, input: { note: string; habitatId?: number | null; taskId?: number | null }) =>
  trpcPost<CareJournalEntry>("care.addJournal", input, token);


export type UnifiedSearchResult = {
  taxa: Array<{ id: string; type: "plant"; scientificName: string; acceptedScientificName: string | null; family: string | null; rank: string | null; summary: string | null; evidenceState: string; imageUrl: string | null }>;
  aquarium: Array<{ id: string; type: "aquarium"; scientificName: string; acceptedScientificName: string | null; family: string | null; rank: string | null; summary: string | null; evidenceState: string; imageUrl: string | null; commonNames: string[] }>;
  knowledge: Array<{ id: string; type: "knowledge"; title: string; excerpt: string; realm: string | null; evidenceState: string }>;
  profiles: Array<{ id: string; type: "profile"; name: string | null; username: string | null; bio: string | null; avatarUrl: string | null }>;
  community: Array<{ id: string; type: "community"; content: string; realm: string | null; userId: number; createdAt: string }>;
  products: Array<{ id: string; type: "product"; title: string; description: string | null; priceLabel: string | null; destinationUrl: string; partnerName: string | null }>;
  nextCursor: string | null;
};
export type PublicProfile = Account & { location?: string | null; profileVisibility?: string; socialLinks?: Record<string, string | null> };
export type SocialRelationship = { followers: number; following: number; isFollowing: boolean };
export type PublicProfilePost = { id: number; content: string; realm: "botany" | "aquarium" | "terrarium" | null; createdAt: string; updatedAt: string };
export type SavedItem = { id: number; targetType: "post" | "knowledge" | "plant_taxon" | "aquarium_taxon" | "product" | "profile"; targetId: number; createdAt: string };
export type PublicPlantTaxon = { id: number; source: string; sourceVersion: string; sourceRecordId: string; scientificName: string; acceptedScientificName: string | null; rank: string | null; family: string | null; genus: string | null; commonNames: string[]; synonyms: string[]; summary: string | null; careProfile: Record<string, unknown> | null; imageUrl: string | null; evidenceState: string; status: string };
export type PublicAquariumTaxon = PublicPlantTaxon;
export type Challenge = { id: number; title: string; description: string; realm: "botany" | "aquarium" | "terrarium" | null; ruleText: string; startsAt: string; endsAt: string; rewardPoints: number };
export type ChallengeProgress = { challengeId: number; title: string; realm: string | null; progress: number; status: "joined" | "completed" | "withdrawn"; endsAt: string };
export const unifiedSearch = (query: string, kind: "all" | "plant" | "aquarium" | "knowledge" | "profile" | "community" | "product" = "all", cursor?: string) => trpcGet<UnifiedSearchResult>("search.unified", { q: query, kind, locale: "de", limit: 18, cursor });
export const publicPlantTaxon = (id: number) => trpcGet<PublicPlantTaxon | null>("search.plantById", { id });
export const publicAquariumTaxon = (id: number) => trpcGet<PublicAquariumTaxon | null>("search.aquariumById", { id });
export const publicProfile = (id: number) => trpcGet<PublicProfile | null>("profile.publicById", { id });
export const publicProfilePosts = (id: number) => trpcGet<PublicProfilePost[]>("profile.publicPosts", { userId: id, limit: 12 });
export const socialRelationship = (token: string | null, id: number) => trpcGet<SocialRelationship>("social.relationship", { id }, token);
export const followProfile = (token: string, id: number) => trpcPost<{ following: true }>("social.follow", { id }, token);
export const unfollowProfile = (token: string, id: number) => trpcPost<{ following: false }>("social.unfollow", { id }, token);
export const savedItems = (token: string) => trpcGet<SavedItem[]>("social.saved", undefined, token);
export const saveItem = (token: string, input: { targetType: SavedItem["targetType"]; targetId: number }) => trpcPost<{ saved: true }>("social.save", input, token);
export const unsaveItem = (token: string, input: { targetType: SavedItem["targetType"]; targetId: number }) => trpcPost<{ saved: false }>("social.unsave", input, token);
export const publishedChallenges = () => trpcGet<Challenge[]>("challenges.listPublished", {});
export const myChallenges = (token: string) => trpcGet<ChallengeProgress[]>("challenges.myProgress", undefined, token);
export const joinChallenge = (token: string, challengeId: number) => trpcPost<{ joined: true }>("challenges.join", { challengeId }, token);
export type ExperienceSummary = { status: "ready" | "pending_migration"; totalXp: number; level: number; nextLevelXp: number; recentEvents: Array<{ id: number; points: number; eventType: string; createdAt: string }> };
export type LeaderboardRow = { rank: number; userId: string; name: string; totalXp: number };
export const gamificationSummary = (token: string) => trpcGet<ExperienceSummary>("gamification.summary", undefined, token);
export const gamificationLeaderboard = (token: string) => trpcGet<LeaderboardRow[]>("gamification.leaderboard", undefined, token);
