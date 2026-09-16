# BlackWaterLeaf Studio: Enterprise Readiness Backlog

## Bereits vorbereitet

- Authentifizierter Workspace mit rollenbasierter Zugriffskontrolle.
- Task-, Schritt-, Audit-, Approval- und Sandbox-Session-Datenmodell.
- Serverseitige Control Plane mit kontrollierter Agentenanalyse.
- Agent-Preflight im Auftrag: Erfolgskriterium, Netzwerk, Dateien und Freigabegrenze.
- Detaillierte Ausführungsspur mit Planung, Sicherheitsprüfung und Workerstatus.
- Interaktiver Freigabedialog mit Auditentscheidung.
- Exportierbares Evidence-Pack als Markdown und JSON.
- Integrationszentrale für GitHub/GitLab, Google Workspace, Slack/Teams und Jira/Linear.
- Separater Android-Client mit eigener Paket-ID.

## Bewusst nicht aktiviert

Die beliebige Codeausführung in einer isolierten Worker-Umgebung ist nicht aktiviert. Es werden keine Docker-Container, MicroVMs, Shell-Kommandos oder externen Netzwerkzugriffe vorgetäuscht. Die Oberfläche zeigt diesen Zustand explizit.

## Nächste technische Vorbereitung

1. **Connector-Verträge:** OAuth-Scopes, Token-Broker, Connector-Entitlements und task-spezifische Datenfreigaben als serverseitige Tabellen und Verfahren ergänzen.
2. **Policy Engine:** Risiko-Klassen, Allow-/Ask-/Deny-Regeln, Ablaufzeiten, Rollenrouting und Policy-Version im Audit speichern.
3. **Agent Engine:** Mehrere Task-Schritte, Checkpoints, Retry-Grenzen, Qualitätsprüfung und Resume-Semantik als echte Serverzustände ausbauen.
4. **Evidence:** Datei-Hashes, Diffs, Testausgaben, Tool-Aufrufe und signierte Evidence-Packs ergänzen.
5. **Mobile:** OAuth, Push-Benachrichtigungen, Freigabeansicht und Evidence-Ansicht an die Control API anbinden.
6. **Betrieb:** Monitoring, Backups, Fehlertracking, Datenaufbewahrung, Export und Disaster-Recovery-Prozesse definieren.
7. **Worker-Schnittstelle:** Erst nach Auswahl einer verwalteten Runtime einen authentifizierten Worker-Adapter mit Egress-Allowlist, CPU-/RAM-/Zeitlimits, Secret-Broker und Cleanup implementieren.

## Produktgrenze

Studio soll als Execution-Control-Schicht positioniert werden. Agenten und spätere Worker führen Aufgaben aus. Studio entscheidet transparent, welche Aktionen zulässig sind, wann ein Mensch freigeben muss und wie die Ausführung nachgewiesen wird.
