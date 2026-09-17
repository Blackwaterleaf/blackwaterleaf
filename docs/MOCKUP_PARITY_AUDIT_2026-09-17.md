# Mockup parity audit — 17 September 2026

## Scope

This review compares the current signed-out mobile web render at 412 × 915 with the user-approved BlackWaterLeaf mockups. It covers Botanik, Aquaristik, Terraristik, KI-Assistent and Marktplatz. The review is visual only; it does not change authentication, data access, routes, the database, partner data or AI availability.

## Finding

The first portion of the page hierarchy is structurally correct: the original mark appears top-left, every reviewed destination has a dedicated image hero, the four-choice grids are present and the appropriate accent is visible on the hero borders, icons and dividers. The Marketplace already approaches the approved Amber/Champagne direction more closely than the other sections.

The visual contract is not yet fully met. Aquaristik, Terraristik and KI mostly place their cyan, gold and violet colors on outlines while their interactive card surfaces, form surfaces, action buttons, empty states and page atmosphere retain the earlier universal botanical green. This reads as a green website with colored borders, rather than as separate underwater, rainforest-gold and violet-KI worlds. The visible owner-only analytics permission block also occupies the first screen in this signed-in-owner review state; it must remain private and be accepted or declined once, but must not be judged as destination content.

## Required correction order

| Priority | Correction | Acceptance signal |
|---|---|---|
| 1 | Define one complete area-surface token set for Botanik, Aquaristik, Terraristik, KI and Marktplatz. | No color is introduced ad hoc in a child card. |
| 2 | Propagate the active token into hero overlays, card shades, interactive controls, form/status panels, empty states and focus/active states. | Cyan, gold, violet and amber are visible as surfaces as well as borders. |
| 3 | Keep text white/off-white and preserve image motifs, contrast, route order, 2 × 2 grids and truthful states. | The mockup composition is recognisable and functional content remains clear. |
| 4 | Apply the same semantics to the native Expo source before a further signed build. | Native Home sensor rail remains Home-only; native category surfaces no longer fall back to botanical green. |
| 5 | Capture mobile and desktop renders, run TypeScript/tests/build, then checkpoint. | No navigation, permission, data or accessibility regression. |

## Explicit non-goals

No new mock data, artificial sensor values, publication, domain change, database migration, GitHub change, store submission, key handling or Expo build is part of this audit.

## Complete mobile route pass

A full mobile top-viewport pass was captured for Home, Explore, Community, Profile, Knowledge, photo flow, contribution flow and signed-out Habitat Builder in addition to the area pages covered above. No route rendered a browser 404 page, and the Home-only condition for the live sensor rail is respected. The Profile view is correctly focused and does not repeat the sensor rail or a second image hero.

The shared issue remains surface hierarchy rather than routing: many functional panels that sit below an otherwise correct area-specific hero inherit the botanical green glass background. The correction must therefore be central rather than a sequence of isolated border edits. The same token approach will be applied to the Expo source before a new EAS build is requested.

## Post-correction render

The corrected mobile render now visibly separates the area worlds: Aquaristik reads cyan across page atmosphere, action-card surfaces and controls; Terraristik reads gold/olive across the same layers; KI reads violet across the page body, cards and controls; Marktplatz reads warm amber/champagne across its entry, trust and content panels. TypeScript passes for both Web and Expo.

One refinement remains visible: a few Marketplace nested controls still use the former cyan/teal generic control treatment inside the now-amber panels. These selectors will be narrowed to the Marketplace amber contract before release verification.

## Final mobile surface verification

The final 412 × 915 capture shows the expected separation on Aquaristik, Terraristik, KI and Marktplatz. The Marketplace call-to-action is now amber rather than cyan, while its external-partner disclosure remains readable. Home keeps the compact 2 × 2 sensor rail and the truthful location action; no artificial reading was introduced. The owner-only reach prompt remains a private system consent, not page content.

## Desktop verification

The 1440 × 1000 render confirms that all audited desktop routes preserve the reference composition: centered content column, original mark, responsive hero proportions, 2 × 2 card grids, bottom navigation, focused Profile, functional Community/Knowledge states and the authenticated Builder gate. Aquaristik, Terraristik, KI and Marktplatz retain their area surfaces at desktop width.

Two final Marketplace details are visible in the desktop capture: the trust icon and the active bottom-navigation Marketplace icon still use the legacy cyan rule. Both are purely visual selector remnants and will be changed to Amber/Champagne before release.

The corrected desktop capture confirms both details now use the warm Marketplace tone: the trust icon is champagne and the active Marktplatz tab is amber. The parallel mobile capture request was rejected by argument parsing only; no application change was involved and the earlier mobile route capture already verified the same CSS surface behavior.

The standalone 412 × 915 Marketplace capture confirms the same result on the phone breakpoint: Amber/Champagne is applied to the CTA, trust icon, page panels and active Marktplatz tab; the remaining cyan elements are limited to the global informational search icon treatment and do not represent Marketplace state.

## Global nested-surface verification

The user reported that the same regression appeared beyond KI. A fresh 412 × 915 capture was therefore taken for Aquaristik, Terraristik, KI, Marktplatz, Community, Profile, Wissen and Foto. The global nested-surface correction now carries each route tone into the functional content below the hero: Cyan on Aquaristik panels, Gold on Terraristik panels, Violet on KI workflow and chat panels, Amber on Marketplace commerce controls, and botanical green on Community/Profile/Wissen/Foto. The original mark, functional icons, route order, Home-only sensor rule and real-data states remain unchanged.

The correction is CSS-only. No database, server procedure, auth/session, upload, media, marketplace record, sensor value or user data was changed or deleted. The screenshot capture was preview-only; no publication was performed after this correction.
