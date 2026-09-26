# BlackWaterLeaf Native · Android-Performance-Audit · 27. September 2026

## Geprüft

- Native-TypeScript: erfolgreich
- Android-Export mit Expo SDK 57: erfolgreich
- Exportiertes Android-Hermes-Bundle: erzeugt unter `/tmp/bwl-native-export`
- Öffentliche API-Erreichbarkeit:
  - `https://blackwaterleaf.com/api/trpc/platform.availability` → HTTP 200
  - `https://bwlparity-nearrhpw.manus.space/api/trpc/platform.availability` → HTTP 200
- Kein temporärer Sandbox-Origin mehr im Native-Laufzeitcode
- Native API-Origin ist über `EXPO_PUBLIC_API_ORIGIN` oder `app.json.extra.apiOrigin` konfigurierbar

## Performance-Regeln im aktuellen Code

- `BlurView` wird auf Android nicht als globaler Hintergrund verwendet (`USE_BACKGROUND_BLUR = Platform.OS !== "android"`).
- Android-Glow nutzt geringe Werte: Schattenradius 4, Opazität 0,08 und Elevation 2.
- Android-Soft-Shadow nutzt Schattenradius 2, Opazität 0,04 und Elevation 1.
- Die Native-Anlagenliste verwendet `FlatList`.
- Keine neuen dauerhaft animierten Blur-/Glow-Flächen wurden hinzugefügt.

## Nicht vortäuschbarer Resttest

Zum Zeitpunkt des Audits war kein Samsung S10 oder S23 Ultra per ADB mit der Sandbox verbunden. Ein echter Framerate-, Scroll-, Upload-, Galerie- und Login-Test auf diesen beiden Geräten kann deshalb erst mit einem angeschlossenen Gerät durchgeführt werden. Das ist ein manueller Abnahmetest, kein ungeprüfter Codefehler.

## Abnahmeschritte auf den Geräten

1. APK installieren und anmelden.
2. Home, Entdecken, Community und Profil öffnen.
3. Eigene Anlage laden, Pflegezustand ändern und speichern.
4. Prüfen, dass „Aktualisiert“ und Pflegechip nach Neustart erhalten bleiben.
5. Drei Bilder hochladen, Galerie öffnen, vor/zurück navigieren und ein Bild löschen.
6. Community-Bild und Video testen.
7. Auf S10 besonders Scrollen, Blur-Ersatzflächen, Tastatur und Upload beobachten.
8. Bei Rucklern zuerst Karten- und Galerieflächen einzeln profilieren; keine globale Blur-Aktivierung auf Android setzen.
