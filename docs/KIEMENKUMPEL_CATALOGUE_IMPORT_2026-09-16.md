# KiemenKumpel-Katalogimport

**Ausgeführt:** 16. September 2026
**Quelle:** vom Projektinhaber bereitgestellter Shopify-CSV-Export `products_export_1(1).csv`
**Ziel:** autorisiertes und freigegebenes Partnerprofil **Kiemen-Kumpel**

## Ergebnis

Der Import hat **105 aktive Artikel** aus dem Export in den BlackWaterLeaf-Marktplatz übernommen. Der einzelne im Quellsystem deaktivierte Artikel wurde bewusst nicht aktiviert oder veröffentlicht. Zusätzlich wurde die aktive, aber nicht als Ware vorgesehene **„Energiekostenpauschale“** als betrieblicher 0,00-€-Abrechnungszusatz erkannt und aus dem öffentlichen Sortiment ausgeschlossen. Der Quellartikel bleibt nachvollziehbar im Partnerkatalog gespeichert, jedoch pausiert. Alle übernommenen Artikel bleiben als externe Partnerangebote gekennzeichnet; Kauf, Zahlung, Versand, Rückgabe und Support erfolgen weiterhin im KiemenKumpel-Shop.

| Prüfungspunkt | Ergebnis |
|---|---:|
| Quellprodukte im Export | 107 |
| Öffentlich übernommene Produkte | 105 |
| Ausgeschlossene inaktive Produkte | 1 |
| Ausgeschlossene betriebliche Zuschläge | 1 |
| Gespeicherte Produktbilder | 151 |
| Produktkategorien | 10 |
| Importfehler bei Bildern | 0 |

## Übernommene Produktinformationen

Für jedes aktive Produkt wurden der Shopify-Handle, der Originaltitel, die bereinigte Textbeschreibung sowie die unveränderte HTML-Quellbeschreibung, Anbieter, Produkttyp, Produktkategorie, Tags, Varianten, SKU-bezogene Variantendaten, Preisangaben, SEO-Titel, SEO-Beschreibung und die Quellbilder übernommen. Die Bildquelle wird ausschließlich über HTTPS vom Shopify-CDN akzeptiert; Typ und Größe werden vor der Speicherung geprüft. Die Galerie ist positionsgebunden und das erste vorhandene Galeriebild bestimmt die Marktplatzvorschau.

## Öffentliche Darstellung

Der Marktplatz bietet eine Suche über Titel, Anbieter, Typ, Kategorie und Beschreibung. Die Kategorien lassen sich direkt filtern. Produktseiten zeigen eine Galerie, Preisangabe, Kategorie, Variantenhinweis, Anbieterbezug, SEO-Titel für den Browser und eine transparente Weiterleitung zum Partnerangebot. Öffentliche Produkte und Galerien passieren weiterhin die bestehende Freigabeprüfung für Partnerprofil, aktuelle Autorisierung und aktive Platzierung.

## Wiederholbarer Import

Der Importer `scripts/import-kiemenkumpel-catalogue.ts` ist idempotent. Er aktualisiert Artikel über die Kombination aus Partnerprofil und Shopify-Handle, anstatt Dubletten zu erzeugen. Vor einem erneuten Import kann ein Trockenlauf verwendet werden:

```bash
pnpm exec tsx scripts/import-kiemenkumpel-catalogue.ts /absoluter/pfad/zum/export.csv --dry-run
```

Ein echter Import führt zusätzlich einen unveränderbaren Audit-Eintrag mit Anzahl der Quellprodukte, aktiv importierten Produkte, aktualisierten Produkte und Bildresultate aus. Der nicht als Ware gedachte Abrechnungszusatz `energiekostenpauschale` ist fest von der öffentlichen Produktauswahl ausgeschlossen.
