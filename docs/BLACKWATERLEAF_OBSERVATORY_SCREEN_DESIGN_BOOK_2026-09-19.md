

## 15.14 Uploadstatus, Broadcast-Lifecycle, Katalogfilter und Profilmedien
Der Medienupload zeigt Web und Native vor und während der Verarbeitung einen sichtbaren Fortschrittsbalken mit Phase, Prozentwert und geschätzter Restzeit. Fehler setzen den Fortschritt zurück und bleiben als verständlicher Status am Composer sichtbar; private Medien werden erst nach ausdrücklicher Veröffentlichung öffentlich.

Der Admin-Bereich ist die autorisierte Stelle für Informationen an den allgemeinen Feed oder einen Fachbereich. Admin-Broadcasts können nach Veröffentlichung bearbeitet oder zurückgezogen werden. Optional werden sie mit `publishAt` geplant und mit `expiresAt` automatisch aus dem Feed ausgeblendet. Ein geplanter Beitrag bleibt bis zum Zeitpunkt serverseitig unsichtbar; Ablauf und Statusprüfung erfolgen ebenfalls serverseitig. Alle Mutationen werden im Audit-Ledger vermerkt.

Vollständige Fachkataloge besitzen auf Web und Native eine schnelle alphabetische A–Z-Navigation. Zusätzlich stehen echte Filter für Familie, Gattung und Bildnachweis zur Verfügung: „Alle“, „Verifiziert“ und „Ohne Bild“. Filter verändern nur die Darstellung bereits geladener, veröffentlichter Katalogdaten; es werden keine Einträge ergänzt oder erfunden.

Öffentliche Profile übernehmen dieselbe große Medienkartenlogik wie der Community-Feed: zwei gut erkennbare Karten auf schmalen Ansichten, vollständige Bildproportion, Video-Steuerung, Quellenbindung und eine antippbare Zoomansicht. Private Entwürfe und nicht freigegebene Medien bleiben ausgeschlossen. Web und Native verwenden dieselben Daten- und Sichtbarkeitsregeln.
