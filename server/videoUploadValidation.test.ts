import { describe, expect, it } from "vitest";
import { validateVideoUpload } from "./videoUploadValidation";

function encoded(bytes: number[]) {
  return Buffer.from(bytes).toString("base64");
}

describe("video upload validation", () => {
  it("accepts an MP4 ftyp signature", () => {
    const result = validateVideoUpload(encoded([0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]), "video/mp4");
    expect(result.extension).toBe("mp4");
  });

  it("accepts a WebM EBML signature", () => {
    const result = validateVideoUpload(encoded([0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x02]), "video/webm");
    expect(result.extension).toBe("webm");
  });

  it("rejects mismatched signatures and unsupported formats", () => {
    expect(() => validateVideoUpload(encoded([0, 1, 2, 3]), "video/mp4")).toThrow("video_signature_mismatch");
    expect(() => validateVideoUpload(encoded([0, 1, 2, 3]), "video/quicktime")).toThrow("unsupported_video_type");
  });
});
