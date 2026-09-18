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

## Auslieferungskonflikt nach der DNS-Änderung

Die `www`-DNS-Kette zeigt auf `cname.manus.space`. Eine Prüfung mit Cache-Parameter und eine direkte HTTPS-Anfrage an die aktuell aufgelöste Manus-Ziel-IP mit SNI und Hostnamen `www.blackwaterleaf.com` lieferten jedoch weiterhin den älteren Deploymentstand mit Titel `blkwaterleaf`. Dessen Oberfläche entspricht nicht dieser Parity-App und verweist auf `blkwaterleaf-tfjmvq7w.manus.space`.

Der aktuelle Parity-App-Stand ist über `bwlparity-nearrhpw.manus.space` erreichbar; das Projekt weist `www.blackwaterleaf.com` außerdem als hinterlegte Custom Domain aus. Der Konflikt wird deshalb als Plattform-/Domainzuordnungsfrage behandelt, nicht als zusätzliche DNS-Änderung. Bis zur eindeutigen Auflösung darf kein weiterer Webador-Record verändert werden.

## Abweichende Beobachtungen während der Propagation

Ein vom Nutzer am 16. September 2026 bereitgestellter Samsung-Browser-Screenshot zeigt `https://blackwaterleaf.com` mit der korrekten BlackWaterLeaf-Parity-App und deren Living-UI. Die externe Sandboxprüfung erhält für denselben Apex zu diesem Zeitpunkt hingegen noch einen TLS-Handshake-Fehler; außerdem hält mindestens ein öffentlicher Resolver den vorherigen A-Record im Cache.

Diese Beobachtungen sind als noch nicht abgeschlossene DNS-/Edge-Propagation zu behandeln. Sie rechtfertigen weder eine Rücknahme noch eine weitere Änderung der Webador-Records. Abschließend gelten erst eine erfolgreiche externe HTTPS-Prüfung beider Hostnamen, gültige Zertifikate und die Auslieferung derselben Parity-App über Apex und `www`.

## Nutzerabnahme nach der Propagation

Im Samsung-Browser wurde am 16. September 2026 der korrekte Aufruf von `https://blackwaterleaf.com` mit der BlackWaterLeaf-Parity-App nachgewiesen. Nach einem erneuten Test bestätigte der Nutzer außerdem ausdrücklich, dass `https://www.blackwaterleaf.com` ebenfalls die richtige App ausliefert.

Die Custom-Domain-Verwaltung des aktuellen Parity-Projekts zeigt für beide Hostnamen einen erfolgreichen Verbindungsstatus. Eine externe Prüfung aus einer anderen Netzwerkregion erhielt für `www` im selben Zeitraum noch den älteren Deploymentstand. Diese verbleibende, regionale Edge-Abweichung wird beobachtet, aber nicht durch weitere DNS-Änderungen verschärft. Der benutzerseitige Live-Zugriff ist abgenommen.

## Nachprüfung im aktuellen Browserkontext

Am 16. September 2026 lieferte `https://blackwaterleaf.com` im aktuellen Browserkontext unmittelbar die BlackWaterLeaf-Parity-Startseite mit dem Titel `BlackWaterLeaf – Botanik, Aquaristik & Terraristik`. Der Aufruf von `https://www.blackwaterleaf.com` führte ohne HTTPS-Warnung auf denselben kanonischen Apex-Aufruf und dieselbe Startseite. Damit ist die vorherige abweichende `www`-Auslieferung in diesem Prüfumfeld nicht mehr reproduzierbar.

Diese Nachprüfung ist rein lesend erfolgt. Es wurden weder Webador-DNS-Records noch die Manus-Domainzuordnung geändert.

Eine zusätzliche externe Prüfung vom 16. September 2026 bestätigt HTTP `200` für den Apex; das Zertifikat trägt `CN=blackwaterleaf.com`, ist über Google Trust Services ausgestellt und vom 16. September bis 15. Dezember 2026 gültig. `https://www.blackwaterleaf.com` liefert HTTP `301` auf `https://blackwaterleaf.com/`; sein eigenes Zertifikat trägt `CN=www.blackwaterleaf.com`, ist über Google Trust Services ausgestellt und vom 23. August bis 21. November 2026 gültig. Beide Zertifikate enthalten den jeweiligen Hostnamen als Subject Alternative Name. Die kanonische Weiterleitung von `www` ist damit technisch gültig und liefert dieselbe Parity-App über die Apex-Domain aus.

Die öffentliche HTML-Head-Prüfung bestätigt bei `https://blackwaterleaf.com` den Titel `BlackWaterLeaf – Botanik, Aquaristik & Terraristik` und die fünf fokussierten Meta-Keywords `Botanik, Aquaristik, Terraristik, Pflanzenpflege, Naturbeobachtung`. Für `https://www.blackwaterleaf.com` zeigt die Antwortkette zuerst die kanonische HTTP-`301`-Weiterleitung auf den Apex und nach dem Weiterleiten denselben Titel sowie dieselben Meta-Keywords. Die Prüfung erfolgte ausschließlich lesend.
