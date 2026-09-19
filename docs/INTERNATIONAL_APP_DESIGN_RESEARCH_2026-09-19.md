# BlackWaterLeaf: internationale Web- und Native-Designsynthese

**Stand:** 19. September 2026  
**Autor:** Manus AI  
**Grundlage:** Vier vorliegende Recherchepakete mit öffentlichen Community-, Produkt- und Plattformquellen aus 2024–2026

## Entscheidung in einem Satz

BlackWaterLeaf sollte nicht mit einem algorithmischen Feed oder einer dekorativen Karte beginnen. Die prioritäre Produktgrundlage ist eine **stabile, direkt erreichbare Informationsarchitektur** mit einer **global auffindbaren Suche**, einem **gleichwertig nutzbaren Katalog in Liste und Karte**, **kontextstabilen Lade- und Refresh-Zuständen** sowie **barrierefreien, internationalisierbaren Komponenten**. Diese Richtung wird von mehreren unabhängigen Quellenfamilien getragen: Nutzer kritisieren wiederholt verschwundene Kernziele und Suche, Design-Communities berichten über nicht skalierende Listen, Kontrast- und Lokalisierungsprobleme, und die iOS-/Android-Quellen zeigen dieselben Risiken als Fokus-, Semantik- und Ladefehler. [1] [4] [12] [23] [24] [31] [37] [49] [50]

Die Synthese übernimmt ausschließlich Muster, die in mindestens zwei unabhängigen Recherchepaketen wiederkehren. Einzelne Ideen aus nur einem Thread – etwa sehr dichte Kartenlayer, öffentliche Ranglisten, ein bestimmtes Bottom-Sheet-Verhalten oder ein Feed als primäre Produktoberfläche – werden **nicht** als allgemeine Nutzernachfrage behandelt. Die vorgeschlagenen Produktentscheidungen sind deshalb belastbare Designhypothesen, aber kein Ersatz für Tests mit BlackWaterLeafs internationalen Zielgruppen.

## Was für BlackWaterLeaf jetzt Priorität hat

| Priorität | Designentscheidung | Begründung aus mehreren Quellenfamilien | Konkretes Ergebnis |
|---|---|---|---|
| **P0** | **Navigation, Rückwege und Zustandserhalt festlegen** | Instabile Tab-Positionen, versteckte Kernziele, unerwartetes Back-Verhalten und Fokusverlust nach Navigation werden wiederholt als Orientierungs- und Vertrauensverlust beschrieben. [1] [4] [12] [20] [31] [37] [49] | Eine feste Hauptnavigation, URL-/Routen-zustand im Web und native Back-Stacks; Filter, Scrollposition, Karte und Suche bleiben bei Rückkehr erhalten. |
| **P0** | **Suche und Katalog als Kernfluss bauen** | Sichtbare Suche, skalierbare Trefferlisten, Filter, stabile Sortierung und eine Listenalternative zur Karte sind wiederkehrende Anforderungen. [2] [5] [6] [23] [24] [39] | Der primäre Fluss lautet: Suche → Liste oder Karte → Detail → Speichern/Teilen/Melden → Rückkehr zum selben Ergebniszustand. |
| **P0** | **Semantisches Designsystem mit Accessibility und Internationalisierung etablieren** | Kontrast, skalierbarer Text, nichtfarbliche Statussignale, semantische Controls, Screenreader-Fokus und RTL-fähige Inhalte werden in allen vier Paketen wiederholt behandelt. [3] [8] [13] [16] [25] [27] [28] [49] [50] | Token, Komponenten und Qualitätsgates funktionieren in Hell/Dunkel, bei vergrößertem Systemtext, Tastatur, VoiceOver/TalkBack, LTR und RTL. |
| **P0** | **Laden, Offline, Fehler und Aktualisierung kontextstabil machen** | Layoutsprünge, Dauer-Spinner, irreführende Netzfehler und verlorener Ort/Zoom/Filter nach Reconnect beschädigen die Aufgabe und das Vertrauen. [9] [15] [31] [46] [47] [48] | Platzhalter in Endgeometrie, klare Statusansagen, Retry und Cache; Refresh verwirft weder Eingaben noch Kontext. |
| **P1** | **Profil als Datenschutz- und Vertrauensoberfläche ausarbeiten** | Eine stabile Profilidentität, eindeutige Rollen/Freigaben und verständliche Sichtbarkeit werden über Community-, Sharing- und Native-Quellen hinweg gefordert. [1] [32] [33] [37] [52] | Profil ist ein konstantes Ziel mit Identität, Beiträgen, gespeicherten Inhalten und klaren Sichtbarkeitsregeln. |
| **P1** | **Feed und Karte informationsdicht, aber nicht überladen gestalten** | Wiederkehrend sind Forderungen nach scanbaren Karten, relevanten Metadaten, transparenten Sortierungen und einer zugänglichen Kartenalternative. [2] [10] [11] [35] [38] [42] [43] | Ein kontrollierbarer Entdecken-Feed ergänzt Suche/Katalog; Karte und Liste sind synchron und gleichwertig nutzbar. |
| **P2** | **Erst nach Validierung erweitern** | Die vorliegenden Quellen geben keinen Mehrquellen-Konsens für öffentliche Rankings, algorithmische Personalisierung oder maximale Kartenlayerdichte her. [18] [19] [35] [51] | Community-Mechaniken, Empfehlungen und erweiterte Kartendaten nur gegen nachweislichen Nutzen testen, nicht als Startannahme ausrollen. |

> **Leitprinzip:** BlackWaterLeaf sollte jede Kernaufgabe mit einem sichtbaren Ziel, einer verständlichen Bezeichnung, einem wiederherstellbaren Zustand und einer barrierefreien Alternative anbieten. Eine visuell attraktive Oberfläche ist nicht ausreichend, wenn Suche, Navigation, Karteninhalt oder Status für einen Teil der Nutzer nicht zuverlässig bedienbar sind.

## 1. Navigation: Stabilität vor Neuheit

### Produktentscheidung

