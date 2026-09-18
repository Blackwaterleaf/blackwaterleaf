const CLIENT_IMAGE_LIMIT_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function readImageAsBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("unsupported_image_type");
  }
  if (file.size <= 0 || file.size > CLIENT_IMAGE_LIMIT_BYTES) {
    throw new Error("image_size_invalid");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("image_read_failed"));
    reader.readAsDataURL(file);
  });

  const base64 = dataUrl.split(",", 2)[1];
  if (!base64) throw new Error("image_read_failed");
  return { base64, mimeType: file.type };
}
