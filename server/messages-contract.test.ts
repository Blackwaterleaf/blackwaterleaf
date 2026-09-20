import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const router = readFileSync(resolve(root, "server/routers/messages.ts"), "utf8");
const schema = readFileSync(resolve(root, "drizzle/schema.ts"), "utf8");
const web = readFileSync(resolve(root, "client/src/pages/Messages.tsx"), "utf8");
const shell = readFileSync(resolve(root, "client/src/components/AppShell.tsx"), "utf8");
const profile = readFileSync(resolve(root, "client/src/pages/PublicProfile.tsx"), "utf8");
const native = readFileSync(resolve(root, "mobile-natur/App.tsx"), "utf8");
const api = readFileSync(resolve(root, "mobile-natur/src/api.ts"), "utf8");
const notifications = readFileSync(resolve(root, "client/src/pages/Notifications.tsx"), "utf8");

 describe("private messaging contract", () => {
  it("stores two-member conversations and server-controlled message state", () => {
    for (const token of ["directConversations", "directMessages", "readAt", "status", "direct_conversations_participants_unique"]) expect(schema).toContain(token);
    for (const procedure of ["unreadCount", "conversations", "messages", "start", "send", "markRead"]) expect(router).toContain(procedure);
  });

  it("enforces authentication, active recipients and both-direction blocks", () => {
    for (const token of ["protectedProcedure", "messaging_blocked", "recipient_not_available", "cannot_message_self", "assertNotBlocked", "messaging_content_policy_violation_account_suspended", "assertMessageRateLimit", "messaging_rate_limit"]) expect(router).toContain(token);
    expect(router).toContain('type: "message"');
  });

  it("keeps Web and Native entry points connected to the same contracts", () => {
    for (const token of ["/messages", "messages.unreadCount.useQuery", "trpc.messages.conversations.useQuery", "messages.markRead", "NACHRICHT", "directConversations", "startDirectConversation", "sendDirectMessage", "markDirectConversationRead"]) expect(web + shell + profile + native + api).toContain(token);
    expect(notifications).toContain('if (type === "message") return "/messages";');
  });
});
