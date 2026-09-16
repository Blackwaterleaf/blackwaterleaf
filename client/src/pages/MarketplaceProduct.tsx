import { LiveSensorStrip } from "@/components/LiveSensorStrip";
import { ReferenceHero } from "@/components/ReferenceOverlay";
import { StatePanel } from "@/components/StatePanel";
import { addMarketplaceProduct, readMarketplaceCart, writeMarketplaceCart } from "@/lib/marketplaceCart";
import { marketplaceCategoryLabel, marketplaceDisclosure, type MarketplaceCartLine } from "@/lib/marketplacePresentation";
import { trpc } from "@/lib/trpc";
import { REFERENCE_ASSETS } from "@/lib/worlds";
import { ArrowLeft, ExternalLink, PackageOpen, Plus, ShieldCheck, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";

type DetailState = {
  code: string;
  title: string;
  body: string;
  state: "loading" | "error";
};

export default function MarketplaceProduct() {
  const [, params] = useRoute("/marketplace/product/:id");
  const id = Number(params?.id);
  const hasValidId = Number.isInteger(id) && id > 0;
  const product = trpc.partners.marketplaceProduct.useQuery({ id }, { enabled: hasValidId, retry: false });
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    setNotice(null);
    setSelectedImage(0);
  }, [id]);

  useEffect(() => {
    document.title = product.data?.seoTitle ?? (product.data ? `${product.data.title} · BlackWaterLeaf` : "Marktplatz · BlackWaterLeaf");
  }, [product.data]);

  const item = product.data;
  const detailState: DetailState | null = !hasValidId
    ? { code: "MARKET/ROUTE", title: "PRODUKT NICHT GEFUNDEN", body: "Diese Produktadresse ist ungültig. Es wurde kein Partnerangebot geladen.", state: "error" }
    : product.isLoading
      ? { code: "MARKET/DETAIL_LOAD", title: "PARTNERANGEBOT WIRD GEPRÜFT", body: "Sichtbar wird nur ein aktuell freigegebenes Angebot.", state: "loading" }
      : product.isError || !item
        ? { code: "MARKET/DETAIL_UNAVAILABLE", title: "ANGEBOT NICHT VERFÜGBAR", body: "Das Produkt ist nicht mehr aktiv, die Partnerfreigabe ist abgelaufen oder die Angaben konnten nicht verifiziert werden.", state: "error" }
        : null;
  const gallery = item
    ? item.gallery.length
      ? item.gallery
      : item.imageUrl
        ? [{ id: 0, position: 1, imageUrl: item.imageUrl, altText: item.imageAltText }]
        : []
    : [];
  const activeImage = gallery[Math.min(selectedImage, Math.max(0, gallery.length - 1))] ?? null;

  const addToCart = () => {
    if (!item) return;
    const next: MarketplaceCartLine[] = addMarketplaceProduct(readMarketplaceCart(), item);
    writeMarketplaceCart(next);
    setNotice("Produkt wurde auf diesem Gerät in deiner Merkliste gespeichert.");
  };

  const heroTitle = item?.title ?? detailState?.title ?? "PARTNERANGEBOT";
  const heroSubtitle = item?.seoDescription ?? item?.description ?? detailState?.body ?? "Details und Konditionen erhältst du direkt beim Partner.";
  const heroEyebrow = item ? `PARTNER-ANGEBOT · ${marketplaceCategoryLabel(item.marketplaceCategory).toUpperCase()}` : "MARKTPLATZ / STATUS";

  return (
    <div className="marketplace-detail reference-page reference-page--aquarium">
      <LiveSensorStrip compact />
      <ReferenceHero
        tone="aquarium"
        icon={ShoppingBag}
        eyebrow={heroEyebrow}
        title={heroTitle}
        subtitle={heroSubtitle}
        image={activeImage?.imageUrl ?? REFERENCE_ASSETS.aquarium}
        badge={item?.disclosureLabel ?? "PARTNER-ANGEBOT"}
      />
      <Link href="/marketplace" className="marketplace-back"><ArrowLeft size={16} />ZURÜCK ZUM MARKTPLATZ</Link>

      {detailState ? (
        <StatePanel
          code={detailState.code}
          state={detailState.state}
          title={detailState.title}
          body={detailState.body}
          action={detailState.state === "error" ? <Link className="primary-action" href="/marketplace">ZUM MARKTPLATZ</Link> : undefined}
        />
      ) : item ? (
        <>
          <section className="marketplace-product-panel glass-panel">
            <div className="marketplace-product-gallery">
              <div className="marketplace-product-image">
                {activeImage ? <img src={activeImage.imageUrl} alt={activeImage.altText ?? item.imageAltText ?? item.title} /> : <span><PackageOpen size={40} />Kein Produktbild verfügbar</span>}
              </div>
              {gallery.length > 1 ? (
                <div className="marketplace-gallery-thumbnails" aria-label="Produktbilder">
                  {gallery.map((image, index) => (
                    <button key={image.id} type="button" className={index === selectedImage ? "active" : ""} onClick={() => setSelectedImage(index)} aria-label={`Produktbild ${index + 1} anzeigen`}>
                      <img src={image.imageUrl} alt="" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="marketplace-product-copy">
              <p className="marketplace-card__disclosure">{marketplaceDisclosure(item)}</p>
              <span className="marketplace-category">{marketplaceCategoryLabel(item.marketplaceCategory)}</span>
              <h2>{item.title}</h2>
              <strong className="marketplace-detail-price">{item.priceLabel ?? "Preis beim Partner"}</strong>
              {item.sourceVendor ? <p className="marketplace-product-vendor">Anbieter: <strong>{item.sourceVendor}</strong></p> : null}
              {item.productType ? <p className="marketplace-product-type">Produktart: {item.productType}</p> : null}
              <p>{item.description ?? "Für genaue Produktdetails, Verfügbarkeit, Versand und Rückgabe öffne den Shop des Partners."}</p>
              {item.variantSummary ? <div className="marketplace-variants"><strong>{item.variantCount > 1 ? `${item.variantCount} Varianten` : "Variante"}</strong><span>{item.variantSummary}</span></div> : null}
              <div className="marketplace-detail-actions">
                <button type="button" className="secondary-action" onClick={addToCart}><Plus size={16} />MERKEN</button>
                <a className="primary-action" href={item.destinationUrl} target="_blank" rel="sponsored nofollow noopener">ZUM ANGEBOT <ExternalLink size={16} /></a>
              </div>
              {notice ? <p className="marketplace-detail-notice" role="status">{notice}</p> : null}
            </div>
          </section>
          <section className="marketplace-legal glass-panel">
            <ShieldCheck size={22} />
            <div>
              <strong>Direkt beim Partner kaufen</strong>
              <p>BlackWaterLeaf vermittelt zu {item.partnerName}. Der Kaufvertrag, Bezahlvorgang, Versand, Widerruf und Support werden ausschließlich vom jeweiligen Partner abgewickelt.</p>
              {item.partnerUrl ? <a href={item.partnerUrl} target="_blank" rel="sponsored nofollow noopener">{item.partnerName} besuchen <ExternalLink size={14} /></a> : null}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
