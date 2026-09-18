# BlackWaterLeaf – Partner-Teststatus

Die technische Partnerverwaltung wurde mit leeren Produktionsdaten geprüft. Die Datenbank enthält aktuell **0 Partnerprofile**, **0 Platzierungen** und **0 Freigabeereignisse**. Der öffentliche Startseitenbereich rendert deshalb ausschließlich seinen neutralen, klar gekennzeichneten Leerzustand.

| Prüfschritt | Nachweis | Ergebnis |
|---|---|---|
| Rechte | Normale Nutzer werden vor Listen- und Änderungsverfahren abgewiesen. | bestanden |
| Freigabe | `granted`, `revoked` und fehlende Freigabe sind eigenständig modelliert; nur das letzte Ereignis zählt. | bestanden |
| Gültigkeit | Start- und Endzeit werden serverseitig validiert; das Ende muss nach dem Beginn liegen und eine aktive Platzierung darf nicht bereits abgelaufen sein. | bestanden |
| Öffentliche Anzeige | Genehmigung, aktuelle Freigabe, Status `active` und Gültigkeitsfenster werden gemeinsam geprüft. | bestanden |
| Positive Ende-zu-Ende-Kette | Erfordert eine tatsächlich autorisierte Person oder Firma. | bewusst offen |

Es wurden keine Testpartner, Unternehmen, Privatpersonen oder Werbeanzeigen angelegt. Der offene Positivtest wird erst durchgeführt, wenn der Admin einen realen, autorisierten Partner über das Dashboard anlegt.
