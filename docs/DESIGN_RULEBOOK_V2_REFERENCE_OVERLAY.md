# BlackWaterLeaf Designregelwerk V2 – Reference Overlay

**Status:** Verbindlich ab 16. September 2026
**Geltung:** Web-App und spätere PWA-/Mobile-Umsetzung
**Zweck:** Dieses Regelwerk ersetzt frühere, allgemeinere Aussagen zur visuellen Übernahme. Es definiert den verbindlichen Weg von der gelieferten Design-ZIP zu den echten BlackWaterLeaf-Oberflächen.

> **Kernentscheidung:** Die ZIP ist die verbindliche visuelle Quelle. Sie bestimmt Bildaufbau, Reihenfolge, Hero, Icons, Akzentfarbe, Wahlbereiche und Navigation. Die vorhandene App ist hingegen die alleinige Quelle für echte Daten, Routen, Rechte, Einwilligungen und Funktionen. Eine Grafik erzeugt niemals eine Funktion, einen Sensorwert oder ein Konto.

## 1. Verbindliche Quellen und Priorität

Bei Konflikten gilt die folgende Reihenfolge. Die Bildschirmgrafik für die betreffende Zielseite hat stets Vorrang vor einer allgemeinen Designregel. Das reale Anwendungsverhalten hat stets Vorrang vor jeder dekorativen Inhaltsannahme.

| Rang | Quelle | Verbindlich für |
|---:|---|---|
| 1 | Die elf Screens im bereitgestellten Designpaket | Exakte visuelle Komposition pro Zielseite: Reihenfolge, Bildwelt, Kartenanzahl, Icons, Farben und Navigation |
| 2 | `INTERACTIVE_PAGE_SCREENS.md` im Designpaket | Seitenvertrag, Zielaussage und Zuordnung der Screens |
| 3 | Dieses Regelwerk | Einheitliche Tokens, Komponentenregeln, Routennormalisierung und Abnahmekriterien |
| 4 | Der aktuelle Quellcode, Datenbank- und tRPC-Vertrag | Tatsächlich vorhandene Routen, Daten, Rechte, Einwilligungen, Uploads, Fehler- und Leerzustände |
| 5 | Frühere Review- und Handoff-Dokumente | Historischer Kontext; sie dürfen den neuen Seitenvertrag nicht abschwächen |

Die beigefügten Beispielkomponenten in `implementation/` sind nützliche Umsetzungsreferenzen. Sie sind jedoch keine Funktionsquelle und dürfen keine nicht vorhandenen Routen oder Daten behaupten.

## 2. Nicht verhandelbare Gestaltungsprinzipien

BlackWaterLeaf ist **kein Standard-Dashboard**. Jede Zielseite ist ein eigenständiger, atmosphärischer Naturraum. Helle Vollflächen, austauschbare Kachel-Dashboards, unverbundene Icon-Sammlungen und rein textlastige Ersatzkarten sind unzulässig.

Jede Zielseite folgt derselben vertikalen Grundfolge:

1. Markenleiste mit Blattmarke, Wortmarke, Suche, Benachrichtigung und Profilaktion.
2. Ehrliche, vierteilige Sensor- und Statusleiste.
3. Ein eigener bildgestützter Bereichs-Hero.
4. Ein echter Zustandsblock, falls die Route Authentifizierung, Verbindung, Freigabe, Leerstand oder Fehler erklärt.
5. Bildbasierte Funktionskarten oder Wahlbereiche in der im Screen vorgegebenen Zahl.
6. Eine schwebende Bottom Navigation. Sie umfasst die vier Referenzziele sowie den vom Produktauftrag freigegebenen Marktplatz.

Formulare, Composer, Chatbereiche, Listen und Detaildaten bleiben erhalten. Sie erscheinen jedoch **nachgeordnet** hinter einem echten Karten- oder Call-to-Action-Einstieg. Sie dürfen den Hero, die Sensorleiste oder die Wahlbereiche nicht als Hauptkomposition verdrängen.

## 3. Verbindliche Farb- und Iconsemantik

