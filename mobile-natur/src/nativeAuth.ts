import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { API_ORIGIN, writeToken } from "./api";

WebBrowser.maybeCompleteAuthSession();

type SignInOptions = { forceAccountSelection?: boolean };

async function signInWithProvider(provider: "google" | "manus", options: SignInOptions = {}) {
  const mobileState = Crypto.randomUUID().replace(/-/g, "");
  const codeVerifier = `${Crypto.randomUUID().replace(/-/g, "")}${Crypto.randomUUID().replace(/-/g, "")}`;
  const codeChallenge = (await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, codeVerifier, { encoding: Crypto.CryptoEncoding.BASE64 }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const redirectUri = Linking.createURL("oauth/callback", { scheme: "blackwaterleaf" });
  const accountSelection = options.forceAccountSelection ? "&prompt=select_account" : "";
  const startPath = provider === "google" ? "/api/oauth/google/mobile/start" : "/api/oauth/mobile/start";
  const exchangePath = provider === "google" ? "/api/oauth/google/mobile/exchange" : "/api/oauth/mobile/exchange";
  const startUrl = `${API_ORIGIN}${startPath}?mobileState=${encodeURIComponent(mobileState)}&codeChallenge=${encodeURIComponent(codeChallenge)}${accountSelection}`;
  const result = await WebBrowser.openAuthSessionAsync(startUrl, redirectUri);

  if (result.type !== "success") {
    if (result.type === "cancel" || result.type === "dismiss") return { status: "cancelled" as const };
    throw new Error("Die sichere Anmeldung konnte nicht abgeschlossen werden.");
  }

  const parsed = Linking.parse(result.url);
  const returnedState = typeof parsed.queryParams?.state === "string" ? parsed.queryParams.state : null;
  const code = typeof parsed.queryParams?.code === "string" ? parsed.queryParams.code : null;
  if (!code || returnedState !== mobileState) throw new Error("Die Anmeldung wurde aus Sicherheitsgründen abgelehnt.");

  const exchange = await fetch(`${API_ORIGIN}${exchangePath}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, state: mobileState, codeVerifier }),
  });
  const resultPayload = await exchange.json() as { sessionToken?: string };
  if (!exchange.ok || !resultPayload.sessionToken) throw new Error("Die Anmeldung wurde aus Sicherheitsgründen abgelehnt.");
  await writeToken(resultPayload.sessionToken);
  return { status: "authenticated" as const };
}

/** Preferred native sign-in. Google only returns a BWL session after verified email ownership. */
export function signInWithGoogle(options: SignInOptions = {}) {
  return signInWithProvider("google", options);
}

/** Legacy managed-account fallback retained only for existing staging builds. */
export function signInWithBlackWaterLeaf(options: SignInOptions = {}) {
  return signInWithProvider("manus", options);
}
