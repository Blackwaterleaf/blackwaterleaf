# BlackWaterLeaf – Anforderungs- und Audit-Abdeckungsregister

**Legende:** `verifiziert` = aktueller Nachweis vorhanden; `in Arbeit` = Teilnachweis; `blockiert` = erforderliche Evidenz fehlt; `nicht anwendbar` nur mit Begründung.

| ID | Quelle/Abschnitt | Befund oder Anforderung | aktuelle Evidenz | Priorität | Ziel | Arbeitspaket | Paritätszeilen | Testfälle | Ergebnis | offene Voraussetzung |
|---|---|---|---|---|---|---|---|---|---|---|
| G0-001 | Auftrag 5/Phase 0 | Bestand, Versionsstände und Arbeitsraum dokumentieren | Repo `b9da0938`, Web-/Native-Builds vorhanden | P0 | reproduzierbare Arbeitsbasis | WP-G0 | PAR-001 | EVD-001 | in Arbeit | APK-Provenienz/Hash |
| G0-002 | Auftrag 2/11 | Premium-Prompt und Website-Audit einbeziehen | Referenzdateien im Sandbox-Bestand nicht gefunden | P0 | Quellen vollständig vor Umsetzung | WP-G0 | — | EVD-002 | blockiert | Dateien bereitstellen |
| G0-003 | Auftrag 4 | keine Veröffentlichung/produktive Änderungen | Auftrag und Projektregeln dokumentiert | P0 | reversible lokale Änderungen | WP-G0 | — | EVD-003 | verifiziert | laufend beachten |
| G1-001 | Auftrag 5.1/Phase 1 | vollständiges Web-Routeninventar | vorhandene ältere Audit-/Projektdateien; aktueller Recheck ausstehend | P0 | jede reale Route klassifiziert | WP-G1 | PAR-002 | NAV-001 | in Arbeit | vollständiger Lauf |
| G1-002 | Auftrag 5.2/Phase 1 | APK-Screen-/Deep-Link-Inventar | `mobile-natur/App.tsx`, `src/api.ts`, App-Konfiguration | P0 | jeder Screen mit Webziel verknüpft | WP-G1 | PAR-003 | NAV-002 | in Arbeit | Realgerät/Testzugang |
| G1-003 | Auftrag 8.2 | fünf lokale Tagesphasen, deterministisch testbar | Design Book definiert Fenster; Implementierungsnachweis noch offen | P0 | Web/Native gleiche Phase | WP-P0-TIME | PAR-010 | TIME-001 | blockiert | Code-/Runtime-Audit |
| G1-004 | Auftrag 8.3 | Baum-/Wurzelebene nur mit realer Datenbasis | vorhandene Punkte-/XP-/Observatory-Daten, fachliche Kopplung nicht abschließend geprüft | P0 | echte oder ehrliche atmosphärische Variante | WP-P0-ROOT | PAR-011 | ROOT-001 | in Arbeit | Datenquellenprüfung |
| G1-005 | Auftrag 9 | installierbares signiertes APK und Upgrade | nur Android-Export vorhanden | P0 | Installation/Upgrade korrekt belegen | WP-G8 | PAR-020 | AND-001 | blockiert | autorisiertes Artefakt |
| G1-006 | Auftrag 10 | WCAG 2.2 AA / Android Accessibility | vorhandene Tests und Contrast-Script; manueller Volltest offen | P1 | Kontrast, Fokus, TalkBack, Zoom | WP-P2-A11Y | PAR-030 | A11Y-001 | in Arbeit | Browser-/Geräteabnahme |
| G1-007 | Auftrag 10 | Web-Performancebudgets | Build vorhanden, Feld-/Labormessung nicht vollständig | P1 | CWV und Medienbudgets belegt | WP-G1-PERF | — | PERF-001 | blockiert | definierte Messumgebung |
| P0-001 | Auftrag 8.1 | Botanik-Welt durchgängig | bestehende Realm-/Katalogpfade und Design Book | P0 | Farbe, Inhalte, Zustände und Aktionen konsistent | WP-P0-WORLD | PAR-101 | WORLD-001 | in Arbeit | Unterseitenprüfung |
| P0-002 | Auftrag 8.1 | Aquaristik-Welt durchgängig | bestehender Realm-/Uploadpfad | P0 | Wasserblau/Cyan, echte Daten und Zustände | WP-P0-WORLD | PAR-102 | WORLD-002 | in Arbeit | Unterseitenprüfung |
| P0-003 | Auftrag 8.1 | Terraristik warmes Moos-/Regenwaldgrün | aktuelles Design-/Auditmaterial; Native-Umfang abzugleichen | P0 | kein beliebiges Gelbtheme, echte Inhalte | WP-P0-WORLD | PAR-103 | WORLD-003 | blockiert | Premium-Prompt fehlt |
| P0-004 | Auftrag 8.1 | KI tiefes Violett nur für KI | Assistant vorhanden; Token-/Unterseitenaudit offen | P0 | KI-Kontext, Unsicherheit, Quellen, Fehler | WP-P0-WORLD | PAR-104 | WORLD-004 | in Arbeit | Vollinventar |
| P1-001 | Auftrag 8.4 | ruhige Motion mit Reduced-Motion-Fallback | aktuelle Uploadanimation ergänzt; globaler Vollabgleich offen | P1 | sichtbar, pausierbar, budgetiert | WP-P1-MOTION | PAR-201 | MOT-001 | in Arbeit | Messbaseline |
| P1-002 | Auftrag 8.4 | Glas-/Wasserwirkung mit opakem Fallback | Design Book vorhanden; runtimeweite Prüfung offen | P1 | max. eine Glasregion, keine Lesbarkeitsverluste | WP-P1-MATERIAL | PAR-202 | MAT-001 | in Arbeit | Geräteprofil |
| P1-003 | Auftrag 8.5 | echte Empty-/Error-/Offline-Zustände | zahlreiche StatePanels/Contracts vorhanden | P1 | Ursache und nächste Aktion wahrheitsgemäß | WP-P1-STATES | PAR-203 | STATE-001 | in Arbeit | vollständige Matrix |
| PAR-001 | Auftrag 3/4 | Web↔APK gleiche Daten-/Rechte-/Terminologieregeln | tRPC-Web und Native API vorhanden; Shared-Contract-Lücke historisch dokumentiert | P0 | versionierte gemeinsame Verträge | WP-G2 | PAR-001 | API-001 | in Arbeit | aktuelle Adapterprüfung |
| UPL-001 | Nutzerauftrag 16:20 | große Aquaristikbilder mit sichtbarem Fortschritt | b9da0938, 378 Tests, Native-Export | P1 | Phasenkarte in Web/Native | WP-UPLOAD | PAR-102 | UPLOAD-001 | verifiziert | Realgerät optional |
| SOC-001 | Nutzerauftrag | generisches Folgen/Entfolgen und Profilbeziehungen | `social.*`, öffentliche Profile, Tests vorhanden | P1 | Instagram-artige Listen/Aktionen | WP-SOCIAL | PAR-301 | SOCIAL-001 | in Arbeit | geschützter Rollenlauf |
| ADM-001 | Nutzerauftrag | Admin Full-Abo/Free-Override | Entitlements/Admin-Dashboard vorhanden | P0 | serverseitig durchgesetzte Freigabe | WP-ENTITLEMENTS | PAR-401 | ADMIN-001 | in Arbeit | autorisiertes Adminkonto |
