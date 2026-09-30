# BlackWaterLeaf – neues Vorstellungsvideo

**Stand:** 30. September 2026  
**Ziel:** Das bisherige Natur-B-Roll durch ein verständliches, markenkonformes Produktvideo ersetzen, das in einem zusammenhängenden Ablauf zeigt: für wen BlackWaterLeaf da ist, was Menschen damit machen, wie Privatsphäre und Community funktionieren, welche Rolle Unternehmenspartner haben und welches langfristige Ziel die Plattform verfolgt.

## 1. Befund der aktuellen Startseite

| Bereich | Ist-Zustand | Konsequenz |
|---|---|---|
| Eingebettetes Video | 8,16 Sekunden, stumm, nur Blatt, Fische und Terrarium/Unterholz | Transportiert Atmosphäre, erklärt aber **keine App**. |
| Text / Marke | Kein gesprochener Text, keine Einblendung, kein Logo im Video | Kein Produktversprechen und keine Markenverankerung. |
| Bedienung / Funktionen | Keine Oberfläche, keine reale Handlung | Besucher verstehen nicht, was sie nach der Anmeldung tun können. |
| Community / Menschen | Nicht gezeigt | Der Mehrwert aus Beobachten, Teilen und Lernen bleibt unsichtbar. |
| Unternehmen | Nicht gezeigt | Der transparente Partner-/Marktplatzfluss ist nicht erklärbar. |
| Auslieferung | Die Produktionsseite lädt das MP4 aus `/manus-storage/…`, das zur externen CDN-Datei weiterleitet. Der Browser erhält dabei keine Videodaten; die aktuelle CSP hat keine `media-src`-Freigabe für dieses CDN. Im Repository zeigt die Komponente dagegen auf `/blackwaterleaf-intro.mp4`, dessen Live-URL nur den HTML-App-Shell liefert. | Neben dem neuen Inhalt muss die Media-Auslieferung und der Produktionsstand konsistent repariert werden. |

> Das bestehende Video ist gutes atmosphärisches Material, aber es ist kein Vorstellungsvideo. Es eignet sich höchstens noch als visueller Übergang oder Hintergrund innerhalb eines längeren Films.

## 2. Faktische Produktbotschaft

Das Video darf nur Funktionen zeigen, die im aktuellen Produkt belastbar angelegt sind:

- **Individuen:** Pflanzen-, Aquarium- und Terrarienwelten erkunden; eigene Beobachtungen erfassen; Bilder zuordnen; Inhalte zunächst privat halten und Sichtbarkeit bewusst wählen.
- **Wissen:** veröffentlichte, quellenbelegte Inhalte und Katalogzugänge helfen beim Einordnen. Keine ungesicherten Fachbehauptungen.
- **Community:** echte Konten können Beobachtungen, Fragen und Inspirationen teilen. Öffentliche Inhalte sind von privaten Bereichen getrennt.
- **Optionale Technik:** Smart-Werte, Kamera und automatische Benachrichtigungen werden erst nach einer echten, widerrufbaren Verbindung aktiviert; der Film darf keine bereits vorhandenen Live-Daten vortäuschen.
- **KI:** Der KI-Bereich ist an Anmeldung, Einwilligung, verfügbare Dienste und Freigaben gebunden. Der Film darf daher keine sofortige automatische Bestimmung oder eine allgemeine KI-Verfügbarkeit versprechen.
- **Unternehmenspartner:** Partner sind reale Personen oder Unternehmen; öffentliche Platzierungen und Angebote brauchen Admin-Genehmigung und eine bestätigte Freigabe. Angebote sind als Werbung/Partnerangebote gekennzeichnet. Kauf, Zahlung, Versand, Rückgabe und Support erfolgen beim jeweiligen Partner, nicht in BlackWaterLeaf.

### Nicht als vorhandene Funktion behaupten

- Eine Organisations-, Vereins-, Schul-, Forschungs- oder Teamrolle ist im aktuellen Produktmodell **nicht** vorhanden.
- Keine pauschale automatische Pflanzen-/Tierbestimmung behaupten.
- Keine aktiven Sensorwerte, Kameras oder Benachrichtigungen vortäuschen, wenn keine Verbindung besteht.
- Keine In-App-Zahlung, keinen Warenkorb-Kaufabschluss und keine Partnerauszahlungen versprechen.

