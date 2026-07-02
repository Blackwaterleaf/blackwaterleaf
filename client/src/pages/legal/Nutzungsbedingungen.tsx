import LegalLayout from "./LegalLayout";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-brand text-xl mb-2 mt-2" style={{ color: "oklch(0.9 0.01 200)" }}>
    {children}
  </h2>
);

/**
 * Nutzungsbedingungen (AGB) für die Community-App/Website.
 * Enthält UGC-, Moderations- und Missbrauchsregeln (Store-Pflicht).
 */
export default function Nutzungsbedingungen() {
  return (
    <LegalLayout title="Nutzungsbedingungen" subtitle="Stand: Juli 2026">
      <section>
        <H2>1. Geltungsbereich</H2>
        <p>
          Diese Bedingungen regeln die Nutzung der App und Website BlackwaterLeaf, bereitgestellt
          von Tim Höfges – BlackwaterLeaf, Überruhrstraße 578, 45289 Essen („wir"). Mit der
          Nutzung akzeptierst du diese Bedingungen.
        </p>
      </section>

      <section>
        <H2>2. Konto</H2>
        <p>
          Für die meisten Funktionen ist eine Anmeldung erforderlich. Du bist für die Aktivitäten
          unter deinem Konto verantwortlich und musst mindestens 16 Jahre alt sein.
        </p>
      </section>

      <section>
        <H2>3. Nutzergenerierte Inhalte</H2>
        <p>
          Du behältst die Rechte an deinen Inhalten (Beiträge, Fotos, Kommentare), räumst uns aber
          ein einfaches, weltweites Nutzungsrecht ein, deine Inhalte im Rahmen der App
          darzustellen. Du bist allein verantwortlich für die von dir veröffentlichten Inhalte.
        </p>
      </section>

      <section>
        <H2>4. Verhaltensregeln / Verbotene Inhalte</H2>
        <p>Untersagt sind insbesondere:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Belästigung, Hassrede, Diskriminierung, Bedrohungen</li>
          <li>anstößige, gewaltverherrlichende oder sexuell explizite Inhalte</li>
          <li>Spam, Betrug, irreführende Werbung</li>
          <li>Verletzung von Urheber-, Marken- oder Persönlichkeitsrechten</li>
          <li>
            illegale Inhalte, insbesondere zum illegalen Handel mit geschützten oder invasiven
            Arten
          </li>
        </ul>
      </section>

      <section>
        <H2>5. Moderation und Meldungen</H2>
        <p>
          Nutzer können Inhalte und Profile melden. Wir behalten uns vor, Inhalte zu entfernen und
          Konten bei Verstößen zu verwarnen, zu sperren oder zu löschen. Es gilt eine
          Null-Toleranz gegenüber missbräuchlichen Inhalten. Ein Melde- und Moderationssystem
          steht zur Verfügung.
        </p>
      </section>

      <section>
        <H2>6. Direktnachrichten</H2>
        <p>
          Private Nachrichten und Gruppenchats dienen dem Austausch zwischen Mitgliedern.
          Missbrauch (Spam, Belästigung) kann zur Sperrung führen.
        </p>
      </section>

      <section>
        <H2>7. Beworbene Accounts / Werbung</H2>
        <p>
          In der App können ausgewählte externe Accounts (z. B. auf Instagram, TikTok, YouTube)
          als Empfehlung oder als bezahlter Werbeplatz angezeigt werden. Bezahlte Platzierungen
          werden als solche gekennzeichnet. Für die Inhalte verlinkter externer Profile sind
          ausschließlich deren Betreiber verantwortlich.
        </p>
      </section>

      <section>
        <H2>8. KI-Assistent</H2>
        <p>
          Antworten des KI-Assistenten sind unverbindliche Hilfestellungen und ersetzen keine
          fachliche oder tierärztliche Beratung.
        </p>
      </section>

      <section>
        <H2>9. Haftung</H2>
        <p>
          Wir haften nicht für nutzergenerierte Inhalte. Für eigene Inhalte haften wir nach den
          gesetzlichen Bestimmungen.
        </p>
      </section>

      <section>
        <H2>10. Kündigung</H2>
        <p>
          Du kannst dein Konto jederzeit in der App löschen. Wir können die Bereitstellung mit
          angemessener Frist einstellen.
        </p>
      </section>

      <section>
        <H2>11. Kontakt</H2>
        <p>
          <a href="mailto:BlackwaterLeaf@gmail.com" className="underline hover:text-primary">
            BlackwaterLeaf@gmail.com
          </a>
        </p>
      </section>
    </LegalLayout>
  );
}
