# BlackwaterLeaf.com: Seitenkarte und grafische Übernahme

> **Prüfdatum:** 16. September 2026  
> **Ziel:** Die tatsächlich veröffentlichten Hauptseiten von [blackwaterleaf.com](https://blackwaterleaf.com) erfassen und für jede sichtbare Oberfläche ein eindeutiges grafisches Zielbild bereitstellen.

Die Prüfung der veröffentlichten Client-Routen bestätigt, dass die Website derzeit eine Startseite, vier Fachbereichsseiten, Entdecken, Community, KI, Profil und Wissen anbietet. Zusätzlich bestehen Konto-, Authentifizierungs- und administrative Routen. Die grafische Übernahme konzentriert sich bewusst auf die nutzerseitigen Hauptoberflächen. Authentifizierung und Administration erhalten keine separaten Naturwelt-Screens, da sie funktionale Formulare bzw. geschützte Arbeitsoberflächen sind.

| Veröffentlichtes Ziel | Öffentliches Verhalten am 16. September 2026 | Grafische Zielreferenz |
| --- | --- | --- |
| `/` | Startseite mit Welten, Momenten, Partnern und unterer Navigation. | Die vom Auftraggeber bereitgestellte Startseitenvorlage `docs/design/reference-screenshot.jpg`. |
| `/world/botany` | Bereich **Botanik**, aktuell mit Anmelde-/Statuszustand. | [01 Botanik](screens/01-botanik.jpg) |
| `/world/aquarium` | Bereich **Aquaristik**, aktuell mit Anmelde-/Statuszustand. | [02 Aquaristik](screens/02-aquaristik.jpg) |
| `/world/terrarium` | Bereich **Terraristik**, aktuell mit Anmelde-/Statuszustand. | [03 Terraristik](screens/03-terraristik.jpg) |
| `/assistant` | KI-Grundsatz: „Echte KI-Hilfe. Keine Scheinantwort.“ | [04 KI-Assistent](screens/04-ki-assistent.jpg) |
| `/explore` | World Index mit Botanik, Aquaristik, Terraristik und KI. | [08 Entdecken](screens/08-entdecken.jpg) |
| `/community` | Ehrlicher Community-Leerzustand: nur reale, freigegebene Beiträge. | [09 Community](screens/09-community.jpg) |
| `/profile` | Anmelde-/Statusbereich sowie Sprache und Einheiten. | [10 Profil](screens/10-profil.jpg) |
| `/knowledge` | Ehrlicher Wissens-Leerzustand: noch keine veröffentlichten Quellenbeiträge. | [11 Wissen](screens/11-wissen.jpg) |

## Nicht als öffentliche Hauptscreens übernommen

Die veröffentlichten Routen `/login`, `/register`, `/forgot-password`, `/reset-password` und `/verify-email` gehören zum Konto-Zugang. Die Routen unter `/admin` sind geschützte Verwaltungsansichten. Beide Gruppen werden bei einer späteren visuellen Umsetzung mit denselben Farb-, Typografie- und Glastokens gestaltet, benötigen jedoch keine bildreichen Welt-Heroes und gehören nicht in das aktuelle Screen-Paket.

## Übernahmeregeln

Die Fachbereichsseiten sind **eigene Zielseiten nach einem Tipp**. Sie dürfen nicht wieder die Home-Komposition wiederholen. Jede Fachbereichsseite braucht ihren spezifischen Hero und genau ihre eigenen Handlungsoptionen: Botanik mit Pflanzen-/Bestimmungsweg, Aquaristik mit Becken-/Wasserwertweg, Terraristik mit Terrariumsweg sowie KI mit Frage-/Bestimmungs-/Quellenweg. Entdecken ist der einzige Screen, der alle vier Welten gleichzeitig als Auswahl zeigt.

Die öffentlichen Seiten Community, Profil und Wissen dürfen keinerlei erfundene Personen, Interaktionen, Sensorwerte oder Beiträge zeigen. Ihre Grafiken übernehmen die veröffentlichte transparente Produktlogik: Wenn es noch keine echten Inhalte gibt, muss der Leerzustand hochwertig aussehen und klar erklären, was nach einer Freigabe möglich wird.

Die vollständige Bildserie ist in [INTERACTIVE_PAGE_SCREENS.md](INTERACTIVE_PAGE_SCREENS.md) eingebettet und enthält die weiterführenden Schnellaktionsgrafiken Live, Foto und Beitrag.
