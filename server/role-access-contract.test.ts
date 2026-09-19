import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const trpc = readFileSync(resolve(root, "server/_core/trpc.ts"), "utf8");
const admin = readFileSync(resolve(root, "server/routers/admin.ts"), "utf8");
const partners = readFileSync(resolve(root, "server/routers/partners.ts"), "utf8");
const nativeApi = readFileSync(resolve(root, "mobile-natur/src/api.ts"), "utf8");

describe("AP-10 role and capability matrix", () => {
  it("keeps staff, admin and additive merchant capabilities fail-closed", () => {
    expect(trpc).toContain('staffProcedure');
    expect(trpc).toContain('isActiveAccountWithRole(ctx.user, ["moderator", "admin"])');
    expect(trpc).toContain('adminProcedure');
    expect(trpc).toContain('isActiveAccountWithRole(ctx.user, ["admin"])');
    expect(trpc).toContain('eq(userRoles.role, "merchant")');
    expect(trpc).toContain('"Active merchant role required"');
  });

  it("keeps account role assignment admin-only and merchant operations owner-scoped", () => {
    expect(admin).toContain("setAccountRoles: adminProcedure");
    expect(admin).toContain("cannot_change_current_admin_roles");
    expect(partners).toContain("merchantProfiles: merchantProcedure");
    expect(partners).toContain("merchantUpdateProduct: merchantProcedure");
    expect(partners).toContain("merchantSubmitProduct: merchantProcedure");
    expect(partners).not.toContain("merchantSetProductStatus");
  });

  it("keeps the native account contract free of client-side permission authority", () => {
    expect(nativeApi).toContain("role:");
    expect(nativeApi).not.toContain("isAdmin = true");
    expect(nativeApi).not.toContain("grantRole");
  });
});
