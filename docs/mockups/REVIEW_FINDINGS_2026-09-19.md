# BlackWaterLeaf Mockup Review – 19.09.2026

## Mobile

Das Mobile-Mockup setzt den privaten Bereich auf eine klare Hierarchie: kompakter Header, Identitätskarte, drei direkt auswählbare Habitat-Karten, danach ein eigener Beitragsbereich. Eigene Beiträge sind medienorientiert und zeigen Bearbeiten/Löschen nur am eigenen Inhalt. Die Bottom-Navigation bleibt stabil und nutzt einen einzigen aktiven Lime-Akzent. Für die echte App gilt: Aktualisierung erfolgt ausschließlich über Pull-to-Refresh; eine zusätzliche Aktualisieren-Schaltfläche gehört nicht in den privaten Bereich.

## Desktop

Das Desktop-Mockup überträgt dieselben Tokens in eine breite Struktur: linke Hauptnavigation, zentrale Entdecken-Fläche und eine kompakte rechte Profil-/Habitat-Spalte. Profil, Suche, Benachrichtigungen und Drei-Striche-Einstellungen sind getrennt. Private Einstellungen liegen nicht in der Profilübersicht. Das Layout priorisiert Bereiche und Inhalte vor langen Listen und vermeidet doppelte Aktionen.

## Umsetzungshinweise

Die Mockups sind eine Designrichtung und enthalten teilweise konzeptionelle Beispielinhalte. In der Implementierung dürfen ausschließlich echte Daten aus den bestehenden APIs erscheinen; leere Zustände bleiben explizit und ehrlich. Die gemeinsame Designgrundlage sind Forest-Black, Lime als Primärakzent, Cyan nur für Aquaristik, identische Icons und eine klare helle Textfarbe auf allen dunklen Flächen.

## Geprüfte Änderung

Der Web- und Native-Privatbereich enthält keinen manuellen Aktualisieren-Button mehr. Native verwendet den vorhandenen Pull-to-Refresh-Mechanismus. Die Webansicht lädt beim Öffnen; auf mobilen Browsern bleibt das native Browser-Pull-to-Refresh verfügbar.

## APK-Analyse

Geprüfte APK: `BlackWaterLeaf-native-corrected.apk`, Version 1.0.17, Android versionCode 17. API-Origin: `https://blackwaterleaf.com`. EAS-Projekt: `blackwaterleaf2s-team/bwl`. Der APK-Bundle enthält die aktuelle Native-Konfiguration und die korrigierte Profile-/Quellenlogik. Ein vollständiger visueller Geräteabgleich ist ohne laufendes physisches Gerät nicht möglich; die statischen Bundle- und Exportprüfungen waren erfolgreich.

## Bekannte Datenlage

Der Live-Endpunkt `knowledge.listPublished` antwortet derzeit mit einer leeren Liste. Daher werden keine Quellenkarten oder erfundenen Quellen angezeigt. Für die internationale Wissensansicht müssen später echte, serverseitig veröffentlichte und zitierfähige Artikel importiert werden.

## Web-Analyse

Der Webstand baut erfolgreich. Der Profilbereich enthält Identität, XP/Level, direkte Habitat-Auswahl und eigene Beiträge. Der manuelle Aktualisieren-Button wurde entfernt; der Beitrag-CTA bleibt bestehen. Datenschutz, Sprache und Werkzeuge bleiben außerhalb der Profilübersicht im Drei-Striche-Menü.

## Designpriorität

1. Gemeinsame Tokens für Web und Native zentralisieren.
2. Profil als kompakter Hub statt als Einstellungscontainer.
3. Pull-to-Refresh als einziger manueller Reload im privaten Bereich.
4. Medienorientierter Feed mit klaren Eigentümeraktionen.
5. Echte Daten und klare Leerzustände statt Platzhalter.
6. Suche und Katalog als schnelle, filterbare Oberflächen ohne unnötige KI-Aufrufe.
7. Accessibility: Kontrast, Touch-Ziele, sichtbare Zustände und verständliche Fehlertexte.

Quelle der visuellen Richtung: BlackWaterLeaf-Referenzscreenshots und die aktuelle Web-/Native-Codebasis. Externe Forenforschung wird nach Abschluss der Workflow-Recherche in den Designbericht ergänzt.

## Mockups

- `blackwaterleaf-pro-design-mobile.png`
- `blackwaterleaf-pro-design-desktop.png`
