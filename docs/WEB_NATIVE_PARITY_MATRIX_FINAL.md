# BlackWaterLeaf – Web-/Native-Paritätsmatrix

**Prüfstand:** 16. September 2026
**Webstatus:** geprüfter Staging-Release-Candidate
**Native-Referenz:** Stagingstand `1.0.4/build4`, ohne neuen APK-Build
**Gesamturteil:** Gestaltungs- und Vertragsgrundlage stehen; produktive Laufzeitparität ist noch nicht vollständig, weil der Native-Client noch nicht auf diese Staging-API und Datenbank umgestellt wurde.

> **Wichtig:** „Gleicher Datenstand“ ist erst nach einem erfolgreichen Native-API- und Synchronisationstest wahr. Gemeinsame Typen, gleichartige Oberflächen oder vorbereitete Endpunkte allein reichen dafür nicht.

## Paritätsstatus

| Bereich | Web-Staging | Native-Staging | Paritätsstatus | Noch erforderlich |
|---|---|---|---|---|
| Produktgrenze | Natur-App; Studio ausgeschlossen | Natur-App; Studio getrennt | Verifiziert | Keine V1-Lücke |
| Living-UI | Blattkern, vier Welten, Glas, Natur-/Neonfarben, Tageszeit, Systemfehler-Ebene | Blattkern, vier Welten, Glas, Natur-/Neonfarben, Tageszeit | Weitgehend gleichwertig | Retrofuturistische Web-Erweiterungen bei nächstem Native-UI-Release bewusst angleichen |
| Hauptnavigation | Home, Entdecken, Community, KI, Profil | Home, Entdecken, Community, KI, Profil | Verifiziert | Navigationstexte und Zustände bei Native-API-Anbindung erneut prüfen |
| Deutsch/Englisch | Gerätefallback, persistente Auswahl, vollständige Kerntexte | Gerätefallback, persistente Auswahl, Kerntexte | Verifiziert | Weitere Sprachen bleiben spätere Erweiterung |
| Einheiten | Metrisch/imperial lokal und im Profil serverseitig | Metrisch/imperial lokal | Teilweise | Native-Auswahl mit demselben Profilfeld synchronisieren |
| Authentifizierung | Reale OAuth-Sitzung, App-ID-Bindung, aktive Kontoprüfung | Reale Expo-/OAuth-Grundlage vorhanden | Teilweise | Native Bearer-Token gegen denselben Stagingserver end-to-end testen |
| Rollen | Ausschließlich MySQL: `user`, `moderator`, `admin`; kein E-Mail-Autoadmin | Serverrollenvertrag vorbereitet, kein gemeinsamer Laufzeitnachweis | Teilweise | Native muss Rolle und Status ausschließlich aus `profile.me` lesen |
| Profil | Name, Benutzername, Bio, Ort, Avatar, fünf Social-Links, Locale, Einheiten, Sichtbarkeit, Einwilligungen | Profiloberfläche vorhanden, aber nicht mit dieser MySQL-Datenbasis verifiziert | Teilweise | Native-Profiladapter auf gemeinsame API umstellen |
| Botanik | Reale private/öffentliche Beobachtungen, Messwerte, Medien, Evidenz, Revision | Private lokale Offlinebeobachtungen | Teilweise | Idempotenten Native-Sync aktivieren und Konfliktfälle testen |
| Aquaristik | Gleicher Beobachtungskern; Nullwerte bleiben erhalten | Private lokale Offlinebeobachtungen mit Nullwerttreue | Teilweise | Gleiche API-/Syncaufgabe wie Botanik |
| Terraristik | Vollwertige gemeinsame Naturwelt mit Beobachtungserfassung | Private lokale Offlinebeobachtungen | Teilweise | Gleiche API-/Syncaufgabe wie Botanik |
| Medien | Signatur- und größengeprüfte JPEG/PNG/WebP-Dateien in S3, Eigentum und Sichtbarkeit in MySQL | Lokale Medienreferenzen | Teilweise | Native-Upload über dieselben geschützten Verfahren anbinden |
| Wissen | Nur veröffentlichte, quellenbelegte Einträge | Lokale Fachknowledgebase vorhanden | Teilweise | Kanonische serverseitige Wissensquelle und Localeabgleich festlegen |
| Community | Reale Entwürfe, Einwilligung, Veröffentlichung, öffentliche Posts und Likes | Communityoberfläche vorhanden, gemeinsame Datenquelle nicht verifiziert | Teilweise | Native-Feed, Entwurf, Upload und Veröffentlichung an gemeinsame API anbinden |
| Offline/Sync | Explizite Offline-, API-, DB-, Auth-, Lade-, Leer- und Fehlerzustände | Private lokale Queue und Syncstatus vorhanden | Vertraglich vorbereitet | Native Sync-Worker mit Client-ID, Revision und Konfliktanzeige gegen Staging testen |
| KI-Assistent | Policy-gesperrt; kein Modellaufruf und keine simulierte Antwort | Keine neue freigegebene gemeinsame Anbieteranbindung | Verifiziert gesperrt | Anbieter, Kosten, Datenschutz und Quellenregeln separat freigeben |
| Sicherheit | Eigentum, Sichtbarkeit, Einwilligung, App-ID, CSRF/Origin, Header, Rate Limits, Uploadvalidierung | Teilweise vorhandene Auth-/Offlinegrundlage | Teilweise | Native-End-to-End-Sicherheits- und API-Negativtests ergänzen |
| Gemeinsamer Live-Datenstand | MySQL-Stagingdatenbank und S3-Medienpfad aktiv | Noch nicht an diese Laufzeit angebunden | **Nicht erreicht** | Deployment-URL, Native-API-Konfiguration und kontrollierter Sync erforderlich |

