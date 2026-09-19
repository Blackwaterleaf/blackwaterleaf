# BlackWaterLeaf Release-Readiness-Nachweis

**Stand:** 19. September 2026  
**Release-Linie:** Observatory Portal 2026.09  
**Scope:** AP-20 kontrollierte Promotion und Betriebsreife

## Implementierter Gate-Vertrag

Der Server stellt getrennte, datensparsame Endpunkte bereit. `/livez` bestätigt ausschließlich, dass der Prozess antwortet. `/readyz` prüft mit einem zweisekündigen Timeout die Datenbankverbindung sowie die erforderliche serverseitige Storage-Konfiguration. Der Readiness-Endpunkt gibt keine Zugangsdaten, URLs, Nutzerdaten, Inhalte, Medien- oder KI-Eingaben aus. Bei einem fehlenden Check antwortet er mit HTTP 503 und einem begrenzten Statusobjekt.

Web und Native besitzen bereits kontrollierte Fehlergrenzen beziehungsweise Lade-/Fehlerzustände. Die Expo-Konfiguration führt nun getrennte `development`, `staging`, `preview` und `production`-Profile, die Channels `development`, `staging` und `production`, eine runtimeVersion nach App-Version und einen stabilen EAS-Update-Endpunkt. Das Preview-Profil bleibt als signiertes internes APK-Profil erhalten.

## Promotion-Reihenfolge

1. `pnpm db:baseline:verify` und additive Migrationsprüfung aus AP-06.
2. `pnpm check`, vollständige Vitest-Suite, `pnpm build`, Native-TypeScript und `git diff --check`.
3. Readiness auf der gebauten Serverinstanz über `/livez` und `/readyz`.
4. Manuelle Screen-Matrix: Entdecken, Karte, Erfassen, Katalog, Profil, Botanik, Aquaristik, Terraristik, KI, Community und Marktplatz in Desktop- und Mobile-Breite.
5. Internes Android-Preview-Artefakt über `eas build --profile staging` beziehungsweise `preview`.
6. Erst nach fachlicher Abnahme: kontrollierte Production-Promotion und ein dokumentierter Rollback-Test für Web sowie `eas update:rollback` für OTA.

## Ehrlicher Status

Ein externer Alarmdienst, ein signierter iOS-Preview-Build und ein tatsächlich durchgeführter OTA-Rollback werden hier nicht als erledigt behauptet. Dafür sind externe Betriebszugänge beziehungsweise ein reales Geräte-/Store-Artefakt erforderlich. Der Code-Gate-Vertrag ist vorbereitet und blockiert keine bestehenden Daten oder Nutzerkonten.