Die Farben sind bereichsgebundene Bedeutungsträger. Sie dürfen nicht nach Geschmack vertauscht oder durch ein einheitliches Grün ersetzt werden.

| Bereich | Hex-Wert | Bildwelt | Zugelassene Semantik |
|---|---:|---|---|
| Botanik, Foto, Community, Profil, Wissen | `#C7F35B` | Nasse Blätter, Regenwald, Moos, Wasserfall | Blatt, Kamera, Buch, Community, Sicherheit |
| Aquaristik und Live | `#28D8FF` | Unterwasser, Fische, Pflanzen, Lichtstrahlen | Fisch, Wellen, Tropfen, Sensorik, Kamera |
| Terraristik | `#E1D661` | Frosch, Moos, feuchter Regenwald | Sprout, Kamera, Blatt, Buch, KI |
| KI-Assistent | `#C36BFF` | Botanischer KI-Orbit, Blattstruktur, Licht | Bot, Senden, Scan, Buch, Quellen |

Die Bereichsfarbe gilt gleichzeitig für Hero-Kontur, Badge, Glow, Iconkreis, Kartenchevron und aktive Navigation. Bei einer fachlich gemischten Karte darf eine abweichende Farbe nur die konkrete Funktion kennzeichnen, etwa Cyan für eine Aquariumkarte innerhalb einer botanisch-grünen Fotoseite.

Die Wahlbereiche verwenden die im Designpaket etablierte Lucide-Sprache. Die Kernzuordnung ist verbindlich: `Leaf` für Botanik, `Waves` oder `Fish` für Aquaristik, `Sprout` für Terraristik, `Bot` für KI, `Camera` für Foto, `Video` für Live, `PenLine` für Beitrag, `BookOpen` für Wissen, `Search` für Entdecken und `UserRound` für Profil. Keine Emoji, keine neue dekorative Iconbibliothek und keine semantisch beliebigen Ersatzsymbole.

## 4. Material, Typografie und Bewegung

Die Basis ist fast schwarzes Tannengrün. Bildflächen werden mit dunklen, organischen Überblendungen lesbar gemacht. Karten, Sensorleiste und Navigation sind dunkle, transparente Glasflächen mit feiner heller Kontur, kleiner Innenkante und zurückhaltendem Glow.

| Element | Verbindliche Behandlung |
|---|---|
| Hintergrund | Fast schwarzes Tannengrün, organische Regenwald- oder Unterwasserfotografie, keine helle Standardfläche |
| Hero | Große abgerundete Fotofläche, dunkle Vignette, Bereichsbadge, Displaytitel und kurze Unterzeile |
| Karten | Bildbasiert, dunkel überblendet, Iconkreis, Titel, kurze Handlungszeile und Chevron |
| Typografie | Wortmarke und Displaytitel mit der etablierten kontraststarken Displaytypografie; System- und Statusangaben kompakt und technisch lesbar |
| Kontur | Dünn, leuchtend und ausschließlich bereichsfarben oder neutral hell; keine schweren Standardrahmen |
| Bewegung | Nur `transform` und `opacity`; jede nicht essenzielle Bewegung respektiert `prefers-reduced-motion` |
| Fokus | Sichtbarer, ausreichend kontrastreicher Tastaturfokus bleibt auf allen Links, Buttons und Formfeldern erhalten |

Die mobile Referenz ist die primäre Komposition. Die Web-App erweitert sie behutsam auf größere Breiten: Der Zielseiteninhalt bleibt als fokussierter, bildstarker Bereich lesbar. Die vier Funktionskarten bleiben im Standard **2 × 2** und werden nicht zu einer austauschbaren vierteiligen Desktopzeile. Die Bottom Navigation bleibt in der Referenzansicht sichtbar; eine zusätzliche Desktop-Textnavigation darf diese nicht als primäre Zielnavigation ersetzen.

## 5. Sensor- und Datenwahrheitsvertrag

