import { useAuth } from "@/_core/hooks/useAuth";
import { StatePanel } from "@/components/StatePanel";
import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { marketplaceCategoryLabel, type MarketplaceProduct } from "@/lib/marketplacePresentation";
import { REFERENCE_ASSETS } from "@/lib/worlds";
import { ArrowRight, ExternalLink, Leaf, ShieldCheck, Store } from "lucide-react";
import { Link } from "wouter";

const KIEMEN_KUMPEL_IMAGE = "/manus-storage/kiemen-kumpel-shop_5e6207a0.jpg";

function partnerLogo(name: string) {
  return name.toLowerCase().includes("kiemen-kumpel") ? KIEMEN_KUMPEL_IMAGE : null;
}

export default function Marketplace() {
  const auth = useAuth();
  const catalogue = trpc.partners.marketplace.useQuery(undefined, { retry: false });
  const merchantProfiles = trpc.partners.merchantProfiles.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  const products = catalogue.data ?? [];
  const shops = Array.from(new Map(products.map(product => [product.partnerId, {
    id: product.partnerId,
    name: product.partnerName,
    type: product.partnerType,
    url: product.partnerUrl,
    products: products.filter(item => item.partnerId === product.partnerId),
  }])).values());

  return (
    <div className="observatory-route observatory-route--marketplace marketplace-page marketplace-hub">
      <ObservatoryContextHeader tone="marketplace" image={REFERENCE_ASSETS.aquarium} eyebrow="MARKTPLATZ · BLACKWATERLEAF" title="DEIN WEG. DEIN SHOP." icon={Store} badge="PARTNERANGEBOTE" />

      <section className="marketplace-hub__intro observatory-data-panel">
        <div className="marketplace-hub__intro-icon"><Store size={22} /></div>
        <div><span className="eyebrow">[SHOPAUSWAHL]</span><h2>Welcher Händler passt zu dir?</h2><p>Keine vermischte Produktwand: Jeder Händler hat seinen eigenen Shopbereich. BlackWaterLeaf vermittelt nur und verkauft nicht selbst.</p></div>
      </section>

      <section className="marketplace-hub__shops" aria-label="Händler auswählen">
        <div className="section-heading"><div><span className="eyebrow">[FREIGEGEBENE HÄNDLER]</span><h2>Shops entdecken</h2></div><span className="marketplace-count">{catalogue.isLoading ? "…" : `${shops.length} SHOPS`}</span></div>
        {catalogue.isLoading ? <ShopLoading /> : catalogue.isError ? <StatePanel code={offline ? "MARKET/OFFLINE" : "MARKET/HUB_ERROR"} state="error" title={offline ? "OFFLINE – MARKTPLATZ PAUSIERT" : "MARKTPLATZ NICHT VERFÜGBAR"} body={offline ? "Sobald die Verbindung wieder besteht, können freigegebene Händler erneut geladen werden." : "Die aktuell freigegebenen Händler konnten nicht verifiziert werden."} action={<button type="button" className="secondary-action" onClick={() => void catalogue.refetch()}>ERNEUT VERSUCHEN</button>} /> : shops.length === 0 ? <StatePanel code="MARKET/HUB_EMPTY" title="NOCH KEINE SHOPS FREIGEGEBEN" body="Sobald ein Händlerprofil und seine Angebote freigegeben sind, erscheint hier ein eigener Shopbereich." /> : <div className="marketplace-hub__shop-grid">{shops.map(shop => <article className="marketplace-hub-shop" key={shop.id}>
          <div className="marketplace-hub-shop__brand">{partnerLogo(shop.name) ? <img src={partnerLogo(shop.name)!} alt={`${shop.name} Händlerlogo`} /> : <span><Store size={25} /></span>}</div>
          <div className="marketplace-hub-shop__content"><span className="marketplace-hub-shop__type">{shop.type === "company" ? "FACHHANDEL" : "PARTNER-SHOP"}</span><h3>{shop.name}</h3><p>{shop.products.length} {shop.products.length === 1 ? "freigegebenes Angebot" : "freigegebene Angebote"}</p><div className="marketplace-hub-shop__categories">{Array.from(new Set(shop.products.map(product => product.marketplaceCategory).filter((value): value is string => Boolean(value)))).slice(0, 4).map(item => <span key={item}>{marketplaceCategoryLabel(item)}</span>)}</div></div>
          <Link className="marketplace-hub-shop__open" href={`/marketplace/shop/${shop.id}`}>SHOP ÖFFNEN <ArrowRight size={16} /></Link>
        </article>)}</div>}
      </section>

      <section className="marketplace-hub__trust observatory-data-panel"><ShieldCheck size={22} /><div><strong>Transparent vermittelt</strong><p>Preis, Verfügbarkeit, Zahlung, Versand, Rückgabe und Support liegen beim jeweiligen Händler. Es gibt derzeit keinen BlackWaterLeaf-Checkout.</p></div></section>
      {auth.loading ? <StatePanel code="MERCHANT/CHECK" state="loading" title="HÄNDLERZUGANG WIRD GEPRÜFT" body="Deine Berechtigung wird sicher geprüft." /> : !auth.isAuthenticated ? <StatePanel code="MERCHANT/LOCKED" state="locked" title="HÄNDLERBEREICH GESCHÜTZT" body="Melde dich an, um vorhandene Händlerprofile und Angebotsentwürfe zu verwalten." action={<button type="button" className="secondary-action" onClick={startLogin}>SICHER ANMELDEN</button>} /> : merchantProfiles.isError ? <StatePanel code="MERCHANT/RESTRICTED" state="locked" title="KEIN HÄNDLERZUGANG" body="Dieser Bereich ist nur für freigegebene Händlerrollen verfügbar." /> : merchantProfiles.data?.length ? <section className="marketplace-merchant-entry observatory-data-panel"><div><span className="eyebrow">[HÄNDLERBEREICH]</span><h2>Eigene Angebote verwalten</h2><p>Produktentwürfe anlegen und zur Admin-Prüfung einreichen.</p></div><Link className="secondary-action" href="/marketplace/manage">HÄNDLERBEREICH ÖFFNEN</Link></section> : null}
      <section className="marketplace-hub__footer-note"><Leaf size={17} /><span>Wissenschaftliche Inhalte und Partnerangebote bleiben im Portal klar getrennt.</span><Link href="/knowledge">QUELLEN & WISSEN <ExternalLink size={14} /></Link></section>
    </div>
  );
}

function ShopLoading() {
  return <div className="marketplace-hub__shop-grid" aria-busy="true" aria-live="polite"><article className="marketplace-hub-shop marketplace-hub-shop--loading"><div /><span /><b /><i /></article><article className="marketplace-hub-shop marketplace-hub-shop--loading"><div /><span /><b /><i /></article></div>;
}

export { KIEMEN_KUMPEL_IMAGE };
export type { MarketplaceProduct };
