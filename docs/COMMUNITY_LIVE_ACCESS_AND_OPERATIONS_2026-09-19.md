# Community, Beitragsdetail und Live Hub – Zugriffs- und Betriebsregeln

## Geltungsbereich

Der Community-Feed, einzelne Beitragsansichten, Kommentare, Live-Sitzungen und Live-Chat-Nachrichten sind **Mitgliederdaten**. Der Server lässt diese Datensätze ausschließlich über `protectedProcedure` an aktive, angemeldete Konten ausliefern. Die Web- und Native-Oberflächen rufen die entsprechenden Endpunkte ohne Sitzung nicht ab und zeigen stattdessen einen eindeutigen Anmeldestatus. Öffentliche Profilmetadaten bleiben getrennt verfügbar; die dort gezeigte Beitragsliste wird ebenfalls erst nach Anmeldung geladen.

## Beitragsdetail und Beziehungen

Jeder Feed-Beitrag verweist auf `/community/post/:id`. Die Detailansicht bündelt Autor, Bereich, Medium, Interaktionen und einen moderierten, eingerückten Kommentarverlauf. Antworten behalten ihre Elternreferenz. Folgen, Entfolgen, Melden sowie Blockieren oder Entblocken liegen in klar getrennten Aktionen. Eine Blockierung entfernt die gegenseitige aktive Folgebeziehung, blendet das Konto aus Feed, Diskussion und Live-Chat aus und ist im privaten Profilbereich reversibel. Eine Entblockung stellt bewusst keine frühere Folgebeziehung wieder her.

## Live Hub

Der Live Hub trennt zwei Sitzungsarten: **Community Live** für moderierten Austausch und **Fachvorträge** für von aktivem Staff angelegte Sitzungen. Ein Fachvortrag verlangt bei der Anlage eine dokumentierte Qualifikationsangabe; die Kennzeichnung wird vom Server geliefert und darf nicht vom Publikum selbst behauptet werden. Beide Formate zeigen nur reale Datenbankzustände: geplant, live, beendet oder abgebrochen.

| Funktion | Regel | Schutzmaßnahme |
| --- | --- | --- |
| Sitzungsliste und Detail | Nur aktive angemeldete Konten | `protectedProcedure`, Blockfilter, keine öffentliche API-Antwort |
| Fachvortrag anlegen | Nur Moderator:innen oder Administrator:innen | `staffProcedure`, Pflichtfeld für die Qualifikation |
| Übertragung | Nur HTTPS-Quelle, optional | Ohne freigegebene Quelle erscheint kein simuliertes Video |
| Chat | Nur während einer aktiven Sitzung | Konto-gebunden, sichtbar moderiert, maximal sechs Nachrichten pro Minute |
| Beziehungsschutz | Gegenseitige Blockierung wirkt sofort | Feed, Kommentare und Chat filtern blockierte Konten |

## Video-Übertragung

BlackWaterLeaf betreibt in dieser Ausbaustufe keinen eigenen Video-Transcoder und zeichnet keine Streams auf. Verantwortlicher Staff kann eine HTTPS-Streamquelle an einer Sitzung hinterlegen; die Oberfläche öffnet sie transparent in einem neuen Fenster. Dieses Verhalten vermeidet Pseudo-Live-Bilder und lässt die spätere Auswahl eines Videoanbieters offen. Für echtes Echtzeit-Video mit integrierter Wiedergabe, Zuschauerzahlen und Subsekunden-Chat ist anschließend eine verbindliche Anbieterentscheidung samt Streaming- und Moderationskonzept erforderlich.

## Verifizierte Partnerdaten

Der Partner **Kiemen-Kumpel** ist im aktiven Projektbestand als freigegebener Partner hinterlegt. Die Prüfung am 19. September 2026 ergab **105 aktive Produkte** mit der Zieladresse `https://kiemen-kumpel.de/`. Diese Commerce-Daten bleiben von den geschützten Community-Daten getrennt und folgen weiter den bestehenden Kennzeichnungs- und Freigaberegeln.
