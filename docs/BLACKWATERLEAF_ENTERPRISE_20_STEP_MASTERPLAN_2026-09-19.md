# BlackWaterLeaf Enterprise-Masterplan – 20 sequenzielle Arbeitspakete

**Datum:** 19. September 2026  
**Autor:** Manus AI  
**Geltungsbereich:** BlackWaterLeaf Web, Native (Expo), Server, Datenbank, Objekt-Speicher, Betriebs- und Releaseprozesse  
**Verbindliche Designquelle:** Observatory Screen Design Book, Version 1.0 vom 19. September 2026 [1]

## Überblick und verbindliche Leitplanken

Dieser Arbeitsauftrag konsolidiert die vorliegenden unabhängigen Auditbefunde in eine **verbindliche Reihenfolge von 20 Arbeitspaketen**. Die Reihenfolge ist sicherheits- und regelwerksgetrieben: Ein Arbeitspaket darf erst beginnen, wenn seine genannten Abhängigkeiten abgenommen sind. Ein Paket mit Priorität **P0** blockiert die betroffene Produktionsfreigabe, bis sein Abnahmekriterium erfüllt und nachweisbar dokumentiert ist.

**Web-/Native-Parität ist eine verbindliche Produktanforderung, keine nachgelagerte Qualitätsprüfung.** Für alle in diesem Auftrag markierten Paritätspakete müssen Web und Native dieselben Begriffe, Icons, Bilder, Design-Tokens, Kartenhierarchien, Datenverträge, Berechtigungsentscheidungen sowie Lade-, Fehler-, Leer-, Offline-, Schutz- und Anmeldungszustände liefern. Desktop darf ausschließlich die räumliche Anordnung durch die linke Navigation ändern; Mobile nutzt die feste untere Navigation. Als alleinige visuelle Grundlage gilt das aktuelle Observatory-Designbuch. Frühere Designbücher, Reference-Overlays, Hero-Varianten, Kartenraster, Header-/Footer-Muster oder Mischlayouts dürfen weder als Referenz noch als Fallback verwendet werden [1].

> **Migrations- und Produktionsschutz:** Jede Schemaänderung erfolgt erst nach einem lesenden Baseline-Abgleich, einer verschlüsselten Sicherung und einer auf einer isolierten, TiDB-kompatiblen Zielumgebung erfolgreich protokollierten Wiederherstellung. Migrationen sind ausschließlich **additiv** und vorwärtskompatibel. Jede Freigabe dokumentiert Backup-ID, Migrations-ID, Commit-SHA, Artefakt-ID, Prüfergebnis und Rückfallentscheidung. Ein Anwendungsrollback darf niemals durch ein destruktives Schema-Downgrade ersetzt werden: Neue Felder bleiben zunächst kompatibel, Schreibpfade werden zurückgeschaltet, und erst nach einer separat genehmigten Aufbewahrungsfrist darf bereinigender Abbau erfolgen.

Die in den Audits nachgewiesenen bestehenden Stärken – serverseitige Rollenprüfungen, Consent-Grundlagen, Upload-Signaturprüfung, semantische Web-Landmarks, sichere Native-Tokenablage und bestandene fokussierte Tests – bleiben zu erhalten. Sie sind jedoch **kein Ersatz** für die nachstehenden Produktions- und Freigabegates. Die Anforderungen an Objekt-Autorisierung, Least Privilege, Upload-Härtung und nachvollziehbare Moderation richten sich zusätzlich an anerkannten Sicherheitsleitlinien aus [2] [3] [4].

## Sofort zu blockierende Risiken

Bis zur nachweisbaren Abnahme der jeweils zugehörigen Arbeitspakete sind die folgenden Risiken unverzüglich zu blockieren. Die Blockade betrifft insbesondere neue Freigaben, die den jeweiligen Risikopfad erweitern oder öffentlich sichtbar machen.

- **Öffentliche oder private Medienfreigaben sowie bestehende generische Storage-Signierung** sind zu stoppen, solange der Abruf nicht pro Medienobjekt autorisiert wird und Originalbilder nicht serverseitig von EXIF-, XMP- und IPTC-Metadaten einschließlich GPS bereinigt werden (AP-03 und AP-04).
- **Kontoschließung mit der Bezeichnung „Löschen“** ist zu sperren, solange keine echte, nachweisbare Lösch- beziehungsweise gesetzlich begründete Anonymisierungsroutine für Datenbank, Credentials und Objekt-Speicher besteht (AP-05).
- **Produktive globale Drizzle-Läufe und `db:push`** sind bis zur dokumentierten Backup-/Restoreprobe, Baseline-Adoption und Freigabekontrolle untersagt (AP-06).
- **Öffentliche Community-Veröffentlichung, Kommentare und Medienweitergabe** sind zu blockieren, sofern Melden, Fallbearbeitung, Hochrisiko-Triage, Einspruch, Sperrdurchsetzung und atomarer Medienentzug nicht wirksam sind (AP-07 und AP-08). Community-Live bleibt bis zum vollständigen Safety-by-Design-Nachweis deaktiviert.
- **Neue EU-Verbraucherangebote sowie die Aktivierung von Technik-, Filter-, Thermometer- und Zubehörprodukten** sind zu blockieren, solange GPSR-Produktinformationen, Händlertransparenz, Rückrufsteuerung und ein prüfbarer Freigabe-Gate fehlen (AP-09) [5].
- **Native-Marktplatz-Attribution** darf nicht für Händlerabrechnung, Vergütung oder Performanceaussagen verwendet werden, solange event-ID, serverseitiger Handoff und Manipulationsschutz nicht abgenommen sind (AP-16).
- **Produktionsfreigaben**, die neue oder veränderte Datenflüsse enthalten, sind zu blockieren, solange kein gemeinsamer Web-/Native-Vertrag, keine negative Autorisierungsabdeckung und kein versionierter Release-Nachweis vorliegen (AP-11 und AP-20).

## Priorisierung und Phasen