## Verifizierter Webumfang

Die Web-App nutzt einen gemeinsamen Vertrag `1.0.0`, eine additive MySQL-Struktur, reale serverseitige Authentifizierung, granulare Sichtbarkeit, versionierte Einwilligungen und private Voreinstellungen. Profil-, Beobachtungs-, Wissens- und Communityoberflächen lesen und schreiben ausschließlich über tRPC. Ohne Daten erscheinen echte Leerzustände; ohne Freigabe bleibt KI gesperrt. Acht Testdateien mit 37 Tests, TypeScript, Produktionsbuild und Produktionsabhängigkeitsaudit sind bestanden.

## Noch nicht als 100 Prozent bezeichnen

Die Native-App verwendet derzeit weiterhin ihre lokale Offlinebeobachtungsgrundlage. Daher sind Profil, Rollen, Medien, Wissen, Community und Beobachtungen noch nicht end-to-end mit derselben MySQL-Datenbank verifiziert. Auch eine neue Native-APK wurde entsprechend der Nutzeranweisung nicht gebaut. Eine Aussage „Web und Native sind 100 Prozent gleich“ wäre aktuell sachlich falsch.

## Verbindliche Restsequenz für echte Laufzeitparität

1. Der V1-Vertrag wird unverändert in den Native-Stagingbranch übernommen oder als gemeinsam versioniertes Paket referenziert.
2. Der Native-API-Client erhält ausschließlich die veröffentlichte Staging-Basis-URL über sichere Buildkonfiguration; keine Datenbank-URL gelangt in App, APK oder Repository.
3. Native Authentifizierung wird mit Bearer-Token gegen dieselbe App-ID und dieselben aktiven Kontoregeln getestet.
4. Profil, Einwilligungen, Beobachtungen, Medien, Wissen und Community werden schrittweise auf die gemeinsame API umgestellt.
5. Die lokale Beobachtungsqueue synchronisiert nur nach ausdrücklicher Nutzeraktion mit Client-ID, erwarteter Revision und sichtbarer Konfliktbehandlung; keine automatische Veröffentlichung.
6. Web- und Native-Tests lesen anschließend dasselbe reale Testkonto und dieselben explizit angelegten Testdatensätze in einer isolierten Abnahmeumgebung.
7. Erst nach erfolgreicher S23-Ultra-Abnahme darf ein neuer Native-Build freigegeben werden. Erst nach separater Web-Abnahme darf die Domain umgeschaltet werden.
