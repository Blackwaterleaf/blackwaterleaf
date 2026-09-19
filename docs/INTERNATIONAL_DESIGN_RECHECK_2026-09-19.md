# BlackWaterLeaf: International Design Recheck – verbindliche Grundlage für vier Varianten

**Stand:** 19. September 2026  
**Autor:** Manus AI  
**Geltung:** Neue Web-/PWA- und Native-Varianten für Desktop und Handy  
**Entscheidungsstatus:** Verbindliche Designbasis; fachliche Schutz- und Rechtsregeln bleiben vor Implementierung separat zu validieren.

## Entscheidung in einem Satz

BlackWaterLeaf wird als **atmosphärisches Naturportal mit nachvollziehbarer Fachlichkeit** gestaltet: Eine dauerhaft verständliche Navigation führt zu einem global durchsuchbaren Katalog mit gleichwertiger Karten- und Listenansicht, zu privaten oder bewusst freigegebenen Beobachtungen und zu einer Community, während Botanik, Aquaristik, Terraristik und KI-Bestimmung ihre eigene Bild- und Aufgabenlogik behalten. Die vier Varianten unterscheiden sich in ihrem Einstieg und ihrer visuellen Gewichtung, **nicht** bei Datenwahrheit, Navigation, Zugänglichkeit, Quellenpflicht oder Datenschutz.

Diese Richtung ist belastbar, weil sie von unabhängigen normativen Plattformleitfäden, Accessibility-Standards, internationalen Naturprodukten und Datenqualitätsquellen übereinstimmend getragen wird: stabile Ziele und wiederherstellbarer Zustand, sichtbare Suche, gleichwertige textliche Karte-Alternative, überprüfbare KI, kontextuelle Einwilligung sowie semantisch zugängliche Komponenten. [1] [20] [38] [60] [78]

> **Leitregel:** Privat ist der Ausgangspunkt. Eine Veröffentlichung ist eine bewusste, verständliche und reversibel verwaltbare Freigabe. Eine KI-Antwort ist ein Vorschlag. Ein Quellenhinweis und ein sichtbarer Datenstand gehören zu fachlich relevanten Aussagen.

---

## 1. Evidenzentscheidung: Was mehrfach belegt ist – und was nicht

Die Evidenz wird nach ihrer Art gewichtet. Offizielle Accessibility-, Plattform- und Datenqualitätsstandards definieren harte Qualitätsgrenzen. Die offiziellen Produkte iNaturalist, eBird und Pl@ntNet belegen domänenspezifische, international bewährte Arbeitsabläufe. Öffentliche Foren, Issue-Tracker und Diskussionsbeiträge liefern ausschließlich Warnsignale und Implementierungshinweise. Sie werden nicht als Mehrheitsmeinung, Produktanforderung oder Ersatz für Forschung behandelt.

| Evidenzklasse | Verwendung in diesem Bericht | Quellenfamilien |
|---|---|---|
| **Normativ bzw. direkt prüfbar** | Verbindliche Accessibility-, Interaktions-, Datenschutz- und Internationalisierungsanforderungen. | Apple HIG und Accessibility, Material 3/Android, Fluent/Microsoft, WCAG, GBIF. [1] [20] [38] [76] [78] |
| **Domänenpraktisch belastbar** | Verbindliche Produktmuster für Beobachtung, Geoprivacy, Katalog, Offline und assistive Bestimmung. | iNaturalist, eBird, Pl@ntNet, GBIF. [60] [63] [67] [72] [74] [76] |
| **Kontext, nicht normativ** | Risiken, Hypothesen und gezielt zu testende Details. Niemals alleinige Entscheidungsbasis. | Apple-/Fluent-/iNaturalist-Foren, Google Issue Tracker, Reddit, UX StackExchange, Figma. [18] [19] [37] [58] [64] [79] [89] |

### 1.1 Verbindlich zu übernehmen

| Muster | Warum es belastbar ist | Verbindliche BlackWaterLeaf-Entscheidung |
|---|---|---|
| **Wenige stabile, benannte Hauptziele** | Apple, Android/Material und Fluent verlangen klare, begrenzte Navigation; Produktquellen zeigen, dass Suche, Karte und Katalog nicht versteckt werden dürfen. [4] [20] [38] [60] | Die fünf vorhandenen Hauptziele bleiben über alle Varianten, Bildschirmgrößen und Zustände stabil. Navigation wechselt nicht durch A/B-Experimente ihre Bedeutung oder Position.
| **Suche, Liste und Karte als zusammenhängender Recherchefluss** | Apple, Material, Fluent, WCAG und Naturprodukte verlangen sichtbare Suche, explizite Filter sowie einen alternativen Zugang zu Karteninformation. [6] [24] [41] [60] [80] | `Entdecken` enthält immer Suche, Katalogliste und Karte als synchronisierte Ansichten desselben Suchzustands. Die Karte ist nie der einzige Weg zu einem Objekt.
| **Karten nur mit Schutz- und Textalternative** | Plattformleitfäden fordern keine ausschließlich visuelle Interaktion; iNaturalist/eBird belegen Standortschutz und GBIF dokumentiert Scheingenauigkeit als Datenqualitätsrisiko. [9] [31] [60] [63] [70] [77] | Jeder Marker hat eine zugängliche Listenzeile; jeder geschützte oder unbekannte Ort erhält einen Textstatus. Öffentliche Genauigkeit und private Präzision sind getrennte Felder.
| **KI als überprüfbarer Vorschlag** | Apple und Microsoft verlangen Kennzeichnung, menschliche Kontrolle und Grenzen; iNaturalist und Pl@ntNet führen Kandidaten und Community-Review statt automatischer Wahrheit vor. [10] [44] [63] [66] | KI identifiziert nicht automatisch und veröffentlicht nicht automatisch. Sie zeigt Kandidaten, Unsicherheit, Eingaben, Daten-/Modellstand, Quellen und die Aktionen Bearbeiten, Verwerfen, Manuell suchen sowie Zur Prüfung speichern.
| **Privacy by default und kontextuelle Einwilligung** | Apple, Android, Microsoft sowie iNaturalist/eBird verlangen Datensparsamkeit und verständliche, situationsbezogene Freigaben. [16] [35] [53] [63] [70] | Neue Logs und Beobachtungen sind privat. Kamera, Mediathek, Standort und Cloud-KI werden erst am konkreten Auslöser angefragt und getrennt erklärt.
| **Semantik statt Farbe oder Geste allein** | Alle großen Plattformquellen verlangen Kontrast, nichtfarbliche Zustände, ausreichende Ziele, Fokus, Tastatur und Screenreader-Semantik. [3] [21] [49] [78] [87] | Status erscheint immer als Text plus Icon/Form und, nur ergänzend, Farbe. Jede Swipe-, Long-Press- oder Kartenaktion besitzt eine sichtbare, fokussierbare Alternative.
| **Reflow, Skalierung und internationale Schreibsysteme** | Apple, Android, Fluent und Material behandeln dynamischen Text, Reflow, RTL und Lokalisierung als Ausgangsbedingung. [13] [29] [34] [48] | Desktop und Handy unterstützen lange wissenschaftliche Namen, lokale Namen, Übersetzungen, 200-%-Textgröße, 400-%-Reflow/320 CSS-Pixel und RTL ohne Informationsverlust.
| **Lokale, wahrheitsgemäße Warte- und Fehlerzustände** | Apple, Material und Fluent unterscheiden kurze, lange, bestimmte und unbestimmte Wartezeiten; Pl@ntNet zeigt den Nutzen eines expliziten Offline-Entwurfs. [14] [27] [51] [68] | Bestehender Inhalt bleibt bei Refresh sichtbar. Upload, Synchronisierung und KI zeigen Phase, echten Fortschritt, Abbrechen/Wiederholen und eine ansagbare Statusänderung; Offline speichert lokal und publiziert niemals still.
| **Quellen, Lizenz und Datenstand am Fachobjekt** | GBIF fordert Herkunft, Identifikatoren, Lizenz und Qualitätsmetadaten; Microsoft fordert Quellen/Belege in assistiver KI; Naturprodukte machen Qualität und Review sichtbar. [45] [74] [75] | Taxon-, Wissens-, Beobachtungs- und KI-Details besitzen einen einsehbaren Quellenblock mit Ursprung, Version/Datum, Lizenz und Evidenz- beziehungsweise Prüfstatus.