| Phase | Sequenz | Inhalt und Freigabegate | Höchste Priorität |
|---|---:|---|---|
| I – Schutz, Regelwerk und Datenbetrieb | AP-01 bis AP-10 | Gefährliche Freigaben stoppen, Medien und personenbezogene Daten schützen, Community- und Marktplatzpflichten absichern, Migrationen wiederherstellbar machen. | P0 |
| II – Gemeinsame Plattform- und Paritätsgrundlage | AP-11 bis AP-15 | Gemeinsame Verträge, Sitzungs- und Standortschutz, verbindliche Observatory-Navigation, echte Beobachtungsdaten und mobile Zuverlässigkeit herstellen. | P1 |
| III – Fachliche End-to-End-Parität | AP-16 bis AP-18 | Marktplatz, Community, KI-Bestimmung, Kataloge und Quellen auf identische Web-/Native-Workflows und belastbare Datenlogik bringen. | P1 |
| IV – Qualität, Betriebsreife und Freigabe | AP-19 bis AP-20 | Accessibility, aktuelle Observatory-Tokens, Performance, Telemetrie, Tests, CI/CD und kontrollierte Promotion als Release-Gates etablieren. | P1 |

| Priorität | Bedeutung | Freigabeentscheidung |
|---|---|---|
| P0 | Kritisches Sicherheits-, Datenschutz-, Kinderschutz-, Regelwerks- oder Datenverlust-Risiko. | Betroffener Produktionspfad bleibt gesperrt. |
| P1 | Wesentliche Funktions-, Paritäts-, Vertrauens- oder Betriebsreife-Lücke. | Keine Erweiterungsfreigabe des betroffenen Bereichs; Abschluss vor dem nächsten vollständigen Produktrelease. |
| P2 | Relevante Qualitäts-, Mess-, Performance- oder Wartbarkeitslücke. | In den verbindlichen Releasezug einplanen; Abschluss vor General Availability oder gemäß AP-20-Ausnahmeentscheidung. |

## Phase I – Schutz, Regelwerk und Datenbetrieb

### AP-01 – Freigabestopp, Risikoregister und verantwortliche Entscheidungsstruktur

**Ziel:** Alle P0-Risiken werden vor weiterer Ausweitung der betroffenen Produktpfade wirksam kontrolliert. Entscheidungen, Ausnahmen und Restrisiken sind einer klar benannten verantwortlichen Stelle zugeordnet.

**Konkreter Umfang:** Ein verbindliches Release-Freeze für die oben genannten blockierten Pfade einrichten. Ein Risikoregister mit Befund-ID, System, Datenkategorie, Rechtsraum, Risiko-Owner, technischer Owner, Frist, Nachweis und Freigabestatus anlegen. Für Sicherheits-, Datenschutz-, Trust-&-Safety-, Marketplace-Compliance- und Datenbetriebsentscheidungen getrennte fachliche Approver benennen. Alle bereits ausgegebenen öffentlichen Medienlinks, aktive Produktplatzierungen und vorhandene Community-Live-Kommunikation inventarisieren. Für akute Gefährdungen eine dokumentierte Incident-Eskalation mit erreichbaren Rollen, Entscheidungszeitfenstern und Kommunikationsweg hinterlegen.

**Abhängigkeiten:** Keine.

**Abnahmekriterium:** Der Release-Freeze ist technisch oder prozessual wirksam, das Register enthält jeden P0-Befund aus den Audits, und jeder Eintrag hat Owner, Zieltermin und Genehmigungsweg. Eine verantwortliche Stelle bestätigt schriftlich, dass Community-Live deaktiviert bleibt und dass keine ungesicherten EU-Produktfreischaltungen erfolgen.

**Priorität:** P0.

### AP-02 – Dateninventar, Zweckbindung und Schutzklassen verbindlich machen

**Ziel:** BlackWaterLeaf kennt für jede personenbezogene, sensible oder sicherheitsrelevante Datenklasse Herkunft, Zweck, Zugriff, Aufbewahrung, Löschweg und Rechtsgrundlage.

**Konkreter Umfang:** Ein versioniertes Dateninventar für Konten, lokale Credentials, Sitzungen, Consent, exakte und grobe Orte, private Habitate, Smart-Device-Messungen, Beobachtungen, Medien, Community-Inhalte, Moderationsfälle, Händlerdaten, Nutzungsledger, Auditdaten und Objekt-Speicher-Keys erstellen. Datenklassen mindestens in öffentlich, geschützt, privat, besonders schutzbedürftig und Beweisaufbewahrung einteilen. Für jede Klasse zulässige Rollen, API-DTOs, Storage-Bucket/Policy, Retention, Lösch- oder Anonymisierungspfad sowie zulässige Telemetrie festlegen. Die Datenlandkarte muss die Drittübermittlung an Open-Meteo, Pl@ntNet und spätere Push-Anbieter ausdrücklich ausweisen.

**Abhängigkeiten:** AP-01.

**Abnahmekriterium:** Datenschutz, Security und Technik genehmigen ein gemeinsames Dateninventar. Für jedes inventarisierte Objekt existiert eine eindeutige Datenverantwortung und ein dokumentierter Pfad für Zugriff, Widerruf, Löschung oder rechtlich begründete minimale Aufbewahrung.

**Priorität:** P0.

### AP-03 – Medienzugriff pro Objekt autorisieren und alte Abrufwege widerrufen

**Ziel:** Ein Objekt-Key oder eine historische URL ist niemals eine Berechtigung für private, gelöschte, gesperrte oder quarantänisierte Medien.

**Konkreter Umfang:** Den generischen, anonymen Storage-Proxy durch einen Medien-Endpunkt über eine Medien-ID ersetzen oder ihn vollständig entfernen. Vor jeder Signierung müssen Assetstatus, Sichtbarkeit, Besitzerbeziehung, Post-/Beobachtungsstatus, Autorenstatus und gegebenenfalls Blockbeziehung serverseitig geprüft werden. Öffentliche und private Speicherung logisch und durch Bucket- beziehungsweise Policy-Trennung separieren. Bei Löschung, Sperre, Suspendierung oder Quarantäne müssen neue Abrufberechtigungen sofort ausbleiben; zuvor ausgegebene Berechtigungen, Caches und CDN-Objekte sind nach dem definierten technischen Verfahren zu entziehen. Die Umsetzung erfolgt für Web und Native über denselben Serververtrag.

**Abhängigkeiten:** AP-01, AP-02.

