import { describe, expect, it } from "vitest";
import { liveStreamEmbedSrc, parseStoredLiveStream, resolveLiveStreamReference } from "../shared/live-stream-embed";

describe("live stream provider validation", () => {
  it("normalizes accepted YouTube video identifiers and URLs", () => {
    expect(resolveLiveStreamReference("youtube", "dQw4w9WgXcQ")).toEqual({ provider: "youtube", identifier: "dQw4w9WgXcQ", canonicalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
    expect(resolveLiveStreamReference("youtube", "https://youtu.be/dQw4w9WgXcQ?t=12")?.identifier).toBe("dQw4w9WgXcQ");
    expect(resolveLiveStreamReference("youtube", "https://example.com/video")).toBeNull();
  });

  it("normalizes accepted Twitch channel references and rejects reserved paths", () => {
    expect(resolveLiveStreamReference("twitch", "TwitchDev")).toEqual({ provider: "twitch", identifier: "twitchdev", canonicalUrl: "https://www.twitch.tv/twitchdev" });
    expect(resolveLiveStreamReference("twitch", "https://www.twitch.tv/twitchdev")?.identifier).toBe("twitchdev");
    expect(resolveLiveStreamReference("twitch", "https://www.twitch.tv/directory")).toBeNull();
  });

  it("generates allowlisted direct player URLs only", () => {
    const youtube = resolveLiveStreamReference("youtube", "dQw4w9WgXcQ")!;
    const twitch = resolveLiveStreamReference("twitch", "twitchdev")!;
    expect(liveStreamEmbedSrc(youtube, "blackwaterleaf.com")).toContain("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(liveStreamEmbedSrc(twitch, "www.blackwaterleaf.com")).toContain("https://player.twitch.tv/?channel=twitchdev&parent=www.blackwaterleaf.com");
    expect(liveStreamEmbedSrc(twitch, "not a hostname")).toBeNull();
  });

  it("recognizes canonical stored sources without accepting arbitrary iframe targets", () => {
    expect(parseStoredLiveStream("https://www.youtube.com/watch?v=dQw4w9WgXcQ")?.provider).toBe("youtube");
    expect(parseStoredLiveStream("https://evil.example/embed")).toBeNull();
  });
});
