import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { isActiveAccountWithRole, isSessionPayloadBoundToApp, sameOriginMutationGuard } from "./security";
import { validateImageUpload } from "./uploadValidation";

function runGuard(headers: Record<string, string>, method = "POST") {
  const req = {
    method,
    header: (name: string) => headers[name.toLowerCase()],
  } as Request;
  const status = vi.fn().mockReturnThis();
  const json = vi.fn().mockReturnThis();
  const res = { status, json } as unknown as Response;
  const next = vi.fn() as NextFunction;

  sameOriginMutationGuard(req, res, next);
  return { status, json, next };
}

describe("sameOriginMutationGuard", () => {
  it("allows same-origin browser mutations", () => {
    const result = runGuard({ host: "app.example", origin: "https://app.example" });
    expect(result.next).toHaveBeenCalledOnce();
  });

  it("rejects cross-origin cookie mutations", () => {
    const result = runGuard({ host: "app.example", origin: "https://attacker.example" });
    expect(result.status).toHaveBeenCalledWith(403);
    expect(result.next).not.toHaveBeenCalled();
  });

  it("allows bearer-authenticated native mutations without Origin", () => {
    const result = runGuard({ host: "app.example", authorization: "Bearer verified-token" });
    expect(result.next).toHaveBeenCalledOnce();
  });
});

describe("isSessionPayloadBoundToApp", () => {
  it("accepts only complete sessions for the configured application", () => {
    expect(
      isSessionPayloadBoundToApp(
        { openId: "account_1", appId: "blackwaterleaf", name: "Account" },
        "blackwaterleaf",
      ),
    ).toBe(true);
    expect(
      isSessionPayloadBoundToApp(
        { openId: "account_1", appId: "different-app", name: "Account" },
        "blackwaterleaf",
      ),
    ).toBe(false);
  });
});

describe("isActiveAccountWithRole", () => {
  it("requires both an active status and an allowed database role", () => {
    expect(isActiveAccountWithRole({ status: "active", role: "moderator" }, ["moderator", "admin"])).toBe(true);
    expect(isActiveAccountWithRole({ status: "suspended", role: "admin" }, ["admin"])).toBe(false);
    expect(isActiveAccountWithRole({ status: "active", role: "user" }, ["admin"])).toBe(false);
  });
});

describe("validateImageUpload", () => {
  it("accepts a correctly signed PNG and preserves byte size", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    const result = validateImageUpload(png.toString("base64"), "image/png");
    expect(result.extension).toBe("png");
    expect(result.byteSize).toBe(png.length);
  });

  it("rejects a declared image whose bytes have a different signature", () => {
    const text = Buffer.from("not an image");
    expect(() => validateImageUpload(text.toString("base64"), "image/png")).toThrow("image_signature_mismatch");
  });

  it("rejects executable MIME types", () => {
    const executable = Buffer.from("MZ");
    expect(() => validateImageUpload(executable.toString("base64"), "application/x-msdownload")).toThrow(
      "unsupported_image_type",
    );
  });
});
