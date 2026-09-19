# BlackWaterLeaf Studio – Architektur-Gap-Report

**Stand:** 19. September 2026  
**Geprüfter lokaler Stand:** nach `f3ca705`, inklusive Queue-, Policy-, Artefakt-, Kimi- und Execution-Plane-Verträgen
**Status:** Research- und Repository-Audit

## 1. Kurzfazit

BlackWaterLeaf Studio ist aktuell eine **Control Plane mit Manus-gestütztem Planungs- und Queue-Worker**, aber noch keine vollständige Agentenplattform. Vorhanden sind die Web-Oberfläche, Manus-OAuth, Workspace-Rollen, Tasks, Schritte, Nachrichten, Freigabe-Daten, Push-Grundlagen, Evidence-Export, eine persistente Queue mit Leasing/Retry/Dead-Letter-Grundlagen, ein Kill-Switch-Pfad, eine Policy Engine, workspace-isolierte Artefakte, ein serverseitiger Kimi-Providervertrag und ein Sandbox-Spezifikationsvertrag. Der entscheidende Ausführungsteil fehlt weiterhin: Es gibt keinen verifizierten isolierten Sandbox-Worker, keinen vollständigen Tool-Executor, keinen Secret-Broker und keinen erzwungenen Egress-Proxy.

Das Zielbild sollte hybrid sein. Die bestehende Web-App bleibt Control Plane für Identität, Workspaces, Aufträge, Policies, Freigaben und Evidenz. Eine getrennte Execution Plane provisioniert pro Task eine kurzlebige MicroVM oder dedizierte VM. Kimi liefert Modellintelligenz; Kimi ersetzt weder die Sicherheitsgrenze noch den Worker. Manus-ähnliche Sandbox-Funktionen müssen technisch nachgewiesen werden, nicht nur über UI-Statuskarten.

## 2. GitHub- und Repository-Stand

Der lokale Arbeitsbaum ist sauber und steht auf `f3ca705`. Die lokale Historie enthält die Commits für Web-Control-Plane, Android-Client, Enterprise-Vorbereitung, Evidence-Packs, mobile Freigaben und Agent-Safety.

Das konfigurierte Remote `https://github.com/Blackwaterleaf/blackwaterleaf-studio.git` ist aktuell nicht erreichbar: GitHub antwortet mit **Repository not found**. Auch die GitHub-CLI kann das Repository nicht auflösen. Die lokale Referenz `github/main` existiert noch, belegt aber nicht, dass das Remote weiterhin öffentlich oder privat vorhanden ist. Die anderen geprüften Repositories `blackwaterleaf` ist erreichbar; `blackwaterleaf-` und `blackwaterleaf-webapp` sind ebenfalls nicht auflösbar.

**Konsequenz:** Der lokale Studio-Stand ist prüfbar und reproduzierbar, aber der GitHub-Stand kann derzeit nicht als aktueller Remote-Stand bestätigt werden. Vor einem weiteren Code-Push muss das Ziel-Repository wiederhergestellt, umbenannt oder als neues verbundenes Ziel bestätigt werden.

## 3. Was bereits real vorhanden ist

| Bereich | Befund |
|---|---|
| Control Plane | React/Tailwind-Web-App mit tRPC, Manus-OAuth und MySQL/Drizzle |
| Workspaces | Workspace-Mitgliedschaften und Rollenprüfung vorhanden |
| Tasks | Task-, Step-, Message- und Statusmodell vorhanden |
| Safety | Laufzeit-, Schritt-, Tool- und Wiederholungslimits; Prompt-Injection-Prüfung; Planvalidierung |
| Reliability | Persistente Run-Queue, atomarer Claim, Leasing, Retry/Dead-Letter-Grundlagen und sichtbarer Kill-Switch |
| Approvals | Freigabe-Datensatz, Rollenprüfung, Ablaufzeit und Push-Grundlage vorhanden |
| Policy/Provider | Deny-by-default Policy Engine, Sandbox-Preflight, Kimi-Gateway als sicheres Opt-in |
| Artefakte | Workspace-isolierter Upload, Größenlimit, SHA-256-Hash und Metadatenliste |
| Evidence | Evidence-Pack und SHA-256-verknüpfte Audit-Ereignisse vorhanden |
| Mobile | Expo-Grundclient, Push-Registrierung und Approval-Grundlagen vorhanden |
| Tests | `pnpm check` erfolgreich; 6 Vitest-Tests erfolgreich; Produktionsbuild erfolgreich |

Diese Funktionen bilden eine gute Grundlage. Sie beweisen jedoch noch keine tatsächliche Datei-, Code-, Browser- oder Netzwerkausführung. Der Manus-Control-Plane-Worker kann Runs planen und Provider-Ergebnisse verarbeiten; er ist absichtlich nicht gleichbedeutend mit einer Sandbox, die generierten Code ausführt.

