import type { PrivateHabitatInput } from "@shared/blackwaterleaf-contract-v1";
import { Box, Fish, Pencil, Plus, Save, Sprout } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { trpc } from "@/lib/trpc";

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

const META: Record<HabitatKind, { label: string; plural: string; accent: string; icon: typeof Fish }> = {
  aquarium: { label: "Aquarium", plural: "Aquarien", accent: "cyan", icon: Fish },
  plant: { label: "Pflanze", plural: "Pflanzen", accent: "mint", icon: Sprout },
  terrarium: { label: "Terrarium", plural: "Terrarien", accent: "gold", icon: Box },
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

function summary(record: HabitatRecord) {
  const details = record.details as Record<string, unknown>;
  if (record.kind === "aquarium") return [details.volumeLiters ? `${details.volumeLiters} L` : null, details.temperatureC ? `${details.temperatureC} °C` : null, details.ph ? `pH ${details.ph}` : null].filter(Boolean).join(" · ");
  if (record.kind === "plant") return [details.scientificName, details.location].filter(Boolean).join(" · ");
  return [details.volumeLiters ? `${details.volumeLiters} L` : null, details.humidityPercent ? `${details.humidityPercent} % LF` : null, details.dayTemperatureC ? `${details.dayTemperatureC} °C` : null].filter(Boolean).join(" · ");
}

export function HabitatProfiles() {
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
      setStatus(editingId ? "Anlage aktualisiert." : "Anlage privat gespeichert.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "anlage_speichern_fehlgeschlagen");
    }
  };

  return (
    <details className="account-section habitat-section">
      <summary><span>Meine Anlagen & Werte</span><small>Privat · Aquarien, Pflanzen & Terrarien</small></summary>
      <div className="habitat-body">
        <p className="habitat-intro">Lege deine Anlagen strukturiert an. Diese Angaben bleiben nur in deinem Konto und erscheinen nicht in deinem öffentlichen Profil oder der Community.</p>
        <div className="habitat-kind-grid" aria-label="Anlage hinzufügen">
          {(Object.keys(META) as HabitatKind[]).map(kind => {
            const meta = META[kind]; const Icon = meta.icon;
            return <button key={kind} type="button" className={`habitat-kind habitat-kind--${meta.accent}`} onClick={() => startNew(kind)}><Icon size={18} /><span>{meta.plural}</span><small>{counts[kind]} angelegt</small><Plus size={14} /></button>;
          })}
        </div>

        {habitats.isLoading ? <p className="form-status">Anlagen werden geladen …</p> : null}
        {records.length ? <div className="habitat-list">{records.map(record => {
          const meta = META[record.kind]; const Icon = meta.icon;
          return <article key={record.id} className={`habitat-record habitat-record--${meta.accent}`}><Icon size={19} /><div><small>{meta.label.toUpperCase()}</small><strong>{record.name}</strong><p>{summary(record) || "Noch keine Werte hinterlegt"}</p></div><button type="button" className="icon-button" aria-label={`${record.name} bearbeiten`} onClick={() => startEdit(record)}><Pencil size={15} /></button></article>;
        })}</div> : <p className="habitat-empty">Noch keine Anlage angelegt. Wähle oben einen Bereich aus.</p>}

        {form ? <form className="habitat-editor" onSubmit={save}>
          <div className="form-heading"><div><p className="eyebrow">[{editingId ? "PRIVATE_EDIT" : "PRIVATE_SETUP"}]</p><h2>{editingId ? `${META[form.kind].label} bearbeiten` : `${META[form.kind].label} anlegen`}</h2></div><button type="button" className="secondary-action" onClick={() => { setForm(null); setEditingId(null); }}>Abbrechen</button></div>
          <div className="form-grid">{FIELDS[form.kind].map(field => <label className={`field ${field.kind === "textarea" ? "field--wide" : ""}`} key={field.key}><span>{field.label}{field.hint ? ` · ${field.hint}` : ""}</span>{field.kind === "textarea" ? <textarea rows={3} value={form[field.key] ?? ""} onChange={event => setForm(current => current ? { ...current, [field.key]: event.target.value } : current)} /> : <input type={field.kind === "number" ? "number" : "text"} step="any" value={form[field.key] ?? ""} onChange={event => setForm(current => current ? { ...current, [field.key]: event.target.value } : current)} />}</label>)}</div>
          <button type="submit" className="primary-action" disabled={create.isPending || update.isPending}><Save size={16} />{create.isPending || update.isPending ? "SPEICHERE …" : editingId ? "ANLAGE AKTUALISIEREN" : "ANLAGE PRIVAT SPEICHERN"}</button>
        </form> : null}
        {status ? <p className="form-status" role="status">{status}</p> : null}
      </div>
    </details>
  );
}
