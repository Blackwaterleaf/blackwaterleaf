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
  partnerName: string;
  disclosureLabel: string;
  title: string;
  description: string | null;
  destinationUrl: string;
  priceLabel: string | null;
  imageUrl: string | null;
  imageAltText: string | null;
  marketplaceCategory: string | null;
};
export type CommunityPost = {
  id: string;
  author: { name: string | null; username: string | null };
  content: string;
  realm: string | null;
  media: Array<{ id: string; accessUrl: string }>;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
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
  role: "user" | "moderator" | "admin";
  status: string;
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
  purpose: "ai_processing" | "media_processing" | "community_publishing";
  granted: boolean;
  policyVersion: string;
  updatedAt: string;
};
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
export const outdoorWeather = (latitude: number, longitude: number) =>
  trpcGet<OutdoorWeather>("sensors.outdoor", { latitude, longitude });
export const marketplace = () =>
  trpcGet<MarketplaceProduct[]>("partners.marketplace", undefined);
export const communityFeed = () =>
  trpcGet<CommunityPost[]>("community.feed", { limit: 40 });
export const myCommunityPosts = (token: string) =>
  trpcGet<OwnCommunityPost[]>("community.myPosts", undefined, token);
export const knowledge = () =>
  trpcGet<KnowledgeArticle[]>("knowledge.listPublished", {
    locale: "de",
    limit: 40,
  });
export const currentAccount = (token: string) =>
  trpcGet<Account | null>("auth.me", undefined, token);
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
    purpose: "ai_processing" | "media_processing" | "community_publishing";
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
