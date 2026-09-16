import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { partnerAuthorizations, partnerPlacements, partnerProducts, partnerProfiles } from "../../drizzle/schema";
import { partnerProductInputSchema } from "../../shared/blackwaterleaf-contract-v1";
import { appendAuditEntry } from "../auditLedger";
import { getDb } from "../db";
import { storageGetSignedUrl, storagePut } from "../storage";
import { validateImageUpload } from "../uploadValidation";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

const partnerStatus = z.enum(["draft", "approved", "paused", "removed"]);
const placementStatus = z.enum(["draft", "active", "paused", "expired", "removed"]);
const productStatus = z.enum(["draft", "active", "paused", "removed"]);
const authorizationState = z.enum(["granted", "revoked"]);
const dateTimeInput = z.string().datetime({ offset: true }).nullish();
const securedUrl = z
  .string()
  .max(500)
  .refine(value => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "https_url_required");

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

type Database = Awaited<ReturnType<typeof requireDatabase>>;

async function getPartner(db: Database, partnerId: number) {
  const [partner] = await db.select().from(partnerProfiles).where(eq(partnerProfiles.id, partnerId)).limit(1);
  if (!partner) throw new TRPCError({ code: "NOT_FOUND", message: "partner_not_found" });
  return partner;
}

async function getLatestAuthorizations(db: Database) {
  const events = await db
    .select({ partnerId: partnerAuthorizations.partnerId, state: partnerAuthorizations.state, authorizationVersion: partnerAuthorizations.authorizationVersion, createdAt: partnerAuthorizations.createdAt, id: partnerAuthorizations.id })
    .from(partnerAuthorizations)
    .orderBy(desc(partnerAuthorizations.createdAt), desc(partnerAuthorizations.id));
  const latest = new Map<number, (typeof events)[number]>();
  for (const event of events) if (!latest.has(event.partnerId)) latest.set(event.partnerId, event);
  return latest;
}

function resolveDate(value: string | null | undefined, current: Date | null) {
  if (value === undefined) return current;
  return value ? new Date(value) : null;
}

function validatePlacementWindow(startsAt: Date | null, endsAt: Date | null, status: z.infer<typeof placementStatus>) {
  if (startsAt && endsAt && startsAt >= endsAt) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "partner_placement_end_must_follow_start" });
  }
  if (status === "active" && endsAt && endsAt.getTime() <= Date.now()) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "partner_placement_end_must_be_future" });
  }
}

async function canPublishPartnerProducts(db: Database, partnerId: number) {
  const partner = await getPartner(db, partnerId);
  const latestAuthorizations = await getLatestAuthorizations(db);
  const [placement] = await db
    .select()
    .from(partnerPlacements)
    .where(and(eq(partnerPlacements.partnerId, partnerId), eq(partnerPlacements.placement, "home")))
    .limit(1);
  if (!placement) return false;
  return canActivatePartnerProduct({
    partnerStatus: partner.status,
    authorizationState: latestAuthorizations.get(partnerId)?.state ?? "missing",
    placementStatus: placement.status,
    startsAt: placement.startsAt,
    endsAt: placement.endsAt,
    now: Date.now(),
  });
}

export function hasActivePartnerPublication(input: {
  partnerStatus: z.infer<typeof partnerStatus>;
  authorizationState: z.infer<typeof authorizationState> | "missing";
  placementStatus: z.infer<typeof placementStatus>;
  startsAt: Date | null;
  endsAt: Date | null;
  now: number;
}): boolean {
  return input.partnerStatus === "approved"
    && input.authorizationState === "granted"
    && input.placementStatus === "active"
    && (!input.startsAt || input.startsAt.getTime() <= input.now)
    && (!input.endsAt || input.endsAt.getTime() >= input.now);
}

export function canActivatePartnerProduct(input: {
  partnerStatus: z.infer<typeof partnerStatus>;
  authorizationState: z.infer<typeof authorizationState> | "missing";
  placementStatus: z.infer<typeof placementStatus>;
  startsAt: Date | null;
  endsAt: Date | null;
  now: number;
}): boolean {
  return hasActivePartnerPublication(input);
}

export function isPublicPartnerProduct(input: {
  productStatus: z.infer<typeof productStatus>;
  partnerStatus: z.infer<typeof partnerStatus>;
  authorizationState: z.infer<typeof authorizationState> | "missing";
  placementStatus: z.infer<typeof placementStatus>;
  startsAt: Date | null;
  endsAt: Date | null;
  now: number;
}): boolean {
  return input.productStatus === "active" && hasActivePartnerPublication(input);
}

