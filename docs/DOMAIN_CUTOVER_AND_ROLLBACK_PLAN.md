# BlackWaterLeaf – Domainumschaltung und Rückfallplan

**Status:** Zur ausdrücklichen Freigabe vorbereitet; noch nicht ausgeführt
**Neuer Web-Stagingstand:** Checkpoint `846dc786`
**Aktuelle Produktion:** veröffentlichte Webador-Seite

## Aktueller Rückfallanker

| DNS-Name | Aktuell bestätigter Wert | Bedeutung |
|---|---|---|
| `blackwaterleaf.com` | `A → 35.204.150.5` | Webador-Hauptadresse |
| `www.blackwaterleaf.com` | `A → 35.204.150.5` | Webador-www-Adresse |
| Autoritative DNS-Verwaltung | Webador/Openprovider | Dort liegen auch die unveränderten Mail-, SPF- und DKIM-Einträge |

Diese beiden A-Einträge sind der dokumentierte Rückfallzustand. Mail-, SPF-, DKIM- und sonstige Einträge dürfen während der Webumschaltung nicht verändert werden.

## Sichere Umschaltsequenz

1. Der Nutzer veröffentlicht Checkpoint `846dc786` über die **Publish**-Schaltfläche in der Projektoberfläche. Die Veröffentlichung wird nicht automatisiert ausgelöst.
2. Die dadurch erzeugte öffentliche Manus-Adresse wird vor jeder Domainänderung auf HTTPS, Home, Anmeldung, Profil, Botanik, Aquaristik, Terraristik, Community, Wissen, KI-Sperre, Datenbank und Medienzugriff geprüft.
3. In **Settings → Domains** wird `blackwaterleaf.com` vorbereitet. Die dort tatsächlich angezeigten DNS-Zielwerte werden exakt übernommen; es werden keine Zielwerte geraten.
4. Vor dem Speichern werden alter Wert, neuer Wert, TTL und betroffene Hostnamen erneut vorgelegt. Die eigentliche DNS-Änderung benötigt eine weitere ausdrückliche Bestätigung.
5. Nach der Änderung werden autoritative Nameserver, mehrere öffentliche Resolver, TLS-Zertifikat, Apex-/www-Weiterleitung und alle Kernrouten geprüft.
6. Die Webador-Seite und ihre DNS-Ausgangswerte bleiben als Rückfalloption dokumentiert, bis die neue App stabil abgenommen ist.

## Rückfall

Wenn TLS, Anmeldung, API, Datenbank oder zentrale Routen nach der Umschaltung nicht stabil funktionieren, werden ausschließlich die veränderten Webhost-Einträge auf `A → 35.204.150.5` zurückgesetzt. Danach werden autoritative Auflösung und HTTPS erneut geprüft. Datenbankmigrationen oder Nutzerdaten werden bei einem DNS-Rückfall nicht gelöscht oder zurückgesetzt.

## Noch nicht Teil der Freigabe

Die Domainumschaltung stellt die Web-App bereit, macht die Native-App jedoch nicht automatisch laufzeitparitätisch. Der Native-Stagingclient muss anschließend separat an dieselbe veröffentlichte API angebunden und auf einem S23 Ultra geprüft werden. Ebenso bleibt der KI-Assistent gesperrt, bis Anbieter, Kosten und Datenschutz ausdrücklich freigegeben sind.