## 3. Empfohlenes Format

| Entscheidung | Empfehlung | Begründung |
|---|---|---|
| Hauptfassung | 75 Sekunden, 16:9, deutsch, mit Sprecher:in und eingebrannten Untertiteln | Genug Raum für den vollständigen Nutzen, ohne die Startseite zu überladen. |
| Startseitenfassung | 30–35 Sekunden, 16:9, dieselbe Bildsprache, verlinkt auf die Langfassung | Autoplay-/Hero-tauglich; Besucher verstehen den Kern ohne lange Verweildauer. |
| Stil | Echte Bildschirmaufnahmen der App, ergänzt um bestehende Naturbilder, dezente Motion Graphics | Glaubwürdig und lesbar; keine erfundenen Produktoberflächen. |
| Ton | Ruhige, vertrauensvolle deutsche Stimme; dezente organische Ambient-Musik; UI-Klicks und einzelne Chimes | Passt zur Naturmarke und lenkt nicht vom Informationsgehalt ab. |
| Bildsprache | Tiefgrün, moosige Kontraste, aquatische Akzente, helle Blattgrün-Highlights; klare Sans-/Mono-Typografie gemäß bestehender Startseite | Schließt visuell an BlackWaterLeaf an. |
| CTA | „Entdecke deine Welt. Halte sie fest. Teile, was du zeigen willst.“ + Logo + `blackwaterleaf.com` | Konkreter nächster Schritt ohne überzogene Zusage. |

## 4. Dramaturgie und Sprechertext – Langfassung (75 Sekunden)

| Zeit | Bild / konkrete Aktion | Sprechertext | Bildtext |
|---:|---|---|---|
| 00:00–00:04 | Makro eines feuchten Blatts; die Blattadern gehen in eine feine Karten-/Netzstruktur über. | „Jede lebendige Welt beginnt mit einem genaueren Blick.“ | `BLACKWATERLEAF` |
| 00:04–00:11 | Startseite, danach Wechsel zu Botanik, Aquaristik und Terraristik. | „BlackWaterLeaf ist dein digitales Observatorium für Pflanzen, Aquarien und Terrarien.“ | `BOTANIK · AQUARISTIK · TERRARISTIK` |
| 00:11–00:19 | Nutzer:in nimmt ein Foto auf und erfasst eine Beobachtung; anschließend wird sie einer eigenen Welt zugeordnet. | „Halte fest, was du siehst – als Foto, Beobachtung oder Pflegemoment – und ordne es deiner eigenen Welt zu.“ | `ERFASSEN · ZUORDNEN · DOKUMENTIEREN` |
| 00:19–00:28 | Katalog-/Wissensansicht, Quellen-/Faktenhinweis, ruhiger Zoom auf eine Information. | „Verbinde deine Beobachtungen mit Wissen und Quellen, damit aus einzelnen Momenten ein besseres Verständnis wird.“ | `WISSEN MIT QUELLEN` |
| 00:28–00:37 | Sichtbarkeitswahl: privat zuerst; anschließend veröffentlichter Community-Beitrag mit echten Reaktionen. | „Du entscheidest, was privat bleibt. Und was du öffentlich teilen möchtest, kann andere Menschen inspirieren und verbinden.“ | `DEIN BEREICH · DEINE SICHTBARKEIT` |
| 00:37–00:45 | Community-Feed mit einem echten Naturmoment, Wechsel in die Karten-/Entdecken-Ansicht. | „Entdecke Beobachtungen, Fragen und Geschichten aus der Community – ohne den Bezug zu Ort, Art und Kontext zu verlieren.“ | `ENTDECKEN · VERSTEHEN · TEILEN` |
| 00:45–00:52 | Profileinstellung „Smart-Werte verbinden“ mit ehrlichem Status „erst nach Freigabe aktiv“. | „Wenn du Technik verbindest, geschieht das bewusst und widerrufbar: Werte und Kamera werden nur nach deiner Freigabe eingebunden.“ | `OPTIONAL · NUR NACH FREIGABE` |
| 00:52–01:03 | Marktplatz: klar sichtbares Label „Partner-Angebot/Werbung“, Produktdetail, danach externe Partnerseite. | „Auch Unternehmen können ihren Platz haben – transparent als freigegebene Partner. Angebote sind eindeutig gekennzeichnet; gekauft wird immer direkt beim Partner.“ | `TRANSPARENT GETRENNT` |
| 01:03–01:12 | Montage: Pflanze, Aquarium, Terrarium, privates Profil, Community-Post; der Inhalt fließt zurück zum BlackWaterLeaf-Logo. | „So verbindet BlackWaterLeaf Menschen, Wissen und Orte – für achtsamere Pflege, bessere Beobachtungen und lebendige Naturwelten.“ | `MENSCHEN · WISSEN · ORTE` |
| 01:12–01:15 | Logo auf dunklem, organischem Hintergrund; ruhiger Ausklang. | „BlackWaterLeaf. Deine Welt – bewusster gesehen.“ | `ENTDECKE BLACKWATERLEAF.COM` |

