# BlackWaterLeaf Observatory Portal — verbindliche Designquelle

## Verbindliche Referenz — kein Mischdesign

Die **Observatory-Portal-Referenz ist ab sofort die einzige gültige Designquelle** für BlackWaterLeaf Web und Native. Das frühere Mockup, Legacy-Layout, alte Kartenraster, frühere Header-/Footer-Varianten und daraus abgeleitete Zwischenlösungen sind verworfen und dürfen nicht mehr als visuelle Referenz, Fallback oder Mischbestandteil verwendet werden. Bestehende Funktionen, Daten, Authentifizierung, Datenschutz, Rollen, Community, Marktplatz und KI werden vollständig in diese eine visuelle und strukturelle Sprache überführt.

Bei einem Konflikt gilt ausschließlich diese Datei und die aktuelle Observatory-Portal-Referenz. Ein Bereich gilt nicht als fertig, wenn er nur durch globale CSS-Überlagerung ähnlich aussieht; seine eigene Seitenstruktur, Hierarchie, Zustände und Navigation müssen dem Portalmodell entsprechen.

## Leitidee

BlackWaterLeaf wirkt wie ein Portal in eine lebendige wissenschaftliche Naturwelt: dunkel, tief, hochwertig, naturverbunden und datenorientiert. Das Design darf emotional sein, aber niemals wie ein beliebiger Entertainment-Feed wirken.

## Gemeinsame Struktur Web und Native

Web und Native verwenden dieselbe Informationsarchitektur, dieselben Begriffe, dieselbe Reihenfolge der Kernaktionen, dieselben Zustände, dieselben Bildmotive, dieselben Farbtöne und dieselben Icon-Bedeutungen. Nur die Anordnung wird an Desktop beziehungsweise Touch angepasst. Native wird als echte Expo-Oberfläche umgesetzt und niemals als WebView- oder Screenshot-Hülle.

Die Primärnavigation lautet: **Entdecken, Karte, Erfassen, Katalog, Profil**. Community, Marktplatz, KI und Live sind kontextuell aus Entdecken, Erfassen und den jeweiligen Fachbereichen erreichbar und dürfen nicht als unverbundene Sonderseiten erscheinen.

## Portalaufbau

Jede Hauptseite besitzt:

1. einen gemeinsamen Portal-Header mit Logo, globaler Suche, Benachrichtigungen und Profil;
2. einen bereichsspezifischen Hero-Banner mit Naturbild und kurzer fachlicher Aussage;
3. kompakte Portal-Karten für Botanik, Aquaristik, Terraristik, KI, Community und Marktplatz;
4. einen sichtbaren Quellen-/Evidenzbereich, wenn fachliche Inhalte angezeigt werden;
5. klare Lade-, Fehler-, Leer-, Offline- und Datenschutz-Zustände;
6. eine alternative Listenansicht, falls Karten oder Live-Medien nicht verfügbar sind.

## Farbsystem

Der globale Hintergrund bleibt tiefes Schwarzgrün. Text ist warmweiß. Primärer Akzent ist Blatt-Limette für aktive Zustände, bestätigte Aktionen und wichtige CTAs. Aqua-Cyan ist ausschließlich für Aquaristik, Live-Kamera, technische Analyse und Wasserbezug reserviert. Rot ist ausschließlich für Live-Status, Warnung oder Löschung. Karten erhalten keine blauen Standardrahmen.

Botanik nutzt Blatt-Limette und Waldgrün. Aquaristik nutzt Aqua-Cyan auf derselben dunklen Basis. Terraristik nutzt Moos-/Farn-Grün mit warmem Naturakzent. KI nutzt eine kontrollierte Mischung aus Blatt-Limette und Aqua-Cyan, niemals einen fremden Neon-Look. Profil und Marktplatz bleiben neutral im gemeinsamen Portalton.

## Community-Feed

Der Community-Feed ist vertikal und fokussiert wie TikTok, aber fachlich kuratiert. Ein Beitrag zeigt immer Bereich, Autor, Zeit, Sichtbarkeit, Medien, Quellen-/Evidenzstatus und Interaktionen. Unterstützt werden Bilder, Aquarium-/Habitat-Videos, Kommentare, Antworten, Speichern, Melden, Bearbeiten und owner-scoped Löschen. Community-Live ist ein moderiertes Fachformat, keine beliebige Viralfläche.

## Live

Es gibt zwei klar getrennte Live-Funktionen:

- **Live-Erkennung:** Kamera für Pflanze, Fisch oder Habitat mit Qualitätsanzeige, Analysefortschritt, Kandidaten, Unsicherheit und Datenschutz.
- **Community-Live:** moderierte wissenschaftliche Session mit Thema, Host, Realm, Zuschauerzahl, angehefteten Fakten, Quellen, Live-Fragen, Replay und Melden.

Live darf keine private Anlage, exakte Ortsdaten oder unveröffentlichte KI-Informationen automatisch öffentlich machen.

## KI und Quellen

Normale Suche, Synonyme, Taxonomie, Filter, Katalog und Marktplatz laufen ohne LLM. KI wird nur für Bildbestimmung, uneindeutige Fragen und fachliche Synthese genutzt. Jede KI-Antwort erscheint strukturiert als Hypothese mit Kandidaten, Konfidenz, sichtbaren Merkmalen, Quellen, PlantNet-/Zweitprüfung, Sicherheitsnotizen und Möglichkeit zur Korrektur.

Rohes JSON, unformatierte Arrays, lange Kommafolgen und technisch sichtbare Platzhalter sind in der Nutzeransicht verboten.

## Marktplatz

Der Marktplatz bleibt eine transparente Vermittlungs- und Discovery-Fläche. Produkte, Händler, Partnerhinweise, Sponsoring und externe Ziele werden klar gekennzeichnet. Marktplatzinhalte dürfen wissenschaftliche Evidenz nicht imitieren und erhalten keine fachliche Bestätigung nur wegen kommerzieller Platzierung.

## Profil und Privatsphäre

Das Profil bleibt auf Identität, Bio, eigene öffentliche Beiträge, Score und sichtbare Anlagen reduziert. Datenschutz, Sprache, Einheiten, Werkzeuge, Anlagenverwaltung und weitere Einstellungen liegen ausschließlich im Drei-Striche-Menü beziehungsweise auf eigenen Unterseiten. Private Inhalte erscheinen nur angemeldeten Eigentümern.

## Zustände und Qualität

Jede Aktion erhält sichtbares Feedback. Pull-to-Refresh ist für private Listen und Feeds die Standardaktualisierung; überflüssige Aktualisieren-Buttons werden vermieden. Keine Fake-Daten, keine Scheinantworten, keine unverbundenen Buttons, keine unlesbaren Overlays und keine WebView-Native-Hülle.

## Abnahme

Ein Release ist erst abnahmefähig, wenn Web und Native in Sprache, Farbton, Icon-Bedeutung, Route, Ladezustand, Datenzugriff, Privatsphäre und Kernfunktion 1:1 übereinstimmen. Jede Hauptseite wird visuell einzeln geprüft; ein geänderter Startbildschirm gilt nicht als Nachweis für geänderte Unterseiten. Die bestehenden Funktionen werden erhalten und in diese Regeln eingepasst; bei Konflikten gilt diese Observatory-Regel als führend.
