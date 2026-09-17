import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const router = readFileSync(resolve(root, "server/routers/partners.ts"), "utf8");
const trpc = readFileSync(resolve(root, "server/_core/trpc.ts"), "utf8");
const page = readFileSync(resolve(root, "client/src/pages/MerchantMarketplace.tsx"), "utf8");

describe("merchant marketplace capability", () => {
  it("uses the explicit merchant assignment and does not broaden admin controls", () => {
    expect(trpc).toContain('eq(userRoles.role, "merchant")');
    expect(router).toContain("merchantProfiles: merchantProcedure");
    expect(router).toContain("merchantCreateProfile: merchantProcedure");
    expect(router).toContain("merchantCreateProduct: merchantProcedure");
    expect(router).toContain("merchantSubmitProduct: merchantProcedure");
  });

  it("keeps merchant products scoped to the current merchant owner", () => {
    expect(router).toContain("eq(partnerProfiles.createdByUserId, ctx.user.id)");
    expect(router).toContain('status: "draft"');
    expect(router).not.toContain("merchantSetProductStatus");
  });

  it("exposes the protected workspace and review action in German", () => {
    expect(page).toContain("HÄNDLERBEREICH");
    expect(page).toContain("ZUR PRÜFUNG EINREICHEN");
    expect(page).toContain("Freigabe und Startseitenplatzierung bleiben beim Admin");
  });
});
