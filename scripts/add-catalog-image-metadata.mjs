import fs from "node:fs";

const file = new URL("../drizzle/schema.ts", import.meta.url);
let source = fs.readFileSync(file, "utf8");
const fields = `    imageSourceUrl: varchar("imageSourceUrl", { length: 1_000 }),\n    imageLicense: varchar("imageLicense", { length: 128 }),\n    imageAttribution: text("imageAttribution"),\n    imageVerifiedAt: timestamp("imageVerifiedAt"),\n`;
const marker = `    imageUrl: varchar("imageUrl", { length: 1_000 }),\n`;
const occurrences = source.split(marker).length - 1;
if (occurrences !== 2) throw new Error(`Expected 2 catalog imageUrl markers, found ${occurrences}`);
source = source.replaceAll(marker, marker + fields);
fs.writeFileSync(file, source);
console.log("Added catalog image metadata fields to plant_taxa and aquarium_taxa");
