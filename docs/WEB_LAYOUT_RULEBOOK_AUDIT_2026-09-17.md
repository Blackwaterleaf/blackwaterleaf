# BlackWaterLeaf Web Layout Rulebook Audit — 2026-09-17

## Scope

Mobile screenshots were captured for `/`, `/explore`, `/community`, `/assistant`, `/world/botany`, `/world/aquarium`, `/world/terrarium`, `/flow/foto`, `/profile`, `/knowledge`, `/marketplace`, `/marketplace/manage`, `/habitat-builder`, `/flow/live`, `/flow/beitrag`, and `/admin` at 390×844. The native Expo app was not changed.

## Confirmed compliant or improved

- Shared reference action cards are visibly smaller than the previous oversized variant.
- Area accents are stronger and the web surfaces are less uniformly black.
- `/assistant` visibly presents the requested maintenance state rather than a fake or empty AI result.
- `/flow/live` and `/flow/beitrag` follow the reference hero plus compact 2×2 action-card hierarchy.
- `/knowledge` and `/admin` have clear page headings and no duplicate AI tool selector.
- Community and Flow actions use area-specific cards and real routes.

## Rulebook deviations still present

1. `/world/botany`, `/world/aquarium`, and `/world/terrarium` still render the large observation form immediately after the action cards. The mockup rule is: show the four area cards first and open the relevant form only after the user selects the action.
2. `/flow/foto` renders the upload/capture surface before its action selection. The reference order is hero, compact 2×2 choices, then the selected action content.
3. `/flow/live` renders a large empty-state panel before the action cards. The reference order should prioritize the four compact choices directly beneath the hero; connection status can remain below the cards.
4. `/flow/beitrag` renders a composer preview before the action cards, duplicating the “Beitrag verfassen” card. The preview should be hidden until that action is selected, or the card should be the only entry point.
5. `/community` still places the actual composer after the feed in the DOM. The new targeted scroll improves focus but does not fully satisfy the local-open rule; the composer should be placed directly after the action grid when opened.
6. `/profile` is functional but remains information-dense; the habitat, builder, smart-device and settings blocks need a clearer grouped hierarchy for the compact reference language.
7. `/marketplace` and `/marketplace/manage` need a dedicated visual pass; the captured long-page output is too dense to confirm card hierarchy at a glance. Product cards should remain compact and prices should align horizontally.
8. `/habitat-builder` is functionally rich but visibly long; it needs collapsible stages or a clearer staged progression to comply with the “smart and not wüst” requirement.
9. `/admin` is readable but remains a dense audit-ledger page; its numeric overview should remain compact and distinct from the long activity history.

## Required next implementation phase

- Add a shared `selectedAction` / local-panel pattern to Realm and FlowDestination.
- Render the action grid before optional forms and status panels.
- Make `ReferenceActionGrid` support a controlled local panel without duplicate secondary controls.
- Keep all existing backend procedures, private-data boundaries, roles, and native sources unchanged.
- Re-run all 194 tests, TypeScript, production build, and mobile screenshots after the correction.

## Honesty rule

The current checkpoint is not full mockup parity. It is a partial improvement only; the deviations above must be corrected before claiming completion or publishing a final parity checkpoint.
