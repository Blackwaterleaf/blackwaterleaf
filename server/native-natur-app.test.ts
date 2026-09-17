import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const oauth = readFileSync(resolve(root, "server/_core/oauth.ts"), "utf8");
const shared = readFileSync(resolve(root, "shared/const.ts"), "utf8");
const app = readFileSync(resolve(root, "mobile-natur/App.tsx"), "utf8");
const api = readFileSync(resolve(root, "mobile-natur/src/api.ts"), "utf8");
const auth = readFileSync(resolve(root, "mobile-natur/src/nativeAuth.ts"), "utf8");
const appConfig = readFileSync(resolve(root, "mobile-natur/app.json"), "utf8");
const habitats = readFileSync(resolve(root, "mobile-natur/src/HabitatManager.tsx"), "utf8");
const moments = readFileSync(resolve(root, "mobile-natur/src/MomentCapture.tsx"), "utf8");

describe("BlackWaterLeaf native application contract", () => {
  it("is explicitly the native BlackWaterLeaf product app, never the Studio client", () => {
    expect(appConfig).toContain('"name": "BlackWaterLeaf"');
    expect(appConfig).toContain('"slug": "blackwater-agent"');
    expect(appConfig).toContain('"package": "com.blackwaterleaf"');
    expect(app).not.toContain("BlackWaterLeaf Studio");
    expect(app).not.toContain("CONTROL API");
  });

  it("uses the supplied original BlackWaterLeaf mark for the native launcher and header", () => {
    expect(app).toContain('require("./assets/icon.png")');
    expect(app).toContain("BlackWaterLeaf Originalmarke");
    expect(appConfig).toContain('"icon": "./assets/icon.png"');
    expect(appConfig).toContain('"foregroundImage": "./assets/android-icon-foreground.png"');
    expect(appConfig).toContain('"version": "1.0.14"');
    expect(appConfig).toContain('"versionCode": 14');
  });

  it("reads public and private content from the existing BlackWaterLeaf API, not a copied data source", () => {
    expect(api).toContain('API_ORIGIN = "https://blackwaterleaf.com"');
    for (const procedure of ["platform.availability", "partners.marketplace", "community.feed", "knowledge.listPublished", "auth.me", "habitats.mine"]) expect(api).toContain(procedure);
    expect(api).toContain("Authorization: `Bearer ${token}`");
    for (const procedure of ["habitats.create", "observations.create", "observations.uploadImage"]) expect(api).toContain(procedure);
  });

  it("uses native controlled forms and device media for private plants, aquariums, terrariums and moments", () => {
    expect(app).toContain("MomentCapture");
    expect(app).toContain("HabitatManager");
    expect(habitats).toContain("NEUE {labels[kind]} ANLEGEN");
    expect(habitats).toContain("createHabitat(token, payload)");
    expect(moments).toContain("launchCameraAsync");
    expect(moments).toContain("launchImageLibraryAsync");
    expect(moments).toContain("createObservation(token");
    expect(moments).toContain("uploadObservationImage(token");
    expect(moments).toContain('visibility: "private"');
    expect(moments).toContain("mediaConsent");
    expect(moments).toContain("setConsent(token");
    expect(moments).toContain('purpose: "media_processing"');
    expect(moments).not.toContain("WebView");
  });

  it("uses native high-entropy state verification and secure token storage for private flows", () => {
    expect(auth).toContain("Crypto.randomUUID");
    expect(auth).toContain("returnedState !== mobileState");
    expect(auth).toContain("codeVerifier");
    expect(auth).toContain("codeChallenge");
    expect(auth).toContain("/api/oauth/mobile/exchange");
    expect(auth).toContain("writeToken(resultPayload.sessionToken)");
    expect(api).toContain("SecureStore.setItemAsync");
    expect(api).toContain("WHEN_UNLOCKED_THIS_DEVICE_ONLY");
    expect(shared).toContain("mobileState?: string");
    expect(oauth).toContain('MOBILE_CALLBACK_SCHEME = "blackwaterleaf://oauth/callback"');
    expect(oauth).toContain('MOBILE_OAUTH_CALLBACK = "https://blackwaterleaf.com/api/oauth/callback"');
    expect(oauth).toContain('app.get("/api/oauth/mobile/start"');
    expect(oauth).toContain('app.post("/api/oauth/mobile/exchange"');
    expect(oauth).toContain("MOBILE_CODE_AUDIENCE");
    expect(oauth).toContain("crypto.subtle.digest");
    expect(oauth).toContain('callback.searchParams.set("code"');
    expect(oauth).not.toContain('callback.searchParams.set("token"');
    expect(oauth).toContain("native_oauth_not_available");
    expect(oauth).toContain("mobileState) && isValidCodeChallenge(mobileCodeChallenge) && oauthState.redirectUri === MOBILE_OAUTH_CALLBACK");
  });

  it("contains an Android APK profile and the complete native source tree", () => {
    expect(existsSync(resolve(root, "mobile-natur/eas.json"))).toBe(true);
    expect(readFileSync(resolve(root, "mobile-natur/eas.json"), "utf8")).toContain('"buildType": "apk"');
    expect(appConfig).toContain('"recordAudioAndroid": false');
    expect(appConfig).toContain('"blockedPermissions"');
    expect(appConfig).toContain('"android.permission.RECORD_AUDIO"');
  });

  it("keeps the native marketplace accent and shared seasonal helper", () => {
    expect(app).toContain('market: "#D9AD69"');
    expect(app).toContain("getBlackWaterLeafSeason");
    expect(existsSync(resolve(root, "mobile-natur/src/season.ts"))).toBe(true);
  });

  it("implements every approved reference screen as native UI without a WebView shell", () => {
    for (const screen of ["botany", "aquarium", "terrarium", "assistant", "live", "photo", "post", "knowledge", "explore", "community", "profile", "builder"]) {
      expect(app).toContain(`screen === "${screen}"`);
    }
    expect(app).toContain('title="PFLANZEN WORLD"');
    expect(app).toContain('title="AQUARISTIK"');
    expect(app).toContain('title="TERRARISTIK"');
    expect(app).toContain('title="KI-ASSISTENT"');
    expect(app).not.toContain("react-native-webview");
    expect(app).not.toContain("<WebView");
  });

  it("keeps the exact five regular navigation destinations and a server-role-gated Builder", () => {
    for (const label of ["Home", "Entdecken", "Marktplatz", "Community", "Profil"]) expect(app).toContain(`label: "${label}"`);
    expect(app).toContain('showBuilder={account?.role === "admin"}');
    expect(app).toContain('account?.role !== "admin"');
  });

  it("connects native KI and community actions only through existing protected server contracts", () => {
    for (const procedure of ["assistant.chat", "assistant.plantIdentify", "assistant.aquariumAnalyze", "assistant.submitPlantCorrection", "community.createDraft", "community.publish", "profile.consents"]) expect(api).toContain(procedure);
    expect(app).toContain("ai_processing");
    expect(app).toContain("community_publishing");
    expect(app).toContain("maximal 3 Einzelbilder");
    expect(app).toContain("Admins und Moderatoren");
    expect(app).toContain("selectionCollapsed");
    expect(app).toContain("ALLE WERKZEUGE");
    expect(app).toContain("gridCompact");
    expect(app).toContain("referenceCardCompact");
    expect(app).toContain('onPress: () => chooseTool("plant")');
    expect(app).toContain("FOTO 1 AUSWÄHLEN");
    expect(app).toContain('onPress={() => void requestWeather()}');
    expect(app).toContain('title="DEINE BEREICHE"');
    expect(app).toContain('label="WELT ENTDECKEN"');
    expect(app).toContain('accessibilityLabel="Pflanzenbild wird von der KI analysiert"');
    expect(app).toContain('KI / ANALYSE LÄUFT');
    expect(app).toContain('function LiveHomeWorlds');
    expect(app).toContain('AUSWAHL · {selected.toUpperCase()}');
    expect(app).toContain('LayoutAnimation.Presets.easeInEaseOut');
  });
});
