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
| Übertragung | YouTube Live oder Twitch, optional | Nur normalisierte Anbieterreferenzen; ohne freigegebene Quelle erscheint kein simuliertes Video |
| Chat | Nur während einer aktiven Sitzung | Konto-gebunden, sichtbar moderiert, maximal sechs Nachrichten pro Minute |
| Beziehungsschutz | Gegenseitige Blockierung wirkt sofort | Feed, Kommentare und Chat filtern blockierte Konten |

## Video-Übertragung

BlackWaterLeaf betreibt in dieser Ausbaustufe keinen eigenen Video-Transcoder und zeichnet keine Streams auf. Verantwortlicher Staff wählt bei einer Sitzung **YouTube Live** oder **Twitch** und hinterlegt nur eine Video-ID beziehungsweise einen Kanalnamen oder die entsprechende öffentliche Anbieter-URL. Der Hub normalisiert diese Eingabe auf einen erlaubten Anbieter und spielt die Übertragung direkt in einem responsiven iframe ab. Twitch erhält dabei stets den aktuellen BlackWaterLeaf-Hostname als erforderlichen `parent`-Parameter. Stream-Keys, OAuth-Zugangsdaten und beliebige iframe-URLs werden nicht akzeptiert oder gespeichert. Für ein eigenes Transcoding, Zuschauerzahlen aus einer Anbieter-API oder automatisierte Sitzungsstarts wäre anschließend eine getrennte, verbindliche Anbieter- und Moderationsentscheidung erforderlich.

## Verifizierte Partnerdaten

Der Partner **Kiemen-Kumpel** ist im aktiven Projektbestand als freigegebener Partner hinterlegt. Die Prüfung am 19. September 2026 ergab **105 aktive Produkte** mit der Zieladresse `https://kiemen-kumpel.de/`. Diese Commerce-Daten bleiben von den geschützten Community-Daten getrennt und folgen weiter den bestehenden Kennzeichnungs- und Freigaberegeln.
