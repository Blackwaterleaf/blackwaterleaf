# AP-21 – Bildrechteentscheidung für den Katalog

**Datum:** 19. September 2026  
**Autor:** Manus AI  
**Entscheidungsstatus:** **Kein Bildimport freigegeben**

## Schlussfolgerung

BlackWaterLeaf kann zurzeit **kein** fehlendes Katalogbild aus den geprüften öffentlichen Quellen veröffentlichen. Die Anwendung bleibt deshalb korrekt im Zustand **„Bildnachweis offen“**. Diese Entscheidung verhindert falsche Artzuordnungen, nicht belegte Urheberangaben und eine nicht zulässige kommerzielle Nutzung.

Die Prüfung betraf 81 veröffentlichte Taxa ohne vollständigen Bildnachweis: 66 Pflanzen und 15 Channa-Arten. Die GBIF-Prüfung fand keine Kandidaten, die zugleich eine exakte Artzuordnung, eine überprüfbare Originalquelle und eine zulässige Lizenz erfüllten. Die FishBase-Prüfung wertete 81 einzelne Bildkarten für alle 15 Channa-Arten aus. Keine Karte besaß eine für BlackWaterLeaf zulässige kommerziell wiederverwendbare Lizenz.

| Quelle | Ergebnis | Konsequenz |
|---|---|---|
| GBIF | 81 Taxa geprüft; kein vollständig prüfbarer Kandidat | GBIF bleibt wissenschaftlicher Nachweisindex, aber kein Bildhost. |
| FishBase | 81 Einzelbildkarten geprüft; 0 zulässige Lizenz | Alle FishBase-Bilder bleiben gesperrt. |
| Kew / POWO | Taxonomie und Bilder vorhanden, aber Kew-Webinhalte benötigen für kommerzielle Nutzung eine Lizenz, sofern keine gesonderte Lizenz steht | Keine POWO-Bilder ohne explizite Einzelbildlizenz oder schriftliche Freigabe. |
| Biodiversity Heritage Library | Wiederverwendung ist nur für den jeweiligen Bandstatus zulässig | Moderne CC-BY-NC-SA- und andere nichtkommerzielle Werke bleiben gesperrt. |

> **Freigaberegel:** Ein Katalogbild darf erst erscheinen, wenn die Art exakt stimmt, die Originalquelle stabil dokumentiert ist, Bilddatei und Urheber vorliegen und eine kommerziell wiederverwendbare Lizenz schriftlich oder maschinenlesbar belegt ist.

## Technische Absicherung

Die Importregel akzeptiert nun ausschließlich **CC0**, **CC BY 3.0** oder **CC BY 4.0**. Sie blockiert CC-BY-NC, „all rights reserved“, Rechte mit Genehmigungsvorbehalt und unklare Lizenzangaben. GBIF kann als Taxonomie- oder Nachweisquelle verlinkt werden, darf jedoch niemals als direkte Bildquelle behandelt werden, weil GBIF Originalmedien nicht selbst hostet.[1]

Wikipedia und Wikimedia Commons bleiben unabhängig davon vollständig ausgeschlossen. Es gab keinen Bilddownload, keinen Datenbankimport und keine Veröffentlichung aus den Prüfungen.

## Entscheidung für die Fortsetzung

Für die vollständige Bebilderung ist eine der folgenden Strategien erforderlich. Die Auswahl ändert die Rechte- und Produktionspflichten wesentlich.

| Option | Ergebnis | Voraussetzung |
|---|---|---|
| **A – Eigene Fachbilder** | Höchste Kontrolle und einheitliche Bildsprache | Bilder selbst erstellen oder von beauftragten Fotograf:innen mit schriftlicher, kommerzieller Nutzungslizenz einholen. |
| **B – Schriftliche Rechtefreigaben** | Erlaubt gezielt passende FishBase-/POWO- oder Institutionsbilder | Rechteinhaber:innen kontaktieren und je Bild eine unbefristete digitale Veröffentlichungsfreigabe für BlackWaterLeaf dokumentieren. |
| **C – Ausschließlich gemeinfreie / CC-BY-Fachabbildungen** | Keine Rechteanfrage, aber voraussichtlich unvollständige Abdeckung und historische Darstellungsform | Für jedes Bild die konkrete Veröffentlichung, den Copyright-Status, die Artidentität und die Attribution einzeln prüfen. |

Bis zu dieser Entscheidung bleibt der Katalog absichtlich ohne Ersatzbilder. Die Funktionsfähigkeit von Suche, Fundortinformationen, Taxonomie und KI hängt nicht von den fehlenden Bildern ab.

## References

[1]: https://techdocs.gbif.org/en/data-publishing/multimedia-publishing "GBIF: Sharing images, sounds and videos on GBIF"
[2]: https://www.fishbase.se/summary/citation.php "FishBase citation and copyright statement"
[3]: https://www.fishbase.se/photos/ThumbnailsSummary.php?ID=343 "FishBase Channa striata picture index"
[4]: https://www.kew.org/terms-and-conditions "Kew terms of use"
[5]: https://about.biodiversitylibrary.org/help/copyright-and-reuse/ "Biodiversity Heritage Library copyright and reuse"