### 1.2 Nicht als verbindliche Regel übernehmen

| Nicht übernommene Annahme | Grund der Ablehnung | Zulässiger Umgang |
|---|---|---|
| **Exakte Zahl, Reihenfolge oder Art der Tabs aus einer einzigen Plattform** | Apple, Android/Material und Fluent empfehlen unterschiedliche konkrete Navigationsformen. Mehrquellenkonsens besteht für Klarheit und Stabilität, nicht für eine universelle Tabzahl. [4] [20] [38] | Der bestehende BlackWaterLeaf-Vertrag mit fünf Zielen gilt. Neue Ziele werden nicht als zusätzlicher Tab eingeführt, sondern als klarer Kontextweg.
| **Desktop-Sidebar als pauschal bessere Lösung** | Sidebars sind auf großen Fenstern nützlich, können aber bei großer Schrift wertvolle Breite entziehen; die vorliegende BlackWaterLeaf-Referenz bindet eine schwebende Bottom Navigation. [5] [70] | Keine zweite konkurrierende Primärnavigation. Desktop erhält eine strukturierte Kopfzeile und die vorhandene, beschriftete Hauptnavigation; eine Kontextleiste darf nur sekundäre Filter oder Abschnittslinks enthalten.
| **Expressive Motion, dekorative Wellen oder starke Dark Themes als Nutzwert** | Der Android-Designbeitrag ist eine aktuelle Designrichtung, keine normative Anforderung. [36] | Naturmaterial und kontrollierte Bewegung bleiben möglich, müssen aber `Reduce Motion`, Fokus, Lesbarkeit und Ladezeit untergeordnet sein.
| **Endlosfeed, Autoplay, intransparente Personalisierung oder Rankings als Kernmechanik** | Forumserfahrungen warnen vor manipulativer Verweildauer; keine starke Mehrquellenevidenz fordert dies für Naturwissen. [82] | Entdecken nutzt erklärbare Sortierung, Abschnittsenden und Steuerung. Follows, Empfehlungen und Rankings sind später testbare Erweiterungen, kein Startvertrag.
| **Öffentliche exakte Pins als Standard oder reine visuelle Unschärfe als Schutz** | Geoprivacy ist domänen- und risikobezogen; ein grober Punkt kann weiterhin sensible Informationen zeigen. [60] [61] [74] [85] | Standortschutz wird durch fachlich beschlossene Taxon- und Moderationsregeln ergänzt. Es darf kein Sicherheitsversprechen allein aus einem Kartenstil abgeleitet werden.
| **KI-Chat als einzige Interaktion oder eine Konfidenzzahl als Bestätigung** | Öffentliche KI-Erfahrungen sind nicht normativ; offizielle und Produktquellen verlangen Prüfung und Alternativen. [10] [44] [63] [84] | Ein manueller Katalogweg bleibt vollständig. Konfidenz ist eine Unsicherheitsinformation, kein Qualitätssiegel.
| **Technische Einzelmeinungen aus Issue-Tracker oder GitHub als Architekturvorgabe** | Diese Beiträge behandeln konkrete Versionen, Implementierungen oder Einzelfälle. [37] [55] [56] [57] | Komplexe Semantik, Theme-Assets, Grid-Virtualisierung und Hydration werden im echten Stack getestet; die Diskussionen begründen keine Produktregel.
| **Forumsposts als internationale Nutzerforschung** | Die Beiträge sind selektiv, sprachlich/regional begrenzt und anekdotisch. [18] [19] [70] [79] [92] | Sie ergänzen die Testliste, ersetzen aber keine moderierten Tests mit BlackWaterLeaf-Zielgruppen.

---

## 2. Vorrang und gemeinsamer Produktvertrag

Diese Synthese gestaltet neue Varianten, ohne bestehende Produktwahrheit zu überschreiben. Bei Konflikten gilt: erst die serverseitige Sicherheits-, Rollen-, Sichtbarkeits- und Datenwahrheit; danach der bestehende Web-/Native-Paritätsvertrag; danach die verbindliche visuelle Referenz; erst dann diese Variantenbasis. Eine attraktive Variante darf weder reale Statuswerte erfinden noch eine unfreigegebene KI, ein öffentliches Profil, einen genauen Ort oder eine Fachbestätigung vortäuschen.

### 2.1 Gemeinsame Informationsarchitektur aller vier Varianten

Die vorhandenen Hauptziele bleiben der stabile Vertrag: **Portal**, **Entdecken**, **Marktplatz**, **Community** und **Profil**. Die Benennung `Portal` beschreibt die bestehende Home-Funktion und schafft das geforderte Portalgefühl, ohne einen sechsten Tab einzuführen. Der Marktplatz bleibt eindeutig als Partner- und Discovery-Oberfläche gekennzeichnet; er ist kein fachlicher Wahrheitsbeleg und kein Ersatz für Quellen.

`Entdecken` ist keine diffuse Feed-Seite. Es ist der globale Recherchebereich und enthält die gleichwertigen, zustandsgleichen Ansichten **Suchen**, **Katalog**, **Karte** und **Gespeicherte Suche**. Auf einem Detail führt Zurück immer in genau dieselbe Anfrage, Filterkombination, Sortierung, Ansichtsart, Kartenposition und Listenposition zurück. Die globale Suche ist in der Kopfzeile aller Hauptbereiche sichtbar oder über eine klar beschriftete Aktion erreichbar. Die Aktion **Moment erfassen** beziehungsweise **Beobachtung hinzufügen** ist eine prominente Kontextaktion, aber niemals ein Navigationstab. [4] [6] [20] [42]

| Ebene | Vertrag | Desktop | Handy |
|---|---|---|---|
| **Primärnavigation** | Genau fünf beständige Ziele: Portal, Entdecken, Marktplatz, Community, Profil. Aktiver Zustand mit Label, Form/Icon und Farbe. | Beschriftete schwebende Bottom Navigation bleibt sichtbar; Kopfzeile dient Suche und Dienstaktionen. Eine optionale Seitenkontextleiste enthält keine zweite Primärnavigation. | Beschriftete schwebende Bottom Navigation mit mindestens 48 CSS-Pixel hohen Zielen; Labels bleiben auch bei großer Schrift verfügbar.
| **Globale Suche** | Durchsucht Arten/Taxa, Synonyme, Orte, Beiträge, Personen/Organisationen und veröffentlichte Wissensinhalte. | Permanentes, benanntes Suchfeld im Header; `/` fokussiert das Feld, ohne Formularfelder zu stören. | Klar benannte Suchaktion im Header und vollständige Suchseite mit Eingabefokus; kein unbeschriftetes Lupen-Only-Muster.
| **Sekundärnavigation in Entdecken** | Suche, Katalog, Karte und gespeicherte Ansichten teilen Query, Filter, Sortierung und Trefferzahl. | Tab-/Segmentsteuerung plus sichtbare Filterleiste; Liste und Karte dürfen bei ausreichender Breite nebeneinander stehen. | Vollbreite segmentierte Steuerung; Karte und Liste wechseln ohne Verlust von Anfrage oder Filterchips.
| **Erfassen** | Privat beginnen; Sichtbarkeit, Ort, Medien und KI werden gezielt entschieden. | Primäre Header-/Portalaktion und kontextuelle Aktion in Weltseiten. | Primärer Button am Portal und in den Weltseiten; keine verdeckte Long-Press-Abkürzung als einziger Zugang.
| **Detail und Rückweg** | URL/Deep Link zeigt nur freigegebene Daten; Zurück bewahrt Herkunft und Recherchekontext. | Browser Zurück/Vorwärts sowie Tastatur funktionieren wie sichtbare Rückwege. | Nativer Back-Stack; Rückkehrfokus auf Seitentitel oder sinnvollsten Inhalt, nie auf unsichtbare Reste.

