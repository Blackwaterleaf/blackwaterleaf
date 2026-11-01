// Storage adapter: Manus Forge in managed staging, local atomic files on IONOS.
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { ENV } from "./_core/env";

function getForgeConfig() {
  if (ENV.selfHostedAuthOnly) {
    throw new Error("Self-hosted storage is not configured; set BWL_STORAGE_ROOT");
  }
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) throw new Error("Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY");
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}

function normalizeKey(relKey: string): string {
  const key = relKey.replace(/^\/+/, "");
  if (!key || key.includes("\0") || key.includes("..") || key.includes("\\") || !/^[A-Za-z0-9._/-]+$/.test(key)) throw new Error("Invalid storage key");
  return key;
}

function localPath(key: string) {
  if (!ENV.storageRoot) throw new Error("Local storage is not configured");
  const root = path.resolve(ENV.storageRoot);
  const target = path.resolve(root, key);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new Error("Storage path escapes root");
  return target;
}

function signLocalKey(key: string, expires: number) {
  if (!ENV.mediaSigningSecret) throw new Error("Media signing secret is not configured");
  return createHmac("sha256", ENV.mediaSigningSecret).update(`${expires}:${key}`).digest("base64url");
}

export function verifyLocalMediaSignature(key: string, expires: number, signature: string) {
  if (!ENV.storageRoot || !ENV.mediaSigningSecret || !Number.isSafeInteger(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  try {
    const normalized = normalizeKey(key);
    const expected = Buffer.from(signLocalKey(normalized, expires));
    const actual = Buffer.from(signature);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function signedLocalUrl(key: string) {
  const expires = Math.floor(Date.now() / 1000) + 900;
  return `/media/object?key=${encodeURIComponent(key)}&expires=${expires}&signature=${encodeURIComponent(signLocalKey(key, expires))}`;
}

function appendHashSuffix(relKey: string): string {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  return lastDot === -1 ? `${relKey}_${hash}` : `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(relKey: string, data: Buffer | Uint8Array | string, contentType = "application/octet-stream"): Promise<{ key: string; url: string }> {
  void contentType;
  if (ENV.storageRoot) {
    const key = appendHashSuffix(normalizeKey(relKey));
    const target = localPath(key);
    await mkdir(path.dirname(target), { recursive: true, mode: 0o750 });
    const temporary = `${target}.${randomUUID()}.part`;
    const body = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
    try {
      await writeFile(temporary, body, { flag: "wx", mode: 0o640 });
      await rename(temporary, target);
    } catch (error) {
      await import("node:fs/promises").then(fs => fs.unlink(temporary).catch(() => undefined));
      throw error;
    }
    return { key, url: signedLocalUrl(key) };
  }

  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!presignResp.ok) throw new Error(`Storage presign failed (${presignResp.status}): ${await presignResp.text().catch(() => presignResp.statusText)}`);
  const { url: s3Url } = (await presignResp.json()) as { url: string };
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data as any], { type: contentType });
  const uploadResp = await fetch(s3Url, { method: "PUT", headers: { "Content-Type": contentType }, body: blob });
  if (!uploadResp.ok) throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  return { key, url: `/manus-storage/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  if (ENV.storageRoot) return { key, url: signedLocalUrl(key) };
  if (ENV.selfHostedAuthOnly) throw new Error("Self-hosted storage is not configured; set BWL_STORAGE_ROOT");
  return { key, url: `/manus-storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  if (ENV.storageRoot) return signedLocalUrl(key);
  const { forgeUrl, forgeKey } = getForgeConfig();
  const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/");
  getUrl.searchParams.set("path", key);
  const resp = await fetch(getUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!resp.ok) throw new Error(`Storage signed URL failed (${resp.status}): ${await resp.text().catch(() => resp.statusText)}`);
  const { url } = (await resp.json()) as { url: string };
  if (!url) throw new Error("Forge returned empty signed URL");
  return url;
}
