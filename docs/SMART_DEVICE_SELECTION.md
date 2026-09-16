# Smart-device selection and future water-value synchronization

## Delivered selection flow

Signed-in members can open **Profile → Smart-Werte verbinden → Smart-Gerät verbinden**. The dialog lets them choose an integration class, an optional target aquarium, an optional manufacturer/model label, and the values that may eventually be synchronized. Current selection classes are Home Assistant, aquarium controller, water monitor, Zigbee/Matter, and another smart device. Available measurement selections are water temperature, pH, GH, KH, nitrite, nitrate, and conductivity.

The selection is deliberately a private planning record rather than an active connection. Every saved item is shown as **awaiting manufacturer authorization**. The dialog explicitly says that no access data are requested in this step, and a user can delete a saved selection at any time.

## Security and data boundary

The new table only records the account owner, optional owned aquarium, device category, optional model label, selected metric names, and connection state. It stores neither passwords nor API keys and it contains no automatically collected water readings. A server-side ownership check ensures that a connection can only be assigned to an aquarium belonging to the signed-in account. The create, list, and removal endpoints all require an active authenticated user.

## Synchronization prerequisite

Automatic updates must be added separately for a specific vendor or Home Assistant configuration. The implementation will need a documented, revocable authorization method, encrypted server-side credentials where applicable, read-only scopes, a concrete metric mapping, and an explicit choice of aquarium. Until then, all current water values remain user-maintained and no device is represented as connected.

## Visual verification

The signed-in mobile profile view was reviewed on 16 September 2026. The smart-device entry appears after the private habitats section, uses the established green BlackWaterLeaf visual system, and presents the single action as a full-width, touch-friendly control.
