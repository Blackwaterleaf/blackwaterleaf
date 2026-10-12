import { TRPCError } from "@trpc/server";

export const ALLOWED_VIDEO_MIME_TYPES = ["video/mp4", "video/webm"] as const;
export type AllowedVideoMimeType = (typeof ALLOWED_VIDEO_MIME_TYPES)[number];
export const MAX_VIDEO_BYTES = 16 * 1024 * 1024;

function isAllowedVideoMimeType(value: string): value is AllowedVideoMimeType {
  return ALLOWED_VIDEO_MIME_TYPES.includes(value as AllowedVideoMimeType);
}

function hasMp4Signature(buffer: Buffer) {
  return buffer.length >= 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp";
}

function hasWebmSignature(buffer: Buffer) {
  return buffer.length >= 4 && buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
}

export function validateVideoUpload(base64: string, mimeType: string) {
  if (!isAllowedVideoMimeType(mimeType)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "unsupported_video_type" });
  }
  const normalized = base64.replace(/^data:[^;]+;base64,/, "").trim();
  if (!normalized || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "invalid_video_encoding" });
  }
  const buffer = Buffer.from(normalized, "base64");
  if (buffer.length === 0 || buffer.length > MAX_VIDEO_BYTES) {
    throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "invalid_video_size" });
  }
  const validSignature = mimeType === "video/mp4" ? hasMp4Signature(buffer) : hasWebmSignature(buffer);
  if (!validSignature) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "video_signature_mismatch" });
  }
  return {
    buffer,
    byteSize: buffer.length,
    extension: mimeType === "video/mp4" ? "mp4" : "webm",
    mimeType,
  } as const;
}
