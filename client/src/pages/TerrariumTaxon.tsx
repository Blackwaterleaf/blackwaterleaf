import { ArrowLeft, Bug, CheckCircle2, ExternalLink, ShieldCheck, Thermometer } from "lucide-react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { StatePanel } from "@/components/StatePanel";
import { TaxonRangeMap } from "@/components/TaxonRangeMap";
import { TaxonImageModal } from "@/components/TaxonImageModal";
import { TaxonFactSheet } from "@/components/TaxonFactSheet";
import { TaxonHabitatAction } from "@/components/TaxonHabitatAction";

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export default function TerrariumTaxon() {
  const [, params] = useRoute("/terrarium/:id");
  const id = Number(params?.id);
  const taxon = trpc.search.terrariumById.useQuery({ id }, { enabled: Number.isSafeInteger(id) && id > 0, retry: false });
  if (taxon.isLoading) return <div className="observatory-route observatory-route--terrarium"><StatePanel code="TERRARIUM/LOAD" state="loading" title="TERRARISTIK-DATENSATZ WIRD GELADEN" body="Der veröffentlichte Tier-Datensatz wird abgerufen …" /></div>;
  if (taxon.isError || !taxon.data) return <div className="observatory-route observatory-route--terrarium"><StatePanel code="TERRARIUM/EMPTY" state="empty" title="TIER NICHT GEFUNDEN" body="Dieser Datensatz ist nicht veröffentlicht oder nicht vorhanden." /></div>;
  const item = taxon.data;
  const commonNames = Array.isArray(item.commonNames) ? item.commonNames.map(String) : [];
  const synonyms = Array.isArray(item.synonyms) ? item.synonyms.map(String) : [];
  const profile = item.careProfile && typeof item.careProfile === "object" ? item.careProfile as Record<string, unknown> : {};
  const careLevel = textValue(profile.careLevel);
  return <div className="observatory-route observatory-route--terrarium plant-taxon-page aquarium-taxon-page">
    <Link className="page-back-link" href="/search?realm=terrarium"><ArrowLeft size={16} />Terraristik-Katalog</Link>
    <section className="plant-taxon-hero observatory-data-panel">
      {item.imageUrl ? <TaxonImageModal category="Terrarium" scientificName={item.scientificName} imageUrl={item.imageUrl} imageSourceUrl={item.imageSourceUrl} imageLicense={item.imageLicense} imageAttribution={item.imageAttribution} /> : <div className="plant-taxon-placeholder aquarium-taxon-placeholder"><Bug size={46} /><span>Bildnachweis offen</span></div>}
      <div><span className="eyebrow">VALIDIERTER TERRARISTIK-KATALOG</span><h1>{item.scientificName}</h1><p>{item.acceptedScientificName && item.acceptedScientificName !== item.scientificName ? `Akzeptierter Name: ${item.acceptedScientificName}` : item.family ?? "Terraristik-Datensatz"}</p><div className="plant-taxon-badges"><span><ShieldCheck size={13} />{item.evidenceState}</span>{item.rank ? <span>{item.rank}</span> : null}<TaxonHabitatAction kind="terrarium" name={item.scientificName} scientificName={item.scientificName} /></div>{item.imageSourceUrl ? <div className="taxon-image-credit"><span>Bild: {item.imageAttribution ?? "Attribution hinterlegt"}</span><a href={item.imageSourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} />Quelle · {item.imageLicense ?? "Lizenzangabe"}</a></div> : <p className="taxon-image-pending">Für dieses Tier ist noch kein verifiziertes Katalogbild hinterlegt.</p>}</div>
    </section>
    <section className="plant-taxon-content observatory-data-panel"><div className="section-heading"><div><span className="eyebrow">QUELLENBASIERT · TERRARISTIK</span><h2>KURZPROFIL</h2></div><CheckCircle2 size={22} /></div><p>{item.summary ?? "Für diesen validierten Datensatz liegt noch keine Kurzbeschreibung vor."}</p>{commonNames.length ? <div className="taxon-meta"><strong>GEBRÄUCHLICHE NAMEN</strong><span>{commonNames.join(" · ")}</span></div> : null}{synonyms.length ? <div className="taxon-meta"><strong>SYNONYME</strong><span>{synonyms.join(" · ")}</span></div> : null}</section>
    <TaxonRangeMap realm="terrarium" summary={item.summary} careProfile={profile} source={item.source} sourceUrl={item.sourceRecordUrl} />
    <TaxonFactSheet realm="terrarium" profile={profile} />
    {careLevel ? <section className="plant-taxon-content observatory-data-panel"><div className="section-heading"><div><span className="eyebrow">TERRARISTIK</span><h2>HALTUNGSHINWEISE</h2></div><Thermometer size={22} /></div><div className="taxon-care-grid"><div className="taxon-meta"><strong>ANSPRUCH</strong><span>{careLevel}</span></div></div><p className="taxon-disclaimer">Die Hinweise sind ein kompakter Katalogauszug. Vor einer Haltung bitte Größe, Herkunft, Verhalten und gesetzliche Vorgaben individuell prüfen.</p></section> : null}
  </div>;
}
