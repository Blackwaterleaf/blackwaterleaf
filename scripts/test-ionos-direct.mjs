#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const tokenFile = process.env.IONOS_TOKEN_FILE ?? "/home/ubuntu/Downloads/47cdc345-9ba1-4366-a16b-863cde6099dc.txt";
const endpoint = process.env.IONOS_AI_API_URL ?? "https://openai.inference.de-txl.ionos.com";
const model = process.env.IONOS_AI_MODEL ?? "Qwen/Qwen3.5-9B";

const token = (await readFile(tokenFile, "utf8")).trim();
if (!token) throw new Error(`Token-Datei ist leer: ${tokenFile}`);

const response = await fetch(`${endpoint.replace(/\/$/, "")}/v1/models`, {
  headers: { authorization: `Bearer ${token}` },
});
const body = await response.json().catch(() => ({}));

console.log(JSON.stringify({
  endpoint,
  tokenFile,
  tokenCharacters: token.length,
  httpStatus: response.status,
  authenticated: response.ok,
  modelCount: Array.isArray(body.data) ? body.data.length : 0,
  configuredModelAvailable: Array.isArray(body.data) && body.data.some(item => item.id === model),
  error: response.ok ? undefined : body,
}, null, 2));

if (!response.ok) process.exitCode = 1;
