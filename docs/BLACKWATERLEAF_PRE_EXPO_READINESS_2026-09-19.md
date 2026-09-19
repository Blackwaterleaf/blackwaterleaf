# BlackWaterLeaf – Pre-Expo Readiness Review

**Datum:** 19. September 2026  
**Gültiger Arbeitsstand:** Observatory Portal V2  
**Zweck:** Fachlich, funktional und visuell belastbare Web-/Native-Basis vor einem neuen Expo-Build.

## Ergebnis

Die zehn Vorabnahmeschritte sind für den gegenwärtigen Code- und Datenstand ausgeführt. Der aktuelle Stand ist **kein Buildauftrag**, sondern eine geprüfte Übergabebasis für einen späteren Expo-Build. Ein APK darf erst gestartet werden, wenn die verbleibenden geprüften Katalogbilder aus zugelassenen Fachquellen eingepflegt und die bestehende Release-Freigabe ausdrücklich erteilt sind.

| Schritt | Ergebnis | Nachweis |
|---|---|---|
| 01 – Quellenrichtlinie | Erledigt | Wikipedia und Wikimedia Commons sind für Taxonquellen, Bilder und Bildprovenienz gesperrt. |
| 02 – Katalogbereinigung | Erledigt | 66 Pflanzen aus POWO und 15 Aquaristik-Taxa aus FishBase bleiben veröffentlicht. 18 frühere manuelle Pflanzeneinträge sind ohne Löschung als Entwürfe zur Fachprüfung zurückgestellt. |
| 03 – Fundort- und Verbreitungsdarstellung | Erledigt | Fachbereichs- und Taxonflächen unterscheiden Laden, Fehler, leer und bereit. Genaue Privatorte werden nie dargestellt oder simuliert. |
| 04 – Portaldesign und Lesbarkeit | Erledigt | Hero-Höhen, Innenabstände, Headerausrichtung, Farben und kompakte Aktionsraster wurden auf den Observatory-Vertrag vereinheitlicht. |
| 05 – Entdecken und Katalog | Erledigt | Feste „Channa“-Vorschau und generische Bildersatztreffer wurden entfernt. Katalogbilder erscheinen nur bei vollständiger Provenienz; sonst steht sichtbar „Bildnachweis offen“. |
| 06 – Profil, KI und Community | Erledigt | Falsche Namens-/E-Mail-Fallbacks wurden entfernt. KI- und Aquariumfehler sind wiederholbar. Eigene Kommentare können nun bearbeitet oder gelöscht werden; Communityaktionen zeigen Erfolg oder Fehler. |
| 07 – Marktplatz | Erledigt | Händler-Hub verwendet Portalgrün statt Aquaristik-Cyan, unterscheidet Offline/Serverfehler und zeigt den geschützten Händlerzugang transparent. |
| 08 – Native-Parität | Erledigt | Die Native-App besitzt dieselbe fünfgliedrige Observatory-Navigation, keinen unpassenden Wetter-/Standortblock auf Home, den genehmigten Akzentvertrag und verbesserte Headerausrichtung. |
| 09 – Regression | Erledigt | Web-TypeScript, Native-TypeScript und 76 Vitest-Dateien mit 284 Tests bestehen. |
| 10 – Expo-Übergabe | Erledigt | Der Native-Code bleibt vorerst als geprüfte Buildbasis. Kein voreiliger APK-Build wurde gestartet. |

## Wissenschaftliche Datenwahrheit

> Ein fehlendes oder nicht vollständig belegtes Bild wird nicht durch ein ähnlich aussehendes Ersatzbild ersetzt. Die Anwendung zeigt den offenen Prüfzustand sichtbar an.

Öffentliche Taxonbilder werden ausschließlich akzeptiert, wenn die Taxonomiequelle zu einer konfigurierten Fachquelle gehört, der Bildpfad derselben Quelle zugeordnet werden kann und Quellseite, Lizenz, Attribution sowie Prüfzeitpunkt vorliegen. Zulässige Quellen sind derzeit **Plants of the World Online von Kew Science**, **FishBase**, **GBIF**, die **Biodiversity Heritage Library** und **JSTOR Global Plants**. Wikipedia und Wikimedia Commons sind ausgeschlossen.

Die Fundortflächen verarbeiten nur veröffentlichte, quellengebundene Verbreitungsangaben. Sie sind keine Darstellung privater Beobachtungskoordinaten und erzeugen keine Kartenpins oder Fundorte, wenn keine zulässigen Daten vorhanden sind.

## Verbleibende Release-Voraussetzung

Die einzige absichtliche fachliche Restaufgabe vor einem Produktiv- bzw. Expo-Release ist die Beschaffung und Prüfung von passenden Katalogbildern über die zugelassenen wissenschaftlichen Quellen. Bis zu dieser Prüfung bleiben die betroffenen Kacheln transparent im Zustand **„Bildnachweis offen“**. Dadurch wird weder ein falsches Bild noch eine nicht belastbare Quellenbehauptung veröffentlicht.

## Validierung

| Prüfung | Ergebnis |
|---|---|
| `pnpm exec tsc --noEmit` | bestanden |
| `pnpm --dir mobile-natur exec tsc --noEmit` | bestanden |
| `pnpm test -- --run` | 76 Testdateien / 284 Tests bestanden |

Die Validation enthält unter anderem Sicherheits-, Medien-, Standort-, Rollen-, Audit-, Community-, Marketplace-, Design-, Web-/Native-Paritäts- und Quellenschutztests.
