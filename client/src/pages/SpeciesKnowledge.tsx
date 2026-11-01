import { trpc } from "@/lib/trpc";
import { useI18n } from "@/i18n";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Link, useParams } from "wouter";

export default function SpeciesKnowledge() {
  const params = useParams<{ scientificName: string }>();
  const { locale } = useI18n();
  const scientificName = params.scientificName ?? "";
  const entries = trpc.knowledge.listBySpecies.useQuery(
    { scientificName, locale },
    { enabled: Boolean(scientificName), retry: false }
  );
  return (
    <section className="identification-database">
      <Link href="/assistant">
        <ArrowLeft size={18} />
        Zur Artenbestimmung
      </Link>
      <p>Datenbank / veröffentlichte Quellen</p>
      <h1>{scientificName}</h1>
      <p>
        Der wissenschaftliche Name stammt aus einem unbestätigten KI-Vorschlag.
        Diese Ansicht zeigt nur vorhandene veröffentlichte Beiträge, die diesen
        Namen nennen, und deren Quellen.
      </p>
      {entries.isLoading ? (
        <p role="status">
          <Loader2 className="spin" size={16} /> Einträge werden geladen …
        </p>
      ) : entries.isError ? (
        <div className="identification-error" role="alert">
          <p>
            Die Datenbank ist momentan nicht erreichbar. Es werden keine
            Ersatzartikel angezeigt.
          </p>
          <button type="button" onClick={() => void entries.refetch()}>
            Erneut versuchen
          </button>
        </div>
      ) : !entries.data?.length ? (
        <article>
          <h2>Noch kein veröffentlichter Eintrag</h2>
          <p>
            Für {scientificName} sind aktuell keine passenden veröffentlichten
            Beiträge hinterlegt. Das ist weder eine Bestätigung noch eine
            Widerlegung des KI-Vorschlags.
          </p>
          <Link href="/knowledge">Gesamte Datenbank öffnen</Link>
        </article>
      ) : (
        entries.data.map(entry => (
          <article key={entry.id}>
            <h2>{entry.title}</h2>
            <p>{entry.excerpt}</p>
            <div>
              {entry.sources.map(source => (
                <p key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.label} <ExternalLink size={12} />
                  </a>
                </p>
              ))}
            </div>
          </article>
        ))
      )}
    </section>
  );
}
