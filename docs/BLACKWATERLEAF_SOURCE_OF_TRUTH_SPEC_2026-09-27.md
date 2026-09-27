# BlackWaterLeaf – gemeinsame Source-of-Truth-Spezifikation

**Status:** Zieldefinition für Gate 2; keine Behauptung vollständiger Umsetzung.

## Fachliche Wahrheit

- Server-/Drizzle-Daten und versionierte tRPC-Verträge sind autoritativ für Inhalte, IDs, Rollen, Entitlements, Sichtbarkeit und Status.
- Web und Native dürfen keine Ersatzwerte, Fake-Aktivitäten, simulierten Messwerte oder erfundenen KI-Ergebnisse ergänzen.
- Private Standorte, Anlagen, Nachrichten und unveröffentlichte Inhalte bleiben geschützt.
- Ein fehlender Dienst oder Datensatz wird als Loading/Empty/Error/Unavailable mit konkreter Ursache dargestellt.

## Vier semantische Welten

| Welt | Primärakzent | Semantik | Nicht verwenden |
|---|---|---|---|
| Botanik | Blatt-/Limegrün | Pflanzen, Wachstum, Pflege | allgemeiner Erfolg für jede Aktion |
| Aquaristik | Wasserblau/Cyan | Wasser, Becken, Fische, Karten | KI- oder Erfolgsstatus |
| Terraristik | warmes Moos-/Regenwaldgrün, Amber/goldgrün | Terrarien, Vegetation, Lebensraum | beliebiges Gelb-/Orange-Theme |
| KI | tiefes Violett/Indigo mit kontrolliertem Magenta/Cyan | KI-Aktion, Analyse, Provenienz, Unsicherheit | globaler Status, Erfolg, Bereitschaft |

Statusfarben bleiben orthogonal: Erfolg, Warnung, Fehler und Information erhalten immer Text/Icon/Form und werden nicht nur farblich erklärt.

## Tageszeit

Standardfenster: Morgendämmerung 05–07, Sonnenaufgang 07–09, Tag 09–17, Sonnenuntergang 17–20, Nacht 20–05. Quelle ist lokale Gerätezeit und Zeitzone; keine Standortberechtigung nur für Atmosphäre. Navigation, Inhalt, Rollen und Status ändern sich nicht. Die Einstellung kann Atmosphäre reduzieren/deaktivieren. Kaltstart, Vordergrund, Mitternacht, DST und Zeitzonenwechsel werden deterministisch getestet.

## Baum-/Wurzelebene

Nur reale idempotente Ereignisse dürfen Wachstum/Progression speisen. Ohne belastbare Datenbasis gilt die ehrliche atmosphärische Variante ohne Fortschrittsbehauptung. Keine Strafen, Streaks, Hintergrundverfolgung oder neuen Gamification-Datenmodelle ohne gesonderten Auftrag.

## Gemeinsame UI-/Statusregeln

1. Aufgabe und Status vor Atmosphäre.
2. Opake Leseflächen für scrollende Inhalte, Formulare, Dialoge und Navigation.
3. Glas höchstens als kleine, nicht scrollende Kontextfläche mit No-Blur-Fallback.
4. Web: Tastatur, Fokus, Skip-Link, WCAG 2.2 AA; Native: Semantik, TalkBack, Dynamic Type, mindestens 48 dp Touchziel wo möglich.
5. Jede Aktion besitzt Loading, Empty, Error, Offline/Retry, Success und Permission-/Session-Zustand soweit anwendbar.
6. Reduced Motion deaktiviert nicht notwendige Bewegung; Uploadfortschritt bleibt als statischer Status verständlich.

## Terminologie

Deutsch ist Primärsprache: `Entdecken`, `Karte`, `Erfassen`, `Katalog`, `Community`, `Profil`, `Botanik`, `Aquaristik`, `Terraristik`, `KI-gestützt`, `Privat`, `Öffentlich`, `Sicher hochladen`, `Full-Abo`, `Free`. Web und Native verwenden dieselben Begriffe; technische Fehlercodes erscheinen nur zusätzlich in Logs.

## API-/Vertragsregel

Web nutzt tRPC-Hooks. Native nutzt den bestehenden API-Adapter; jede Paritätslücke wird über gemeinsame versionierte Contract-Tests geschlossen, ohne ungeprüften Frameworkwechsel. Rollen- und Entitlement-Prüfung bleibt serverseitig.

## Offene Entscheidung/Gate

Die fehlenden Premium-/Website-Audit-Quelldateien müssen vor einer vollständigen Abdeckung gegen diese Quellen bereitgestellt werden. Bis dahin bleibt Gate 1/2 für diese Zeilen blockiert.
