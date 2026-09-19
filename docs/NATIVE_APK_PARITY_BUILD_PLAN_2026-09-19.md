# BlackWaterLeaf Native APK – Paritätsplan

## Ziel

Der nächste Native-APK-Build darf ausschließlich aus dem geprüften aktuellen Quellstand entstehen. Die Native-App muss die Web-App nicht nur funktional, sondern auch in **Struktur, Farben, Icons, Texten, Navigation, Abständen und Zuständen** spiegeln. Es wird keine neue Hülle und kein separater Designstand gebaut.

## 1. Verbindliche Referenz

Die Web-App ist die alleinige visuelle Referenz. Vor dem Build werden folgende Web-Dateien als Sollstand geprüft:

- `client/src/components/AppShell.tsx` für Header, Drei-Striche-Menü und Bottom-Navigation.
- `client/src/index.css` für Farbtokens, Flächen, Rahmen, Schriftgrößen, Abstände und responsive Zustände.
- `client/src/pages/ProfileHome.tsx` für die Profilstruktur.
- Die jeweils zugehörigen Web-Seiten für Home, Botanik, Aquaristik, Terraristik, KI, Community, Marktplatz, Suche, Ranking und Einstellungen.

Native darf keine eigene Bedeutung für diese Elemente erfinden. Native Icons werden anhand ihrer Funktion und Position 1:1 gegen die Web-Icons abgebildet.

## 2. Header-Parität

Die Native-Kopfzeile wird auf dieselbe Reihenfolge wie Web gebracht:

1. Original-BlackWaterLeaf-Logo
2. BlackWaterLeaf-Name
3. Suche
4. Marktplatz
5. Benachrichtigungen
6. Drei-Striche-Profil-/Einstellungsmenü

Das bisherige Personen-Icon als Ersatz für das Drei-Striche-Menü wird entfernt. Der zusätzliche Native-Untertitel „PRIVATER BEREICH“ bleibt nicht dauerhaft im Header, wenn er im Web nicht vorhanden ist. Das Menü erhält dieselben Ziele und dieselbe Reihenfolge wie der Webstand: Profil, Heute/Pflege, Privatbereich, Anlagen, Fortschritt, Gespeichert, Datenschutz, Sprache/Einheiten und Werkzeuge.

## 3. Bottom-Navigation

Die Native-Bottom-Navigation wird exakt mit der Web-Navigation abgeglichen:

| Position | Web-Ziel | Web-Icon | Native-Ziel | Akzent |
|---|---|---|---|---|
| 1 | Home | `Home` | Home | Botanik |
| 2 | Entdecken | `Compass` | Suche/Wissensbereich | Botanik |
| 3 | Marktplatz | `ShoppingBag` | Marktplatz | Marktplatz |
| 4 | Community | `UsersRound` | Community | Botanik |
| 5 | Profil | `UserRound` | Profil | Botanik |
| 6 | Builder, nur Admin | `Ruler` | Builder | Aquaristik |

`storefront-outline` und `construct-outline` werden nicht mehr verwendet, wenn sie nicht dem Web-Sollicon entsprechen. Die aktive Farbe, inaktive Farbe, Strichstärke, Größe, Abstand und Beschriftung werden separat geprüft.

## 4. Profil-Parität

Die Native-Profilseite wird ausschließlich in dieser Reihenfolge ausgeliefert:

1. Kompakte Identitätskarte mit Originalbild, Name, E-Mail/Benutzername und Drei-Punkte-Aktion.
2. XP, Level und Anlagenanzahl aus echten API-Daten.
3. Bereich **Meine Anlagen & Werte**.
4. Direkte Auswahl für Botanik, Aquaristik und Terraristik.
5. Kompakter Bereich **Eigene Beiträge** mit Aktualisieren und Post-Aktion.
6. Bearbeitung, Datenschutz, Sprache, Einheiten, Anlagenverwaltung und Werkzeuge ausschließlich im Drei-Striche-Menü.

