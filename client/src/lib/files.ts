const CLIENT_IMAGE_LIMIT_BYTES = 32 * 1024 * 1024;
const CLIENT_VIDEO_LIMIT_BYTES = 16 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 3200;
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
  let bitmap: ImageBitmap | null = null;
  let source: CanvasImageSource | null = null;
  let sourceWidth = 0;
  let sourceHeight = 0;
  let objectUrl: string | null = null;
  const cleanup = () => {
    try { bitmap?.close(); } catch { /* Android can close an already-released bitmap. */ }
    bitmap = null;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  };
  const originalFallback = (errorCode: "image_decode_failed" | "image_resize_failed") => {
    cleanup();
    if (file.size <= CLIENT_IMAGE_LIMIT_BYTES) return { blob: file, mimeType: fallbackMimeType };
    throw new Error(errorCode);
  };
  try {
    if (typeof createImageBitmap === "function") {
      bitmap = await createImageBitmap(file).catch(() => null);
      source = bitmap;
      sourceWidth = bitmap?.width ?? 0;
      sourceHeight = bitmap?.height ?? 0;
    }
    if (!source) {
      objectUrl = URL.createObjectURL(file);
      const image = await new Promise<HTMLImageElement | null>(resolve => {
        const next = new Image();
        next.onload = () => resolve(next);
        next.onerror = () => resolve(null);
        next.src = objectUrl!;
      });
      source = image;
      sourceWidth = image?.naturalWidth ?? 0;
      sourceHeight = image?.naturalHeight ?? 0;
    }
    if (!source || sourceWidth <= 0 || sourceHeight <= 0) return originalFallback("image_decode_failed");
    const targetRatio = aspectRatio === "original" ? sourceWidth / sourceHeight : ({ "9:16": 9 / 16, "4:5": 4 / 5, "1:1": 1, "16:9": 16 / 9 } as const)[aspectRatio];
    const sourceRatio = sourceWidth / sourceHeight;
    const cropWidth = sourceRatio > targetRatio ? Math.round(sourceHeight * targetRatio) : sourceWidth;
    const cropHeight = sourceRatio > targetRatio ? sourceHeight : Math.round(sourceWidth / targetRatio);
    const scale = Math.min(1, maxDimension / Math.max(cropWidth, cropHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(cropWidth * scale));
    canvas.height = Math.max(1, Math.round(cropHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) return originalFallback("image_resize_failed");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(source, Math.round((sourceWidth - cropWidth) / 2), Math.round((sourceHeight - cropHeight) / 2), cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
    cleanup();
    if (!blob) return originalFallback("image_resize_failed");
    return { blob, mimeType: "image/jpeg" };
  } catch {
    return originalFallback("image_resize_failed");
  }
}

type ImagePreparationOptions = { forAnalysis?: boolean; aspectRatio?: ImageAspect; quality?: number };
async function prepareImage(file: File, options: ImagePreparationOptions = {}): Promise<{ blob: Blob; mimeType: AllowedImageType }> {
  const mimeType = imageMimeType(file);
  if (!mimeType) throw new Error("unsupported_image_type");
  if (file.size <= 0) throw new Error("image_size_invalid");
  const forAnalysis = options.forAnalysis === true;
  const quality = Math.min(1, Math.max(0.5, options.quality ?? (forAnalysis ? 0.82 : 0.92)));
  // Keep JPEG/PNG originals lossless, but normalize WEBP before sending it to
  // the server. Some Android/Samsung WebViews report WEBP correctly while
  // their multipart/base64 path still produces a payload the server cannot
  // reliably validate.
  return forAnalysis || mimeType === "image/webp" || file.size > CLIENT_IMAGE_LIMIT_BYTES || quality < 0.99 || options.aspectRatio && options.aspectRatio !== "original"
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
  const rawLower = rawCode.toLowerCase();
  if (rawLower.includes("storage") || rawLower.includes("presign") || rawLower.includes("s3") || rawLower.includes("forge")) {
    return locale === "de" ? "Der Bildspeicher ist momentan nicht erreichbar. Bitte prüfe deine Verbindung und versuche es erneut." : "Image storage is currently unavailable. Check your connection and try again.";
  }
  if (rawLower.includes("fetch failed") || rawLower.includes("network") || rawLower.includes("unreachable") || rawLower.includes("failed to fetch")) {
    return locale === "de" ? "Der BlackWaterLeaf-Server ist momentan nicht erreichbar. Bitte versuche es in wenigen Sekunden erneut." : "The BlackWaterLeaf server is currently unreachable. Please try again in a few seconds.";
  }
  const code = rawCode.split(":").pop()?.trim() ?? rawCode;
  const german: Record<string, string> = {
    unsupported_image_type: "Bitte wähle ein JPG-, PNG- oder WebP-Bild.",
    image_size_invalid: "Das Bild konnte nicht gelesen werden.",
    image_too_large_after_resize: "Das Bild ist auch nach der Verkleinerung zu groß. Bitte wähle ein kleineres Foto.",
    image_decode_failed: "Das Bildformat konnte auf diesem Gerät nicht gelesen werden. Bitte speichere es erneut als JPG und versuche es noch einmal.",
    image_resize_failed: "Das Foto konnte auf diesem Gerät nicht verkleinert werden. Es wird bis 32 MB im Original unterstützt – bitte wähle bei größeren Fotos eine niedrigere Qualität.",
    image_read_failed: "Das Bild konnte nicht gelesen werden. Bitte versuche es erneut.",
    invalid_image_encoding: "Die Bildübertragung war unvollständig. Bitte versuche den Upload erneut.",
    invalid_image_size: "Das Bild ist zu groß oder leer. Erlaubt sind JPG, PNG oder WebP bis 32 MB.",
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
    image_decode_failed: "This device could not read the image format. Save it as JPG and try again.",
    image_resize_failed: "This device could not resize the photo. Original files up to 32 MB are supported; use a lower quality for larger photos.",
    image_read_failed: "The image could not be read. Please try again.",
    invalid_image_encoding: "The image upload was incomplete. Please try again.",
    invalid_image_size: "The image is too large or empty. JPG, PNG, and WebP up to 32 MB are supported.",
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