### 2.2 Gemeinsame Sprache für die drei Fachwelten

Botanik, Aquaristik und Terraristik haben eigene Inhalte und Eingaben, verwenden aber denselben Beobachtungs- und Sichtbarkeitskern. Dadurch kann die Oberfläche eine Pflanze, einen Wasserwert und ein Terrarium nicht fälschlich als dieselbe Fachfrage darstellen, hält aber Eigentum, Evidenz, Offline-Sync, Freigabe und Moderation konsistent.

| Welt | Primärer privater Nutzen | Öffentlicher/fachlicher Nutzen | Erforderliche Wahrheit in der Oberfläche |
|---|---|---|---|
| **Botanik** | Pflanze, Pflege, Foto, Notiz, Standort/Umgebung und Verlauf dokumentieren. | Taxon recherchieren, Beobachtung oder Fachfrage mit Evidenz teilen. | Wissenschaftlicher und lokaler Name, Taxonrang, Evidenzstatus, Quellen, Standortschutz und Zeitstand.
| **Aquaristik** | Becken, Wasserwerte, Pflegeereignis, Medien und private Historie führen. | Werte oder Probleme als kontrollierte Fachfrage teilen. | Keine erfundenen Echtzeitwerte; `0` bleibt ein echter Wert; nicht verbundene Geräte werden als nicht verbunden gezeigt.
| **Terraristik** | Terrarium, Besatz/Organismen, Klima, Substrat, Foto und Pflege dokumentieren. | Art-, Haltungs- oder Diagnosefrage mit klarer Evidenz stellen. | Keine pauschale Haltungszusage; Sichtbarkeit privater Anlagen getrennt von öffentlichen Beiträgen.
| **KI-Bestimmung** | Bild/Notiz als optionaler Analyseinput nutzen. | Kandidaten prüfen, korrigieren und als Entwurf zur Community oder Fachprüfung geben. | Modell-/Datenstand, verwendete Eingaben, Unsicherheit, Alternativen, Quellen und manueller Ausweg.

---

## 3. Verbindliche Komponentenbasis für jede Variante

Die Varianten dürfen Bildmaterial, Komposition und Einstieg priorisieren. Die folgenden Komponenten und Verhaltensregeln sind jedoch nicht optional.

### 3.1 Portalgefühl und Naturbezug

Jede Startseite beginnt mit der Originalmarke, einer ruhigen, bildgestützten Naturwelt und einem klaren nächsten Schritt. Das Portal ist kein leerer Dashboard-Rahmen und kein manipulativer Feed. Es verbindet die vier Fachwelten über einen zentralen Blattkern und vier eindeutige Weltkarten: **Botanik**, **Aquaristik**, **Terraristik** und **KI-Bestimmung**. Bildflächen sind immer mit einer dunklen, kontrastgeprüften Überblendung versehen. Der Titel, die Aufgabe und die primäre Aktion bleiben über dem Bild lesbar. Dekorative Naturbilder werden vor Screenreadern verborgen; bedeutungstragende Medien erhalten sachliche Alternativtexte. [3] [23] [49]

Die bestehende Farbsemantik wird beibehalten: Blattgrün `#C7F35B` für Botanik, Foto, Community, Profil und Wissen; Cyan `#28D8FF` für Aquaristik und Live; warmes Terrariumgelb `#E1D661` für Terraristik; Violett `#C36BFF` für KI. Diese Farben codieren einen Bereich, niemals allein eine Qualität, Gefahr, Freigabe oder Auswahl. Status verwendet zusätzlich ein Wort und ein Icon, beispielsweise **„Prüfung erforderlich“** mit Hinweis-Symbol oder **„Standort verschleiert“** mit Karten-/Schildsymbol. [12] [31] [46] [78]

### 3.2 Profil und Vertrauenszentrum

`Profil` trennt ein **öffentliches Profil** strikt von **Konto & Datenschutz**. Das öffentliche Profil enthält nur bewusst freigegebene Identität, Bio, Fachinteressen, Beiträge, Sammlungen und optional erklärte Rollen-/Verifikationshinweise. Der private Bereich enthält Konto, Sichtbarkeit, Benachrichtigungen, Datenexport, Löschung, KI-Einwilligungen und Medien-/Standorteinstellungen. Avatare ergänzen Namen, ersetzen sie aber nicht. Jede Sichtbarkeitsänderung beschreibt Empfänger, Standortpräzision und Wirkung vor dem Speichern. [17] [32] [40] [62]

| Funktion | Desktop-Ausführung | Handy-Ausführung |
|---|---|---|
| Öffentliche Profilansicht | Profilkopf mit Name, Rolle als Text, optionalem Badge, Beiträgen und Sammlungen; privater Bearbeiten-Zugang nur für Eigentümer. | Einspaltiger Profilkopf, klarer `Profil bearbeiten`-Button; Avatar ist nicht die alleinige Navigation.
| Datenschutz & Sichtbarkeit | Eigener Abschnitt mit pro Kategorie sichtbarem Status, Empfängervorschau, Export/Löschung und Änderungsprotokoll. | Schrittweise Einstellungslisten mit klaren Zuständen; keine verschachtelten Dialoge bei Widerruf oder Löschung.
| Veröffentlichungsvorschau | Seitliches Review vor Senden: „öffentlich/Gruppe/privat“, Foto-Metadaten, sichtbarer Ort und Lizenz. | Vollbreiter Review-Schritt vor `Veröffentlichen`; Änderungen kehren ohne Datenverlust zum Formular zurück.
| Konto | Anmeldung erst bei geschützter Aktion; Wert der Anmeldung erklären. | Gleiches Verhalten; Passkey und plattformgerechte Anmeldung sind dem Passwortzwang vorzuziehen, wenn angeboten.

### 3.3 Botanik, Aquaristik und Terraristik

Die Weltseiten nutzen dieselbe klare Folge: **Welt verstehen → privaten Bestand oder Moment öffnen → Fachwissen/Katalog erreichen → optionalen KI- oder Communitypfad wählen**. Sie dürfen weder reine Bildgalerien noch generische Kachel-Dashboards sein. Jede Karte hat genau eine offensichtliche primäre Aktion. Wenn zusätzliche Aktionen nötig sind, liegen sie als sichtbare Einzelaktionen oder im klar bezeichneten Mehr-Menü vor, nicht als verschachtelte Buttons in einer vollständig klickbaren Karte. [8] [24] [41]

| Bereich | Verbindliche Weltkarten | Desktop | Handy |
|---|---|---|---|
| **Botanik** | Meine Pflanzen, Pflanze hinzufügen, Pflanze bestimmen, Pflegewissen. | Großes Pflanzenhero; darunter das bestehende 2×2-Kartenmuster. Eine optionale rechte Kontextspalte zeigt aktive private Aufgabe oder Katalogauszug, nie Fake-Daten. | Hero, dann unverändertes 2×2-Kartenmuster. Lange Namen umbrechen; keine abgeschnittenen Taxa oder Buttons.
| **Aquaristik** | Meine Aquarien, Aquarium hinzufügen, Wasserwerte, KI zur Aquaristik. | Unterwasserhero und 2×2-Karten; Datenfläche nur aus realen oder ehrlich fehlenden Werten. | Hero und 2×2-Karten. Wasserwerte sind Listen-/Formularelemente mit Einheit und Messzeit, nicht nur Diagrammfarbe.
| **Terraristik** | Terrarium fotografieren, Terrarium entdecken, Wissen, KI fragen. | Feuchtwaldhero und 2×2-Karten; Detail kann einen lesbaren Zeitverlauf neben Medien zeigen. | Hero und 2×2-Karten; Erfassen führt zu einem privaten Entwurf, nicht direkt in einen öffentlichen Feed.

### 3.4 Suche, Katalog und Karte

