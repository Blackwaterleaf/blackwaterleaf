const CLIENT_IMAGE_LIMIT_BYTES = 24 * 1024 * 1024;
const CLIENT_VIDEO_LIMIT_BYTES = 16 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 4000;
const ANALYSIS_IMAGE_DIMENSION = 1800;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
type AllowedImageType = "image/jpeg" | "image/png" | "image/webp";

function imageMimeType(file: File): AllowedImageType | null {
  const declared = file.type.trim().toLowerCase();
  if (declared === "image/jpg") return "image/jpeg";
  if (ALLOWED_IMAGE_TYPES.has(declared)) return declared as AllowedImageType;
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return null;
}

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("image_read_failed"));
    reader.readAsDataURL(file);
  });
}

export type ImageAspect = "original" | "9:16" | "4:5" | "1:1" | "16:9";
async function resizeImage(file: File, maxDimension: number, quality: number, fallbackMimeType: AllowedImageType, aspectRatio: ImageAspect = "original"): Promise<{ blob: Blob; mimeType: AllowedImageType }> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return { blob: file, mimeType: fallbackMimeType };
  const targetRatio = aspectRatio === "original" ? bitmap.width / bitmap.height : ({ "9:16": 9 / 16, "4:5": 4 / 5, "1:1": 1, "16:9": 16 / 9 } as const)[aspectRatio];
  const sourceRatio = bitmap.width / bitmap.height;
  const cropWidth = sourceRatio > targetRatio ? Math.round(bitmap.height * targetRatio) : bitmap.width;
  const cropHeight = sourceRatio > targetRatio ? bitmap.height : Math.round(bitmap.width / targetRatio);
  const scale = Math.min(1, maxDimension / Math.max(cropWidth, cropHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(cropWidth * scale));
  canvas.height = Math.max(1, Math.round(cropHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) return { blob: file, mimeType: fallbackMimeType };
  context.drawImage(bitmap, Math.round((bitmap.width - cropWidth) / 2), Math.round((bitmap.height - cropHeight) / 2), cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) return { blob: file, mimeType: fallbackMimeType };
  return { blob, mimeType: "image/jpeg" };
}

type ImagePreparationOptions = { forAnalysis?: boolean; aspectRatio?: ImageAspect; quality?: number };
async function prepareImage(file: File, options: ImagePreparationOptions = {}): Promise<{ blob: Blob; mimeType: AllowedImageType }> {
  const mimeType = imageMimeType(file);
  if (!mimeType) throw new Error("unsupported_image_type");
  if (file.size <= 0) throw new Error("image_size_invalid");
  const forAnalysis = options.forAnalysis === true;
  const quality = Math.min(1, Math.max(0.5, options.quality ?? (forAnalysis ? 0.82 : 0.92)));
  return forAnalysis || file.size > CLIENT_IMAGE_LIMIT_BYTES || quality < 0.99 || options.aspectRatio && options.aspectRatio !== "original"
    ? await resizeImage(file, forAnalysis ? ANALYSIS_IMAGE_DIMENSION : MAX_IMAGE_DIMENSION, quality, mimeType, options.aspectRatio)
    : { blob: file, mimeType };
}

export async function estimateImageBytes(file: File, options: ImagePreparationOptions = {}): Promise<number> {
  return (await prepareImage(file, options)).blob.size;
}

export async function readImageAsBase64(file: File, options: ImagePreparationOptions = {}): Promise<{ base64: string; mimeType: string }> {
  const prepared = await prepareImage(file, options);
  if (prepared.blob.size > CLIENT_IMAGE_LIMIT_BYTES) throw new Error("image_too_large_after_resize");
  const dataUrl = await fileToDataUrl(prepared.blob);
  const base64 = dataUrl.split(",", 2)[1];
  if (!base64) throw new Error("image_read_failed");
  return { base64, mimeType: prepared.mimeType };
}

export async function readVideoAsBase64(file: File): Promise<{ base64: string; mimeType: "video/mp4" | "video/webm" }> {
  const declared = file.type.trim().toLowerCase();
  const extension = file.name.split(".").pop()?.toLowerCase();
  const mimeType = declared === "video/webm" || extension === "webm" ? "video/webm" : declared === "video/mp4" || extension === "mp4" ? "video/mp4" : null;
  if (!mimeType) throw new Error("unsupported_video_type");
  if (file.size <= 0 || file.size > CLIENT_VIDEO_LIMIT_BYTES) throw new Error("video_too_large");
  const dataUrl = await fileToDataUrl(file);
  const base64 = dataUrl.split(",", 2)[1];
  if (!base64) throw new Error("video_read_failed");
  return { base64, mimeType };
}

export function imageErrorMessage(error: unknown, locale: AppLocale = "de") {
  const rawCode = error instanceof Error ? error.message : "";
  const code = rawCode.split(":").pop()?.trim() ?? rawCode;
  const german: Record<string, string> = {
    unsupported_image_type: "Bitte wähle ein JPG-, PNG- oder WebP-Bild.",
    image_size_invalid: "Das Bild konnte nicht gelesen werden.",
    image_too_large_after_resize: "Das Bild ist auch nach der Verkleinerung zu groß. Bitte wähle ein kleineres Foto.",
    image_read_failed: "Das Bild konnte nicht gelesen werden. Bitte versuche es erneut.",
    invalid_image_size: "Das Bild ist zu groß oder leer. Erlaubt sind JPG, PNG oder WebP bis 24 MB.",
    image_signature_mismatch: "Die Bilddatei passt nicht zu ihrem Dateiformat. Bitte speichere sie erneut als JPG, PNG oder WebP.",
    media_processing_consent_required: "Für den Bildupload ist deine ausdrückliche Bildverarbeitungsfreigabe erforderlich.",
    unsupported_video_type: "Bitte wähle ein MP4- oder WebM-Video.",
    video_too_large: "Das Video ist zu groß. Erlaubt sind MP4 oder WebM bis 16 MB.",
    video_read_failed: "Das Video konnte nicht gelesen werden. Bitte versuche es erneut.",
    video_signature_mismatch: "Die Videodatei passt nicht zu ihrem Dateiformat.",
    one_video_per_post: "Pro Beitrag ist nur ein Video erlaubt.",
  };
  const english: Record<string, string> = {
    unsupported_image_type: "Choose a JPG, PNG, or WebP image.",
    image_size_invalid: "The image could not be read.",
    image_too_large_after_resize: "The image is still too large after resizing. Choose a smaller photo.",
    image_read_failed: "The image could not be read. Please try again.",
    invalid_image_size: "The image is too large or empty. JPG, PNG, and WebP up to 24 MB are supported.",
    image_signature_mismatch: "The image data does not match its file type. Save it again as JPG, PNG, or WebP.",
    media_processing_consent_required: "Explicit image-processing consent is required for uploads.",
    unsupported_video_type: "Choose an MP4 or WebM video.",
    video_too_large: "The video is too large. MP4 or WebM up to 16 MB is supported.",
    video_read_failed: "The video could not be read. Please try again.",
    video_signature_mismatch: "The video data does not match its file type.",
    one_video_per_post: "Only one video is allowed per post.",
  };
  return (locale === "de" ? german : english)[code] ?? (locale === "de" ? "Das Bild konnte nicht verarbeitet werden." : "The image could not be processed.");
}
import type { AppLocale } from "@/i18n";
