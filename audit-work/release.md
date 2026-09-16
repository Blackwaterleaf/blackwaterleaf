# BlackWaterLeaf – Release- und Betriebsprüfung

**Prüfzeitpunkt:** 16. September 2026 · **Scope:** WebDev-Checkpoint `fba41db0`, `https://blackwaterleaf.com`, GitHub `Blackwaterleaf/blackwaterleaf` (PR #5–#7) und lokale Kopie `/home/ubuntu/blackwaterleaf-webapp-push`. Es wurden **keine** Änderungen, Merges, Pushes, Deployments oder Domainänderungen durchgeführt.

## Kurzfazit

Die öffentliche Apex-Domain ist aktuell erreichbar, TLS- und `www`-Weiterleitung sind funktionsfähig, und der sichtbare Laufzeitstand entspricht funktional dem WebDev-Checkpoint `fba41db0` bzw. dem PR-#6-Stand `6c5e492`: Living-Overlay, Marketplace mit realen Partnerprodukten sowie die V2-404-Fläche sind öffentlich sichtbar. Der Nachweis ist stark, aber nicht kryptographisch auf einen Deployment-Commit zurückführbar: Checkpoint und lokale PR-#6-Kopie teilen 280 getrackte Dateien, davon 260 identische Blob-IDs; die 20 Abweichungen sind ausschließlich Release-/Auditdokumente.

PR #6 ist **offen, nicht gemergt**, gegen `main` sauber und ohne Rückstand (`main...HEAD = 0/2`, `mergeable=true`, `mergeable_state=clean`, `git diff --check` sauber). Der Branch ist jedoch ein sehr großer, migrationshaltiger Rebase von `main` (267 geänderte Dateien, laut GitHub +40.011/−32.273 Zeilen) und braucht daher vor einem Merge eine fachliche Datenbank-/Migrationsabnahme. PR #5 und #7 sind nicht Bestandteil des laufenden Releases.

## Befunde

| Schweregrad | Befund | Konkrete Evidenz | Sichere Lösungsempfehlung |
|---|---|---|---|
| **Hoch** | **PR #6 ist nicht in `main`; der GitHub-Releasekanal ist daher nicht gleich dem Live-Stand.** | PR #6: `OPEN`, Head `6c5e492e2c343ab1b7a5277dcbe2e9275ade4f0d`, Base `bbe27ba…` (`main`), kein Merge-Commit. Die lokale Kopie steht auf demselben Head. Die Live-Domain zeigt zwar die PR-#6-/Checkpoint-Funktionen, aber die Zuordnung ist nur über Parität, nicht über ein öffentliches Build-Commit belegbar. | Vor einem GitHub-basierten Folgerelease einen geschützten Review durchführen: PR-#6-Diff, Migrationspfad und CI erneut abnehmen; erst nach expliziter Freigabe mergen. Danach Deployment-Provenance (Commit-SHA/Build-ID) im Release-Log festhalten. **Kein** automatischer Merge/Deploy. |
| **Hoch** | **Technisches SEO-Crawling ist unvollständig: `robots.txt` und `sitemap.xml` fallen auf die SPA-HTML-Antwort zurück.** | Live-`fetch('/robots.txt')` und `fetch('/sitemap.xml')`: jeweils HTTP 200, aber `Content-Type: text/html` und Inhalt beginnt mit `<!doctype html>`. Im Checkpoint und in der lokalen PR-#6-Kopie existieren keine solchen Dateien unter `client/public`; in PR #6 wurden die früheren `client/public/robots.txt` und `client/public/sitemap.xml` sogar gelöscht. | In einem separat freigegebenen, kleinen SEO-PR echte statische `robots.txt` und XML-Sitemap hinzufügen; nach einem **explizit freigegebenen** Deployment mit HTTP-Headern und Search-Console-Submission prüfen. Keine Änderung im Rahmen dieses Audits. |
| **Mittel** | **Keine route-spezifischen Meta-Tags: Canonical/OG/Twitter zeigen unabhängig vom Pfad auf die Startseite.** | Live im Head: Canonical `https://blackwaterleaf.com/`, `og:url` ebenfalls Root; beim clientseitigen `/does-not-exist` bleibt der Titel `BlackWaterLeaf – Botanik, Aquaristik & Terraristik`. Die ausgelieferte globale Beschreibung/Keywords sind vorhanden, aber nicht routenspezifisch. | Vor indexierbaren Wissens-, Marketplace- und Produktseiten einen freigegebenen SEO-Plan umsetzen: pro öffentlicher Route eindeutigen Titel, Description, Canonical und OG/Twitter-Daten setzen; private, Login-, Fehler- und ggf. Filterseiten gezielt `noindex` setzen. Danach Crawler-Response je Route kontrollieren. |
| **Mittel** | **Öffentliche PWA-/Branding-Artefakte sind inkonsistent bzw. fehlen.** | `/favicon.ico` ist nicht abrufbar; `/manifest.webmanifest` fällt ebenfalls auf HTML zurück. Nur ` /__manus/pwa/manifest.webmanifest` ist ein Manifest und benennt die App **„BlackWaterLeaf Parity Staging“**. | In einem ausdrücklich freigegebenen Release-Paket ein produktives Favicon und ein produktiv benanntes Manifest bereitstellen; Installierbarkeit und App-Name auf Android/iOS/Desktop nach Deployment verifizieren. |
| **Mittel** | **Migrationsrisiko in PR #6 bleibt freigabepflichtig.** | PR #6 enthält 16 nummerierte Drizzle-Migrationen und Metadatenänderungen; der letzte Commit ergänzt `0014`/`0015`. Der Checkpoint-Todo nennt die historische Drizzle-Baseline ausdrücklich als vor globalem `drizzle-kit migrate` zu bereinigenden Punkt. | Vor jedem produktiven Migrationslauf eine isolierte Datenbankkopie/Restoreprobe und einen schriftlich bestätigten Vorwärts-/Rollbackpfad abnehmen. Keinen globalen Migrationsbefehl auf Basis dieses Audits ausführen. |
| **Niedrig** | **Lokale Arbeitskopie ist nicht vollständig sauber.** | `/home/ubuntu/blackwaterleaf-webapp-push` steht auf `feature/reference-overlay-marketplace-20260916` / `6c5e492`, enthält jedoch die ungetrackte Datei `session-todo-MBN8jUc72jQftDfuVC4Hpc.md`. Der getrackte Branch-Diff ist sauber. | Die Notiz vor späterem Commit/Merge entweder bewusst dokumentieren oder entfernen; sicherstellen, dass sie nicht versehentlich in einen Release-Commit gelangt. |
| **Info** | **PR #5 und PR #7 gehören nicht zum laufenden Produktionsstand.** | PR #5 ist `DRAFT`, offen, 54 Dateien / 11 Commits und laut PR-Beschreibung ein visueller Overlay-/Expo-Entwurf. PR #7 ist ebenfalls `DRAFT`, offen, ein Commit / vier Dateien (Hand-off und Three.js-Abhängigkeiten), ohne Habitat-Builder-Implementierung; die Beschreibung weist außerdem auf blockierte Typprüfung in der Ausgangsbasis hin. Beide sind zwar GitHub-seitig mergeable/clean, aber nicht gemergt. | PR #5 nur als visuelle Referenz behandeln. PR #7 getrennt planen, Assets lizenzieren, Umsetzung und unabhängige CI-Abnahme vorsehen; nicht in den aktuellen Web-Release hineinziehen. |

## Was öffentlich live ist

Die Browserprüfung zeigt eine gerenderte BlackWaterLeaf-App mit Home/Living-Overlay, ehrlichen Auth-/Sensor-Zuständen, Marketplace-/Partnerdarstellung und Marketplace-Produkten. HTTP liefert für `/`, `/explore`, `/community`, `/assistant`, `/profile`, `/knowledge`, `/marketplace`, `/marketplace/product/1`, `/flow/live`, `/world/botany` und einen unbekannten Pfad HTML 200; die unbekannte Route rendert clientseitig die V2-Fläche `ROUTE / 404`. `www.blackwaterleaf.com` leitet kanonisch auf den Apex um. Im ausgelieferten Head sind Description, Keywords, Canonical sowie Open-Graph-/Twitter-Karten vorhanden; dies beseitigt die oben genannten SEO-Lücken jedoch nicht.

## Was nur in PR #6 bzw. nicht in `main` liegt

PR #6 umfasst den vollständigen Wechsel vom alten `main` auf die aktuelle Parity-/Marketplace-Anwendung: neue Router-/Seitenarchitektur, lokale Auth-Flächen, private Habitat-/Sensor-/Wetter-/Partnerlogik, Marketplace und Produktdetail, Sicherheits-/Audit- und Testflächen sowie ein umfangreich umgestelltes Drizzle-Historienpaket. Der letzte PR-Commit `6c5e492` ergänzt die V2-Parität speziell für 404, abgemeldetes Profil, Accountzugang und Marketplace sowie den Kiemen-Kumpel-Katalog. Diese Änderungen sind **noch nicht in GitHub-`main`**, auch wenn der aktuelle WebDev-Checkpoint die funktionalen Dateien nahezu vollständig enthält.

## Fehlende ausdrücklich freizugebende nächste Schritte

1. **PR #6 nur nach Review freigeben:** fachliche Review des großen Diffs, insbesondere Schema/Migrationen, anschließend erst bewusster Merge und bewusste Deploymententscheidung.
2. **E-Mail-/Lokalkonto-Produktivierung:** Resend-Senderdomain verifizieren, geschütztes `RESEND_API_KEY` hinterlegen, echte Confirm-/Reset-Mails testen; erst nach angenommener Migration den alten Manus-OAuth entfernen.
3. **Migrationsbaseline bereinigen:** historische Drizzle-Baseline vor jedem globalen Migrationlauf nachvollziehbar reconciliieren und Restore testen.
4. **Native-App separat freigeben:** gegen dieselbe veröffentlichte API anbinden und auf S23 Ultra prüfen; dies wird durch den Web-Stand nicht abgedeckt.
5. **KI separat freigeben:** Anbieter, Kosten, Datenschutz und Quellenregeln explizit bestätigen; bis dahin bleibt die KI entsprechend gesperrt/staged.
6. **SEO/PWA separat freigeben:** statische Crawler-Dateien, route-spezifische Metadaten, Favicon/Produktmanifest implementieren und nach einem genehmigten Deployment extern validieren.

## Prüfbelege

- Checkpoint: `/home/ubuntu/blackwaterleaf-parity-staging`, `fba41db0ca71600b4570e826afc1a2da5e9ef457`.
- Lokale PR-#6-Kopie: `/home/ubuntu/blackwaterleaf-webapp-push`, `6c5e492e2c343ab1b7a5277dcbe2e9275ade4f0d`.
- GitHub-PR-Metadaten: PR #5 `DRAFT`, PR #6 `OPEN`/clean/mergeable, PR #7 `DRAFT`.
- Paritätsvergleich: 280 gemeinsame getrackte Dateien, 260 identische Blobs; 20 Abweichungen ausschließlich Dokumentation, kein app-/serverseitiger Code.
- Live-Prüfung: Browser-/Fetch-Diagnose vom 16.09.2026, einschließlich Head, Routen, 404 und Crawler-Endpunkten.

> Der Bericht beschreibt nur Befunde und sichere Folgeschritte. Er stellt **keine** Freigabe zum Merge, Deployment, Datenbanklauf oder zur Domainänderung dar.
