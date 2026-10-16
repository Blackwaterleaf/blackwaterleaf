# BlackWaterLeaf · KI-Ergebnis-Workspace

## Video-Befund

Die Aufnahme zeigt einen funktionierenden Analyseablauf, aber nach Abschluss wird das Ergebnis direkt unter Foto, Beobachtungsfeld und Analysebutton angehängt. Dadurch bleibt die Eingabe visuell dominant, die Kandidaten werden wiederholt und die rohe KI-Einordnung erzeugt eine lange Textfläche. Das Problem ist damit nicht die Analyse selbst, sondern die fehlende Trennung von **Eingabe**, **Ergebnis** und **Detailtiefe**.

## Muster A · Evidence Rail

Dieses Muster ist für schnelle mobile Prüfungen gedacht. Oben stehen Status, Top-Kandidat und Sicherheitsgrad. Darunter folgen Kandidaten, Merkmals-Chips, weitere Bildanforderungen und unabhängige Prüfung als kompakte Karten. Die KI-Rohantwort wird in einem Akkordeon verborgen.

**Vorteil:** sehr schnell scannbar und platzsparend. **Nachteil:** das Analysefoto bleibt nur als kleines Kontextbild sichtbar; komplexere Ergebnisse benötigen trotzdem vertikales Scrollen.

## Muster B · Result Workspace (aktiv)

Dieses Muster trennt den Analysekontext klar vom Ergebnis. Auf Desktop steht das Originalbild in einer sticky Kontextspalte, daneben liegen Hero-Kandidat, Evidenzkarten und die eingeklappte KI-Einordnung. Auf Mobil wird die Kontextspalte zu einer kompakten Bildzeile mit direktem Einstieg in „Weiteres Bild“. „Neue Analyse“ bleibt im Kopfbereich erreichbar.

**Vorteil:** deutlich professionelleres Mental Model, weniger Scrollen, keine Textwand im Standardzustand und dieselbe Struktur für Botanik und Aquaristik. **Nachteil:** etwas mehr Fläche für den Ergebnis-Header; dieser Trade-off ist für Lesbarkeit und Vertrauen bewusst gewählt.

## Verbindliche Entscheidung

Muster B ist der neue Standard in Web und Native. Muster A bleibt als reduzierter Fallback für kleine Geräte und reduzierte Bewegung erhalten. Rohtext wird niemals ungefragt als Primärinhalt geöffnet. Die Fachakzente bleiben unverändert: Limette für Botanik, Cyan für Aquaristik/Fisch und Violett für den allgemeinen KI-Chat.

## Nächste technische Ausbaustufe

Der Workspace kann anschließend ohne Datenmodelländerung auf eine eigene URL `/assistant/result` gehoben werden, sobald Ergebniszustände über eine kurzlebige, geschützte Session-ID statt ausschließlich im lokalen React-State transportiert werden. Für den aktuellen Stand wurde bewusst zuerst die visuelle und strukturelle Korrektur umgesetzt, ohne Analyse- oder Nutzerdaten zu duplizieren.
