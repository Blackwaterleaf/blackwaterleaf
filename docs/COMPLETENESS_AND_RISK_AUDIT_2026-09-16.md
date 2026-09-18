# BlackWaterLeaf – Vollständigkeits- und Problemaudit

**Prüfdatum:** 16. September 2026
**Prüfstand:** WebDev-Checkpoint `fba41db0`, öffentliche Domain `https://blackwaterleaf.com`, GitHub-PR #6 (`6c5e492`), Live-Datenbank und lokale Arbeitskopien.
**Änderungen im Audit:** Keine Anwendungs-, Datenbank-, GitHub-, Deployment- oder Domainänderungen.

## Gesamturteil

Die Anwendung ist **funktional vorführbar und visuell konsistent**, jedoch **noch nicht vollständig produktionsreif**. Die Kernoberflächen, Marktplatzdaten, privaten Profilbereiche, KI-Sperrzustände, Wettergrenzen und V2-Referenzoberflächen sind vorhanden. TypeScript, Produktionsbuild und **139 Tests in 37 Testdateien** sind erfolgreich.

Die wichtigsten offenen Risiken liegen nicht im sichtbaren Layout. Sie betreffen den lokalen E-Mail-Login, die Autorisierung privater Speicherdaten, umgehbare tRPC-spezifische Ratenlimits, die nicht reproduzierbare Migrationshistorie und fehlende technische SEO-Dateien. Bis diese Punkte gelöst und separat geprüft sind, sollte die Anwendung **nicht als vollwertige öffentliche Account- und Datenplattform** beworben werden.

## Abnahmeübersicht

| Prüfbereich | Ergebnis | Einordnung |
|---|---|---|
| V2-Referenzlayout und Kernrouten | Weitgehend vollständig | Visuals, vierteilige Navigation, ehrliche Sensorzustände und die öffentlichen Kernseiten sind vorhanden. Einzelne Fehl- und Deep-Link-Pfade müssen nachgebessert werden. |
| Marktplatz und KiemenKumpel-Katalog | Funktional vorhanden | 105 freigegebene Produkte und 151 Galerieeinträge sind erreichbar. Kauf bleibt korrekt beim Partner. Alttexte und eine Varianten-URL benötigen Korrektur. |
| Lokale Konten | Sichere Sperre, aber unvollständig | Ohne Versandsecrets ist Registrierung/Reset absichtlich deaktiviert. Bestehende lokale Konten können sich anmelden; ein echter neuer Account-Lebenszyklus ist noch nicht produktionsfähig. |
| KI und Smart-Geräte | Teilweise umgesetzt | KI ist serverseitig an Authentifizierung und Consent gekoppelt. Smart-Geräte sind aktuell nur eine private Vorauswahl, keine echte Geräteintegration. |
| Datenbank | Live-Schema vollständig, Historie riskant | Der Schema-Endzustand stimmt mit Snapshot 0015 überein. Der Migrationsjournalzustand ist jedoch nicht zuverlässig reproduzierbar. |
| GitHub und Deployment | WebDev live, GitHub noch offen | Die Live-Domain zeigt den aktuellen Funktionsstand. PR #6 ist sauber, aber nicht nach `main` gemergt. |
| SEO, PWA und Monitoring | Unvollständig | Crawler-Dateien fehlen, Metadaten sind nicht route-spezifisch, das produktive Manifest fehlt und der öffentliche Health-Endpunkt antwortet nicht. |

## Priorität 1 – Vor einer produktiven Kontofreigabe beheben

### 1. Lokaler E-Mail-Account-Flow ist nicht produktionsfähig

`RESEND_API_KEY`, `AUTH_FROM_EMAIL`, `AUTH_REPLY_TO_EMAIL` und `AUTH_PUBLIC_ORIGIN` sind in der geprüften Laufzeit nicht gesetzt. Die Anwendung reagiert korrekt fail-closed: Registrierung, Passwortreset und erneute Verifikation werden nicht vorgetäuscht, sondern mit `local_auth_email_not_configured` abgewiesen. Damit kann sich derzeit kein neuer Nutzer zuverlässig registrieren oder sein Passwort wiederherstellen.

**Sichere Lösung:** Bestehende Webador-Mailbox als Reply-To beibehalten, eine Resend-verifizierte Versanddomain und einen sendebeschränkten Schlüssel in den Projektsecrets hinterlegen und anschließend Registrierung, Verifikationslink, Reset, Ablauf und Zustellung auf der kanonischen HTTPS-Domain Ende-zu-Ende testen. Die alte Manus-OAuth-Anmeldung erst nach dieser Abnahme entfernen.

### 2. Private Speicherobjekte können über bekannte Speicherpfade neu signiert werden

Der öffentliche Storage-Proxy signiert nach aktuellem Code einen übergebenen `/manus-storage`-Schlüssel neu, ohne Sitzung, Eigentum oder Veröffentlichungsstatus serverseitig zu prüfen. Kennt jemand einen privaten Key, kann dies die Vertraulichkeit von privaten Medien gefährden.