Die Sensorleiste darf ausschließlich Werte darstellen, die aus den realen Quellen des Projekts stammen. Aktuell sind dies private Aquariumwerte und die nach aktiver Standortfreigabe abgefragten Außenwetterdaten. Ein Wert ist nicht verfügbar, wenn die Person nicht angemeldet ist, noch kein Aquarium gepflegt hat, ein Messwert fehlt, die Standortfreigabe nicht erteilt wurde oder der Dienst fehlschlägt.

| Feld | Zulässige Quelle | Ehrlicher fehlender Zustand |
|---|---|---|
| Wassertemperatur | Privat gepflegtes Aquarium oder später autorisiertes Smartgerät | `—`, „Aquarium eintragen“ oder „nicht verbunden“ |
| pH-Wert | Privat gepflegtes Aquarium oder später autorisiertes Smartgerät | `—`, „pH privat eintragen“ oder „nicht verbunden“ |
| Außenluftfeuchte | Reale Wetterantwort nach Standortfreigabe | `—`, Standortfreigabe oder Fehlermeldung |
| Außentemperatur und Wettereffekt | Reale Wetterantwort nach Standortfreigabe | `—`, Standortfreigabe oder Fehlermeldung |

Die in den Grafiken gezeigten Werte **24,3 °C**, **68 %**, **6,2 pH** und **„Leichter Regen“** sind gestalterische Beispielwerte. Sie dürfen in keiner Route als Fallback, Seed, Demo oder vermeintliche Echtzeitmessung hartcodiert werden.

Regen- und Nebel-Effekte werden nur aus dem echten Wettercode abgeleitet. Smartgeräte werden bis zu einer herstellerspezifischen, widerrufbaren Verbindung ausschließlich als **„wartet auf Herstellerfreigabe“** oder **„nicht verbunden“** geführt.

## 6. Wahrheits-, Sicherheits- und Zustandsvertrag

Die visuelle Parität darf keine Sicherheits- oder Produktwahrheit verletzen. Die folgenden Regeln sind vor jeder visuellen Freigabe zu prüfen.

- Ohne Anmeldung werden keine Namen, Avatare, E-Mail-Adressen, XP-Werte, Rollen, privaten Anlagen oder Beobachtungen gezeigt.
- Ohne reale Communitydaten werden keine Personen, Beiträge, Likes, Kommentare oder Metriken erfunden.
- Ohne veröffentlichte Wissensdaten werden keine Artikel, Quellen oder Expertinnen bzw. Experten erfunden.
- Ohne KI-Verfügbarkeit und Einwilligung wird keine scheinbar aktive KI dargestellt. Der Grundsatz **„Echte KI-Hilfe. Keine Scheinantwort.“** bleibt sichtbar.
- Ohne reale Sensor-, Kamera-, Video- oder Smartgeräteanbindung wird kein Online-, Live- oder Synchronisationsstatus simuliert.
- Error und Empty sind unterschiedliche Zustände. Ein technischer Fehler darf nicht als „noch keine Inhalte“ dargestellt werden.
- Private, `unverified`, Consent-, Publish-, Loading- und Auth-Zustände bleiben serverseitig bestimmt. Die Oberfläche darf sie nur darstellen, niemals lokal erfinden.

## 7. Routen- und Navigationsvertrag

Die heutigen, funktional belegten Routen sind die Wahrheit für bestehende Funktionen. Visuelle Handoff-Bezeichnungen mit abweichenden Pfaden werden nicht stillschweigend zu zusätzlichen Routen.

| Zielscreen | Maßgebliche Route | Status | Aktiver Bottom-Tab |
|---|---|---|---|
| Home | `/` | vorhanden | Home |
| Botanik | `/world/botany` | vorhanden | Home |
| Aquaristik | `/world/aquarium` | vorhanden | Home |
| Terraristik | `/world/terrarium` | vorhanden | Home |
| KI-Assistent | `/assistant` | vorhanden | Home |
| Live-Bereich | `/flow/live` | gezielt neu anzulegen | Home |
| Foto-Aufnahme | `/flow/foto` | gezielt neu anzulegen | Home |
| Beitrag-Erstellung | `/flow/beitrag` | gezielt neu anzulegen | Community |
| Entdecken | `/explore` | vorhanden | Entdecken |
| Community | `/community` | vorhanden | Community |
| Marktplatz | `/marketplace` und `/marketplace/product/:id` | vorhanden | Marktplatz |
| Profil | `/profile` | vorhanden | Profil |
| Wissen | `/knowledge` | vorhanden | Entdecken |

