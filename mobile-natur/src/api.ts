import * as SecureStore from "expo-secure-store";

export const API_ORIGIN = "https://blackwaterleaf.com";
export const NATIVE_TOKEN_KEY = "blackwaterleaf_natur_session";

type TrpcEnvelope<T> = { result?: { data?: { json?: T } }; error?: { json?: { message?: string } } };

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
  kind: "aquarium" | "terrarium" | "plant";
  name: string;
  details: Record<string, unknown>;
  updatedAt: string;
};

function unwrap<T>(payload: TrpcEnvelope<T>): T {
  if (payload.result?.data?.json !== undefined) return payload.result.data.json;
  throw new Error(payload.error?.json?.message ?? "Die BlackWaterLeaf-Daten konnten nicht geladen werden.");
}

export async function trpcGet<T>(procedure: string, input: unknown, token?: string | null): Promise<T> {
  const inputParam = JSON.stringify({ json: input });
  const response = await fetch(`${API_ORIGIN}/api/trpc/${procedure}?input=${encodeURIComponent(inputParam)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const payload = await response.json() as TrpcEnvelope<T>;
  if (!response.ok) throw new Error(payload.error?.json?.message ?? `HTTP ${response.status}`);
  return unwrap(payload);
}

export async function readToken() {
  return SecureStore.getItemAsync(NATIVE_TOKEN_KEY);
}

export async function writeToken(token: string) {
  return SecureStore.setItemAsync(NATIVE_TOKEN_KEY, token, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
}

export async function clearToken() {
  return SecureStore.deleteItemAsync(NATIVE_TOKEN_KEY);
}

export const platformAvailability = () => trpcGet<PlatformAvailability>("platform.availability", null);
export const marketplace = () => trpcGet<MarketplaceProduct[]>("partners.marketplace", undefined);
export const communityFeed = () => trpcGet<CommunityPost[]>("community.feed", { limit: 40 });
export const knowledge = () => trpcGet<KnowledgeArticle[]>("knowledge.listPublished", { locale: "de", limit: 40 });
export const currentAccount = (token: string) => trpcGet<Account | null>("auth.me", undefined, token);
export const privateHabitats = (token: string) => trpcGet<Habitat[]>("habitats.mine", undefined, token);