Das Suchfeld trägt den dauerhaften Namen **„Arten, Beobachtungen, Orte oder Mitglieder suchen“**. Es kann als erste Eingabe einen vollständigen Freitext akzeptieren, zeigt aber den Bereich jederzeit sichtbar an. Ergebnisgruppen heißen beispielsweise **Arten**, **Beobachtungen**, **Orte**, **Mitglieder** und **Wissen**. Filter sind editierbare Chips für Taxon, Region, Zeitraum/Saison, Realm, Medien, Evidenzstatus, Sichtbarkeit, Datenqualität und – nur wo fachlich zulässig – Schutzstatus. Freitext und Filter bleiben unterscheidbar: Freitext beantwortet „wonach suche ich?“, Filter beantwortet „welches Merkmal soll gelten?“. [6] [22] [42] [80]

Die Karte und Liste zeigen dieselbe Trefferzahl und denselben Zustand. Auf der Karte sind Cluster, ausgewählte Marker, eine Legende, kontrastreiche Controls und ein klarer Befehl **„In diesem Kartenausschnitt suchen“** notwendig. In der Liste sind Art/Objekt, Region oder Entfernungsangabe, Zeitpunkt, Evidenzstatus und Standortschutz verständlich lesbar. Ein geschützter Ort hat keinen scheinpräzisen Marker. Die öffentlich sichtbare Geometrie kann exakt, verschleiert, regional oder vollständig verborgen sein; der Status bleibt stets textlich erklärbar. [9] [31] [60] [61] [63]

### 3.5 Quellen und Katalogwahrheit

Quellen sind kein versteckter Footer und kein eigener globaler Haupttab. Sie erscheinen dort, wo eine fachliche Behauptung, ein Taxon, eine Karte, eine KI-Antwort oder ein Wissensartikel gezeigt wird. Ein Quellenblock zeigt mindestens **Bezeichnung**, **Herkunft/Organisation**, **Abruf- oder Versionsdatum**, **Lizenz**, **Evidenz- oder Prüfstatus** und den permanenten Link beziehungsweise Identifier. Bei Beobachtungen trennt die UI ausdrücklich „vom Mitglied bereitgestellt“, „KI-Vorschlag“, „Community bestätigt“ und „redaktionell/fachlich geprüft“. GBIF-artige Feldqualität wird als Hinweis auf Datenqualität behandelt, niemals als Wahrheitsgarantie. [45] [74] [75]

| Objekt | Quellenblock | Unzulässige Darstellung |
|---|---|---|
| Taxondetail | Wissenschaftlicher Name, Rang, stabile BWL-ID, Synonyme, Verbreitung, Quelle, Lizenz, letzte Aktualisierung. | Ein Name ohne Herkunft oder eine als sicher präsentierte, zeitlose Verbreitung.
| Beobachtung | Beobachtungsgrundlage, Medienlizenz, Zeitpunkt, sichtbare Standortpräzision, Identifikationshistorie und Korrekturen. | KI-/Mitgliedsvorschlag als bestätigte Taxon-Tatsache ohne Status.
| KI-Ergebnis | Modellname/-version, Analysezeit, verwendete Eingaben, Kandidaten, Unsicherheit, Datengrundlage/Quellen und Aktion zur Korrektur. | Eine nackte Prozentzahl, ein scheinbar menschlicher Autor oder ein Quellensiegel ohne öffnende Details.
| Wissensartikel | Autor/Redaktion, Fachbereich, Veröffentlichungs- und Aktualisierungsdatum sowie mindestens eine echte Quelle. | Nicht veröffentlichter Text oder frei erfundene Expertenschaft.

### 3.6 KI-Bestimmung als sichtbarer Prüfablauf

Der KI-Pfad folgt überall demselben nachvollziehbaren Ablauf: **Foto oder Notiz wählen → Eingaben und Übertragung prüfen → Analyse → Kandidaten bewerten → manuell bearbeiten oder verwerfen → privat speichern, Fachprüfung anfordern oder bewusst veröffentlichen**. Eine persönliche oder fachliche Bestätigung ist nicht die Nebenwirkung eines Trefferbuttons. Niedrige Qualität, unzureichende Abdeckung oder ein sensibles Taxon führen zu einer klaren Einschränkung und gegebenenfalls zu einer höheren Taxon-Ebene. [10] [11] [44] [63] [66]

Vor cloudbasierter Analyse nennt ein Datenschutz-Vorhang konkret, ob Foto, EXIF-Metadaten, ungefähre oder präzise Koordinaten, Zeitpunkt und Notiz übertragen werden, wer sie verarbeitet, wie lange sie gespeichert werden und ob sie für Modellverbesserung verwendet werden. Modellverbesserung ist standardmäßig aus oder wird separat zugestimmt. Die manuelle Katalogsuche ist immer ein vollwertiger Ausweg. [11] [16] [33] [50]

### 3.7 Lade-, Offline- und Fehlerzustände

Ein lokaler Filterwechsel unter 200 Millisekunden zeigt keinen künstlichen Spinner. Ein kurzer Ladezustand zeigt einen kompakten, gelabelten Indikator am betroffenen Bereich. Ein langer Upload, eine Synchronisierung oder eine KI-Analyse zeigt eine echte Prozentanzeige, wenn der Fortschritt bekannt ist, sonst eine konkrete Phase wie **„Foto wird analysiert“**. Andere Bereiche bleiben bedienbar. Erfolg, Fehler, Offline und leer sind vier verschiedene Zustände. [14] [27] [51]

Ein Offline-Moment wird als **„Privat gespeichert – wartet auf Upload“** geführt. Er zeigt Medienstatus, Warteschlangenposition, Wiederholen und Verwerfen. Ein lokaler KI-Vorschlag wird als **„Offline-Vorschlag – online erneut prüfen“** gekennzeichnet. Es gibt keine stille Veröffentlichung nach Reconnect. [31] [68]

---

## 4. Vier neue Varianten

Die folgenden Richtungen sind **vier austauschbare Präsentations- und Einstiegsvarianten eines gemeinsamen Produkts**, keine vier getrennten Informationsarchitekturen. Jede Variante muss deshalb dieselben fünf Hauptziele, dieselbe Sichtbarkeitslogik, dieselben Weltkarten, denselben Suche–Katalog–Karte-Vertrag und dieselben Accessibility-/Privacy-Gates liefern. Eine Auswahl zwischen Varianten wird erst nach Aufgaben-, Accessibility- und Vertrauens-Tests getroffen.

### Variante A — Waldportal: „Canopy Field Portal“

**Zielbild.** Das Waldportal stellt BlackWaterLeaf als persönlichen, aber fachlich belastbaren Zugang in eine lebendige Naturwelt vor. Es priorisiert den Einstieg über die zentrale Blattmarke, den eigenen privaten Moment und die vier Fachwelten. Der Feed ist eine zweite Ebene, nicht der Startzwang.

**Desktop.** Ein großformatiges, dunkel überblendetes Blatt-/Regenwaldhero liegt oberhalb der fokussierten 2×2-Weltkarten. Links im Hero stehen eine klare Willkommenszeile, der Zustand des privaten Bereichs und die Hauptaktion **„Moment erfassen“**. Rechts steht höchstens ein echtes, knappes Kontextmodul, etwa eine zuletzt private Beobachtung oder ein ehrlicher Leerzustand. Darunter erscheinen die vier Welten im festen Kartenraster; Community- und Katalogteaser sind nachgeordnet. Die Header-Suche bleibt immer sichtbar.

**Handy.** Das Hero bleibt kurz und schiebt die Hauptaktion nicht unter den Fold. Die vier Weltkarten bleiben in einem 2×2-Raster, ihre Titel umbrechen mehrzeilig. Die Bottom Navigation trägt Textlabels. Eine Suchaktion führt zu einer vollwertigen Suche mit fokussiertem Feld und stellt bei Rückkehr den Portalzustand wieder her.