BlackWaterLeaf benötigt maximal fünf **dauerhaft benannte** Hauptbereiche: **Entdecken**, **Karte**, **Katalog**, **Gespeichert** und **Profil**. Die globale Suche bleibt zusätzlich aus jedem Hauptbereich direkt erreichbar. Diese Aufteilung macht Karte und Katalog nicht zu versteckten Unterfunktionen eines Feed-Experiments und hält die persönliche Sammlung von der öffentlichen Identität getrennt. Sie folgt dem mehrfach belegten Bedarf nach stabilen Kernzielen, klarer Hierarchie und direkter Auffindbarkeit. [1] [4] [12] [20] [23] [37]

Die Namen, Reihenfolge und Positionen dieser Ziele sind ein Produktvertrag. Ein Release, das Profil, Suche oder Gespeichert verschiebt, darf dies nicht still per Experiment tun. Wenn BlackWaterLeaf Varianten testet, braucht die Änderung eine klare Erklärung und einen gleichwertigen Weg zur bisherigen Kernaufgabe. Ebenso darf ein Zurück-Schritt nicht zur Startseite führen, wenn die Person aus einem gefilterten Ergebnis, einem Kartencluster oder einem Feed-Abschnitt kam. Die vorliegenden Quellen verbinden gerade diese Art von unerwartetem Kontextverlust mit Orientierungslosigkeit und sinkendem Vertrauen. [1] [4] [31] [37] [49]

### Web-Richtung

Auf breiten Bildschirmen wird die Hauptnavigation als persistente linke Seitenleiste umgesetzt. Auf schmalen Web-Viewports wird dieselbe Informationsarchitektur als Bottom-Navigation dargestellt. Die globale Suche erscheint in der Kopfzeile als klar beschriftetes Eingabefeld oder als beschriftete Aktion mit Tastaturzugang; ein unbeschriftetes Lupen-Icon allein ist nicht ausreichend. Jeder Hauptbereich erhält eine stabile URL. Query, aktive Filter, Sortierung, gewählte Listen- oder Kartenansicht, Seitenposition und Detailherkunft müssen in URL oder wiederherstellbarem Client-Zustand liegen. Browser-Back und Vorwärtsnavigation müssen sich daher wie sichtbare App-Rückwege verhalten.

### Native-Richtung

Auf iOS und Android werden die fünf gleichrangigen Bereiche als dauerhaft sichtbare Bottom-Navigation geführt; die aktive Registerkarte ist zugleich visuell und semantisch eindeutig. Detail-, Filter- und Freigabeseiten liegen darüber im nativen Hierarchie-Stack und verwenden die erwartete Back-/Up-Aktion. Nach einem Deep Link, nach dem Schließen eines Dialogs und nach dem Zurückkehren aus einem Detail muss der Screenreader-Fokus auf Titel, Rückkehrkontrolle oder dem ersten sinnvollen Inhalt landen – nicht auf der Tab-Bar, einem unsichtbaren Rest-Element oder einem Spinner. Dieser Fokus ist Teil der Navigation, nicht ein späteres Accessibility-Detail. [37] [39] [49] [50]

### Abnahmekriterien

Eine Person muss von einem Katalogdetail zu exakt derselben Suchanfrage, Sortierung, Filterkombination, Listenposition oder Kartenansicht zurückkehren können. Das gilt für Web-Browser-Back, nativen Back-Button, Deep Link, App-Hintergrundwechsel und erneute Verbindung. Die Hauptnavigation bleibt bei vergrößertem Text verständlich; die Beschriftungen werden nicht allein durch Icons ersetzt.

## 2. Profil: ein stabiler Vertrauens- und Datenschutzort, kein bloßes Schaufenster

### Produktentscheidung

Das Profil ist ein konstantes, vorhersehbares Ziel. Es bündelt **Identität**, **eigene Beiträge oder Beobachtungen**, **gespeicherte Arten/Orte/Objekte**, **Sichtbarkeits- und Benachrichtigungseinstellungen** sowie bei Bedarf **Rolle oder Verifikationsstatus mit Erklärung**. Mehrere Quellen stützen die übertragbare Erwartung, dass Identität in Feed, Detail und Profil konsistent bleibt und dass Freigabe, Rolle und sichtbare Daten vor einer Teilnahme oder einem Teilen verständlich sind. [1] [32] [33] [37] [52]

Für ein internationales Natur-, Community- und Katalogprodukt gilt Privacy by Default: Eine Veröffentlichung darf nicht stillschweigend präzise Standorte, Aktivitätsmuster, Fotos oder Statistiken offenlegen. Stattdessen zeigt jede Veröffentlichung vor dem Absenden ihren Empfängerkreis und die Standortgenauigkeit. Öffentliche, gruppeninterne und private Sichtbarkeit werden sprachlich eindeutig und visuell redundant unterschieden. Diese Richtung verbindet die wiederkehrenden Anforderungen an nachvollziehbare Freigaben mit den in mehreren Paketen genannten Risiken sensibler Standort- und Profildaten. [10] [17] [32] [33] [48]

### Web-Richtung

Die Profilseite ist in nachvollziehbare Abschnitte gegliedert: **Profil**, **Beiträge**, **Gespeichert**, **Sichtbarkeit** und **Einstellungen**. Freigabe- und Privacy-Optionen zeigen eine direkte Empfängervorschau: „Öffentlich“, „Nur Gruppe X“ oder „Nur ich“ müssen sowohl als Text als auch als Symbol/Form erscheinen. Ein öffentlicher Link darf nicht plötzlich Bearbeitungsrechte, Kommentare, interne Notizen oder einen erzwungenen Login zeigen. [32] [33]

### Native-Richtung

Im Feed und auf Detailseiten werden Name, Rolle und gegebenenfalls ein Verifikationshinweis als Textinformation mitgeführt. Avatare sind ergänzend; wenn sie fehlen oder nicht laden, bleibt eine stabile Initialen- oder Platzhalterdarstellung bestehen. Wichtige Profilaktionen wie Sichtbarkeit ändern, speichern, teilen, melden oder blockieren sind sichtbare, benannte Controls und zusätzlich als Accessibility-Aktionen verfügbar. Sie dürfen nicht ausschließlich hinter Long-Press oder einer Spezialgeste liegen. [38] [46] [52]

