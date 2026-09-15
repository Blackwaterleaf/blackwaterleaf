# BlackWaterLeaf Studio Android Client

Separate Expo/React-Native client for `BlackWaterLeaf Studio`.

## Sicherheitsgrenze

Der Android-Client führt keinen beliebigen Code aus, mountet keine Dateien und entscheidet keine Rollen. Er ist nur eine Oberfläche für serverseitig bestätigte Workspace-, Task-, Approval- und Audit-Zustände. Echte Agentenarbeit läuft im Studio-Control-API-Prozess; ein isolierter Worker muss vor Produktivfreigabe separat betrieben, getestet und über eine authentifizierte API angebunden werden.

## App identity

- Android package: `com.blackwaterleaf.studio`
- iOS bundle identifier: `com.blackwaterleaf.studio`
- Web/nature package `com.blackwaterleaf` is not reused.

## Next integration step

Configure the native OAuth callback and the Studio API base URL for the target deployment. The UI intentionally renders an empty state until it receives real server data; it does not ship seeded demo tasks or simulated run results.
