# BlackWaterLeaf – ausführbarer Umsetzungsplan und Gate-0-Baseline

**Stand:** 2026-09-27 16:27 CEST  
**Arbeitsstand:** `b9da0938` (`main`, `origin/main`)  
**Scope:** bestehendes React-/tRPC-/Drizzle-Web und bestehende Expo-/React-Native-Android-App; keine Ersatz-App, kein WebDev/GameDev, keine Veröffentlichung.

## Gate-0-Status

**Teilweise erfüllt – blockiert.**

### Vorhandener Bestand

- Web-Repository: `/home/ubuntu/blackwaterleaf-parity-staging`
- Native-Quellstand: `mobile-natur/`
- Web-Build: `pnpm run build` erfolgreich am aktuellen Checkpoint.
- Web-TypeScript: `pnpm exec tsc --noEmit` erfolgreich.
- Regression: 96 Testdateien / 378 Tests erfolgreich.
- Native-TypeScript: `mobile-natur/pnpm exec tsc --noEmit` erfolgreich.
- Native Android-Export: `pnpm run export:android` erfolgreich; Export ist ein Bundle, kein installierbares APK.
- Paketidentität: `com.blackwaterleaf`; Version `1.0.19`; Android `versionCode 19`.
- API-Origin im Native-Manifest: `https://blackwaterleaf.com`.
- Native EAS-Profile: development, staging, preview, production; interne APK-Profile staging/preview vorhanden.

### Blocker und offene Voraussetzungen

1. Die im Auftrag referenzierten Dateien `BlackWaterLeaf_Aufgabenmodus_Prompt_AKTUALISIERT.md` und `blackwaterleaf-website-audit-2026-09-27.md` sind im aktuellen Sandbox-Bestand nicht vorhanden. Der Auftrag kann deshalb noch nicht vollständig gegen diese Quellen abgeglichen werden.
2. Kein installierbares, autorisiert signiertes APK-Artefakt ist im Projekt vorhanden; ein Android-Export ist kein Installations-/Upgrade-Nachweis.
3. Kein autorisiertes Samsung-/Android-Realgerät ist verfügbar; reale Upload-, Login-, Lifecycle-, TalkBack- und Performanceprüfungen bleiben offen.
4. Keine Testzugänge wurden bereitgestellt. Geschützte Rollen- und Nutzerflüsse dürfen nicht als geprüft behauptet werden.
5. Ein öffentlicher Website-Check ist nur nicht-destruktiv zulässig; produktive Schreibzugriffe, produktive Migrationen und Veröffentlichungen bleiben ausgeschlossen.

## Arbeitsreihenfolge

| Phase | Gate | Arbeit | Eintrittskriterium | Austrittskriterium |
|---|---|---|---|---|
| 0 | G0 | Bestand, Quellen, Autorisierung, Versionen, Blocker | Repository vorhanden | Bestand und fehlende Evidenz dokumentiert |
| 1 | G1 | vollständiges Web-/APK-Inventar, Audit-Recheck, Baseline | G0 | alle realen Routen/Screens und Zustände klassifiziert |
| 2 | G2 | Source of Truth, Paritäts-, Override- und Navigationsziele | G1 | jede Funktion hat Ziel, Status und Test-ID |
| 3 | G3 | repräsentative zugängliche Web-/Native-Flows | G2 | vier Welten, Zustände und Tagesphasen spezifiziert |
| 4 | G4 | minimale technische Regelwerks-/Buildmigration | G3 | reproduzierbare Builds ohne ungelöste Risiko-Warnungen |
| 5 | G5 | P0: vier Welten, lokale Tageszeit, Baum-/Wurzelebene | G4 | Datenwahrheit und deterministische Tests belegt |
| 6 | G6 | P1: Motion, Material, IA, Leerzustände | G5 | gleichwertige Web-/Native-Flows und Fallbacks |
| 7 | G7 | P2: Android-Feinschliff und Restlücken | G6 | keine ungeprüften Pflichtzeilen |
| 8 | G8 | integrierte Regression und Release Candidate | G7 | Builds, Verträge und Matrizen vollständig |
| 9 | G9 | vollständiger paarweiser RC-Paritätstest | G8 | jede anwendbare Matrixzeile bestanden |
| 10 | G10 | genau eine finale Smoke-/Abnahmerunde | G9 | Artefakte, Provenienz und Grenzen dokumentiert |

## Nicht ausführen ohne gesonderte Freigabe

Keine Veröffentlichung, kein Deployment, keine Store-/APK-Verteilung, keine produktive Migration, keine produktive Daten-/Rollen-/Billing-Änderung, kein Schlüsselwechsel und keine kostenpflichtige externe Aktion.

## Baseline-Budgets

Die verbindlichen Zielwerte sind LCP ≤ 2,5 s, INP ≤ 200 ms und CLS ≤ 0,1 unter dokumentierten Bedingungen. Android-Startzeit, RAM, APK-Größe, Netzwerkvolumen und Motion-FPS werden erst nach einem reproduzierbaren Geräte-/Profilbaseline gemessen; fehlende Messungen werden nicht als bestanden ausgegeben.

## Gate-0-Ausführung am 2026-09-27 16:29 CEST

- `pnpm test -- --reporter=dot`: **96 Testdateien, 378 Tests bestanden**.
- `pnpm check`: **bestanden**.
- `pnpm db:baseline:verify`: **bestanden**, 59 Migrationen und 59 Journal-Einträge, Baseline `0037_woozy_inertia.sql`, Head `0058_plain_santa_claus.sql`.
- Native-TypeScript und Android-Export waren bereits am Checkpoint `b9da0938` erfolgreich; das Exportartefakt ist kein installierbares APK.
- Das vollständige Routen-/Screen-Inventar liegt in `BLACKWATERLEAF_VERIFIED_INVENTORY_2026-09-27.md`.
