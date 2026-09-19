const CLIENT_IMAGE_LIMIT_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2400;
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

async function resizeImage(file: File, maxDimension: number, quality: number, fallbackMimeType: AllowedImageType): Promise<{ blob: Blob; mimeType: AllowedImageType }> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return { blob: file, mimeType: fallbackMimeType };
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return { blob: file, mimeType: fallbackMimeType };
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) return { blob: file, mimeType: fallbackMimeType };
  return { blob, mimeType: "image/jpeg" };
}

export async function readImageAsBase64(file: File, options: { forAnalysis?: boolean } = {}): Promise<{ base64: string; mimeType: string }> {
  const mimeType = imageMimeType(file);
  if (!mimeType) throw new Error("unsupported_image_type");
  if (file.size <= 0) throw new Error("image_size_invalid");
  const forAnalysis = options.forAnalysis === true;
  const prepared = forAnalysis || file.size > CLIENT_IMAGE_LIMIT_BYTES
    ? await resizeImage(file, forAnalysis ? ANALYSIS_IMAGE_DIMENSION : MAX_IMAGE_DIMENSION, forAnalysis ? 0.82 : 0.86, mimeType)
    : { blob: file, mimeType };
  if (prepared.blob.size > CLIENT_IMAGE_LIMIT_BYTES) throw new Error("image_too_large_after_resize");
  const dataUrl = await fileToDataUrl(prepared.blob);
  const base64 = dataUrl.split(",", 2)[1];
  if (!base64) throw new Error("image_read_failed");
  return { base64, mimeType: prepared.mimeType };
}

export function imageErrorMessage(error: unknown, locale: "de" | "en" = "de") {
  const code = error instanceof Error ? error.message : "";
  const german: Record<string, string> = {
    unsupported_image_type: "Bitte wähle ein JPG-, PNG- oder WebP-Bild.",
    image_size_invalid: "Das Bild konnte nicht gelesen werden.",
    image_too_large_after_resize: "Das Bild ist auch nach der Verkleinerung zu groß. Bitte wähle ein kleineres Foto.",
    image_read_failed: "Das Bild konnte nicht gelesen werden. Bitte versuche es erneut.",
    invalid_image_size: "Das Bild ist zu groß oder leer. Erlaubt sind JPG, PNG oder WebP bis 8 MB.",
    image_signature_mismatch: "Die Bilddatei passt nicht zu ihrem Dateiformat. Bitte speichere sie erneut als JPG, PNG oder WebP.",
    media_processing_consent_required: "Für den Bildupload ist deine ausdrückliche Bildverarbeitungsfreigabe erforderlich.",
  };
  const english: Record<string, string> = {
    unsupported_image_type: "Choose a JPG, PNG, or WebP image.",
    image_size_invalid: "The image could not be read.",
    image_too_large_after_resize: "The image is still too large after resizing. Choose a smaller photo.",
    image_read_failed: "The image could not be read. Please try again.",
    invalid_image_size: "The image is too large or empty. JPG, PNG, and WebP up to 8 MB are supported.",
    image_signature_mismatch: "The image data does not match its file type. Save it again as JPG, PNG, or WebP.",
    media_processing_consent_required: "Explicit image-processing consent is required for uploads.",
  };
  return (locale === "de" ? german : english)[code] ?? (locale === "de" ? "Das Bild konnte nicht verarbeitet werden." : "The image could not be processed.");
}
