# BlackWaterLeaf KI-Ergebnis · zwei Layout-Muster

## Screenshot-Audit

Der erste Pflanzen-Suchscreen ist fachlich klar, wirkt aber visuell noch wie ein Analyseformular aus einem Prototyp. Das Foto nimmt fast die gesamte Höhe ein, während der eigentliche Status nur als breite, violette Schaltfläche und ein kleiner Ladeblock erscheint. Dadurch entsteht kein eindeutiger Ablauf: **Foto → Prüfung → Ergebnis**.

Weitere konkrete Punkte:

- Der violette Flächenanteil dominiert den Naturinhalt und steht nicht sauber im Verhältnis zum Observatory-Grün.
- Die Ladeanzeige kommuniziert nur „läuft“, aber nicht, welcher Schritt gerade aktiv ist.
- Der Button wirkt während der Analyse wie ein deaktiviertes Eingabefeld statt wie ein sicher laufender Prozess.
- Das spätere Ergebnis wird als Textblock erwartet. Kandidaten, Sicherheit und unabhängige Prüfung sollten zuerst visuell scanbar sein.
- Web und Native benötigen dieselbe Informationsreihenfolge, dieselben Begriffe und dieselbe Ladephasenlogik.

## Muster A · Evidence Rail (produktiv umgesetzt)

**Ziel:** Fachliche Sicherheit und Quellenbezug zuerst sichtbar machen.

1. Bild als ruhige, proportionierte Vorschau.
2. Eine kompakte Analysekarte mit Orb, aktivem Status und drei Phasen: **Bild vorbereiten · Merkmale prüfen · Quellen abgleichen**.
3. Ergebnis-Kopf mit **Analyse abgeschlossen · vorläufig**.
4. Kandidatenkarten mit wissenschaftlichem Namen, Begründung und Sicherheit.
5. Danach Merkmals-Chips, weitere Bilder und unabhängige Prüfung.
6. Der vollständige Antworttext bleibt als nachvollziehbare Detailansicht erhalten.

Dieses Muster ist der neue Standard für Web und Native. Es nutzt Observatory-Grün als Systemakzent; Realm-Farben bleiben nur dort erhalten, wo sie fachlich relevant sind. Alle Bewegungen sind kurz, GPU-freundlich und bei `prefers-reduced-motion` deaktiviert.

## Muster B · Focus Card (Alternative für A/B-Abnahme)

**Ziel:** Noch kompaktere mobile Analyse mit maximalem Fokus auf das Bild.

1. Bild in einer festen 16:10-Karte.
2. Status als schmale, schwebende Fußleiste am Bildrand.
3. Fortschritt als drei nummerierte Punkte mit nur einem aktiven Punkt.
4. Nach Abschluss wird die Fußleiste durch eine Ergebnisplakette ersetzt.
5. Kandidaten erscheinen als horizontale Swipe-Karten; Quellen öffnen in einem separaten Detailpanel.

Muster B eignet sich besonders für die Native-App auf kleinen Geräten. Es wird zunächst als visuelle Alternative dokumentiert, aber nicht parallel als zweiter Produktpfad aktiviert. So bleibt die 1:1-Parität stabil und es entstehen keine abweichenden Daten- oder Navigationsverträge.

## Verbindliche Umsetzung

- Web und Native zeigen dieselben drei Ladephasen und dieselbe deutsche Beschriftung.
- Kein KI-Ergebnis darf als sichere Artbestimmung dargestellt werden.
- Kandidaten, Merkmale und unabhängige Prüfung kommen vor dem langen Antworttext.
- Es werden keine Scheinquellen, Fundorte oder Messwerte ergänzt.
- Bilder bleiben nur für die einzelne Bestimmungsanfrage im Verarbeitungspfad; die Oberfläche nennt weiterhin **keine Bildspeicherung**. Ein sieben Tage gültiger, datensparsamer Resultatcache darf ausschließlich Fingerabdruck, strukturierte Ausgabe und Prüfstatus ohne Bildbytes enthalten.
- Die KI-Schnellroute bleibt `/assistant#plant` im Web und `assistant` mit Pflanzenwerkzeug in Native.