**Funktionale Akzente.** Botanik ist der natürliche erste Weltakzent, während Aqua, Terrarium und KI gleichwertig sichtbar bleiben. Profil zeigt die private/öffentliche Trennung besonders früh. Die Quellenfläche ist im Pflegewissen und jedem Taxondetail erreichbar. Karte und Katalog sind direkt aus dem Entdecken-Teaser sowie aus der Suche zugänglich.

**Geeignet, wenn.** Tests zeigen, dass neue und gelegentliche Personen vor allem einen verständlichen Einstieg, private Dokumentation und die drei Fachwelten erwarten.

**Nicht tun.** Das Hero nicht zu einem Vollbildvideo oder zu einer unbegrenzten Entdecken-Schleife machen. Keine scheinbaren Sensorwerte, Streaks oder Communitymetriken einsetzen, wenn sie nicht real und kontextuell relevant sind.

### Variante B — Unterwasser-Observatorium: „Water Observatory“

**Zielbild.** Das Unterwasser-Observatorium legt den Schwerpunkt auf ruhige Beobachtung, Messkontext und die Verbindung von Aquaristik mit den anderen Naturwelten. Es darf professionell wirken, wird aber nicht zu einem generischen Kontrollzentrum.

**Desktop.** Das Cyan-Aquaristikhero zeigt Unterwasserfotografie, eine klare Textschicht und die Hauptaktion **„Wasserwert oder Moment erfassen“**. Darunter liegen die vier Weltkarten unverändert im 2×2-Muster. Eine schmale, lokale Observatoriumsfläche darf aktuelle Werte, eine Wartung oder einen Offline-Zustand zeigen, allerdings nur mit echter Quelle, Einheit, Zeitstempel und verständlicher Nichtverbindungsanzeige. Auf `Entdecken` kann eine breite Karte neben einer synchronen Ergebnisliste erscheinen; die Liste behält dabei Vorrang für Tastatur, Screenreader und geschützte Standorte.

**Handy.** Der Start priorisiert eine klare Aqua-Aktion, ohne Botanik/Terraristik/KI zu verstecken. Wasserwerte erscheinen als einfache, editierbare Zeilen mit Einheit und Messzeit. Graphen sind ergänzend und verfügen über eine tabellarische Alternative. Bei fehlenden Daten erscheint „Noch kein Aquarium verbunden“ statt eines Nullwerts oder einer Simulation.

**Funktionale Akzente.** Aquaristik erhält die klarste Datums-, Einheiten- und Verlaufssprache. Botanik und Terraristik bleiben über Weltkarten erreichbar. KI zur Aquaristik erklärt verwendete Eingaben und kann nie eine Diagnose autonom veröffentlichen. Quellen zu Zielwerten, Pflege- oder Wissensaussagen sind auf dem jeweiligen Detail sichtbar.

**Geeignet, wenn.** Erfahrene Halter:innen und systematische Pflegende die private Chronologie, echte Messkontexte und Klarheit über verbundene versus nicht verbundene Daten höher bewerten als ein bilddominantes Portal.

**Nicht tun.** Keine Pseudo-Live-Ansicht, keine grünen/roten Ampeln ohne Text und keine Marktdaten als fachliche Empfehlung darstellen.

### Variante C — Mikrohabitat-Atlas: „Terrarium Field Atlas“

**Zielbild.** Der Mikrohabitat-Atlas verbindet terraristische Detailbeobachtung, Botanik und Katalogrecherche. Er stellt Materialität, Substrat, Feuchtigkeit, Mikrohabitate und taxonomische Einordnung in den Vordergrund, ohne aus der App ein trockenes Datenbankfrontend zu machen.

**Desktop.** Das gelbe Terrariumhero führt in eine strukturierte Atlasfläche: Weltkarten im festen 2×2-Raster, darunter ein Themenabschnitt mit Arten-/Habitat-Suche, Kataloghinweisen und Quellen. In Katalogdetails darf eine breite Zweispaltenansicht links die scanbare Taxon-/Beobachtungsliste und rechts Details, Quellen und Historie zeigen. Karte und Liste bleiben über dieselben Filter synchron. Die optionale sekundäre Spalte ist kontextbezogen und keine zweite Hauptnavigation.

**Handy.** Das Hero führt direkt zu **„Terrarium fotografieren“**, **„Terrarium entdecken“**, Wissen und KI. Katalogdetails folgen einer linearen, semantisch überschrifteten Lesereihenfolge: Name, Status, Beschreibung, regionale Einordnung, Belege, Quellen, Historie. Ein Wechsel zur Karte behält die Filterchips sichtbar; ein Wechsel zurück führt an die vorherige Listenposition.

**Funktionale Akzente.** Terraristik verwendet eine besonders klare Trennung zwischen privater Anlage, nachgewiesenem Taxon, Haltungshinweis und offener Fachfrage. Botanik kann in der Suche und im Katalog über gemeinsame Taxonomie sichtbar werden, ohne private Terrarien offenzulegen. KI-Bestimmung empfiehlt bei Unsicherheit einen höheren Taxonrang und verlinkt zu Quellen bzw. manueller Katalogsuche.

**Geeignet, wenn.** Die wichtigsten Aufgaben die Recherche, das Vergleichen von Arten und Mikrohabitaten sowie vorsichtige, evidenznahe Dokumentation sind.

**Nicht tun.** Keine dichten Tabellen ohne responsive Alternativen, keine allein farbliche Taxon- oder Sicherheitscodierung und keine künstliche Präzision für geschützte Fundorte.

### Variante D — Evidenz-Labor: „Evidence & AI Studio“

**Zielbild.** Das Evidenz-Labor macht die KI-Bestimmung, Quellen und menschliche Prüfung besonders sichtbar. Es behandelt KI als assistives Laborwerkzeug und bewahrt die Naturatmosphäre über das violette botanische Orbit-Design statt über ein technisches Chat-Interface.

**Desktop.** Das violette Hero startet mit **„Foto oder Notiz prüfen“** und einer sehr kurzen Erklärung: „KI liefert Vorschläge. Du entscheidest und prüfst Quellen.“ Die vier Weltkarten bleiben sichtbar, damit KI nie die einzige Produkttür wird. Der Analysebereich nutzt einen dreiteiligen Ablauf: Eingaben und Einwilligung, Kandidaten/Evidenz, bearbeitbarer Entwurf plus Quellen. Die sichtbare Reihenfolge ist auch die Tastatur- und Screenreader-Reihenfolge. Dialoge werden nicht verschachtelt; die Datenschutzentscheidung ist ein einzelner klarer Schritt.

**Handy.** Der Ablauf wird als lineare Schrittfolge umgesetzt: Eingabe, Datenfreigabe, Analyse, Kandidaten, Prüfen, Entwurf. Jeder Schritt hat einen klaren Titel und eine Zurückaktion ohne Datenverlust. Kandidaten liegen als einzelne, vollständig lesbare Karten vor, nicht als unzugängliche Balkengrafik. Eine Quellen-Schublade ist über einen beschrifteten Button erreichbar und enthält Links, Datum und Datenstand.

**Funktionale Akzente.** KI kann aus jeder Fachwelt gestartet werden, zeigt aber fachweltbezogene Eingaben: Pflanzenteil/Merkmal, Aquariumwert/Symptom, Terrariumbild/Habitatmerkmal. Der gleiche Prozess erlaubt **„Manuell im Katalog suchen“**, **„Als privat speichern“**, **„Fachfrage erstellen“** und erst nach einem Review **„Veröffentlichen“**. Die Community kann eine Korrekturhistorie sehen, ohne private Ausgangsdaten oder präzise Orte zu sehen.

**Geeignet, wenn.** Tests belegen, dass Unsicherheit, Quellen und menschliche Nachprüfung die Hauptbarrieren bei der Nutzung KI-gestützter Bestimmung sind.

**Nicht tun.** Keine anthropomorphe KI-Persona, keine automatische Veröffentlichung, kein Trainieren mit Medien/Standorten ohne separate Einwilligung und keine Quellenbehauptung ohne öffnende Primärquelle.

### 4.5 Vergleich und Auswahlkriterien

