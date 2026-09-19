import type { Express } from "express";
import { ENV } from "./env";

// AP-03: the anonymous proxy serves immutable public design assets only.
// Dynamic user, habitat, observation, community and merchant media require
// an object-authorized server path and are never accepted as raw storage keys.
const PUBLIC_DESIGN_ASSETS = new Set([
  "aquarium-photorealistic-reference_3c93f1e3.png",
  "aquarium-planted_42d3639b.jpg",
  "aquarium-reference_2e42963b.jpg",
  "assistant-reference_4510581b.jpg",
  "blackwaterleaf-original-mark-1024_28dcd697.png",
  "botany-rainforest_def7888b.jpg",
  "botany-reference_c192e480.jpg",
  "kiemen-kumpel-shop_5e6207a0.jpg",
  "terrarium-moss_9eba1fa1.jpg",
  "terrarium-photorealistic-reference_bcb9db80.png",
  "terrarium-reference_c4e109d3.jpg",
]);

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!PUBLIC_DESIGN_ASSETS.has(key)) {
      res.status(403).send("Object authorization required");
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
