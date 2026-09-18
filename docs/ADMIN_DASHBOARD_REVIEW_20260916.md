# BlackWaterLeaf – Admin- und Partnerprüfung

**Prüfkontext:** authentifiziertes, serverseitig bestätigtes Admin-Konto `blackwaterleaf@gmail.com`; S23-Ultra-nahe Ansicht, 412 × 915 Pixel.
**Ergebnis:** bestanden.

| Prüfbereich | Ergebnis |
|---|---|
| Rechte | Das Kontrollzentrum zeigt die Rolle `ADMIN` aus der serverseitigen Sitzung. Normale Nutzer werden vor Datenzugriff abgewiesen; Moderatoren erhalten keine Konten- oder Partnerverwaltung. |
| Moderation | Sichtbar sind nur bereits veröffentlichte öffentliche Community-Beiträge. Private Inhalte werden nicht in den Moderationsendpunkt aufgenommen. |
| Konten | Rollen- und Statusänderungen sind auf Admins begrenzt, Selbst-Deaktivierung und Selbst-Degradierung sind serverseitig blockiert und Änderungen werden auditiert. |
| Partner | Die Partnerverwaltung enthält ausschließlich einen leeren, echten Ausgangszustand. Einträge beginnen als Entwurf und benötigen dokumentierte Freigabe, Genehmigung und aktive Platzierung. |
| Startseite | Die Partnerfläche ist sichtbar gekennzeichnet und zeigt bei leerem Datenbestand den neutralen Hinweis, dass keine aktiv freigegebene Platzierung vorhanden ist. |
| Mobile Darstellung | Formularfelder, Checkbox, Schaltflächen, Dashboardmetriken und leerer Startseitenzustand bleiben innerhalb des 412-Pixel-Viewports sichtbar. |

Die technische Prüfung umfasst **54 Vitest-Tests**, TypeScript, Produktionsbuild und einen Produktionsabhängigkeitsaudit ohne bekannte Befunde der Stufe „hoch“ oder „kritisch“. Ein vollständiger positiver Partnerdurchlauf bleibt bewusst offen, bis ein realer, autorisierter Partner vorliegt.

Die Prüfung enthält keine angelegten Testpartner, keine Simulationen von Unternehmen oder Privatpersonen und keine Domainänderung.
