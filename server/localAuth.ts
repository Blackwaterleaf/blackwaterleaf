import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { getLocalAuthEmailConfig } from "./localAuthConfig";

const PASSWORD_LENGTH_MINIMUM = 12;
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 64;

export type LocalTokenPurpose = "email_verification" | "password_reset";

function derivePasswordKey(password: string, salt: string, n: number, r: number, p: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, SCRYPT_KEY_LENGTH, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(Buffer.from(derivedKey));
    });
  });
}

export function normalizeEmail(email: string) {
  return email.trim().toLocaleLowerCase("en-US");
}

export function validatePassword(password: string) {
  if (password.length < PASSWORD_LENGTH_MINIMUM) return "password_too_short";
  if (password.length > 256) return "password_too_long";
  return null;
}

export async function hashPassword(password: string) {
  const invalidReason = validatePassword(password);
  if (invalidReason) throw new Error(invalidReason);
  const salt = randomBytes(16).toString("base64url");
  const derived = await derivePasswordKey(password, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P);
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, nText, rText, pText, salt, storedHash] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !storedHash) return false;
  const n = Number(nText);
  const r = Number(rText);
  const p = Number(pText);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p) || n < 2 || r < 1 || p < 1) return false;
  try {
    const derived = await derivePasswordKey(password, salt, n, r, p);
    const expected = Buffer.from(storedHash, "base64url");
    return expected.length === derived.length && timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

export function createOneTimeToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashOneTimeToken(token) };
}

export function hashOneTimeToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getTokenExpiry(purpose: LocalTokenPurpose, now = Date.now()) {
  const duration = purpose === "email_verification" ? 24 * 60 * 60 * 1_000 : 60 * 60 * 1_000;
  return new Date(now + duration);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

export async function sendLocalAuthEmail(input: {
  to: string;
  purpose: LocalTokenPurpose;
  token: string;
  displayName?: string | null;
}) {
  const config = getLocalAuthEmailConfig();
  if (!config) throw new Error("local_auth_email_not_configured");
  const isVerification = input.purpose === "email_verification";
  const path = isVerification ? "/verify-email" : "/reset-password";
  const url = new URL(path, config.publicOrigin);
  url.searchParams.set("token", input.token);
  const title = isVerification ? "E-Mail-Adresse bestätigen" : "Passwort zurücksetzen";
  const greeting = input.displayName?.trim() ? `Hallo ${escapeHtml(input.displayName.trim())},` : "Hallo,";
  const copy = isVerification
    ? "bitte bestätige deine E-Mail-Adresse, um dein BlackWaterLeaf-Konto freizuschalten."
    : "du hast das Zurücksetzen deines BlackWaterLeaf-Passworts angefordert.";
  const expiry = isVerification ? "24 Stunden" : "60 Minuten";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: config.from,
      reply_to: config.replyTo,
      to: [input.to],
      subject: `${title} · BlackWaterLeaf`,
      text: `${greeting}\n\n${copy}\n\n${url.toString()}\n\nDieser Link ist ${expiry} gültig und kann nur einmal verwendet werden. Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.`,
      html: `<p>${greeting}</p><p>${copy}</p><p><a href="${url.toString()}">${title}</a></p><p>Dieser Link ist <strong>${expiry}</strong> gültig und kann nur einmal verwendet werden.</p><p>Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.</p>`,
    }),
  });
  if (!response.ok) throw new Error("local_auth_email_delivery_failed");
}