Der alte große Block **„IDENTITÄT BLEIBT VERIFIZIERT“**, das redundante Aktionsraster und wiederholte Einstellungsbereiche dürfen im finalen APK-Build nicht mehr enthalten sein.

## 5. Zentraler Farbvertrag

Native übernimmt dieselben Werte wie der Webstand:

- Botanik: `#C7F35B`
- Aquaristik: `#28D8FF`
- Terraristik: `#E1D661`
- KI: `#C36BFF`
- Marktplatz: `#D9AD69`
- Marktplatz-Champagne: `#F3D59C`
- Hintergrund: `#031108`
- Text: `#F3FFF5`
- Sekundärtext: `#9BB39F`

Die Werte werden nicht nur auf Rahmen angewendet. Für jeden Screen werden zusätzlich Hintergrund, Panel, aktive Buttons, Icons, Statuszustände, Ladezustände und Fehlermeldungen geprüft.

## 6. Screen-by-Screen-Abgleich

Vor dem Build erfolgt eine Prüfliste für:

- Home und Sensorbereich
- Botanik
- Aquaristik inklusive Channa-Katalog
- Terraristik
- KI/Pflanzenbestimmung
- Suche und Suchdetailseiten
- Community, Beiträge und Kommentare
- Marktplatz
- Profil und Drei-Striche-Unterseiten
- Benachrichtigungen
- Pflegebereich
- Ranking und Challenges
- Öffentliche Profile
- Gespeicherte Inhalte
- Builder für Administratoren

Für jeden Screen werden Pfad, Header, Farbton, Icon-Zuordnung, Loading-State, Error-State, Empty-State, Datenquelle und Rücknavigation geprüft.

## 7. Funktionale Abnahmetests

Der Build wird erst gestartet, wenn diese Tests erfolgreich sind:

- Native TypeScript-Prüfung.
- Native Android-Export.
- Web TypeScript-Prüfung und Produktionsbuild.
- `git diff --check`.
- Live-API-Smoke-Test gegen `https://blackwaterleaf.com`.
- Suche nach `Anubias` und `Channa`.
- Platform-Availability und KI-Verfügbarkeit.
- Community-Feed.
- Authentifizierter Profilabruf.
- Private Anlagen und Profilaktualisierung.
- Native APK-Bundle auf `https://blackwaterleaf.com` prüfen.
- APK-Versionscode gegenüber dem alten Build erhöhen.
- EAS-Projekt-ID und Expo-Owner vor dem Build prüfen.

## 8. Schutz gegen alten Stand

Vor dem EAS-Build werden automatisch protokolliert:

- Git-Commit und Checkpoint-Version.
- Expo-Projekt-ID und Owner.
- App-Version und Android-Versioncode.
- SHA-256 des Quellstands beziehungsweise des erzeugten APK-Artefakts.
- Zeitstempel des Builds.

Der alte APK-Link wird nicht erneut verwendet. Nach dem Build wird die neue APK heruntergeladen, lokal verifiziert und mit eigenem Dateinamen bereitgestellt.

## 9. Abnahme auf dem S23 Ultra

Nach der Bereitstellung wird auf dem Gerät geprüft:

1. Header-Icons und Reihenfolge.
2. Drei-Striche-Menü und alle Unterseiten.
3. Profilstruktur und direkte Anlagenauswahl.
4. Bottom-Navigation und aktive Farben.
5. KI-Einstieg und Ladeanimation.
6. Suche nach Pflanzen und Channa-Arten.
7. Community, Kommentare und private Profilgrenze.
8. Rückkehr von jeder Unterseite zum passenden Ziel.

Erst wenn diese Punkte bestätigt sind, gilt die APK als neuer verbindlicher Native-Stand.

## Aktueller Status

Der Native-Quellstand enthält bereits die korrigierte kompakte Profilstruktur und wurde technisch geprüft. Der neue EAS-APK-Build wird **erst nach Abschluss des Header-, Icon- und Screen-Abgleichs** gestartet. Der alte Build `034780bc-fae4-4d8e-8c7b-60c733a7faff` gilt nicht als finaler Paritätsstand.
