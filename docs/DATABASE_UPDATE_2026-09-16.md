# BlackWaterLeaf – Datenbankupdate

**Ausgeführt:** 16. September 2026
**Umgebung:** BlackWaterLeaf Parity Staging, TiDB `8.0.11-TiDB-v8.5.3-serverless`
**Sicherheitsprinzip:** ausschließlich additive DDL; keine Tabelle, Spalte oder bestehende Nutzerdaten wurden gelöscht.

## Umfang des Updates

| Bereich | Änderung | Zweck |
|---|---|---|
| Einwilligungen | Neue Tabellen `user_consent_current` und `user_consent_events` | Aktuellen Freigabestatus eindeutig prüfen und Erteilungen/Widerrufe nachvollziehbar protokollieren. |
| Bestehende Freigaben | Fünf vorhandene Legacy-Freigaben in aktuellen Zustand und Baseline-Ereignisse übernommen | Keine Berechtigung ging beim Upgrade verloren. |
| Wasserwerte | Neue Tabelle `smart_device_measurements` | Private Zeitreihe für Temperatur, pH, GH, KH, Nitrit, Nitrat und Leitwert; nur Werte, Einheiten, Quelle, Qualitätsstatus und Zeitstempel. |
| Integrität | Fremdschlüssel für Messungen und Kommentarantworten | Verhindert verwaiste Messwerte; beim Löschen eines Elternkommentars wird die Antwortbeziehung auf `NULL` gesetzt. |
| Leistung | Zehn zusammengesetzte Indizes | Beschleunigt eigene Beobachtungen, Community-Beiträge, Bildzuordnungen, Lebensräume, Einwilligungsprüfungen und Messverläufe. |
| Serverlogik | Einwilligungsprüfungen auf den aktuellen Zustand umgestellt; Medienkontext und Kommentar-Elternbezug validiert | Verhindert überholte Freigaben sowie widersprüchliche Medien- und Antwortzuordnungen. |

## Daten- und Datenschutzgrenzen

Die Messzeitreihe nimmt **keine** Gerätezugangsdaten, OAuth-Token oder Rohpayloads auf. Manuelle Werte und spätere autorisierte Gerätemessungen werden getrennt über `source` gekennzeichnet. Die bestehende Smart-Home-Auswahl bleibt weiterhin im Status „Autorisierung ausstehend“, bis ein provider-spezifischer Connector mit eigener Sicherheitsprüfung umgesetzt wird.

Die Einwilligungshistorie enthält ausschließlich Zweck, Policy-Version, Zustand und Zeitstempel. Sie speichert weder Text der Einwilligung noch zusätzliche personenbezogene Daten. Bestehende Legacy-Einwilligungen bleiben aus Kompatibilitätsgründen erhalten; neue Autorisierungsprüfungen verwenden ausschließlich `user_consent_current`.

## Verifikation

Der vollständige TypeScript-Check, alle **118 Vitest-Tests** und der Produktionsbuild sind erfolgreich durchgelaufen. Das Live-Schema bestätigt die drei neuen Tabellen, sechs neue Fremdschlüssel und zehn zielgerichtete Indexe. Die Datenübernahme ergab fünf Legacy-Zeilen, fünf aktuelle Freigabestände und fünf Baseline-Ereignisse; Abfragen auf verwaiste aktuelle Freigaben, Ereignisse und Messwerte ergaben jeweils `0`.

## Migrationshinweis

Die bekannte Differenz zwischen lokalem Drizzle-Journal und der bestehenden Live-Migrationshistorie bleibt offen. Deshalb wurde **kein globaler `drizzle-kit migrate`-Lauf** ausgeführt. Die Datei `0012_complex_smasher.sql` dokumentiert die angewandte additive Migration. Die nachfolgende Datei `0013_strong_greymalkin.sql` enthält bewusst keine DDL: Sie gleicht lediglich das lokale Drizzle-Metadatenmodell an, weil TiDB den ursprünglich generierten Fremdschlüsselnamen wegen der 64-Zeichen-Grenze nicht akzeptiert hat. Vor einer regulären automatischen Migration muss die im Audit beschriebene Baseline-Versöhnung abgeschlossen werden.
