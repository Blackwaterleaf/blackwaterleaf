import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { createHabitat, type Habitat, type HabitatKind, type HabitatPayload } from "./api";

const c = { bg: "#031108", surface: "#092117", raised: "#0c2a1c", border: "rgba(140,238,171,.25)", mint: "#9cebc6", lime: "#b9fb83", aqua: "#69def2", gold: "#e5c679", text: "#ecf8ee", muted: "#a0b8a6", danger: "#ff9ea8" };

const labels: Record<HabitatKind, string> = { plant: "PFLANZE", aquarium: "AQUARIUM", terrarium: "TERRARIUM" };
const icons: Record<HabitatKind, keyof typeof Ionicons.glyphMap> = { plant: "leaf", aquarium: "water", terrarium: "bug" };
const accents: Record<HabitatKind, string> = { plant: c.mint, aquarium: c.aqua, terrarium: c.gold };

type Props = { token: string; habitats: Habitat[]; onSaved: () => Promise<void> };

export function HabitatManager({ token, habitats, onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<HabitatKind>("plant");
  const [name, setName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [location, setLocation] = useState("");
  const [occupants, setOccupants] = useState("");
  const [plants, setPlants] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [ph, setPh] = useState("");
  const [equipment, setEquipment] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const items = useMemo(() => habitats.filter(item => item.kind === kind), [habitats, kind]);

  const reset = () => { setName(""); setScientificName(""); setLocation(""); setOccupants(""); setPlants(""); setTemperature(""); setHumidity(""); setPh(""); setEquipment(""); setNotes(""); };
  const number = (value: string) => value.trim() === "" ? null : Number(value.replace(",", "."));
  const nullable = (value: string) => value.trim() || null;
  const validNumber = (value: string) => value.trim() === "" || Number.isFinite(number(value));

  const submit = async () => {
    if (!name.trim()) { Alert.alert("Name fehlt", "Bitte gib deiner Anlage einen Namen."); return; }
    if (![temperature, humidity, ph].every(validNumber)) { Alert.alert("Ungültige Zahl", "Bitte verwende bei Messwerten nur Zahlen."); return; }
    const payload: HabitatPayload = kind === "plant"
      ? { kind, name: name.trim(), details: { scientificName: nullable(scientificName), quantity: null, location: nullable(location), substrate: null, potSizeCm: null, light: null, watering: null, humidityPercent: number(humidity), temperatureC: number(temperature), fertilizer: null, notes: nullable(notes) } }
      : kind === "aquarium"
        ? { kind, name: name.trim(), details: { volumeLiters: null, lengthCm: null, widthCm: null, heightCm: null, occupants: nullable(occupants), plants: nullable(plants), temperatureC: number(temperature), ph: number(ph), gh: null, kh: null, nitriteMgL: null, nitrateMgL: null, conductivityUs: null, equipment: nullable(equipment), notes: nullable(notes) } }
        : { kind, name: name.trim(), details: { volumeLiters: null, lengthCm: null, widthCm: null, heightCm: null, occupants: nullable(occupants), plants: nullable(plants), dayTemperatureC: number(temperature), nightTemperatureC: null, humidityPercent: number(humidity), substrate: null, equipment: nullable(equipment), notes: nullable(notes) } };
    setSaving(true);
    try { await createHabitat(token, payload); reset(); setOpen(false); await onSaved(); }
    catch (cause) { Alert.alert("Anlage konnte nicht gespeichert werden", cause instanceof Error ? cause.message : "Bitte versuche es später erneut."); }
    finally { setSaving(false); }
  };

  return <FlatList
    data={open ? [] : items}
    keyExtractor={(item) => String(item.id)}
    contentContainerStyle={styles.list}
    ListHeaderComponent={<>
      <View style={styles.heading}><Text style={styles.eyebrow}>MEINE ANLAGEN</Text><Text style={styles.title}>Pflegen. Beobachten. Verstehen.</Text><Text style={styles.copy}>Diese Daten gehören ausschließlich deinem Konto und werden serverseitig über BlackWaterLeaf gespeichert.</Text></View>
      <View style={styles.kindRow}>{(Object.keys(labels) as HabitatKind[]).map(value => <Pressable key={value} style={[styles.kind, kind === value && { borderColor: accents[value], backgroundColor: "rgba(156,235,198,.11)" }]} onPress={() => { setKind(value); setOpen(false); }}><Ionicons name={icons[value]} size={18} color={accents[value]} /><Text style={[styles.kindText, kind === value && { color: c.text }]}>{labels[value]}</Text></Pressable>)}</View>
      {!open ? <Pressable style={styles.addButton} onPress={() => setOpen(true)}><Ionicons name="add-circle-outline" size={18} color={c.bg} /><Text style={styles.addText}>NEUE {labels[kind]} ANLEGEN</Text></Pressable> : <View style={styles.form}>
        <View style={styles.formTop}><Text style={styles.formTitle}>{labels[kind]} ANLEGEN</Text><Pressable onPress={() => { setOpen(false); reset(); }}><Ionicons name="close" size={22} color={c.text} /></Pressable></View>
        <Field label="Name *" value={name} onChange={setName} placeholder={kind === "plant" ? "z. B. Monstera im Wohnzimmer" : kind === "aquarium" ? "z. B. Südamerika 180 l" : "z. B. Regenwaldterrarium"} />
        {kind === "plant" && <><Field label="Botanischer Name" value={scientificName} onChange={setScientificName} placeholder="optional" /><Field label="Standort" value={location} onChange={setLocation} placeholder="z. B. Wohnzimmerfenster" /></>}
        {kind !== "plant" && <><Field label="Besatz / Tiere" value={occupants} onChange={setOccupants} placeholder="optional" multiline /><Field label="Pflanzen" value={plants} onChange={setPlants} placeholder="optional" multiline /><Field label="Technik" value={equipment} onChange={setEquipment} placeholder="optional" multiline /></>}
        <View style={styles.split}><View style={styles.half}><Field label={kind === "terrarium" ? "Tagestemperatur °C" : "Temperatur °C"} value={temperature} onChange={setTemperature} placeholder="optional" numeric /></View>{kind !== "aquarium" && <View style={styles.half}><Field label="Luftfeuchte %" value={humidity} onChange={setHumidity} placeholder="optional" numeric /></View>}{kind === "aquarium" && <View style={styles.half}><Field label="pH" value={ph} onChange={setPh} placeholder="optional" numeric /></View>}</View>
        <Field label="Notizen" value={notes} onChange={setNotes} placeholder="optional" multiline />
        <Pressable style={[styles.saveButton, saving && styles.disabled]} onPress={() => void submit()} disabled={saving}><Text style={styles.addText}>{saving ? "WIRD GESPEICHERT …" : "SICHER SPEICHERN"}</Text></Pressable>
      </View>}
      {!open && items.length === 0 ? <View style={styles.empty}><Ionicons name={icons[kind]} size={28} color={accents[kind]} /><Text style={styles.emptyTitle}>NOCH KEINE {labels[kind]}-ANLAGE</Text><Text style={styles.copy}>Lege deine erste Anlage direkt hier an. Es werden keine Beispielanlagen angezeigt.</Text></View> : null}
    </>}
    renderItem={({ item }) => <View style={styles.item}><View style={[styles.itemIcon, { borderColor: accents[item.kind] }]}><Ionicons name={icons[item.kind]} size={18} color={accents[item.kind]} /></View><View style={styles.itemBody}><Text style={styles.itemTitle}>{item.name}</Text><Text style={styles.copy}>{labels[item.kind]} · aktualisiert {new Date(item.updatedAt).toLocaleDateString("de-DE")}</Text></View></View>}
  />;
}

function Field({ label, value, onChange, placeholder, multiline = false, numeric = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; multiline?: boolean; numeric?: boolean }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput style={[styles.input, multiline && styles.textarea]} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#78907f" multiline={multiline} keyboardType={numeric ? "decimal-pad" : "default"} /></View>; }

const styles = StyleSheet.create({ list: { padding: 16, paddingBottom: 112, gap: 12 }, heading: { gap: 7, marginBottom: 5 }, eyebrow: { color: c.lime, fontSize: 9, letterSpacing: 1.2, fontWeight: "800" }, title: { color: c.text, fontSize: 28, lineHeight: 33, fontWeight: "800" }, copy: { color: c.muted, fontSize: 12, lineHeight: 18 }, kindRow: { flexDirection: "row", gap: 8 }, kind: { flex: 1, minHeight: 76, alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, borderColor: c.border, borderRadius: 12, backgroundColor: c.surface }, kindText: { color: c.muted, fontSize: 9, fontWeight: "800" }, addButton: { minHeight: 45, borderRadius: 10, backgroundColor: c.lime, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, addText: { color: c.bg, fontSize: 11, fontWeight: "900", letterSpacing: .6 }, form: { padding: 15, borderRadius: 15, borderWidth: 1, borderColor: c.border, backgroundColor: c.raised, gap: 10 }, formTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, formTitle: { color: c.text, fontSize: 14, fontWeight: "900" }, field: { gap: 5 }, label: { color: c.mint, fontSize: 10, fontWeight: "800" }, input: { minHeight: 43, paddingHorizontal: 12, borderRadius: 9, borderWidth: 1, borderColor: c.border, color: c.text, backgroundColor: c.bg, fontSize: 13 }, textarea: { minHeight: 78, paddingTop: 10, textAlignVertical: "top" }, split: { flexDirection: "row", gap: 10 }, half: { flex: 1 }, saveButton: { minHeight: 45, borderRadius: 10, backgroundColor: c.lime, alignItems: "center", justifyContent: "center", marginTop: 2 }, disabled: { opacity: .55 }, empty: { minHeight: 165, padding: 22, borderRadius: 15, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, alignItems: "center", justifyContent: "center", gap: 10 }, emptyTitle: { color: c.text, fontSize: 12, fontWeight: "900", textAlign: "center" }, item: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderRadius: 14, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface }, itemIcon: { width: 38, height: 38, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center" }, itemBody: { flex: 1, gap: 3 }, itemTitle: { color: c.text, fontSize: 14, fontWeight: "800" } });
