import { describe, expect, it } from "vitest";
import { createOneTimeToken, getTokenExpiry, hashOneTimeToken, hashPassword, normalizeEmail, validatePassword, verifyPassword } from "./localAuth";

describe("local authentication primitives", () => {
  it("normalizes email addresses deterministically", () => {
    expect(normalizeEmail("  Member@BlackWaterLeaf.COM ")).toBe("member@blackwaterleaf.com");
  });

  it("requires a minimum password length before hashing", () => {
    expect(validatePassword("short")).toBe("password_too_short");
    expect(validatePassword("this-password-is-long-enough")).toBeNull();
  });

  it("uses a salted scrypt hash and verifies only its original password", async () => {
    const password = "long-unique-password";
    const hash = await hashPassword(password);
    expect(hash).toMatch(/^scrypt\$16384\$8\$1\$/);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword("another-long-password", hash)).toBe(false);
  });

  it("creates opaque tokens that are persisted only as hashes", () => {
    const { token, tokenHash } = createOneTimeToken();
    expect(token).not.toContain(tokenHash);
    expect(tokenHash).toBe(hashOneTimeToken(token));
    expect(tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("bounds reset and verification token lifetimes", () => {
    const now = Date.UTC(2026, 8, 16, 12, 0, 0);
    expect(getTokenExpiry("password_reset", now).getTime() - now).toBe(60 * 60 * 1_000);
    expect(getTokenExpiry("email_verification", now).getTime() - now).toBe(24 * 60 * 60 * 1_000);
  });
});
