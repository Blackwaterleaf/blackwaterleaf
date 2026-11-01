import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import type { Express } from "express";
import { ENV } from "./env";
import { verifyLocalMediaSignature } from "../storage";

const PUBLIC_DESIGN_ASSETS = new Set([
  "aquarium-photorealistic-reference_3c93f1e3.png", "aquarium-planted_42d3639b.jpg", "aquarium-reference_2e42963b.jpg", "assistant-reference_4510581b.jpg", "blackwaterleaf-original-mark-1024_28dcd697.png", "botany-rainforest_def7888b.jpg", "botany-reference_c192e480.jpg", "kiemen-kumpel-shop_5e6207a0.jpg", "terrarium-moss_9eba1fa1.jpg", "terrarium-photorealistic-reference_bcb9db80.png", "terrarium-reference_c4e109d3.jpg",
]);
const PUBLIC_STREAM_ASSETS = new Set(["blackwaterleaf-intro_194052e3.mp4", "510445d0-bcd0-11f1-b45c-c186c16f6f72_040d84fe.mp4"]);
function isPublicCatalogueTaxonImage(key: string) { return /^catalog\/taxa\/(?:plant|aquarium)\/\d+\/(?:inat-\d+|bwl-owner)_[a-f0-9]{8}\.(?:jpg|png|webp)$/i.test(key); }
function localTarget(key: string) {
  if (!ENV.storageRoot || key.includes("\0") || key.includes("..") || key.includes("\\")) return null;
  const root = path.resolve(ENV.storageRoot); const target = path.resolve(root, key);
  return target === root || !target.startsWith(`${root}${path.sep}`) ? null : target;
}

export function registerStorageProxy(app: Express) {
  app.get("/media/object", async (req, res) => {
    if (!ENV.storageRoot) { res.status(404).send("Media route unavailable"); return; }
    const key = typeof req.query.key === "string" ? req.query.key : "";
    const expires = Number(req.query.expires);
    const signature = typeof req.query.signature === "string" ? req.query.signature : "";
    if (!key || !verifyLocalMediaSignature(key, expires, signature)) { res.status(403).send("Invalid media signature"); return; }
    const target = localTarget(key);
    if (!target) { res.status(400).send("Invalid media key"); return; }
    try {
      const info = await stat(target); if (!info.isFile()) throw new Error("not_file");
      res.setHeader("Content-Length", info.size); res.setHeader("Cache-Control", "private, max-age=300"); res.setHeader("X-Content-Type-Options", "nosniff");
      res.sendFile(target);
    } catch { res.status(404).end(); }
  });

  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) { res.status(400).send("Missing storage key"); return; }
    const isPublicStream = PUBLIC_STREAM_ASSETS.has(key);
    if (!isPublicStream && !PUBLIC_DESIGN_ASSETS.has(key) && !isPublicCatalogueTaxonImage(key)) { res.status(403).send("Object authorization required"); return; }
    if (ENV.storageRoot) {
      const target = localTarget(key); if (!target) { res.status(400).send("Invalid storage key"); return; }
      try {
        const info = await stat(target); if (!info.isFile()) throw new Error("not_file");
        res.setHeader("Content-Length", info.size); res.setHeader("Cache-Control", "public, max-age=31536000, immutable"); res.setHeader("X-Content-Type-Options", "nosniff");
        if (isPublicStream && req.header("range")) {
          const range = req.header("range")!; const match = /^bytes=(\d+)-(\d*)$/.exec(range);
          if (!match) { res.status(416).end(); return; }
          const start = Number(match[1]); const end = match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
          if (start > end || start >= info.size) { res.status(416).end(); return; }
          res.status(206).setHeader("Content-Range", `bytes ${start}-${end}/${info.size}`).setHeader("Content-Length", end - start + 1).setHeader("Accept-Ranges", "bytes");
          createReadStream(target, { start, end }).pipe(res); return;
        }
        createReadStream(target).pipe(res);
      } catch { res.status(404).end(); }
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) { res.status(500).send("Storage proxy not configured"); return; }
    try {
      const forgeUrl = new URL("v1/storage/presign/get", ENV.forgeApiUrl.replace(/\/+$/, "") + "/"); forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, { headers: { Authorization: `Bearer ${ENV.forgeApiKey}` } });
      if (!forgeResp.ok) { res.status(502).send("Storage backend error"); return; }
      const { url } = (await forgeResp.json()) as { url: string }; if (!url) { res.status(502).send("Empty signed URL from backend"); return; }
      if (isPublicStream) { const range = req.header("range"); const upstream = await fetch(url, range ? { headers: { Range: range } } : undefined); if (!upstream.ok && upstream.status !== 206) { res.status(502).send("Storage stream error"); return; } for (const header of ["content-type", "content-length", "content-range", "accept-ranges", "etag"]) { const value = upstream.headers.get(header); if (value) res.setHeader(header, value); } res.setHeader("Cache-Control", "public, max-age=3600"); res.status(upstream.status); if (upstream.body) Readable.fromWeb(upstream.body as never).pipe(res); else res.end(); return; }
      res.set("Cache-Control", "no-store"); res.redirect(307, url);
    } catch { res.status(502).send("Storage proxy error"); }
  });
}
