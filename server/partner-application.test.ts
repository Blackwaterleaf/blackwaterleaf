import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("partner programme application", () => {
  it("keeps a public application path connected to the Support CTA", () => {
    expect(source("client/src/App.tsx")).toContain('path={"/partner-werden"}');
    expect(source("client/src/pages/Support.tsx")).toContain('href="/partner-werden"');
    expect(source("client/src/pages/PartnerApply.tsx")).toContain("trpc.partners.submitApplication.useMutation");
  });

  it("captures the organisation details needed for review", () => {
    const router = source("server/routers/partners.ts");
    const schema = source("drizzle/schema.ts");
    for (const field of ["organizationName", "contactName", "organizationType", "contactEmail", "website", "message"]) {
      expect(router).toContain(field);
      expect(schema).toContain(field);
    }
    expect(router).toContain("submitApplication: publicProcedure");
    expect(router).toContain("https_website_required");
  });

  it("keeps public applications in the admin queue and replies by email", () => {
    expect(source("client/src/pages/AdminDashboard.tsx")).toContain("organizationName");
    expect(source("client/src/pages/AdminDashboard.tsx")).toContain("Wird als E-Mail gesendet");
    expect(source("server/routers/partners.ts")).toContain("sendStaffResponseEmail");
  });
});
