import { LiveSensorStrip } from "@/components/LiveSensorStrip";
import { ReferenceHero } from "@/components/ReferenceOverlay";
import { StatePanel } from "@/components/StatePanel";
import { addMarketplaceProduct, readMarketplaceCart, removeMarketplaceProduct, setMarketplaceQuantity, writeMarketplaceCart } from "@/lib/marketplaceCart";
import { filterMarketplaceProducts, groupMarketplaceCart, marketplaceCategoryLabel, marketplaceDisclosure, marketplaceProductCount, type MarketplaceCartLine } from "@/lib/marketplacePresentation";
import { trpc } from "@/lib/trpc";
import { REFERENCE_ASSETS } from "@/lib/worlds";
import { ArrowRight, ExternalLink, Leaf, Minus, PackageOpen, Plus, Search, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

export default function Marketplace() {
  const catalogue = trpc.partners.marketplace.useQuery(undefined, { retry: false });
  const [search, setSearch] = useState("");
  const [partnerId, setPartnerId] = useState<number | "all">("all");
  const [category, setCategory] = useState<string | "all">("all");
  const [cart, setCart] = useState<MarketplaceCartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    document.title = "Marktplatz · BlackWaterLeaf";
    setCart(readMarketplaceCart());
  }, []);

  const products = catalogue.data ?? [];
  const partners = useMemo(() => Array.from(new Map(products.map(product => [product.partnerId, { id: product.partnerId, name: product.partnerName }])).values()), [products]);
  const categories = useMemo(() => Array.from(new Set(products.map(product => product.marketplaceCategory).filter((value): value is string => Boolean(value)))).sort((first, second) => marketplaceCategoryLabel(first).localeCompare(marketplaceCategoryLabel(second), "de")), [products]);
  const filtered = useMemo(() => filterMarketplaceProducts(products, search, partnerId, category), [products, search, partnerId, category]);
  const cartCount = marketplaceProductCount(cart);

  const updateCart = (next: MarketplaceCartLine[]) => {
    setCart(next);
    writeMarketplaceCart(next);
  };

  const addToCart = (product: typeof products[number]) => {
    updateCart(addMarketplaceProduct(cart, product));
    setCartOpen(true);
  };

  return (
    <div className="marketplace-page reference-page reference-page--aquarium">
      <LiveSensorStrip compact />
      <ReferenceHero
        tone="aquarium"
        icon={ShoppingBag}
        eyebrow="BLACKWATERLEAF MARKTPLATZ"
        title="GUTES FINDET SEINEN ORT."
        subtitle="Entdecke sorgfältig freigegebene Angebote unserer Partner für Aquaristik, Botanik und Terraristik."
        image={REFERENCE_ASSETS.aquarium}
        badge="PARTNER-ANGEBOTE"
      />

      <section className="marketplace-entry glass-panel" aria-label="Marktplatz Einstieg">
        <div className="marketplace-entry__icon"><ShoppingBag size={20} /></div>
        <div><span className="eyebrow">[KURATIERT & TRANSPARENT]</span><h2>Finde, was zu deiner Welt passt.</h2><p>Durchsuche ausschließlich aktuell freigegebene Partnerangebote oder sichere Artikel für später in deiner lokalen Merkliste.</p></div>
        <a className="secondary-action" href="#partnerangebote"><Search size={16} />ANGEBOTE ANSEHEN</a>
      </section>

      <section className="marketplace-trust glass-panel">
        <Leaf size={20} />
        <div><strong>Transparent vermittelt</strong><p>BlackWaterLeaf verkauft nicht selbst. Produkte, Versand, Rückgabe und Zahlung liegen beim jeweiligen Partner. Jeder externe Link ist als Angebot eines Partners gekennzeichnet.</p></div>
      </section>

      <section className="marketplace-toolbar" aria-label="Produkte filtern">
        <label className="marketplace-search"><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Produkte oder Partner suchen" aria-label="Produkte oder Partner suchen" /></label>
        <button className="marketplace-cart-trigger" type="button" onClick={() => setCartOpen(true)} aria-label={`Warenkorb öffnen, ${cartCount} Artikel`}><ShoppingBag size={18} /><span>MERKLISTE</span>{cartCount ? <b>{cartCount}</b> : null}</button>
      </section>

      <section id="partnerangebote" className="marketplace-catalogue" aria-label="Partnerangebote">
        <div className="section-heading"><div><span className="eyebrow">[AUSGEWÄHLT & TRANSPARENT]</span><h2>Partner-Angebote</h2></div><span className="marketplace-count">{catalogue.isLoading ? "…" : `${filtered.length} PRODUKTE`}</span></div>
        {partners.length > 1 ? <div className="marketplace-filters" role="list" aria-label="Partner auswählen"><button className={partnerId === "all" ? "active" : ""} type="button" onClick={() => setPartnerId("all")}>Alle Partner</button>{partners.map(partner => <button key={partner.id} className={partner.id === partnerId ? "active" : ""} type="button" onClick={() => setPartnerId(partner.id)}>{partner.name}</button>)}</div> : null}
        {categories.length ? <div className="marketplace-filters marketplace-filters--categories" role="list" aria-label="Kategorie auswählen"><button className={category === "all" ? "active" : ""} type="button" onClick={() => setCategory("all")}>Alle Kategorien</button>{categories.map(item => <button key={item} className={item === category ? "active" : ""} type="button" onClick={() => setCategory(item)}>{marketplaceCategoryLabel(item)}</button>)}</div> : null}

        {catalogue.isLoading ? <MarketplaceLoading /> : null}
        {catalogue.isError ? <StatePanel code="MARKET/ERROR" state="error" title="MARKTPLATZ DERZEIT NICHT VERFÜGBAR" body="Die freigegebenen Partnerangebote konnten nicht verifiziert werden. Bitte versuche es später erneut." /> : null}
        {!catalogue.isLoading && !catalogue.isError && products.length === 0 ? <StatePanel code="MARKET/EMPTY" title="NOCH KEINE FREIGEGEBENEN ANGEBOTE" body="Sobald ein Partner freigegeben ist und Artikel aktiviert hat, erscheinen die Produkte hier. Für KiemenKumpel können die Artikel später aus deiner PDF vorbereitet und kontrolliert eingepflegt werden." /> : null}
        {!catalogue.isLoading && !catalogue.isError && products.length > 0 && filtered.length === 0 ? <StatePanel code="MARKET/FILTER" title="KEIN PASSENDES ANGEBOT" body="Ändere die Suche oder wähle einen anderen Partner." /> : null}
        {filtered.length ? <div className="marketplace-grid">{filtered.map(product => <article key={product.id} className="marketplace-card"><Link href={`/marketplace/product/${product.id}`} className="marketplace-card__image">{product.imageUrl ? <img src={product.imageUrl} alt={product.imageAltText ?? product.title} /> : <span><PackageOpen size={31} />Kein Produktbild</span>}</Link><div className="marketplace-card__body"><p className="marketplace-card__disclosure">{marketplaceDisclosure(product)}</p><span className="marketplace-category">{marketplaceCategoryLabel(product.marketplaceCategory)}</span><Link href={`/marketplace/product/${product.id}`}><h3>{product.title}</h3></Link>{product.description ? <p className="marketplace-card__description">{product.description}</p> : <p className="marketplace-card__description">Mehr Details und Bedingungen direkt beim Partner.</p>}<div className="marketplace-card__meta"><strong>{product.priceLabel ?? "Preis beim Partner"}</strong><span>{product.sourceVendor ?? (product.partnerType === "company" ? "Unternehmenspartner" : "Persönliche Empfehlung")}</span></div><div className="marketplace-card__actions"><Link href={`/marketplace/product/${product.id}`} className="marketplace-detail-link">DETAILS <ArrowRight size={15} /></Link><button type="button" className="marketplace-add" onClick={() => addToCart(product)}><Plus size={16} /> MERKEN</button></div></div></article>)}</div> : null}
      </section>

      <MarketplaceCart open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onChange={updateCart} />
    </div>
  );
}

