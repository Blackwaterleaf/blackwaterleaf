# IONOS-Deployment und Kostenpfade

## Aktueller Zustand

Die IONOS-Integration ist im Studio als sicherer serverseitiger Adapter vorbereitet, aber standardmäßig deaktiviert. Es gibt aktuell keinen IONOS-Connector in der Session-Konfiguration und keinen API-Token im Projekt. Deshalb wird kein Server automatisch angelegt, verändert oder veröffentlicht.

Sobald IONOS-Zugangsdaten sicher als Server-Umgebungsvariablen gesetzt sind, kann das Studio Readiness und Serverbestand prüfen. Die relevanten Variablen sind `IONOS_ENABLED`, `IONOS_API_TOKEN`, `IONOS_DATACENTER_ID`, `IONOS_EXECUTION_SERVER_ID` und optional `IONOS_API_BASE_URL`. Der Token darf nur serverseitig verfügbar sein.

## Empfohlene Trennung

Der IONOS-Server sollte zunächst als **Execution Plane** dienen. Control Plane, Benutzeroberfläche und Datenbank bleiben getrennt. Preview- und Staging-Projekte laufen in kurzlebigen, eingeschränkten Workspaces. Produktionsdeployments benötigen weiterhin ein separates Approval, einen getesteten Build und einen Rollback-Punkt.

Für den Start ist ein IONOS VPS beziehungsweise Cloud Cube mit mindestens 2 vCPU und 4 GB RAM sinnvoll. Die eigentliche Sandbox sollte zusätzlich über Container- oder MicroVM-Isolation, keinen unbeschränkten Host-Mount, restriktiven Egress, Ressourcenlimits, Zeitlimits, Kill-Switch und Artefakt-Scanning verfügen. Ein einzelner Server ersetzt keine Isolation.

## Preisreferenz für die Produktlogik

Die offiziellen IONOS-Seiten zeigen derzeit folgende Cloud-Cube-Beispiele in US-Dollar: Basic Cube XS mit 1 vCPU und 2 GB RAM für 0,008 USD pro Stunde beziehungsweise 5,76 USD pro 30 Tage; Basic Cube S mit 2 vCPU und 4 GB RAM für 0,014 USD pro Stunde beziehungsweise 10,08 USD pro 30 Tage; Basic Cube M mit 4 vCPU und 8 GB RAM für 0,026 USD pro Stunde beziehungsweise 18,72 USD pro 30 Tage. Die Cloud-Server werden minutengenau nach aktiver Laufzeit abgerechnet. Steuern, Speicher-Add-ons, Backups, Datenbank, Domain, Monitoring und LLM-Kosten sind separat zu kalkulieren.

Für dauerhafte Agenten-Worker sind die IONOS VPS+-Beispiele preislich planbarer: VPS S+ mit 1 vCore, 2 GB RAM und 60 GB NVMe wird mit 6 USD regulär beziehungsweise 2 USD für die ersten drei Monate bei einjähriger Laufzeit angezeigt; VPS M+ mit 2 vCores, 4 GB RAM und 120 GB NVMe mit 14 USD regulär beziehungsweise 5 USD im Einführungszeitraum. Aktionspreise dürfen nicht als dauerhafte Produktkosten verwendet werden.

## BlackWaterLeaf-Preispfade

Der Studio-Preis sollte nicht nur den Serverpreis weiterreichen. Der interne Kostenrechner sollte mindestens Grundinfrastruktur, aktive Worker-Minuten, Preview-/Storage-Verbrauch, Backups, Netzwerk, Monitoring und LLM-/Tool-Kosten getrennt führen. Nutzerfreundliche Pakete können daraus abgeleitet werden: **Starter** mit begrenzten Worker-Minuten, **Builder** mit mehreren parallelen Projekten und **Team/Enterprise** mit Freigaben, Audit, SSO und eigener Execution Plane.

Die zentrale Kostenregel lautet: keine unbegrenzten Agentenschleifen. Jeder Auftrag erhält ein Zeit-, Schritt-, Token-, Speicher- und Kostenbudget. Bei Überschreitung wird pausiert und ein Approval angefordert.

## Quellen

[1]: https://www.ionos.com/cloud/cloud-servers "IONOS Cloud Servers und Cloud-Cube-Preise"
[2]: https://www.ionos.com/servers/vps "IONOS VPS+-Preise und Ressourcen"
[3]: https://www.ionos.com/help/server-cloud-infrastructure/cloud-panel-management/api/cloud-server-api-general-information/ "IONOS Cloud Server API"
[4]: https://docs.ionos.com/cloud/reference "IONOS Cloud API Developer Reference"
