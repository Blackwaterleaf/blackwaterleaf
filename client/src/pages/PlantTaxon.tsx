import { ArrowLeft, CheckCircle2, ExternalLink, Leaf, Save, ShieldCheck } from "lucide-react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { StatePanel } from "@/components/StatePanel";
import { TaxonRangeMap } from "@/components/TaxonRangeMap";
import { TaxonImageModal } from "@/components/TaxonImageModal";
import { TaxonFactSheet } from "@/components/TaxonFactSheet";
import { useAuth } from "@/_core/hooks/useAuth";

export default function PlantTaxon() {
  const [, params] = useRoute("/plant/:id");
  const id = Number(params?.id);
  const auth = useAuth();
  const plant = trpc.search.plantById.useQuery({ id }, { enabled: Number.isSafeInteger(id) && id > 0, retry: false });
  const save = trpc.social.save.useMutation();
  const unsave = trpc.social.unsave.useMutation();
  const saved = trpc.social.saved.useQuery(undefined, { enabled: auth.isAuthenticated });
  if (plant.isLoading) return <div className="observatory-route observatory-route--botany"><StatePanel code="PLANT/LOAD" state="loading" title="PFLANZE WIRD GELADEN" body="Der veröffentlichte Taxon-Datensatz wird abgerufen …" /></div>;
  if (plant.isError || !plant.data) return <div className="observatory-route observatory-route--botany"><StatePanel code="PLANT/EMPTY" state="empty" title="PFLANZE NICHT GEFUNDEN" body="Dieser Datensatz ist nicht veröffentlicht oder nicht vorhanden." /></div>;
  const item = plant.data;
  const commonNames = Array.isArray(item.commonNames) ? item.commonNames.map(String) : [];
  const synonyms = Array.isArray(item.synonyms) ? item.synonyms.map(String) : [];
  const isSaved = saved.data?.some(row => row.targetType === "plant_taxon" && row.targetId === item.id);
  const toggleSave = () => {
    if (!auth.isAuthenticated) return;
    const input = { targetType: "plant_taxon" as const, targetId: item.id };
    (isSaved ? unsave : save).mutate(input, { onSuccess: () => void saved.refetch() });
  };
  return <div className="observatory-route observatory-route--botany plant-taxon-page">
    <Link className="page-back-link" href="/explore"><ArrowLeft size={16} />Suche & Entdecken</Link>
    <section className="plant-taxon-hero observatory-data-panel">
      {item.imageUrl ? <TaxonImageModal category="Pflanze" scientificName={item.scientificName} imageUrl={item.imageUrl} imageSourceUrl={item.imageSourceUrl} imageLicense={item.imageLicense} imageAttribution={item.imageAttribution} /> : <div className="plant-taxon-placeholder"><Leaf size={46} /><span>Bildnachweis offen</span></div>}
      <div><span className="eyebrow">VALIDIERTER PFLANZENKATALOG</span><h1>{item.scientificName}</h1><p>{item.acceptedScientificName && item.acceptedScientificName !== item.scientificName ? `Akzeptierter Name: ${item.acceptedScientificName}` : item.family ?? "Taxon-Datensatz"}</p><div className="plant-taxon-badges"><span><ShieldCheck size={13} />{item.evidenceState}</span>{item.rank ? <span>{item.rank}</span> : null}{auth.isAuthenticated ? <button type="button" className="secondary-action" onClick={toggleSave} disabled={save.isPending || unsave.isPending}><Save size={14} />{isSaved ? "GESPEICHERT" : "SPEICHERN"}</button> : null}</div>{item.imageSourceUrl ? <div className="taxon-image-credit"><span>Bild: {item.imageAttribution ?? "Attribution hinterlegt"}</span><a href={item.imageSourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} />Quelle · {item.imageLicense ?? "Lizenzangabe"}</a></div> : <p className="taxon-image-pending">Für dieses Taxon ist noch kein verifiziertes Katalogbild hinterlegt.</p>}</div>
    </section>
    <section className="plant-taxon-content observatory-data-panel"><div className="section-heading"><div><span className="eyebrow">DATENBASIS</span><h2>KURZPROFIL</h2></div><CheckCircle2 size={22} /></div><p>{item.summary ?? "Für diesen validierten Datensatz liegt noch keine Kurzbeschreibung vor."}</p>{commonNames.length ? <div className="taxon-meta"><strong>GEBRÄUCHLICHE NAMEN</strong><span>{commonNames.join(" · ")}</span></div> : null}{synonyms.length ? <div className="taxon-meta"><strong>SYNONYME</strong><span>{synonyms.join(" · ")}</span></div> : null}</section>
    <TaxonRangeMap realm="botany" summary={item.summary} careProfile={item.careProfile && typeof item.careProfile === "object" ? item.careProfile as Record<string, unknown> : null} source={item.source} sourceUrl={item.sourceRecordUrl} />
    <TaxonFactSheet realm="botany" profile={item.careProfile && typeof item.careProfile === "object" ? item.careProfile as Record<string, unknown> : null} />
  </div>;
}
