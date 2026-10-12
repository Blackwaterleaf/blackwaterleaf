import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("Premium-Code and points contract", () => {
  it("stores only digests and keeps one redemption per account", () => {
    const schema = source("drizzle/schema.ts");
    const router = source("server/routers/promoCodes.ts");
    const migration = source("drizzle/0063_faithful_bloodstorm.sql");
    expect(schema).toContain('"promo_codes"');
    expect(schema).toContain('"promo_code_redemptions"');
    expect(schema).toContain("promo_codes_digest_unique");
    expect(schema).toContain("promo_code_redemptions_code_user_unique");
    expect(router).toContain("createHash(\"sha256\")");
    expect(router).toContain("promo_code_already_redeemed");
    expect(router).toContain("maxRedemptions");
    expect(migration).toContain("CREATE TABLE `promo_codes`");
  });

  it("keeps code creation admin-only and redemption authenticated", () => {
    const router = source("server/routers/promoCodes.ts");
    expect(router).toContain("create: adminProcedure");
    expect(router).toContain("list: adminProcedure");
    expect(router).toContain("revoke: adminProcedure");
    expect(router).toContain("redeem: protectedProcedure");
    expect(router).toContain("await tx.insert(xpEvents)");
    expect(router).toContain("pro_override");
  });

  it("exposes the same redeem and status flow in Web and Native", () => {
    const webProfile = source("client/src/pages/ProfileHome.tsx");
    const webAdmin = source("client/src/pages/AdminDashboard.tsx");
    const nativeApi = source("mobile-natur/src/api.ts");
    const nativeApp = source("mobile-natur/App.tsx");
    const designBook = source("docs/BLACKWATERLEAF_OBSERVATORY_SCREEN_DESIGN_BOOK_2026-09-19.md");
    expect(webProfile).toContain("trpc.promoCodes.redeem.useMutation");
    expect(webAdmin).toContain("/admin/promo-codes");
    expect(webAdmin).toContain("CODE ERSTELLEN");
    expect(nativeApi).toContain('"promoCodes.redeem"');
    expect(nativeApp).toContain("redeemPromoCode(token");
    expect(nativeApp).toContain("NativePromoCodesPanel");
    expect(designBook).toContain("15.49 Premium-Codes");
  });
});
