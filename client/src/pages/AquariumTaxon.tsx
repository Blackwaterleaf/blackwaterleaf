import { ArrowLeft, CheckCircle2, ExternalLink, Fish, Save, ShieldCheck, Thermometer } from "lucide-react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { StatePanel } from "@/components/StatePanel";
import { TaxonRangeMap } from "@/components/TaxonRangeMap";
import { TaxonImageModal } from "@/components/TaxonImageModal";
import { TaxonFactSheet } from "@/components/TaxonFactSheet";
import { TaxonHabitatAction } from "@/components/TaxonHabitatAction";
import { useAuth } from "@/_core/hooks/useAuth";

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export default function AquariumTaxon() {
  const [, params] = useRoute("/aquarium-fish/:id");
  const id = Number(params?.id);
  const auth = useAuth();
  const fish = trpc.search.aquariumById.useQuery({ id }, { enabled: Number.isSafeInteger(id) && id > 0, retry: false });
  const save = trpc.social.save.useMutation();
  const unsave = trpc.social.unsave.useMutation();
  const saved = trpc.social.saved.useQuery(undefined, { enabled: auth.isAuthenticated });
  if (fish.isLoading) return <div className="observatory-route observatory-route--aquarium"><StatePanel code="AQUARIUM/LOAD" state="loading" title="AQUARISTIK-DATENSATZ WIRD GELADEN" body="Der veröffentlichte Fisch-Datensatz wird abgerufen …" /></div>;
  if (fish.isError || !fish.data) return <div className="observatory-route observatory-route--aquarium"><StatePanel code="AQUARIUM/EMPTY" state="empty" title="FISCH NICHT GEFUNDEN" body="Dieser Datensatz ist nicht veröffentlicht oder nicht vorhanden." /></div>;
  const item = fish.data;
  const commonNames = Array.isArray(item.commonNames) ? item.commonNames.map(String) : [];
  const synonyms = Array.isArray(item.synonyms) ? item.synonyms.map(String) : [];
  const profile = item.careProfile && typeof item.careProfile === "object" ? item.careProfile as Record<string, unknown> : {};
  const careLevel = textValue(profile.careLevel);
  const water = textValue(profile.water);
  const isSaved = saved.data?.some(row => row.targetType === "aquarium_taxon" && row.targetId === item.id);
  const toggleSave = () => {
    if (!auth.isAuthenticated) return;
    const input = { targetType: "aquarium_taxon" as const, targetId: item.id };
    (isSaved ? unsave : save).mutate(input, { onSuccess: () => void saved.refetch() });
  };
  return <div className="observatory-route observatory-route--aquarium plant-taxon-page aquarium-taxon-page">
    <Link className="page-back-link" href="/search"><ArrowLeft size={16} />Suche & Entdecken</Link>
    <section className="plant-taxon-hero observatory-data-panel">
      {item.imageUrl ? <TaxonImageModal category="Fisch" scientificName={item.scientificName} imageUrl={item.imageUrl} imageSourceUrl={item.imageSourceUrl} imageLicense={item.imageLicense} imageAttribution={item.imageAttribution} /> : <div className="plant-taxon-placeholder aquarium-taxon-placeholder"><Fish size={46} /><span>Bildnachweis offen</span></div>}
      <div><span className="eyebrow">VALIDIERTER AQUARISTIK-KATALOG · CHANNA</span><h1>{item.scientificName}</h1><p>{item.acceptedScientificName && item.acceptedScientificName !== item.scientificName ? `Akzeptierter Name: ${item.acceptedScientificName}` : item.family ?? "Aquaristik-Datensatz"}</p><div className="plant-taxon-badges"><span><ShieldCheck size={13} />{item.evidenceState}</span>{item.rank ? <span>{item.rank}</span> : null}<TaxonHabitatAction kind="aquarium" name={item.scientificName} scientificName={item.scientificName} />{auth.isAuthenticated ? <button type="button" className="secondary-action" onClick={toggleSave} disabled={save.isPending || unsave.isPending}><Save size={14} />{isSaved ? "GESPEICHERT" : "SPEICHERN"}</button> : null}</div>{item.imageSourceUrl ? <div className="taxon-image-credit"><span>Bild: {item.imageAttribution ?? "Attribution hinterlegt"}</span><a href={item.imageSourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} />Quelle · {item.imageLicense ?? "Lizenzangabe"}</a></div> : <p className="taxon-image-pending">Für diesen Fisch ist noch kein verifiziertes Katalogbild hinterlegt.</p>}</div>
    </section>
    <section className="plant-taxon-content observatory-data-panel"><div className="section-heading"><div><span className="eyebrow">FISHBASE · VALIDIERTE QUELLE</span><h2>KURZPROFIL</h2></div><CheckCircle2 size={22} /></div><p>{item.summary ?? "Für diesen validierten Datensatz liegt noch keine Kurzbeschreibung vor."}</p>{commonNames.length ? <div className="taxon-meta"><strong>GEBRÄUCHLICHE NAMEN</strong><span>{commonNames.join(" · ")}</span></div> : null}{synonyms.length ? <div className="taxon-meta"><strong>SYNONYME</strong><span>{synonyms.join(" · ")}</span></div> : null}</section>
    <TaxonRangeMap realm="aquarium" summary={item.summary} careProfile={profile} source={item.source} sourceUrl={item.sourceRecordUrl} />
    <TaxonFactSheet realm="aquarium" profile={profile} />
    {(careLevel || water) ? <section className="plant-taxon-content observatory-data-panel"><div className="section-heading"><div><span className="eyebrow">AQUARISTIK</span><h2>HALTUNGSHINWEISE</h2></div><Thermometer size={22} /></div><div className="taxon-care-grid">{careLevel ? <div className="taxon-meta"><strong>ANSPRUCH</strong><span>{careLevel}</span></div> : null}{water ? <div className="taxon-meta"><strong>WASSER</strong><span>{water}</span></div> : null}</div><p className="taxon-disclaimer">Die Hinweise sind ein kompakter Katalogauszug. Vor einer Haltung bitte Größe, Herkunft, Verhalten und gesetzliche Vorgaben individuell prüfen.</p></section> : null}
  </div>;
}
