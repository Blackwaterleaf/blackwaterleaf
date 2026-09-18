# BlackwaterLeaf.com: Design-Compliance-Prüfung

> **Prüfdatum:** 16. September 2026  
> **Prüfumfang:** Öffentlich erreichbare Start-, Bereichs-, Aktions- und Hauptnavigationsseiten von [blackwaterleaf.com](https://blackwaterleaf.com) im Soll-Ist-Abgleich mit `INTERACTIVE_PAGE_SCREENS.md` und den darin referenzierten Zielgrafiken.

## Gesamturteil

Die veröffentlichte Anwendung übernimmt die Grundsprache der Vorgabe bereits erkennbar: eine dunkle organische Naturwelt, die Markenleiste, eine Status-/Sensorzone, große Bereichsflächen, Bildkarten und eine schwebende Bottom Navigation sind auf nahezu allen geprüften Seiten vorhanden. Die transparente Produktlogik ist ebenfalls korrekt: Unangemeldete oder noch nicht verfügbare Inhalte werden nicht erfunden.

Der Stand ist jedoch **noch nicht vollständig designkonform**. Der gewichtete visuelle Soll-Ist-Score liegt bei **70,7 %**. Besonders **Aquaristik**, **Live-Bereich** und **Community** weichen sichtbar von ihren verbindlichen Zielgrafiken ab. Botanik entspricht der Vorgabe bereits weitgehend. Vor dem finalen Design-Abschluss müssen die Neonfarben je Bereich, die Glas-/Lichttiefe, die Hero-Bildgewichte und die mobilen Proportionen konsistent angeglichen werden.

## Bewertungsmaßstab

Bewertet wurden die sichtbaren Kriterien der vereinbarten Grafikserie: dunkle organische Bildwelt, Markenleiste, Sensorleiste, großer bereichsspezifischer Hero, transparente Glaskarten, korrekte Akzentfarben, passende Funktionskarten bzw. transparente Leerzustände und schwebende Bottom Navigation. Die im nicht angemeldeten Zustand notwendigen ehrlichen Platzhalter wurden **nicht** als Funktionsfehler gewertet.

| Status | Bedeutung |
| --- | --- |
| **Erfüllt** | Zielsprache und Seitenfunktion sind sichtbar in Übereinstimmung. |
| **Teilweise erfüllt** | Struktur ist vorhanden, aber Designwirkung oder Details weichen ab. |
| **Nicht erfüllt** | Wesentliche Zielvorgaben, Farbe, Inhalt oder Seitenstruktur fehlen. |

## Ergebnisse nach Seite

| Seite | Öffentliche Route | Score | Status | Priorität | Hauptbefund |
| --- | --- | ---: | --- | --- | --- |
| Startseite | `/` | 63 % | Teilweise erfüllt | Mittel | Grundsprache vorhanden, aber zu leer, dunkel und dashboardartig gegenüber dem bildreichen Hauptscreen. |
| Botanik | `/world/botany` | 91 % | **Erfüllt** | Niedrig | Beste Übereinstimmung: grüner Hero, vier Funktionskarten, ehrlicher Status und Navigation stimmen. |
| Aquaristik | `/world/aquarium` | 52 % | Teilweise erfüllt | **Hoch** | Neon-Blau fehlt als führende Farbe; Unterwasserlicht, cyanfarbene Glasflächen und spezifische Kartenwirkung sind zu schwach. |
| Terraristik | `/world/terrarium` | 76 % | Teilweise erfüllt | Mittel | Struktur passt, jedoch fehlen Frosch-/Moos-Hero, klares Terraristik-Gelbgrün und stärkere Glastiefe. |
| KI-Assistent | `/assistant` | 78 % | Teilweise erfüllt | Mittel | Seiteninhalt stimmt, aber Neon-Lila ist nicht durchgängig dominant und Karten wirken zu opak. |
| Live-Bereich | `/flow/live` | 58 % | Teilweise erfüllt | **Hoch** | Inhaltlich ehrlich, gestalterisch jedoch überwiegend grün statt des verbindlichen Neon-Blaus und zu flach. |
| Foto | `/flow/foto` | 72 % | Teilweise erfüllt | Mittel | Ablauf stimmt; Kamera-CTA, Sensorzone und Kartenakzente müssen näher an die Grafik. |
| Beitrag | `/flow/beitrag` | 76 % | Teilweise erfüllt | Mittel | Funktion stimmt, aber Composer/Glaswirkung zu textorientiert und Bottom Navigation überlagert unteren Inhalt. |
| Entdecken | `/explore` | 76 % | Teilweise erfüllt | Mittel | Vier Welten korrekt, aber Hero, KI-Motiv und Kartenintensität bleiben hinter der Zielgrafik zurück. |
| Community | `/community` | 56 % | Teilweise erfüllt | **Hoch** | Ehrlicher Leerzustand vorhanden, aber falsche Statusaussage und nur zwei statt der vorgesehenen bildbasierten Aktionen. |
| Profil | `/profile` | 72 % | Teilweise erfüllt | Mittel | Ehrlicher Zugang und Einstellungen stimmen; Hero-/Auth-Komposition ist zu flach und doppelt den Haupttitel. |
| Wissen | `/knowledge` | 78 % | Teilweise erfüllt | Mittel | Ehrlicher Leerzustand passt; Hero, Kartenikonografie und Glas-/Bildtiefe sind noch zu zurückhaltend. |

## Stärken, die beibehalten werden müssen

Die drei Bereichsseiten sowie Foto, Beitrag, Entdecken, Profil und Wissen behalten die richtige funktionale Grundstruktur. Insbesondere die öffentliche Botanikseite ist bereits nah am Ziel: Sie zeigt eine klar botanische Naturbildwelt, einen eigenen Hero, vier passende Bildaktionen, die grüne Bereichsfarbe, einen ehrlichen Anmeldestatus und die schwebende Navigation. Die KI-Seite zeigt den verbindlichen Inhalt „Echte KI-Hilfe. Keine Scheinantwort.“ und macht künftige Funktionen transparent.

Auf allen geprüften Seiten ist die Transparenzregel weitgehend eingehalten. Es werden keine privaten Daten, nicht vorhandenen Sensorwerte, KI-Ergebnisse, Community-Mitglieder oder Wissensartikel als echt dargestellt. Diese Regel ist verbindlich und darf beim visuellen Ausbau nicht beschädigt werden.

## Priorisierte Korrekturen

1. **Aquaristik und Live auf Neon-Blau `#28D8FF` umstellen.** Cyan muss bei Titelakzenten, Icons, Kartengrenzen, Glow, CTAs und aktiver Navigation führend sein; Limettengrün darf dort nicht dominieren.
2. **Community auf den verbindlichen Empty-State bringen.** Der Text muss „Noch keine freigegebenen Naturmomente“ kommunizieren; keine Verbindungsprüfung suggerieren. Die Fläche benötigt den klaren Anmelde-CTA und vier aus dem Zielbild abgeleitete Funktionsflächen bzw. eine gleichwertige, ehrliche Leerzustand-Komposition.
3. **Bildgewicht und Glaswirkung global erhöhen.** Heroes und Funktionskarten brauchen sichtbare, helle Fotografie, tiefere Vignetten, spiegelnde/feuchte Lichtakzente und transparentere Ebenen. Dunkle Umrandungen allein ersetzen keinen Glas-Effekt.
4. **Bereichsfotos spezifizieren.** Aquaristik benötigt sichtbar blaue Unterwasserwelten; Terraristik einen Frosch-/Moos-Hero und `#E1D661`; KI violette botanische Interface-Lichtspuren; Entdecken einen Wasserfall-World-Index und eine klar violette KI-Karte.
5. **Mobile Referenzproportionen priorisieren.** Die geprüften Desktopansichten sind häufig zu breit, flach und kompakt. Sensorleiste, Hero, Karten und Schrift müssen im Mobilformat die Dominanz und vertikale Hierarchie der Zielbilder erhalten.
6. **Beitragsseite entschärfen.** Die feste Bottom Navigation darf die letzte Kartenzeile nicht überdecken; unteren Safe Area-/Scroll-Abstand erhöhen.
7. **Startseite nachverdichten.** Zentraler Blattkern mit Schnellaktionen, Bildpost/Naturmoment und klarere Naturfotografie müssen die visuelle Hauptrolle übernehmen; Partnerflächen nur nachrangig zeigen.

## Seitenbezogene Referenzen

| Prüfergebnis | Verbindliches Zielbild |
| --- | --- |
| Botanik | [`screens/01-botanik.jpg`](screens/01-botanik.jpg) |
| Aquaristik | [`screens/02-aquaristik.jpg`](screens/02-aquaristik.jpg) |
| Terraristik | [`screens/03-terraristik.jpg`](screens/03-terraristik.jpg) |
| KI-Assistent | [`screens/04-ki-assistent.jpg`](screens/04-ki-assistent.jpg) |
| Live | [`screens/05-live-bereich.jpg`](screens/05-live-bereich.jpg) |
| Foto | [`screens/06-foto.jpg`](screens/06-foto.jpg) |
| Beitrag | [`screens/07-beitrag.jpg`](screens/07-beitrag.jpg) |
| Entdecken | [`screens/08-entdecken.jpg`](screens/08-entdecken.jpg) |
| Community | [`screens/09-community.jpg`](screens/09-community.jpg) |
| Profil | [`screens/10-profil.jpg`](screens/10-profil.jpg) |
| Wissen | [`screens/11-wissen.jpg`](screens/11-wissen.jpg) |

## Fazit

Die Gestaltungsvorgaben sind **teilweise umgesetzt**, aber noch nicht in der geforderten Qualität über alle veröffentlichten Seiten konsistent. Die Grundlage und die produktbezogene Transparenz stimmen. Der nächste Umsetzungszyklus sollte ausschließlich die hoch priorisierten visuellen Abweichungen in Aquaristik, Live und Community schließen und anschließend die Bereichsfarben, Hero-Kompositionen und Glasmaterialien über alle übrigen Seiten hinweg harmonisieren.
