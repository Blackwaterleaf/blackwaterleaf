# BlackWaterLeaf – Händlerprodukte und Partnerfreigabe

**Stand:** 16. September 2026
**Geltung:** Produktverwaltung für real autorisierte Partner in BlackWaterLeaf; **BlackWaterLeaf Studio ist ausgeschlossen**.

| Element | Umsetzung | Öffentliche Grenze |
|---|---|---|
| Händlerprodukt | Additive Tabelle `partner_products` mit Partnerbezug, Titel, optionaler Beschreibung, HTTPS-Zieladresse, optionaler Preisangabe und Status. | Neue Datensätze starten immer als `draft`. |
| Verwaltung | Nur aktive, serverseitig verifizierte Admins dürfen Produkte eines Partnerprofils lesen, anlegen oder im Status ändern. | Moderatoren und normale Konten erhalten keinen Zugriff. |
| Aktivierung | Ein Produkt darf nur aktiv werden, wenn der zugehörige Partner genehmigt, aktuell autorisiert und über eine aktive Startseitenplatzierung innerhalb seines Zeitfensters freigegeben ist. | Wird die Partnerfreigabe widerrufen oder der Partner pausiert, bleibt das Produkt nicht öffentlich sichtbar. |
| Darstellung | Öffentliche Produkte erscheinen nur innerhalb der bereits als Werbung gekennzeichneten Partnerkarte und verlinken mit `rel="sponsored nofollow noopener"` auf die HTTPS-Zieladresse. | Kein Warenkorb, keine Bestellung, keine Zahlung und keine Preisberechnung in BlackWaterLeaf. |
| Bildmaterial | Im ersten Ausbauschritt werden keine Produktbilder gespeichert oder übernommen. | Ein späteres Produktbild benötigt einen getrennten, autorisierten S3-Upload und eine belegte Bildnutzungsfreigabe. |

Jede Produktanlage und Statusänderung wird im serverseitig signierten, hashverketteten Audit-Ledger erfasst. Die Migration `0008_clumsy_sumo.sql` wurde als rein additive Tabelle samt Fremdschlüsseln, Eindeutigkeitsregel und Index angewendet; die Datenbank enthielt unmittelbar danach **keine Produktdatensätze**.

Die Produktaktivierung besitzt eine sichtbare Admin-Fehlerführung: Fehlt die genehmigte Partnerrolle, die aktuelle Werbefreigabe oder eine aktive Startseitenplatzierung, bleibt das Produkt gesperrt und die Oberfläche erklärt die drei erforderlichen Voraussetzungen. Die Vertrags-, Rechte- und Freigabetests bestätigen außerdem, dass nicht aktive Produktentwürfe und Produkte widerrufener oder pausierter Partner nicht in der öffentlichen Partnerkarte erscheinen. Ein zusätzlicher Präsentationstest prüft den ehrlichen öffentlichen Leerzustand ohne Produktteaser. Die abschließende lokale Validierung umfasst **66 bestandene Tests**, TypeScript und den Produktionsbuild; die Partnerverwaltung wurde auf Desktop und in einer S23-Ultra-nahen Ansicht geprüft.

## Kiemen-Kumpel: nächster kontrollierter Schritt

Die vom BlackWaterLeaf-Administrator bestätigte Zieladresse lautet `https://kiemen-kumpel.de/`. Die öffentliche Website ist HTTPS-erreichbar und beschreibt einen Aquaristik-Shop mit Sortiment, unter anderem Einrichtung, Technik, Futter, Wasserpflege und Naturprodukten. Diese öffentlich sichtbaren Angaben werden **nicht** als BlackWaterLeaf-Produktdaten kopiert oder automatisch übernommen.

Der reale Partner wird im Adminbereich zunächst als nicht öffentlicher Entwurf angelegt. Vor dem Anlegen ist dort die Einordnung **„Firma“** oder **„Privatperson“** bewusst zu prüfen. Erst nach anschließender Genehmigung und aktiver Startseitenplatzierung wird die bereits bestätigte, mit `Werbung` gekennzeichnete Partnerkarte öffentlich sichtbar. Produkte bleiben bis zur manuellen Erfassung ebenfalls leer.

## Reale Abnahme: Kiemen-Kumpel