### Abnahmekriterien

Vor dem Teilen erkennt eine Person ohne Interpretationsaufwand, wer welche Daten sieht, ob genaue Koordinaten enthalten sind und welcher Link geöffnet wird. Eine Person mit Screenreader kann dieselbe Freigabe, Melde- oder Blockieraktion ohne Gestenwissen erreichen. Profilname und Rolle bleiben zwischen Feed, Detail und Profil konsistent.

## 3. Feed: kontrollierbares Entdecken statt intransparenter Endlosschleife

### Produktentscheidung

Der Feed ist ein Entdeckungsmodul, nicht die alleinige Informationsarchitektur. Er ergänzt Suche und Katalog mit einer fokussierten, vertikal scanbaren Auswahl. Jede Karte zeigt nur entscheidungsrelevante Informationen: Titel beziehungsweise Art/Objekt, ein primäres Bild mit reserviertem Seitenverhältnis, Ort in angemessener Granularität, Zeitpunkt, Status oder Verifikation und wenige aussagekräftige Tags. Relevante Aktionen bleiben sichtbar. Dieses Muster wird sowohl durch Forderungen nach kompakter, aber lesbarer Katalogdichte als auch durch Native-Accessibility-Anforderungen an lineare, semantische Karten gestützt. [2] [10] [11] [35] [38]

Die Reihenfolge muss erklärbar sein. BlackWaterLeaf benennt die aktuelle Logik zum Beispiel als **Neueste**, **In deiner Nähe**, **Von dir gespeichert** oder **Häufig bestätigt** und ermöglicht, wo sinnvoll, eine Umschaltung. Nicht erklärbare Sichtbarkeit und wiederholte, semantisch doppelte Empfehlungsregale sollten vermieden werden. Die Quellen stützen Transparenz und Informationspriorisierung, nicht jedoch die Annahme, dass ein algorithmischer Feed selbst ein nachgewiesenes Muss ist. [1] [35]

### Web-Richtung

Der Desktop-Feed verwendet eine einspaltige Lesereihenfolge mit optionaler rechter Kontextspalte für Filter oder aktive Gebietsinformation, nicht eine Ansammlung gleichwertiger Karussells. Filter und Sortierung sind nahe am Feed sichtbar und nach dem Schließen eines Details unverändert. „Weitere laden“ ist einer unkontrollierten Endlosschleife vorzuziehen, wenn der nächste Abschnitt nicht ohne Kontextwechsel eingefügt werden kann. Alle Karten sind mit Überschriften strukturiert, damit Tastatur- und Screenreader-Nutzer lange Bereiche überspringen können.

### Native-Richtung

Karten werden als semantische Gruppen gebaut, deren Titel, Metadaten, Status und einzelne Aktionen in einer logischen Reihenfolge erreichbar sind. Eine komplexe Karte wird nicht zu einem einzigen anpassbaren Screenreader-Element zusammengezogen, weil dadurch Inhalte und Unteraktionen hinter ungewohnten Gesten verschwinden. Standardnavigation liest den Inhalt innerhalb der Karte; klar benannte Actions übernehmen tatsächliche Aktionen wie Speichern, Teilen oder Melden. Horizontale Pager und Karussells sind nur für kleine, klar begrenzte Inhalte vertretbar und müssen Elementanzahl, aktuelle Position und vollständigen Fokuszugang liefern; sie sind für Kernkataloge und den Hauptfeed ungeeignet. [38] [39] [40] [46]

### Abnahmekriterien

Eine Person kann in einer Karte vor dem Öffnen erkennen, warum sie relevant ist. Eine Person kann die Sortierung ändern und deren Wirkung nachvollziehen. Karten behalten beim Nachladen ihre Geometrie; neue Inhalte verschieben nicht unkontrolliert die gerade gelesene Karte.

## 4. Suche: ständig erreichbar, fehlertolerant und ergebnisorientiert

### Produktentscheidung

Suche ist für BlackWaterLeaf ein Kernfluss. Sie darf weder in einer Nebenmenüebene verschwinden noch durch lange, unfilterbare Dropdowns ersetzt werden. Die globale Suche durchsucht mindestens **Arten/Objekte**, **Orte**, **Beiträge** und **Personen oder Organisationen**, kennzeichnet aber eindeutig, zu welchem Bereich ein Treffer gehört. Teilwortsuche, Tippfehlertoleranz, Synonyme sowie Volks- und wissenschaftliche Namen sind besonders wichtig, weil der Katalog international und fachlich benannt sein kann. Diese Richtung verbindet wiederkehrende Probleme mit verschwundener/ungenauer Suche und wachsenden, schlecht sortierbaren Ziel- und Kataloglisten. [2] [5] [6] [7] [23] [24] [39]

Ergebnisse zeigen immer Trefferzahl, aktive Filter und aktuelle Sortierung. Bei Nulltreffern werden Suchbegriff und Filter erhalten; die Oberfläche bietet alternative Schreibweisen, eine Filterkorrektur und eine explizite Wiederholung an. Ein Server-, Berechtigungs- oder Offline-Problem darf nicht als „keine Internetverbindung“ oder als leerer Katalog ausgegeben werden. Für Suche, Laden und Netzwerkzustand brauchen Nutzer verschiedene, handlungsfähige Meldungen. [6] [15] [31] [48]

### Web-Richtung

Die Websuche lässt sich mit Tastatur fokussieren und bietet Vorschläge vor dem Absenden. Sie gruppiert Treffer nach Objektart, ohne die Sortierung innerhalb einer Gruppe willkürlich zu ändern. Filterchips sind per Tastatur vollständig erreichbar und geben ihren aktiven Zustand aus. Das Öffnen eines Treffers, Browser-Back und das Schließen einer Ergebnisvorschau bewahren den eingegebenen Suchbegriff und alle Filter.

### Native-Richtung