function MarketplaceCart({ open, onClose, cart, onChange }: { open: boolean; onClose: () => void; cart: MarketplaceCartLine[]; onChange: (next: MarketplaceCartLine[]) => void }) {
  if (!open) return null;
  const groups = groupMarketplaceCart(cart);
  return <div className="marketplace-cart-layer" role="dialog" aria-modal="true" aria-label="Gemerkte Partnerprodukte"><button className="marketplace-cart-backdrop" type="button" aria-label="Warenkorb schließen" onClick={onClose} /><aside className="marketplace-cart"><header><div><p className="eyebrow">[DEINE MERKLISTE]</p><h2>Partner-Auswahl</h2></div><button type="button" onClick={onClose} aria-label="Schließen"><X size={20} /></button></header>{groups.length === 0 ? <div className="marketplace-cart-empty"><ShoppingBag size={27} /><p>Deine Merkliste ist leer. Produkte bleiben nur auf diesem Gerät gespeichert.</p></div> : <div className="marketplace-cart-groups">{groups.map(group => <section key={group.partnerId}><div className="marketplace-cart-partner"><strong>{group.partnerName}</strong><span>{group.lines.reduce((sum, line) => sum + line.quantity, 0)} Artikel</span></div>{group.lines.map(line => <article key={line.id} className="marketplace-cart-line">{line.imageUrl ? <img src={line.imageUrl} alt="" /> : <span className="marketplace-cart-fallback"><PackageOpen size={16} /></span>}<div><strong>{line.title}</strong><small>{line.priceLabel ?? "Preis beim Partner"}</small><div className="marketplace-quantity"><button type="button" aria-label={`Ein ${line.title} weniger`} onClick={() => onChange(setMarketplaceQuantity(cart, line.id, line.quantity - 1))}><Minus size={13} /></button><span>{line.quantity}</span><button type="button" aria-label={`Ein ${line.title} mehr`} onClick={() => onChange(setMarketplaceQuantity(cart, line.id, line.quantity + 1))}><Plus size={13} /></button></div></div><button className="marketplace-remove" type="button" aria-label={`${line.title} entfernen`} onClick={() => onChange(removeMarketplaceProduct(cart, line.id))}><Trash2 size={16} /></button></article>)}<a className="primary-action marketplace-checkout" href={group.partnerUrl ?? group.lines[0]?.destinationUrl} target="_blank" rel="sponsored nofollow noopener">ZUM PARTNER-SHOP <ExternalLink size={15} /></a></section>)}</div>}<p className="marketplace-cart-note">Beim Klick öffnet sich der Shop des jeweiligen Partners. Preise, Verfügbarkeit, Zahlung, Versand und Rückgabe gelten dort.</p></aside></div>;
}

function MarketplaceLoading() {
  return <section className="marketplace-loading" aria-busy="true" aria-live="polite" role="status"><div className="marketplace-loading__copy"><span className="marketplace-loading__pulse" aria-hidden="true" /><div><strong>Partnerangebote werden geprüft</strong><p>Es werden nur aktuell freigegebene, aktive Angebote geladen.</p></div></div><div className="marketplace-loading__grid" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <div className="marketplace-loading__card" key={index}><i /><span /><b /><em /></div>)}</div></section>;
}
