/**
 * SECURITY FIX: MIME-Type Validierung via Magic Bytes (file-type)
 * Verhindert, dass ausführbarer Code als Bild/Video getarnt hochgeladen wird.
 * Vertraut NICHT der Dateiendung oder dem vom Client gesendeten MIME-Type.
 */
import { fileTypeFromBuffer } from "file-type";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
];

export async function validateFileType(
  buffer: Buffer,
  expectedCategory: "image" | "video"
): Promise<{ valid: boolean; detectedType: string | null }> {
  const result = await fileTypeFromBuffer(buffer);
  if (!result) return { valid: false, detectedType: null };

  const allowed =
    expectedCategory === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;

  return {
    valid: allowed.includes(result.mime),
    detectedType: result.mime,
  };
}