export type PublicMarketplaceProduct = {
  id: number;
  partnerId: number;
  partnerName: string;
  partnerType: "person" | "company";
  partnerUrl: string | null;
  disclosureLabel: string;
  title: string;
  description: string | null;
  destinationUrl: string;
  priceLabel: string | null;
  imageUrl: string | null;
};

/**
 * A marketplace entry is an external partner offer, not an in-app sale. The
 * same verified, current authorization gate that controls home placements
 * controls every public catalogue item.
 */
async function getPublicMarketplaceProducts(db: Database): Promise<PublicMarketplaceProduct[]> {
  const partnerRows = await db
    .select({
      partnerId: partnerProfiles.id,
      partnerName: partnerProfiles.displayName,
      partnerType: partnerProfiles.partyType,
      partnerUrl: partnerProfiles.destinationUrl,
      disclosureLabel: partnerProfiles.disclosureLabel,
      placementStatus: partnerPlacements.status,
      startsAt: partnerPlacements.startsAt,
      endsAt: partnerPlacements.endsAt,
    })
    .from(partnerPlacements)
    .innerJoin(partnerProfiles, eq(partnerPlacements.partnerId, partnerProfiles.id))
    .where(and(
      eq(partnerPlacements.placement, "home"),
      eq(partnerPlacements.status, "active"),
      eq(partnerProfiles.status, "approved"),
    ));
  const [latestAuthorizations, activeProducts] = await Promise.all([
    getLatestAuthorizations(db),
    db
      .select({
        id: partnerProducts.id,
        partnerId: partnerProducts.partnerId,
        title: partnerProducts.title,
        description: partnerProducts.description,
        destinationUrl: partnerProducts.destinationUrl,
        priceLabel: partnerProducts.priceLabel,
        imageStorageKey: partnerProducts.imageStorageKey,
        status: partnerProducts.status,
        updatedAt: partnerProducts.updatedAt,
      })
      .from(partnerProducts)
      .where(eq(partnerProducts.status, "active"))
      .orderBy(desc(partnerProducts.updatedAt)),
  ]);
  const now = Date.now();
  const eligiblePartners = new Map(
    partnerRows
      .filter(partner => hasActivePartnerPublication({
        partnerStatus: "approved",
        authorizationState: latestAuthorizations.get(partner.partnerId)?.state ?? "missing",
        placementStatus: partner.placementStatus,
        startsAt: partner.startsAt,
        endsAt: partner.endsAt,
        now,
      }))
      .map(partner => [partner.partnerId, partner]),
  );

  return Promise.all(activeProducts.flatMap(product => {
    const partner = eligiblePartners.get(product.partnerId);
    if (!partner || !isPublicPartnerProduct({
      productStatus: product.status,
      partnerStatus: "approved",
      authorizationState: latestAuthorizations.get(product.partnerId)?.state ?? "missing",
      placementStatus: partner.placementStatus,
      startsAt: partner.startsAt,
      endsAt: partner.endsAt,
      now,
    })) return [];
    return [{
      id: product.id,
      partnerId: product.partnerId,
      partnerName: partner.partnerName,
      partnerType: partner.partnerType,
      partnerUrl: partner.partnerUrl,
      disclosureLabel: partner.disclosureLabel,
      title: product.title,
      description: product.description,
      destinationUrl: product.destinationUrl,
      priceLabel: product.priceLabel,
      imageStorageKey: product.imageStorageKey,
    }];
  }).map(async product => ({
    ...product,
    imageUrl: product.imageStorageKey ? await storageGetSignedUrl(product.imageStorageKey) : null,
  })));
}