| Kriterium | A: Waldportal | B: Unterwasser-Observatorium | C: Mikrohabitat-Atlas | D: Evidenz-Labor |
|---|---|---|---|---|
| Primärer Einstieg | Private Naturwelt und Weltwahl | Pflege-/Beobachtungskontext | Katalog und Mikrohabitat | Überprüfbare Bestimmung |
| Visueller Schwerpunkt | Nasses Blattwerk, Grün | Unterwasser, Cyan | Moos/Substrat, Gelb | Botanischer Orbit, Violett |
| Stärkster erster Nutzen | Orientierung und privater Moment | Echte Werte/Verlauf verstehen | Arten und Lebensräume vergleichen | KI-Ergebnis korrekt prüfen |
| Desktop-Mehrwert | Portalhero plus Karten | Karte/Liste plus echte Kontextdaten | Listen-Detail-/Quellenvergleich | Drei Schritte Eingabe–Evidenz–Entwurf |
| Handy-Mehrwert | Direkter Einstieg und 2×2-Welten | Messzeilen und ehrliche Nichtverbindung | Lineares Katalogdetail | Sequenzieller, fehlerresistenter Review |
| Gemeinsame Grenzen | Keine Feedpflicht, keine Fake-Daten | Keine Pseudo-Live-Daten | Keine Scheingenauigkeit | Keine autonome KI |

---

## 5. Verbindliche Accessibility- und Internationalisierungsbasis

Accessibility ist ein Release-Gate für alle vier Varianten. Die Anforderungen gelten nicht nur für den finalen Screen, sondern bereits für Design Tokens, Datenmodelle, Komponenten und Inhalte. [1] [21] [47] [49] [78]

| Bereich | Verbindliche Abnahme |
|---|---|
| **Kontrast und Farbe** | Normaler Text erreicht mindestens **4,5:1**, großer Text mindestens **3:1**, aktive nichttextliche Elemente mindestens **3:1**. Status nutzt Text plus Icon/Form; Rot/Grün oder Bereichsfarben entscheiden niemals allein. [13] [21] [49] [87] |
| **Zielgrößen und Gesten** | Interaktive Ziele sind standardmäßig mindestens **48 CSS-Pixel** hoch/breit und unterschreiten plattformgerecht nicht 44 pt. Jede Geste besitzt eine sichtbar benannte Alternative. [21] [31] |
| **Tastatur und Fokus** | Alle primären und sekundären Aufgaben sind mit Tab, Pfeiltasten, Enter und Space erreichbar. Fokus ist sichtbar, folgt der Lesereihenfolge, wechselt in Dialoge und kehrt zum Auslöser zurück. [20] [28] [47] |
| **Screenreader-Semantik** | Überschriften, Rollen, Namen, Zustände, Fehler, Fortschritt, Listenpositionen und Custom Actions sind semantisch ausgezeichnet. Bedeutungsvolle Fotos haben kurze sachliche Alternativtexte; dekorative Bilder werden verborgen. Statusupdates werden zurückhaltend als Live-Region angekündigt. [3] [30] [39] |
| **Skalierung und Reflow** | 200-%-Textgröße und 400-%-Zoom beziehungsweise 320 CSS-Pixel Reflow ohne Informationsverlust, abgeschnittene Kernlabels oder horizontalen Pan-Zwang. Lange wissenschaftliche Namen, locale strings und größere Systemschrift werden geprüft. [13] [29] [48] |
| **Karte und Datenvisualisierung** | Karte, Diagramm und Farbcode haben stets eine gleichwertige Text-/Listen-/Tabellenroute. Marker, Cluster und sichtbare Genauigkeit besitzen Namen und bedienbare Alternativen. [9] [31] [43] |
| **Bewegung** | Nicht essenzielle Bewegung reagiert auf `prefers-reduced-motion`/Systemeinstellung. Bewegung erklärt nie allein einen Status. Fokus und laufende Analyse bleiben ohne Animation verständlich. [36] [65] |
| **Internationalisierung** | LTR und RTL spiegeln führende/nachlaufende Oberflächenelemente und Richtungsicons, nicht aber URLs, Zahlen, Koordinaten, Uhren oder fachlich gerichtete Diagramme blind. Wissenschaftlicher Name bleibt sprachneutraler Anker; lokale Namen, Datum, Einheit und Region sind lokalisierbar. [28] [69] |

### Release-Testmatrix

Vor der Auswahl einer Variante werden die Kernaufgaben **Portal öffnen**, **global suchen**, **Filter anwenden**, **Karte als Liste nutzen**, **Taxon und Quellen lesen**, **privaten Moment erfassen**, **Standortschutz ändern**, **KI-Vorschlag verwerfen/korrigieren**, **Fachfrage veröffentlichen**, **Profil-/Datenfreigabe verwalten** und **Konto löschen** getestet. Jede Aufgabe wird auf Smartphone, Tablet und Desktop mit großer Schrift, Bold Text, erhöhtem Kontrast, „Ohne Farbe unterscheiden“, reduziertem Motion, Farbfiter, Tastatur, VoiceOver, TalkBack, Voice Control/Voice Access, Switch Control/Switch Access und – wo verfügbar – Assistive Access geprüft. Reale Geräte ergänzen automatisierte Semantik-, Kontrast- und UI-Tests. [2] [35] [47]

---

## 6. Verbindliche Datenschutz- und Vertrauensbasis

Privacy wird im Interaktionsmoment erklärt, nicht erst in einer langen Richtlinie. Jede Datenkategorie erhält einen klaren Zweck, eine Freigabe, eine Änderung oder einen Widerruf und eine nachvollziehbare Aufbewahrungs-/Löschinformation. App- und Store-Deklarationen müssen einschließlich Drittanbieter-SDKs übereinstimmen. [16] [33] [50]

| Daten- oder Vertrauensentscheidung | Verbindliche Gestaltung |
|---|---|
| **Konto** | Browsen, Katalog und öffentliche Wissensinhalte bleiben ohne Konto möglich, sofern keine Schutzregel entgegensteht. Anmeldung wird erst vor geschützter Aktion verlangt und erklärt ihren unmittelbaren Nutzen. Konto löschen ist auffindbar unter `Profil → Konto & Datenschutz`.
| **Standort** | Standortzugriff wird erst bei `Standort hinzufügen` angefragt. Eine Beobachtung startet privat; die Oberfläche trennt Sichtbarkeit der Beobachtung von Ortspräzision: **präzise**, **verschleiert**, **privat**. Sensible Taxa können strengere Voreinstellungen erhalten, aber die zugrundeliegende Schutzklassifikation braucht eine eigene dokumentierte Fach- und Moderationspolitik.
| **Medien und EXIF** | Kamera erst bei Aufnahme, Mediathek erst bei Auswahl. Vor Veröffentlichung zeigt die Oberfläche, ob Metadaten, Personen- oder Privatort-Hinweise entfernt, sichtbar oder privat verbleiben. Medienlizenz und Rechte sind vor dem Teilen verständlich wählbar.
| **KI-Verarbeitung** | Vor jeder Cloud-Analyse zeigt ein eigener Schritt Datenumfang, Empfänger/Verarbeiter, Speicherzeit, Trainingswahl, Widerruf und manuellen Ausweg. Keine Sensordaten, Fotos, Standorte oder Profile werden still mit einer KI-Analyse gekoppelt.
| **Karte und Drittanbieter** | Kartenattribution bleibt sichtbar. Bei einem Kartenanbieter werden Datenraum und relevante Drittübermittlung in der Datenschutzoberfläche und am Standortkontext erklärt; bei Azure Maps ist insbesondere eine mögliche Weitergabe von Standort-/Adressabfragen an TomTom zu berücksichtigen. [53] [54] |
| **Community** | Melden, Blockieren, Stummschalten und Sichtbarkeit ändern sind klar erreichbare Einzelaktionen. Fachliche Uneinigkeit, Missbrauch und Datenschutzverletzung werden getrennt erfasst und menschlich geprüft.
| **Löschung, Export und Persistenz** | Der Löschdialog unterscheidet Konto, Profil, private Daten, öffentliche Beiträge, Medien und gegebenenfalls rechtmäßig fortbestehende anonymisierte Forschungsdaten. Es wird nie pauschal vollständige Entfernung versprochen, wenn Lizenz, Anonymisierung oder gesetzliche Aufbewahrung etwas anderes erfordern. [67] [68] |

