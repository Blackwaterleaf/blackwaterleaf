# BlackWaterLeaf – Phase 5: Motion, Mikrointeraktion und Performance

**Stand:** 26. September 2026  
**Status:** Konzeptuelle Freigabespezifikation; **keine Implementierung**.

## 1. Grundregel

Motion erklärt eine Zustandsänderung, lenkt Aufmerksamkeit oder verbessert Orientierung. Motion darf keine künstliche Aktivität, Datenaktualität, KI-Sicherheit oder Knappheit vortäuschen. Der Default ist statisch-first.

## 2. Zulässige Bewegungen

| Situation | Standardbewegung | Dauerziel | Reduced-Motion-Variante |
|---|---|---:|---|
| Seitenwechsel | Opacity plus kurzer horizontaler Transform | 160–220 ms | Sofortiger Wechsel oder kurzer Fade bis 100 ms |
| Panel/Sheet öffnet | Opacity plus Y-Transform | 180–240 ms | Opacity-only bis 100 ms |
| Primäraktion pressed | leichte Tonwert-/Opacity-Änderung | 80–120 ms | sofortiger Tonwertwechsel |
| Upload/Sync | statischer Fortschrittsbalken; optional langsamer, nicht notwendiger Verlauf | nicht endlos animieren | statischer Prozent-/Textstatus |
| KI-Verarbeitung | klarer Text „Analyse läuft“ plus pausierbarer, subtiler Indikator | begrenzt auf aktiven Vorgang | Textstatus ohne Bewegung |
| Erfolgreiches Speichern | kurzer Farbrand/Statuswechsel | einmalig | statischer Erfolgsstatus |
| Karten-/Listenwechsel | sichtbarer Selected-State | sofort | identisch |

Nicht zulässig sind dauerhaftes Pulsieren, Shimmer, Parallax, blinkende Statuspunkte, automatisch rotierende Tipps, driftende Blätter, schwimmende Fische außerhalb eines aquatischen Controls, Wasserwellen als Dauerloop oder Glow-Breathing an CTAs.

## 3. Bereicheigene Motion

- **Botanik:** Blätter dürfen nur innerhalb eines botanischen Elements einmalig und sehr ruhig austreiben; statischer Zustand bleibt gleichwertig.
- **Aquaristik:** optionale Fische dürfen ausschließlich in einer aquatischen Kachel/Schaltfläche laufen und müssen geclippt sein; keine animierten Fische in Listen oder hinter Text.
- **Terraristik:** höchstens eine subtile organische Kontur; kein dauerhaftes Tier-/Partikelrendering.
- **KI:** Analyseindikator bleibt sachlich, violett markiert und stoppt nach Antwort, Fehler oder Abbruch.
- **Community:** Medien- und Feedcontent bewegt sich nur durch Nutzeraktion; keine automatisch wechselnden Karten.

## 4. Reduced Motion und Nutzerkontrolle

### Web

- `prefers-reduced-motion: reduce` deaktiviert nicht essenzielle Transform-, Parallax-, Scale-, Loop- und Blurbewegungen.
- Auto-updating, bewegte oder scrollende Inhalte erhalten Pause/Stop/Hide oder eine Frequenzsteuerung.
- Fokus, Status, Fehler und Text bleiben an derselben Stelle verständlich.

### Native

- Native Reduce-Motion-/Accessibility-Einstellung wird beim Start und bei Änderungen berücksichtigt.
- `LayoutAnimation`, Spring- und Zoombewegungen werden durch statische Layoutänderung oder kurzen Fade ersetzt.
- Ein sichtbarer Bereich **„Visuelle Effekte reduzieren“** deaktiviert Blur, senkt Transparenz und ersetzt Schatten durch feine Konturen.
- Nutzerwahl bleibt persistent und gilt auf Web/Native entsprechend derselben Bedeutung.

## 5. Battery-/Data-Saver-Profile

