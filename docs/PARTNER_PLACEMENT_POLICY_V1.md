# BlackWaterLeaf – Partner- und Platzierungsregelwerk V1

## Zweck und Grundsatz

Diese Oberfläche verwaltet **reale Partnerplatzierungen** für Personen und Unternehmen. Sie ist kein Empfehlungsautomatismus, kein Affiliate-Datenimport und enthält keine vorausgefüllten Partner. Eine Platzierung wird nur sichtbar, wenn eine aktive Adminrolle den Partner gezielt erfasst, dessen Freigabe bestätigt und die Startseitenplatzierung ausdrücklich aktiviert.

| Stufe | Serverseitige Voraussetzung | Öffentliche Sichtbarkeit |
|---|---|---|
| Partnerentwurf | Name, Typ und versioniertes Freigabeereignis `granted`; Profilstatus `draft` | Nein |
| Partner genehmigt | Profilstatus `approved` und aktuellstes Freigabeereignis `granted` | Nein |
| Startseitenentwurf | Platzierung `draft` | Nein |
| Aktive Werbung | Profil `approved`, aktuellste Freigabe `granted`, Platzierung `active` und innerhalb des Gültigkeitszeitraums | Ja, klar gekennzeichnet |
| Pause, Ablauf oder Entfernung | Profil oder Platzierung ist nicht aktiv | Nein |

## Datenminimierung und Sicherheit

Es werden nur Anzeigename, Typ (Person oder Firma), optionale HTTPS-Zieladresse, Kennzeichnung, versionierte Freigabeereignisse, Gültigkeitszeiten und Zustände gespeichert. Ein Freigabeereignis ist append-only und dokumentiert entweder `granted` oder `revoked`; nur das aktuellste Ereignis ist maßgeblich. Der öffentliche Endpunkt liefert ausschließlich aktive Platzierungen; er enthält keine internen Adminangaben, keine Freigabedetails und keine Kontaktinformationen. Partnerverwaltung, Genehmigung, Freigabeänderung und Aktivierung verwenden ausschließlich `adminProcedure` und erhalten jeweils einen signierten, hashverketteten Audit-Ledgereintrag.

Die Kennzeichnung ist standardmäßig **„Werbung“** und bleibt für jedes aktive Frontseitenprofil sichtbar. Ein optionaler Link ist auf HTTPS beschränkt und wird mit `rel="sponsored nofollow noopener"` geöffnet.

## Bedienung

1. Im **Kontrollzentrum → Partner** wird zunächst ein echter Partner als Entwurf angelegt. Die Checkbox bestätigt, dass eine tatsächliche Werbe- und Veröffentlichungsfreigabe vorliegt.
2. Der Admin genehmigt das Partnerprofil.
3. Der Admin aktiviert die Startseitenplatzierung. Erst dann erscheint der gekennzeichnete Partner auf der Startseite.
4. Eine Pause, ein Ablauf, eine Entfernung oder der Entzug der Partnergenehmigung beendet die öffentliche Darstellung.

Die Regel ersetzt keine rechtliche Prüfung eigener Werbeverträge, Einwilligungen oder Kennzeichnungspflichten.
