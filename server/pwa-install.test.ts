import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const html = readFileSync(resolve(root, "client/index.html"), "utf8");
const main = readFileSync(resolve(root, "client/src/main.tsx"), "utf8");
const home = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");
const installControl = readFileSync(resolve(root, "client/src/components/InstallAppButton.tsx"), "utf8");
const manifest = JSON.parse(readFileSync(resolve(root, "client/public/manifest.webmanifest"), "utf8")) as Record<string, unknown>;
const worker = readFileSync(resolve(root, "client/public/service-worker.js"), "utf8");

describe("installable web app", () => {
  it("declares a BlackWaterLeaf standalone manifest with real app icons", () => {
    expect(manifest).toMatchObject({ name: "BlackWaterLeaf", display: "standalone", start_url: "/", scope: "/" });
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(html).toContain('rel="manifest"');
    expect(html).toContain('blackwaterleaf-192.png');
  });

  it("offers a transparent install action in the home experience", () => {
    expect(home).toContain("InstallAppButton");
    for (const token of ["beforeinstallprompt", "appinstalled", "APP INSTALLIEREN", "Zum Home-Bildschirm", "Chrome, Edge oder Safari"]) {
      expect(installControl).toContain(token);
    }
  });

  it("routes Android browsers to the verified native update instead of presenting a PWA as an APK", () => {
    for (const token of ["isAndroidBrowser", "ANDROID_UPDATE_URL", "BlackWaterLeaf-1.0.4-signed-update_dce89576.apk", "ANDROID-UPDATE 1.0.4", "Signiertes Android-Update 1.0.4"]) {
      expect(installControl).toContain(token);
    }
  });

  it("registers only the service worker in production and avoids caching private or API content", () => {
    expect(main).toContain('import.meta.env.PROD');
    expect(main).toContain('serviceWorker.register("/service-worker.js")');
    expect(worker).toContain('url.pathname.startsWith("/api/")');
    expect(worker).toContain("acceptsHtml");
    expect(worker).toContain("cacheableStaticAsset");
  });
});
