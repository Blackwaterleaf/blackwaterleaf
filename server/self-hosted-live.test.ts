import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createSelfHostedStreamPath, createViewerTicket, hashIngestKey, safeIngestKeyMatch, sessionIdFromSelfHostedStreamPath, verifyViewerTicket } from "../shared/self-hosted-live";
import { parseStoredLiveStream, resolveLiveStreamReference } from "../shared/live-stream-embed";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

const secret = "0123456789abcdef0123456789abcdef0123456789abcdef";

describe("self-hosted BlackWaterLeaf live control", () => {
  it("creates opaque session-bound media paths and never treats a key as stored data", () => {
    const path = createSelfHostedStreamPath(42);
    expect(sessionIdFromSelfHostedStreamPath(path)).toBe(42);
    expect(sessionIdFromSelfHostedStreamPath("bwl-live-v1-0-invalidstreamtoken")).toBeNull();
    const key = "one-time-ingest-secret";
    expect(hashIngestKey(key)).not.toContain(key);
    expect(safeIngestKeyMatch(hashIngestKey(key), key)).toBe(true);
    expect(safeIngestKeyMatch(hashIngestKey(key), "wrong-key")).toBe(false);
  });

  it("binds signed member playback tickets to a stream, session and expiry", () => {
    const path = "bwl-live-v1-42-abcdefghijklm";
    const token = createViewerTicket(path, 42, secret, 1_000);
    expect(verifyViewerTicket(token, secret, 1_001)).toMatchObject({ path, sessionId: 42 });
    expect(verifyViewerTicket(token, "wrong-secret-that-is-also-long-enough-for-validation", 1_001)).toBeNull();
    expect(verifyViewerTicket(token, secret, 700_000)).toBeNull();
  });

  it("keeps self-hosted paths separate from external provider URLs", () => {
    const stream = resolveLiveStreamReference("self_hosted", "bwl-live-v1-42-abcdefghijklm");
    expect(stream).toEqual({ provider: "self_hosted", identifier: "bwl-live-v1-42-abcdefghijklm", canonicalUrl: "bwl-live://bwl-live-v1-42-abcdefghijklm" });
    expect(parseStoredLiveStream(stream!.canonicalUrl)).toEqual(stream);
    expect(resolveLiveStreamReference("self_hosted", "https://untrusted.example/video")).toBeNull();
  });

  it("requires member authentication for playback and a media secret for transport callbacks", () => {
    const media = read("server/selfHostedLiveMedia.ts");
    const bootstrap = read("server/_core/index.ts");
    const router = read("server/routers/live.ts");
    for (const token of ["sdk.authenticateRequest", "selfHostedMediaControlSecret", "safeIngestKeyMatch", "controlSecretMatches", "timingSafeEqual", "state === \"online\" ? \"live\"", "res.redirect(302"]) expect(media).toContain(token);
    for (const token of ["/api/live-media/auth", "/api/live-media/session/:sessionId/state", "/api/live-media/session/:sessionId/watch"]) expect(bootstrap).toContain(token);
    for (const token of ["rotateSelfHostedKey: staffProcedure", "viewerTicket: protectedProcedure", "self_hosted_stream_requires_control_deck"]) expect(router).toContain(token);
  });

  it("keeps HLS private behind the IONOS playback gateway and uses encrypted OBS ingestion", () => {
    const compose = read("deploy/ionos-live/compose.yaml");
    const media = read("deploy/ionos-live/mediamtx.yml.template");
    const gateway = read("deploy/ionos-live/gateway/server.mjs");
    expect(compose).toContain('"1936:1936"');
    expect(compose).not.toContain('"8888:8888"');
    for (const token of ["rtmpEncryption: strict", "rtmpsAddress: :1936", "authMethod: http", "runOnOnline", "runOnOffline"]) expect(media).toContain(token);
    for (const token of ["/auth", "sessionFromCookie", "proxyHls", "MEDIA_HLS_UPSTREAM"]) expect(gateway).toContain(token);
  });

  it("keeps the self-hosted player disabled until the dedicated origin and control secret are configured", () => {
    const env = read("server/_core/env.ts");
    const media = read("server/selfHostedLiveMedia.ts");
    expect(env).toContain('selfHostedMediaOrigin: process.env.BWL_MEDIA_ORIGIN ?? ""');
    expect(env).toContain('selfHostedMediaControlSecret: process.env.BWL_MEDIA_CONTROL_SECRET ?? ""');
    expect(media).toContain('origin.protocol === "https:" && ENV.selfHostedMediaControlSecret.length >= 32');
  });

  it("presents an encrypted custom OBS endpoint and an intentionally empty stream-key field", () => {
    const hub = read("client/src/pages/LiveHub.tsx");
    const guide = read("docs/IONOS_SELF_HOSTED_LIVE_OPERATIONS_2026-09-19.md");
    expect(hub).toContain('OBS-Server (Custom)');
    expect(hub).toContain('?user=studio&pass=${ingest.key}');
    expect(hub).toContain('OBS-Stream-Key');
    expect(guide).toContain('Stream Key | Leer lassen');
    expect(guide).toContain('rtmps://stream.blackwaterleaf.com:1936');
  });
});
