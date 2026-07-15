import LegalLayout from "./LegalLayout";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-brand text-xl mb-2 mt-2" style={{ color: "rgba(255,255,255,0.90)" }}>
    {children}
  </h2>
);

/**
 * Datenschutzerklärung nach DSGVO. Öffentliche URL für den Google-Play-Eintrag.
 * Hinweis: sorgfältiger Entwurf, ersetzt keine Rechtsberatung.
 */
export default function Datenschutz() {
  return (
    <LegalLayout title="Datenschutzerklärung" subtitle="Stand: Juli 2026">
      <section>
        <H2>1. Verantwortlicher</H2>
        <p>
          Verantwortlich für die Datenverarbeitung im Sinne der DSGVO ist:
          <br />
          <br />
          <strong>Tim Höfges</strong> – BlackwaterLeaf (Einzelunternehmen)
          <br />
          Überruhrstraße 578, 45289 Essen, Deutschland
          <br />
          E-Mail:{" "}
          <a href="mailto:BlackwaterLeaf@gmail.com" className="underline hover:text-primary">
            BlackwaterLeaf@gmail.com
          </a>
        </p>
      </section>

      <section>
        <H2>2. Überblick der Verarbeitung</H2>
        <p>
          BlackwaterLeaf ist eine Community-App und -Website für Pflanzen-, Aquaristik- und
          Terraristik-Interessierte. Wir verarbeiten personenbezogene Daten, um dir die Nutzung
          zu ermöglichen (Anmeldung, Profil, Beiträge, Kommentare, Gruppen, Nachrichten,
          Benachrichtigungen und den KI-Assistenten).
        </p>
      </section>

      <section>
        <H2>3. Rechtsgrundlagen</H2>
        <p>Wir verarbeiten deine Daten auf Grundlage von:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung: Bereitstellung der Funktionen)</li>
          <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung, z. B. Kamera-/Fotozugriff)</li>
          <li>
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse: Sicherheit,
            Missbrauchsvermeidung, Moderation)
          </li>
        </ul>
      </section>

      <section>
        <H2>4. Welche Daten wir verarbeiten</H2>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <strong>Kontodaten:</strong> Über die Anmeldung via Manus-Login erhalten wir eine
            eindeutige Kennung (Open-ID), deinen angezeigten Namen, deine E-Mail-Adresse und ggf.
            ein Profilbild.
          </li>
          <li>
            <strong>Profildaten:</strong> Benutzername, Bio, Erfahrungslevel, Interessen,
            selbst hochgeladenes Avatarbild, hinterlegte Social-Media-Links.
          </li>
          <li>
            <strong>Inhaltsdaten:</strong> Beiträge, Kommentare, Fotos/Videos,
            Gruppenmitgliedschaften, Likes, Pflanzen- und Aquarien-Einträge inkl. Pflege-/Messwerten.
          </li>
          <li>
            <strong>Kommunikationsdaten:</strong> Private Nachrichten und Gruppenchats.
          </li>
          <li>
            <strong>Nutzungsdaten:</strong> Benachrichtigungen, technische Log- und
            Nutzungsstatistiken (aggregiert).
          </li>
          <li>
            <strong>Geräteberechtigungen:</strong> Kamera und Fotogalerie – nur nach
            ausdrücklicher Freigabe, ausschließlich zum Hinzufügen von Bildern.
          </li>
        </ul>
      </section>

      <section>
        <H2>5. KI-Assistent</H2>
        <p>
          Wenn du den KI-Assistenten nutzt, werden deine Eingaben (Text und ggf. Bilder zur
          Pflanzen-/Artbestimmung) an einen KI-Dienst übermittelt, um eine Antwort zu erzeugen.
          Übermittle bitte keine sensiblen personenbezogenen Daten in den Chat.
        </p>
      </section>

      <section>
        <H2>6. Empfänger / Auftragsverarbeiter</H2>
        <p>Zur Bereitstellung setzen wir Dienstleister ein, u. a.:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Hosting/Backend: Manus (Cloud-Infrastruktur)</li>
          <li>Bildspeicher: S3-kompatibler Objektspeicher</li>
          <li>KI-Dienst: über die Manus-Plattform bereitgestellter KI-Anbieter</li>
        </ul>
        <p className="mt-2">
          Mit diesen Dienstleistern bestehen, soweit erforderlich, Auftragsverarbeitungsverträge
          (Art. 28 DSGVO).
        </p>
      </section>

      <section>
        <H2>7. Speicherdauer</H2>
        <p>
          Wir speichern deine Daten so lange, wie dein Konto besteht bzw. wie es für die
          genannten Zwecke erforderlich ist. Bei Löschung deines Kontos werden deine
          personenbezogenen Daten gelöscht oder anonymisiert, soweit keine gesetzlichen
          Aufbewahrungspflichten entgegenstehen.
        </p>
      </section>

      <section>
        <H2>8. Deine Rechte</H2>
        <p>
          Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17),
          Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21).
          Du kannst dein Konto direkt in der App unter „Profil → Konto löschen" entfernen.
          Zudem hast du ein Beschwerderecht bei einer Aufsichtsbehörde.
        </p>
      </section>

      <section>
        <H2>9. Kontodaten löschen</H2>
        <p>
          Die Löschung ist jederzeit in der App möglich (Profil → Konto löschen) oder per E-Mail
          an{" "}
          <a href="mailto:BlackwaterLeaf@gmail.com" className="underline hover:text-primary">
            BlackwaterLeaf@gmail.com
          </a>
          . Mit der Löschung werden Profil, Beiträge, Kommentare und Nachrichten entfernt bzw.
          anonymisiert.
        </p>
      </section>

      <section>
        <H2>10. Kontakt</H2>
        <p>
          Bei Fragen zum Datenschutz:{" "}
          <a href="mailto:BlackwaterLeaf@gmail.com" className="underline hover:text-primary">
            BlackwaterLeaf@gmail.com
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
