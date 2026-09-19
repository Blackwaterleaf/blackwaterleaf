import type { PrivateHabitatInput } from "@shared/blackwaterleaf-contract-v1";
import { Box, Fish, Pencil, Plus, Save, Sprout } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { trpc } from "@/lib/trpc";
import { habitatText, useI18n, type HabitatCopy } from "@/i18n";
import { Link } from "wouter";

type HabitatKind = PrivateHabitatInput["kind"];
type HabitatRecord = {
  id: string;
  ownerId: string;
  kind: HabitatKind;
  name: string;
  details: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
type FormValues = Record<string, string> & { kind: HabitatKind; name: string };

const META: Record<HabitatKind, { accent: string; icon: typeof Fish }> = {
  aquarium: { accent: "cyan", icon: Fish },
  plant: { accent: "mint", icon: Sprout },
  terrarium: { accent: "gold", icon: Box },
};

const FIELDS: Record<HabitatKind, { label: string; key: string; kind?: "number" | "textarea"; hint?: string }[]> = {
  aquarium: [
    { label: "Name des Aquariums", key: "name" },
    { label: "Volumen", key: "volumeLiters", kind: "number", hint: "Liter" },
    { label: "Maße", key: "dimensions", hint: "L × B × H in cm" },
    { label: "Temperatur", key: "temperatureC", kind: "number", hint: "°C" },
    { label: "pH", key: "ph", kind: "number" },
    { label: "GH", key: "gh", kind: "number", hint: "°dGH" },
    { label: "KH", key: "kh", kind: "number", hint: "°dKH" },
    { label: "Nitrit", key: "nitriteMgL", kind: "number", hint: "mg/l" },
    { label: "Nitrat", key: "nitrateMgL", kind: "number", hint: "mg/l" },
    { label: "Leitwert", key: "conductivityUs", kind: "number", hint: "µS/cm" },
    { label: "Besatz", key: "occupants", kind: "textarea", hint: "Tiere, Anzahl, Varianten" },
    { label: "Pflanzen", key: "plants", kind: "textarea", hint: "Arten oder Gruppen" },
    { label: "Technik", key: "equipment", kind: "textarea", hint: "Filter, Licht, Heizer, CO₂ …" },
    { label: "Notizen", key: "notes", kind: "textarea" },
  ],
  plant: [
    { label: "Name der Pflanze", key: "name" },
    { label: "Botanischer Name", key: "scientificName" },
    { label: "Anzahl", key: "quantity", kind: "number" },
    { label: "Standort", key: "location", hint: "z. B. Fenster Ost" },
    { label: "Substrat", key: "substrate", kind: "textarea" },
    { label: "Topfgröße", key: "potSizeCm", kind: "number", hint: "cm" },
    { label: "Licht", key: "light", hint: "hell, indirekt …" },
    { label: "Gießen", key: "watering", kind: "textarea" },
    { label: "Luftfeuchte", key: "humidityPercent", kind: "number", hint: "%" },
    { label: "Temperatur", key: "temperatureC", kind: "number", hint: "°C" },
    { label: "Düngung", key: "fertilizer", kind: "textarea" },
    { label: "Notizen", key: "notes", kind: "textarea" },
  ],
  terrarium: [
    { label: "Name des Terrariums", key: "name" },
    { label: "Volumen", key: "volumeLiters", kind: "number", hint: "Liter" },
    { label: "Maße", key: "dimensions", hint: "L × B × H in cm" },
    { label: "Tagtemperatur", key: "dayTemperatureC", kind: "number", hint: "°C" },
    { label: "Nachttemperatur", key: "nightTemperatureC", kind: "number", hint: "°C" },
    { label: "Luftfeuchte", key: "humidityPercent", kind: "number", hint: "%" },
    { label: "Bewohner", key: "occupants", kind: "textarea", hint: "Art, Anzahl, Geschlecht" },
    { label: "Pflanzen", key: "plants", kind: "textarea" },
    { label: "Substrat", key: "substrate", kind: "textarea" },
    { label: "Technik", key: "equipment", kind: "textarea", hint: "Licht, Beregnung, Heizung …" },
    { label: "Notizen", key: "notes", kind: "textarea" },
  ],
};

function blankForm(kind: HabitatKind): FormValues {
  return { kind, name: "" };
}

function stringValue(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function recordToForm(record: HabitatRecord): FormValues {
  const details = record.details as Record<string, unknown>;
  const form: FormValues = { kind: record.kind, name: record.name };
  for (const field of FIELDS[record.kind]) {
    if (field.key !== "name") form[field.key] = stringValue(details[field.key]);
  }
  if (record.kind === "aquarium" || record.kind === "terrarium") {
    form.dimensions = [details.lengthCm, details.widthCm, details.heightCm].every(value => value !== null && value !== undefined)
      ? `${details.lengthCm} × ${details.widthCm} × ${details.heightCm}`
      : "";
  }
  return form;
}

function numberOrNull(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : Number(trimmed.replace(",", "."));
}

function textOrNull(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function dimensions(value: string) {
  const values = value.split(/[x×]/i).map(item => Number(item.trim().replace(",", ".")));
  return values.length === 3 && values.every(Number.isFinite)
    ? { lengthCm: values[0], widthCm: values[1], heightCm: values[2] }
    : { lengthCm: null, widthCm: null, heightCm: null };
}

function inputFromForm(form: FormValues): PrivateHabitatInput {
  if (form.kind === "aquarium") {
    return {
      kind: "aquarium", name: form.name.trim(),
      details: {
        volumeLiters: numberOrNull(form.volumeLiters ?? ""), ...dimensions(form.dimensions ?? ""),
        occupants: textOrNull(form.occupants ?? ""), plants: textOrNull(form.plants ?? ""),
        temperatureC: numberOrNull(form.temperatureC ?? ""), ph: numberOrNull(form.ph ?? ""),
        gh: numberOrNull(form.gh ?? ""), kh: numberOrNull(form.kh ?? ""),
        nitriteMgL: numberOrNull(form.nitriteMgL ?? ""), nitrateMgL: numberOrNull(form.nitrateMgL ?? ""),
        conductivityUs: numberOrNull(form.conductivityUs ?? ""), equipment: textOrNull(form.equipment ?? ""), notes: textOrNull(form.notes ?? ""),
      },
    };
  }
  if (form.kind === "plant") {
    return {
      kind: "plant", name: form.name.trim(),
      details: {
        scientificName: textOrNull(form.scientificName ?? ""), quantity: numberOrNull(form.quantity ?? ""),
        location: textOrNull(form.location ?? ""), substrate: textOrNull(form.substrate ?? ""),
        potSizeCm: numberOrNull(form.potSizeCm ?? ""), light: textOrNull(form.light ?? ""),
        watering: textOrNull(form.watering ?? ""), humidityPercent: numberOrNull(form.humidityPercent ?? ""),
        temperatureC: numberOrNull(form.temperatureC ?? ""), fertilizer: textOrNull(form.fertilizer ?? ""), notes: textOrNull(form.notes ?? ""),
      },
    };
  }
  return {
    kind: "terrarium", name: form.name.trim(),
    details: {
      volumeLiters: numberOrNull(form.volumeLiters ?? ""), ...dimensions(form.dimensions ?? ""),
      occupants: textOrNull(form.occupants ?? ""), plants: textOrNull(form.plants ?? ""),
      dayTemperatureC: numberOrNull(form.dayTemperatureC ?? ""), nightTemperatureC: numberOrNull(form.nightTemperatureC ?? ""),
      humidityPercent: numberOrNull(form.humidityPercent ?? ""), substrate: textOrNull(form.substrate ?? ""),
      equipment: textOrNull(form.equipment ?? ""), notes: textOrNull(form.notes ?? ""),
    },
  };
}

function numericSummary(value: unknown, suffix: string) {
  return typeof value === "number" && Number.isFinite(value) ? `${value} ${suffix}` : null;
}

export function summarizeHabitat(record: Pick<HabitatRecord, "kind" | "details">, copy: HabitatCopy) {
  const details = record.details as Record<string, unknown>;
  if (record.kind === "aquarium") return [numericSummary(details.volumeLiters, "L"), numericSummary(details.temperatureC, "°C"), typeof details.ph === "number" && Number.isFinite(details.ph) ? `pH ${details.ph}` : null].filter(Boolean).join(" · ");
  if (record.kind === "plant") return [details.scientificName, details.location].filter(Boolean).join(" · ");
  return [numericSummary(details.volumeLiters, "L"), numericSummary(details.humidityPercent, copy.relativeHumidity), numericSummary(details.dayTemperatureC, "°C")].filter(Boolean).join(" · ");
}

export function HabitatProfiles() {
  const { locale } = useI18n();
  const copy = habitatText(locale);
  const utils = trpc.useUtils();
  const habitats = trpc.habitats.mine.useQuery();
  const create = trpc.habitats.create.useMutation();
  const update = trpc.habitats.update.useMutation();
  const [form, setForm] = useState<FormValues | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const records = (habitats.data ?? []) as unknown as HabitatRecord[];
  const counts = useMemo(() => ({
    aquarium: records.filter(item => item.kind === "aquarium").length,
    plant: records.filter(item => item.kind === "plant").length,
    terrarium: records.filter(item => item.kind === "terrarium").length,
  }), [records]);

  const startNew = (kind: HabitatKind) => { setForm(blankForm(kind)); setEditingId(null); setStatus(null); };
  const startEdit = (record: HabitatRecord) => { setForm(recordToForm(record)); setEditingId(Number(record.id)); setStatus(null); };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setStatus(null);
    try {
      const input = inputFromForm(form);
      if (editingId) await update.mutateAsync({ id: editingId, ...input });
      else await create.mutateAsync(input);
      await utils.habitats.mine.invalidate();
      setForm(null);
      setEditingId(null);
      setStatus(editingId ? copy.updated : copy.saved);
    } catch {
      setStatus(copy.saveFailed);
    }
  };

  return (
    <details id="habitats" className="account-section habitat-section">
      <summary><span>{copy.sectionTitle}</span><small>{copy.sectionMeta}</small></summary>
      <div className="habitat-body">
        <p className="habitat-intro">{copy.intro}</p>
        <div className="habitat-kind-grid" aria-label={copy.addHabitat}>
          {(Object.keys(META) as HabitatKind[]).map(kind => {
            const meta = META[kind]; const Icon = meta.icon;
            return <button key={kind} type="button" className={`habitat-kind habitat-kind--${meta.accent}`} onClick={() => startNew(kind)}><Icon size={18} /><span>{copy.kinds[kind].plural}</span><small>{copy.count(counts[kind])}</small><Plus size={14} /></button>;
          })}
        </div>

        {habitats.isLoading ? <p className="form-status">{copy.loading}</p> : null}
        {habitats.isError ? <p className="form-status" role="alert">{copy.loadFailed}</p> : null}
        {!habitats.isLoading && !habitats.isError && records.length ? <div className="habitat-list">{records.map(record => {
          const meta = META[record.kind]; const Icon = meta.icon;
          return <article key={record.id} className={`habitat-record habitat-record--${meta.accent}`}><Icon size={19} /><div><small>{copy.kinds[record.kind].label.toUpperCase()}</small><strong>{record.name}</strong><p>{summarizeHabitat(record, copy) || copy.noValues}</p></div><button type="button" className="icon-button" aria-label={`${record.name} ${copy.editSuffix}`} onClick={() => startEdit(record)}><Pencil size={15} /></button></article>;
        })}</div> : !habitats.isLoading && !habitats.isError ? <p className="habitat-empty">{copy.empty}</p> : null}

        {form ? <form className="habitat-editor" onSubmit={save}>
          <div className="form-heading"><div><p className="eyebrow">[{editingId ? copy.privateEdit : copy.privateSetup}]</p><h2>{editingId ? `${copy.kinds[form.kind].label} ${copy.editSuffix}` : `${copy.kinds[form.kind].label} ${copy.createTitle}`}</h2></div><button type="button" className="secondary-action" onClick={() => { setForm(null); setEditingId(null); }}>{copy.cancel}</button></div>
          <div className="form-grid">{FIELDS[form.kind].map(field => { const fieldCopy = copy.fields[form.kind][field.key]; return <label className={`field ${field.kind === "textarea" ? "field--wide" : ""}`} key={field.key}><span>{fieldCopy.label}{fieldCopy.hint ? ` · ${fieldCopy.hint}` : ""}</span>{field.kind === "textarea" ? <textarea rows={3} value={form[field.key] ?? ""} onChange={event => setForm(current => current ? { ...current, [field.key]: event.target.value } : current)} /> : <input type={field.kind === "number" ? "number" : "text"} step="any" value={form[field.key] ?? ""} onChange={event => setForm(current => current ? { ...current, [field.key]: event.target.value } : current)} />}</label>; })}</div>
          <button type="submit" className="primary-action" disabled={create.isPending || update.isPending}><Save size={16} />{create.isPending || update.isPending ? copy.saving : editingId ? copy.update : copy.save}</button>
        </form> : null}
        {status ? <p className="form-status" role="status">{status}</p> : null}
      </div>
    </details>
  );
}

export function HabitatHubCards() {
  const { locale } = useI18n();
  const copy = habitatText(locale);
  const habitats = trpc.habitats.mine.useQuery();
  const records = (habitats.data ?? []) as unknown as HabitatRecord[];
  const cards: { kind: HabitatKind; accent: string; icon: typeof Fish }[] = [
    { kind: "plant", accent: "mint", icon: Sprout },
    { kind: "aquarium", accent: "cyan", icon: Fish },
    { kind: "terrarium", accent: "gold", icon: Box },
  ];
  return <section className="profile-hub-habitats" aria-labelledby="profile-hub-habitats-title">
    <div className="profile-hub-section-heading"><div><p className="eyebrow">[PRIVAT / DEINE ANLAGEN]</p><h2 id="profile-hub-habitats-title">Meine Anlagen &amp; Werte</h2><p>Wähle direkt den Bereich, den du verwalten möchtest.</p></div><Link className="secondary-action" href="/profile/settings#profile-tools">Alle Einstellungen</Link></div>
    <div className="profile-hub-habitat-grid">{cards.map(card => {
      const Icon = card.icon;
      const items = records.filter(record => record.kind === card.kind);
      const first = items[0];
      return <Link key={card.kind} href="/profile/settings#profile-tools" className={`profile-hub-habitat-card profile-hub-habitat-card--${card.accent}`}>
        <span className="profile-hub-habitat-icon"><Icon size={22} /></span>
        <span className="profile-hub-habitat-copy"><strong>{copy.kinds[card.kind].plural}</strong><small>{items.length ? `${items.length} ${items.length === 1 ? "Anlage" : "Anlagen"}` : "Noch keine Anlage"}</small>{first ? <em>{first.name}</em> : <em>Jetzt einrichten</em>}</span>
        <span className="profile-hub-habitat-arrow" aria-hidden="true">→</span>
      </Link>;
    })}</div>
  </section>;
}
