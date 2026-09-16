# Funktions- und Routenzustandsprüfung – BlackWaterLeaf

**Gesamturteil: bedingt freigabefähig.** Die Kernwege sind überwiegend echt verdrahtet: `App.tsx` deckt die sichtbaren Zielrouten ab, LeafCore und AppShell verlinken auf vorhandene Ziele, und die verwendeten tRPC-Prozeduren existieren im Wurzelrouter. Für Feed, Profil, Bereiche, Wissen, KI, Marktplatz und Admin sind Lade-, Fehler-, Leer- oder Sperrzustände größtenteils explizit umgesetzt. Die V2-Referenzkomposition ist statisch erfüllt: Sensorleiste, Hero, Weltkarten, Blattkern, Vierer-Mobilnavigation und die wiederverwendeten Reference-Overlay-Komponenten sind vorhanden.

Es bestehen jedoch fünf funktionale Restmängel. Besonders relevant sind stille Parameter-Fallbacks und ein defekter Profilanker. Sie können Nutzende auf einen unzutreffenden Bereich leiten oder eine zugesagte Zielaktion nicht erreichen lassen. Es wurden **keine Änderungen** vorgenommen.

| Schweregrad | Befund | Konkrete Evidenz | Sichere Lösungsempfehlung |
|---|---|---|---|
| **Hoch** | Ungültige Parameter führen still in einen anderen Fachbereich statt in einen klaren Routenzustand. | `Realm.tsx:45` ersetzt jeden unbekannten Wert von `/world/:realm` durch `botany`; `FlowDestination.tsx:59` ersetzt jeden unbekannten Wert von `/flow/:flow` durch `live`. Damit zeigt z. B. `/world/unbekannt` die Botanik und `/flow/unbekannt` den Live-Bereich, obwohl die Zielroute nicht existiert. | Parameter gegen die erlaubten Schlüssel validieren. Bei ungültigem Wert `NotFound` oder einen `StatePanel`-Fehlerzustand wie `ROUTE / INVALID_REALM` bzw. `ROUTE / INVALID_FLOW` rendern; keine semantisch fremde Ersatzseite anzeigen. Tests für beide ungültigen Parameter ergänzen. |
| **Mittel** | Die mehrfach beworbenen Ziele „Meine Anlagen & Werte“ sind keine funktionierenden Ankerziele. | Die Karten in `Realm.tsx:24–32` und `FlowDestination.tsx:16` verlinken auf `/profile#habitats`. `HabitatProfiles.tsx:196–222` rendert aber kein Element mit `id="habitats"`; der Bereich ist zudem ein zunächst geschlossenes `<details>`. Der Hash kann daher weder ein Ziel finden noch die Anlagenverwaltung öffnen. | Dem Habitat-Bereich die ID `habitats` geben und den Bereich bei vorhandenem Hash beim Laden öffnen und fokussieren. Alternativ eine eigene Profil-Route/Query für „Anlagen“ einführen. Den Deep-Link mit einem Browser-/Komponententest absichern. |
| **Mittel** | Als „KÜNFTIG“ markierte Auswahlkarten bleiben bedienbare, aber folgenlose Buttons. | `ReferenceOverlay.tsx:55–59` kennzeichnet `unavailable`, rendert anschließend aber stets einen `<button>` ohne `disabled` und ruft nur optional `action.onActivate?.()` auf. Karten ohne `href` und ohne Callback tun beim Klicken nichts. Betroffen sind u. a. Pflanzenbestimmung in `Realm.tsx:26`, Hinweise/KI/Video in `FlowDestination.tsx:17,26,35` sowie beide Wissenskarten in `Knowledge.tsx:18–19`. | Für `unavailable` ein semantisch deaktiviertes Element mit `disabled` und `aria-disabled="true"` rendern, Chevron/Hover-Aktivzustand entfernen und die Einschränkung als nicht verfügbare Information belassen. Falls ein Klick gewünscht ist, stattdessen ein erklärendes Dialog- oder Statuspanel öffnen. |
| **Mittel** | Ein Fehler beim Laden privater Anlagen wird als leerer Bestand fehlinterpretiert. | `HabitatProfiles.tsx:169` setzt bei fehlender Query-Antwort `records` auf `[]`. Nach der Ladeanzeige folgt direkt bei `records.length === 0` der Leertext (`:212`); ein Zweig für `habitats.isError` fehlt. Eine nicht erreichbare Datenbank bzw. tRPC-Fehler erscheint somit wie „keine Anlagen“. | Vor dem Leerzustand einen expliziten `habitats.isError`-Zweig mit `StatePanel` oder gleichwertigem Fehlertext und Wiederholungsaktion rendern. Den leeren Zustand ausschließlich bei erfolgreich geladener, tatsächlich leerer Antwort zeigen. |
| **Mittel** | Die sichtbare „Gefällt mir“-Aktion besitzt keine Fehlerbehandlung. | `Community.tsx:50` führt `likePost.mutateAsync` ohne `try/catch` oder `onError` aus; der Klick in `Community.tsx:60` verwirft das Promise mit `void like(post.id)`. Bei Server-, Berechtigungs- oder Netzwerkfehlern gibt es keinen Status für Nutzende und potenziell eine unbehandelte Promise-Rejection. | Die Mutation mit `onError` oder `try/catch` an einen sichtbaren Fehlerstatus/Toast binden, die betroffene Aktion während der Anfrage gezielt sperren und nur nach Erfolg invalidieren. Den Fehlerpfad mit einem Mutationstest abdecken. |

