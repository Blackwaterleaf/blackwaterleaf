import { describe, expect, it } from "vitest";
import { validateImageUpload } from "./uploadValidation";

const MINIMAL_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString("base64");
const MINIMAL_JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xd9]).toString("base64");
const MINIMAL_WEBP = Buffer.from("RIFF\0\0\0\0WEBP", "ascii").toString("base64");

describe("partner product image validation", () => {
  it("accepts only an allowed MIME type with a matching binary signature", () => {
    expect(validateImageUpload(MINIMAL_PNG, "image/png")).toMatchObject({ extension: "png", mimeType: "image/png", byteSize: 8 });
    expect(validateImageUpload(MINIMAL_JPEG, "image/jpeg")).toMatchObject({ extension: "jpg", mimeType: "image/jpeg" });
    expect(validateImageUpload(MINIMAL_WEBP, "image/webp")).toMatchObject({ extension: "webp", mimeType: "image/webp" });
  });

  it("rejects unapproved MIME types, malformed payloads and signature forgery", () => {
    expect(() => validateImageUpload(MINIMAL_PNG, "image/gif")).toThrow("unsupported_image_type");
    expect(() => validateImageUpload("not base64!", "image/png")).toThrow("invalid_image_encoding");
    expect(() => validateImageUpload(MINIMAL_JPEG, "image/png")).toThrow("image_signature_mismatch");
  });

  it("rejects files beyond the server-side eight megabyte limit", () => {
    const tooLarge = Buffer.alloc(8 * 1024 * 1024 + 1, 0);
    tooLarge.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(() => validateImageUpload(tooLarge.toString("base64"), "image/png")).toThrow("invalid_image_size");
  });
});
