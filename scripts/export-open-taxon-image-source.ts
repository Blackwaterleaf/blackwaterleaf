import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { aquariumTaxa, plantTaxa } from "../drizzle/schema";
import { getDb } from "../server/db";

const outputPath = resolve(process.cwd(), "data/imports/open-taxon-image-source.json");
const db = await getDb();
if (!db) throw new Error("database_unavailable");

const [plants, aquarium] = await Promise.all([
  db.select({ id: plantTaxa.id, scientificName: plantTaxa.scientificName, source: plantTaxa.source, sourceRecordId: plantTaxa.sourceRecordId })
    .from(plantTaxa)
    .where(eq(plantTaxa.status, "published")),
  db.select({ id: aquariumTaxa.id, scientificName: aquariumTaxa.scientificName, source: aquariumTaxa.source, sourceRecordId: aquariumTaxa.sourceRecordId })
    .from(aquariumTaxa)
    .where(eq(aquariumTaxa.status, "published")),
]);

const output = {
  generatedAt: new Date().toISOString(),
  purpose: "Input inventory for CC0/CC-BY quality-photo discovery only.",
  plants,
  aquarium,
};
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ plants: plants.length, aquarium: aquarium.length, outputPath }));
process.exit(0);
