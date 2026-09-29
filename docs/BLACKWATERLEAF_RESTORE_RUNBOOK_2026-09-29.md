# BlackWaterLeaf – Restore-Runbook

## Ziel

Dieses Runbook stellt BlackWaterLeaf in einem anderen Manus-Account oder WebDev-Projekt wieder her, ohne das bestehende Projekt zu überschreiben. Es arbeitet ausschließlich mit einer neuen Kopie bzw. einem neuen Branch.

## Sicherer Ausgangspunkt

- GitHub: https://github.com/Blackwaterleaf/blackwaterleaf
- Übergabe-PR: https://github.com/Blackwaterleaf/blackwaterleaf/pull/10
- Übergabebranch: `handoff/blackwaterleaf-2026-09-29`
- Projektname: `blackwaterleaf-parity-staging`
- WebDev-Projekt-ID: `nEarRHPwUMm6zboSiuht5i`
- Letzter Startseiten-Checkpoint: `382811f`
- Älterer Entdecken-/Galerie-Checkpoint: `2f1c9e8c`

## Variante A – GitHub als Quelle

1. Im Zielkonto ein **neues** WebDev-Projekt anlegen.
2. Das Repository `Blackwaterleaf/blackwaterleaf` verbinden.
3. Den Branch `handoff/blackwaterleaf-2026-09-29` als Ausgangspunkt wählen.
4. Vor dem ersten Start prüfen, ob der Code in einem neuen Projektverzeichnis liegt.
5. Umgebungsvariablen und Secrets im Zielprojekt neu anlegen; Werte niemals aus Git übernehmen.
6. Datenbank-/Storage-Verbindungen zunächst als Testverbindungen eintragen.
7. `pnpm check`, `pnpm test` und `pnpm build` ausführen.
8. Erst danach eine neue Preview bzw. einen neuen Checkpoint erstellen.

## Variante B – Restore-Bundle

Das Bundle enthält Quellcode, Konfiguration, Migrationen, Tests, Assets und Dokumentation, aber keine Git-Historie, keine `node_modules`, keinen Build-Output und keine Secrets.

1. ZIP in ein neues Projektverzeichnis entpacken.
2. `pnpm install` ausführen.
3. Eine geschützte Runtime-Konfiguration außerhalb des Repositories anlegen.
4. Datenbank und Storage zunächst mit einem Backup bzw. einer Staging-Datenbank verbinden.
5. Prüfungen ausführen:

```bash
pnpm check
pnpm test
pnpm build
cd mobile-natur && npx tsc --noEmit && npx expo-doctor
```

6. Erst nach erfolgreicher Prüfung den neuen WebDev-Checkpoint speichern.

## Secrets neu hinterlegen

Die folgenden Namen können im Zielprojekt benötigt werden. Nur die Werte aus den jeweiligen Anbietern einsetzen:

```text
DATABASE_URL
JWT_SECRET
AI_PROVIDER
IONOS_AI_API_KEY
IONOS_AI_API_URL
IONOS_AI_MODEL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
VITE_STRIPE_PUBLISHABLE_KEY
BWL_MEDIA_CONTROL_SECRET
```

Keine Werte aus Chat, ZIP oder GitHub kopieren. Tokens rotieren, wenn sie jemals versehentlich in einem ungeschützten Kanal standen.

## IONOS und Expo

- IONOS: https://login.ionos.com/
- IONOS CloudPanel: https://cloudpanel.ionos.com/
- IONOS AI Model Hub: https://cloud.ionos.com/managed/ai-model-hub
- Expo-Projekt: https://expo.dev/accounts/blackwaterleaf2s-team/projects/bwl
- Android-Paket: `com.blackwaterleaf`
- EAS-Projekt-ID: `40ef1859-d5f9-484d-89e9-046333b708f4`

IONOS-, Expo- und Google-Play-Anmeldungen immer direkt auf den offiziellen Seiten durchführen. Keine Passwörter, Session-Cookies oder Signierungsschlüssel in das Bundle legen.

## Rollback

- Bestehendes Projekt bleibt unverändert.
- Bei Fehlern nur die neue Preview bzw. den neuen Ziel-Branch entfernen oder zurücksetzen.
- Datenbankmigrationen zuerst gegen eine Kopie/Staging-Datenbank testen.
- Vor produktiven Migrationen ein Datenbankbackup und einen Export der Storage-Metadaten erstellen.
- DNS erst nach erfolgreichem Staging-Test umstellen.

## Nicht enthalten

Der vollständige private Manus-Chatverlauf, Account-Passwörter, API-Tokens, Sessiondaten, Zahlungsdaten und private IONOS-/Expo-Schlüssel werden aus Sicherheits- und Datenschutzgründen nicht exportiert.
