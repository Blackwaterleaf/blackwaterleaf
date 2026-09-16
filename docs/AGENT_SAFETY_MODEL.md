# Agent Safety Model

## Aktivierte Kontrollen

BlackWaterLeaf Studio führt Agenten derzeit ausschließlich in der Control Plane aus. Der Agent darf analysieren und planen, aber weder Code ausführen noch Dateien mounten oder externe Netzwerkaktionen behaupten.

Der zentrale Safety-Gateway-Vertrag erzwingt:

- Laufzeitlimit von 180 Sekunden.
- maximal 30 Planungsschritte.
- maximal 50 Tool-Aufrufe.
- maximal zwei identische Wiederholungen einer Aktion.
- maximal drei aufeinanderfolgende Fehler.
- Ablehnung leerer, übergroßer oder wiederholter Pläne.
- Prompt-Injection-Signale als harte Blockierung.
- Planner-Ergebnisvalidierung vor Erfolgsmeldung.
- atomaren Run-Claim gegen parallele Doppelstarts.
- serverseitige Zustandsübergänge und Workspace-Prüfung.
- persistenten Kill-Switch für laufende, wartende und queued Tasks.
- Evidence-Audit mit SHA-256-Verkettung aus `previousHash` und `eventHash`.

## Agentenfehler und Loops

Wiederholte oder zyklische Plan-Schritte werden nicht als Fortschritt akzeptiert. Ein Lauf darf nicht einfach weiterlaufen, wenn er dieselbe Aktion wiederholt, die Schrittgrenze überschreitet, die Zeitgrenze erreicht oder zu viele Fehler in Folge produziert. In einer späteren Worker-Integration müssen dieselben Grenzen zusätzlich außerhalb des Modells im Worker-Gateway gelten.

## Prompt Injection

Inhalte aus Webseiten, Dokumenten, E-Mails und Connectoren sind untrusted data. Befehle, die vorherige Regeln ignorieren, Systemprompts offenlegen, Secrets ausgeben, Sicherheitsprüfungen umgehen oder Credentials hochladen wollen, werden blockiert und müssen als Sicherheitsereignis protokolliert werden.

## Verifier-Grenze

Der aktuelle Control-Plane-Verifier prüft die Struktur und Sicherheit des Agentenplans. Ein produktiver Worker darf erst nach einem separaten Ergebnis- und Artefakt-Verifier als erfolgreich gelten. Diese stärkere Verifikation bleibt bewusst vor der Sandbox-Aktivierung als nächster Sicherheitsmeilenstein offen.