**Sichere Lösung:** Den Proxy entfernen, wenn bereits kurzlebige signierte URLs ausreichen. Falls ein Proxy nötig bleibt, darf er ausschließlich interne Medien-IDs entgegennehmen. Er muss dann den zugehörigen Datensatz laden und Eigentum oder öffentliche Sichtbarkeit vor der Signierung prüfen. Dieser Fix sollte mit positiven und negativen Autorisierungstests abgesichert werden.

### 3. Auth-, KI- und Community-Ratenlimits greifen nicht zuverlässig auf tRPC-Punkt- und Batchpfade

Die speziellen Express-Mounts passen nicht zu tRPC-Pfaden wie `assistant.chat`. Der Browser nutzt zudem Batch-Anfragen. Dadurch gilt in den geprüften Fällen nur das deutlich großzügigere allgemeine API-Limit. Das erhöht insbesondere bei Passwortversuchen und kostenpflichtigen KI-Aufrufen das Missbrauchs- und Kostenrisiko.

**Sichere Lösung:** Limits in einer tRPC-Middleware pro Verfahren sowie pro Benutzer/IP erzwingen oder Batch für Auth- und KI-Verfahren abschalten. Danach Tests mit echten Punktpfaden und kombinierten Batchpfaden ausführen.

### 4. Leeres JWT-Secret wird nicht als Startfehler behandelt

Die Umgebung fällt bei fehlendem `JWT_SECRET` auf einen leeren String zurück. Im geprüften Kontext ist ein Secret gesetzt, aber eine fehlerhafte Produktionskonfiguration würde den Prozess nicht sicher stoppen.

**Sichere Lösung:** Beim Start außerhalb expliziter Tests ein nichtleeres, ausreichend starkes Secret erzwingen. Bei Fehlkonfiguration muss der Dienst vor dem ersten Request abbrechen. Die Rotation sollte anschließend über eine Key-ID geplant werden.

### 5. Migrationsjournal und Live-Schema sind nicht zuverlässig synchron

Das Live-Schema entspricht zwar Snapshot 0015, das Datenbankjournal enthält aber nur sieben statt der erwarteten 16 Migrationsnachweise. Zusätzlich weicht der gespeicherte Hash von Migration 0003 vom heutigen Dateihash ab. Ein globales `drizzle-kit migrate` könnte daher bereits vorhandene Strukturen erneut behandeln oder unvorhersehbar fehlschlagen.

> **Keine Migration ausführen.** Der Befund ist kein Auftrag für ein schnelles Journal-Editieren.

**Sichere Lösung:** Zuerst Export/Sicherung von `information_schema` und `__drizzle_migrations` erstellen. Anschließend die historische Migration 0003 aus Git oder Backup nachvollziehen und einen einmalig geprüften Baseline-/Journal-Abgleich auf einer Datenbankkopie vorbereiten. Erst nach erfolgreicher Restoreprobe dürfen spätere additive Migrationen geplant werden.

## Priorität 2 – Vor breiter öffentlicher Vermarktung beheben

### Funktionale und UX-Lücken

Ungültige `/world/:realm`- und `/flow/:flow`-Parameter werden still auf Botanik beziehungsweise Live umgebogen. Das ist fachlich falsch, weil eine nicht vorhandene Zielseite wie ein anderer echter Bereich aussieht. Die Route muss klar als nicht vorhanden oder ungültig enden.

Mehrere Karten verlinken auf `/profile#habitats`, aber der Zielbereich besitzt keinen passenden Hash-Anker und ist geschlossen. Anlagenverwaltung wird dadurch nicht zuverlässig erreicht. Außerdem sind einige Karten als **KÜNFTIG** markiert, bleiben aber anklickbare Buttons ohne Aktion. Das muss entweder semantisch deaktiviert werden oder einen erklärenden Statusdialog öffnen.

Beim Laden privater Anlagen wird ein technischer Fehler aktuell wie ein leerer Bestand dargestellt. Die Like-Aktion der Community zeigt bei Netzwerk- oder Berechtigungsfehlern keinen sichtbaren Status. Beide Fehlerzustände benötigen eindeutige UI-Rückmeldungen und Tests.

### Katalogqualität und Barrierefreiheit

Alle 105 aktiven KiemenKumpel-Produkte sowie alle 151 Galerieeinträge haben derzeit keinen Alternativtext. Die zugehörigen Bilder und Galerien sind vorhanden; es fehlt ausschließlich die beschreibende Metadatenpflege. Zusätzlich verweist das aktive Produkt mit der Grau-Variante wahrscheinlich auf die Schwarz-Variante. Bis der Händler die URL bestätigt hat, sollte dieses Produkt pausiert oder als komplette Einheit aus Titel, Variante, Bild und Zieladresse korrigiert werden.