Die Referenznavigation enthält **Home, Entdecken, Community und Profil**. Der Produktauftrag vom 16. September 2026 ergänzt den bereits funktionsfähigen **Marktplatz** als fünften gleichwertigen Bottom-Tab zwischen Entdecken und Community. `/assistant` bleibt eine erreichbare echte Route, erscheint jedoch nicht als eigener Eintrag in der Bottom-Navigation. Es muss immer genau ein aktiver Zielpunkt sichtbar sein.

`/flow/botanik`, `/flow/aquaristik`, `/flow/terraristik` und `/flow/ki-assistent` werden **nicht** aus älteren Handoff-Tabellen übernommen, solange kein eigener Produktauftrag dies verlangt. Sie widersprechen der derzeitigen App-Routenwahrheit. Nur Live, Foto und Beitrag sind als neue Zielseiten explizit vorgesehen.

## 8. Seitenvertrag je Referenzscreen

| Route | Verbindlicher Hero | Karten- bzw. Zustandsvertrag |
|---|---|---|
| `/world/botany` | Alocasia, `PFLANZEN WORLD`, `BOTANIK`, „Deine Pflanzensammlung.“ | Genau vier Bildkarten: Meine Pflanzen, Pflanze hinzufügen, Pflanze bestimmen, Pflegewissen. Fehlende Ziele klar als künftig kennzeichnen. |
| `/world/aquarium` | Unterwasser/Fische, Fischbadge, `AQUARISTIK`, Becken/Wasserwerte/Unterwasserwelt | Genau vier Bildkarten: Meine Aquarien, Aquarium hinzufügen, Wasserwerte, KI zur Aquaristik. |
| `/world/terrarium` | Frosch/Moos, `TERRARISTIK`, „Regenwald im Kleinen.“ | Genau vier Bildkarten: Terrarium fotografieren, Terrarium entdecken, Wissen, KI fragen. |
| `/assistant` | Botanische KI-Welt, Lila-Orbit, `BLACKWATERLEAF KI`, Transparenzgrundsatz | Vier Karten: Frage stellen, Pflanze bestimmen, Aquarium verstehen, Wissen & Quellen. Nur „Frage stellen“ ist heute sicher aktiv. |
| `/flow/live` | Unterwasser, `LIVE-BEREICH`, `DEINE WELT LIVE` | Verbindungsfläche `LIVE-VERBINDUNG / Noch nicht verbunden`, danach Kamera, Wasserwerte, Benachrichtigungen, Entdecken. |
| `/flow/foto` | Blattwelt, `MOMENT FESTHALTEN`, `FOTO` | Primäre echte Kamera-/Dateiauswahl vor vier Karten: Pflanzenfoto, Aquariumfoto, KI bestimmen, Feed. |
| `/flow/beitrag` | Blattwelt, Communitybadge, `BEITRAG`, „Teile deinen Moment.“ | Composer-Vorschau und Übergang zum echten Community-Editor, danach Beitrag, Foto, Video, Community. Video bleibt künftig, solange keine echte Funktion besteht. |
| `/explore` | Wasserfall/Regenwald, `WORLD INDEX`, `ENTDECKE DAS LEBEN.` | Vier Welten exakt im 2×2-Raster, danach `WISSEN & EVIDENZ`-Divider. |
| `/community` | Regenwald/Bach, `GEMEINSAM WACHSEN`, `COMMUNITY IN BEWEGUNG.` | Dominanter ehrlicher Feed-Empty-State mit Login-CTA und zwei Karten Beobachten/Teilen. Composer nachgeordnet. |
| `/profile` | Blattwelt, `DEIN KONTO`, `IDENTITÄT BLEIBT VERIFIZIERT.` | Bei signed-out: Auth-Overlay. Danach zwei echte Karten für Sprache und Einheiten. Authentifizierte Detaildaten bleiben privat. |
| `/knowledge` | Blattwelt, `WISSEN & EVIDENZ`, `WISSEN BRAUCHT QUELLEN.` | Ehrlicher Wissens-Empty-State und zwei Karten Quellen/Naturwissen. Published-, Error- und Empty-Zustand getrennt. |