Die native Suche erhält einen sichtbaren Eingabefokus, sprach- und schreibfehlertolerante Vorschläge sowie einen klaren Reset. Lade-, Keine-Treffer-, Offline- und Fehlerzustände werden als unterschiedliche, ansagbare Zustände modelliert. Der Fokus springt nach einer Suche zum Ergebnisbereich oder dessen Überschrift und nicht auf die globale Bottom-Navigation. Filterdialoge geben Auswahl und Ergebniswirkung verständlich wieder. [37] [39] [47] [49]

### Abnahmekriterien

Eine Suche nach einem gebräuchlichen, wissenschaftlichen und fehlerhaft geschriebenen Namen führt jeweils zu einem nachvollziehbaren Ergebnis oder einer hilfreichen Alternative. Ein Detailbesuch verwirft weder Suchtext noch Filter. Bei schlechter Verbindung bleibt klar, ob lokal gespeicherte Daten, unvollständige Ergebnisse oder ein Abruffehler vorliegen.

## 5. Katalog und Karte: eine verknüpfte, aber nicht voneinander abhängige Oberfläche

### Produktentscheidung

Der Katalog muss vor dem Öffnen eines Details genügend Entscheidungshilfe geben. Eine Katalogkarte enthält Name, Kategorie, relevante Region oder Ort, Prüf-/Verifikations- beziehungsweise Verfügbarkeitsstatus, Quelle und Aktualisierungszeit, sofern diese für die Entscheidung relevant sind. Sie zeigt nicht bloß ein Bild. Katalogdichte bedeutet nicht Informationsarmut: wenige klar priorisierte Metadaten und Filter sind einer Bilderwand vorzuziehen. [10] [11] [24] [35]

Karte und Liste bilden ein synchrones System. Suche und Filter wirken auf beide Ansichten; Listen erklären Trefferart und Datenherkunft. Die Karte ist eine Explorationsansicht, aber nie die einzige Bedienebene. Ein Kartencluster braucht eine verständliche Anzahl/Bedeutung und führt in eine gezielte Zoomstufe oder eine Ergebnisliste. Bei hoher Dichte helfen Filter, Zusammenfassungen oder Cluster statt einer gleichrangigen Pin-Flut. Diese Richtung wird durch die wiederkehrenden Forderungen nach Karte-plus-Listenalternative sowie durch die dokumentierten Accessibility-Probleme nicht benannter Marker und Cluster getragen. [2] [10] [24] [42] [43] [44] [45]

### Web-Richtung

Katalogfilter liegen oberhalb der Ergebnisliste und bleiben mit der Kartenansicht synchron. Kartenpolygone, Trails und überlappende Bereiche erhalten formnahe Interaktionsflächen. Bei mehreren möglichen Treffern öffnet sich eine klar beschriftete Auswahl statt eines zufälligen ersten Objekts. Neben der grafischen Karte existiert immer eine filterbare Ergebnisliste. Ein Bottom Sheet oder schwebendes Overlay darf Karteninteraktionen nicht verdecken oder darunter unabsichtlich weiterreichen.

### Native-Richtung

Jeder POI, Cluster und Kartencontrol erhält lokalisierten Namen, Kategorie, relevante Distanz oder Anzahl sowie einen eindeutigen Aktivierungszweck. Kartenlayer, Standortschalter und Umschalter verfügen über Name, Rolle und Zustand. Die grafische Karte wird durch dieselbe durchsuchbare Liste ergänzt, damit Entdecken und Auswahl ohne Pinch, Drag oder präzises Treffen eines Pins funktionieren. Überlappende Treffer öffnen eine Liste. Das ist zugleich eine bessere Touch- und Screenreader-Strategie. [29] [42] [43] [44] [45] [49]

### Abnahmekriterien

Eine Person kann jeden sichtbaren Katalogtreffer allein aus der Liste finden und auswählen. Ein Screenreader kündigt bei Kartelementen nicht nur „Map Marker“, sondern eine lokalisierte, entscheidungsrelevante Beschreibung an. Ein Filterwechsel hält Liste, Karte, Trefferzahl und Sortierung konsistent.

## 6. Farben und Typografie: semantisch, kontrastrobust und lokalisierungsfähig

### Farbrichtung

BlackWaterLeaf kann eine zurückhaltende Naturpalette verwenden, aber die Marke darf nicht die Lesbarkeit bestimmen. Die Farbsystematik basiert auf **semantischen Tokens** für Hintergrund, Fläche, Primärtext, Sekundärtext, Fokus, Link, Erfolg, Warnung, Fehler, Auswahl und Kartendaten – nicht auf einzeln über die Oberfläche verteilten Markenfarbwerten. Jeder Token wird in Hell- und Dunkelmodus gegen seinen tatsächlichen Hintergrund getestet. Besonders Karten brauchen getestete Kombinationen für Text, Pins, Flächen, Grenzen, aktive Auswahl und Hintergrundkarten. Wiederkehrende Berichte zu dunklen Elementen auf dunklem Grund, zu kollidierenden Markenfarben und zu nicht ausreichend unterscheidbaren Links stützen diese Priorität. [3] [13] [25] [26] [49] [50]

Status darf nie allein über Rot, Grün oder einen Farbton vermittelt werden. Ein Fehler kombiniert Farbe mit Text und Icon; ein Verifikationsstatus kombiniert Farbe mit Klartext; eine Kartenkategorie verwendet zusätzlich Form, Muster, Label oder eine Legende. Links bleiben durch eine dauerhafte nichtfarbliche Kennzeichnung erkennbar, etwa Unterstreichung oder ein klarer Link-Stil. Für normalen Text ist mindestens das in den Plattformleitlinien als WCAG-AA-Orientierung benannte Kontrastniveau von 4,5:1 anzustreben. [3] [25] [34] [49] [50]

### Typografierichtung

Die UI-Typografie orientiert sich an gut lesbaren Systemschriften und unterstützt systemseitige Textvergrößerung. Eine klare Hierarchie mit Seitentitel, Abschnittstitel, Karten-/Objekttitel, Metadaten und Hilfetext ersetzt den Versuch, Bedeutung über winzige Schrift, dünne Gewichte oder Farbe zu transportieren. Wissenschaftliche Namen können typografisch hervorgehoben werden, etwa kursiv, dürfen aber nicht die einzige semantische oder zugängliche Identifikation eines Objekts sein.

