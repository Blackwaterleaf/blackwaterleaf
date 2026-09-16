import { TRPCError } from "@trpc/server";

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const signatures: Record<AllowedImageMimeType, (buffer: Buffer) => boolean> = {
  "image/jpeg": buffer => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  "image/png": buffer =>
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/webp": buffer =>
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP",
};

const extensions: Record<AllowedImageMimeType, "jpg" | "png" | "webp"> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function isAllowedImageMimeType(value: string): value is AllowedImageMimeType {
  return ALLOWED_IMAGE_MIME_TYPES.includes(value as AllowedImageMimeType);
}

export function validateImageUpload(base64: string, mimeType: string) {
  if (!isAllowedImageMimeType(mimeType)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "unsupported_image_type" });
  }

  const normalized = base64.replace(/^data:[^;]+;base64,/, "").trim();
  if (!normalized || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "invalid_image_encoding" });
  }

  const buffer = Buffer.from(normalized, "base64");
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
    throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "invalid_image_size" });
  }

  if (!signatures[mimeType](buffer)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "image_signature_mismatch" });
  }

  return {
    buffer,
    byteSize: buffer.length,
    extension: extensions[mimeType],
    mimeType,
  } as const;
}