**Abnahmekriterium:** Negative Integrationstests beweisen, dass anonyme Nutzer, fremde Konten, frühere Eigentümer und bekannte Altlinks keine privaten, gelöschten oder gesperrten Medien abrufen können. Der Test umfasst Avatar, Habitat, Beobachtung, Community und Händlerbild. Security bestätigt eine dokumentierte Widerrufsstrategie für Signaturen, Cache und Objektstatus.

**Priorität:** P0.

### AP-04 – Bildderivate ohne Standort- und Geräte-Metadaten erzwingen

**Ziel:** Öffentliche oder berechtigtengeteilte Bilder offenbaren keine EXIF-, XMP- oder IPTC-Metadaten, insbesondere keine GPS-Koordinaten, Aufnahmezeit oder Geräteinformationen.

**Konkreter Umfang:** Jeden Upload serverseitig dekodieren, Metadaten vollständig entfernen und ein neu kodiertes Derivat als allein auslieferbares Bild erzeugen. Originale dürfen nur bei nachgewiesenem fachlichem Bedarf getrennt, privat, kurzlebig und mit eigener Berechtigung gehalten werden. Eine Fundortprüfung muss Beobachtungen mit exakten Ortsangaben zusätzlich gegen die Sichtbarkeits- und Unschärferegeln prüfen. Alle Uploadpfade – Profil, Habitat, Beobachtung, Community, Marktplatz und KI – erhalten denselben Derivatvertrag; Native normalisiert Bilder zusätzlich vor dem Upload hinsichtlich Format und Größe.

**Abhängigkeiten:** AP-02, AP-03.

**Abnahmekriterium:** Automatisierte Negativtests laden Testbilder mit GPS-, Zeit- und Geräte-EXIF hoch und belegen, dass weder das ausgelieferte Derivat noch die öffentliche API Metadaten oder präzise Ortsdaten enthält. Ein manueller Nachweis prüft mindestens Web und Native mit denselben Testbildern. Die Kontrollmaßnahmen folgen dem Grundsatz der sicheren Dateiverarbeitung [4].

**Priorität:** P0.

### AP-05 – Kontoschluss, Löschung und Aufbewahrung rechtssicher ausführen

**Ziel:** Die sichtbare Kontofunktion entspricht der tatsächlichen Datenverarbeitung: Entweder erfolgt nachweisbare Löschung oder die Oberfläche bezeichnet den Vorgang eindeutig als Deaktivierung und bietet eine separate Löschanfrage.

**Konkreter Umfang:** Einen DSAR- und Account-Erasure-Workflow mit Dateninventar aus AP-02 implementieren. Er muss Datenbankdaten, Session-/Refresh-Token, Credentials, Medienmetadaten, Storage-Objekte, private Habitate, Messungen, Beobachtungen, Beiträge und Benachrichtigungen behandeln. Zulässige Aufbewahrung für Audit- und Rechtsverteidigungsdaten ist minimal, pseudonymisiert, begründet, befristet und zugriffsbeschränkt. Löschaufträge erhalten eine idempotente, wiederholbare Warteschlange mit Frist, Retry, Fehlereskalation, Löschbeleg und Widerruf aller Sessions. Datenschutztexte, UI-Bezeichnungen und Supportablauf sind daran auszurichten.

**Abhängigkeiten:** AP-02 bis AP-04.

**Abnahmekriterium:** Ein kontrollierter Erasure-Test mit Testkonto erzeugt einen vollständigen Nachweis für DB-Entfernung oder definierte Anonymisierung, Storage-Löschung, Session-Widerruf und gesetzlich zulässige Restdaten. Ein fehlgeschlagener Storage-Delete wird wiederholt und eskaliert. Die Ergebnisdokumentation erfüllt die Erwartungen an transparente Löschprozesse [6].

**Priorität:** P0.

### AP-06 – Migrationsbaseline, verschlüsselte Sicherung und getestete Wiederherstellung herstellen

**Ziel:** Datenbankänderungen sind reproduzierbar, verlustarm und rückfallfähig; der dokumentierte Journaldrift kann keine unkontrollierte DDL oder Datengefährdung mehr auslösen.

**Konkreter Umfang:** Produktive globale Drizzle-Läufe sperren. Zuerst einen schreibgeschützten Snapshot von Schema, Indizes, Fremdschlüsseln, Constraints, `__drizzle_migrations` und relevanten Hashes erstellen. Danach eine verschlüsselte, providerkompatible Sicherung der Datenbank einschließlich der Objekt-Speicher-Referenzen erzeugen und auf einer isolierten TiDB-kompatiblen Umgebung wiederherstellen. Dort die adoptierte Baseline, den Upgradepfad und einen automatisierten Schema-Diff nachweisen. Künftig nur reviewte additive Migrationen mit Vorwärtsplan, Kompatibilitätsfenster, Backfill-Plan, Backup-ID, Freigabe und kompensierender Betriebsanweisung zulassen. Eine Rückabwicklung schaltet Anwendungspfad und Feature Flag zurück; Daten werden nicht destruktiv per Down-Migration entfernt.

**Abhängigkeiten:** AP-01, AP-02.

**Abnahmekriterium:** Ein signierter Restore-Nachweis belegt Wiederherstellung, Integritätsprüfungen und kontrollierten Upgrade aus der neuen Baseline. Die CI- und Release-Dokumentation verweigert produktive Migrationen ohne Backup-ID, erfolgreiche Restoreprobe, genehmigte additive Migration und Rückfallplan. Der historische Drift ist entweder reconciliert oder durch die dokumentierte Baseline ersetzt.

**Priorität:** P0.

### AP-07 – Melden, Moderationsfälle, Hochrisiko-Triage und Einspruch etablieren

**Ziel:** Schädliche, rechtswidrige oder ausbeuterische Inhalte können kontextnah gemeldet, sicher priorisiert, nachvollziehbar entschieden und unabhängig überprüft werden.

**Konkreter Umfang:** Eine serverseitige Moderationsdomäne für Meldungen und Fälle aufbauen. Sie umfasst feste und freie Meldegründe, Dringlichkeit, Reporter, Objektbezug, datensparsamen Snapshot oder Hash, Bearbeiter, SLA, Entscheidung, Benachrichtigung, Einspruch und Zweitprüfung. Web und Native erhalten bei Beitrag, Kommentar, Konto und Medium identische kontextnahe Meldeaktionen sowie Statusanzeigen. Die Safety-Kette kombiniert mehrsprachige Text- und Kontextklassifizierung, rechtlich zulässige Hash-Abgleiche für bekanntes CSAM, Bild-/Video-Risikoklassifizierung und eine abgesicherte menschliche Hochrisiko-Review-Queue. Hochrisikoinhalte dürfen bis zur Entscheidung nicht weiterverbreitet werden; Meldende müssen kein schädliches Material erneut senden. Jeder Eingriff erhält Grundcode, Fall-ID, Zeit, Entscheider und datensparsame Erklärung. Die Eskalationskette ist rechtsraumabhängig mit Legal und qualifiziertem Trust & Safety abzustimmen [7] [8].