## Positiv bestätigte Bereiche

Die sichtbaren CTAs der Hauptnavigation, Startseite, Weltkarten, LeafCore, Login-/Registrierungsseite, Marktplatz und Produktdetailseiten führen auf registrierte Routen oder auf klar gekennzeichnete externe Partnerangebote. Der Marktplatz trennt lokale Merkliste und externen Kauf sauber und hat Lade-, Fehler-, Leer-, Filter- und ungültige Produkt-ID-Zustände. KI-Funktionen sind nicht als Scheinfunktion umgesetzt: Chat, Bildanalyse und Aquarium-Analyse rufen echte geschützte tRPC-Mutationen auf und zeigen bei Anmeldung, Einwilligung oder nicht verfügbarem Dienst klare Sperrtexte. Smart-Geräte sind transparent als private Vorauswahl ohne Verbindung abgegrenzt; die Auswahl und das Entfernen sind als tRPC-Aktionen implementiert.

Die geprüften Client-Endpunkte stimmen mit den Routern überein, darunter `auth`, `profile`, `habitats`, `observations`, `community`, `assistant`, `partners`, `sensors`, `smartDevices`, `admin`, `platform` und `gamification`. Für die wesentlichen Datenseiten bestehen explizite Lade-/Fehler-/Leer- bzw. Berechtigungspanels. Eine Ausnahme ist der oben genannte unabhängige Anlagen-Query.

## V2-Referenzkomposition und Teststatus

Die verbindliche V2-Komposition ist im Code und in den vorhandenen Referenztests eingehalten. `Home.tsx` ordnet Sensorleiste, Nature-Hero, Welt-Auswahl und LeafCore in der geforderten Reihenfolge an. `ReferenceOverlay.tsx` liefert einheitlich Hero, Auswahlkarten und ehrliche Leerzustände; Explore, Community, Profil, Wissen, KI und Bereiche verwenden diese Bausteine. Die mobile Navigation enthält die vorgesehenen vier Ziele. Die vollständige Testsuite lief erfolgreich: **37 Testdateien, 139 Tests bestanden**. Zusätzlich liefen `pnpm check` und der Produktionsbuild erfolgreich.

Die Tests sind überwiegend statische Quellvertragsprüfungen. Es fehlen insbesondere Abdeckungen für ungültige Routenparameter, den Profil-Hash-Anker, die semantische Deaktivierung künftiger Karten, unabhängige Anlagen-Ladefehler und den Fehlerpfad der Like-Mutation. Eine laufende, mit Datenbank und Authentifizierung versehene End-to-End-Prüfung war nicht Teil dieser statischen Prüfung.

## Referenzen

[1]: client/src/App.tsx "Routenregistrierung der Client-Anwendung"
[2]: client/src/components/ReferenceOverlay.tsx "V2-Referenzkarten und Zustandskomponenten"
[3]: client/src/pages/Realm.tsx "Bereichsrouten und Beobachtungsfunktion"
[4]: client/src/pages/FlowDestination.tsx "LeafCore-Zielzustände und Foto-Flow"
[5]: client/src/components/HabitatProfiles.tsx "Private Anlagenverwaltung"
[6]: client/src/pages/Community.tsx "Community-Feed und Interaktionen"
[7]: server/reference-layout.test.ts "V2-Referenzlayouttest"
[8]: server/reference-overlay-routes.test.ts "V2-Overlay- und Routentest"
[9]: server/ui-state-contract.test.ts "Vertrag für ehrliche UI-Zustände"
[10]: package.json "Test-, Typprüfungs- und Build-Skripte"
