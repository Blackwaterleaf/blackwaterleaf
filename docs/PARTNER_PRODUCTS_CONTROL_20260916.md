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