**Abhängigkeiten:** AP-01, AP-02, AP-06.

**Abnahmekriterium:** Ein Ende-zu-Ende-Test deckt Meldung, Deduplizierung, Missbrauchsschutz, Hochrisiko-Quarantäne, Entscheidung, Betroffenenbenachrichtigung, Einspruch und Zweitprüfung ab. Rollenprüfungen belegen Least Privilege. Legal bestätigt die anwendbare Notice-and-Action- und Beschwerdelogik einschließlich klarer Begründungen [7].

**Priorität:** P0.

### AP-08 – Community-Sperren, Sichtbarkeit und Medienentzug zentral durchsetzen

**Ziel:** Suspendierte, gesperrte, entfernte oder blockierte Inhalte und Accounts können über keinen alternativen Endpunkt sichtbar, kontaktierbar oder medial abrufbar bleiben.

**Konkreter Umfang:** Eine zentrale Community-Policy für Autorenstatus, Poststatus, Kommentarstatus, Medienstatus, Sichtbarkeit, Blockbeziehung und Fallstatus erstellen. Diese Policy muss jede Community-Abfrage und Mutation steuern: Feed, Suche, öffentliche Profile, Direktaufruf, Kommentare, Likes, Benachrichtigungen und Assetzugriff. Bei Suspendierung oder Verbannung werden Beiträge und Medien atomar aus dem öffentlichen Zugriff genommen oder quarantänisiert. Owner erhalten einen klaren Kommentar-Lifecycle für Bearbeiten und Soft Delete; Staff kann mit Fall-ID und Grund verbergen oder entfernen. Blockieren gilt bidirektional für Lesen, Interaktion und Benachrichtigung. Community-Live bleibt deaktiviert, bis Host-/Co-Host-Rechte, Alters- und Geoschutz, Echtzeit-Reporting, Blockieren, Delay/Ende-Steuerung, Eskalation und datensparsame Retention abgenommen sind.

**Abhängigkeiten:** AP-03, AP-04, AP-07.

**Abnahmekriterium:** Datenbankgestützte negative Tests belegen die Sperr- und Blockmatrix für Suche, Feed, Profil, Kommentar, Like, Benachrichtigung, Direktaufruf und zuvor ausgegebenen Medienlink. Ein Statuswechsel entzieht die Sichtbarkeit atomar. Community-Live hat entweder einen vollständig abgenommenen Safety-Nachweis oder bleibt technisch nicht aktivierbar.

**Priorität:** P0.

### AP-09 – Marktplatz-Compliance, Händlertransparenz und Rückrufsteuerung absichern

**Ziel:** Öffentlich verfügbare EU-Verbraucherangebote erfüllen ihre produktartenabhängigen Sicherheits-, Rückverfolgbarkeits- und Transparenzanforderungen, bevor sie freigegeben werden.

**Konkreter Umfang:** Ein Compliance-Schema für Produkte und Händler definieren. Es umfasst Hersteller oder Marke, postalische und elektronische Kontaktadresse, gegebenenfalls EU-verantwortliche Person, eindeutige Produktkennung, Warnungen, Anleitungen, Konformitäts- und Recall-Status, Quellprovenienz, Händler- oder Nicht-Händlerstatus, Identität, Kontakt und Impressumslink. Eine Verantwortungsmatrix erklärt die Rolle von BlackWaterLeaf, Partner und Käufer; Nicht-Händler erhalten den erforderlichen Verbraucherrechtshinweis. Direkt an Suche und Sortierung ist eine verständliche Erklärung der Rankingparameter zu verlinken; bezahlte Priorisierung ist modelliert und eindeutig gekennzeichnet. Safety-Gate- oder Rückrufmeldungen müssen Angebote sofort pausieren oder entfernen, Händler auditierbar benachrichtigen und die öffentliche Seite aktualisieren. Legal validiert die Produktklassen und die konkrete Anwendung der GPSR-Pflichten [5] [9].

**Abhängigkeiten:** AP-01, AP-02, AP-06.

**Abnahmekriterium:** Ein Unternehmen, ein Nicht-Händler, ein Angebot ohne Pflichtsicherheitsangabe und ein zurückgerufenes Produkt durchlaufen die Freigabe- und Sperrtests. Pflichtfelder blockieren technisch die Veröffentlichung. Öffentliche Hub-, Shop- und Produktseiten zeigen Status, Verantwortung, Rankinghinweis und Compliance-Angaben korrekt. Legal/Compliance erteilt eine dokumentierte Freigabe je Produktklasse.

**Priorität:** P0.

### AP-10 – Audit-Ledger und privilegierte Datenzugriffe atomar und minimalberechtigt machen

**Ziel:** Kritische Sicherheits-, Datenschutz-, Moderations- und Händlerentscheidungen sind vollständig, manipulationssichtbar, transaktional und nur für notwendige Rollen einsehbar.

**Konkreter Umfang:** Eine transaktionsfähige Ledger-Append-Funktion bereitstellen, die im selben Datenbankkontext wie Rollen-, Status-, Consent-, Medien-, Partner-, Moderations-, Accountschluss- und Löschänderungen schreibt. Fehlschlägt der Audit-Write, wird die Geschäftsänderung zurückgerollt. Ereignisse speichern Actor, Aktion, Ziel, Zeit, Status vor/nach, Fall-ID und minimale Payload-Hashes, niemals unnötige Klartextinhalte. Korrekturprüfung und Auditansicht erhalten entweder `adminProcedure` oder eine explizit minimalberechtigte Review-Rolle. Moderatoren sehen nur pseudonymisierte Identitäten und den für ihre Aufgabe erforderlichen Inhalt. Ledger-Integritätsprüfungen laufen periodisch, erzeugen überwachte Alarme und folgen einer verbindlichen Retention- und Zugriffspolitik.

