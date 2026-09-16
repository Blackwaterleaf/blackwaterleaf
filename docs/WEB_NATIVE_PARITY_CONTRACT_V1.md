# BlackWaterLeaf Web-/Native-Paritätsvertrag V1

**Vertragsversion:** `1.0.0`
**Status:** Verbindliche Staginggrundlage
**Produkte:** BlackWaterLeaf Natur-App für Web und Native. BlackWaterLeaf Studio ist ausdrücklich ausgeschlossen.

> Parität bedeutet nicht, dass Web und Native pixelidentisch sein müssen. Parität bedeutet, dass beide Clients dieselben fachlichen Entitäten, Rollen, Sichtbarkeitsregeln, Datenstände, Fehlerzustände und Sicherheitsentscheidungen über dieselbe serverseitige API verwenden. Plattformgerechte Navigation und Eingabemethoden bleiben zulässig.

## 1. Nicht verhandelbare Systemregeln

| Regel | Verbindliche Umsetzung |
|---|---|
| Datenwahrheit | Keine simulierten Nutzer, Beiträge, Rollen, Likes, Messwerte, KI-Antworten oder Diagnosen. Fehlen Daten, wird ein ehrlicher Leer-, Offline-, gesperrter oder Fehlerzustand angezeigt. |
| Rollenquelle | `user`, `moderator` und `admin` werden ausschließlich von der authentifizierten serverseitigen Datenbank geliefert. Lokale E-Mail-Prüfungen oder Client-Hochstufungen sind verboten. |
| Gemeinsamer Datenstand | Web und Native greifen auf dieselbe versionierte API und dieselbe produktive MySQL-Datenbasis zu. Direkte Clientzugriffe auf MySQL sind verboten. |
| Private Voreinstellung | Neue Beobachtungen bleiben standardmäßig privat. Eine Veröffentlichung erfordert eine explizite Nutzeraktion und serverseitige Berechtigungsprüfung. |
| Medien | Bildbytes liegen im Objektspeicher; die Datenbank speichert nur Metadaten, Eigentum, Sichtbarkeit und Speicherreferenzen. |
| KI | Der Assistent bleibt gesperrt, bis Anbieter, Modell, Kosten, Datenschutz und Quellen-/Unsicherheitsdarstellung ausdrücklich freigegeben sind. |
| Migrationen | Änderungen sind additiv, versioniert und rückrollbar. Bestehende Daten werden nicht ohne Herkunfts-, Inhalts- und Rückfallnachweis gelöscht. |

## 2. Gemeinsame V1-Domänen

| Domäne | Gemeinsamer Vertrag | V1-Grenze |
|---|---|---|
| Konto und Profil | Verifizierte ID, Status, Rolle, Anzeigename, Handle, E-Mail, Avatar, Bio, Ort, Locale, Einheitensystem und optionale Social-Links. | Rechte werden nie aus UI-Zustand oder E-Mail-Text abgeleitet. |
| Botanik | Private oder freigegebene Beobachtungen mit Betreff, wissenschaftlichem Namen, Notiz, Messwerten, Medien und Evidenzstatus. | Keine automatische Bestimmung ohne freigegebenen KI-/Taxonomieprozess. |
| Aquaristik | Beobachtungen und Messwerte mit demselben Eigentums-, Sichtbarkeits-, Evidenz- und Synchronisationsmodell. | Nullwerte bleiben echte Nullwerte; `0` darf nicht als fehlend behandelt werden. |
| Terraristik | Gleichwertiger Beobachtungsvertrag statt bloßer Navigationskarte. | Fachspezifische Erweiterungen erfolgen additiv auf dem gemeinsamen Beobachtungskern. |
| Wissen | Veröffentlichte Artikel mit Locale, Fachbereich, Evidenzstatus und mindestens einer Quelle. | Unbelegte oder nicht veröffentlichte Inhalte werden nicht als Wissen ausgeliefert. |
| Community | Reale öffentliche Beiträge mit verifiziertem Autor, Medien und serverseitigen Zählern. | Keine Beispieldaten und keine private Entität im öffentlichen Feed. |
| Offline und Sync | `local_only`, `queued_for_review`, `synced`, `sync_failed`, `conflict`; Client-ID und Revision unterstützen Idempotenz und Konflikterkennung. | Keine stille automatische Veröffentlichung. |
| Fehler | Versionierte, übersetzbare Fehlercodes mit `retryable` und optionaler Request-ID. | Technische Details oder Secrets werden nicht an Clients ausgegeben. |

## 3. Designparität

Die gemeinsame visuelle Identität verbindet das bestehende Living-UI mit der neuen retrofuturistischen Systemfehler-Ebene. Der Hintergrund bleibt tiefschwarz und organisch; horizontale Scanlines, digitales Rauschen, geometrische Klammern, Monospace-Systemcodes sowie kontrollierte cyan-/magentafarbene chromatische Aberration ergänzen das Naturmaterial. Sie ersetzen nicht die vier erkennbaren Welten, das transparente Glas oder den zentralen Blattkern.

| Oberfläche | Verbindliche Elemente |
|---|---|
| Home | Markenheader, ehrliche Statusleiste, realer oder klar nicht verbundener Naturmoment, vier visuelle Welten, zentraler Blatt-Radialkern und fünf Hauptbereiche. |
| Navigation | Home, Entdecken, Community, KI und Profil bleiben erreichbar. Botanik, Aquaristik und Terraristik sind direkte Weltziele. |
| Bewegung | Glasreflex, Blattimpuls, Wasserwelle und bereichsspezifische Tiefe verwenden primär `transform` und `opacity`; reduzierte Bewegung wird respektiert. |
| Sprache | Deutsch und Englisch besitzen dieselben Schlüssel und Funktionszustände; Locale und Einheitensystem werden getrennt behandelt. |
| Fehlerästhetik | Systemcodes und Störsignale erklären reale Zustände wie offline, nicht autorisiert oder nicht verbunden. Sie dürfen keine künstliche Aktivität vortäuschen. |

## 4. Sicherheitsvertrag

Jede Mutation prüft Authentifizierung, Kontostatus, Rolle und Eigentum auf dem Server. Öffentliche Abfragen liefern nur ausdrücklich öffentliche Datensätze. Uploads werden nach Größe, erlaubtem MIME-Typ und tatsächlicher Dateisignatur geprüft, danach in privatem beziehungsweise regelkonform freigegebenem Objektspeicher abgelegt. Cookie-basierte Mutationen benötigen eine gültige Origin-Prüfung; alle API-Flächen erhalten angemessene Rate Limits und Sicherheitsheader.

## 5. Paritätsabnahme

Eine Funktion wird erst als **paritätisch** markiert, wenn der gemeinsame Vertrag in beiden Clients verwendet wird, derselbe echte Datensatz beziehungsweise derselbe ehrliche Leerzustand erscheint, Berechtigungs- und Fehlerfälle getestet sind und die Funktion über die gemeinsame API arbeitet. Rein visuelle Schaltflächen, lokale Attrappen oder nicht verbundene Formulare zählen nicht als Funktionsparität.

Der aktuelle Ausgangsstand ist ausdrücklich **nicht vollständig paritätisch**. Die Native-App besitzt die weiterentwickelte Living-UI- und Offline-Beobachtungsgrundlage; die ältere Webbasis besitzt breitere Serverdomänen, enthält aber weder eine vollständige Terraristik- noch eine gemeinsame Sync-/Consent-Grundlage. Die neue Staginganwendung führt diese Stärken kontrolliert zusammen und übernimmt keine ungeprüften Produktionsbehauptungen.
