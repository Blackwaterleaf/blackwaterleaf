import { readFileSync } from "node:fs";

const htmlPath = process.argv[2];
if (!htmlPath) throw new Error("html_path_required");
const html = readFileSync(htmlPath, "utf8");
const records = Array.from(html.matchAll(/aria-label="Copy ([^"]+)"/g), match => match[1]);
for (const record of records) console.log(record);
