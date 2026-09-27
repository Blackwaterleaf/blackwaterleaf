import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("feedback and preference contracts", () => {
  it("keeps the protected feedback path in web and native", () => {
    expect(read("server/routers.ts")).toContain("feedback: feedbackRouter");
    expect(read("server/routers/feedback.ts")).toContain("protectedProcedure");
    expect(read("client/src/App.tsx")).toContain('path={"/feedback"}');
    expect(read("mobile-natur/src/FeedbackScreen.tsx")).toContain("submitFeedback");
    expect(read("client/src/pages/Feedback.tsx")).toContain('label: "Problem melden"');
    expect(read("client/src/pages/Feedback.tsx")).toContain('label: "Wunsch / Verbesserung"');
    expect(read("mobile-natur/src/FeedbackScreen.tsx")).toContain('"Problem melden"');
    expect(read("mobile-natur/src/FeedbackScreen.tsx")).toContain('"Wunsch / Verbesserung"');
  });

  it("keeps feedback text readable without the dark generic muted token", () => {
    const css = read("client/src/index.css");
    expect(css).toContain(".feedback-kind-grid button { display: flex");
    expect(css).toContain("color: #d7e9d9");
    expect(css).toContain(".feedback-field textarea::placeholder");
  });
  it("keeps notification controls server-backed", () => {
    expect(read("client/src/pages/Profile.tsx")).toContain("trpc.feedback.updatePreferences");
    expect(read("server/routers/notifications.ts")).toContain("notificationPreferences");
    expect(read("drizzle/schema.ts")).toContain('"notification_preferences"');
  });
});