**Abhängigkeiten:** AP-02, AP-06 bis AP-09.

**Abnahmekriterium:** Transaktions- und Fehler-Injektionstests belegen, dass keine kritische Änderung ohne Ledger-Ereignis wirksam wird. Ein Rollenmatrix-Test beweist, dass Moderation keine unnötigen E-Mails oder vollständigen Auditdaten erhält. Die Integritätsprüfung erkennt einen absichtlich manipulierten Testeintrag und alarmiert den benannten Owner.

**Priorität:** P1.

## Phase II – Gemeinsame Plattform- und Paritätsgrundlage

### AP-11 – Gemeinsame Verträge, Paritätsmatrix und sichere Fehlersemantik versionieren

**Ziel:** Web und Native greifen auf dieselben fachlichen Daten- und Fehlerverträge zu und werden über eine versionierte Paritätsmatrix als ein Produkt abgenommen.

**Konkreter Umfang:** Versionierte Shared Contracts für Navigation, Connection/Sync, Medien, Community, Moderation, Marktplatz, Katalog, KI-Ergebnis, Beobachtung und Fehler definieren. Der Fehlervertrag liefert ausschließlich stabile `messageKey`, Domänen-/HTTP-Klasse, `retryable` und korrelierte `requestId`; interne Ursachen bleiben serverseitig. Eine Paritätsmatrix erfasst für jeden Screen, jede Rolle und jeden Zustand Datenquelle, Berechtigung, Web-Ansicht, Native-Ansicht, Test und Abnahme. Sie enthält mindestens Entdecken, Karte, Erfassen, Katalog, Profil, Botanik, Aquaristik, Terraristik, KI, Community und Marktplatz. Verträge dürfen keine rohen Backendentexte, präzisen Orte, Token, Medien-URLs oder personenbezogenen Fehlerdetails ausgeben.

**Abhängigkeiten:** AP-02, AP-03, AP-07 bis AP-10.

**Abnahmekriterium:** Contract-Tests lassen Web und Native gegen dieselben strukturierten Erfolgs- und Fehlerantworten laufen. Die Matrix weist pro verpflichtendem Screen alle Zustände aus dem Designbuch aus und enthält keine ungeklärte Abweichung. Security bestätigt, dass die Fehlerantwort keine internen Details preisgibt.

**Priorität:** P1.

### AP-12 – Sitzungen, Standortverarbeitung und öffentliche Ortsangaben schützen

**Ziel:** Gestohlene oder nicht mehr berechtigte Tokens verlieren zeitnah ihre Wirkung; Standortverarbeitung ist transparent, widerrufbar und auf das notwendige Maß begrenzt.

**Konkreter Umfang:** Kurzlebige Access-Tokens und rotierende, serverseitig widerrufbare Refresh-Tokens mit gerätegebundener Session-Registry einführen. Logout, Passwortwechsel, Recovery, Rollen-/Statuswechsel und Kontoschluss invalidieren relevante Sessions; „alle Geräte abmelden“ wird verfügbar. Standortverarbeitung informiert vor der Abfrage getrennt über Zweck, Präzision, Empfänger und Nicht-Speicherung; sie erfasst bei angemeldeten Personen den widerrufbaren Zweck `location_processing`. Koordinaten werden für Wetter auf die erforderliche Genauigkeit gerundet, nur per POST/no-store übertragen und nie in URLs, Telemetrie oder Fehlerlogs abgelegt. Öffentliche Profil-DTOs dürfen keine freien exakten Orte enthalten; zulässig ist allein eine explizit bestätigte, standardmäßig private grobe Region.

**Abhängigkeiten:** AP-02, AP-05, AP-11.

**Abnahmekriterium:** Tests decken einzelne Session-Revoke, Geräteverlust, All-Devices-Logout, Passwortwechsel und Statuswechsel ab. Consent- und Widerrufstests beweisen, dass Standortabfragen nicht ohne korrekte Information und Zustandsprüfung erfolgen. Öffentliche Profiltests schließen freie Adressen und exakte Ortsdaten aus. Die Sitzungsregeln entsprechen aktuellen NIST-Grundsätzen zu Session-Management [10].

**Priorität:** P1.

### AP-13 – Observatory-Shell und verbindliche Fünfernavigation auf beiden Clients herstellen

**Ziel:** Die zentralen Einstiege sind auf Web und Native 1:1 auffindbar und folgen ausschließlich der aktuellen Observatory-Komposition.

**Konkreter Umfang:** Die primäre Navigation in beiden Clients auf exakt fünf Ziele festlegen: **Entdecken, Karte, Erfassen, Katalog, Profil**. Marktplatz und Community bleiben kontextuelle oder sekundäre Ziele. Der Admin-Builder verlässt die globale Tab-Leiste und liegt ausschließlich in einem geschützten Profil-/Admin-Pfad. Desktop zeigt genau einen aktiven Seitenleistenpunkt mit Lime-Fläche und rechter Akzentkante. Mobile zeigt genau einen aktiven unteren Tab mit Lime und Unterstreichung. Die Native-Entdecken-Startfläche übernimmt die verbindliche Reihenfolge: Brand-Zeile, große Suche, 210–250-px-Hero „WASSER VERBINDET.“, exakt drei Fachkarten, Karte-/Liste-Fläche, echter Katalogtreffer, Quellen und Offline-Modul. Desktop und Mobile verwenden nur die aktuellen Größen-, Raster- und Farbregeln des Designbuchs [1].

**Abhängigkeiten:** AP-11.

**Abnahmekriterium:** Routen-, Hash- und Keyboardtests belegen genau einen aktiven primären Navigationseintrag. Screenshot- und Gerätematrix für 360, 390, 768 und 1280 px zeigt weder alte Navigation noch alte Hero-, Karten- oder Mischlayouts. Eine Screen-für-Screen-Abnahme bestätigt die verbindliche fünfteilige Informationsarchitektur auf Web und Native.

**Priorität:** P1.

### AP-14 – Echte Karte-/Listen-Datenbindung, Ortsschutz und Connection-States liefern

**Ziel:** Karte und Liste sind gleichwertige, echte Datenzugänge; Orts- und Betriebsinformationen sind wahrheitsgetreu und nicht simuliert.