Die Freigaberegeln für Partnerprodukte werden korrekt im Router durchgesetzt. Direkte Datenbankzugriffe könnten jedoch einen Produktstatus auf `active` setzen, ohne die fachliche Publikationsberechtigung nachzuweisen. Datenbankschreibzugriff muss deshalb auf den App-Service beschränkt bleiben; ein read-only Drift-Check für aktive, aber nicht publikationsfähige Produkte ist sinnvoll.

### SEO, PWA und Betrieb

`/robots.txt`, `/sitemap.xml` und `/manifest.webmanifest` liefern aktuell die SPA-HTML-Antwort statt der erwarteten Crawler- beziehungsweise Manifest-Datei. `/favicon.ico` leitet zwar auf ein Bild weiter, ist jedoch nicht als eigenständiges Projektartefakt versioniert. Canonical, Open Graph und Twitter zeigen unabhängig von der Route auf die Startseite. Login-, Fehler-, Filter- und private Seiten besitzen keine klare `noindex`-Strategie.

Der Code registriert `/healthz`, aber `https://blackwaterleaf.com/healthz` antwortet derzeit mit HTTP 404. Damit steht der erwartete öffentliche Monitoring-Endpunkt nicht zur Verfügung. Vor einem Betriebsmonitoring muss geklärt werden, ob die Produktionsumgebung Express-Routen tatsächlich vor dem statischen Fallback ausliefert oder ob ein anderer, von der Plattform unterstützter Health-Pfad verwendet werden muss.

Der Produktionsbuild war erfolgreich, meldet aber ein JavaScript-Bundle von rund **1,64 MB** vor Kompression und eine überschrittene 500-kB-Warnschwelle. Dies ist kein Release-Blocker, sollte aber vor wachsendem Marktplatz- und KI-Funktionsumfang durch Lazy Loading von seltenen Screens, Bildanalyse und Adminoberflächen reduziert werden. Die aktuellen pnpm-Warnungen weisen außerdem darauf hin, dass `pnpm.patchedDependencies` und `pnpm.overrides` im `package.json` nicht mehr ausgewertet werden. Diese Konfiguration gehört in die von pnpm unterstützte Workspace-Konfiguration, damit Builds reproduzierbar bleiben.

## Release-Status

Die Apex-Domain ist erreichbar; `www` leitet kanonisch weiter. Die sichtbaren Living-Overlay-, Marketplace-, Katalog- und V2-404-Oberflächen entsprechen funktional dem aktuellen WebDev-Stand. PR #6 enthält denselben Stand als Commit `6c5e492`, ist **offen**, gegen `main` sauber und nicht rückständig. Er ist jedoch nicht gemergt und enthält einen migrationshaltigen Großdiff.

Daher gilt: Der öffentliche WebDev-Stand ist nutzbar, aber der GitHub-Releasekanal ist noch nicht vollständig konsolidiert. PR #6 darf erst nach einer bewussten Diff-, Migrations- und Sicherheitsreview gemergt werden. Dieses Audit autorisiert keinen Merge, kein Deployment und keine Migration.

## Empfohlene Reihenfolge

1. **Sicherheitsfix-Paket:** Storage-Proxy, tRPC-Limits und JWT-Startvalidierung. Danach Sicherheits- und Autorisierungstests erweitern.
2. **Lokale Konten produktionsfähig machen:** Resend-Secrets und Versanddomain einrichten, E-Mail-Flows testen, erst danach OAuth-Ablösung entscheiden.
3. **Migrationsbaseline forensisch bereinigen:** Nur auf Kopie und mit Restoreprobe; bis dahin keine globale Datenbankmigration.
4. **Funktions- und Katalogpflege:** Ungültige Routen, Deep-Link, Karten-Disabled-State, Fehlerzustände, Alttexte und Grau-Variante korrigieren.
5. **SEO/PWA/Monitoring-Paket:** echte Crawler-Dateien, route-spezifische Metadaten, manifest/favicons und korrekt erreichbarer Health-Check.
6. **GitHub-Release:** PR #6 nach separat bestätigter Review mergen; den veröffentlichten Commit und den Produktionsbuild nachvollziehbar protokollieren.

## References

[1]: ./audit-work/functional.md "Funktions- und Routenzustandsprüfung"
[2]: ./audit-work/security.md "Sicherheitsprüfung Authentifizierung und Datenschutz"
[3]: ./audit-work/data.md "Datenbank- und Katalogparität"
[4]: ./audit-work/release.md "Release- und Betriebsprüfung"
[5]: ../server/_core/index.ts "Express-Health-Endpunkt und Middleware-Reihenfolge"
[6]: ../drizzle/meta/_journal.json "Drizzle-Migrationsjournal"
[7]: ../client/src/components/ReferenceOverlay.tsx "Referenzkarten und Nichtverfügbarkeitszustände"
[8]: ../server/_core/storageProxy.ts "Speicher-Proxy"
[9]: ../server/security.ts "Sicherheits- und Ratenlimitkonfiguration"
