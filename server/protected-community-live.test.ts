import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

const community = read("server/routers/community.ts");
const live = read("server/routers/live.ts");
const social = read("server/routers/social.ts");
const schema = read("drizzle/schema.ts");

describe("protected Community detail and Live Hub", () => {
  it("requires an active signed-in account for community feeds, details and comments", () => {
    for (const token of ["feed: protectedProcedure", "byId: protectedProcedure", "comments: protectedProcedure", "COMMUNITY/AUTH_REQUIRED", "COMMUNITY_DETAIL/AUTH_REQUIRED"]) expect(`${community}\n${read("client/src/pages/Community.tsx")}\n${read("client/src/pages/CommunityPostDetail.tsx")}`).toContain(token);
    expect(community).not.toContain("feed: publicProcedure");
    expect(community).not.toContain("comments: publicProcedure");
    const profileRouter = read("server/routers/profile.ts");
    const publicProfile = read("client/src/pages/PublicProfile.tsx");
    expect(profileRouter).toContain("publicPosts: publicProcedure");
    expect(profileRouter).toContain('eq(users.profileVisibility, "public")');
    expect(publicProfile).not.toContain("POSTS_AUTH_REQUIRED");
  });

  it("adds a dedicated discussion route and keeps comments account-bound", () => {
    const app = read("client/src/App.tsx");
    const page = read("client/src/pages/CommunityPostDetail.tsx");
    expect(app).toContain('path={"/community/post/:id"}');
    for (const token of ["community.byId", "community.comments", "community.addComment", "community-detail-thread", "parentId", "href={`/member/${item.author.id}`}"]) expect(page).toContain(token);
    expect(page).not.toContain("social.follow");
    expect(page).not.toContain("Konto blockieren");
  });

  it("separates community live sessions from staff-approved expert lectures", () => {
    for (const token of ["export const liveSessions", "track: mysqlEnum(\"track\", [\"community\", \"expert\"])", "export const liveSessionMessages", "live_sessions_member_feed_idx"]) expect(schema).toContain(token);
    for (const token of ["list: protectedProcedure", "messages: protectedProcedure", "sendMessage: protectedProcedure", "create: staffProcedure", "expert_credential_required", "streamInputSchema", "unsupported_or_invalid_stream_source", "live_chat_rate_limited"]) expect(live).toContain(token);
    const hub = read("client/src/pages/LiveHub.tsx");
    const player = read("client/src/pages/LiveSession.tsx");
    const security = read("server/security.ts");
    for (const token of ["COMMUNITY LIVE", "FACHVORTRÄGE", "LIVE-HUB IST GESCHÜTZT", "SITZUNG PLANEN", "YouTube Live", "Twitch"]) expect(hub).toContain(token);
    for (const token of ["liveStreamEmbedSrc", "DIREKT IM HUB", "allowFullScreen"]) expect(player).toContain(token);
    for (const token of ["youtube-nocookie.com", "player.twitch.tv"]) expect(security).toContain(token);
  });

  it("supports following, blocking and unblocking without retaining follow links", () => {
    for (const token of ["isBlockedByMe", "blocked: protectedProcedure", "unblock: protectedProcedure", "status: \"removed\"", "userFollows"]) expect(social).toContain(token);
    const profile = read("client/src/pages/Profile.tsx");
    expect(profile).toContain("BLOCKIERTE KONTEN");
    expect(profile).toContain("ENTBLOCKEN");
  });

  it("keeps native Community API calls authenticated", () => {
    const api = read("mobile-natur/src/api.ts");
    const app = read("mobile-natur/App.tsx");
    expect(api).toContain("communityFeed = (token: string)");
    expect(api).toContain("communityComments = (token: string, postId: number)");
    expect(app).toContain("communityFeed(token)");
    expect(app).toContain("COMMUNITY · GESCHÜTZT");
  });
});