---

## 7. Umsetzungsreihenfolge und Ausschlusskriterien

### P0 – vor Variantenvergleich vollständig

1. Die stabile Fünf-Ziel-Navigation, globale Suche und zustandserhaltende Rücknavigation sind in Web und Native funktionsgleich.
2. `Entdecken` bietet eine synchronisierte, zugängliche Suche–Katalog–Karte-Struktur mit Listenalternative und Standortschutzstatus.
3. Beobachtungen beginnen privat; Standort-, Medien- und KI-Einwilligung sind kontextuell, widerrufbar und testbar.
4. KI ist ohne Anbieter-/Modell-/Kosten-/Datenschutz-/Quellenfreigabe sichtbar gesperrt und nach Freigabe nur als überprüfbarer Vorschlag verfügbar.
5. Alle Varianten bestehen die in Abschnitt 5 definierte Accessibility-Matrix und die Wahrheits-/Fehlerzustände liefern keine Demonstrationsdaten.

### P1 – nach nachgewiesener Kernstabilität

1. Gespeicherte Suchen und persönliche Katalogansichten.
2. Offline-Entwürfe mit Warteschlange, Synchronisierung und Konfliktbehandlung.
3. Community-Review, Korrekturhistorie, Berichtsstatus und verantwortungsvolle Benachrichtigungen.
4. Domänenspezifische Verlaufskomponenten für Pflanzen, Aquarien und Terrarien; nur mit echten Datenquellen.

### Nicht als Variantenversprechen

Die vier Richtungen versprechen weder eine vollautomatische Artbestimmung noch exakte Schutzstandorte, universell korrekte Pflege-/Haltungshinweise, ein eigenes Commerce-Checkout, permanente Echtzeit-Sensorik, eine globale Expertenrangliste oder eine unbelegte öffentliche Datenmenge. Diese Funktionen erfordern jeweils gesonderte fachliche, rechtliche, operative und technische Freigaben.

---

## 8. Schlussfolgerung

Die international belastbare Parität besteht nicht darin, Apple, Material oder Fluent optisch nachzuahmen. Sie besteht darin, ihre wiederkehrenden Grundanforderungen unter der bestehenden BlackWaterLeaf-Bildwelt konsequent einzuhalten: **klare Wege, persistenter Zustand, freie Kontrolle über private Daten, überprüfbare Fachlichkeit und ein Zugang ohne Seh-, Motorik-, Sprach-, Größen- oder Standortzwang**.

Die Auswahl unter Waldportal, Unterwasser-Observatorium, Mikrohabitat-Atlas und Evidenz-Labor ist deshalb eine Frage der nachgewiesenen Aufgabenunterstützung und des Vertrauens, nicht der Dekoration. Jede Variante darf nur weitergeführt werden, wenn sie die gemeinsame P0-Basis erfüllt und in internationalen, mehrsprachigen, zugänglichen Tests bei Botanik, Aquaristik, Terraristik, Katalogrecherche und KI-Prüfung mindestens ebenso gut abschneidet wie die anderen Richtungen.

---

## References

### Apple

[1]: https://developer.apple.com/design/human-interface-guidelines/accessibility "Apple Human Interface Guidelines: Accessibility"
[2]: https://developer.apple.com/documentation/accessibility/performing-accessibility-testing-for-your-app "Apple: Performing accessibility testing for your app"
[3]: https://developer.apple.com/design/human-interface-guidelines/voiceover "Apple Human Interface Guidelines: VoiceOver"
[4]: https://developer.apple.com/design/human-interface-guidelines/tab-bars "Apple Human Interface Guidelines: Tab bars"
[5]: https://developer.apple.com/design/human-interface-guidelines/sidebars "Apple Human Interface Guidelines: Sidebars"
[6]: https://developer.apple.com/design/human-interface-guidelines/searching "Apple Human Interface Guidelines: Searching"
[7]: https://developer.apple.com/design/human-interface-guidelines/search-fields "Apple Human Interface Guidelines: Search fields"
[8]: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables "Apple Human Interface Guidelines: Lists and tables"
[9]: https://developer.apple.com/design/human-interface-guidelines/maps "Apple Human Interface Guidelines: Maps"
[10]: https://developer.apple.com/design/human-interface-guidelines/generative-ai "Apple Human Interface Guidelines: Generative AI"
[11]: https://developer.apple.com/design/human-interface-guidelines/machine-learning "Apple Human Interface Guidelines: Machine learning"
[12]: https://developer.apple.com/design/human-interface-guidelines/color "Apple Human Interface Guidelines: Color"
[13]: https://developer.apple.com/design/human-interface-guidelines/typography "Apple Human Interface Guidelines: Typography"
[14]: https://developer.apple.com/design/human-interface-guidelines/progress-indicators "Apple Human Interface Guidelines: Progress indicators"
[15]: https://developer.apple.com/design/human-interface-guidelines/feedback "Apple Human Interface Guidelines: Feedback"
[16]: https://developer.apple.com/design/human-interface-guidelines/privacy "Apple Human Interface Guidelines: Privacy"
[17]: https://developer.apple.com/design/human-interface-guidelines/managing-accounts "Apple Human Interface Guidelines: Managing accounts"
[18]: https://developer.apple.com/forums/thread/781557 "Apple Developer Forums thread 781557 (non-normative and unavailable at research time)"
[19]: https://developer.apple.com/forums/activities/1549080 "Apple Developer Forums activity 1549080 (non-normative and unavailable at research time)"

### Material 3 und Android

[20]: https://m3.material.io/foundations/overview/principles "Material 3: Design principles"
[21]: https://m3.material.io/foundations/designing/structure "Material 3: Designing structure"
[22]: https://m3.material.io/foundations/designing/flow "Material 3: Designing flow"
[23]: https://m3.material.io/components/navigation-bar/accessibility "Material 3: Navigation bar accessibility"
[24]: https://m3.material.io/components/search/accessibility "Material 3: Search accessibility"
[25]: https://m3.material.io/components/lists/accessibility "Material 3: Lists accessibility"
[26]: https://m3.material.io/components/cards/accessibility "Material 3: Cards accessibility"
[27]: https://m3.material.io/components/progress-indicators/guidelines "Material 3: Progress indicators guidelines"
[28]: https://m3.material.io/styles/typography/type-scale-tokens "Material 3: Type scale tokens"
[29]: https://m3.material.io/foundations/layout/bidirectionality-rtl "Material 3: Bidirectionality and RTL"
[30]: https://developer.android.com/develop/adaptive-apps/guides/build-adaptive-navigation "Android Developers: Build adaptive navigation"
[31]: https://developer.android.com/design/ui/mobile/guides/foundations/accessibility "Android Developers: Accessibility foundations"
[32]: https://developer.android.com/develop/ui/compose/accessibility/semantics "Android Developers: Compose accessibility semantics"
[33]: https://developer.android.com/develop/ui/compose/accessibility/scalable-content "Android Developers: Compose scalable content"
[34]: https://developer.android.com/guide/topics/ui/accessibility/testing "Android Developers: Accessibility testing"
[35]: https://developer.android.com/privacy-and-security/declare-data-use "Android Developers: Declare data use"
[36]: https://android-developers.googleblog.com/2025/05/android-design-google-io-25.html "Android Developers Blog: Android design at Google I/O 2025 (context, non-normative)"
[37]: https://issuetracker.google.com/issues/184825850 "Google Issue Tracker: Compose accessibility issue 184825850 (historical implementation context)"

### Fluent und Microsoft

