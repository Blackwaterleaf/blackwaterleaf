import { StatePanel } from "@/components/StatePanel";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BarChart3, Pencil, Plus, Save, Store, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function MerchantMarketplace() {
  const utils = trpc.useUtils();
  const profiles = trpc.partners.merchantProfiles.useQuery(undefined, { retry: false });
  const salesSummary = trpc.partners.merchantSalesSummary.useQuery(undefined, { retry: false });
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [partyType, setPartyType] = useState<"person" | "company">("company");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const createProfile = trpc.partners.merchantCreateProfile.useMutation({ onSuccess: async () => { setName(""); setNotice("Shop-Entwurf gespeichert. Ein Admin muss ihn prüfen und freigeben."); await utils.partners.merchantProfiles.invalidate(); } });
  const updateProfile = trpc.partners.merchantUpdateProfile.useMutation({ onSuccess: async () => { setNotice("Shop-Profil gespeichert."); await utils.partners.merchantProfiles.invalidate(); } });
  const createProduct = trpc.partners.merchantCreateProduct.useMutation({ onSuccess: async () => { resetProductForm(); setNotice("Produktentwurf gespeichert und zur Prüfung bereit."); if (selectedPartnerId) await utils.partners.merchantProducts.invalidate({ partnerId: selectedPartnerId }); } });
  const updateProduct = trpc.partners.merchantUpdateProduct.useMutation({ onSuccess: async () => { resetProductForm(); setNotice("Produktentwurf aktualisiert."); if (selectedPartnerId) await utils.partners.merchantProducts.invalidate({ partnerId: selectedPartnerId }); } });
  const submitProduct = trpc.partners.merchantSubmitProduct.useMutation({ onSuccess: async () => { setNotice("Produkt zur Admin-Prüfung vorgemerkt."); if (selectedPartnerId) await utils.partners.merchantProducts.invalidate({ partnerId: selectedPartnerId }); } });
  const products = trpc.partners.merchantProducts.useQuery({ partnerId: selectedPartnerId ?? 0 }, { enabled: selectedPartnerId !== null, retry: false });

  useEffect(() => { if (selectedPartnerId === null && profiles.data?.[0]) setSelectedPartnerId(profiles.data[0].id); }, [profiles.data, selectedPartnerId]);
  useEffect(() => {
    const selected = profiles.data?.find(profile => profile.id === selectedPartnerId);
    if (selected) { setName(selected.displayName); setPartyType(selected.partyType); }
  }, [profiles.data, selectedPartnerId]);

  const resetProductForm = () => { setEditingProductId(null); setTitle(""); setDescription(""); setDestinationUrl(""); setPriceLabel(""); };
  const startEditProduct = (product: NonNullable<typeof products.data>[number]) => { setEditingProductId(product.id); setTitle(product.title); setDescription(product.description ?? ""); setDestinationUrl(product.destinationUrl); setPriceLabel(product.priceLabel ?? ""); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); };
  const productInput = { title, description: description || undefined, destinationUrl, priceLabel: priceLabel || undefined };
  const saveProduct = (event: React.FormEvent) => { event.preventDefault(); if (!selectedPartnerId) return; if (editingProductId) updateProduct.mutate({ productId: editingProductId, product: productInput }); else createProduct.mutate({ partnerId: selectedPartnerId, product: productInput }); };

  if (profiles.isLoading) return <StatePanel code="MERCHANT/LOAD" state="loading" title="HÄNDLERBEREICH WIRD GELADEN" body="Deine serverseitig freigegebenen Marktplatzfunktionen werden geprüft." />;
  if (profiles.isError) return <StatePanel code="MERCHANT/FORBIDDEN" state="locked" title="HÄNDLERBERECHTIGUNG ERFORDERLICH" body="Dieser Bereich ist ausschließlich für aktive Konten mit der Rolle Händler verfügbar." action={<Link className="secondary-action" href="/marketplace">ZUM MARKTPLATZ</Link>} />;

  const selected = profiles.data?.find(profile => profile.id === selectedPartnerId);
  const selectedStats = salesSummary.data?.filter(row => row.partnerId === selectedPartnerId) ?? [];
  const outboundClicks = selectedStats.reduce((sum, row) => sum + Number(row.outboundClicks ?? 0), 0);
  const purchaseIntents = selectedStats.reduce((sum, row) => sum + Number(row.purchaseIntents ?? 0), 0);

  return <div className="observatory-merchant-page merchant-workspace">
    <header className="observatory-merchant-hero"><div><span className="eyebrow">MARKTPLATZ · HÄNDLERPORTAL</span><h1>DEIN SHOP. DEINE ANGEBOTE.</h1><p>Jeder Händler verwaltet seinen eigenen Bereich. Freigabe und Startseitenplatzierung bleiben beim Admin; Veröffentlichung erfolgt erst nach Prüfung.</p></div><Store size={34} /></header>
    {notice ? <p className="form-status" role="status">{notice}</p> : null}

    <section className="merchant-shop-switcher" aria-label="Eigene Shops"><div className="section-heading"><div><span className="eyebrow">[MEINE SHOPS]</span><h2>Shop auswählen</h2></div><span className="marketplace-count">{profiles.data?.length ?? 0} SHOPS</span></div><div className="merchant-shop-switcher__list">{profiles.data?.map(profile => <button type="button" key={profile.id} className={profile.id === selectedPartnerId ? "active" : ""} onClick={() => { setSelectedPartnerId(profile.id); resetProductForm(); }}><Store size={18} /><span><strong>{profile.displayName}</strong><small>{profile.status.toUpperCase()} · {profile.partyType === "company" ? "Firma" : "Privat"}</small></span><ArrowRight size={16} /></button>)}</div></section>

    <section className="merchant-workspace__grid">
      <form className="glass-panel merchant-panel" onSubmit={event => { event.preventDefault(); if (name.trim() && selectedPartnerId) updateProfile.mutate({ partnerId: selectedPartnerId, displayName: name.trim(), partyType }); else if (name.trim()) createProfile.mutate({ displayName: name.trim(), partyType }); }}><p className="eyebrow">[{selected ? "SHOP VERWALTEN" : "NEUER SHOP"}]</p><h2>{selected ? selected.displayName : "Shop-Profil anlegen"}</h2><label className="field"><span>SHOPNAME</span><input required value={name} onChange={event => setName(event.target.value)} placeholder="Dein Name oder Firmenname" /></label><label className="field"><span>ART</span><select value={partyType} onChange={event => setPartyType(event.target.value as "person" | "company")}><option value="company">Firma</option><option value="person">Privatperson</option></select></label><button className="primary-action" type="submit" disabled={createProfile.isPending || updateProfile.isPending}>{selected ? <><Save size={16} />SHOP SPEICHERN</> : <><Plus size={16} />SHOP-ENTWURF ANLEGEN</>}</button></form>
      <section className="glass-panel merchant-panel merchant-attribution"><p className="eyebrow">[BLACKWATERLEAF-VERMITTLUNG]</p><h2>Shop-Statistik</h2><div className="merchant-stat-grid"><div><strong>{outboundClicks}</strong><span>Weiterleitungen</span></div><div><strong>{purchaseIntents}</strong><span>Kaufinteressen</span></div><div><strong>0</strong><span>Bestätigte Verkäufe</span></div></div><p className="merchant-attribution__note"><Target size={16} />Solange kein Zahlungsanbieter verbunden ist, zählen wir nur datensparsame Weiterleitungen und ausdrücklich gemerkte Kaufinteressen. Bestätigte Verkäufe werden erst nach einer späteren Checkout-Integration gezählt.</p></section>
    </section>

    {selected ? <section className="glass-panel merchant-panel merchant-products"><div className="section-heading"><div><p className="eyebrow">[SHOP-INVENTAR / {selected.displayName}]</p><h2>Produkte verwalten</h2></div><span className="marketplace-count">{products.data?.length ?? 0} PRODUKTE</span></div><form className="merchant-product-form" onSubmit={saveProduct}><label className="field"><span>PRODUKTNAME</span><input required value={title} onChange={event => setTitle(event.target.value)} /></label><label className="field"><span>BESCHREIBUNG</span><textarea rows={3} value={description} onChange={event => setDescription(event.target.value)} /></label><label className="field"><span>HTTPS-ZIELURL</span><input required type="url" value={destinationUrl} onChange={event => setDestinationUrl(event.target.value)} placeholder="https://…" /></label><label className="field"><span>PREIS (OPTIONAL)</span><input value={priceLabel} onChange={event => setPriceLabel(event.target.value)} placeholder="z. B. 9,99 €" /></label><div className="merchant-product-form__actions"><button className="primary-action" type="submit" disabled={createProduct.isPending || updateProduct.isPending}>{editingProductId ? <><Save size={16} />ENTWURF AKTUALISIEREN</> : <><Plus size={16} />PRODUKTENTWURF SPEICHERN</>}</button>{editingProductId ? <button className="secondary-action" type="button" onClick={resetProductForm}>ABBRECHEN</button> : null}</div></form><h3>Gespeicherte Entwürfe</h3>{products.isLoading ? <p>Produkte werden geladen.</p> : products.data?.length ? <div className="merchant-product-list">{products.data.map(product => <article key={product.id}><div><strong>{product.title}</strong><small>{product.priceLabel ?? "Preis nicht angegeben"} · {product.status.toUpperCase()}</small></div><div className="merchant-product-list__actions">{product.status === "draft" ? <button className="secondary-action" type="button" onClick={() => startEditProduct(product)}><Pencil size={15} />BEARBEITEN</button> : null}{product.status === "draft" ? <button className="secondary-action" type="button" disabled={submitProduct.isPending} onClick={() => void submitProduct.mutateAsync({ productId: product.id })}>ZUR PRÜFUNG EINREICHEN</button> : null}</div></article>)}</div> : <p>Noch keine Produkte für diesen Shop.</p>}</section> : <StatePanel code="MERCHANT/SHOP_EMPTY" title="NOCH KEIN EIGENER SHOP" body="Lege zuerst einen Shop-Entwurf an. Danach kannst du Produkte getrennt verwalten und zur Prüfung einreichen." />}
  </div>;
}
