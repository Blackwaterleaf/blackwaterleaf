import LegalLayout from "./LegalLayout";

/**
 * Impressum gemäß § 5 DDG.
 * USt-IdNr. ist als Platzhalter markiert und wird nachgetragen,
 * sobald der Bescheid des Finanzamts vorliegt.
 */
export default function Impressum() {
  return (
    <LegalLayout title="Impressum" subtitle="Angaben gemäß § 5 DDG">
      <section>
        <p>
          <strong>Tim Höfges</strong>
          <br />
          BlackwaterLeaf (Einzelunternehmen)
          <br />
          Überruhrstraße 578
          <br />
          45289 Essen
          <br />
          Deutschland
        </p>
      </section>

      <section>
        <h2 className="font-brand text-xl mb-2" style={{ color: "oklch(0.9 0.01 200)" }}>
          Kontakt
        </h2>
        <p>
          E-Mail:{" "}
          <a href="mailto:BlackwaterLeaf@gmail.com" className="underline hover:text-primary">
            BlackwaterLeaf@gmail.com
          </a>
          <br />
          Instagram:{" "}
          <a
            href="https://www.instagram.com/blackwaterleaf"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            @blackwaterleaf
          </a>
        </p>
      </section>

      <section>
        <h2 className="font-brand text-xl mb-2" style={{ color: "oklch(0.9 0.01 200)" }}>
          Umsatzsteuer-Identifikationsnummer
        </h2>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:
          <br />
          {/* TODO: Nach Erhalt des Finanzamt-Bescheids die echte USt-IdNr. (Format DE + 9 Ziffern) hier eintragen. */}
          <span style={{ color: "oklch(0.55 0.01 200)" }}>wird nachgereicht</span>
        </p>
      </section>

      <section>
        <h2 className="font-brand text-xl mb-2" style={{ color: "oklch(0.9 0.01 200)" }}>
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
        </h2>
        <p>
          Tim Höfges
          <br />
          Überruhrstraße 578, 45289 Essen, Deutschland
        </p>
      </section>

      <section>
        <h2 className="font-brand text-xl mb-2" style={{ color: "oklch(0.9 0.01 200)" }}>
          EU-Streitschlichtung
        </h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
          bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
          <br />
          Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor
          einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>
    </LegalLayout>
  );
}
