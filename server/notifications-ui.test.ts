import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("notification center UI contract", () => {
  it("exposes a private notification route and links the header bell to it", () => {
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const shell = readFileSync(resolve(process.cwd(), "client/src/components/AppShell.tsx"), "utf8");
    const page = readFileSync(resolve(process.cwd(), "client/src/pages/Notifications.tsx"), "utf8");
    expect(app).toContain('path={"/notifications"}');
    expect(shell).toContain('href="/notifications"');
    expect(shell).toContain("trpc.notifications.unreadCount.useQuery");
    expect(page).toContain("trpc.notifications.feed.useQuery");
    expect(page).toContain("notificationTarget");
    expect(page).toContain("markRead.mutate");
  });
});
      
