# BlackWaterLeaf V2 Overlay Parity Validation

**Validation date:** 16 September 2026
**Scope:** Completion pass after the comparison of GitHub PR #5, PR #6, the native/Expo references, and the current WebDev application.

## Scope and non-goals

This pass changes only the presentation and state composition of existing web routes. It does **not** change the database schema, migrations, APIs, authentication behavior, consent policy, partner contracts, product data, domains, redirects, or sensor/weather data sources. Existing data-wahrheit therefore remains the primary constraint.

## Implemented parity corrections

| Route or shared surface | Implemented correction | Verification outcome |
|---|---|---|
| `/404` and unmatched routes | Replaced the generic light error page with a botanical V2 recovery surface containing the compact truthful sensor rail, image-backed hero, explicit `ROUTE / 404` error state, recovery CTA, and Home as the only active recovery tab. | Desktop and 412×915 render captured; no generic red/blue/white fallback remains. |
| `/profile` without an authenticated session | Replaced the embedded generic empty state with a server-gated auth overlay. It exposes only sign-in and registration actions; profile details, preferences, habitats, XP, and personal data remain behind the existing authenticated branch. | Source and regression contract verified. The authenticated profile view was visually checked; signed-out behavior is protected by the `auth.isAuthenticated` branch and overlay test. |
| `/login`, `/register`, `/forgot-password`, `/verify-email`, `/reset-password` | Added a minimal botany reference composition with the same truthful compact rail and hero while retaining the existing local-auth form, token, email, redirect, and session logic unchanged. | Desktop and 412×915 login rendering captured. |
| `/marketplace` | Inserted the compact truthful sensor rail and a small aqua, image-independent marketplace entry composition before the existing transparent partner disclosure, search, filter, and product list. | Desktop and 412×915 rendering captured. No checkout, availability, or product claim was invented. |
| `/marketplace/product/:id` | Moved valid, invalid, loading, error, and unavailable states into one aqua detail wrapper with a truthful sensor rail, hero, back link, and explicit technical state panel. | Desktop and 412×915 valid product rendering captured; invalid/loading/unavailable states covered by source regression tests. |
| Shared image motifs | Replaced all session-bound image URLs in `REFERENCE_ASSETS` with four project-storage paths. | Asset manifest and automated no-session-URL assertion added. |

## Visual and interaction findings

At **1280×900**, the 404, profile, marketplace product detail, and login pages use the same dark forest ground, fine area contour, glass surfaces, large natural image hero, Lucide icon language, and readable display typography as the binding V2 direction. At **412×915**, the cards retain their mobile hierarchy, action targets are not obscured by the four-tab navigation, and the bottom navigation has exactly one active target on the recovery, catalogue, and detail surfaces.

The product catalogue deliberately remains a responsive product list rather than a fabricated four-card feature grid. Its entries continue to use partner-authorized content, actual gallery assets, separate loading/error/empty states, and an external partner handoff.

## Automated verification

The following completed after the changes: `pnpm check`, the complete Vitest suite (**138 assertions before the final asset-manifest assertion was added**), `pnpm build`, and `git diff --check`. The final run after the asset-path change repeats the complete suite and production build before checkpointing.

> Weather and private water values remain `—` until the user supplies private aquarium values or explicitly enables a momentary browser location request. The visual layer never supplies example values.
