import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const files = readFileSync(resolve(root, "client/src/lib/files.ts"), "utf8");
const assistant = readFileSync(resolve(root, "client/src/pages/Assistant.tsx"), "utf8");
const community = readFileSync(resolve(root, "client/src/pages/Community.tsx"), "utf8");
const realm = readFileSync(resolve(root, "client/src/pages/Realm.tsx"), "utf8");

describe("mobile image upload contract", () => {
  it("resizes oversized phone photos before enforcing the server upload limit", () => {
    expect(files).toContain("CLIENT_IMAGE_LIMIT_BYTES = 32 * 1024 * 1024");
    expect(files).toContain("MAX_IMAGE_DIMENSION = 3200");
    expect(files).toContain("ANALYSIS_IMAGE_DIMENSION = 1800");
    expect(files).toContain('canvas.toBlob(resolve, "image/jpeg", quality)');
    expect(files).toContain("image_too_large_after_resize");
  });

  it("does not reject valid large phone photos before the resize helper runs", () => {
    expect(assistant).not.toContain("file.size > 8 * 1024 * 1024");
    expect(assistant).toContain("plantFiles.map(file => readImageAsBase64(file, { forAnalysis: true }))");
    expect(assistant).toContain("additionalImages");
    expect(assistant).toContain("niemals nach einem 4er-Raster");
  });

  it("maps raw upload errors to readable localized messages in every upload flow", () => {
    for (const source of [community, realm, assistant]) expect(source).toContain("imageErrorMessage");
    expect(files).toContain("Das Bild konnte nicht verarbeitet werden.");
  });

  it("handles Android image MIME gaps by a safe extension fallback and gives the composer a visible destination", () => {
    expect(files).toContain("function imageMimeType(file: File)");
    expect(files).toContain('if (declared === "image/jpg") return "image/jpeg";');
    expect(files).toContain('if (extension === "jpg" || extension === "jpeg") return "image/jpeg";');
    expect(community).toContain("composeRef.current?.scrollIntoView");
    expect(community).toContain("Bild optional auswählen");
  });

  it("has an HTMLImageElement fallback when createImageBitmap is unavailable", () => {
    expect(files).toContain('typeof createImageBitmap === "function"');
    expect(files).toContain("URL.createObjectURL(file)");
    expect(files).toContain("next.onerror = () => resolve(null)");
    expect(files).toContain('context.drawImage(source');
  });

  it("normalizes original WebP uploads before sending them to the server", () => {
    expect(files).toContain('mimeType === "image/webp"');
    expect(community).toContain("SICHER HOCHLADEN");
  });

  it("uses a bounded original-file fallback when Samsung canvas processing fails", () => {
    for (const token of ["originalFallback", "image_decode_failed", "image_resize_failed", "context.imageSmoothingQuality = \"high\""]) expect(files).toContain(token);
  });
});
