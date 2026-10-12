type CacheEntry<T> = { value: T; expiresAt: number };

const entries = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 10 * 60 * 1_000;
const MAX_ENTRIES = 256;

function prune(now: number) {
  for (const [key, entry] of Array.from(entries.entries())) {
    if (entry.expiresAt <= now) entries.delete(key);
  }
  while (entries.size > MAX_ENTRIES) {
    const oldestKey = entries.keys().next().value as string | undefined;
    if (!oldestKey) break;
    entries.delete(oldestKey);
  }
}

/**
 * Process-local cache for public, non-personalized reads only.
 * Never use this helper for accounts, permissions, private habitats, drafts,
 * community feeds, or other viewer-specific data.
 */
export async function cachedPublicQuery<T>(key: string, loader: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const now = Date.now();
  prune(now);
  const cached = entries.get(key) as CacheEntry<T> | undefined;
  if (cached && cached.expiresAt > now) return cached.value;
  const value = await loader();
  entries.set(key, { value, expiresAt: now + ttlMs });
  prune(now);
  return value;
}

export function clearPublicQueryCache() {
  entries.clear();
}
