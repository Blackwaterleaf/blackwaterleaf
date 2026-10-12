import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "mobile-natur/App.tsx"), "utf8");
const api = readFileSync(resolve(root, "mobile-natur/src/api.ts"), "utf8");
const packageJson = readFileSync(resolve(root, "mobile-natur/package.json"), "utf8");

 describe("native live and community parity contract", () => {
  it("exposes the protected live contracts and native HLS playback", () => {
    for (const procedure of ["live.capabilities", "live.list", "live.byId", "live.messages", "live.viewerPresence", "live.viewerTicket", "live.sendMessage", "live.update", "live.rotateSelfHostedKey"]) expect(api).toContain(procedure);
    for (const token of ["expo-video", "useVideoPlayer", "VideoView", "contentType: \"hls\"", "Authorization: `Bearer ${token}`", "liveViewerPresence", "liveSendMessage"]) expect(app + api + packageJson).toContain(token);
  });

  it("keeps both live tracks, honest source states and member chat visible", () => {
    for (const token of ["COMMUNITY LIVE", "FACHVORTRÄGE", "ECHTE LIVE-SESSIONS.", "Es wird kein Videobild simuliert", "MEMBER-CHAT", "ZUSCHAUENDE", "liveViewerTicket"]) expect(app).toContain(token);
  });

  it("provides a dedicated native Community discussion route with replies", () => {
    for (const token of ["communityDetail", "CommunityPostDetailScreen", "DETAILANSICHT", "ANTWORTEN", "addCommunityComment", "communityComments", "onOpenDetail"]) expect(app).toContain(token);
  });
});