export const partnersRouter = router({
  homepage: publicProcedure.query(async () => {
    const db = await requireDatabase();
    const rows = await db
      .select({
        id: partnerProfiles.id,
        displayName: partnerProfiles.displayName,
        partyType: partnerProfiles.partyType,
        destinationUrl: partnerProfiles.destinationUrl,
        disclosureLabel: partnerProfiles.disclosureLabel,
        placementId: partnerPlacements.id,
        placementStatus: partnerPlacements.status,
        startsAt: partnerPlacements.startsAt,
        endsAt: partnerPlacements.endsAt,
      })
      .from(partnerPlacements)
      .innerJoin(partnerProfiles, eq(partnerPlacements.partnerId, partnerProfiles.id))
      .where(and(eq(partnerPlacements.placement, "home"), eq(partnerPlacements.status, "active"), eq(partnerProfiles.status, "approved")))
      .orderBy(desc(partnerPlacements.updatedAt));
    const [latestAuthorizations, activeProducts] = await Promise.all([
      getLatestAuthorizations(db),
      db.select({
        id: partnerProducts.id,
        partnerId: partnerProducts.partnerId,
        title: partnerProducts.title,
        description: partnerProducts.description,
        destinationUrl: partnerProducts.destinationUrl,
        priceLabel: partnerProducts.priceLabel,
        imageStorageKey: partnerProducts.imageStorageKey,
      }).from(partnerProducts).where(eq(partnerProducts.status, "active")).orderBy(desc(partnerProducts.updatedAt)),
    ]);
    const now = Date.now();
    const publiclyVisiblePartnerIds = new Set(rows.filter(row => hasActivePartnerPublication({
      partnerStatus: "approved",
      authorizationState: latestAuthorizations.get(row.id)?.state ?? "missing",
      placementStatus: row.placementStatus,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      now,
    })).map(row => row.id));
    return Promise.all(rows.filter(row => publiclyVisiblePartnerIds.has(row.id)).map(async row => ({
      ...row,
      products: await Promise.all(activeProducts.filter(product => product.partnerId === row.id && isPublicPartnerProduct({
        productStatus: "active",
        partnerStatus: "approved",
        authorizationState: latestAuthorizations.get(row.id)?.state ?? "missing",
        placementStatus: row.placementStatus,
        startsAt: row.startsAt,
        endsAt: row.endsAt,
        now,
      })).map(async product => ({
        id: product.id,
        partnerId: product.partnerId,
        title: product.title,
        description: product.description,
        destinationUrl: product.destinationUrl,
        priceLabel: product.priceLabel,
        imageUrl: product.imageStorageKey ? await storageGetSignedUrl(product.imageStorageKey) : null,
      }))),
    })));
  }),

  marketplace: publicProcedure.query(async () => {
    const db = await requireDatabase();
    return getPublicMarketplaceProducts(db);
  }),

  marketplaceProduct: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await requireDatabase();
      const product = (await getPublicMarketplaceProducts(db)).find(item => item.id === input.id);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "marketplace_product_not_found" });
      return product;
    }),

  list: adminProcedure.query(async () => {
    const db = await requireDatabase();
    const latestAuthorizations = await getLatestAuthorizations(db);
    const rows = await db
      .select({
        id: partnerProfiles.id,
        displayName: partnerProfiles.displayName,
        partyType: partnerProfiles.partyType,
        destinationUrl: partnerProfiles.destinationUrl,
        disclosureLabel: partnerProfiles.disclosureLabel,
        partnerStatus: partnerProfiles.status,
        placementId: partnerPlacements.id,
        placementStatus: partnerPlacements.status,
        startsAt: partnerPlacements.startsAt,
        endsAt: partnerPlacements.endsAt,
      })
      .from(partnerProfiles)
      .leftJoin(partnerPlacements, eq(partnerPlacements.partnerId, partnerProfiles.id))
      .orderBy(desc(partnerProfiles.updatedAt));
    return rows.map(row => {
      const authorization = latestAuthorizations.get(row.id);
      return { ...row, authorizationState: authorization?.state ?? "missing", authorizationVersion: authorization?.authorizationVersion ?? null, authorizationUpdatedAt: authorization?.createdAt ?? null };
    });
  }),

  products: adminProcedure
    .input(z.object({ partnerId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await requireDatabase();
      await getPartner(db, input.partnerId);
      const products = await db.select({
        id: partnerProducts.id,
        partnerId: partnerProducts.partnerId,
        title: partnerProducts.title,
        description: partnerProducts.description,
        destinationUrl: partnerProducts.destinationUrl,
        priceLabel: partnerProducts.priceLabel,
        imageStorageKey: partnerProducts.imageStorageKey,
        imageMimeType: partnerProducts.imageMimeType,
        imageByteSize: partnerProducts.imageByteSize,
        status: partnerProducts.status,
        createdAt: partnerProducts.createdAt,
        updatedAt: partnerProducts.updatedAt,
      }).from(partnerProducts).where(eq(partnerProducts.partnerId, input.partnerId)).orderBy(desc(partnerProducts.updatedAt));
      return Promise.all(products.map(async product => ({
        ...product,
        imageUrl: product.imageStorageKey ? await storageGetSignedUrl(product.imageStorageKey) : null,
      })));
    }),

  create: adminProcedure
    .input(z.object({ displayName: z.string().trim().min(1).max(160), partyType: z.enum(["person", "company"]), destinationUrl: securedUrl.nullish(), authorizationConfirmed: z.literal(true), disclosureLabel: z.string().trim().min(1).max(80).default("Werbung") }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const createdPartner = await db.transaction(async tx => {
        const created = await tx.insert(partnerProfiles).values({ displayName: input.displayName, partyType: input.partyType, destinationUrl: input.destinationUrl ?? null, disclosureLabel: input.disclosureLabel, authorizationConfirmedAt: new Date(), status: "draft", createdByUserId: ctx.user.id });
        const partnerId = Number(created[0].insertId);
        const placement = await tx.insert(partnerPlacements).values({ partnerId, placement: "home", status: "draft", createdByUserId: ctx.user.id });
        const authorization = await tx.insert(partnerAuthorizations).values({ eventId: randomUUID(), partnerId, authorizationVersion: "partner_authorization_v1", state: "granted", confirmedByUserId: ctx.user.id });
        return { id: partnerId, placementId: Number(placement[0].insertId), authorizationId: Number(authorization[0].insertId), status: "draft" } as const;
      });
      await appendAuditEntry({ actorId: ctx.user.id, action: "partner_profile_created", targetType: "partner_profile", targetId: createdPartner.id, payload: { authorizationEventId: createdPartner.authorizationId, authorizationState: "granted", partyType: input.partyType, placementId: createdPartner.placementId, status: "draft" } });
      return createdPartner;
    }),

  createProduct: adminProcedure
    .input(z.object({ partnerId: z.number().int().positive(), product: partnerProductInputSchema }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      await getPartner(db, input.partnerId);
      const inserted = await db.insert(partnerProducts).values({
        partnerId: input.partnerId,
        title: input.product.title,
        description: input.product.description ?? null,
        destinationUrl: input.product.destinationUrl,
        priceLabel: input.product.priceLabel ?? null,
        status: "draft",
        createdByUserId: ctx.user.id,
      });
      const id = Number(inserted[0].insertId);
      await appendAuditEntry({ actorId: ctx.user.id, action: "partner_product_created", targetType: "partner_product", targetId: id, payload: { partnerId: input.partnerId, status: "draft" } });
      return { id, status: "draft" as const };
    }),

  uploadProductImage: adminProcedure
    .input(z.object({ productId: z.number().int().positive(), base64: z.string().min(1), mimeType: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const [product] = await db.select().from(partnerProducts).where(eq(partnerProducts.id, input.productId)).limit(1);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "partner_product_not_found" });
      const image = validateImageUpload(input.base64, input.mimeType);
      const stored = await storagePut(
        `partners/${product.partnerId}/products/${product.id}/image.${image.extension}`,
        image.buffer,
        image.mimeType,
      );
      await db.update(partnerProducts).set({ imageStorageKey: stored.key, imageMimeType: image.mimeType, imageByteSize: image.byteSize }).where(eq(partnerProducts.id, product.id));
      await appendAuditEntry({ actorId: ctx.user.id, action: "partner_product_image_replaced", targetType: "partner_product", targetId: product.id, payload: { byteSize: image.byteSize, mimeType: image.mimeType, partnerId: product.partnerId, previousImage: Boolean(product.imageStorageKey) } });
      return { id: product.id, imageMimeType: image.mimeType, imageByteSize: image.byteSize, imageUrl: await storageGetSignedUrl(stored.key) };
    }),

  setProductStatus: adminProcedure
    .input(z.object({ productId: z.number().int().positive(), status: productStatus }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const [product] = await db.select().from(partnerProducts).where(eq(partnerProducts.id, input.productId)).limit(1);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "partner_product_not_found" });
      if (input.status === "active" && !(await canPublishPartnerProducts(db, product.partnerId))) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "active_authorized_partner_placement_required" });
      }
      if (product.status === input.status) return { id: product.id, status: input.status, changed: false } as const;
      await db.update(partnerProducts).set({ status: input.status }).where(eq(partnerProducts.id, product.id));
      await appendAuditEntry({ actorId: ctx.user.id, action: "partner_product_status_changed", targetType: "partner_product", targetId: product.id, payload: { after: input.status, before: product.status, partnerId: product.partnerId } });
      return { id: product.id, status: input.status, changed: true } as const;
    }),

  setAuthorization: adminProcedure
    .input(z.object({ partnerId: z.number().int().positive(), state: authorizationState, authorizationVersion: z.string().trim().min(1).max(32).default("partner_authorization_v1") }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const partner = await getPartner(db, input.partnerId);
      const latestAuthorizations = await getLatestAuthorizations(db);
      const previous = latestAuthorizations.get(partner.id);
      if (previous?.state === input.state && previous.authorizationVersion === input.authorizationVersion) return { id: partner.id, state: input.state, changed: false } as const;
      const inserted = await db.insert(partnerAuthorizations).values({ eventId: randomUUID(), partnerId: partner.id, authorizationVersion: input.authorizationVersion, state: input.state, confirmedByUserId: ctx.user.id });
      if (input.state === "revoked") {
        await db.update(partnerPlacements).set({ status: "paused" }).where(eq(partnerPlacements.partnerId, partner.id));
      }
      await appendAuditEntry({ actorId: ctx.user.id, action: "partner_authorization_changed", targetType: "partner_profile", targetId: partner.id, payload: { after: input.state, authorizationEventId: Number(inserted[0].insertId), authorizationVersion: input.authorizationVersion, before: previous?.state ?? "missing" } });
      return { id: partner.id, state: input.state, changed: true } as const;
    }),

  setPartnerStatus: adminProcedure
    .input(z.object({ partnerId: z.number().int().positive(), status: partnerStatus }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const partner = await getPartner(db, input.partnerId);
      const latestAuthorizations = await getLatestAuthorizations(db);
      if (input.status === "approved" && latestAuthorizations.get(partner.id)?.state !== "granted") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "current_partner_authorization_required" });
      }
      if (partner.status === input.status) return { id: partner.id, status: input.status, changed: false } as const;
      await db.update(partnerProfiles).set({ status: input.status }).where(eq(partnerProfiles.id, partner.id));
      if (input.status !== "approved") await db.update(partnerPlacements).set({ status: "paused" }).where(eq(partnerPlacements.partnerId, partner.id));
      await appendAuditEntry({ actorId: ctx.user.id, action: "partner_status_changed", targetType: "partner_profile", targetId: partner.id, payload: { after: input.status, before: partner.status } });
      return { id: partner.id, status: input.status, changed: true } as const;
    }),

  setHomepagePlacement: adminProcedure
    .input(z.object({ partnerId: z.number().int().positive(), status: placementStatus, startsAt: dateTimeInput, endsAt: dateTimeInput }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const partner = await getPartner(db, input.partnerId);
      const latestAuthorizations = await getLatestAuthorizations(db);
      if (input.status === "active" && (partner.status !== "approved" || latestAuthorizations.get(partner.id)?.state !== "granted")) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "partner_approval_and_current_authorization_required" });
      }
      const [placement] = await db.select().from(partnerPlacements).where(and(eq(partnerPlacements.partnerId, partner.id), eq(partnerPlacements.placement, "home"))).limit(1);
      if (!placement) throw new TRPCError({ code: "NOT_FOUND", message: "partner_placement_not_found" });
      const startsAt = resolveDate(input.startsAt, placement.startsAt);
      const endsAt = resolveDate(input.endsAt, placement.endsAt);
      validatePlacementWindow(startsAt, endsAt, input.status);
      const changed = placement.status !== input.status || placement.startsAt?.getTime() !== startsAt?.getTime() || placement.endsAt?.getTime() !== endsAt?.getTime();
      if (!changed) return { id: placement.id, status: input.status, changed: false } as const;
      await db.update(partnerPlacements).set({ status: input.status, startsAt, endsAt }).where(eq(partnerPlacements.id, placement.id));
      await appendAuditEntry({ actorId: ctx.user.id, action: "partner_home_placement_changed", targetType: "partner_placement", targetId: placement.id, payload: { after: { endsAt: endsAt?.toISOString() ?? null, startsAt: startsAt?.toISOString() ?? null, status: input.status }, before: { endsAt: placement.endsAt?.toISOString() ?? null, startsAt: placement.startsAt?.toISOString() ?? null, status: placement.status }, partnerId: partner.id } });
      return { id: placement.id, status: input.status, changed: true } as const;
    }),
});
