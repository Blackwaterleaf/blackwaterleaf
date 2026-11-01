import { z } from "zod";

export const speciesIdentificationRealmSchema = z.enum([
  "botany",
  "aquarium",
  "terrarium",
]);

export const speciesIdentificationImageSchema = z
  .object({
    imageBase64: z.string().trim().min(1),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  })
  .strict();

export const speciesIdentifyInputSchema = z
  .object({
    clientRequestId: z.string().uuid(),
    images: z.array(speciesIdentificationImageSchema).min(1).max(3),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

export const speciesIdentificationCandidateSchema = z
  .object({
    scientificName: z.string().trim().min(1).max(160),
    commonNames: z.array(z.string().trim().min(1).max(160)).max(12),
    confidence: z.number().finite().min(0).max(100).nullable(),
    features: z.array(z.string().trim().min(1).max(500)).max(12),
    realm: speciesIdentificationRealmSchema,
  })
  .strict();

/**
 * The model may return no candidates when the submitted images do not permit a
 * sufficiently cautious identification. No fallback candidates are created.
 */
export const speciesIdentificationModelOutputSchema = z
  .object({
    candidates: z.array(speciesIdentificationCandidateSchema).max(3),
  })
  .strict();

export const speciesIdentificationResultSchema = z
  .object({
    usageId: z.number().int().positive(),
    candidates: z.array(speciesIdentificationCandidateSchema).max(3),
    disclaimer: z.string().min(1),
    model: z.string().min(1).max(96),
    xpAwarded: z.number().int().nonnegative(),
  })
  .strict();

export type SpeciesIdentificationInput = z.infer<
  typeof speciesIdentifyInputSchema
>;
export type SpeciesIdentificationCandidate = z.infer<
  typeof speciesIdentificationCandidateSchema
>;
export type SpeciesIdentificationModelOutput = z.infer<
  typeof speciesIdentificationModelOutputSchema
>;
export type SpeciesIdentificationResult = z.infer<
  typeof speciesIdentificationResultSchema
>;