## 4. Was definitiv noch fehlt: P0-Must-haves

### 4.1 Echte Execution Plane

Ein authentifizierter Worker-Adapter muss pro Task eine eigene kurzlebige Ausführungsinstanz erzeugen, identifizieren, überwachen und wieder zerstören. Für agentengenerierten oder fremden Code sollte eine Firecracker-MicroVM oder dedizierte VM die primäre Tenant-Grenze sein. Container können innerhalb dieser Grenze als Packaging dienen, dürfen aber nicht allein als Multi-Tenant-Sicherheitsgrenze verkauft werden.

Die Sandbox braucht mindestens:

- non-root-Ausführung, read-only Basisdateisystem und keine Host-Mounts;
- deaktivierte Privilege Escalation, entfernte Linux-Capabilities und Seccomp/AppArmor;
- getrennte temporäre Arbeitsvolumes;
- CPU-, RAM-, Prozess-, Disk-, I/O- und Laufzeitlimits über cgroups;
- garantiertes Cleanup von Prozessen, Volumes, Tokens und Browserprofilen;
- einen extern durchgesetzten Kill-Switch;
- Cross-Tenant-Negativtests.

### 4.2 Dauerhafte Run-Orchestrierung

Der aktuelle `runAgent`-Pfad legt einen persistenten Run in einer Queue an. Leasing, Retry/Dead-Letter-Grundlagen, Status-Polling und ein aktiver Abbruchpfad sind vorhanden. Für Produktionsreife fehlen weiterhin echte Checkpoints/Resume-Semantik, Worker-Recovery-Tests, eine belastbare Idempotency-Garantie über alle Seiteneffekte und ein extern durchgesetztes Abort-Signal für einen isolierten Ausführungsprozess.

Ein Cancel-Flag allein stoppt keinen bereits laufenden Provider- oder Worker-Prozess. Ein Produktionslauf darf erst als erfolgreich gelten, wenn Worker, Tests und Artefakte erfolgreich verifiziert wurden.

### 4.3 Policy Engine und Capability-System

Das Modell darf Aktionen vorschlagen, aber niemals selbst autorisieren. Vor jedem Tool-Aufruf muss eine unabhängige Policy Engine prüfen:

- Tenant, Workspace, Benutzer, Agent und Task;
- Tool, Operation, normalisierte Parameter und Zielressource;
- Dateipfad, Domain, Port und Datenklassifikation;
- Risiko, Budget, Rate Limit und aktuelle Freigabe;
- Policy-Version und Ablaufzeit.

Die ersten Tools sollten bewusst klein bleiben: `search_project_context`, `read_file_range`, `get_asset_metadata`, `run_linted_preview`, `run_tests`, `create_draft_patch` und `request_approval`. Schreiben, Löschen, Deployment, externe Kommunikation, Rechteänderungen und Secret-Aktionen bleiben approval-pflichtig.

### 4.4 Secrets und Datenflüsse

Die aktuelle Anwendung nutzt Prozess-Umgebungsvariablen. Es gibt keinen Secret-Broker mit kurzlebigen, task- und toolgebundenen Credentials. Vor einem Worker müssen Secrets über einen Broker injiziert, niemals in Prompts, Memory, Logs, Images oder Artefakte geschrieben und nach dem Lauf widerrufen werden.

Die lokale `.project-config.json` ist nicht getrackt, enthält aber sensible Konfiguration und muss außerhalb des Quellcodes geprüft und bei möglicher Exposition rotiert werden. Für Produktion gehören Secret-Scanning, Rotation, Redaction und getrennte Dev-/Staging-/Prod-Scopes zum Pflichtumfang.

### 4.5 Netzwerkgrenze

Standardmäßig muss die Sandbox kein Netzwerk haben. Falls eine Aufgabe Netzwerk benötigt, erfolgt der Zugriff ausschließlich über einen protokollierenden Egress-Proxy mit Domain-, Port-, Methode-, Größen- und Budget-Allowlist. Private Netze, Cloud-Metadaten-Endpunkte und Control-Plane-Adressen müssen blockiert werden. SSRF- und Exfiltrationstests sind Release-Gates.

### 4.6 Approval wirklich an Ausführung binden

Die vorhandenen Freigaben müssen an die exakte Aktion gebunden werden: Akteur, Tool, normalisierte Parameter, Ziel, Datenklassifikation, Policy-Version, Ablaufzeit und einmalige Ausführungs-ID. Die Entscheidung muss atomar und replay-geschützt sein. Für kritische Aktionen sind Step-up-Authentifizierung und bei Bedarf Vier-Augen-Prinzip erforderlich.

### 4.7 Observability und Betrieb

