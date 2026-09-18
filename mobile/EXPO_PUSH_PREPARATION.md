# BlackwaterLeaf Native: Expo-Pushvorbereitung

Die neue native Anwendung befindet sich bewusst im aktuellen Repository unter `mobile/`. Sie ist eine konsumorientierte BlackwaterLeaf-App, nicht die getrennte Studio-Anwendung. Die verbindliche visuelle Referenz bleibt **`BlackwaterLeaf-Design-Handoff.zip`**; insbesondere `docs/design/screens/` und `docs/design/INTERACTIVE_PAGE_SCREENS.md` sind der Screenshot-Vertrag für Web und Native.

Die App übernimmt die dunkle Regenwald-/Glasfläche, die vier Bereichsfarben sowie die Hauptnavigation aus der Referenz. Die Akzentwerte sind Botanik `#C7F35B`, Aquaristik und Live `#28D8FF`, Terraristik `#E1D661` und KI `#C36BFF`. Nicht vorhandene Daten werden transparent dargestellt: Community, Live, Profil und Wissen simulieren keine Konten, Messwerte, Streams oder Artikel.

`eas.json` enthält vorbereitete Profile für Development, Preview und Production. Es wurde **kein** Expo-Projekt erstellt und kein Update oder Store-Build ausgelöst. Vor dem ersten Expo-Push ist einmalig im Ordner `mobile/` `npx eas-cli@latest init` mit dem gewünschten Expo-Konto auszuführen. Dadurch wird die bestehende bzw. neu gewählte Expo-Projekt-ID nach `app.json` geschrieben. Danach folgen `pnpm typecheck`, `npx expo config --type public`, ein interner Preview-Build mit `npx eas-cli@latest build --profile preview --platform all` und erst dann ein nicht produktiver OTA-Test mit `npx eas-cli@latest update --channel preview --message "Design-Update: verbindliches Overlay"`.

Ein Produktions-Update oder eine Store-Einreichung ist absichtlich nicht vorbereitet und erfordert eine separate Freigabe.
