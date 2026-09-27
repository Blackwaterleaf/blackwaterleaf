import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const detailContracts = [
  ["../client/src/pages/CommunityPostDetail.tsx", ["COMMUNITY_DETAIL/AUTH_REQUIRED", "COMMUNITY_DETAIL/UNAVAILABLE", "post.isError || !post.data"]],
  ["../client/src/pages/LiveSession.tsx", ["LIVE_SESSION/AUTH_REQUIRED", "LIVE_SESSION/UNAVAILABLE", "session.isError || !session.data"]],
  ["../client/src/pages/MarketplaceShop.tsx", ["MARKET/SHOP_ROUTE", "MARKET/SHOP_UNAVAILABLE", "!validId", "!shop"]],
  ["../client/src/pages/MarketplaceProduct.tsx", ["MARKET/ROUTE", "MARKET/DETAIL_UNAVAILABLE", "!hasValidId", "!item"]],
  ["../client/src/pages/PlantTaxon.tsx", ["PLANT/EMPTY", "plant.isError || !plant.data", "Dieser Datensatz ist nicht veröffentlicht"]],
  ["../client/src/pages/AquariumTaxon.tsx", ["AQUARIUM/EMPTY", "fish.isError || !fish.data", "Dieser Datensatz ist nicht veröffentlicht"]],
  ["../client/src/pages/TerrariumTaxon.tsx", ["TERRARIUM/EMPTY", "taxon.isError || !taxon.data", "Dieser Datensatz ist nicht veröffentlicht"]],
  ["../client/src/pages/PublicProfile.tsx", ["PUBLIC_PROFILE/EMPTY", "profile.isError || !profile.data", "Dieses Profil ist nicht verfügbar"]],
] as const;

describe("detail route invalid-id and empty-response fallbacks", () => {
  it("keeps every detail route defensive when its API returns no record", () => {
    for (const [file, tokens] of detailContracts) {
      const source = read(file);
      for (const token of tokens) expect(source, `${file} should contain ${token}`).toContain(token);
    }
  });

  it("does not enable detail queries for non-positive or non-safe IDs", () => {
    for (const [file, tokens] of [
      ["../client/src/pages/CommunityPostDetail.tsx", ["Number.isSafeInteger(postId) && postId > 0"]],
      ["../client/src/pages/LiveSession.tsx", ["Number.isSafeInteger(id) && id > 0"]],
      ["../client/src/pages/MarketplaceProduct.tsx", ["Number.isInteger(id) && id > 0", "enabled: hasValidId"]],
      ["../client/src/pages/PlantTaxon.tsx", ["Number.isSafeInteger(id) && id > 0"]],
      ["../client/src/pages/AquariumTaxon.tsx", ["Number.isSafeInteger(id) && id > 0"]],
      ["../client/src/pages/TerrariumTaxon.tsx", ["Number.isSafeInteger(id) && id > 0"]],
      ["../client/src/pages/PublicProfile.tsx", ["Number.isSafeInteger(id) && id > 0"]],
    ] as const) {
      const source = read(file);
      for (const token of tokens) expect(source, `${file} should guard ${token}`).toContain(token);
    }
  });
});