**Konkreter Umfang:** Das Karte-/Liste-Modul an dieselbe veröffentlichbare Beobachtungsquelle anbinden. Filter, Selektion und Bereichskennzeichnung sind synchron, die Karte erhält serverseitig angewendete Ortsunschärfe und die Liste bleibt bei Kartenfehlern vollständig nutzbar. Bei fehlenden Daten erscheint ein klarer Leerzustand statt Bildpins. Die Ansichtsauswahl ist per Tastatur und Assistive Technology bedienbar. Ein zentraler Connection-/Sync-State speist Shell, Entdecken und Native: `bereit` erscheint nur für erfolgreiche aktuelle Daten; Lade-, Fehler-, Offline-, Stale- und Leerzustände bleiben unterscheidbar. Zeitpunkte der letzten Synchronisation dürfen nur aus tatsächlichen Metadaten stammen. Private und geschützte Orte werden für Unberechtigte nie geliefert.

**Abhängigkeiten:** AP-03, AP-04, AP-11, AP-13.

**Abnahmekriterium:** End-to-End-Tests beweisen echte Umschaltung, gemeinsame Datensätze, Filter-Synchronität, Kartenfehler-Fallback und Ortsunschärfe. Offline-, Fehler-, Leer- und Stale-Simulationen belegen korrekte Anzeigen statt statischer Online- oder Bereit-Meldungen. Web und Native bestehen denselben Daten- und Berechtigungstest.

**Priorität:** P1.

### AP-15 – Native Feldzuverlässigkeit: Erfassung, Beobachtungsbestand, Offline und Push

**Ziel:** Native-Nutzende können Beobachtungen zuverlässig erfassen, wiederfinden und bei instabiler Verbindung kontrolliert weiterarbeiten; Benachrichtigungen sind releasefähig vorbereitet.

**Konkreter Umfang:** Für private Beobachtungen einen authentifizierten Feed mit Medien, Evidenzstatus, Messwerten sowie Lade-, Leer-, Fehler- und Offlinezuständen bereitstellen. Der Erfassungsfluss übernimmt den tatsächlichen ImagePicker-MIME-Typ, prüft Typ/Größe/Lesbarkeit vor dem Anlegen, normalisiert Bilder und modelliert Teilstatus wie „Beobachtung gespeichert, Bild ausstehend“ mit Wiederholen oder Entfernen. Netzwerk- und Internet-Erreichbarkeit werden beobachtet; zuletzt erfolgreiche Lesedaten werden lokal gecacht. Idempotente Schreibvorgänge nutzen eine persistente Outbox mit clientId/eventId, Reihenfolge, Retry-Backoff, Konfliktanzeige und Sync-Feedback. Nicht offlinefähige Aktionen zeigen klare handlungsfähige Fehler. Push-Readiness umfasst kontextbezogene Einwilligung, ExpoPushToken-Registrierung pro Gerät, Android-Channel, iOS-/FCM-/APNs-Konfiguration, Tokenrotation, Abmeldung und Navigation aus einer Benachrichtigung [11].

**Abhängigkeiten:** AP-04, AP-05, AP-11 bis AP-14.

**Abnahmekriterium:** Android- und iOS-Preview-Tests belegen PNG-, JPEG- und WebP-Verarbeitung, Teilerfolg, Wiederholung, Offline-Queue, Replay-Schutz, Konfliktanzeige und sichtbaren neuen Beobachtungsdatensatz. Push-Tests umfassen Zustimmung, Ablehnung, Tokenrotation, abgemeldetes Gerät, Empfang und Tap-Navigation. Alle Zustände entsprechen der Paritätsmatrix.

**Priorität:** P1.

## Phase III – Fachliche End-to-End-Parität

### AP-16 – Marktplatz-Workflow, Händler-Lifecycle und ehrliche Attribution paritätisch abschließen

**Ziel:** Web und Native bieten denselben transparenten Vermittlungs- und Händlerworkflow, ohne Produkte im Hub zu vermischen oder unzuverlässige Weiterleitungen als Kennzahl auszugeben.

**Konkreter Umfang:** Den Marktplatz-Hub auf eine reine Shopauswahl mit Banner, Vertrauenshinweis, Händlerkarten und geschütztem Zugang beschränken. Native erhält für jeden Händler einen eigenen Shop-Screen mit Banner, Kategorien, echten `productType`-Unterkategorien, Suche, Relevanz/Aktualität/Name/Preis, Merken, Produktdetail und „Ich will zu [Händler]“. Jeder freigegebene Händler bleibt auch mit null aktiven Angeboten als rechtlich gekennzeichneter Shop sichtbar. Fremde Händlerbilder und Platzhalterlogos werden entfernt; verwendete Bilder benötigen geprüfte Quelle, Rechte- und Freigabevermerk. Der Händler-Lifecycle wird serverseitig erzwungen: `draft → submitted/under_review → active | changes_requested | paused | removed`, einschließlich Prüfer, Zeitstempel, Einreichversion und Notiz. Die Adminwarteschlange bildet zwingend Profil, Autorisierung, Platzierung und Einzelproduktprüfung ab. Produkte erhalten kontrollierte Kategorie, Produkttyp, strukturierte Preise, Währung, Preisbasis, Verfügbarkeit, Aktualität, Herkunft und Vollständigkeitsscore. Alle externen Links verwenden eine datensparsame serverseitige Handoff-Route mit UUID, kurzlebigem Einmal-Token, Rate Limit, Idempotenz, Replay-/Bot-Schutz und atomarem Ereignis. Sie zählt nur „Weiterleitung ausgelöst“ und explizites Interesse, niemals einen Verkauf. Native eventIds sind RFC-konforme UUIDs; Fehler werden nicht verschluckt.

**Abhängigkeiten:** AP-09 bis AP-11, AP-13.

**Abnahmekriterium:** Paritätstests zeigen auf Web und Native denselben Hub-, Shop-, Detail-, Such-, Sortier-, Leer- und Händlerprüfungsfluss. Contract-Tests akzeptieren die Native-UUID und lehnen manipulierte, wiederholte oder unberechtigte Attribution ab. Tests für Punkt-/Kommapreise, Preisbereiche und nicht vergleichbare Preise belegen korrekte Sortierung. Das Händlerportal weist bestätigte Verkäufe bis zur Checkout-Integration ausschließlich als null aus.