| Profil | Medien | Blur/Glow | Motion | Netzwerk |
|---|---|---|---|---|
| Standard | ein kritisches Hero/Medienbild, lazy-loaded Nebenmedien | opake Basis, höchstens zugelassene kleine Tintfläche | kurze statusbezogene Bewegung | normale echte Datenabfragen |
| Reduzierte Effekte | kleinere/statische Medien | kein Live-Blur, weniger Transparenz, 1-dp-Rand | nur Opacity oder statisch | keine Dekor-Requests |
| Data Saver | responsive/komprimierte Assets | kein Blur, keine Remote-Dekormedien | statisch | keine Vorab-Ladung nichtkritischer Medien |
| Offline | Cache nur nach Privacy-/Storage-Regel | statische Oberfläche | kein Hintergrundloop | nur sichtbarer Cache-/Entwurfsstatus |

## 6. Performance-Gates

Vor der Implementierung werden folgende Messungen als Release-Gate vorgesehen:

1. Opaque-Baseline gegen Glass-Kandidat auf einem Low-End-Android, einem normalen 60-Hz-Gerät und einem Pixel-6+-Messgerät.
2. Cold Start, 60-Sekunden-Scroll, Sheet/Dialog 20-mal öffnen/schließen, Headerwechsel und zehnminütiger typischer Nutzungspfad.
3. FrameTiming/Perfetto/Profile GPU Rendering erfassen.
4. Keine eingefrorenen Frames über 700 ms.
5. p95-Framezeit auf 60 Hz höchstens 16,67 ms; 90/120 Hz zusätzlich mit 11/8-ms-Rahmen dokumentieren.
6. Keine Verschlechterung von mehr als 1 ms oder 5 Prozentpunkten On-Budget-Frames gegenüber der opaken Baseline.
7. Betroffener Pfad bleibt unter Androids 2,5×-Overdraw-Leitwert.
8. Blur wird nie über scrollenden Listen, Video, User-Media oder Fullscreen-Flächen gerastert.
9. A/B-Energieprüfung bleibt unter 5 % medianer Gesamt-/GPU-Energiezuwachs oder der Effekt ist standardmäßig deaktiviert.
10. Browser/WebView prüfen Frames, Paint-Flashing, Layers und Fallback bei nicht unterstütztem `backdrop-filter`.

## 7. Medien- und Renderbudgets

- Kein Remote-Request und kein Video wird ausschließlich für Glas/Glow geladen.
- Oberhalb des Folds maximal ein kritisches großes Bild; Nebenmedien werden verzögert geladen.
- Große Katalog-/Feedlisten werden virtualisiert oder anderweitig begrenzt gerendert.
- Glow ist statisch und lokal; keine kontinuierliche Partikel-/Canvas-Schleife.
- `will-change` nur während einer konkreten Transform-/Opacity-Animation und danach entfernen.
- Hintergrundbilder erhalten responsive Varianten und einen vollständigen Low-Data-Fallback.

## 8. Status- und Vertrauensregeln

Eine Animation darf niemals ersetzen:

- echte Quelle oder Aktualisierungszeit;
- Offline-, Sync- oder Konfliktstatus;
- KI-Unsicherheit und Datenschutzstatus;
- Upload-/Verarbeitungsfehler;
- Veröffentlichung oder serverseitige Bestätigung.

Ein Ladeindikator endet bei Erfolg, Fehler oder Abbruch. Ein „Bereit“-Status wird nur angezeigt, wenn der zugrunde liegende Datenzustand dies erlaubt; atmosphärische LEDs gelten nicht als Datenquelle.

## 9. Abnahmetests

Die Prototypprüfung testet Standard und Reduced Motion bei 320 CSS-Pixel/400-%-Zoom, großer Native-Schrift, Portrait/Landscape, Tastatur/Screenreader, Offline, langsamem Netzwerk, Data Saver und Low-End-Android. Ein Flow gilt erst als abgenommen, wenn die Aufgabe ohne Motion, Glow, Farbe, Blur oder Hintergrundbild vollständig verstanden und ausgeführt werden kann.
