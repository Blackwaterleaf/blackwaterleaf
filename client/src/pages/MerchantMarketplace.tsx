import { StatePanel } from "@/components/StatePanel";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useEffect, useState } from "react";

export default function MerchantMarketplace() {
  const utils = trpc.useUtils();
  const profiles = trpc.partners.merchantProfiles.useQuery(undefined, { retry: false });
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [partyType, setPartyType] = useState<"person" | "company">("company");
  const [title, setTitle] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const createProfile = trpc.partners.merchantCreateProfile.useMutation({ onSuccess: async () => { setName(""); setNotice("Partnerentwurf gespeichert. Ein Admin muss ihn prüfen und freigeben."); await utils.partners.merchantProfiles.invalidate(); } });
  const createProduct = trpc.partners.merchantCreateProduct.useMutation({ onSuccess: async () => { setTitle(""); setDestinationUrl(""); setPriceLabel(""); setNotice("Produktentwurf gespeichert und zur Prüfung bereit."); if (selectedPartnerId) await utils.partners.merchantProducts.invalidate({ partnerId: selectedPartnerId }); } });
  const products = trpc.partners.merchantProducts.useQuery({ partnerId: selectedPartnerId ?? 0 }, { enabled: selectedPartnerId !== null, retry: false });
  const submitProduct = trpc.partners.merchantSubmitProduct.useMutation({ onSuccess: async () => { setNotice("Produkt zur Admin-Prüfung vorgemerkt."); if (selectedPartnerId) await utils.partners.merchantProducts.invalidate({ partnerId: selectedPartnerId }); } });

  useEffect(() => { if (selectedPartnerId === null && profiles.data?.[0]) setSelectedPartnerId(profiles.data[0].id); }, [profiles.data, selectedPartnerId]);

  if (profiles.isLoading) return <StatePanel code="MERCHANT/LOAD" state="loading" title="HÄNDLERBEREICH WIRD GELADEN" body="Deine serverseitig freigegebenen Marktplatzfunktionen werden geprüft." />;
  if (profiles.isError) return <StatePanel code="MERCHANT/FORBIDDEN" state="locked" title="HÄNDLERBERECHTIGUNG ERFORDERLICH" body="Dieser Bereich ist ausschließlich für aktive Konten mit der Rolle Händler verfügbar." action={<Link className="secondary-action" href="/marketplace">ZUM MARKTPLATZ</Link>} />;
  const selected = profiles.data?.find(profile => profile.id === selectedPartnerId);
  return <div className="merchant-workspace reference-page reference-page--marketplace">
    <header className="merchant-workspace__header"><div><p className="eyebrow">[HÄNDLER / MARKTPLATZ]</p><h1>DEINE ANGEBOTE</h1><p>Lege Partnerprofile und Produktentwürfe an. Veröffentlichung, Freigabe und Startseitenplatzierung bleiben beim Admin.</p></div><Link className="secondary-action" href="/marketplace">MARKTPLATZ ANSEHEN</Link></header>
    {notice ? <p className="form-status" role="status">{notice}</p> : null}
    <section className="merchant-workspace__grid">
      <form className="glass-panel merchant-panel" onSubmit={event => { event.preventDefault(); if (name.trim()) createProfile.mutate({ displayName: name.trim(), partyType }); }}><p className="eyebrow">[NEUER PARTNERENTWURF]</p><h2>Partnerprofil anlegen</h2><label className="field"><span>NAME</span><input required value={name} onChange={event => setName(event.target.value)} placeholder="Dein Name oder Firmenname" /></label><label className="field"><span>ART</span><select value={partyType} onChange={event => setPartyType(event.target.value as "person" | "company")}><option value="company">Firma</option><option value="person">Privatperson</option></select></label><button className="primary-action" type="submit" disabled={createProfile.isPending}>ENTWURF SPEICHERN</button></form>
      <section className="glass-panel merchant-panel"><p className="eyebrow">[DEINE PARTNERPROFILE]</p><h2>Profile</h2>{profiles.data?.length ? profiles.data.map(profile => <button type="button" className={`merchant-profile-choice ${profile.id === selectedPartnerId ? "active" : ""}`} key={profile.id} onClick={() => setSelectedPartnerId(profile.id)}><strong>{profile.displayName}</strong><small>{profile.status.toUpperCase()} · nur intern sichtbar</small></button>) : <p>Noch kein Partnerprofil angelegt.</p>}</section>
    </section>
    {selected ? <section className="glass-panel merchant-panel merchant-products"><p className="eyebrow">[PRODUKTENTWÜRFE / {selected.displayName}]</p><h2>Produkt hinzufügen</h2><form className="merchant-product-form" onSubmit={event => { event.preventDefault(); createProduct.mutate({ partnerId: selected.id, product: { title, destinationUrl, priceLabel: priceLabel || undefined } }); }}><label className="field"><span>PRODUKTNAME</span><input required value={title} onChange={event => setTitle(event.target.value)} /></label><label className="field"><span>HTTPS-ZIELURL</span><input required type="url" value={destinationUrl} onChange={event => setDestinationUrl(event.target.value)} placeholder="https://…" /></label><label className="field"><span>PREIS (OPTIONAL)</span><input value={priceLabel} onChange={event => setPriceLabel(event.target.value)} placeholder="z. B. 9,99 €" /></label><button className="primary-action" type="submit" disabled={createProduct.isPending}>PRODUKTENTWURF SPEICHERN</button></form><h3>Gespeicherte Entwürfe</h3>{products.isLoading ? <p>Produkte werden geladen.</p> : products.data?.length ? <div className="merchant-product-list">{products.data.map(product => <article key={product.id}><div><strong>{product.title}</strong><small>{product.priceLabel ?? "Preis nicht angegeben"} · {product.status.toUpperCase()}</small></div>{product.status === "draft" ? <button className="secondary-action" type="button" disabled={submitProduct.isPending} onClick={() => void submitProduct.mutateAsync({ productId: product.id })}>ZUR PRÜFUNG EINREICHEN</button> : null}</article>)}</div> : <p>Noch keine Produkte für dieses Profil.</p>}</section> : null}
  </div>;
}
