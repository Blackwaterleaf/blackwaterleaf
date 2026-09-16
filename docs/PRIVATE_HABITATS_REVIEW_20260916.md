# BlackWaterLeaf – Prüfung „Meine Anlagen & Werte"

**Prüfdatum:** 16. September 2026
**Prüfumfang:** neu synchronisierte private Anlagenverwaltung für Aquarien, Pflanzen und Terrarien.

| Kontrollpunkt | Nachweis | Ergebnis |
|---|---|---|
| Datenvertrag | Drei diskriminierte, gemeinsame Detailverträge erzwingen zulässige Bereiche und erhalten leere optionale Werte als `null`; zulässige Nullwerte wie pH 0, 0 °C und 0 % werden auch in der Kurzansicht ausgegeben. | bestanden |
| Datenbank | Migration `0007_ancient_klaw.sql` legt ausschließlich die Tabelle `private_habitats`, deren Fremdschlüssel und Index an. | bestanden |
| Eigentum | Lesen, Anlegen und Ändern beschränken jede Abfrage auf die serverseitige Nutzer-ID der verifizierten Sitzung. | bestanden |
| Sichtbarkeit | Die Oberfläche erklärt, dass Anlagen nicht im öffentlichen Profil oder der Community erscheinen; der Router besitzt keinen öffentlichen Listenendpunkt. | bestanden |
| Fehlerbehandlung | Der fehlende `TRPCError`-Import wurde korrigiert; Datenbank- und Not-found-Fehler sind jetzt typkorrekt erreichbar. | bestanden |
| Internationalisierung | Alle sichtbaren Anlagen-, Formular-, Status- und Einheitenbezeichnungen stammen aus dem bestehenden deutsch-englischen Übersetzungsvertrag; Deutsch bleibt der Standard. | bestanden |
| Validierung | 62 Vitest-Tests, TypeScript-Prüfung und Produktionsbuild bestanden. | bestanden |
| Mobilansicht | In 412 × 915 Pixeln ist der private Anlagenbereich kompakt einklappbar, klar gekennzeichnet und ohne horizontalen Überlauf eingebunden. | bestanden |

Es wurden keine Anlagen, Messwerte, Personen, Tiere oder Bilder als Testdaten angelegt. Die Prüfung bestätigt den neutralen privaten Leerzustand und die technischen Schutzgrenzen.
