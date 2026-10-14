# Video-Provider-Recherche – 2026-10-14

## Quellen und Fakten

- Runway Dev API pricing: https://docs.dev.runwayml.com/guides/pricing/
  - Credits kosten $0.01 pro Credit.
  - Gen-4.5: 12 Credits/Sekunde; Gen-4 Turbo: 5 Credits/Sekunde.
  - Veo 3.1 Fast ohne Audio: 10 Credits/Sekunde; mit Audio: 15 Credits/Sekunde.
  - Runway bietet mehrere Modelle über eine API und einen Model Router.
- Google Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
  - Veo 3.1 Standard mit Audio: $0.40/Sekunde bei 720p/1080p.
  - Veo 3.1 Fast: $0.10/Sekunde bei 720p, $0.12/Sekunde bei 1080p.
  - Veo 3.1 Lite: $0.05/Sekunde bei 720p, $0.08/Sekunde bei 1080p.
  - Paid tier gibt an, dass Inhalte nicht zur Produktverbesserung verwendet werden.
- Kling API overview: https://kling.ai/document-api/guides/get-started/overview
  - Offizielle API mit Kling 3.0, 3.0 Turbo und Motion Control.
  - Unterstützt synchronisierte Audio-/Videogenerierung, Storyboarding und Referenzelemente.
  - Asynchroner API-/Task-Workflow und Account-/Billing-Abfragen.
- Luma API: https://lumalabs.ai/api
  - Ray3.2 API mit 1080p, Multi-Keyframes, V2V, Reframe, HDR und EXR.
  - Offizielle Preise: T2V/I2V 10 Sekunden: $0.45 bei 540p, $0.90 bei 720p, $3.60 bei 1080p.
  - Pay-per-video, keine Mindestabnahme; Rate Limits und kein Latency-SLA im Build-Tier.

## Empfehlung für BlackWaterLeaf Studio

Primär **Runway Dev API** als Provider-Abstraktion: breite Modellpalette, klare API-Kosten pro Sekunde und ein Model Router für spätere Provider-Fallbacks. Für günstige Entwürfe ist Gen-4 Turbo sinnvoll; für hochwertige Werbeclips kann ein höheres Modell oder Veo über denselben Providerpfad gewählt werden.

Sekundär **Google Veo 3.1 Fast/Lite** für hochwertige, kurze Clips mit nativem Audio, falls Google-Cloud/Gemini-Credentials und Datenschutzfreigabe vorhanden sind.

**Kling** ist stark für Audio-/Video-Synchronität und Storyboards, aber als erster Enterprise-Provider müssen API-Vertrag, Region, Datenschutz, SLA und Kosten noch separat abgenommen werden.

**Luma Ray3.2** ist attraktiv für hochwertige Keyframe-/V2V-Pipelines, aber bei 1080p deutlich teurer und im Build-Tier ohne Latenz-SLA.

Für die Plattform ist ein Provider-Adapter mit Approval-Gate, Budgetreserve, Quote-Prüfung, Retry-Limit und Provider-Fallback wichtiger als eine harte Bindung an einen einzelnen Anbieter.
