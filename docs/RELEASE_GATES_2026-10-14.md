# BlackWaterLeaf Studio – Release-Gates

Stand: 2026-10-14

## Abgeschlossen und produktiv

- IONOS-Server mit Ubuntu 24.04, MariaDB, Node-Dienst, Nginx, UFW, SSH-Healthcheck und TLS.
- `blackwaterleaf-studio.com` und `www` zeigen auf den Cloud-Server.
- Resend-Domain, DKIM, SPF und Versand sind verifiziert.
- Unabhängige Magic-Link-Anmeldung ist aktiv. Der End-to-End-Test erzeugte einen HTTP-302-Redirect und ein `studio_session`-Cookie.
- Manus-OAuth wird im Local-Auth-Modus nicht verwendet und erzeugt keine fehlende-`OAUTH_SERVER_URL`-Fehlermeldung mehr.

## Bewusst nicht freigeschaltet

### 1. Isolierte Code-Sandbox / Worker

Der Control-Plane-Worker, die Queue, Leasing-Logik und der Kill-Switch sind aktiv. Die Ausführung nicht vertrauenswürdiger, generierter Programme bleibt jedoch **deny-by-default gesperrt**.

Grund: Ein rootloser Bubblewrap-Test konnte auf dem IONOS-Kernel die Netzwerk-Namespace-Isolation nicht herstellen. Ein root-Preflight funktioniert, wäre aber für den Node-Dienst ohne einen separat geprüften Privilege-Broker nicht ausreichend. Bubblewrap ist installiert; die Anwendung meldet deshalb weiterhin `isolated-worker-not-configured` und führt keinen fremden Code aus.

Für die Freischaltung fehlen eine separat geprüfte Runner-Service-Grenze, Ressourcen-Cgroups, Egress-Allowlist/Proxy, Workspace-Mounts, Cleanup und negative Escape-/SSRF-Tests.

### 2. Video-Provider / Render-Worker

Der Video-Kostenkalkulator, Credit-Schätzung, Approval-Gate und Video-Job-Datensatz sind produktiv. Es ist absichtlich kein kostenpflichtiger externer Video-Provider hinterlegt und kein Render-Worker aktiviert. Dadurch entstehen keine unbeabsichtigten Providerkosten und kein Job wird fälschlich als gerendert gemeldet.

Für die Aktivierung braucht es einen konkret gewählten Provider, einen serverseitigen Key, eine Quote, einen lokalen oder externen Render-Adapter und einen echten Abnahme-Job.

### 3. Zahlungsanbieter / Rechnungslogik

Preise, Credits und Usage-Ledger sind aktiv. Zahlungen, automatische Abbuchungen und Rechnungen bleiben absichtlich deaktiviert. Es wurde kein Zahlungsanbieter konfiguriert und es wird kein Kauf oder keine Zahlung ohne rechtliche Prüfung, Merchant-Konfiguration und ausdrückliche Freigabe durchgeführt.

## Sicherheitsregel

Ein Gate gilt nur dann als freigeschaltet, wenn die technische Abnahme nachweisbar erfolgreich ist. Statusanzeigen dürfen keine konfigurierte Sandbox, einen fertigen Video-Render oder aktive Zahlungen vortäuschen.