[38]: https://fluent2.microsoft.design/design-principles "Fluent 2: Design principles"
[39]: https://fluent2.microsoft.design/accessibility "Fluent 2: Accessibility"
[40]: https://fluent2.microsoft.design/components/web/react/core/nav/usage "Fluent 2 React: Nav usage"
[41]: https://fluent2.microsoft.design/components/web/react/core/searchbox/usage "Fluent 2 React: SearchBox usage"
[42]: https://fluent2.microsoft.design/components/web/react/core/avatar/usage "Fluent 2 React: Avatar usage"
[43]: https://fluent2.microsoft.design/components/web/react/core/card/usage "Fluent 2 React: Card usage"
[44]: https://fluent2.microsoft.design/components/web/react/core/badge/usage "Fluent 2 React: Badge usage"
[45]: https://fluent2.microsoft.design/components/web/react/core/spinner/usage "Fluent 2 React: Spinner usage"
[46]: https://fluent2.microsoft.design/wait-ux "Fluent 2: Wait UX"
[47]: https://fluent2.microsoft.design/color "Fluent 2: Color"
[48]: https://fluent2.microsoft.design/typography "Fluent 2: Typography"
[49]: https://fluent2.microsoft.design/components/web/react/core/dialog/usage "Fluent 2 React: Dialog usage"
[50]: https://learn.microsoft.com/en-us/dynamics365/guidance/develop/ui-ux-component-details-model-driven-apps "Microsoft Learn: UI component details for model-driven apps"
[51]: https://learn.microsoft.com/en-us/power-platform/well-architected/experience-optimization/design-standards "Microsoft Learn: Experience optimization design standards"
[52]: https://learn.microsoft.com/en-us/microsoft-cloud/dev/copilot/isv/ux-guidance "Microsoft Learn: Copilot UX guidance for ISVs"
[53]: https://learn.microsoft.com/en-us/windows/apps/get-started/best-practices "Microsoft Learn: Windows app best practices"
[54]: https://learn.microsoft.com/en-us/azure/azure-maps/about-azure-maps "Microsoft Learn: About Azure Maps"
[55]: https://learn.microsoft.com/en-us/azure/azure-maps/how-to-use-map-control "Microsoft Learn: Use the Azure Maps control"
[56]: https://learn.microsoft.com/en-us/azure/azure-maps/how-to-manage-consent "Microsoft Learn: Manage consent for Azure Maps"
[57]: https://github.com/microsoft/fluentui/discussions/34813 "Fluent UI discussion 34813 (non-normative implementation context)"
[58]: https://github.com/microsoft/fluentui/discussions/32836 "Fluent UI discussion 32836 (non-normative maintainer context)"
[59]: https://github.com/microsoft/fluentui/discussions/29813 "Fluent UI discussion 29813 (non-normative implementation context)"

### Internationale Naturprodukte und Biodiversitätsdaten

[60]: https://www.inaturalist.org/observations?subview=map "iNaturalist: Observations map"
[61]: https://help.inaturalist.org/en/support/solutions/articles/151000169670-how-to-search-inaturalist-observations "iNaturalist Help: Search observations"
[62]: https://help.inaturalist.org/en/support/solutions/articles/151000192921-how-to-make-an-observation "iNaturalist Help: Make an observation"
[63]: https://www.inaturalist.org/pages/geoprivacy "iNaturalist: Geoprivacy"
[64]: https://www.inaturalist.org/pages/computer_vision_demo "iNaturalist: Computer vision demo"
[65]: https://forum.inaturalist.org/t/geoprivacy-open-vs-obscured/73879 "iNaturalist Forum: Geoprivacy open versus obscured (non-normative)"
[66]: https://forum.inaturalist.org/t/changes-to-the-forums-layout-and-navigation/40996 "iNaturalist Forum: Layout and navigation changes (non-normative)"
[67]: https://ebird.org/explore "eBird: Explore"
[68]: https://support.ebird.org/en/support/solutions/articles/48001255129-explore-regions-in-ebird "eBird Support: Explore regions"
[69]: https://support.ebird.org/en/support/solutions/articles/48000794682-my-ebird "eBird Support: My eBird"
[70]: https://support.ebird.org/en/support/solutions/articles/48001078113-ebird-data-privacy-and-data-use "eBird Support: Data privacy and data use"
[71]: https://ebird.org/news/privacy-in-ebird-and-how-to-protect-your-data "eBird News: Privacy and protecting your data"
[72]: https://plantnet.org/en/about/ "Pl@ntNet: About"
[73]: https://identify.plantnet.org/en "Pl@ntNet: Identify plants"
[74]: https://plantnet.org/en/2022/10/18/plntnet-offline-embedded-identify-plants-anywhere-without-connection/ "Pl@ntNet: Offline embedded identification"
[75]: https://plantnet.org/en/account-deletion-procedure/ "Pl@ntNet: Account deletion procedure"
[76]: https://www.gbif.org/what-is-gbif "GBIF: What is GBIF"
[77]: https://www.gbif.org/data-quality-requirements-occurrences "GBIF: Data quality requirements for occurrences"
[78]: https://training.gbif.org/en/data-use/data-quality "GBIF Training: Data quality"

### Design- und Accessibility-Diskussionen

[79]: https://www.reddit.com/r/UXDesign/comments/1cwwf9o/does_anyone_make_site_maps_anymore/ "Reddit r/UXDesign: Does anyone make site maps anymore? (non-normative)"
[80]: https://www.w3.org/WAI/WCAG21/Understanding/multiple-ways.html "W3C WCAG 2.1: Understanding Success Criterion 2.4.5 Multiple Ways"
[81]: https://ux.stackexchange.com/questions/152829/is-combining-filter-and-search-a-good-idea "UX StackExchange: Is combining filter and search a good idea? (non-normative)"
[82]: https://ux.stackexchange.com/questions/152767/best-practice-for-advanced-filter-saved-filter "UX StackExchange: Best practice for advanced filter and saved filter (non-normative)"
[83]: https://ux.stackexchange.com/questions/151265/conveying-unknown-locations-on-a-map "UX StackExchange: Conveying unknown locations on a map (non-normative)"
[84]: https://www.reddit.com/r/UXDesign/comments/1ozti5q/what_specific_design_patterns_in_feeds_make_them/ "Reddit r/UXDesign: Feed design patterns discussion (non-normative)"
[85]: https://www.reddit.com/r/UXDesign/comments/1ju90qt/what_ive_learned_from_18_mths_of_ai/ "Reddit r/UXDesign: What I learned from 18 months of AI (non-normative)"
[86]: https://www.reddit.com/r/UXDesign/comments/1dxbe0t/a_conversation_on_figma_ai_and_design_tools/ "Reddit r/UXDesign: Figma AI and design tools discussion (non-normative)"
[87]: https://www.reddit.com/r/UXDesign/comments/1god906/do_you_do_accessibility_test_when_you_pick_colors/ "Reddit r/UXDesign: Accessibility tests when picking colors (non-normative)"
[88]: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html "W3C WCAG 2.2: Understanding Success Criterion 1.4.3 Contrast (Minimum)"
[89]: https://forum.figma.com/ask-the-community-7/what-is-the-unit-of-the-number-variables-for-line-and-letter-spacing-26730 "Figma Forum: Line and letter spacing variables (non-normative)"
[90]: https://ux.stackexchange.com/questions/151031/should-a-skeleton-loading-effect-be-used-when-refreshing-a-view-with-data-alread "UX StackExchange: Skeleton loading when refreshing existing data (non-normative)"
[91]: https://www.reddit.com/r/UXDesign/comments/1ebui1e/best_ux_practice_for_loading_dynamic_data_in/ "Reddit r/UXDesign: Loading dynamic data discussion (non-normative)"
[92]: https://ux.stackexchange.com/questions/152612/are-there-such-things-as-ethical-design-patterns "UX StackExchange: Ethical design patterns (non-normative)"
[93]: https://forum.figma.com/ask-the-community-7/how-do-i-replicate-responsive-chat-bubbles-in-messaging-platforms-39940 "Figma Forum: Responsive chat bubbles (non-normative)"
