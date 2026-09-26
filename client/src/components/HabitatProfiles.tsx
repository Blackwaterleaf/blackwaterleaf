import type { PrivateHabitatInput } from "@shared/blackwaterleaf-contract-v1";
import { Box, ChevronLeft, ChevronRight, Fish, Loader2, Pencil, Plus, Save, Sprout, Trash2, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { trpc } from "@/lib/trpc";
import { habitatText, useI18n, type HabitatCopy } from "@/i18n";
import { imageErrorMessage, readImageAsBase64 } from "@/lib/files";

type HabitatKind = PrivateHabitatInput["kind"];
type HabitatRecord = {
  id: string;
  ownerId: string;
  kind: HabitatKind;
  name: string;
  careStatus: "unknown" | "stable" | "attention" | "critical";
  details: Record<string, unknown>;
  images?: Array<{ id: string; accessUrl: string; mimeType: string }>;
  createdAt: string;
  updatedAt: string;
};
type FormValues = Record<string, string> & { kind: HabitatKind; name: string; careStatus: HabitatRecord["careStatus"] };

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
  return { kind, name: "", careStatus: "unknown" };
}

function stringValue(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function recordToForm(record: HabitatRecord): FormValues {
  const details = record.details as Record<string, unknown>;
  const form: FormValues = { kind: record.kind, name: record.name, careStatus: record.careStatus ?? "unknown" };
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
      kind: "aquarium", name: form.name.trim(), careStatus: form.careStatus ?? "unknown",
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
      kind: "plant", name: form.name.trim(), careStatus: form.careStatus ?? "unknown",
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
    kind: "terrarium", name: form.name.trim(), careStatus: form.careStatus ?? "unknown",
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

function habitatStatusChips(record: HabitatRecord) {
  const details = record.details as Record<string, unknown>;
  const chips: Array<{ label: string; value: string }> = [];
  const add = (label: string, key: string, suffix = "") => { const value = details[key]; if (value !== null && value !== undefined && String(value).trim()) chips.push({ label, value: `${String(value)}${suffix}` }); };
  add("TEMPERATUR", "temperatureC", " °C");
  if (record.kind === "terrarium") add("TAG", "dayTemperatureC", " °C");
  add("LUFTFEUCHTE", "humidityPercent", " %");
  add("PH", "ph");
  const careLabels: Record<HabitatRecord["careStatus"], string> = { unknown: "UNBEKANNT", stable: "STABIL", attention: "ACHTUNG", critical: "KRITISCH" };
  if (record.careStatus !== "unknown") chips.push({ label: "PFLEGE", value: careLabels[record.careStatus] });
  if (record.updatedAt) chips.push({ label: "AKTUALISIERT", value: new Date(record.updatedAt).toLocaleDateString("de-DE") });
  return chips.slice(0, 4);
}

export function summarizeHabitat(record: Pick<HabitatRecord, "kind" | "details">, copy: HabitatCopy) {
  const details = record.details as Record<string, unknown>;
  if (record.kind === "aquarium") return [numericSummary(details.volumeLiters, "L"), numericSummary(details.temperatureC, "°C"), typeof details.ph === "number" && Number.isFinite(details.ph) ? `pH ${details.ph}` : null].filter(Boolean).join(" · ");
  if (record.kind === "plant") return [details.scientificName, details.location].filter(Boolean).join(" · ");
  return [numericSummary(details.volumeLiters, "L"), numericSummary(details.humidityPercent, copy.relativeHumidity), numericSummary(details.dayTemperatureC, "°C")].filter(Boolean).join(" · ");
}

export function HabitatProfiles({ visibleKinds, defaultOpen = false }: { visibleKinds?: HabitatKind[]; defaultOpen?: boolean } = {}) {
  const { locale } = useI18n();
  const copy = habitatText(locale);
  const utils = trpc.useUtils();
  const habitats = trpc.habitats.mine.useQuery();
  const create = trpc.habitats.create.useMutation();
  const update = trpc.habitats.update.useMutation();
  const uploadImage = trpc.habitats.uploadImage.useMutation();
  const deleteImage = trpc.habitats.deleteImage.useMutation();
  const [form, setForm] = useState<FormValues | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<NonNullable<HabitatRecord["images"]>[number] | null>(null);
  const [previewGallery, setPreviewGallery] = useState<NonNullable<HabitatRecord["images"]>>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const openGallery = (images: NonNullable<HabitatRecord["images"]>, index: number) => { setPreviewGallery(images); setPreviewIndex(index); setPreviewImage(images[index] ?? null); };
  const records = (habitats.data ?? []) as unknown as HabitatRecord[];
  const shownKinds = visibleKinds?.length ? visibleKinds : (Object.keys(META) as HabitatKind[]);
  const visibleRecords = records.filter(record => shownKinds.includes(record.kind));
  const counts = useMemo(() => ({
    aquarium: records.filter(item => item.kind === "aquarium").length,
    plant: records.filter(item => item.kind === "plant").length,
    terrarium: records.filter(item => item.kind === "terrarium").length,
  }), [records]);

  const startNew = (kind: HabitatKind) => { setForm(blankForm(kind)); setEditingId(null); setStatus(null); setImageFiles([]); setImageError(null); };
  const startEdit = (record: HabitatRecord) => { setForm(recordToForm(record)); setEditingId(Number(record.id)); setStatus(null); setImageFiles([]); setImageError(null); };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setStatus(null);
    try {
      const input = inputFromForm(form);
      const saved = editingId ? await update.mutateAsync({ id: editingId, ...input }) : await create.mutateAsync(input);
      const habitatId = Number((saved as { id: string | number }).id);
      if (imageFiles.length && habitatId) {
        for (const file of imageFiles.slice(0, 3)) {
          const image = await readImageAsBase64(file);
          await uploadImage.mutateAsync({ habitatId, ...image });
        }
      }
      await utils.habitats.mine.invalidate();
      setForm(null);
      setEditingId(null);
      setStatus(editingId ? copy.updated : copy.saved);
    } catch (error) {
      setStatus(error instanceof Error && error.message ? imageErrorMessage(error, locale) : copy.saveFailed);
    }
  };
  const removeImage = async (habitatId: string, imageId: string) => {
    try {
      await deleteImage.mutateAsync({ habitatId: Number(habitatId), imageId: Number(imageId) });
      await utils.habitats.mine.invalidate();
      setStatus("Bild und Dateiverweis entfernt.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : copy.saveFailed);
    }
  };

  return (
    <details className="account-section habitat-section" open={defaultOpen}>
      <summary><span>{copy.sectionTitle}</span><small>{copy.sectionMeta}</small></summary>
      <div className="habitat-body">
        <p className="habitat-intro">{copy.intro}</p>
        <div className="habitat-kind-grid" aria-label={copy.addHabitat}>
          {shownKinds.map(kind => {
            const meta = META[kind]; const Icon = meta.icon;
            return <button key={kind} type="button" className={`habitat-kind habitat-kind--${meta.accent}`} onClick={() => startNew(kind)}><Icon size={18} /><span>{copy.kinds[kind].plural}</span><small>{copy.count(counts[kind])}</small><Plus size={14} /></button>;
          })}
        </div>

        {habitats.isLoading ? <p className="form-status">{copy.loading}</p> : null}
        {visibleRecords.length ? <div className="habitat-list">{visibleRecords.map(record => {
          const meta = META[record.kind]; const Icon = meta.icon;
          return <article key={record.id} className={`habitat-record habitat-record--${meta.accent} ${record.images?.length ? "habitat-record--has-image" : ""}`} style={record.images?.[0]?.accessUrl ? { backgroundImage: `linear-gradient(180deg, rgba(2,12,6,.08), rgba(2,12,6,.94)), url("${record.images[0].accessUrl}")` } : undefined}><div className="habitat-record__shade" aria-hidden="true" /><div className="habitat-record__content"><div className="habitat-record__icon"><Icon size={19} /></div><div><small>{copy.kinds[record.kind].label.toUpperCase()}</small><strong>{record.name}</strong><p>{summarizeHabitat(record, copy) || copy.noValues}</p>{habitatStatusChips(record).length ? <div className="habitat-status-chips" aria-label="Anlagenstatus">{habitatStatusChips(record).map(chip => <span className="habitat-status-chip" key={`${chip.label}-${chip.value}`}><strong>{chip.label}</strong><em>{chip.value}</em></span>)}</div> : null}{record.images?.length ? <div className="habitat-image-strip" aria-label="Private Bilder">{record.images.map((image, imageIndex) => <div className="habitat-image-frame" key={image.id}><button type="button" className="habitat-image-thumb" onClick={() => openGallery(record.images ?? [], imageIndex)} aria-label="Privates Bild vergrößern"><img src={image.accessUrl} alt="Privates Anlagenbild" loading="lazy" /></button><button type="button" className="habitat-image-overlay habitat-image-overlay--delete" onClick={() => void removeImage(record.id, image.id)} disabled={deleteImage.isPending} aria-label="Privates Bild löschen">{deleteImage.isPending ? <Loader2 size={12} className="spin" /> : <Trash2 size={12} />}</button></div>)}</div> : null}</div></div><button type="button" className="icon-button habitat-record__edit" aria-label={`${record.name} ${copy.editSuffix}`} onClick={() => startEdit(record)}><Pencil size={15} /></button></article>;
        })}</div> : <p className="habitat-empty">{copy.empty}</p>}

        {form ? <form className="habitat-editor" onSubmit={save}>
          <div className="form-heading"><div><p className="eyebrow">[{editingId ? copy.privateEdit : copy.privateSetup}]</p><h2>{editingId ? `${copy.kinds[form.kind].label} ${copy.editSuffix}` : `${copy.kinds[form.kind].label} ${copy.createTitle}`}</h2></div><button type="button" className="secondary-action" onClick={() => { setForm(null); setEditingId(null); }}>{copy.cancel}</button></div>
          <div className="form-grid"><label className="field"><span>Pflegezustand</span><select value={form.careStatus} onChange={event => setForm(current => current ? { ...current, careStatus: event.target.value as FormValues["careStatus"] } : current)}><option value="unknown">Noch nicht bewertet</option><option value="stable">Stabil</option><option value="attention">Achtung erforderlich</option><option value="critical">Kritisch</option></select></label>{FIELDS[form.kind].map(field => { const fieldCopy = copy.fields[form.kind][field.key]; return <label className={`field ${field.kind === "textarea" ? "field--wide" : ""}`} key={field.key}><span>{fieldCopy.label}{fieldCopy.hint ? ` · ${fieldCopy.hint}` : ""}</span>{field.kind === "textarea" ? <textarea rows={3} value={form[field.key] ?? ""} onChange={event => setForm(current => current ? { ...current, [field.key]: event.target.value } : current)} /> : <input type={field.kind === "number" ? "number" : "text"} step="any" value={form[field.key] ?? ""} onChange={event => setForm(current => current ? { ...current, [field.key]: event.target.value } : current)} />}</label>; })}</div>
          {editingId ? <div className="habitat-existing-images"><span>Gespeicherte Bilder</span>{(records.find(record => Number(record.id) === editingId)?.images ?? []).map(image => <div key={image.id}><button type="button" className="habitat-image-thumb" onClick={() => openGallery(records.find(record => Number(record.id) === editingId)?.images ?? [], (records.find(record => Number(record.id) === editingId)?.images ?? []).findIndex(candidate => candidate.id === image.id))}><img src={image.accessUrl} alt="Privates Anlagenbild" /></button><button type="button" className="icon-button" aria-label="Bild und Datei entfernen" onClick={() => void removeImage(String(editingId), image.id)} disabled={deleteImage.isPending}>{deleteImage.isPending ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}</button></div>)}</div> : null}
          <label className="habitat-image-picker"><span>Private Bilder hinzufügen · maximal 3</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={event => { setImageError(null); setImageFiles(Array.from(event.target.files ?? []).slice(0, 3)); }} />{imageFiles.length ? <small>{imageFiles.length} Bild{imageFiles.length === 1 ? "" : "er"} ausgewählt</small> : <small>JPG, PNG oder WebP · bleibt privat</small>}</label>
          {imageError ? <p className="form-status" role="alert">{imageError}</p> : null}
          <button type="submit" className={`primary-action ${create.isPending || update.isPending || uploadImage.isPending ? "action-loading" : ""}`} disabled={create.isPending || update.isPending || uploadImage.isPending}>{create.isPending || update.isPending || uploadImage.isPending ? <Loader2 size={16} className="spin" /> : <Save size={16} />}{create.isPending || update.isPending || uploadImage.isPending ? copy.saving : editingId ? copy.update : copy.save}</button>
        </form> : null}
        {previewImage ? <div className="habitat-image-lightbox" role="dialog" aria-modal="true" aria-label="Privates Bild"><button type="button" className="habitat-lightbox-close" onClick={() => { setPreviewImage(null); setPreviewGallery([]); }} aria-label="Bild schließen"><X size={20} /></button>{previewGallery.length > 1 ? <button type="button" className="habitat-lightbox-nav habitat-lightbox-nav--prev" onClick={() => { const next = (previewIndex - 1 + previewGallery.length) % previewGallery.length; setPreviewIndex(next); setPreviewImage(previewGallery[next]); }} aria-label="Vorheriges Bild"><ChevronLeft size={28} /></button> : null}<img src={previewImage.accessUrl} alt="Privates Anlagenbild vergrößert" />{previewGallery.length > 1 ? <button type="button" className="habitat-lightbox-nav habitat-lightbox-nav--next" onClick={() => { const next = (previewIndex + 1) % previewGallery.length; setPreviewIndex(next); setPreviewImage(previewGallery[next]); }} aria-label="Nächstes Bild"><ChevronRight size={28} /></button> : null}<span className="habitat-lightbox-count">{previewGallery.length > 1 ? `${previewIndex + 1} / ${previewGallery.length}` : ""}</span></div> : null}
        {status ? <p className="form-status" role="status">{status}</p> : null}
      </div>
    </details>
  );
}
