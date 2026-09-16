import { ReferenceHero } from "@/components/ReferenceOverlay";
import { StatePanel } from "@/components/StatePanel";
import { addMarketplaceProduct, readMarketplaceCart, writeMarketplaceCart } from "@/lib/marketplaceCart";
import { marketplaceDisclosure, type MarketplaceCartLine } from "@/lib/marketplacePresentation";
import { trpc } from "@/lib/trpc";
import { REFERENCE_ASSETS } from "@/lib/worlds";
import { ArrowLeft, ExternalLink, PackageOpen, Plus, ShieldCheck, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";

export default function MarketplaceProduct() {
  const [, params] = useRoute("/marketplace/product/:id");
  const id = Number(params?.id);
  const product = trpc.partners.marketplaceProduct.useQuery({ id }, { enabled: Number.isInteger(id) && id > 0, retry: false });
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => { setNotice(null); }, [id]);

  if (!Number.isInteger(id) || id <= 0) return <StatePanel code="MARKET/ROUTE" state="error" title="PRODUKT NICHT GEFUNDEN" body="Diese Produktadresse ist ungültig." action={<Link className="primary-action" href="/marketplace">ZUM MARKTPLATZ</Link>} />;
  if (product.isLoading) return <StatePanel code="MARKET/DETAIL_LOAD" state="loading" title="PARTNERANGEBOT WIRD GEPRÜFT" body="Sichtbar wird nur ein aktuell freigegebenes Angebot." />;
  if (product.isError || !product.data) return <StatePanel code="MARKET/DETAIL_UNAVAILABLE" state="error" title="ANGEBOT NICHT VERFÜGBAR" body="Das Produkt ist nicht mehr aktiv, die Partnerfreigabe ist abgelaufen oder die Angaben konnten nicht verifiziert werden." action={<Link className="primary-action" href="/marketplace">ZUM MARKTPLATZ</Link>} />;

  const item = product.data;
  const addToCart = () => {
    const next: MarketplaceCartLine[] = addMarketplaceProduct(readMarketplaceCart(), item);
    writeMarketplaceCart(next);
    setNotice("Produkt wurde auf diesem Gerät in deiner Merkliste gespeichert.");
  };

  return <div className="marketplace-detail reference-page reference-page--aquarium"><Link href="/marketplace" className="marketplace-back"><ArrowLeft size={16} /> ZURÜCK ZUM MARKTPLATZ</Link><ReferenceHero tone="aquarium" icon={ShoppingBag} eyebrow="PARTNER-ANGEBOT" title={item.title} subtitle={item.description ?? "Details und Konditionen erhältst du direkt beim Partner."} image={item.imageUrl ?? REFERENCE_ASSETS.aquarium} badge={item.disclosureLabel} /><section className="marketplace-product-panel glass-panel"><div className="marketplace-product-image">{item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <span><PackageOpen size={40} />Kein Produktbild verfügbar</span>}</div><div className="marketplace-product-copy"><p className="marketplace-card__disclosure">{marketplaceDisclosure(item)}</p><h2>{item.title}</h2><strong className="marketplace-detail-price">{item.priceLabel ?? "Preis beim Partner"}</strong><p>{item.description ?? "Für genaue Produktdetails, Verfügbarkeit, Versand und Rückgabe öffne den Shop des Partners."}</p><div className="marketplace-detail-actions"><button type="button" className="secondary-action" onClick={addToCart}><Plus size={16} /> MERKEN</button><a className="primary-action" href={item.destinationUrl} target="_blank" rel="sponsored nofollow noopener">ZUM ANGEBOT <ExternalLink size={16} /></a></div>{notice ? <p className="marketplace-detail-notice" role="status">{notice}</p> : null}</div></section><section className="marketplace-legal glass-panel"><ShieldCheck size={22} /><div><strong>Direkt beim Partner kaufen</strong><p>BlackWaterLeaf vermittelt zu {item.partnerName}. Der Kaufvertrag, Bezahlvorgang, Versand, Widerruf und Support werden ausschließlich vom jeweiligen Partner abgewickelt.</p>{item.partnerUrl ? <a href={item.partnerUrl} target="_blank" rel="sponsored nofollow noopener">{item.partnerName} besuchen <ExternalLink size={14} /></a> : null}</div></section></div>;
}
