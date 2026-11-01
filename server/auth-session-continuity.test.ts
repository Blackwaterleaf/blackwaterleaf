import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

describe("browser session continuity", () => {
  it("never starts OAuth automatically from a query or mutation authorization error", () => {
    const main = source("../client/src/main.tsx");
    const session = source("../client/src/_core/authSession.ts");

    expect(main).toContain("publishSessionExpired(error)");
    expect(main).not.toContain("startLogin");
    expect(session).toContain("AUTH_SESSION_EXPIRED_EVENT");
    expect(session).not.toContain("window.location");
  });

  it("turns an expired response into local auth state and revalidates on window focus", () => {
    const auth = source("../client/src/_core/hooks/useAuth.ts");

    expect(auth).toContain("AUTH_SESSION_EXPIRED_EVENT");
    expect(auth).toContain(
      "window.addEventListener(AUTH_SESSION_EXPIRED_EVENT"
    );
    expect(auth).toContain("utils.auth.me.setData(undefined, null)");
    expect(auth).toContain("refetchOnWindowFocus: true");
  });

  it("does not request private habitat or smart-device data before auth is confirmed", () => {
    const habitats = source("../client/src/components/HabitatProfiles.tsx");
    const devices = source("../client/src/components/SmartDeviceDialog.tsx");

    expect(habitats.match(/enabled: auth\.isAuthenticated/g)).toHaveLength(2);
    expect(devices).toContain("enabled: open && auth.isAuthenticated");
  });
});
