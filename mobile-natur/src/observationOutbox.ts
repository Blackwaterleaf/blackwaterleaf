import * as FileSystem from "expo-file-system/legacy";
import { createObservation, setConsent, setProfileConsent, updateObservation, uploadObservationImage, type Observation } from "./api";

type ObservationPayload = {
  clientId: string;
  realm: "botany" | "aquarium" | "terrarium";
  subject: string | null;
  scientificName: string | null;
  note: string | null;
  metrics: Array<{ key: string; value: string | number | boolean; unit?: string }>;
  evidenceState: "unverified";
  observedAt?: string | null;
  basisOfRecord?: "human_observation" | "machine_observation" | "material_sample";
  wildStatus?: "wild" | "cultivated" | "captive" | "unknown";
  latitude?: number | null;
  longitude?: number | null;
  coordinateUncertaintyM?: number | null;
  publicLatitude?: number | null;
  publicLongitude?: number | null;
  geoprivacy?: "private" | "obscured" | "public" | "embargoed";
  embargoUntil?: string | null;
  userStatus?: "draft" | "saved" | "help_requested" | "question_open" | "proposal_received" | "queued_for_review";
  aiCandidates?: Array<{ scientificName: string; taxonRank: string | null; confidenceBand: "low" | "medium" | "high"; confidencePercent: number | null; reason: string | null; source: string | null; sourceUrl: string | null }>;
  aiModel?: string | null;
  aiCatalogVersion?: string | null;
  visibility: "private";
  publish?: boolean;
};

type OutboxItem = {
  id: string;
  payload: ObservationPayload;
  imagePath: string | null;
  mimeType: string | null;
  observationId: number | null;
  needsMediaConsent: boolean;
  status: "pending" | "image_pending" | "conflict";
  attempts: number;
  lastError: string | null;
  createdAt: string;
};

export type ObservationOutboxSummary = {
  pending: number;
  imagePending: number;
  conflicts: number;
};

const root = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}blackwaterleaf-observation-outbox/`
  : null;
const queueFile = root ? `${root}queue.json` : null;
const cacheFile = root ? `${root}private-observations.json` : null;

async function ensureRoot() {
  if (!root) throw new Error("Lokaler App-Speicher ist nicht verfügbar.");
  const info = await FileSystem.getInfoAsync(root);
  if (!info.exists) await FileSystem.makeDirectoryAsync(root, { intermediates: true });
}

async function readQueue(): Promise<OutboxItem[]> {
  if (!queueFile) return [];
  await ensureRoot();
  const info = await FileSystem.getInfoAsync(queueFile);
  if (!info.exists) return [];
  try {
    const raw = await FileSystem.readAsStringAsync(queueFile);
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as OutboxItem[]) : [];
  } catch {
    return [];
  }
}

async function writeQueue(items: OutboxItem[]) {
  if (!queueFile) throw new Error("Lokaler App-Speicher ist nicht verfügbar.");
  await ensureRoot();
  await FileSystem.writeAsStringAsync(queueFile, JSON.stringify(items));
}

export async function enqueueObservation(input: {
  payload: ObservationPayload;
  imageUri?: string | null;
  mimeType?: string | null;
  needsMediaConsent: boolean;
}) {
  const id = input.payload.clientId;
  const imagePath = input.imageUri && root ? `${root}${id}.image` : null;
  if (input.imageUri && imagePath) {
    const base64 = await FileSystem.readAsStringAsync(input.imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await ensureRoot();
    await FileSystem.writeAsStringAsync(imagePath, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
  const items = await readQueue();
  const next: OutboxItem = {
    id,
    payload: input.payload,
    imagePath,
    mimeType: input.mimeType ?? "image/jpeg",
    observationId: null,
    needsMediaConsent: input.needsMediaConsent,
    status: "pending",
    attempts: 0,
    lastError: null,
    createdAt: new Date().toISOString(),
  };
  await writeQueue([...items.filter(item => item.id !== id), next]);
}

export async function syncObservationOutbox(token: string): Promise<ObservationOutboxSummary> {
  const items = await readQueue();
  const remaining: OutboxItem[] = [];
  for (const item of items) {
    try {
      let observationId = item.observationId;
      let createdRevision: number | null = null;
      if (!observationId) {
        const observation = await createObservation(token, { ...item.payload, visibility: "private" });
        observationId = Number(observation.id);
        createdRevision = observation.revision;
        if (!Number.isFinite(observationId)) throw new Error("Serverantwort ohne gültige Beobachtungs-ID.");
      }
      if (item.imagePath) {
        if (item.payload.latitude !== null && item.payload.latitude !== undefined) {
          await setProfileConsent(token, { purpose: "location_processing", policyVersion: "native-1.0.5", granted: true });
        }
        if (item.needsMediaConsent) {
          await setConsent(token, {
            purpose: "media_processing",
            policyVersion: "native-1.0.4",
            granted: true,
          });
        }
        const info = await FileSystem.getInfoAsync(item.imagePath);
        if (!info.exists) throw new Error("Das ausstehende Bild ist im Gerätespeicher nicht mehr vorhanden.");
        const base64 = await FileSystem.readAsStringAsync(item.imagePath, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await uploadObservationImage(token, {
          observationId,
          base64,
          mimeType: item.mimeType ?? "image/jpeg",
        });
        await FileSystem.deleteAsync(item.imagePath, { idempotent: true });
      }
      if (item.payload.publish && createdRevision !== null) {
        await setProfileConsent(token, { purpose: "observation_publishing", policyVersion: "native-1.0.5", granted: true });
        await updateObservation(token, { id: observationId, expectedRevision: createdRevision, visibility: "public", userStatus: item.payload.userStatus ?? "saved", geoprivacy: item.payload.geoprivacy ?? "private", publicLatitude: item.payload.publicLatitude ?? null, publicLongitude: item.payload.publicLongitude ?? null });
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Synchronisierung fehlgeschlagen.";
      const conflict = /conflict|bereits|duplicate|idempot/i.test(message);
      remaining.push({
        ...item,
        observationId: item.observationId ?? null,
        status: conflict ? "conflict" : item.observationId ? "image_pending" : "pending",
        attempts: item.attempts + 1,
        lastError: message,
      });
    }
  }
  await writeQueue(remaining);
  return summarize(remaining);
}

function summarize(items: OutboxItem[]): ObservationOutboxSummary {
  return {
    pending: items.filter(item => item.status === "pending").length,
    imagePending: items.filter(item => item.status === "image_pending").length,
    conflicts: items.filter(item => item.status === "conflict").length,
  };
}

export async function observationOutboxSummary() {
  return summarize(await readQueue());
}

export async function cachePrivateObservations(items: Observation[]) {
  if (!cacheFile) return;
  await ensureRoot();
  await FileSystem.writeAsStringAsync(cacheFile, JSON.stringify(items));
}

export async function readCachedPrivateObservations(): Promise<Observation[]> {
  if (!cacheFile) return [];
  await ensureRoot();
  const info = await FileSystem.getInfoAsync(cacheFile);
  if (!info.exists) return [];
  try {
    const parsed = JSON.parse(await FileSystem.readAsStringAsync(cacheFile)) as unknown;
    return Array.isArray(parsed) ? (parsed as Observation[]) : [];
  } catch {
    return [];
  }
}
