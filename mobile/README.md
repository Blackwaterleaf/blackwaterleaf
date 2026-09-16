# BlackWaterLeaf Studio Android Client

Separate Expo/React-Native client for `BlackWaterLeaf Studio`.

## Sicherheitsgrenze

Der Android-Client führt keinen beliebigen Code aus, mountet keine Dateien und entscheidet keine Rollen. Er ist nur eine Oberfläche für serverseitig bestätigte Workspace-, Task-, Approval- und Audit-Zustände. Echte Agentenarbeit läuft im Studio-Control-API-Prozess; ein isolierter Worker muss vor Produktivfreigabe separat betrieben, getestet und über eine authentifizierte API angebunden werden.

## Mobile Freigaben und Push

Auf einem physischen Android-Gerät fordert der Client Push-Berechtigung an, registriert das Expo-Token und verarbeitet Notification-Taps mit `approvalId`. Neue Approval-Anforderungen werden serverseitig an aktive Geräte der Workspace-Rollen `owner`, `admin` und `reviewer` gesendet. Der Freigaben-Tab zeigt Push-Status und eingehende Bestätigungen.

Der Control-API-Adapter in `api.ts` stellt zwei geschützte Aufrufe bereit:

- `registerPushToken(accessToken, expoPushToken)` registriert das Gerät serverseitig.
- `getPendingApprovals(accessToken)` lädt ausschließlich ausstehende Freigaben.

Der `accessToken` stammt aus dem mobilen Manus-OAuth-Callback und darf nur im SecureStore liegen. Ohne authentifizierten Token lädt der Client keine Workspace-Daten und sendet keine ungeschützten Requests.

## App identity

- Android package: `com.blackwaterleaf.studio`
- iOS bundle identifier: `com.blackwaterleaf.studio`
- Web/nature package `com.blackwaterleaf` is not reused.

## Lokaler Start

```bash
pnpm install
pnpm typecheck
pnpm start
```
