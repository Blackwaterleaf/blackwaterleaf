export const LIVE_STREAM_PROVIDERS = ["youtube", "twitch", "self_hosted"] as const;
export type LiveStreamProvider = (typeof LIVE_STREAM_PROVIDERS)[number];

export type LiveStreamReference = {
  provider: LiveStreamProvider;
  identifier: string;
  canonicalUrl: string;
};

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const TWITCH_CHANNEL = /^[a-z0-9_]{4,25}$/i;
const SELF_HOSTED_PATH = /^bwl-live-v1-\d+-[a-z0-9_-]{12,32}$/;
const twitchReservedPaths = new Set(["directory", "downloads", "jobs", "p", "products", "search", "settings", "store", "subscriptions", "turbo", "videos"]);

function urlOrNull(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function youtubeId(source: string) {
  const value = source.trim();
  if (YOUTUBE_ID.test(value)) return value;
  const parsed = urlOrNull(value);
  if (!parsed) return null;
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "youtu.be") return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
  if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "youtube-nocookie.com") return null;
  if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
  const parts = parsed.pathname.split("/").filter(Boolean);
  if (["embed", "live", "shorts"].includes(parts[0] ?? "")) return parts[1] ?? null;
  return null;
}

function twitchChannel(source: string) {
  const value = source.trim();
  if (TWITCH_CHANNEL.test(value)) return value.toLowerCase();
  const parsed = urlOrNull(value);
  if (!parsed) return null;
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "player.twitch.tv") return parsed.searchParams.get("channel")?.toLowerCase() ?? null;
  if (host !== "twitch.tv" && host !== "m.twitch.tv") return null;
  return parsed.pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? null;
}

export function resolveLiveStreamReference(provider: LiveStreamProvider, source: string): LiveStreamReference | null {
  if (provider === "youtube") {
    const identifier = youtubeId(source);
    if (!identifier || !YOUTUBE_ID.test(identifier)) return null;
    return { provider, identifier, canonicalUrl: `https://www.youtube.com/watch?v=${identifier}` };
  }
  if (provider === "self_hosted") {
    const identifier = source.trim();
    if (!SELF_HOSTED_PATH.test(identifier)) return null;
    return { provider, identifier, canonicalUrl: `bwl-live://${identifier}` };
  }
  const identifier = twitchChannel(source);
  if (!identifier || !TWITCH_CHANNEL.test(identifier) || twitchReservedPaths.has(identifier)) return null;
  return { provider, identifier, canonicalUrl: `https://www.twitch.tv/${identifier}` };
}

export function parseStoredLiveStream(value: string | null | undefined): LiveStreamReference | null {
  if (!value) return null;
  if (value.startsWith("bwl-live://")) return resolveLiveStreamReference("self_hosted", value.slice("bwl-live://".length));
  return resolveLiveStreamReference("youtube", value) ?? resolveLiveStreamReference("twitch", value);
}

export function liveStreamEmbedSrc(stream: LiveStreamReference, parentHostname: string) {
  if (stream.provider === "self_hosted") return null;
  if (stream.provider === "youtube") {
    const query = new URLSearchParams({ rel: "0", playsinline: "1", modestbranding: "1" });
    return `https://www.youtube-nocookie.com/embed/${stream.identifier}?${query.toString()}`;
  }
  const parent = parentHostname.trim().toLowerCase();
  if (!parent || /[^a-z0-9.-]/.test(parent)) return null;
  const query = new URLSearchParams({ channel: stream.identifier, parent, autoplay: "false", muted: "false" });
  return `https://player.twitch.tv/?${query.toString()}`;
}
