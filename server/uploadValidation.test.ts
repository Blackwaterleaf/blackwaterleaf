import { describe, expect, it } from "vitest";
import { stripImageMetadata, validateImageUpload } from "./uploadValidation";

const MINIMAL_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString("base64");
const MINIMAL_JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xd9]).toString("base64");
const MINIMAL_WEBP = Buffer.from("RIFF\0\0\0\0WEBP", "ascii").toString("base64");

describe("partner product image validation", () => {
  it("accepts only an allowed MIME type with a matching binary signature", () => {
    expect(validateImageUpload(MINIMAL_PNG, "image/png")).toMatchObject({ extension: "png", mimeType: "image/png", byteSize: 8 });
    expect(validateImageUpload(MINIMAL_JPEG, "image/jpeg")).toMatchObject({ extension: "jpg", mimeType: "image/jpeg" });
    expect(validateImageUpload(MINIMAL_JPEG, "image/jpg")).toMatchObject({ extension: "jpg", mimeType: "image/jpeg" });
    expect(validateImageUpload(MINIMAL_WEBP, "image/webp")).toMatchObject({ extension: "webp", mimeType: "image/webp" });
  });

  it("rejects unapproved MIME types, malformed payloads and signature forgery", () => {
    expect(() => validateImageUpload(MINIMAL_PNG, "image/gif")).toThrow("unsupported_image_type");
    expect(() => validateImageUpload("not base64!", "image/png")).toThrow("invalid_image_encoding");
    expect(() => validateImageUpload(MINIMAL_JPEG, "image/png")).toThrow("image_signature_mismatch");
  });

  it("rejects files beyond the server-side twenty-four megabyte limit", () => {
    const tooLarge = Buffer.alloc(24 * 1024 * 1024 + 1, 0);
    tooLarge.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(() => validateImageUpload(tooLarge.toString("base64"), "image/png")).toThrow("invalid_image_size");
  });

  it("removes JPEG EXIF application segments before storage", () => {
    const jpegWithExif = Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0xff, 0xd9]);
    const sanitized = stripImageMetadata(jpegWithExif, "image/jpeg");
    expect(sanitized.includes(Buffer.from("Exif"))).toBe(false);
    expect(sanitized.subarray(0, 2).equals(Buffer.from([0xff, 0xd8]))).toBe(true);
  });

  it("preserves essential JPEG frame and quantization segments while removing metadata", () => {
    const jpeg = Buffer.from([
      0xff, 0xd8,
      0xff, 0xdb, 0x00, 0x04, 0x01, 0x02,
      0xff, 0xc0, 0x00, 0x04, 0x03, 0x04,
      0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
      0xff, 0xd9,
    ]);
    const sanitized = stripImageMetadata(jpeg, "image/jpeg");
    expect(sanitized.includes(Buffer.from([0xff, 0xdb]))).toBe(true);
    expect(sanitized.includes(Buffer.from([0xff, 0xc0]))).toBe(true);
    expect(sanitized.includes(Buffer.from("Exif"))).toBe(false);
  });

  it("removes PNG text and physical-location metadata chunks", () => {
    const chunk = Buffer.from([0x00, 0x00, 0x00, 0x04, 0x74, 0x45, 0x58, 0x74, 0x67, 0x70, 0x73, 0x00, 0, 0, 0, 0]);
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk, Buffer.from([0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0, 0, 0, 0])]);
    const sanitized = stripImageMetadata(png, "image/png");
    expect(sanitized.includes(Buffer.from("tEXt"))).toBe(false);
    expect(sanitized.includes(Buffer.from("gps"))).toBe(false);
  });
});