Die internationale Umsetzung behandelt Text nicht als austauschbaren String. BlackWaterLeaf verwendet vollständige lokalisierbare Nachrichtenvorlagen mit Platzhaltern und Rich-Text-Markup statt zusammengesetzter Satzfragmente. Layouts müssen LTR und RTL auf Container-, Reihenfolge-, Icon- und Ausrichtungsebene unterstützen. Es werden lange Übersetzungen, Schriftabdeckung, lokale Ortsnamen, Einheiten, Zahlen- und Datumsformate getestet. Ein Sprachwechsel darf weder eine Suche, Filter, Karte noch einen unveröffentlichten Entwurf zurücksetzen. [27] [28] [49] [50]

### Web-Richtung

Web-Komponenten verwenden relative Schriftgrößen und lassen Text bei Browserzoom umbrechen, statt Metadaten oder Primäraktionen abzuschneiden. Der sichtbare Tastaturfokus ist ein eigener semantischer Token und nicht nur eine leichte Farbänderung. Tabellenähnliche Kataloginformationen werden auf schmalem Viewport zu klaren Karten oder Zeilen umgeordnet, nicht auf eine unlesbar enge Desktop-Tabelle reduziert.

### Native-Richtung

iOS Dynamic Type und Android-Systemschriftgröße werden bis in Karten, Filterchips, Buttons, Karte-Labels und Dialoge durchgängig respektiert. Inhalt wächst vertikal, statt bei großer Schrift abgeschnitten oder überlagert zu werden. Sprach- und Schriftwechsel testen auch die Reihenfolge von Metadaten, nicht nur die Zeichenabdeckung. [8] [27] [28] [49] [50]

## 7. Accessibility: als Struktur der Kernreise implementieren

Accessibility ist keine Prüfliste am Ende. Die wiederkehrenden Quellensignale betreffen vollständige Wege: Navigation, Suche, Karten, Formfehler, asynchrones Laden, offlinenahe Nutzung und Freigaben. BlackWaterLeaf braucht daher ein gemeinsames semantisches Komponentenmodell für Web, iOS und Android. [13] [16] [34] [37] [38] [42] [49] [50]

Jede Kernaktion wird als echter, fokussierbarer Control implementiert. Web-Controls sind tastaturbedienbar und beschreiben Zustand und Wirkung; native Controls erhalten zugängliche Namen, Rolle und Wert. Nicht universell verständliche Icons führen sichtbaren Text oder einen zugänglichen Namen mit. Touch-Ziele werden großzügig dimensioniert und eng stehende Kartenaktionen nicht überlappend platziert. Formfehler erscheinen in verständlicher Sprache am betreffenden Feld, bleiben nach dem Absenden fokussierbar und werden nicht allein rot markiert. [16] [29] [34] [49] [50]

Feed- und Katalogkarten müssen als lineare Struktur funktionieren. Abschnittsüberschriften ermöglichen das Überspringen langer Bereiche. Inhalte und Handlungen innerhalb einer Karte bleiben einzeln erreichbar. Karte, Cluster, Layer und Standortschalter erhalten eine durchsuchbare Listenalternative; die visuelle Karte darf keine Voraussetzung für Recherche, Vergleich oder Auswahl sein. [38] [42] [43] [44] [45]

Asynchrone Controls sagen während der Verarbeitung ihren Zustand an und verhindern Doppelaktionen. Der Inhalt hinter einem Loading State darf nicht für Screenreader unsichtbar sein, während die globale Navigation den Fokus übernimmt. Tooltips, Dialoge oder Overlays dürfen Fokus nicht unbeabsichtigt festhalten; nach Schließen kehrt der Fokus logisch an den Auslöser zurück. [31] [37] [47]

## 8. Pull-to-Refresh und Datenaktualisierung: ein Zustandserhaltungsproblem, keine Geste

Die vorliegenden Quellen untersuchen Pull-to-Refresh nicht als eigenen, mehrfach bestätigten Nutzerwunsch. Sie liefern jedoch einen starken Mehrquellen-Konsens für die zugrunde liegenden Regeln: **asynchrone Aktualisierung muss ihren Status ehrlich anzeigen, Doppelaktionen verhindern und Route, Auswahl, Filter, Scrollposition, Kartenviewport sowie Eingaben bewahren**. [9] [15] [31] [46] [47] [48] Die folgende Richtung ist deshalb eine konservative Übertragung dieses Konsenses und muss mit BlackWaterLeaf-Nutzern getestet werden.

### Native-Richtung

Pull-to-Refresh darf nur auf vertikal scrollbaren Listen verwendet werden, in denen Aktualisierung erwartbar ist: etwa Entdecken, gespeicherte Suchergebnisse oder eine Katalogliste. Der Pull zeigt sofort eine sichtbare und ansagbare Aktualisierung. Bereits geladener, datenschutzverträglicher Inhalt bleibt lesbar. Während des Abrufs ist die Aktion gegen erneutes Auslösen geschützt. Bei Erfolg führt ein Sprung nicht still zum Listenanfang: Wenn neue Einträge oberhalb vorliegen, informiert ein Hinweis wie „12 neue Einträge verfügbar“ und lässt die Person den Zeitpunkt des Einfügens kontrollieren.

Die Geste ersetzt weder den Initial Load noch eine Fehlermeldung. Bei Offline, eingeschränkter Verbindung oder fehlender Berechtigung zeigt BlackWaterLeaf den zutreffenden Zustand und, wenn möglich, Alter und Herkunft des Caches. Für die Karte wird Pull-to-Refresh nicht als versteckte Konfliktgeste über dem Panning eingesetzt. Ein sichtbarer, beschrifteter Aktualisieren-Button ist dort die zuverlässigere Alternative. [42] [43] [48]

### Web-Richtung