**Priorität:** P1.

### AP-17 – Community-Parität, Schutzinteraktionen und Benachrichtigungen vollenden

**Ziel:** Community-Funktionen sind funktional gleichwertig, moderierbar und in beiden Clients ohne Sicherheitslücke nutzbar.

**Konkreter Umfang:** Web und Native erhalten denselben versionierten Community-Contract für Bildentwurf mit Consent/Upload, Likes, Kommentare, Meldungen, Blockieren/Entblocken, Moderationsmitteilungen und Statusrückmeldungen. Native ergänzt Bildauswahl, Like-Interaktion und sichere Schutzaktionen; Web ergänzt fehlende kontextnahe Schutzaktionen. Kommentar-Owner können nach klarer Policy bearbeiten und soft löschen. Staff-Aktionen benötigen Rolle, Fall-ID, Grund, Auditereignis und Benachrichtigung. Benachrichtigungsfeed und Unread-Count nutzen korrekte `count(*)`-Logik, Cursor-Paginierung und priorisieren Sicherheits- und Moderationsnachrichten. Jede sicherheits- oder moderationsrelevante Community-Transition schreibt das minimale Auditereignis aus AP-10. Community-Live bleibt bis zu einer separaten, vollständigen Safety-Abnahme gesperrt.

**Abhängigkeiten:** AP-07, AP-08, AP-10, AP-11, AP-15.

**Abnahmekriterium:** Verhaltensbasierte Web-/Native-Tests decken Bildentwurf, Consent, Uploadfehler, Like, Block in beiden Richtungen, Melden, Kommentar-Lifecycle, Moderationsmitteilung, Einspruch und Paginierung bei 0, 50, 100 und 101 Benachrichtigungen ab. Für jede Schreibaktion existiert ein überprüfbares Auditereignis. Kein Community-Live-Entry-Point ist ohne abgenommene Safety-Architektur erreichbar.

**Priorität:** P1.

### AP-18 – KI-Bestimmung, Korrekturprüfung, Quellen und Kostenwahrheit vereinheitlichen

**Ziel:** Die KI-Bestimmung ist auf Web und Native fachlich nachvollziehbar, providerkonform, korrigierbar und kostenmäßig auditierbar.

**Konkreter Umfang:** Einen gemeinsamen strukturierten Ergebnisvertrag aktiv nutzen. Beide Clients zeigen gleichwertige Karten für Hypothese, Kandidaten mit Score und Begründung, erkannte Merkmale, Bildnachforderung, Sicherheitswarnungen, Pl@ntNet-Zweitprüfung, Quellen und Korrektur. Markdown bleibt Darstellung, nicht alleinige Datenquelle. Die Zweitprüfung erhält alle akzeptierten Einzelbilder desselben Individuums sowie `organs=auto` oder eine zugängliche Organzuordnung. Bilder werden client- und serverseitig auf ein definiertes Budget normalisiert und vor Provideraufruf in JPEG/PNG überführt; strukturierte Fehler unterscheiden unter anderem nicht unterstütztes Providerformat, Bildgröße, Quote und Timeout. Der Korrekturprozess erhält eine rollenbasierte Pending-Warteschlange, Detailansicht mit unveränderlicher Originalantwort, Approve/Reject, Entscheidungsnotiz, Audit, Benachrichtigung und versionierte fachliche Korrektur. Quellenkarten zeigen nur tatsächlich erhaltene oder intern versionierte Angaben: Anbieter, Version/Release, Record-ID, stabile URL, Abruf-/Importzeit, Lizenz und Evidenzstatus; für FishBase zusätzlich referenzbezogene Angaben und für Pl@ntNet Engineversion, Referenzial und Kandidaten-IDs. Ein Usage-Ledger speichert tatsächlichen Modellnamen, Tokenwerte, Request-Outcome, Tarifversion, Pl@ntNet-RateLimit/Restquote/Reset ohne Prompt- oder Bildinhalt [12] [13] [14].

**Abhängigkeiten:** AP-04, AP-10, AP-11, AP-15.

**Abnahmekriterium:** Aufgezeichnete Provider-Adaptertests belegen FormData, Mehrbildweitergabe, Organsemantik, Normalisierung, Quoten-/Fehlermapping und Provenienz. Web und Native bestehen Contract-Tests für ein, zwei und drei Bilder sowie abweichende Zweitprüfung. Ein autorisierter End-to-End-Test schließt Korrektureinreichung, Entscheidung, Audit und Benachrichtigung ein. Der Usage-Ledger weist korrekten Modellnamen und gemessene Nutzung nach.

**Priorität:** P1.

## Phase IV – Qualität, Betriebsreife und Freigabe

### AP-19 – Observatory-Qualität, Accessibility und Web-Performance absichern

**Ziel:** Die aktuelle Observatory-Oberfläche bleibt auf allen Zielgrößen zugänglich, kompakt und performant, ohne alte Layout- oder Farbsysteme zurückzuholen.

**Konkreter Umfang:** Gemeinsame Design-Tokens für Hero-Höhen, Raster, Radien, Portalgrün, Lime, Aqua und Gold etablieren. Heroes bleiben Desktop bei etwa 210–260 px und Mobile bei etwa 210–250 px. Aqua wird ausschließlich für Wasser, Aquaristik und Live, Gold ausschließlich für Terraristik eingesetzt; KI-Lila und andere nicht genehmigte Farbvarianten werden entfernt. Header- und Icon-Hit-Areas erreichen mindestens 44×44 pt/px, auf Android vorzugsweise 48×48 dp, mit ausreichendem Abstand. Web und Native erhalten konsistente Rollen, Labels, Hints, selected/disabled/busy-States und Live-Regionen; Tabgruppen und Umschalter verwenden passende Semantik. Die Prüfung umfasst Tastatur, axe, sichtbaren Fokus, TalkBack und VoiceOver. Im Web werden nach einer Bundle-Analyse fachlich getrennte Routen nachgeladen, insbesondere Admin, KI, Community, Marktplatz, Katalogdetail und Builder. Gzip-/Brotli-Budgets und Web-Vitals-Schwellen verhindern schleichende Regressionen [15] [16] [17].

**Abhängigkeiten:** AP-11, AP-13 bis AP-18.

