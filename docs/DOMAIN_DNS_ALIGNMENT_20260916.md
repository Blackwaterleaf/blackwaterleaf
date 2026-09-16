# BlackWaterLeaf – DNS-Abgleich Webador und Manus

**Stand:** 16. September 2026, vor abschließender Speicherung der DNS-Korrektur.  
**Quelle:** Benutzerbestätigter Manus-Domänendialog sowie rein lesende Webador-DNS-Verwaltung.

| Name | Bislang veröffentlichter Webador-Wert | Bestätigter Manus-Wert | Geplanter Record |
|---|---|---|---|
| `@` / `blackwaterleaf.com` | `A → 35.204.150.5` | Root-CNAME wäre `cname.manus.space`, ist aber mit dem vorhandenen MX-Datensatz unvereinbar | `A → 104.18.26.246` |
| `www` | `A → 35.204.150.5` | `cname.manus.space` | `CNAME → cname.manus.space` |

Der gemeinsame Versuch, `@` und `www` als CNAME auf `cname.manus.space` zu speichern, wurde von Webador mit dem Hinweis abgelehnt, dass die Kombination ungültig sei. Der Grund ist der bestehende MX-Datensatz `mail.webador.com` am Apex. Der Manus-Domänendialog stellt für genau diesen Fall den A-Record-Fallback `104.18.26.246` bereit.

Die folgenden Einträge sind von der Änderung ausgenommen: der MX-Datensatz, der SPF-TXT-Record, die SparkPost- und JouwWeb-DKIM-CNAMEs sowie alle weiteren DNS-Records. Es existiert vor der Speicherung kein bestätigter neuer öffentlicher DNS-Record; die Werte im Webador-Formular sind bis zum erfolgreichen Speichern lediglich Entwürfe.

Nach einer erfolgreichen Speicherung sind DNS-Propagation, Apex, `www`, TLS-Zertifikate, Manus-Domainverifizierung und der Rückfall auf die ursprünglichen Webador-A-Records getrennt zu prüfen.

## Gespeicherte Korrektur

Webador hat am 16. September 2026 die beiden bestätigten Website-Records erfolgreich gespeichert:

| Name | Gespeicherter Record |
|---|---|
| `@` / `blackwaterleaf.com` | `A → 104.18.26.246` |
| `www` | `CNAME → cname.manus.space` |

Der MX-Record `mail.webador.com`, der SPF-TXT-Record sowie die beiden DKIM-CNAMEs blieben unverändert. Webador zeigt anschließend erwartungsgemäß an, dass die Datensätze nicht mehr zu einer **Webador**-Website passen. Dieser Hinweis bestätigt lediglich, dass die Websiteauslieferung von Webador weg auf das andere Website-System zeigt; er ist keine Fehlermeldung der gespeicherten Manus-Zielwerte.

## Propagations- und HTTPS-Prüfung

Die drei geprüften öffentlichen Resolver (1.1.1.1, 8.8.8.8 und 9.9.9.9) sowie der autoritative Openprovider-Nameserver liefern den gespeicherten Apex-A-Record `104.18.26.246` und den `www`-CNAME `cname.manus.space` aus. `https://www.blackwaterleaf.com` antwortet mit HTTP 200, liefert die BlackWaterLeaf-Web-App aus und präsentiert ein gültiges Zertifikat für `www.blackwaterleaf.com`.

Die Apex-Domain `https://blackwaterleaf.com` liefert aktuell noch `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`. Dies ist vom bereits funktionierenden `www` getrennt und bedeutet, dass die Apex-Verbindung im Manus-Domänendialog noch verifiziert beziehungsweise deren Zertifikat bereitgestellt werden muss. Es wurde deshalb kein weiterer DNS-Record verändert.
