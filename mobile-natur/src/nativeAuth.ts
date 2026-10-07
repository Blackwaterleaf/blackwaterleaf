import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { API_ORIGIN, writeToken } from "./api";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithBlackWaterLeaf(options: { forceAccountSelection?: boolean } = {}) {
  const mobileState = Crypto.randomUUID().replace(/-/g, "");
  const codeVerifier = `${Crypto.randomUUID().replace(/-/g, "")}${Crypto.randomUUID().replace(/-/g, "")}`;
  const codeChallenge = (await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, codeVerifier, { encoding: Crypto.CryptoEncoding.BASE64 }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const redirectUri = Linking.createURL("oauth/callback", { scheme: "blackwaterleaf" });
  const accountSelection = options.forceAccountSelection ? "&prompt=select_account" : "";
  const startUrl = `${API_ORIGIN}/api/oauth/mobile/start?mobileState=${encodeURIComponent(mobileState)}&codeChallenge=${encodeURIComponent(codeChallenge)}${accountSelection}`;
  const result = await WebBrowser.openAuthSessionAsync(startUrl, redirectUri);

  if (result.type !== "success") {
    if (result.type === "cancel" || result.type === "dismiss") return { status: "cancelled" as const };
    throw new Error("Die sichere Anmeldung konnte nicht abgeschlossen werden.");
  }

  const parsed = Linking.parse(result.url);
  const returnedState = typeof parsed.queryParams?.state === "string" ? parsed.queryParams.state : null;
  const code = typeof parsed.queryParams?.code === "string" ? parsed.queryParams.code : null;
  if (!code || returnedState !== mobileState) throw new Error("Die Anmeldung wurde aus Sicherheitsgründen abgelehnt.");

  const exchange = await fetch(`${API_ORIGIN}/api/oauth/mobile/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, state: mobileState, codeVerifier }),
  });
  const resultPayload = await exchange.json() as { sessionToken?: string };
  if (!exchange.ok || !resultPayload.sessionToken) throw new Error("Die Anmeldung wurde aus Sicherheitsgründen abgelehnt.");
  await writeToken(resultPayload.sessionToken);
  return { status: "authenticated" as const };
}
