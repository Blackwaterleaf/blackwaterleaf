import { StatePanel } from "@/components/StatePanel";
import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { readMarketplaceFavorites, toggleMarketplaceFavorite, writeMarketplaceFavorites } from "@/lib/marketplaceCart";
import { filterMarketplaceProducts, marketplaceCategoryLabel, marketplaceDisclosure, marketplaceSubcategoryLabel, sortMarketplaceProducts, type MarketplaceProduct, type MarketplaceSort } from "@/lib/marketplacePresentation";
import { ArrowDownUp, ArrowLeft, ArrowRight, ExternalLink, Heart, Layers3, PackageOpen, Search, ShieldCheck, Store, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";

const KIEMEN_KUMPEL_IMAGE = "/manus-storage/kiemen-kumpel-shop_5e6207a0.jpg";

function partnerLogo(name: string) {
  return name.toLowerCase().includes("kiemen-kumpel") ? KIEMEN_KUMPEL_IMAGE : null;
}

export default function MarketplaceShop() {
  const [, params] = useRoute("/marketplace/shop/:id");
  const partnerId = Number(params?.id);
  const validId = Number.isInteger(partnerId) && partnerId > 0;
  const catalogue = trpc.partners.marketplace.useQuery(undefined, { retry: false });
  const recordEvent = trpc.partners.marketplaceEvent.useMutation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | "all">("all");
  const [subcategory, setSubcategory] = useState<string | "all">("all");
  const [sort, setSort] = useState<MarketplaceSort>("relevance");
  const [favorites, setFavorites] = useState<MarketplaceProduct[]>([]);

  useEffect(() => { setFavorites(readMarketplaceFavorites()); }, []);
  const products = catalogue.data ?? [];
  const shopProducts = useMemo(() => products.filter(product => product.partnerId === partnerId), [products, partnerId]);
  const shop = shopProducts[0] ? { name: shopProducts[0].partnerName, type: shopProducts[0].partnerType, url: shopProducts[0].partnerUrl } : null;
  const categories = useMemo(() => Array.from(new Set(shopProducts.map(product => product.marketplaceCategory).filter((value): value is string => Boolean(value)))).sort((a, b) => marketplaceCategoryLabel(a).localeCompare(marketplaceCategoryLabel(b), "de")), [shopProducts]);
  const subcategories = useMemo(() => Array.from(new Set(shopProducts.filter(product => category === "all" || product.marketplaceCategory === category).map(marketplaceSubcategoryLabel).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b, "de")), [shopProducts, category]);
  const filtered = useMemo(() => {
    const categoryProducts = filterMarketplaceProducts(shopProducts, search, "all", category);
    const subcategoryProducts = subcategory === "all" ? categoryProducts : categoryProducts.filter(product => marketplaceSubcategoryLabel(product) === subcategory);
    return sortMarketplaceProducts(subcategoryProducts, sort, search);
  }, [shopProducts, search, category, subcategory, sort]);

  const recordMarketplaceEvent = (productId: number, eventType: "outbound_click" | "purchase_intent") => {
    const eventId = globalThis.crypto?.randomUUID?.();
    if (eventId) recordEvent.mutate({ eventId, productId, eventType });
  };
  const toggleFavorite = (product: MarketplaceProduct) => {
    const next = toggleMarketplaceFavorite(favorites, product);
    setFavorites(next);
    writeMarketplaceFavorites(next);
  };

  if (!validId) return <div className="observatory-route observatory-route--marketplace marketplace-shop-page"><StatePanel code="MARKET/SHOP_ROUTE" state="error" title="SHOP NICHT GEFUNDEN" body="Diese Händleradresse ist ungültig." action={<Link className="primary-action" href="/marketplace">ZUM MARKTPLATZ</Link>} /></div>;
  if (catalogue.isLoading) return <div className="observatory-route observatory-route--marketplace marketplace-shop-page"><StatePanel code="MARKET/SHOP_LOAD" state="loading" title="SHOP WIRD GEÖFFNET" body="Die freigegebenen Angebote werden geprüft." /></div>;
  if (catalogue.isError || !shop) return <div className="observatory-route observatory-route--marketplace marketplace-shop-page"><StatePanel code="MARKET/SHOP_UNAVAILABLE" state="error" title="SHOP NICHT VERFÜGBAR" body="Der Shop ist nicht mehr öffentlich freigegeben oder die Angebote konnten nicht verifiziert werden." action={<Link className="primary-action" href="/marketplace">ZUR SHOPAUSWAHL</Link>} /></div>;

  return <div className="observatory-route observatory-route--marketplace marketplace-shop-page marketplace-page">
    <Link className="marketplace-shop-back" href="/marketplace"><ArrowLeft size={16} />SHOPAUSWAHL</Link>
    <ObservatoryContextHeader tone="marketplace" image={partnerLogo(shop.name) ?? "/manus-storage/kiemen-kumpel-shop_5e6207a0.jpg"} eyebrow={`MARKTPLATZ · ${shop.type === "company" ? "FACHHANDEL" : "PARTNER-SHOP"}`} title={shop.name} icon={Store} badge="FREIGEGEBENER SHOP" children={shop.url ? <a className="secondary-action" href={shop.url} target="_blank" rel="sponsored nofollow noopener">HÄNDLER BESUCHEN <ExternalLink size={15} /></a> : undefined} />

    <section className="marketplace-shop-toolbar observatory-data-panel"><label className="marketplace-search"><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={`${shop.name} durchsuchen`} aria-label={`${shop.name} durchsuchen`} /></label><label className="marketplace-sort"><ArrowDownUp size={15} /><span>SORTIEREN</span><select value={sort} onChange={event => setSort(event.target.value as MarketplaceSort)} aria-label="Produkte sortieren"><option value="relevance">Relevanz</option><option value="newest">Neueste</option><option value="name">Name A–Z</option><option value="priceAsc">Preis aufsteigend</option><option value="priceDesc">Preis absteigend</option></select></label><div className="marketplace-shop-toolbar__count">{filtered.length} / {shopProducts.length} ANGEBOTE</div></section>
    <section className="marketplace-shop-categories" aria-label="Produktkategorien"><button type="button" className={category === "all" ? "active" : ""} onClick={() => { setCategory("all"); setSubcategory("all"); }}><Store size={15} />ALLE ANGEBOTE</button>{categories.map(item => <button type="button" className={category === item ? "active" : ""} key={item} onClick={() => { setCategory(item); setSubcategory("all"); }}>{marketplaceCategoryLabel(item)}</button>)}</section>
    {subcategories.length ? <section className="marketplace-shop-subcategories" aria-label="Unterkategorien"><span><Layers3 size={14} />UNTERKATEGORIEN</span><button type="button" className={subcategory === "all" ? "active" : ""} onClick={() => setSubcategory("all")}>ALLE</button>{subcategories.map(item => <button type="button" className={subcategory === item ? "active" : ""} key={item} onClick={() => setSubcategory(item)}>{item}</button>)}</section> : null}

    {filtered.length === 0 ? <StatePanel code="MARKET/SHOP_FILTER" title="KEIN PASSENDES ANGEBOT" body="Wähle eine andere Kategorie oder ändere deine Suche." /> : <section className="marketplace-shop-products" aria-label={`${shop.name} Produkte`}><div className="section-heading"><div><span className="eyebrow">[SHOPINVENTAR]</span><h2>Angebote von {shop.name}</h2></div><span className="marketplace-count">{filtered.length} TREFFER</span></div><div className="marketplace-grid">{filtered.map(product => { const isFavorite = favorites.some(favorite => favorite.id === product.id); return <article key={product.id} className="marketplace-card marketplace-card--shop"><button type="button" className={`marketplace-favorite-toggle ${isFavorite ? "is-favorite" : ""}`} onClick={() => toggleFavorite(product)} aria-label={`${product.title} ${isFavorite ? "aus der Merkliste entfernen" : "zur Merkliste hinzufügen"}`} aria-pressed={isFavorite}><Heart size={17} fill={isFavorite ? "currentColor" : "none"} /></button><Link href={`/marketplace/product/${product.id}`} className="marketplace-card__image">{product.imageUrl ? <img src={product.imageUrl} alt={product.imageAltText ?? product.title} /> : <span><PackageOpen size={31} />Kein Produktbild</span>}</Link><div className="marketplace-card__body"><p className="marketplace-card__disclosure">{marketplaceDisclosure(product)}</p><span className="marketplace-category">{marketplaceCategoryLabel(product.marketplaceCategory)}</span><Link href={`/marketplace/product/${product.id}`}><h3>{product.title}</h3></Link><p className="marketplace-card__description">{product.description ?? "Details und Bedingungen direkt beim Partner."}</p><div className="marketplace-card__offer"><div className="marketplace-card__price"><span>PREIS</span><strong>{product.priceLabel ?? "Preis beim Partner"}</strong></div></div><div className="marketplace-card__actions"><Link href={`/marketplace/product/${product.id}`} className="marketplace-detail-link">DETAILS <ArrowRight size={15} /></Link><button type="button" className="marketplace-interest" onClick={() => recordMarketplaceEvent(product.id, "purchase_intent")}><Target size={14} />KAUFINTERESSE MERKEN</button><button type="button" className={isFavorite ? "marketplace-saved-status" : "marketplace-save-hint"} onClick={() => toggleFavorite(product)}>{isFavorite ? "GEMERKT" : "HERZ = MERKEN"}</button></div></div></article>; })}</div></section>}
    <p className="marketplace-shop-disclaimer"><ShieldCheck size={16} />BlackWaterLeaf vermittelt. Zahlung, Versand, Rückgabe und Support erfolgen ausschließlich beim jeweiligen Händler.</p>
  </div>;
}
