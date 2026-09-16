import { ReferenceHero } from "@/components/ReferenceOverlay";
import { StatePanel } from "@/components/StatePanel";
import { addMarketplaceProduct, readMarketplaceCart, writeMarketplaceCart } from "@/lib/marketplaceCart";
import { marketplaceCategoryLabel, marketplaceDisclosure, type MarketplaceCartLine } from "@/lib/marketplacePresentation";
import { trpc } from "@/lib/trpc";
import { REFERENCE_ASSETS } from "@/lib/worlds";
import { ArrowLeft, ExternalLink, PackageOpen, Plus, ShieldCheck, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";

export default function MarketplaceProduct() {
  const [, params] = useRoute("/marketplace/product/:id");
  const id = Number(params?.id);
  const product = trpc.partners.marketplaceProduct.useQuery({ id }, { enabled: Number.isInteger(id) && id > 0, retry: false });
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    setNotice(null);
    setSelectedImage(0);
  }, [id]);

  useEffect(() => {
    document.title = product.data?.seoTitle ?? (product.data ? `${product.data.title} · BlackWaterLeaf` : "Marktplatz · BlackWaterLeaf");
  }, [product.data]);

  if (!Number.isInteger(id) || id <= 0) return <StatePanel code="MARKET/ROUTE" state="error" title="PRODUKT NICHT GEFUNDEN" body="Diese Produktadresse ist ungültig." action={<Link className="primary-action" href="/marketplace">ZUM MARKTPLATZ</Link>} />;
  if (product.isLoading) return <StatePanel code="MARKET/DETAIL_LOAD" state="loading" title="PARTNERANGEBOT WIRD GEPRÜFT" body="Sichtbar wird nur ein aktuell freigegebenes Angebot." />;
  if (product.isError || !product.data) return <StatePanel code="MARKET/DETAIL_UNAVAILABLE" state="error" title="ANGEBOT NICHT VERFÜGBAR" body="Das Produkt ist nicht mehr aktiv, die Partnerfreigabe ist abgelaufen oder die Angaben konnten nicht verifiziert werden." action={<Link className="primary-action" href="/marketplace">ZUM MARKTPLATZ</Link>} />;

  const item = product.data;
  const gallery = item.gallery.length ? item.gallery : item.imageUrl ? [{ id: 0, position: 1, imageUrl: item.imageUrl, altText: item.imageAltText }] : [];
  const activeImage = gallery[Math.min(selectedImage, Math.max(0, gallery.length - 1))] ?? null;
  const category = marketplaceCategoryLabel(item.marketplaceCategory);
  const addToCart = () => {
    const next: MarketplaceCartLine[] = addMarketplaceProduct(readMarketplaceCart(), item);
    writeMarketplaceCart(next);
    setNotice("Produkt wurde auf diesem Gerät in deiner Merkliste gespeichert.");
  };

  return <div className="marketplace-detail reference-page reference-page--aquarium">
    <Link href="/marketplace" className="marketplace-back"><ArrowLeft size={16} /> ZURÜCK ZUM MARKTPLATZ</Link>
    <ReferenceHero tone="aquarium" icon={ShoppingBag} eyebrow={`PARTNER-ANGEBOT · ${category.toUpperCase()}`} title={item.title} subtitle={item.seoDescription ?? item.description ?? "Details und Konditionen erhältst du direkt beim Partner."} image={activeImage?.imageUrl ?? REFERENCE_ASSETS.aquarium} badge={item.disclosureLabel} />
    <section className="marketplace-product-panel glass-panel">
      <div className="marketplace-product-gallery">
        <div className="marketplace-product-image">{activeImage ? <img src={activeImage.imageUrl} alt={activeImage.altText ?? item.imageAltText ?? item.title} /> : <span><PackageOpen size={40} />Kein Produktbild verfügbar</span>}</div>
        {gallery.length > 1 ? <div className="marketplace-gallery-thumbnails" aria-label="Produktbilder">{gallery.map((image, index) => <button key={image.id} type="button" className={index === selectedImage ? "active" : ""} onClick={() => setSelectedImage(index)} aria-label={`Produktbild ${index + 1} anzeigen`}><img src={image.imageUrl} alt="" /></button>)}</div> : null}
      </div>
      <div className="marketplace-product-copy">
        <p className="marketplace-card__disclosure">{marketplaceDisclosure(item)}</p>
        <span className="marketplace-category">{category}</span>
        <h2>{item.title}</h2>
        <strong className="marketplace-detail-price">{item.priceLabel ?? "Preis beim Partner"}</strong>
        {item.sourceVendor ? <p className="marketplace-product-vendor">Anbieter: <strong>{item.sourceVendor}</strong></p> : null}
        {item.productType ? <p className="marketplace-product-type">Produktart: {item.productType}</p> : null}
        <p>{item.description ?? "Für genaue Produktdetails, Verfügbarkeit, Versand und Rückgabe öffne den Shop des Partners."}</p>
        {item.variantSummary ? <div className="marketplace-variants"><strong>{item.variantCount > 1 ? `${item.variantCount} Varianten` : "Variante"}</strong><span>{item.variantSummary}</span></div> : null}
        <div className="marketplace-detail-actions"><button type="button" className="secondary-action" onClick={addToCart}><Plus size={16} /> MERKEN</button><a className="primary-action" href={item.destinationUrl} target="_blank" rel="sponsored nofollow noopener">ZUM ANGEBOT <ExternalLink size={16} /></a></div>
        {notice ? <p className="marketplace-detail-notice" role="status">{notice}</p> : null}
      </div>
    </section>
    <section className="marketplace-legal glass-panel"><ShieldCheck size={22} /><div><strong>Direkt beim Partner kaufen</strong><p>BlackWaterLeaf vermittelt zu {item.partnerName}. Der Kaufvertrag, Bezahlvorgang, Versand, Widerruf und Support werden ausschließlich vom jeweiligen Partner abgewickelt.</p>{item.partnerUrl ? <a href={item.partnerUrl} target="_blank" rel="sponsored nofollow noopener">{item.partnerName} besuchen <ExternalLink size={14} /></a> : null}</div></section>
  </div>;
}
