# Habitat Builder validation record — 16 September 2026

## Scope

The private `/habitat-builder` feature was reviewed against the binding V2 reference-overlay system after the production build. Validation used the active WebDev preview at the mobile 390 × 844 breakpoint and a signed-out browser visit.

## Findings

The signed-out route presents the existing application shell, Live-Sensor strip, aquarium-toned image hero, explicit `AUTH / REQUIRED` state and the nonce-protected **SICHER ANMELDEN** action. It does not disclose any private habitat record, measurement or local draft content.

At the mobile breakpoint, the authenticated preview preserves the dark botanical, card-led reference composition: aquarium cyan is used for selection and dimensional work; green governs plant and structure choices; gold reserves the safety gate. The choice areas render in a two-column grid, cards remain legible, and the full-page capture excludes the normal fixed bottom navigation by design. The route remains inside `AppShell`, so the five-destination bottom navigation is present in the live non-full-page experience.

The scene deliberately combines an interactive glass-and-dimension view with a supplied, privately stored photorealistic reference backdrop. It makes no claim that the scene is a generated or approved PBR asset. A visible statement blocks PBR activation pending separate approval.

## Security and product-truth boundaries

The page consumes only the existing protected `habitats.mine` contract. It filters client-side only after the server has returned the authenticated user’s own records, and has no write path to the habitat table. Browser-local variants are explicitly labelled as device-local and only export user-selected JSON. No database migration, Tripo generation request, external handoff, PBR manifest activation, deployment or domain change was performed.

## Follow-up condition

A Tripo V3 credential must first be repaired externally and shown to pass a read-only balance call before any model generation, asset quality review, licence verification, or PBR activation may be considered. None of these actions is part of this checkpoint.
