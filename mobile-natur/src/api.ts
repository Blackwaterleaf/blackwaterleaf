import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

// The build may override this with EXPO_PUBLIC_API_ORIGIN. EAS builds read the
// same value from app.json extra.apiOrigin, so no temporary sandbox URL is baked
// into the native binary.
const configuredApiOrigin = process.env.EXPO_PUBLIC_API_ORIGIN?.trim() || String(Constants.expoConfig?.extra?.apiOrigin ?? "").trim();
export const API_ORIGIN = (configuredApiOrigin || "https://blackwaterleaf.com").replace(/\/+$/, "");
export const NATIVE_TOKEN_KEY = "blackwaterleaf.session_token.v1";

export type LiveTrack = "community" | "expert";
export type LiveProvider = "youtube" | "twitch" | "self_hosted";
export type LiveSession = {
  id: string;
  track: LiveTrack;
  title: string;
  description: string;
  realm: "botany" | "aquarium" | "terrarium" | null;
  presenterName: string;
  presenterCredential: string | null;
  stream: { provider: LiveProvider; identifier: string; canonicalUrl: string } | null;
  status: "scheduled" | "live" | "ended" | "cancelled";
  viewerCount: number;
  startsAt: string;
  endsAt: string | null;
  host: { id: string; name: string | null; username: string | null; role: string; roleOrigin: "server_verified" };
};
export type LiveMessage = {
  id: string;
  sessionId: number;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string | null;
  authorUsername: string | null;
  authorRole: string;
  authorRoleOrigin: "server_verified";
};
export type LiveCapabilities = { enabled: boolean; origin: string | null; ingestServer: string | null };

