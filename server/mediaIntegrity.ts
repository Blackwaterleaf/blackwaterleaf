import type { MediaAssetRecord } from "../drizzle/schema";

export type MediaContextInput = Pick<MediaAssetRecord, "kind" | "observationId" | "postId" | "habitatId">;

/** Rejects inconsistent polymorphic media contexts before storage metadata is written. */
export function hasValidMediaContext(input: MediaContextInput): boolean {
  if (input.kind === "avatar") return input.observationId === null && input.postId === null && input.habitatId === null;
  if (input.kind === "observation_image") return input.observationId !== null && input.postId === null && input.habitatId === null;
  if (input.kind === "post_image" || input.kind === "post_video") return input.observationId === null && input.postId !== null && input.habitatId === null;
  if (input.kind === "habitat_image") return input.observationId === null && input.postId === null && input.habitatId !== null;
  return false;
}

export function assertValidMediaContext(input: MediaContextInput): void {
  if (!hasValidMediaContext(input)) throw new Error("invalid_media_context");
}
