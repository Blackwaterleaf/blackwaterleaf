import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StatePanel } from "../client/src/components/StatePanel";

function routeSource(fileName: string) { return readFileSync(new URL(`../client/src/pages/${fileName}`, import.meta.url), "utf8"); }

describe("honest UI state contract", () => {
  it("renders explicit status text and never invents fallback content", () => {
    const html = renderToStaticMarkup(React.createElement(StatePanel, { code: "FEED/EMPTY", title: "Keine echten Daten vorhanden", body: "Es werden keine Beiträge, Personen oder Interaktionen erfunden." }));
    expect(html).toContain("FEED/EMPTY"); expect(html).toContain("Keine echten Daten vorhanden"); expect(html).toContain("keine Beiträge, Personen oder Interaktionen erfunden");
  });

  it("declares loading, error and empty feed states on Home", () => {
    const source = routeSource("Home.tsx");
    expect(source).toContain('code="FEED/CONNECT"'); expect(source).toContain('code="FEED/ERROR"'); expect(source).toContain('t("home.feed.emptyTitle")');
  });

  it("declares authorization, loading and error states for Profile and each Realm", () => {
    const profile = routeSource("Profile.tsx"); const realm = routeSource("Realm.tsx");
    for (const token of ['code="AUTH / REQUIRED"', 'code="PROFILE/LOAD"', 'code="PROFILE/ERROR"']) expect(profile).toContain(token);
    for (const token of ['code="AUTH / REQUIRED"', 'code="OBS/LOAD"', 'code="OBS/ERROR"', 'OBS / ${realm.api.toUpperCase()} / EMPTY']) expect(realm).toContain(token);
  });

  it("declares real feed, knowledge and AI policy states", () => {
    const community = routeSource("Community.tsx"); const knowledge = routeSource("Knowledge.tsx"); const assistant = routeSource("Assistant.tsx");
    for (const token of ['code="FEED/CONNECT"', 'code="FEED/ERROR"', 'code="FEED / EMPTY"']) expect(community).toContain(token);
    for (const token of ['code="KNOWLEDGE/CONNECT"', 'code="KNOWLEDGE/ERROR"', 'code="WISSEN / EMPTY"']) expect(knowledge).toContain(token);
    for (const token of ["AI/CHECKING", "AI/STATUS_ERROR", "AI/POLICY_LOCK"]) expect(assistant).toContain(token);
  });
});
