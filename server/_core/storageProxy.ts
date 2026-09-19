import type { Express } from "express";
import { ENV } from "./env";

/**
 * The legacy proxy exists only for public, versioned design imagery referenced
 * directly by the browser. User, observation, community, avatar and partner
 * media are never accepted here; those paths are exposed only through the
 * owning/public resource's authorized signed-URL flow.
 */
const PUBLIC_DESIGN_STORAGE_KEYS = new Set([
  "botany-rainforest_def7888b.jpg",
  "aquarium-planted_42d3639b.jpg",
  "terrarium-moss_9eba1fa1.jpg",
  "botany-reference_c192e480.jpg",
  "aquarium-reference_2e42963b.jpg",
  "terrarium-reference_c4e109d3.jpg",
  "assistant-reference_4510581b.jpg",
]);

export function isPublicDesignStorageKey(key: string): boolean {
  return PUBLIC_DESIGN_STORAGE_KEYS.has(key);
}

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!isPublicDesignStorageKey(key)) {
      res.status(404).send("Storage asset not found");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