Web bietet eine sichtbare Aktion **„Aktualisieren“** mit Tastaturzugang. Eine touchbasierte Pull-Geste kann ergänzend sein, darf aber nie die einzige Aktualisierungsmöglichkeit sein und darf nicht mit der Browser-Geste kollidieren. Der Refresh erhält einen Status in der Nähe des betroffenen Bereichs, bewahrt Suchtext und Filter und verändert die Reihenfolge nicht unkommentiert. Wenn der Datensatz neu sortiert wird, zeigt die Oberfläche den Grund und ermöglicht die Rückkehr zur vorherigen Ansicht.

### Abnahmekriterien

Ein Refresh bei schlechter Verbindung erhält sichtbare Inhalte und Kontext. Er sagt klar, ob aktualisiert wird, ob gecachte Daten gezeigt werden oder ob ein Fehler vorliegt. Er kann keine doppelte Schreibaktion erzeugen, setzt keinen Kartenzoom zurück und lässt den Screenreader-Fokus nicht auf einem globalen Navigationselement zurück.

## Ausdrückliche Anti-Patterns

Die folgenden Muster sind für BlackWaterLeaf auszuschließen, weil sie entweder über mehrere Quellen als schädlich wiederkehren oder direkt die obigen Konsensprinzipien verletzen.

1. **Kernziele hinter einem Hamburger-Menü verstecken oder ihre Position pro Release ändern.** Profil, gespeicherte Inhalte, Katalog und Suche verlieren dadurch ihre räumliche Verlässlichkeit. [1] [4] [12] [20] [23]
2. **Suche entfernen, nur als unbeschriftetes Icon führen oder durch lange, unfilterbare Dropdowns ersetzen.** Das skaliert weder für Arten noch Orte, Personen oder große Kataloge. [2] [5] [6] [23] [24]
3. **Zurück immer zur Startseite führen oder nach Laden/Reconnect Route, Filter, Zoom, Scrollposition und Suchtext verwerfen.** Technisch erfolgreiches Laden ist kein Erfolg, wenn der Arbeitskontext verloren geht. [9] [31] [37] [48]
4. **Ein leeres Canvas, einen Dauer-Spinner oder eine falsche Offline-Meldung zeigen, obwohl Inhalte nachladen, im Cache liegen oder ein spezifischer Fehler vorliegt.** Nutzer müssen Zustand, nächsten Schritt und Datenalter erkennen können. [6] [15] [31] [46] [48]
5. **Katalogkarten als reine Bilder ausliefern.** Name, Kategorie, relevanter Status, Quelle und Aktualisierung dürfen nicht vollständig hinter einem Tap versteckt werden. [10] [11] [24] [35]
6. **Eine Karte als einzige Such- und Auswahloberfläche behandeln.** Karten ohne zugängliche Liste, klar benannte Marker, Cluster und Layer schließen Nutzer aus und brechen bei hoher Dichte zusammen. [2] [24] [42] [43] [44] [45]
7. **Rechteckige oder überlappende Hotspots für unregelmäßige Zonen, Trails oder visuelle Objekte nutzen.** Fehlklicks und nicht vorhersehbare Auswahl sind besonders auf Karten ein systematischer Bedienfehler. [29] [42] [43]
8. **Komplexe Feed- und Katalogkarten als ein einziges Screenreader-Element modellieren oder Kernaktionen nur per Long-Press, Wisch- oder Mehrfinger-Geste anbieten.** Inhalte und Handlungen brauchen eine lineare, sichtbare und semantische Route. [38] [46] [49] [50]
9. **Kontrastarme Markenfarben, dunkle Icons auf dunklem Grund, kleine nicht skalierende Schrift oder nur farbige Statuscodes verwenden.** Das macht zentrale Informationen situations- und nutzerabhängig unsichtbar. [3] [8] [13] [25] [26] [49] [50]
10. **Lokalisierung als bloßen String-Tausch behandeln.** Zusammengesetzte Satzfragmente, fest verdrahtetes LTR und abgeschnittene lange Übersetzungen erzeugen falsche Reihenfolge und unlesbare Oberflächen. [27] [28] [49] [50]
11. **Freigabe- oder Exportlinks ausliefern, die mehr zeigen als angekündigt.** Bearbeitungsrechte, Kommentare, interne Notizen, exakte Standorte oder Login-Hürden dürfen nicht erst beim Empfänger sichtbar werden. [32] [33] [48]
12. **Pull-to-Refresh als versteckten Ersatz für einen Aktualisieren-Control verwenden oder ihn Karten-Panning, Initial Loading und Fehlerbehandlung überlassen.** Er muss Status, Kontext und Alternativbedienung bewahren. [31] [46] [47] [48]
13. **Algorithmen, Ranglisten, öffentliche Profile oder maximale Kartenlayerdichte als Standardannahme ausrollen.** Die Recherche liefert dafür keinen ausreichend wiederholten, produktübergreifenden Konsens. Entsprechende Funktionen benötigen zuerst einen validierten Nutzen- und Privacy-Test. [18] [19] [35] [51]

## Gemeinsame Web-/Native-Komponenten, die zuerst entstehen sollten

Ein kleines, verbindliches Designsystem reduziert Abweichungen zwischen Web und mobilen Apps. Der erste Bausteinsatz sollte keine Sammlung dekorativer Screens sein, sondern die folgenden zustandsfähigen Komponenten enthalten:

| Komponente | Gemeinsamer Vertrag | Web-Umsetzung | Native-Umsetzung |
|---|---|---|---|
| Hauptnavigation | Stabiler Name, aktiver Zustand, sichtbarer Rückweg, korrekte Fokusreihenfolge | Sidebar auf breit, Bottom-Navigation auf schmal; stabile URLs | Bottom-Navigation für Hauptbereiche, nativer Back-Stack für Hierarchie |
| Globale Suche | Begriff, Vorschläge, Filter, Sortierung, Trefferzahl und Fehlerzustand bleiben erhalten | Tastaturzugang, URL-Parameter, Ergebnisüberschriften | Native Suche, ansagbare Ergebnisse und Filterdialoge |
| Ergebnis-/Katalogkarte | Titel, Metadaten, Status, Quelle/Aktualität und einzeln zugängliche Actions | Semantische Überschrift, Links/Buttons, Tastatur-Reihenfolge | Semantische Gruppe mit linearem VoiceOver/TalkBack-Zugang |
| Karten-/Listenwechsler | Ein Datenbestand, ein Filterzustand, zwei gleichwertige Interaktionswege | Formnahe Pointer-Hit-Areas und Ergebnisliste | Benannte POIs/Cluster/Layer und vollständige Listenalternative |
| Lade-, Fehler- und Offlinezustand | Wahrer Status, Endgeometrie, erhaltene Eingabe, Retry und Cache-Hinweis | `aria-live` für Status; kein Layout Shift | Ansagbarer Status; Fokus bleibt auf sinnvoller Inhaltsposition |
| Freigabe-/Profilkontrolle | Sichtbarkeit, Empfänger, Datenumfang und Linkziel vor dem Commit klar | Empfängervorschau und rollebasierte Links | Gleiche Begriffe, sichtbare Controls und Accessibility-Aktionen |
| Aktualisierung | Keine Doppelaktion, Kontext bleibt erhalten, neue Daten werden kontrolliert eingefügt | Sichtbares „Aktualisieren“ plus optionale Touch-Geste | Standardkonformes Pull-to-Refresh nur in Listen; Button auf Karte |

## Validierung vor dem Rollout

Die Quellen sind qualitativ und öffentlich. BlackWaterLeaf sollte die Synthese daher als Priorisierung für echte Aufgaben-Tests verwenden. Die Testmatrix muss internationale Spracheinstellungen, schlechte Verbindung, große Systemschrift, Hell/Dunkel, Tastatur, VoiceOver und TalkBack einschließen. Wichtig sind keine reinen Vorlieben, sondern Erfolgsquote, Fehlklicks, Zeit bis zum relevanten Treffer, unbeabsichtigte Datenfreigabe und Wiederherstellbarkeit des Kontextes.

Die ersten fünf moderierten Kernaufgaben sind: eine Art oder ein Objekt in der Nähe finden; zwei Katalogeinträge vergleichen; eine Beobachtung nur mit einer bestimmten Gruppe teilen; einen fragwürdigen Beitrag melden; und eine Suche oder ein Detail bei Fehler, Offline-Zustand und Rückkehr fortsetzen. Jede Aufgabe wird auf Web, iOS und Android gegen dieselben fachlichen Erfolgskriterien geprüft, ergänzt um plattformspezifische Fokus- und Semantiktests. [16] [34] [37] [47] [49] [50]

## Grenzen der Evidenz

Die Quellensätze bestehen aus öffentlichen Diskussionen, Issue Trackern und Plattformleitlinien. Sie sind gut geeignet, wiederkehrende Bedien- und Vertrauensrisiken zu identifizieren, aber nicht repräsentativ für Größe oder Zusammensetzung von BlackWaterLeafs Zielgruppe. Reddit-, Forum- und GitHub-Threads sind keine quantitative Marktstudie. Designer News konnte in der zugrunde liegenden Recherche zudem nicht als gleichwertige aktuelle Diskussionsquelle bestätigt werden. Die Prioritäten P0/P1 stützen sich deshalb nur auf übereinstimmende Muster mehrerer Recherchepakete; Feature-Entscheidungen mit schwächerer Evidenz bleiben ausdrücklich zu testen.

## References

### Reddit- und UX-Community-Quellen

[1]: https://www.reddit.com/r/reddithelp/comments/1reh6xf/what_on_earth_is_going_on_with_the_mobile_app_ui/ "Reddit Help: What on earth is going on with the mobile app UI?"
[2]: https://www.reddit.com/r/UXDesign/comments/1riwelv/looking_for_honest_ux_feedbackrecommendation_on_a/ "r/UXDesign: Looking for honest UX feedback/recommendation on an app"
[3]: https://www.reddit.com/r/accessibility/comments/1c5w1ni/changes_to_reddits_link_color_contrast/ "r/accessibility: Changes to Reddit’s link color contrast"
[4]: https://www.reddit.com/r/help/comments/1araubc/why_i_think_the_2024_reddit_ui_refresh_is_worse/ "Reddit Help: Why I think the 2024 Reddit UI refresh is worse"
[5]: https://www.reddit.com/r/help/comments/1e1vge3/reddit_mobile_search_different/ "Reddit Help: Reddit mobile search different"
[6]: https://www.reddit.com/r/help/comments/1g3cjy6/search_function_not_working_on_app/ "Reddit Help: Search function not working on app"
[7]: https://www.reddit.com/r/help/comments/1gr0930/comment_search_button_has_disappeared_ios/ "Reddit Help: Comment search button has disappeared on iOS"
[8]: https://www.reddit.com/r/UXDesign/comments/1e8oiet/designing_for_seniors/ "r/UXDesign: Designing for seniors"
[9]: https://www.reddit.com/r/androiddev/comments/1l7jqhb/is_this_considered_bad_ux_the_way_my_app_opens_up/ "r/androiddev: Is this considered bad UX?"
[10]: https://www.reddit.com/r/UXDesign/comments/1kfj234/flora_market_mobile_app/ "r/UXDesign: Flora Market mobile app"
[11]: https://www.reddit.com/r/UI_Design/comments/1ovjq6i/catalog_app_ui_that_need_to_handle_100s_of_pages/ "r/UI_Design: Catalog app UI that needs to handle hundreds of pages"

### Indie Hackers und Designer News

