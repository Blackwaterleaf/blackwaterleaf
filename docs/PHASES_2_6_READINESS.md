# BlackWaterLeaf Studio – Phasen 2–6 Readiness

## Phase 2: Policy und Capabilities

Die Control Plane besitzt jetzt eine statische Capability Registry und eine deterministische Deny-by-default-Policy. Netzwerkzugriffe, Secret-Nutzung, Sandbox-Ausführung, Publishing und Rollenänderungen benötigen eine konkrete Freigabe. Jede Entscheidung erhält eine reproduzierbare Policy-ID. Rohsecrets werden weder im Browser noch in der Datenbank gespeichert.

## Phase 3: Artefakte und Provider

Artefakte werden serverseitig dekodiert, auf 10 MiB begrenzt, gehasht und unter einem Workspace-Prefix gespeichert. Die Datenbank speichert ausschließlich Metadaten und Storage-Keys. Kimi ist als serverseitiger OpenAI-kompatibler Adapter vorbereitet, bleibt aber standardmäßig deaktiviert. Aktivierung erfordert `KIMI_API_KEY`, `KIMI_ENABLED=true` und `AGENT_PROVIDER=kimi`.

## Phase 4: Sandbox Execution Plane

Der Sandbox-Vertrag verlangt ein unveränderliches Image-Digest, begrenzte Laufzeit, maximal 512 MiB Arbeitsspeicher, CPU-Limit, keine Host-Mounts, keine Secrets in Umgebungsvariablen und standardmäßig keinen Netzwerk-Egress. Der Vertrag ist implementiert und prüfbar; die eigentliche MicroVM- oder Container-Execution-Plane ist noch nicht aktiviert, weil dafür ein persistenter Worker mit isolierter Runtime, Image-Registry und Egress-Netzwerk benötigt wird.

## Phase 5: Enterprise Governance

Vorbereitet sind Workspace-Isolation, Rollen, Approval-Audit, Hash-verkettete Evidence-Ereignisse, Queue-Leases, Retry-/Dead-Letter-Zustände, Kill-Switch und Providerstatus. Für ein Enterprise-Release fehlen noch SSO/SAML, SCIM, zentrale Secret-Management-Anbindung, Retention-/Deletion-Jobs, SIEM-Export, Admin-Rollenverwaltung und belastbare Last-/Chaos-Tests.

## Phase 6: Release-Gates

Ein produktiver Sandbox-Release darf erst erfolgen, wenn folgende Bedingungen erfüllt sind: isolierter Worker nachweisbar, Netzwerk-Egress getestet, Image-Signaturen geprüft, Lease-Recovery getestet, Kill-Switch getestet, Artefakt-Scan aktiv, Secrets nie im Agentenkontext sichtbar, Audit-Export verifiziert und ein Rollback-Runbook vorhanden. Die WebDev-App bleibt bis dahin im Control-Plane-only-Modus.