type TrpcEnvelope<T> = {
  result?: { data?: { json?: T } };
  error?: { json?: { message?: string } };
};
export type HabitatKind = "aquarium" | "terrarium" | "plant";
export type ObservationGeoPrivacy = "private" | "obscured" | "public" | "embargoed";
export type ObservationWildStatus = "wild" | "cultivated" | "captive" | "unknown";
export type ObservationMapPoint = {
  id: string;
  realm: "botany" | "aquarium" | "terrarium";
  label: string;
  evidenceState: "confirmed" | "contextual" | "unverified" | "conflicting" | "insufficient";
  observedAt: string | null;
  latitude: number;
  longitude: number;
  coordinateUncertaintyM: number | null;
  geoprivacy: ObservationGeoPrivacy;
};
export type StructuredObservationFields = {
  taxonRank: string | null;
  observedAt: string | null;
  basisOfRecord: "human_observation" | "machine_observation" | "material_sample";
  wildStatus: ObservationWildStatus;
  latitude: number | null;
  longitude: number | null;
  coordinateUncertaintyM: number | null;
  publicLatitude: number | null;
  publicLongitude: number | null;
  geoprivacy: ObservationGeoPrivacy;
  embargoUntil: string | null;
};
export type HabitatPayload =
  | {
      kind: "plant";
      name: string;
      careStatus: "unknown" | "stable" | "attention" | "critical";
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
      careStatus: "unknown" | "stable" | "attention" | "critical";
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
      careStatus: "unknown" | "stable" | "attention" | "critical";
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
export type NativeAnalyticsOverview = {
  registeredAccounts: number;
  pageViews: number;
  visitors: number;
  logins: number;
  averageDurationSec: number;
  bounceRate: number;
  popularPages: Array<{ label: string; value: number; detail?: string }>;
  countries: Array<{ label: string; value: number; detail?: string }>;
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
  author: { id: string; name: string | null; username: string | null; displayName?: string | null };
  content: string;
  realm: string | null;
  media: Array<{ id: string; accessUrl: string; mimeType: string; kind: string }>;
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
  type: "comment" | "like" | "report" | "moderation" | "feedback" | "partner_inquiry" | "system" | "message";
  postId: number | null;
  commentId: number | null;
  feedbackId: number | null;
  partnerInquiryId: number | null;
  message: string;
  readAt: string | null;
  createdAt: string;
  actorName: string;
  isRead: boolean;
};
export type DirectConversation = {
  id: string;
  member: { id: string; name: string; username: string | null; avatarUrl: string | null };
  lastMessage: { id: string; content: string; senderId: string; createdAt: string } | null;
  unreadCount: number;
  updatedAt: string;
};
export type DirectMessage = { id: string; senderId: string; content: string; createdAt: string };
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
export type ProfileSocialAccount = {
  id: string;
  platform: "instagram" | "tiktok" | "youtube" | "facebook" | "website";
  label: string;
  url: string;
  position: number;
};
export type Account = {
  id: number;
  name: string | null;
  username: string | null;
  email: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  socialLinks?: Record<string, string | null>;
  socialAccounts?: ProfileSocialAccount[];
  role: "user" | "moderator" | "admin";
  status: string;
  locale?: "de" | "en" | "zh-CN" | "es" | "fr" | "it" | "pt-BR" | "ja" | "ko" | "nl" | "tr" | "pl" | "ar" | "sv" | "da" | "hi" | "id" | "vi" | "uk";
  unitSystem?: "metric" | "imperial";
  profileVisibility?: "private" | "unlisted" | "public";
};
export type Habitat = {
  id: number;
  kind: HabitatKind;
  name: string;
  careStatus: "unknown" | "stable" | "attention" | "critical";
  details: Record<string, unknown>;
  images?: Array<{ id: string; accessUrl: string; mimeType: string }>;
  updatedAt: string;
};
export type ObservationCandidate = { scientificName: string; taxonRank: string | null; confidenceBand: "low" | "medium" | "high"; confidencePercent: number | null; reason: string | null; source: string | null; sourceUrl: string | null };
export type Observation = {
  id: string;
  realm: "botany" | "aquarium" | "terrarium";
  subject: string | null;
  scientificName: string | null;
  note: string | null;
  observedAt: string | null;
  wildStatus: ObservationWildStatus;
  geoprivacy: ObservationGeoPrivacy;
  evidenceState: "unverified" | "confirmed" | "contextual" | "conflicting" | "insufficient";
  userStatus: "draft" | "saved" | "help_requested" | "question_open" | "proposal_received" | "queued_for_review";
  aiCandidates: ObservationCandidate[];
  aiModel: string | null;
  aiCatalogVersion: string | null;
  revision: number;
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
  repeatEveryDays: number | null;
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
export type AquariumMetric = "temperatureC" | "ph" | "gh" | "kh" | "nitriteMgL" | "nitrateMgL" | "conductivityUs";
export type AquariumMeasurement = {
  id: string;
  habitatId: string;
  deviceConnectionId: string | null;
  metric: AquariumMetric;
  value: number;
  unit: string;
  source: "manual" | "smart_device";
  quality: "reported" | "estimated" | "rejected";
  observedAt: string;
  receivedAt: string;
};
export type AssistantReply = {
  answer: string;
  model: string;
  xpAwarded: number;
  disclaimer: string;
};
export type PlantIdentificationReply = AssistantReply & {
  assistantUsageId: number;
  identification?: { candidates: Array<{ commonName: string; scientificName: string; confidence: "low" | "moderate" | "high"; reason: string }> };
  needsMoreImages: boolean;
  requestedAdditionalImages: number;
};

export type NativeBillingStatus = {
  plan: "free" | "pro";
  active: boolean;
  paymentReady: boolean;
  currentPeriodEnd: string | null;
  aiCredits: number;
  freeIdentificationsRemaining: number;
  monthlyIdentificationsRemaining: number;
  dailyLimit: number;
  monthlyLimit: number;
  globalDailyLimit: number;
};
export type NativeCreditPack = { key: string; label: string; credits: number; priceEur: number };

function unwrap<T>(payload: TrpcEnvelope<T>): T {
  if (payload.result?.data?.json !== undefined) return payload.result.data.json;
  throw new Error(
    payload.error?.json?.message ??
      "Die BlackWaterLeaf-Daten konnten nicht geladen werden."
  );
}

function readableApiError(message: string, status?: number) {
  const known: Record<string, string> = {
    invalid_image_encoding: "Das Bild konnte nicht gelesen werden. Bitte wähle es erneut aus.",
    image_read_failed: "Das Foto konnte auf diesem Gerät nicht verarbeitet werden. Bitte wähle es erneut aus oder reduziere die Bildqualität.",
    image_processing_failed: "Die Bildaufbereitung ist fehlgeschlagen. Bitte wähle das Foto erneut aus.",
    payload_too_large: "Der Upload ist zu groß. Wähle eine niedrigere Bildqualität.",
    database_unavailable: "Der Medienserver ist vorübergehend nicht erreichbar. Bitte versuche es gleich erneut.",
    invalid_image_size: "Das Bild ist nach der Verarbeitung zu groß. Wähle eine niedrigere Bildqualität oder ein kleineres Bild.",
    image_signature_mismatch: "Der Bildtyp passt nicht zum Inhalt. Bitte speichere das Bild als JPG, PNG oder WebP und wähle es erneut aus.",
    media_processing_consent_required: "Bitte bestätige zuerst die sichere Medienverarbeitung.",
    community_publishing_consent_required: "Bitte bestätige zuerst die Veröffentlichung für die Community.",
  };
  if (known[message]) return known[message];
  if (status === 413) return "Der Upload ist zu groß. Wähle ein kleineres Medium oder reduziere die Bildqualität.";
  return message;
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
  const raw = await response.text();
  let payload: TrpcEnvelope<T>;
  try {
    payload = JSON.parse(raw) as TrpcEnvelope<T>;
  } catch {
    throw new Error(
      response.status === 403
        ? "Die API verweigert die Anfrage. Bitte starte die App nach dem nächsten Update neu."
        : readableApiError(`API antwortete nicht im erwarteten JSON-Format (HTTP ${response.status}).`, response.status)
    );
  }
  if (!response.ok) {
    const message = payload.error?.json?.message ?? `HTTP ${response.status}`;
    throw new Error(readableApiError(message, response.status));
  }
  return unwrap(payload);
}
export const trpcGet = <T>(
  procedure: string,
  input: unknown,
  token?: string | null
) => trpc<T>(procedure, input, token, "GET");
export const trpcPost = <T>(procedure: string, input: unknown, token: string) =>
  trpc<T>(procedure, input, token, "POST");
export const billingMe = (token: string) => trpcGet<NativeBillingStatus>("billing.me", undefined, token);
export const billingPlans = (token?: string | null) => trpcGet<{ creditPacks: NativeCreditPack[] }>("billing.plans", undefined, token);
export const billingCheckout = (token: string, input: { kind: "credits" | "pro_monthly" | "pro_yearly" | "donation"; packKey?: string; donationAmountEur?: number }) => trpcPost<{ id: string; url: string }>("billing.createCheckout", input, token);
export type NativePromoStatus = { active: boolean; source: "admin" | "admin_grant" | "stripe" | "none"; expiresAt: string | null };
export type NativePromoRedemption = { id: number; label: string; premiumDays: number; bonusPoints: number; entitlementExpiresAt: string | null; createdAt: string };
export type NativeAdminPromoCode = { id: number; label: string; premiumDays: number; bonusPoints: number; maxRedemptions: number; redemptionCount: number; expiresAt: string | null; revokedAt: string | null; createdAt: string };
export const promoCodeStatus = (token: string) => trpcGet<NativePromoStatus>("promoCodes.status", undefined, token);
export const promoCodeRedemptions = (token: string) => trpcGet<NativePromoRedemption[]>("promoCodes.myRedemptions", undefined, token);
export const redeemPromoCode = (token: string, code: string) => trpcPost<{ success: true; label: string; premiumDays: number; bonusPoints: number; expiresAt: string }>("promoCodes.redeem", { code }, token);
export const adminPromoCodes = (token: string) => trpcGet<NativeAdminPromoCode[]>("promoCodes.list", undefined, token);
export const adminCreatePromoCode = (token: string, input: { duration: "week_1" | "week_2" | "month_1" | "month_2"; bonusPoints: number; maxRedemptions: number; label: string; expiresAt?: string }) => trpcPost<{ id: number; code: string; label: string; premiumDays: number; bonusPoints: number; maxRedemptions: number; expiresAt: string | null }>("promoCodes.create", input, token);
export const adminRevokePromoCode = (token: string, id: number) => trpcPost<{ revoked: true; id: number }>("promoCodes.revoke", { id }, token);
export const readToken = () => SecureStore.getItemAsync(NATIVE_TOKEN_KEY);
export const writeToken = (token: string) =>
  SecureStore.setItemAsync(NATIVE_TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
export const clearToken = () => SecureStore.deleteItemAsync(NATIVE_TOKEN_KEY);
export const platformAvailability = () =>
  trpcGet<PlatformAvailability>("platform.availability", null);
export const analyticsOverview = (token: string, days: 1 | 7 | 30 = 7) =>
  trpcGet<NativeAnalyticsOverview>("analytics.overview", { days }, token);
export const liveCapabilities = (token: string) =>
  trpcGet<LiveCapabilities>("live.capabilities", undefined, token);
export const liveList = (token: string, track?: LiveTrack) =>
  trpcGet<LiveSession[]>("live.list", { track, limit: 24 }, token);
export const liveById = (token: string, id: number) =>
  trpcGet<LiveSession>("live.byId", { id }, token);
export const liveMessages = (token: string, sessionId: number) =>
  trpcGet<LiveMessage[]>("live.messages", { sessionId, limit: 100 }, token);
export const liveViewerPresence = (token: string, sessionId: number) =>
  trpcPost<{ active: boolean; viewerCount: number; expiresAt: string | null }>("live.viewerPresence", { sessionId }, token);
export const liveViewerTicket = (token: string, sessionId: number) =>
  trpcGet<{ url: string; expiresAt: string }>("live.viewerTicket", { sessionId }, token);
export const liveSendMessage = (token: string, input: { sessionId: number; content: string }) =>
  trpcPost<{ id: string; sent: true }>("live.sendMessage", input, token);
export const liveUpdate = (token: string, input: { id: number; status?: "scheduled" | "live" | "ended" | "cancelled"; endsAt?: string }) =>
  trpcPost<{ id: string; updated: true }>("live.update", input, token);
export const liveRotateSelfHostedKey = (token: string, sessionId: number) =>
  trpcPost<{ path: string; key: string; keyVersion: number }>("live.rotateSelfHostedKey", { sessionId }, token);
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
export const submitPartnerInquiry = (token: string, message: string) =>
  trpcPost<{ id: number; status: "received"; message: string }>("partners.submitInquiry", { message }, token);
export const communityFeed = (token: string) =>
  trpcGet<CommunityPost[]>("community.feed", { limit: 40 }, token);
export const communityComments = (token: string, postId: number) =>
  trpcGet<CommunityComment[]>("community.comments", { postId }, token);
export const addCommunityComment = (
  token: string,
  input: { postId: number; parentId?: number | null; content: string }
) => trpcPost<{ success: true }>("community.addComment", input, token);
export const updateCommunityComment = (
  token: string,
  input: { commentId: number; content: string }
) => trpcPost<{ id: number; updated: true }>("community.updateComment", input, token);
export const deleteCommunityComment = (token: string, commentId: number) =>
  trpcPost<{ id: number; deleted: boolean }>("community.deleteComment", { commentId }, token);
export const reportCommunityComment = (
  token: string,
  input: { commentId: number; reason: "sexual_content" | "harassment" | "misinformation" | "copyright" | "other"; note?: string }
) => trpcPost<{ id: number; status: "pending" }>("community.report", input, token);
export const likeCommunityPost = (token: string, postId: number) =>
  trpcPost<{ liked: boolean }>("community.like", { postId }, token);
export const reportCommunityPost = (token: string, input: { postId?: number; commentId?: number; reason: "sexual_content" | "harassment" | "misinformation" | "copyright" | "other"; note?: string }) =>
  trpcPost<{ id: number; status: "pending" }>("community.report", input, token);
export const blockCommunityUser = (token: string, userId: number) =>
  trpcPost<{ blocked: true; userId: number }>("community.blockUser", { userId }, token);
export const unblockCommunityUser = (token: string, userId: number) =>
  trpcPost<{ blocked: false; userId: number }>("community.unblockUser", { userId }, token);
export type NativeAdminFeedback = { id: number; userId: number; kind: "feedback" | "problem" | "wish"; message: string; page: string | null; status: "received" | "reviewing" | "resolved"; adminNote: string | null; responseMessage: string | null; createdAt: string; updatedAt: string; userName: string | null; userEmail: string | null };
export type NativeAdminPartnerInquiry = { id: number; userId: number; contactEmail: string; message: string; status: "received" | "reviewing" | "accepted" | "declined"; adminNote: string | null; responseMessage: string | null; createdAt: string; updatedAt: string; userName: string | null };
export const adminFeedbackQueue = (token: string) => trpcGet<NativeAdminFeedback[]>("feedback.staffQueue", undefined, token);
export const adminUpdateFeedback = (token: string, input: { id: number; status: NativeAdminFeedback["status"]; adminNote?: string | null; responseMessage?: string | null }) => trpcPost<{ id: number; status: NativeAdminFeedback["status"] }>("feedback.updateStaffEntry", input, token);
export const adminPartnerInquiryQueue = (token: string) => trpcGet<NativeAdminPartnerInquiry[]>("partners.inquiryQueue", undefined, token);
export const adminUpdatePartnerInquiry = (token: string, input: { id: number; status: NativeAdminPartnerInquiry["status"]; adminNote?: string | null; responseMessage?: string | null }) => trpcPost<{ id: number; status: NativeAdminPartnerInquiry["status"] }>("partners.updateInquiry", input, token);
export type NativeAdminAccount = {
  id: number; name: string | null; username: string | null; email: string | null;
  role: "user" | "moderator" | "admin"; status: "active" | "suspended" | "banned";
  lastSignedIn: string | null;
  proAccess: { active: boolean; manuallyGranted: boolean; forcedFree: boolean; source: "admin" | "admin_grant" | "stripe" | "none"; expiresAt: string | null };
  roles: Array<"admin" | "moderator" | "merchant">;
};
export type NativeAdminPublicPost = { id: number; userId: number; content: string; realm: "botany" | "aquarium" | "terrarium" | null; createdAt: string; status: string; visibility: string };
export const adminAccounts = (token: string) => trpcGet<NativeAdminAccount[]>("admin.accounts", undefined, token);
export const adminSetAccountPro = (token: string, input: { id: number; active: boolean }) => trpcPost<{ id: number; active: boolean }>("admin.setAccountProAccess", input, token);
export const adminSetAccountStatus = (token: string, input: { id: number; status: NativeAdminAccount["status"] }) => trpcPost<{ id: number; status: string }>("admin.setAccountStatus", input, token);
export const adminSetAccountRoles = (token: string, input: { id: number; roles: NativeAdminAccount["roles"] }) => trpcPost<{ id: number; roles: NativeAdminAccount["roles"] }>("admin.setAccountRoles", input, token);
export const adminPublicPosts = (token: string) => trpcGet<NativeAdminPublicPost[]>("admin.publicPosts", undefined, token);
export const adminSetPublicPostStatus = (token: string, input: { id: number; status: "hidden" | "removed" }) => trpcPost<{ id: number; status: string }>("admin.setPublicPostStatus", input, token);
export const adminDeletePublicPost = (token: string, id: number) => trpcPost<{ id: number; status: string }>("admin.deletePublicPost", { id }, token);
export const notificationFeed = (token: string) =>
  trpcGet<NativeNotification[]>("notifications.feed", undefined, token);
export const notificationUnreadCount = (token: string) =>
  trpcGet<{ count: number }>("notifications.unreadCount", undefined, token);
export const markNotificationsRead = (token: string, notificationId?: number) =>
  trpcPost<{ success: true }>("notifications.markRead", { notificationId }, token);
export const directUnreadCount = (token: string) =>
  trpcGet<{ count: number }>("messages.unreadCount", undefined, token);
export const directConversations = (token: string) =>
  trpcGet<DirectConversation[]>("messages.conversations", undefined, token);
export const directMessages = (token: string, conversationId: number) =>
  trpcGet<{ items: DirectMessage[]; nextCursor: string | null }>("messages.messages", { conversationId, limit: 50 }, token);
export const startDirectConversation = (token: string, input: { recipientId: number; content: string }) =>
  trpcPost<{ conversationId: string; messageId: string }>("messages.start", input, token);
export const sendDirectMessage = (token: string, input: { conversationId: number; content: string }) =>
  trpcPost<{ messageId: string; sent: true }>("messages.send", input, token);
export const markDirectConversationRead = (token: string, conversationId: number) =>
  trpcPost<{ success: true }>("messages.markRead", { conversationId }, token);
export const myCommunityPosts = (token: string) =>
  trpcGet<OwnCommunityPost[]>("community.myPosts", undefined, token);
export const knowledge = (locale: "de" | "en" | "zh-CN" | "es" | "fr" | "it" | "pt-BR" | "ja" | "ko" | "nl" | "tr" | "pl" | "ar" | "sv" | "da" | "hi" | "id" | "vi" | "uk" = "de") =>
  trpcGet<KnowledgeArticle[]>("knowledge.listPublished", {
    locale,
    limit: 40,
  });
export const currentAccount = (token: string) =>
  trpcGet<Account | null>("auth.me", undefined, token);
export const updateProfile = (
  token: string,
  input: { name?: string | null; bio?: string | null; locale?: "de" | "en" | "zh-CN" | "es" | "fr" | "it" | "pt-BR" | "ja" | "ko" | "nl" | "tr" | "pl" | "ar" | "sv" | "da" | "hi" | "id" | "vi" | "uk"; unitSystem?: "metric" | "imperial"; profileVisibility?: "private" | "unlisted" | "public" }
) => trpcPost<Account>("profile.update", input, token);
export const replaceProfileSocialAccounts = (
  token: string,
  accounts: Array<Pick<ProfileSocialAccount, "platform" | "label" | "url">>,
) => trpcPost<Account>("profile.replaceSocialAccounts", { accounts }, token);
export const uploadProfileAvatar = (
  token: string,
  input: { base64: string; mimeType: string }
) => trpcPost<{ accessUrl: string }>("profile.uploadAvatar", input, token);
export const privateHabitats = (token: string) =>
  trpcGet<Habitat[]>("habitats.mine", undefined, token);
export const createHabitat = (token: string, input: HabitatPayload) =>
  trpcPost<Habitat>("habitats.create", input, token);
export const updateHabitat = (token: string, input: HabitatPayload & { id: number }) =>
  trpcPost<Habitat>("habitats.update", input, token);
export const uploadHabitatImage = (
  token: string,
  input: { habitatId: number; base64: string; mimeType: string }
) => trpcPost<{ id: string; accessUrl: string }>("habitats.uploadImage", input, token);
export const deleteHabitatImage = (token: string, input: { habitatId: number; imageId: number }) =>
  trpcPost<{ ok: true }>("habitats.deleteImage", input, token);
export type ObservationResponse = { id: number; observationId: number; parentId: number | null; kind: "confirm" | "taxon_suggestion" | "question" | "answer"; proposedScientificName: string | null; taxonRank: string | null; content: string | null; authorId: number; authorName: string | null; authorUsername: string | null; createdAt: string };
export const observationResponses = (token: string, observationId: number) => trpcGet<ObservationResponse[]>("observations.responses", { observationId }, token);
export const respondToObservation = (token: string, input: { observationId: number; parentId?: number | null; kind: "confirm" | "taxon_suggestion" | "question" | "answer"; proposedScientificName?: string | null; taxonRank?: string | null; content?: string | null }) => trpcPost<{ id: number; ok: true }>("observations.respond", input, token);
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
    observedAt?: string | null;
    basisOfRecord?: "human_observation" | "machine_observation" | "material_sample";
    wildStatus?: ObservationWildStatus;
    latitude?: number | null;
    longitude?: number | null;
    coordinateUncertaintyM?: number | null;
    publicLatitude?: number | null;
    publicLongitude?: number | null;
    geoprivacy?: ObservationGeoPrivacy;
    embargoUntil?: string | null;
    userStatus?: "draft" | "saved" | "help_requested" | "question_open" | "proposal_received" | "queued_for_review";
    aiCandidates?: ObservationCandidate[];
    aiModel?: string | null;
    aiCatalogVersion?: string | null;
    visibility: "private" | "public";
  }
) => trpcPost<Observation>("observations.create", input, token);
export const updateObservation = (token: string, input: { id: number; expectedRevision: number; visibility?: "private" | "unlisted" | "public"; userStatus?: "draft" | "saved" | "help_requested" | "question_open" | "proposal_received" | "queued_for_review"; geoprivacy?: ObservationGeoPrivacy; publicLatitude?: number | null; publicLongitude?: number | null }) => trpcPost<Observation>("observations.update", input, token);
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
export const profileExportData = (token: string) =>
  trpcGet<Record<string, unknown>>("profile.exportData", undefined, token);
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
  trpcPost<{ id: string; accessUrl: string; xpAwarded: number }>(
    "community.uploadDraftImage",
    input,
    token
  );
export const uploadCommunityDraftVideo = (
  token: string,
  input: { postId: number; base64: string; mimeType: "video/mp4" | "video/webm" }
) =>
  trpcPost<{ id: string; accessUrl: string }>(
    "community.uploadDraftVideo",
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
export const careCreateTask = (token: string, input: { planId: number; title: string; dueAt: string; repeatEveryDays?: number | null; habitatId?: number | null }) =>
  trpcPost<CareTask>("care.createTask", input, token);
export const careUpdateTask = (token: string, input: { taskId: number; status: CareTask["status"]; reason?: string | null }) =>
  trpcPost<CareTask>("care.updateTask", input, token);
export const careAddJournal = (token: string, input: { note: string; habitatId?: number | null; taskId?: number | null }) =>
  trpcPost<CareJournalEntry>("care.addJournal", input, token);
export const aquariumMeasurements = (token: string, habitatId: number, metric?: AquariumMetric, limit = 30) =>
  trpcGet<AquariumMeasurement[]>("smartDevices.measurements", { habitatId, metric, limit }, token);
export const recordAquariumMeasurement = (token: string, input: { habitatId: number; metric: AquariumMetric; value: number; observedAt?: string }) =>
  trpcPost<AquariumMeasurement>("smartDevices.recordManualMeasurement", input, token);


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
export type SocialRelationship = { followers: number; following: number; isFollowing: boolean; isBlockedByMe?: boolean };
export type SocialAdminProfile = { id: string; name: string | null; username: string | null; bio: string | null; avatarUrl: string | null; followers: number; isFollowing: boolean };
export type PublicProfilePost = { id: number; content: string; realm: "botany" | "aquarium" | "terrarium" | null; createdAt: string; updatedAt: string; media?: Array<{ id: string; kind: string; mimeType: string; url: string | null }> };
export type SavedItem = { id: number; targetType: "post" | "knowledge" | "plant_taxon" | "aquarium_taxon" | "product" | "profile"; targetId: number; createdAt: string };
export type PublicPlantTaxon = { id: number; source: string; sourceVersion: string; sourceRecordId: string; scientificName: string; acceptedScientificName: string | null; rank: string | null; family: string | null; genus: string | null; commonNames: string[]; synonyms: string[]; summary: string | null; careProfile: Record<string, unknown> | null; imageUrl: string | null; imageSourceUrl: string | null; imageLicense: string | null; imageAttribution: string | null; evidenceState: string; status: string };
export type PublicAquariumTaxon = PublicPlantTaxon;
export type PublicCatalogTaxon = Pick<PublicPlantTaxon, "id" | "scientificName" | "acceptedScientificName" | "family" | "genus" | "commonNames" | "careProfile" | "imageUrl" | "imageSourceUrl" | "imageLicense" | "imageAttribution" | "evidenceState"> & { type: "plant" | "aquarium" | "terrarium"; imageVerifiedAt?: string | null };
export type Challenge = { id: number; title: string; description: string; realm: "botany" | "aquarium" | "terrarium" | null; ruleText: string; startsAt: string; endsAt: string; rewardPoints: number };
export type ChallengeProgress = { challengeId: number; title: string; realm: string | null; progress: number; status: "joined" | "completed" | "withdrawn"; endsAt: string };
export const unifiedSearch = (query: string, kind: "all" | "plant" | "aquarium" | "knowledge" | "profile" | "community" | "product" = "all", cursor?: string) => trpcGet<UnifiedSearchResult>("search.unified", { q: query, kind, locale: "de", limit: 18, cursor });
export const publicPlantTaxon = (id: number) => trpcGet<PublicPlantTaxon | null>("search.plantById", { id });
export const publicAquariumTaxon = (id: number) => trpcGet<PublicAquariumTaxon | null>("search.aquariumById", { id });
export type PublicTerrariumTaxon = PublicAquariumTaxon & { careProfile: Record<string, unknown> | null; summary: string | null; source: string; sourceRecordUrl: string | null };
export const publicTerrariumTaxon = (id: number) => trpcGet<PublicTerrariumTaxon | null>("search.terrariumById", { id });
export const catalogByRealm = (realm: "botany" | "aquarium" | "terrarium", limit = 200) => trpcGet<PublicCatalogTaxon[]>("search.catalogByRealm", { realm, limit });
export const publicProfile = (id: number) => trpcGet<PublicProfile | null>("profile.publicById", { id });
export const publicProfilePosts = (id: number) => trpcGet<PublicProfilePost[]>("profile.publicPosts", { userId: id, limit: 12 });
export const observationMap = (realm?: "botany" | "aquarium" | "terrarium", limit = 200) =>
  trpcGet<ObservationMapPoint[]>("observations.map", { realm, limit });
export const socialRelationship = (token: string | null, id: number) => trpcGet<SocialRelationship>("social.relationship", { id }, token);
export const socialAdminProfile = (token?: string | null) => trpcGet<SocialAdminProfile>("social.adminProfile", undefined, token);
export type SocialProfileListEntry = { id: string; name: string | null; username: string | null; avatarUrl: string | null };
export const socialFollowers = (token: string | null, id: number) => trpcGet<SocialProfileListEntry[]>("social.followers", { id }, token);
export const socialFollowing = (token: string | null, id: number) => trpcGet<SocialProfileListEntry[]>("social.following", { id }, token);
export const followProfile = (token: string, id: number) => trpcPost<{ following: true }>("social.follow", { id }, token);
export const unfollowProfile = (token: string, id: number) => trpcPost<{ following: false }>("social.unfollow", { id }, token);
export const removeFollower = (token: string, followerId: number) => trpcPost<{ removed: true }>("social.removeFollower", { id: followerId }, token);
export const savedItems = (token: string) => trpcGet<SavedItem[]>("social.saved", undefined, token);
export const saveItem = (token: string, input: { targetType: SavedItem["targetType"]; targetId: number }) => trpcPost<{ saved: true }>("social.save", input, token);
export const unsaveItem = (token: string, input: { targetType: SavedItem["targetType"]; targetId: number }) => trpcPost<{ saved: false }>("social.unsave", input, token);
export const publishedChallenges = () => trpcGet<Challenge[]>("challenges.listPublished", {});
export const myChallenges = (token: string) => trpcGet<ChallengeProgress[]>("challenges.myProgress", undefined, token);
export const joinChallenge = (token: string, challengeId: number) => trpcPost<{ joined: true }>("challenges.join", { challengeId }, token);
export type ExperienceSummary = { status: "ready" | "pending_migration"; totalXp: number; level: number; nextLevelXp: number; recentEvents: Array<{ id: number; points: number; eventType: string; createdAt: string }>; qualityAchievements: Array<{ key: string; title: string; description: string; threshold: number; progress: number; achieved: boolean }> };
export type LeaderboardRow = { rank: number; userId: string; name: string; totalXp: number };
export const gamificationSummary = (token: string) => trpcGet<ExperienceSummary>("gamification.summary", undefined, token);
export const gamificationLeaderboard = (token: string) => trpcGet<LeaderboardRow[]>("gamification.leaderboard", undefined, token);

export type FeedbackKind = "feedback" | "problem" | "wish";
export const submitFeedback = (token: string, input: { kind: FeedbackKind; message: string; page?: string | null }) => trpcPost<{ id: number; status: "received" }>("feedback.submit", input, token);
export type NotificationPreferences = { community: boolean; messages: boolean; moderation: boolean; system: boolean };
export const notificationPreferences = (token: string) => trpcGet<NotificationPreferences>("feedback.preferences", undefined, token);
export const updateNotificationPreferences = (token: string, input: NotificationPreferences) => trpcPost<NotificationPreferences & { success: true }>("feedback.updatePreferences", input, token);