## 9. Abnahmeregel „Icon für Icon, Farbe für Farbe“

Eine Zielseite ist erst freigegeben, wenn alle folgenden Punkte gleichzeitig erfüllt sind:

1. Sie besitzt den im Screen gezeigten eigenen Hero, nicht einen wiederverwendeten Home-Hero.
2. Ihre Akzentfarbe entspricht exakt der Bereichsfarbe.
3. Jede sichtbare Funktionskarte hat das passende Bildmotiv, Icon, Titel, Chevron und einen nachgewiesenen Link- oder Nichtverfügbar-Zustand.
4. Die Kartenzahl und Rasterform entsprechen dem Zielscreen.
5. Markenleiste, Sensorleiste und die Bottom Navigation mit den vier Referenzzielen plus Marktplatz entsprechen der Referenzhierarchie.
6. Jeder Sensor-, Feed-, Profil-, KI- und Wissenszustand bleibt real, privat, fehlend, verbunden oder fehlerhaft wie im echten Datenvertrag.
7. Die mobile Ansicht bei 412 × 915 und eine Desktopansicht werden visuell geprüft; keine Touchfläche wird von der Navigation verdeckt.
8. Keyboard-Fokus, Kontrast und `prefers-reduced-motion` bleiben funktionsfähig.
9. TypeScript-Prüfung, Tests und Produktionsbuild laufen ohne Fehler.

## 10. Ersetzte Annahmen

Die folgenden früheren Annahmen sind nicht länger zulässig:

- Ein realm-spezifisches Hintergrundbild plus generisches Formular erfüllt keinen Bereichsscreen.
- Eine allgemeine Glasoptik ersetzt keine bildbasierte Hero-/Kartenkomposition.
- Eine beliebige Fünf-Tab-Navigation ist nicht die Referenznavigation. Zulässig ist ausschließlich die festgelegte Folge **Home · Entdecken · Marktplatz · Community · Profil**.
- Ein vorhandener `LiveSensorStrip` legitimiert keine Referenzwerte und ersetzt nicht die geforderte visuelle Viererleiste.
- Ein Community-, Knowledge-, Profil- oder KI-Panel darf nicht als generischer Ersatz für den jeweiligen Hero, Empty-State oder Auth-Overlay gelten.
- Die Bildserie ist keine Quelle für Testdaten, Beispielkonten, Messwerte oder fiktive Features.

## References

[1]: ../../blackwaterleaf-design-handoff/BlackwaterLeaf-Design-Handoff/docs/INTERACTIVE_PAGE_SCREENS.md "BlackwaterLeaf Grafische Zielseiten"
[2]: ../../blackwaterleaf-design-handoff/BlackwaterLeaf-Design-Handoff/docs/PUBLISHED_SITE_SCREEN_AUDIT.md "BlackwaterLeaf.com Seitenkarte und grafische Übernahme"
[3]: ../../blackwaterleaf-design-handoff/BlackwaterLeaf-Design-Handoff/docs/LIVING_FLOW_HANDOFF.md "BlackwaterLeaf Sieben Bereichsseiten"
[4]: ../../blackwaterleaf-design-handoff/BlackwaterLeaf-Design-Handoff/docs/REFERENCE_OVERLAY_HANDOFF.md "BlackwaterLeaf Design-Übergabe Overlay lebt"
[5]: ../client/src/App.tsx "Aktuelle BlackWaterLeaf-Routen"
[6]: ../client/src/components/AppShell.tsx "Aktuelle globale Navigation"