[12]: https://www.indiehackers.com/post/mobile-app-development-mistakes-to-avoid-in-2024-921105b919 "Indie Hackers: Mobile app development mistakes to avoid in 2024"
[13]: https://www.indiehackers.com/post/my-experience-in-building-mobile-apps-7014ed00f5 "Indie Hackers: My experience in building mobile apps"
[14]: https://www.indiehackers.com/post/designing-in-public-LluhiPxTjluidRB1JRdm "Indie Hackers: Designing in public"
[15]: https://www.indiehackers.com/post/hey-ih-solo-coders-community-your-products-arent-ready-a4bcdac896 "Indie Hackers: Your products aren’t ready"
[16]: https://www.indiehackers.com/post/i-built-a-tool-that-scans-websites-for-accessibility-issues-and-generates-prioritized-compliance-reports-2bea675c9b "Indie Hackers: Accessibility scanner and prioritized compliance reports"
[17]: https://www.indiehackers.com/post/your-feedback-needed-cd5ee30bea "Indie Hackers: Your feedback needed"
[18]: https://www.indiehackers.com/post/launching-travellog-a-personal-travel-tracking-app-RkZWL4XKBO7BauzhkPCV "Indie Hackers: Launching Travellog, a personal travel tracking app"
[19]: https://www.indiehackers.com/post/after-traveling-to-65-countries-i-still-couldn-t-find-a-decent-travel-app-here-is-my-story-of-building-one-based-on-my-experience-R3etH7KWmZ8NiuKkfJWF "Indie Hackers: Travel app product story"
[20]: https://www.indiehackers.com/post/spent-today-redesigning-almost-the-entire-app-heres-the-before-after-66ab818f89 "Indie Hackers: Redesigned almost the entire app"
[21]: https://web.archive.org/web/20240101222055id_/https://www.designernews.co/ "Internet Archive: Designer News homepage, 1 January 2024"
[22]: https://web.archive.org/web/20240101222055id_/https://www.designernews.co/stories/137048-creative-travel-app-design "Internet Archive: Designer News creative travel app design story"

### Figma- und UX-Forum-Quellen

[23]: https://forum.figma.com/forum-news-and-guidelines-25/big-news-our-community-forum-is-getting-a-makeover-january-8th-2025-1908 "Figma Forum: Community forum makeover"
[24]: https://forum.figma.com/suggest-a-feature-11/add-a-search-bar-in-destination-menu-of-the-prototype-mode-27848 "Figma Forum: Add search bar in destination menu of prototype mode"
[25]: https://forum.figma.com/suggest-a-feature-11/dark-components-on-dark-mode-are-low-contrast-32404 "Figma Forum: Dark components on dark mode are low contrast"
[26]: https://forum.figma.com/suggest-a-feature-11/change-ruler-color-16404 "Figma Forum: Change ruler color"
[27]: https://forum.figma.com/suggest-a-feature-11/text-alignment-as-a-variable-21567 "Figma Forum: Text alignment as a variable"
[28]: https://forum.figma.com/ask-the-community-7/is-there-a-solution-for-stylizing-portion-of-a-variable-string-15809 "Figma Forum: Stylizing a portion of a variable string"
[29]: https://forum.figma.com/suggest-a-feature-11/use-shape-boundaries-for-interactive-hotspot-instead-of-rectangular-bounding-box-36011 "Figma Forum: Use shape boundaries for interactive hotspots"
[30]: https://forum.figma.com/ask-the-community-7/disable-scrolling-under-a-bottom-sheet-37147 "Figma Forum: Disable scrolling under a bottom sheet"
[31]: https://forum.figma.com/report-a-problem-6/loading-state-redirection-to-first-page-makes-figma-unusable-43036 "Figma Forum: Loading-state redirection to first page makes Figma unusable"
[32]: https://forum.figma.com/report-a-problem-6/figma-slides-share-a-plain-audience-link-without-the-ability-to-open-in-figma-view-slide-notes-or-add-comments-8943 "Figma Forum: Share a plain audience link without editing access"
[33]: https://forum.figma.com/suggest-a-feature-11/figma-slides-internal-links-between-slides-shouldn-t-become-external-links-when-exporting-to-pdf-27062 "Figma Forum: Internal links should not become external in PDF export"
[34]: https://www.reddit.com/r/UXDesign/comments/1fnpg60/accessibility_for_error_messages/ "r/UXDesign: Accessibility for error messages"
[35]: https://www.reddit.com/r/UXDesign/comments/1egqwze/whats_the_most_popular_poorly_designed/ "r/UXDesign: What’s the most popular poorly designed app?"
[36]: https://www.reddit.com/r/UXDesign/comments/1aofcov/intch_contract_work/ "r/UXDesign: Intch contract work"

### iOS-, Android- und Open-Source-Quellen

[37]: https://developer.apple.com/forums/thread/781557 "Apple Developer Forums thread 781557: VoiceOver navigation and focus"
[38]: https://developer.apple.com/forums/thread/780065 "Apple Developer Forums thread 780065: VoiceOver navigation in complex cards"
[39]: https://issuetracker.google.com/issues/272065229 "Google Issue Tracker 272065229: Accessibility focus issue"
[40]: https://issuetracker.google.com/issues/332391868 "Google Issue Tracker 332391868: HorizontalPager accessibility issue"
[41]: https://issuetracker.google.com/issues/354109776 "Google Issue Tracker 354109776: Carousel semantics issue"
[42]: https://github.com/googlemaps/android-maps-compose/issues/706 "Google Maps Compose issue 706: Accessibility of map clusters"
[43]: https://github.com/googlemaps/android-maps-compose/issues/683 "Google Maps Compose issue 683: Accessibility of map markers"
[44]: https://github.com/fmidev/weather-app/issues/1026 "Finnish Meteorological Institute Weather App issue 1026: Map accessibility"
[45]: https://github.com/fmidev/weather-app/issues/1027 "Finnish Meteorological Institute Weather App issue 1027: Map layer accessibility"
[46]: https://github.com/signalapp/Signal-Android/issues/14206 "Signal Android issue 14206: Accessibility actions for chats and messages"
[47]: https://github.com/Orange-OpenSource/ouds-flutter/issues/386 "Orange Open Source issue 386: Loading button accessibility semantics"
[48]: https://github.com/department-of-veterans-affairs/va-mobile-app/issues/10884 "VA Mobile App issue 10884: Offline and low-connectivity experience"
[49]: https://developer.android.com/guide/topics/ui/accessibility/principles "Android Developers: Accessibility principles"
[50]: https://developer.apple.com/design/human-interface-guidelines/accessibility "Apple Human Interface Guidelines: Accessibility"
[51]: https://github.com/orgs/organicmaps/discussions/9436 "Organic Maps discussion 9436: Map detail and accessibility preferences"
[52]: https://github.com/inaturalist/iNaturalistAndroid/issues/1401 "iNaturalist Android issue 1401: Observer avatar consistency"