## 5. Startseiten-Kurzfassung (30–35 Sekunden)

Die Kurzfassung fokussiert bewusst nur die vier Grundfragen **„Was ist es? Was kann ich tun? Was bleibt privat? Was ist das Ziel?“**:

1. **0–4 s:** „BlackWaterLeaf – dein Observatorium für Pflanzen, Aquarien und Terrarien.“
2. **4–12 s:** Erfassung einer Beobachtung und Zuordnung zur persönlichen Welt.
3. **12–20 s:** Wissen/Katalog und Community als zusammenhängende Bewegung.
4. **20–27 s:** „Du entscheidest, was privat bleibt – und was du teilst.“
5. **27–35 s:** „Menschen, Wissen und Orte verbinden, um lebendige Naturwelten besser zu verstehen und zu schützen.“ Logo + Link.

Der Partner-/Unternehmensfluss erscheint in dieser Fassung nur als kurze, klar gekennzeichnete Karte. Die Erklärung dazu gehört in die Langfassung, damit der erste Eindruck nicht wie Werbung wirkt.

## 6. Offene inhaltliche Entscheidung: „Organisationen“

Aktuell gibt es nur den geprüften **Partner-/Unternehmensfluss**. Bevor ein Video Organisationen prominent erwähnt, muss fachlich feststehen, welche dieser Aussagen wahr ist:

1. **Organisationen = Partnerunternehmen:** Das Video erklärt reale Unternehmen als transparent freigegebene Partner; es behauptet keine eigene Organisationsrolle.
2. **Organisationen = künftige Zielgruppe:** Vereine, Schulen, Forschung, Naturschutz- oder Zuchtgemeinschaften sollen künftig mit eigenen Bereichen, Teams oder gemeinsamen Projekten arbeiten. Dann braucht es eine klare, als Zukunft gekennzeichnete Produktbotschaft.
3. **Organisationen = etwas anderes:** Es gibt bereits einen konkreten Organisationsbegriff, eine Rolle oder einen Ablauf, der noch nicht im Repository modelliert ist.

Ohne diese Festlegung darf das Video keine Nutzung durch Organisationen, Vereine oder Teams suggerieren.

## 7. Umsetzungspaket nach inhaltlicher Freigabe

1. Den Organisations-/Company-Abschnitt fachlich festlegen.
2. Die App in den benötigten, echten Zuständen als Bildschirmaufnahmen aufnehmen (Start, Erfassen, Wissen, Community, Sichtbarkeit, optionaler Geräte-Status, Partner-Marktplatz).
3. Die 75-Sekunden- und 30–35-Sekunden-Fassung als wiederverwendbare Motion-Graphics-Produktion inklusive Sprechertext, Untertiteldatei, Musikbett und Produktionsmanifest erzeugen.
4. Die gültige Videodatei als versioniertes öffentliches Asset ausliefern und die Startseiten-Komponente auf die neue Datei umstellen.
5. Die Medienauslieferung reparieren: Repository- und Produktionsstand angleichen und entweder ein versioniertes Same-Origin-Asset mit `Content-Type: video/mp4` liefern oder die notwendige, exakt begrenzte CDN-Domain mit `media-src` freigeben.
6. Build, Medienmetadaten und die Startseite prüfen; anschließend einen Pull Request mit dem Material und der Integration bereitstellen. Eine öffentliche Veröffentlichung erfolgt erst mit ausdrücklicher Freigabe.