Die statische Health-Antwort und Entwicklungslogs reichen nicht für ein Enterprise-Produkt. Nötig sind strukturierte, korrelierte Logs, Metriken, Traces, Fehlertracking, Alarmierung, Dashboards, Retention, Runbooks, Backup/Restore, Rollback und Kosten-/Rate-Limits. Execution Receipts müssen Modell, Policy, Image-Digest, Tool-Aufruf, Approval, Artefakte, Ergebnis und Abbruchgrund verbinden.

### 4.8 Test- und Release-Gates

Die vorhandenen sechs Tests decken nur Logout und Safety-Helper ab. Vor einer Sandbox-Freigabe braucht es DB-, tRPC-, Tenant-, Race-, Approval-Expiry-, Cancel-, Worker-, Secret-Redaction-, Provider-, E2E-, Load-, Failure-, Recovery- und Security-Tests.

Die Abuse-Case-Suite muss mindestens direkte und indirekte Prompt Injection, Memory Poisoning, Tool-Missbrauch, Rechteausweitung, Secret-Exfiltration, SSRF, Sandbox Escape, Approval Bypass, rekursive Loops, Cross-Agent-Propagation und Supply-Chain-Drift abdecken.

## 5. Kimi- und Manus-Kombination

Kimi ist die Modellschicht. Manus liefert in der aktuellen App bereits OAuth, WebDev-Grundlagen und den Forge-LLM-Pfad. Eine echte Kombination braucht ein serverseitiges Provider-Gateway hinter tRPC. Der Browser darf niemals direkt Kimi ansprechen und darf keinen Moonshot-Schlüssel erhalten.

Die aktuell sinnvolle Modellstrategie ist:

| Aufgabe | Modellrolle |
|---|---|
| Kurze Hilfe, Klassifikation, Formulare | Kimi K2.6 mit reduziertem Denkaufwand |
| Coding, Debugging, Tests, Bild-/Video-gestützte UI-Arbeit | Kimi K2.7 Code |
| Große Planung und Reduktion | Kimi K3, nur bei echtem Bedarf |
| Historische Referenz | Kimi K2.5 Agent Swarm, nicht als Produktionsmodell |

Kimi K2.5 ist als Architektur-Inspiration für parallele Agenten wertvoll, aber nicht als neues API-Ziel. Ein anfänglicher Studio-Swarm sollte auf **2 bis 6 spezialisierte Worker** begrenzt werden. Jeder Worker erhält einen isolierten Kontext und ein strukturiertes Ergebnis. Breite, Tiefe, Tool Calls, Tokens, Laufzeit und Dollarbudget müssen vorab feststehen.

Das Gateway muss Streaming, Structured Outputs, Usage-Erfassung, Kostenbudgets, Fallbacks, Timeout, Provider-Fehler und vollständige Rekonstruktion fragmentierter Tool Calls beherrschen. Reasoning-Inhalte bleiben intern; Benutzer sehen sichere Statusereignisse und validierte Ergebnisse, nicht verborgene Gedankengänge.

## 6. Was nicht nötig ist

Nicht erforderlich für den ersten sicheren Produktrelease sind ein eigener Hypervisor, eine selbst entwickelte Container-Runtime, Kimi-K2.5-Self-Hosting, ein 100-Agenten-Swarm, ein Desktop pro Task, verschachtelte Virtualisierung, globale Active-Active-Multiregion, ein Connector-Marktplatz und eine vollautonome Freigabe für Löschen, Deployment, Zahlungen oder externe Kommunikation.

Eine native Mobile-App ist ebenfalls kein Blocker für Enterprise. Mobile Freigaben können später folgen. Die Web-Control-Plane, sichere Push-Benachrichtigungen und ein sauberer Approval-Workflow haben zunächst höhere Priorität.

## 7. Priorisierte Roadmap

### Phase 0 – Produktwahrheit

Alle UI- und Marketingtexte müssen eindeutig sagen: **Control Plane und Planungsassistent; Sandbox noch nicht aktiviert.** Der aktuelle blockierte Worker darf nicht als erfolgreicher Agentenlauf erscheinen. Sensible lokale Konfiguration prüfen und gegebenenfalls rotieren.

### Phase 1 – Belastbare Control Plane (weitgehend umgesetzt)

Run-/Job-Modell, Queue, Leasing, Retry, Dead Letter, Status-Polling und aktive Cancel-/Kill-Signale sind umgesetzt. Offen bleiben echte Checkpoints/Resume, vollständige Seiteneffekt-Idempotenz, Recovery-Tests und echte Health-/Worker-Metriken.

### Phase 2 – Sichere Sandbox-MVP

Worker-Adapter, Execution Coordinator, MicroVM/dedizierte VM, Egress-Proxy, Ressourcenlimits, Cleanup und technische Negativtests implementieren. Erst nach dem Abnahmetor darf Codeausführung als Produktfunktion bezeichnet werden.

