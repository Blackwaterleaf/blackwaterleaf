# Offene Taxonbildquellen – Verifikationsnotizen

## GBIF

GBIF hostet keine Originalmedien. Die Plattform speichert und vermittelt Medien-URLs von Herausgebern; detaillierte Metadaten können Creator, Beschreibung und Lizenz enthalten. GBIF weist darauf hin, dass Medienlizenzen restriktiver als die zugehörigen Vorkommensdaten sein können. Für eine Veröffentlichung muss deshalb die Lizenz des einzelnen Mediums kontrolliert werden, nicht nur die Lizenz des Vorkommensdatensatzes.[1] [2]

## iNaturalist

iNaturalist erklärt, dass hochgeladene Medien den jeweiligen Uploadern gehören. Einzelne Medien dürfen nur gemäß der konkret am Foto ausgewiesenen Creative-Commons-Lizenz genutzt werden; Lizenz und Attribution müssen pro Foto dokumentiert werden.[3] Die API ermöglicht Filter auf Research Grade, `photo_license` und Taxonname und gibt je Foto unter anderem Lizenzcode, Attribution und Originalabmessungen zurück.[4]

Für BlackWaterLeaf gilt für die laufende Prüfung: ausschließlich Research-Grade-Beobachtungen mit exakt übereinstimmendem Artnamen, Bildlizenz `CC0` oder `CC BY`, vollständiger API-Attribution, Originalgröße ab 1,2 Megapixeln und kürzester Seite ab 900 Pixeln. CC BY-NC, CC BY-SA, CC BY-ND, unlizenzierte Medien, Wikipedia und Wikimedia bleiben ausgeschlossen. Die erste Anfrage mit drei parallelen Verbindungen verursachte 198 HTTP-429-Antworten; Wiederholungen müssen gedrosselt und sequenziell mit Retry/Backoff erfolgen.

## Referenzen

[1]: https://techdocs.gbif.org/en/data-publishing/multimedia-publishing "GBIF – Sharing images, sounds and videos on GBIF"
[2]: https://techdocs.gbif.org/en/openapi/images "GBIF – Occurrence image API"
[3]: https://help.inaturalist.org/en/support/solutions/articles/151000169918-can-i-use-the-photos-and-sounds-that-are-posted-on-inaturalist- "iNaturalist – Can I use the photos and sounds that are posted on iNaturalist?"
[4]: https://www.inaturalist.org/api "iNaturalist API"

## Stichproben zur Darstellungsqualität

Zwei Originaldateien aus den nach der Regel ausgewählten Kandidaten wurden visuell geprüft. *Pogostemon helferi* ist als scharfes 2048 × 1536 Pixel großes Habitatfoto mit sichtbaren Blättern und Blüten dargestellt. *Trigonostigma heteromorpha* ist in einer 2048 × 904 Pixel großen Aufnahme klar erkennbar; Körperform, orange Färbung und schwarzer Keilfleck sind sichtbar. Beide Dateien erfüllten die technische Größenprüfung und wurden über die jeweilige Research-Grade-Beobachtung mit CC-BY/CC0-Lizenz und Attribution ermittelt. Diese Stichprobe ersetzt keine individuelle fachliche Bildbestimmung; sie bestätigt jedoch, dass die gewählte Quelle bei erfüllten Qualitätsfiltern brauchbare, detaillierte Originalfotos liefert.

## Technische Korrektur nach visueller Abnahme

Die erste Speicherung der 121 geprüften Bilder zeigte im Browser leere Bildflächen, obwohl die HTTP-Auslieferung funktionierte. Die Ursache lag in der JPEG-Metadatenbereinigung: Sie entfernte neben EXIF auch notwendige JPEG-Bildsegmente. Die Bereinigung wurde auf reine Metadaten- und Kommentarsegmente beschränkt, mit einer Regressionstest für Quantisierungs- und Frame-Segmente abgesichert und sämtliche 121 Katalogbilder neu gespeichert. Die Datenbankzuordnung, Fotoquelle, Lizenz, Urheberangabe und Prüfdaten blieben unverändert; alte Speicherobjekte werden nicht mehr referenziert.

## Visuelle Abnahme nach der Korrektur

Die Webansicht wurde nach dem Neuimport für eine Pflanzen- und eine Fischdetailseite erneut geprüft. Beide Katalogbilder werden sichtbar gerendert, sind sinnvoll in die Kartenfläche eingepasst und zeigen unterhalb des Artnamens die vollständige Attribution sowie den Link zur Quellbeobachtung. Der Pflanzennachweis zeigt *Pogostemon helferi* als detailliertes Habitatfoto; der Fischdatensatz zeigt *Trigonostigma heteromorpha* mit klar sichtbarer Körperform und Keilzeichnung. Die anonyme Speicherroute liefert für Katalogbilder einen erfolgreichen Bildabruf, während ein beliebiger Nutzerpfad weiterhin mit HTTP 403 gesperrt bleibt.
