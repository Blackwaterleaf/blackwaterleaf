import { expect, test, type Page } from "@playwright/test";

const routes = [
  "/admin", "/admin/overview", "/login", "/register", "/forgot-password", "/verify-email", "/reset-password",
  "/", "/explore", "/search", "/catalog", "/community", "/community/post/1", "/live", "/live/1",
  "/notifications", "/messages", "/feedback", "/pro", "/datenschutz", "/privacy", "/impressum", "/today",
  "/assistant", "/profile", "/profile/manage", "/member/1", "/plant/1", "/aquarium-fish/1", "/terrarium/1",
  "/saved", "/ranking", "/profile/settings", "/profile/private", "/profile/habitats", "/profile/progress",
  "/profile/privacy", "/profile/preferences", "/profile/tools", "/knowledge", "/wissen", "/feed", "/community/feed",
  "/botanik", "/aquaristik", "/terraristik", "/shop", "/marketplace/shop/1", "/marketplace/product/1",
  "/marketplace/manage", "/marketplace", "/flow/foto", "/world/botany", "/404", "/route-that-does-not-exist",
];

const invalidDetailRoutes: Array<{ path: string; expected: string }> = [
  { path: "/marketplace/shop/not-a-number", expected: "SHOP NICHT GEFUNDEN" },
  { path: "/marketplace/product/not-a-number", expected: "PRODUKT NICHT GEFUNDEN" },
  { path: "/plant/not-a-number", expected: "PFLANZE NICHT GEFUNDEN" },
  { path: "/aquarium-fish/not-a-number", expected: "FISCH NICHT GEFUNDEN" },
  { path: "/terrarium/not-a-number", expected: "TIER NICHT GEFUNDEN" },
];

const emptyDetailRoutes: Array<{ path: string; expected: string }> = [
  { path: "/community/post/999999999", expected: "ANMELDUNG ERFORDERLICH" },
  { path: "/live/999999999", expected: "ANMELDUNG ERFORDERLICH" },
  { path: "/marketplace/shop/999999999", expected: "SHOP NICHT VERFÜGBAR" },
  { path: "/marketplace/product/999999999", expected: "ANGEBOT NICHT VERFÜGBAR" },
  { path: "/plant/999999999", expected: "PFLANZE NICHT GEFUNDEN" },
  { path: "/aquarium-fish/999999999", expected: "FISCH NICHT GEFUNDEN" },
  { path: "/terrarium/999999999", expected: "TIER NICHT GEFUNDEN" },
  { path: "/member/999999999", expected: "PROFIL NICHT ÖFFENTLICH" },
];

const emptyApiProcedures = [
  "community.byId", "live.byId", "partners.marketplace", "partners.marketplaceProduct",
  "search.plantById", "search.aquariumById", "search.terrariumById", "profile.publicById",
];

async function mockEmptyDetailResponses(page: Page) {
  await page.route("**/api/trpc/**", async route => {
    const procedure = new URL(route.request().url()).pathname.split("/api/trpc/")[1] ?? "";
    if (!emptyApiProcedures.some(name => procedure.includes(name))) return route.continue();
    let body: unknown = null;
    if (route.request().method() !== "GET") {
      try { body = route.request().postDataJSON(); } catch { body = null; }
    }
    const response = Array.isArray(body)
      ? body.map(() => ({ result: { data: { json: null } } }))
      : { result: { data: { json: null } } };
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(response) });
  });
}

async function collectRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
  page.on("response", response => {
    if (response.status() >= 500 && !new URL(response.url()).pathname.startsWith("/api/")) {
      errors.push(`http ${response.status()}: ${response.url()}`);
    }
  });
  return errors;
}

test.describe("BlackWaterLeaf browser route smoke test", () => {
  for (const route of routes) {
    test(`${route} loads without a browser runtime error`, async ({ page }) => {
      const errors = await collectRuntimeErrors(page);
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${route} HTTP status`).toBe(200);
      await expect(page.locator("#root")).toBeVisible();
      await page.waitForTimeout(350);
      expect(errors, `${route} runtime errors`).toEqual([]);
      await expect(page.locator("text=APPLICATION ERROR")).toHaveCount(0);
    });
  }

  for (const detail of invalidDetailRoutes) {
    test(`${detail.path} shows its invalid-id fallback`, async ({ page }) => {
      const errors = await collectRuntimeErrors(page);
      await page.goto(detail.path, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: detail.expected, exact: false }).last()).toBeVisible();
      expect(errors, `${detail.path} runtime errors`).toEqual([]);
    });
  }

  for (const detail of emptyDetailRoutes) {
    test(`${detail.path} renders a safe empty-response state`, async ({ page }) => {
      const errors = await collectRuntimeErrors(page);
      await mockEmptyDetailResponses(page);
      await page.goto(detail.path, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: detail.expected, exact: false }).last()).toBeVisible();
      expect(errors, `${detail.path} runtime errors`).toEqual([]);
    });
  }
});