**Abnahmekriterium:** Automatisierte Screenshots bei 360, 390, 768 und 1280 px sowie manuelle Android-/iOS-Assistive-Technology-Tests zeigen keine alten Layouts, unzulässigen Farben, zu großen Heroes oder zu kleinen Kernziele. Axe- und Keyboard-Prüfungen bestehen. Bundle-Budgets und messbare Lighthouse-/Web-Vitals-Schwellen bestehen im CI; Abweichungen blockieren die Promotion.

**Priorität:** P2.

### AP-20 – Release-Gates, Observability, Testpyramide und kontrollierte Promotion in Betrieb nehmen

**Ziel:** Jede Veröffentlichung ist commitgenau nachvollziehbar, auf realen Plattformen geprüft, über Readiness und datensparsame Telemetrie beobachtbar sowie ohne destruktive Datenänderung zurückrollbar.

**Konkreter Umfang:** Liveness und Readiness trennen. Readiness prüft mit Timeouts mindestens Datenbankverbindung, erforderliche Storage-Konfiguration und klar definierte kritische Abhängigkeiten, ohne sensible Details auszugeben. Ein externes Monitoring alarmiert mit Incident-Runbook. Web, Server und Expo erhalten datensparsame Produktionsfehlererfassung mit Release-ID, anonymisiertem Kontext und strikter Entfernung von Tokens, E-Mails, Inhalten, exakten Orten, Medien-URLs und KI-Eingaben. Die Web-Fehlergrenze zeigt deutschen Observatory-konformen Fallback mit Wiederholen/Startseite statt Stacktrace; Native erhält eine Root-Boundary und kontrollierten JS-Fehlerfallback. Die Testpyramide umfasst Server-, Shared-Contract-, Web-Komponenten-, Native-React-Native-Testing-Library- sowie Maestro- oder Detox-Smoke-Tests auf signierten Android- und iOS-Preview-Builds. CI/CD ist geschützt und prüft Commit-SHA/Build-ID, Typecheck, Tests, Coverage, Bundle-Budget, Schema-/Migration-Gate aus AP-06, isolierten Build, Readiness, Sicherheitsregressionen und Paritätsmatrix. Expo erhält Development-, Staging/Preview- und Production-Profile, Channels, `runtimeVersion`, gestaffelten OTA-Rollout sowie getestetes `eas update:rollback`. Staging und Production verwenden dasselbe signierte Artefakt oder eine nachvollziehbare Republish-Promotion [18] [19].

**Abhängigkeiten:** AP-01 bis AP-19.

**Abnahmekriterium:** Ein vollständiger Release-Dry-Run demonstriert Build, additive Migration mit Backup-ID, Readiness, Web-/Native-Screen-Abnahme, Android-/iOS-Smoke, Monitoringalarm, Fehlerfallback, kontrollierte Promotion und getesteten Anwendungs-/OTA-Rollback. Vor Veröffentlichung werden Entdecken, Karte, Erfassen, Katalog, Profil, Botanik, Aquaristik, Terraristik, KI, Community und Marktplatz auf Desktop und Mobile einzeln geprüft. Kein alter Hero, kein altes Kartenraster, kein altes Menü, keine unlesbare Farbe, kein Fake-Eintrag und kein unverbundener Button darf sichtbar sein [1].

**Priorität:** P1.

## Abschlussregel

Nach Abschluss jedes Arbeitspakets aktualisieren die verantwortlichen Owner das Risikoregister, die Paritätsmatrix und den Release-Nachweis. Ein Paket gilt nicht als erledigt, weil Code gemergt oder ein Test lokal bestanden ist. Erledigt ist es erst, wenn der vollständige Abnahmekatalog erfüllt, die Abhängigkeit dokumentiert und die Freigabe durch die zuständige Security-, Datenschutz-, Legal-, Produkt- oder Betriebsrolle erteilt wurde. Dieser Auftrag selbst enthält **keine Code-, Datenbank- oder Konfigurationsänderung**; er ist die verbindliche Grundlage für deren kontrollierte Planung und Abnahme.

## References

[1]: file:///home/ubuntu/blackwaterleaf-parity-staging/docs/BLACKWATERLEAF_OBSERVATORY_SCREEN_DESIGN_BOOK_2026-09-19.md "BlackWaterLeaf Observatory Screen Design Book, Version 1.0, 19. September 2026"
[2]: https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/ "OWASP Top 10 2025: A01 Broken Access Control"
[3]: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html "OWASP Authorization Cheat Sheet"
[4]: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html "OWASP File Upload Cheat Sheet"
[5]: https://eur-lex.europa.eu/eli/reg/2023/988/oj/eng "Regulation (EU) 2023/988 on general product safety"
[6]: https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en "European Commission: Data protection information for individuals"
[7]: https://digital-strategy.ec.europa.eu/en/factpages/user-rights-under-digital-services-act "European Commission: User rights under the Digital Services Act"
[8]: https://www.esafety.gov.au/sites/default/files/2026-02/Designing-for-Safety_Preventing-child-sexual-exploitation-and-abuse-online_CSEA-toolkit.pdf?v=1777630627054 "eSafety: Designing for Safety – Preventing child sexual exploitation and abuse online"
[9]: https://commission.europa.eu/topics/business-and-industry/product-safety_en "European Commission: Product safety and Safety Gate"
[10]: https://pages.nist.gov/800-63-4/sp800-63b.html "NIST SP 800-63B-4: Authentication and Session Management"
[11]: https://docs.expo.dev/push-notifications/push-notifications-setup/ "Expo Push Notifications Setup"
[12]: https://my.plantnet.org/doc/api/identify "Pl@ntNet API: Single-species identification"
[13]: https://my.plantnet.org/doc/api/quota "Pl@ntNet API: Quota management"
[14]: https://www.fishbase.se/summary/citation.php "FishBase: Citation guidance"
[15]: https://www.w3.org/TR/WCAG22/ "Web Content Accessibility Guidelines 2.2"
[16]: https://developer.apple.com/design/human-interface-guidelines/tab-bars "Apple Human Interface Guidelines: Tab bars"
[17]: https://m3.material.io/foundations/designing/structure "Material Design 3: Structure and target sizes"
[18]: https://docs.expo.dev/eas-update/deployment/ "Expo EAS Update: Deployment"
[19]: https://docs.expo.dev/debugging/runtime-issues/ "Expo: Debugging runtime issues"
