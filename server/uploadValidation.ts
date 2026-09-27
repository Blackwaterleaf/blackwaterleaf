import { TRPCError } from "@trpc/server";

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

const MAX_IMAGE_BYTES = 24 * 1024 * 1024;

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

function normalizeImageMimeType(value: string): AllowedImageMimeType | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "image/jpg" || normalized === "image/pjpeg" || normalized === "image/jfif") return "image/jpeg";
  return ALLOWED_IMAGE_MIME_TYPES.includes(normalized as AllowedImageMimeType) ? normalized as AllowedImageMimeType : null;
}

function stripJpegMetadata(buffer: Buffer): Buffer {
  const output: Buffer[] = [buffer.subarray(0, 2)];
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return buffer;
    const marker = buffer[offset + 1];
    if (marker === 0xda || marker === 0xd9) {
      output.push(buffer.subarray(offset));
      return Buffer.concat(output);
    }
    if (marker === 0x00 || (marker >= 0xd0 && marker <= 0xd7)) {
      output.push(buffer.subarray(offset, offset + 2));
      offset += 2;
      continue;
    }
    if (offset + 4 > buffer.length) return buffer;
    const segmentLength = buffer.readUInt16BE(offset + 2);
    const segmentEnd = offset + 2 + segmentLength;
    if (segmentEnd > buffer.length) return buffer;
    // Retain all image-bearing JPEG segments (DQT, DHT, SOF, SOS, etc.) and
    // discard only application metadata plus comments. Earlier logic kept only
    // APP0, which also removed indispensable frame/quantization segments.
    const removableMetadata = (marker >= 0xe1 && marker <= 0xef) || marker === 0xfe;
    if (!removableMetadata) output.push(buffer.subarray(offset, segmentEnd));
    offset = segmentEnd;
  }
  return Buffer.concat(output);
}

function stripPngMetadata(buffer: Buffer): Buffer {
  const output: Buffer[] = [buffer.subarray(0, 8)];
  let offset = 8;
  const removable = new Set(["eXIf", "tEXt", "zTXt", "iTXt", "pHYs"]);
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const end = offset + 12 + length;
    if (end > buffer.length) return buffer;
    if (!removable.has(type)) output.push(buffer.subarray(offset, end));
    offset = end;
    if (type === "IEND") break;
  }
  return Buffer.concat(output);
}

function stripWebpMetadata(buffer: Buffer): Buffer {
  const output: Buffer[] = [buffer.subarray(0, 12)];
  let offset = 12;
  const removable = new Set(["EXIF", "XMP "]);
  while (offset + 8 <= buffer.length) {
    const type = buffer.subarray(offset, offset + 4).toString("ascii");
    const size = buffer.readUInt32LE(offset + 4);
    const end = offset + 8 + size + (size % 2);
    if (end > buffer.length) return buffer;
    if (!removable.has(type)) output.push(buffer.subarray(offset, end));
    offset = end;
  }
  return Buffer.concat(output);
}

export function stripImageMetadata(buffer: Buffer, mimeType: AllowedImageMimeType): Buffer {
  if (mimeType === "image/jpeg") return stripJpegMetadata(buffer);
  if (mimeType === "image/png") return stripPngMetadata(buffer);
  return stripWebpMetadata(buffer);
}

export function validateImageUpload(base64: string, mimeType: string) {
  const normalizedMimeType = normalizeImageMimeType(mimeType);
  if (!normalizedMimeType) {
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

  if (!signatures[normalizedMimeType](buffer)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "image_signature_mismatch" });
  }

  const sanitizedBuffer = stripImageMetadata(buffer, normalizedMimeType);
  return {
    buffer: sanitizedBuffer,
    byteSize: sanitizedBuffer.length,
    extension: extensions[normalizedMimeType],
    mimeType: normalizedMimeType,
  } as const;
}
