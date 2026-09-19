# BlackWaterLeaf Community Detail & Live Hub

- [x] Audit the existing community, social and authenticated-access contracts.
- [x] Add authenticated live-session and live-message schema with migration.
- [x] Protect community feed, post detail, comments and live data with server-side authentication.
- [x] Implement a post-detail route with full discussion, author controls, report/block controls and links from the feed.
- [x] Implement the Live Hub with separate community and verified expert tracks, attendee chat, staff scheduling and truthful availability states.
- [x] Add blocked-account management with unblock controls in the private profile area.
- [x] Extend native parity where existing native Community screens expose matching navigation or controls.
- [x] Add regression coverage, apply database migration, validate web/native builds and save a checkpoint.

## Additional completed SEO correction

The only image in the shared homepage shell now carries the descriptive alternative text `BlackWaterLeaf Logo`. Regression coverage enforces this requirement without changing title, description, keyword or heading lengths.

## Direct live-provider playback

- [x] Accept only normalized YouTube Live and Twitch provider references from staff.
- [x] Embed the active provider player directly in the authenticated Live Hub with a safe external fallback link.
- [x] Add a strict frame-source policy, provider parser tests and official-source implementation notes.


## Live-Control-Deck-Telemetrie

- [x] Ablaufende, konto-gebundene Zuschauer-Präsenz mit 45-Sekunden-Fenster modelliert und migriert.
- [x] Live-Router um geschützten Heartbeat, host-ausgeschlossene aktuelle Zuschauerzahl und Bereinigung erweitert.
- [x] Web-Control-Deck und Live-Hub-Karten um eindeutigen Status, Quelle, Chat-Zustand und aktuelle Zuschauende ergänzt.
- [x] Vollständige Tests, Web-/Native-Build und visuelle Abnahme ausführen.
- [x] Finalen Checkpoint sichern.
