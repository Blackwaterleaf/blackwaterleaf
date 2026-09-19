# BlackWaterLeaf Studio – App-Builder-MVP

Der App-Builder-MVP führt drei Produktbausteine zusammen: ein Projektprofil für **Web** oder **Web + Native**, einen kontrollierten Code-Arbeitsbereich und getrennte Preview-/Staging-Gates. Das Projektprofil speichert Zielgruppe, Plattformen, Datenklassifikation, Integrationen, Lieferumfang, Budget und ein freies Produktbriefing. Daraus wird ein versionierter initialer Plan mit Anforderungen, Architektur, Testplan, Risiken und Kostenschätzung erzeugt. Bei Web + Native bleibt die spätere Expo-/React-Native-Ausgabe als eigene Zielspur sichtbar; sie wird nicht fälschlich als automatische Web-to-Native-Konvertierung behandelt.

Der Code-Arbeitsbereich speichert Dateien workspace-isoliert mit SHA-256-Hash und Versionsnummer. Änderungen können als Draft-Patch protokolliert werden. Der MVP führt keine ungeprüften Patches automatisch aus und behauptet keinen erfolgreichen Build, solange kein isolierter Execution Worker verfügbar ist.

Preview und Staging sind getrennte Umgebungsdatensätze. Eine Preview-Anforderung erzeugt ein zeitlich begrenztes Approval-Objekt, ein Preview-Gate mit Build-Referenz und den Status `awaiting_approval`. Reviewer können die Preview genehmigen oder ablehnen; eine Staging-Anfrage ist nur nach genehmigter Preview möglich und bleibt bis zum späteren Sandbox-, Test- und Release-Gate blockiert. Damit bleibt die Produktwahrheit erhalten: Die Control Plane kann Projekte und geplante Änderungen verwalten, aber sie führt aktuell keinen generierten Code auf dem Control-Plane-Host aus.

## Nächster technischer Ausbau

Als nächster Schritt benötigt der MVP eine echte Execution Plane: kurzlebige isolierte Worker, Secret-Broker, Egress-Proxy, Test-Runner und Artefakt-Scanner. Erst danach dürfen Preview-URLs, automatische Reparaturschleifen und Staging-Promotion als reale Laufzeitfunktionen freigeschaltet werden.
