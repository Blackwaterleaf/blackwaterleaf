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
const outbox = readFileSync(resolve(root, "mobile-natur/src/observationOutbox.ts"), "utf8");

describe("BlackWaterLeaf native application contract", () => {
  it("is explicitly the native BlackWaterLeaf product app", () => {
    for (const token of ['"name": "BlackWaterLeaf"', '"slug": "bwl"', '"package": "com.blackwaterleaf"']) expect(appConfig).toContain(token);
    expect(app).not.toContain("BlackWaterLeaf Studio");
  });

  it("uses the supplied original mark for the native launcher and header", () => {
    for (const token of ['require("./assets/icon.png")', "BlackWaterLeaf Originalmarke"]) expect(app).toContain(token);
    expect(appConfig).toContain('"icon": "./assets/icon.png"');
    for (const asset of ["botany-reference.jpg", "aquarium-reference.jpg", "terrarium-reference.jpg", "assistant-reference.jpg"]) expect(existsSync(resolve(root, `mobile-natur/assets/${asset}`))).toBe(true);
  });

  it("reads public and private content from the existing BlackWaterLeaf API", () => {
    expect(api).toContain("EXPO_PUBLIC_API_ORIGIN");
    expect(api).toContain("Constants.expoConfig?.extra?.apiOrigin");
    expect(api).not.toContain(["3000-ibp8fnclaynuq4sdd6dsd", "206ff939.us1.manus.computer"].join("-"));
    for (const procedure of ["platform.availability", "partners.marketplace", "community.feed", "knowledge.listPublished", "auth.me", "habitats.mine", "habitats.create", "observations.create", "observations.uploadImage"]) expect(api).toContain(procedure);
    expect(api).toContain("Authorization: `Bearer ${token}`");
  });

  it("uses native controlled forms and device media for private habitats and moments", () => {
    for (const token of ["MomentCapture", "HabitatManager", "launchCameraAsync", "launchImageLibraryAsync", "enqueueObservation", "syncObservationOutbox", 'visibility: "private"', "mediaConsent"]) expect(app + moments).toContain(token);
    expect(habitats).toContain("createHabitat(token, payload)");
    expect(outbox).toContain('purpose: "media_processing"');
    expect(moments).not.toContain("WebView");
  });

  it("uses native high-entropy state verification and secure token storage", () => {
    for (const token of ["Crypto.randomUUID", "returnedState !== mobileState", "codeVerifier", "codeChallenge", "/api/oauth/mobile/exchange"]) expect(auth).toContain(token);
    expect(api).toContain("SecureStore.setItemAsync");
    expect(shared).toContain("mobileState?: string");
    expect(oauth).toContain('MOBILE_CALLBACK_SCHEME = "blackwaterleaf://oauth/callback"');
  });

  it("contains an Android APK profile and complete native source tree", () => {
    expect(existsSync(resolve(root, "mobile-natur/eas.json"))).toBe(true);
    expect(readFileSync(resolve(root, "mobile-natur/eas.json"), "utf8")).toContain('"buildType": "apk"');
    expect(appConfig).toContain('"recordAudioAndroid": false');
  });

  it("keeps marketplace tone and the shared seasonal helper", () => {
    expect(app).toContain('market: "#D9AD69"');
    expect(app).toContain("getBlackWaterLeafSeason");
    expect(existsSync(resolve(root, "mobile-natur/src/season.ts"))).toBe(true);
  });

  it("implements every approved Observatory screen without a WebView shell", () => {
    for (const screen of ["botany", "aquarium", "terrarium", "assistant", "live", "photo", "post", "knowledge", "explore", "community", "profile"]) expect(app).toContain(`screen === "${screen}"`);
    expect(app).not.toContain("react-native-webview");
    expect(app).not.toContain("<WebView");
  });

  it("keeps the four regular Observatory navigation destinations and a reachable marketplace", () => {
    for (const label of ["Home", "Entdecken", "Community", "Profil"]) expect(app).toContain(`label: "${label}"`);
    for (const token of ["onMarketplace()", 'name="storefront-outline"', "Marketplace", '"marketplace"']) expect(app).toContain(token);
  });

  it("uses renamed compact Observatory primitives for native actions", () => {
    for (const token of ["ObservatoryContextHeader", "ObservatoryActionCluster", "ObservatoryActionRow", "observatoryActionRowCompact", "selectionCollapsed", "ALLE WERKZEUGE", "LayoutAnimation.Presets.easeInEaseOut"]) expect(app).toContain(token);
    for (const retired of ["ReferenceHero", "ReferenceCard", "ActionGrid", "referenceCardCompact"]) expect(app).not.toContain(retired);
  });

  it("provides a consent-gated native community photo flow", () => {
    for (const token of ["function PostScreen", "choosePostImage", "launchImageLibraryAsync", "uploadCommunityDraftImage(token", 'purpose: "media_processing"', "24 * 1024 * 1024", "maxDimension = 4096", "ImageManipulator.SaveFormat.JPEG", "UPLOAD ABGESCHLOSSEN"]) expect(app).toContain(token);
  });

  it("offers explicit realm routing and an admin-only all-feeds recipient", () => {
    for (const token of ['"ALLE FEEDS · ADMIN"', "realm: adminAllFeeds ? null : realm", '(["botany", "aquarium", "terrarium", "all"] as const)', "setRealm(post.realm ?? null)"]) expect(app).toContain(token);
    expect(api).toContain("invalid_image_size");
    expect(api).toContain("Der Upload ist zu groß");
  });

  it("keeps native follow state and profile lists wired to the live social contract", () => {
    for (const token of ["socialRelationship", "followProfile", "unfollowProfile", "socialFollowers", "socialFollowing", "setRelationship(await socialRelationship(token, profileId))", "NICHT MEHR FOLGEN", "FOLGEN"]) expect(`${api}\n${app}`).toContain(token);
  });

  it("uses symmetrical header and profile-menu icon layout", () => {
    for (const token of ["headerAction: {", "width: 40", "height: 40", "nativeProfileMenuItem: {", 'flexDirection: "row"', "size={21}"]) expect(app).toContain(token);
  });
});