### Phase 3 – Policy, Tools, Secrets und Artefakte (Verträge umgesetzt, Executor offen)

Policy Engine, Capability-Manifeste, Sandbox-Preflight, Kimi-Providervertrag, Artefaktbibliothek, Upload-Größenprüfung, Hashes und workspace-isolierte Listen sind vorbereitet. Offen bleiben die tatsächliche Tool Registry, der Secret-Broker, Malware-/Content-Scan, Retention und die Durchsetzung am Ausführungs-Executor.

### Phase 4 – Kimi-Gateway

Kimi serverseitig integrieren, Modellrouting, Streaming, Structured Output, Kostenbudgets, Kontext-Retrieval und Fallbacks einführen. Zunächst read-only und ohne externe Schreibaktionen.

### Phase 5 – Enterprise-Reife

SSO/RBAC, gegebenenfalls SCIM, Datenflussinventar, EWR-/Residency-Prüfung, Backup/Restore, Rollback, Support-Eskalation und mindestens 50 repräsentative Golden Tasks als Release-Gate etablieren.

### Phase 6 – Optimierung

Erst nach bestandenen Sicherheits- und Reliability-Gates Warm Pools, Snapshots, gVisor, Kubernetes, breitere Swarms, Dynamic Tool Loading, weitere Regionen und Connector-Ausbau bewerten.

## 8. Architekturentscheidung

**Empfehlung:** WebDev bleibt Control Plane. Die echte Ausführung wird als getrennte Execution Plane auf einem geeigneten persistenten Worker-Host betrieben. Dieser Host ist nicht selbst die Sandbox, sondern provisioniert und überwacht die pro Task isolierte MicroVM oder dedizierte VM.

Ein konkreter Server darf erst ausgewählt werden, wenn KVM/MicroVM-Fähigkeit, Egress-Durchsetzung, cgroup-Limits, Image-Handling, Kill-Switch, Cleanup, Backup und Monitoring nachgewiesen sind. Ein einzelner Docker-Host ohne diese Nachweise ist kein ausreichendes Enterprise-Sicherheitsfundament.

## References

[1]: https://manus.im/blog/manus-sandbox "Manus – Understanding Manus sandbox: your cloud computer"
[2]: https://manus.im/blog/manus-my-computer-desktop "Manus – Introducing My Computer"
[3]: https://firecracker-microvm.github.io/ "Firecracker – Secure and fast microVMs"
[4]: https://kubernetes.io/docs/concepts/security/pod-security-standards/ "Kubernetes – Pod Security Standards"
[5]: https://docs.kernel.org/admin-guide/cgroup-v2.html "Linux Kernel Documentation – Control Group v2"
[6]: https://csrc.nist.gov/pubs/sp/800/190/final "NIST SP 800-190 – Application Container Security Guide"
[7]: https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html "OWASP – AI Agent Security Cheat Sheet"
[8]: https://owasp.org/projects/agentic-skills-top-10 "OWASP – Agentic Skills Top 10"
[9]: https://www.kimi.ai/blog/kimi-k2-5 "Kimi – K2.5 Visual Agentic Intelligence"
[10]: https://www.kimi.ai/resources/kimi-k2-7-code "Kimi – K2.7 Code"
[11]: https://platform.kimi.ai/docs/guide/use-kimi-api-to-complete-tool-calls "Kimi Platform – Tool Calling"
[12]: https://platform.kimi.ai/docs/guide/response_format "Kimi Platform – Structured Output"
[13]: https://platform.kimi.ai/docs/guide/use-context-caching-feature-of-kimi-api "Kimi Platform – Context Caching"
[14]: https://learn.microsoft.com/en-us/compliance/assurance/assurance-microsoft-365-isolation-controls "Microsoft – Isolation Controls"
[15]: https://www.rfc-editor.org/rfc/rfc7644 "IETF RFC 7644 – SCIM"
[16]: https://airc.nist.gov/airmf-resources/airmf/5-sec-core/ "NIST – AI Risk Management Framework Core"
[17]: https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/rules-international-data-transfers_en "European Commission – International Data Transfers"
[18]: https://www.kimi.ai/blog/agent-swarm "Kimi – Agent Swarm"
[19]: https://www.kimi.com/en/help/agent/agent-swarm "Kimi Help – Agent Swarm"

**Hinweis:** Aussagen zu Kimi-Datenresidenz, Training, Aufbewahrung, Subprozessoren und Vertragsbedingungen wurden nicht als Produktannahmen verwendet. Diese Punkte müssen vor Verarbeitung von Kundendaten vertraglich geprüft werden.

**Hinweis zum GitHub-Stand:** Der Report beschreibt den lokalen Commit `f3ca705`. Das konfigurierte GitHub-Remote war während der Prüfung nicht erreichbar; ein Remote-Gleichstand konnte daher nicht bestätigt werden.