Der BlackWaterLeaf-Administrator bestätigte Kiemen-Kumpel als **Firma** und autorisierte die öffentliche, als `Werbung` gekennzeichnete Anzeige mit der Zieladresse `https://kiemen-kumpel.de/`. Das Partnerprofil wurde mit exakt diesen Daten zunächst als `draft` angelegt. Anschließend wurden die Partnergenehmigung und die unbefristete Startseitenplatzierung als `active` gesetzt. Es wurden **keine** Produkte, Preise, Bilder oder Social-Media-Adressen gespeichert.

| Prüfschritt | Nachweis | Ergebnis |
|---|---|---|
| Serverseitige Berechtigung | Die aus der Datenbank verifizierte aktive Adminrolle des BlackWaterLeaf-Kontos führte die Anlage aus. | bestanden |
| Freigabe und Platzierung | Aktuelle Freigabe `granted`, Partnerstatus `approved`, Home-Platzierung `active`, kein Start- oder Enddatum. | bestanden |
| Öffentliche Kennzeichnung | Die Startseite zeigt „Werbung“, „Kiemen-Kumpel“, „Unternehmenspartner“, die externe Partnerseite und den ehrlichen Hinweis auf fehlende freigegebene Produkte. Ein Präsentationstest verifiziert diese fünf Elemente gemeinsam. | bestanden |
| Deaktivierungsgates | Nach erneuter ausdrücklicher Freigabe wurde die reale Home-Platzierung pausiert und danach das reale Partnerprofil entfernt. In beiden Fällen zeigte die öffentliche Startseite unmittelbar den neutralen Leerzustand ohne Kiemen-Kumpel-Karte. Anschließend wurde der bestätigte Endzustand `approved` + `active` wiederhergestellt und auf der Startseite erneut geprüft. | bestanden |
| Audit | Anlage, Genehmigung, erste Aktivierung, Pausierung, Entfernung und Wiederherstellung sind im signierten Ledger protokolliert. Der vollständige Integritätslauf ergab `valid: true` bei zwölf Einträgen. | bestanden |

Damit ist der reale Partnerfluss abgeschlossen. Der einzige anschließende Inhaltsschritt ist optional: Produkte können später im geschützten Adminbereich erfasst werden. Ein Produkt wird weiterhin erst nach seiner ausdrücklichen manuellen Anlage und Aktivierung innerhalb dieser freigegebenen Partnerkarte angezeigt.

### Abschlussabfrage nach Wiederherstellung

Die finale Datenbankabfrage belegt für Partner-ID `1`: `partyType=company`, `partnerStatus=approved`, `authorizationState=granted`, `placementStatus=active`, unbefristetes Zeitfenster, die bestätigte HTTPS-Zieladresse und `productCount=0`. Die reale öffentliche Routerabfrage liefert genau eine Partnerkarte für Kiemen-Kumpel mit `disclosureLabel=Werbung`, `partyType=company`, der HTTPS-Zieladresse sowie `products=[]`.

Die echte Lebenszyklusfolge wurde zusätzlich automatisiert und über die reale öffentliche Routerabfrage dokumentiert: `active → paused → removed → restored`. Die Ergebnisse waren eindeutig: vor dem Pausieren und nach der Wiederherstellung enthielt die öffentliche Antwort genau einen Eintrag `Kiemen-Kumpel` mit Kennzeichnung `Werbung` und `products=[]`; während `paused` und `removed` enthielt sie keinen öffentlichen Partner. Die Gesamtsuite nach der parallelen Synchronisierung des lokalen Zugangssystems umfasst **78 bestandene Tests**, TypeScript und den Produktionsbuild. Der Audit-Ledger validierte danach weiterhin erfolgreich mit `valid: true` und zwölf Einträgen.

| Öffentliche Query-Phase | `publicPartnerCount` | Kiemen-Kumpel sichtbar | Öffentliche Antwort |
|---|---:|---|---|
| `active_before_pause` | 1 | ja | `id=1`, `displayName=Kiemen-Kumpel`, `disclosureLabel=Werbung`, `products=0` |
| `paused` | 0 | nein | `[]` |
| `removed` | 0 | nein | `[]` |
| `active_after_restore` | 1 | ja | `id=1`, `displayName=Kiemen-Kumpel`, `disclosureLabel=Werbung`, `products=0` |
