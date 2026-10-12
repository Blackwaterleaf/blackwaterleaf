# IONOS-Webhosting und Studio-Domain

## Verifizierter Stand

Der IONOS-Vertrag **Webhosting Plus** ist aktiv. Der Webspace umfasst 195 GB und die Domain `blackwaterleaf-studio.com` ist aktuell mit dem Webspace verbunden. IONOS bietet dafür Webspace, SFTP, PHP, Datenbanken und Cronjobs. Die Domain ist derzeit noch nicht mit einem SSL-Zertifikat versehen.

## Warum das Studio zweigeteilt wird

BlackWaterLeaf Studio besteht aus einer öffentlichen Weboberfläche und einem geschützten Control-/Execution-Backend. Der IONOS-Webspace ist für statische Website-Dateien, Landingpages und öffentliche Dokumentation geeignet. Der Studio-Server benötigt dagegen einen dauerhaft laufenden Node-/tRPC-Dienst, Worker, Queue, Auditlog und später eine isolierte Execution Plane. Diese Komponenten gehören auf den unabhängigen IONOS-Cloud-Server, nicht in den PHP-Webspace.

## Zielarchitektur

```text
blackwaterleaf-studio.com       -> öffentliche Studio-Weboberfläche / TLS
api.blackwaterleaf-studio.com   -> Control API auf dem unabhängigen Cloud Server
admin.blackwaterleaf-studio.com -> Admin-Konsole, geschützt durch Studio-Auth
IONOS Webhosting                -> statische Landingpage, Dokumentation, Fallback
IONOS Cloud Server              -> Node-Control-Plane, Queue, Worker, Datenbankzugriff
Manus                           -> optionales Entwicklungs- und Kontrollsystem
```

## Nächste technische Bindung

1. Öffentliche IP des Cloud Servers ermitteln. Der DCD-Server läuft, hat aktuell aber noch keine sichtbare öffentliche IP.
2. Einen DNS-Zielpfad festlegen: bevorzugt `api.blackwaterleaf-studio.com` auf den Cloud Server; die Hauptdomain kann zunächst im Webspace bleiben.
3. Auf dem Cloud Server TLS mit Caddy oder Nginx aktivieren und `/health` lokal sowie öffentlich prüfen.
4. `STUDIO_PUBLIC_ORIGIN`, `STUDIO_SSH_HOST` und die API-Domain serverseitig als Secrets/Umgebungswerte setzen.
5. Erst nach erfolgreichem Health-Check die Admin-Deployment-Gates aktivieren.
6. Das IONOS-Webhosting nur mit Build-Artefakten und öffentlichen Dateien befüllen. Keine `.env`, Tokens, SSH-Schlüssel, Datenbankexporte oder privaten Evidence-Packs hochladen.

## Bewusste Sicherheitsgrenze

Die Domain darf nicht auf einen nicht erreichbaren oder ungeprüften Server zeigen. Eine DNS-Änderung ohne öffentliche IP und TLS-Health-Check würde die Domain funktionslos machen. Deshalb ist die Verbindung vorbereitet, aber noch nicht auf Produktion umgeschaltet.
