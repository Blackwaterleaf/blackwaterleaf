import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
} from "react-native";
import {
  createHabitat,
  updateHabitat,
  uploadHabitatImage,
  deleteHabitatImage,
  type Habitat,
  type HabitatKind,
  type HabitatPayload,
} from "./api";

const c = {
  bg: "#031108",
  surface: "#07180d",
  raised: "#0b2415",
  border: "rgba(199,243,91,.28)",
  mint: "#C7F35B",
  lime: "#C7F35B",
  aqua: "#28D8FF",
  gold: "#E1D661",
  text: "#F3FFF5",
  muted: "#9BB39F",
  danger: "#FF9EA8",
};

const labels: Record<HabitatKind, string> = {
  plant: "PFLANZE",
  aquarium: "AQUARIUM",
  terrarium: "TERRARIUM",
};
const icons: Record<HabitatKind, keyof typeof Ionicons.glyphMap> = {
  plant: "leaf",
  aquarium: "water",
  terrarium: "bug",
};
const accents: Record<HabitatKind, string> = {
  plant: c.mint,
  aquarium: c.aqua,
  terrarium: c.gold,
};
const surfaces: Record<HabitatKind, { page: string; panel: string }> = {
  plant: { page: "#061b0d", panel: "#0b2415" },
  aquarium: { page: "#04303e", panel: "#032231" },
  terrarium: { page: "#3e3812", panel: "#302c0f" },
};
const backgrounds: Record<HabitatKind, ImageSourcePropType> = {
  plant: require("../assets/botany-reference.jpg"),
  aquarium: require("../assets/aquarium-reference.jpg"),
  terrarium: require("../assets/terrarium-reference.jpg"),
};

type Props = {
  token: string;
  habitats: Habitat[];
  onSaved: () => Promise<void>;
  initialKind?: HabitatKind;
};

export function HabitatManager({
  token,
  habitats,
  onSaved,
  initialKind = "plant",
}: Props) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<HabitatKind>(initialKind);
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
  const [photos, setPhotos] = useState<Array<{ uri: string; base64: string; mimeType: string }>>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [gallery, setGallery] = useState<{ images: NonNullable<Habitat["images"]>; index: number } | null>(null);
  const [imagePending, setImagePending] = useState(false);
  const items = useMemo(
    () => habitats.filter(item => item.kind === kind),
    [habitats, kind]
  );
  const accent = accents[kind];
  const surface = surfaces[kind];

  const reset = () => {
    setName("");
    setScientificName("");
    setLocation("");
    setOccupants("");
    setPlants("");
    setTemperature("");
    setHumidity("");
    setPh("");
    setEquipment("");
    setNotes("");
    setPhotos([]);
    setEditingId(null);
  };
  const choosePhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Medienfreigabe fehlt", "Bitte erlaube den Zugriff auf deine Bilder.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.82, allowsMultipleSelection: true, selectionLimit: 3, allowsEditing: false });
    if (result.canceled) return;
    try {
      const next: Array<{ uri: string; base64: string; mimeType: string }> = [];
      for (const asset of result.assets.slice(0, 3)) {
        const mimeType = asset.mimeType === "image/png" || asset.mimeType === "image/webp" ? asset.mimeType : "image/jpeg";
        next.push({ uri: asset.uri, base64: await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 }), mimeType });
      }
      setPhotos(next);
    } catch {
      Alert.alert("Bild konnte nicht vorbereitet werden", "Bitte wähle ein kleineres JPG-, PNG- oder WebP-Bild.");
    }
  };
  const number = (value: string) =>
    value.trim() === "" ? null : Number(value.replace(",", "."));
  const nullable = (value: string) => value.trim() || null;
  const validNumber = (value: string) =>
    value.trim() === "" || Number.isFinite(number(value));

  const openEdit = (item: Habitat) => {
    const d = item.details;
    const value = (key: string) => d[key] == null ? "" : String(d[key]);
    setEditingId(item.id);
    setKind(item.kind);
    setName(item.name);
    setScientificName(value("scientificName"));
    setLocation(value("location"));
    setOccupants(value("occupants"));
    setPlants(value("plants"));
    setTemperature(value(item.kind === "terrarium" ? "dayTemperatureC" : "temperatureC"));
    setHumidity(value("humidityPercent"));
    setPh(value("ph"));
    setEquipment(value("equipment"));
    setNotes(value("notes"));
    setPhotos([]);
    setOpen(true);
  };
  const openGallery = (images: NonNullable<Habitat["images"]>, index: number) => setGallery({ images, index });
  const removeImage = async (habitatId: number, imageId: string) => {
    const numericImageId = Number(imageId);
    if (!Number.isInteger(numericImageId)) return;
    Alert.alert("Bild löschen", "Dieses private Anlagenbild wirklich löschen?", [
      { text: "Abbrechen", style: "cancel" },
      { text: "Löschen", style: "destructive", onPress: async () => {
        setImagePending(true);
        try { await deleteHabitatImage(token, { habitatId, imageId: numericImageId }); await onSaved(); }
        catch (cause) { Alert.alert("Bild konnte nicht gelöscht werden", cause instanceof Error ? cause.message : "Bitte versuche es später erneut."); }
        finally { setImagePending(false); }
      } },
    ]);
  };

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert("Name fehlt", "Bitte gib deiner Anlage einen Namen.");
      return;
    }
    if (![temperature, humidity, ph].every(validNumber)) {
      Alert.alert(
        "Ungültige Zahl",
        "Bitte verwende bei Messwerten nur Zahlen."
      );
      return;
    }
    const payload: HabitatPayload =
      kind === "plant"
        ? {
            kind,
            name: name.trim(),
            details: {
              scientificName: nullable(scientificName),
              quantity: null,
              location: nullable(location),
              substrate: null,
              potSizeCm: null,
              light: null,
              watering: null,
              humidityPercent: number(humidity),
              temperatureC: number(temperature),
              fertilizer: null,
              notes: nullable(notes),
            },
          }
        : kind === "aquarium"
          ? {
              kind,
              name: name.trim(),
              details: {
                volumeLiters: null,
                lengthCm: null,
                widthCm: null,
                heightCm: null,
                occupants: nullable(occupants),
                plants: nullable(plants),
                temperatureC: number(temperature),
                ph: number(ph),
                gh: null,
                kh: null,
                nitriteMgL: null,
                nitrateMgL: null,
                conductivityUs: null,
                equipment: nullable(equipment),
                notes: nullable(notes),
              },
            }
          : {
              kind,
              name: name.trim(),
              details: {
                volumeLiters: null,
                lengthCm: null,
                widthCm: null,
                heightCm: null,
                occupants: nullable(occupants),
                plants: nullable(plants),
                dayTemperatureC: number(temperature),
                nightTemperatureC: null,
                humidityPercent: number(humidity),
                substrate: null,
                equipment: nullable(equipment),
                notes: nullable(notes),
              },
            };
    setSaving(true);
    try {
      const saved = editingId ? await updateHabitat(token, { id: editingId, ...payload }) : await createHabitat(token, payload);
      for (const photo of photos) {
        await uploadHabitatImage(token, {
          habitatId: saved.id,
          base64: photo.base64,
          mimeType: photo.mimeType,
        });
      }
      reset();
      setOpen(false);
      await onSaved();
    } catch (cause) {
      Alert.alert(
        "Anlage konnte nicht gespeichert werden",
        cause instanceof Error
          ? cause.message
          : "Bitte versuche es später erneut."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <FlatList
      data={open ? [] : items}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <>
          <ImageBackground
            source={backgrounds[kind]}
            style={[styles.headingHero, { borderColor: `${accent}66` }]}
            imageStyle={styles.headingHeroImage}
          >
          <View style={styles.heading}>
            <Text style={[styles.eyebrow, { color: accent }]}>
              MEINE ANLAGEN
            </Text>
            <Text style={styles.title}>Pflegen. Beobachten. Verstehen.</Text>
            <Text style={styles.copy}>
              Diese Daten gehören ausschließlich deinem Konto und werden
              serverseitig über BlackWaterLeaf gespeichert.
            </Text>
          </View>
          </ImageBackground>
          <View style={styles.kindRow}>
            {(Object.keys(labels) as HabitatKind[]).map(value => (
              <Pressable
                key={value}
                style={[
                  styles.kind,
                  {
                    borderColor:
                      kind === value ? accents[value] : `${accents[value]}44`,
                    backgroundColor:
                      kind === value
                        ? `${accents[value]}1c`
                        : surfaces[value].panel,
                  },
                ]}
                onPress={() => {
                  setKind(value);
                  setOpen(false);
                }}
              >
                <Ionicons
                  name={icons[value]}
                  size={18}
                  color={accents[value]}
                />
                <Text
                  style={[styles.kindText, kind === value && { color: c.text }]}
                >
                  {labels[value]}
                </Text>
              </Pressable>
            ))}
          </View>
          {!open ? (
            <Pressable
              style={[styles.addButton, { backgroundColor: accent }]}
              onPress={() => setOpen(true)}
            >
              <Ionicons name="add-circle-outline" size={18} color={c.bg} />
              <Text style={styles.addText}>NEUE {labels[kind]} ANLEGEN</Text>
            </Pressable>
          ) : (
            <View
              style={[
                styles.form,
                { borderColor: `${accent}66`, backgroundColor: surface.panel },
              ]}
            >
              <View style={styles.formTop}>
                <Text style={styles.formTitle}>{editingId ? `${labels[kind]} BEARBEITEN` : `${labels[kind]} ANLEGEN`}</Text>
                <Pressable
                  onPress={() => {
                    setOpen(false);
                    reset();
                  }}
                >
                  <Ionicons name="close" size={22} color={c.text} />
                </Pressable>
              </View>
              <Field
                accent={accent}
                surface={surface.page}
                label="Name *"
                value={name}
                onChange={setName}
                placeholder={
                  kind === "plant"
                    ? "z. B. Monstera im Wohnzimmer"
                    : kind === "aquarium"
                      ? "z. B. Südamerika 180 l"
                      : "z. B. Regenwaldterrarium"
                }
              />
              {kind === "plant" && (
                <>
                  <Field
                    accent={accent}
                    surface={surface.page}
                    label="Botanischer Name"
                    value={scientificName}
                    onChange={setScientificName}
                    placeholder="optional"
                  />
                  <Field
                    accent={accent}
                    surface={surface.page}
                    label="Standort"
                    value={location}
                    onChange={setLocation}
                    placeholder="z. B. Wohnzimmerfenster"
                  />
                </>
              )}
              {kind !== "plant" && (
                <>
                  <Field
                    accent={accent}
                    surface={surface.page}
                    label="Besatz / Tiere"
                    value={occupants}
                    onChange={setOccupants}
                    placeholder="optional"
                    multiline
                  />
                  <Field
                    accent={accent}
                    surface={surface.page}
                    label="Pflanzen"
                    value={plants}
                    onChange={setPlants}
                    placeholder="optional"
                    multiline
                  />
                  <Field
                    accent={accent}
                    surface={surface.page}
                    label="Technik"
                    value={equipment}
                    onChange={setEquipment}
                    placeholder="optional"
                    multiline
                  />
                </>
              )}
              <View style={styles.split}>
                <View style={styles.half}>
                  <Field
                    accent={accent}
                    surface={surface.page}
                    label={
                      kind === "terrarium"
                        ? "Tagestemperatur °C"
                        : "Temperatur °C"
                    }
                    value={temperature}
                    onChange={setTemperature}
                    placeholder="optional"
                    numeric
                  />
                </View>
                {kind !== "aquarium" && (
                  <View style={styles.half}>
                    <Field
                      accent={accent}
                      surface={surface.page}
                      label="Luftfeuchte %"
                      value={humidity}
                      onChange={setHumidity}
                      placeholder="optional"
                      numeric
                    />
                  </View>
                )}
                {kind === "aquarium" && (
                  <View style={styles.half}>
                    <Field
                      accent={accent}
                      surface={surface.page}
                      label="pH"
                      value={ph}
                      onChange={setPh}
                      placeholder="optional"
                      numeric
                    />
                  </View>
                )}
              </View>
              <Field
                accent={accent}
                surface={surface.page}
                label="Notizen"
                value={notes}
                onChange={setNotes}
                placeholder="optional"
                multiline
              />
              <Pressable
                style={[styles.photoButton, { borderColor: `${accent}88`, backgroundColor: surface.page }]}
                onPress={() => void choosePhotos()}
                disabled={saving}
              >
                <Ionicons name="images-outline" size={19} color={accent} />
                <View style={styles.photoButtonCopy}>
                  <Text style={[styles.photoButtonTitle, { color: accent }]}>PRIVATE BILDER HINZUFÜGEN</Text>
                  <Text style={styles.copy}>{photos.length ? `${photos.length} Einzelbild${photos.length === 1 ? "" : "er"} ausgewählt` : "Optional · maximal 3 Bilder"}</Text>
                </View>
              </Pressable>
              {photos.length ? <View style={styles.photoStrip}>{photos.map(photo => <Image key={photo.uri} source={{ uri: photo.uri }} style={styles.photoThumb} />)}</View> : null}
              <Pressable
                style={[
                  styles.saveButton,
                  { backgroundColor: accent },
                  saving && styles.disabled,
                ]}
                onPress={() => void submit()}
                disabled={saving}
              >
                <Text style={styles.addText}>
                  {saving ? "WIRD GESPEICHERT …" : editingId ? "ÄNDERUNG SPEICHERN" : "SICHER SPEICHERN"}
                </Text>
              </Pressable>
            </View>
          )}
          {!open && items.length === 0 ? (
            <View
              style={[
                styles.empty,
                { borderColor: `${accent}66`, backgroundColor: surface.panel },
              ]}
            >
              <Ionicons name={icons[kind]} size={28} color={accent} />
              <Text style={styles.emptyTitle}>
                NOCH KEINE {labels[kind]}-ANLAGE
              </Text>
              <Text style={styles.copy}>
                Lege deine erste Anlage direkt hier an. Es werden keine
                Beispielanlagen angezeigt.
              </Text>
            </View>
          ) : null}
        </>
      }
      renderItem={({ item }) => (
        <ImageBackground
          source={item.images?.[0]?.accessUrl ? { uri: item.images[0].accessUrl } : backgrounds[item.kind]}
          style={[styles.item, { borderColor: `${accents[item.kind]}88` }]}
          imageStyle={styles.itemImage}
          accessibilityLabel={`${item.name} · ${labels[item.kind]}`}
        >
          <View style={styles.itemShade} />
          <View style={styles.itemContent}>
            <View style={[styles.itemIcon, { borderColor: accents[item.kind], backgroundColor: `${surfaces[item.kind].page}cc` }] }>
              <Ionicons name={icons[item.kind]} size={18} color={accents[item.kind]} />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.copy}>
                {labels[item.kind]} · aktualisiert{" "}
                {new Date(item.updatedAt).toLocaleDateString("de-DE")}
              </Text>
              {statusChips(item).length ? <View style={styles.statusRow} accessibilityLabel="Anlagenstatus">{statusChips(item).map(chip => <View key={chip.label} style={[styles.statusChip, { borderColor: accents[item.kind] }]}><Text style={[styles.statusLabel, { color: accents[item.kind] }]}>{chip.label}</Text><Text style={styles.statusValue}>{chip.value}</Text></View>)}</View> : null}
              {item.images?.length ? <View style={styles.savedPhotoStrip} accessibilityLabel={`${item.images.length} Anlagenbilder`}>{item.images.slice(0, 3).map((image, imageIndex) => <View key={image.id} style={styles.savedPhotoFrame}><Pressable accessibilityRole="button" accessibilityLabel="Anlagenbild vergrößern" onPress={() => openGallery(item.images ?? [], imageIndex)}><Image source={{ uri: image.accessUrl }} style={styles.savedPhotoThumb} accessibilityLabel="Anlagenbild" /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Anlagenbild löschen" style={styles.imageDeleteOverlay} disabled={imagePending} onPress={() => void removeImage(item.id, image.id)}><Ionicons name="trash-outline" size={13} color={c.danger} /></Pressable></View>)}</View> : null}
              <View style={styles.cardActions}><Pressable accessibilityRole="button" accessibilityLabel={`${item.name} bearbeiten`} style={styles.cardIconButton} onPress={() => openEdit(item)}><Ionicons name="create-outline" size={15} color={accents[item.kind]} /></Pressable></View>
            </View>
          </View>
        </ImageBackground>
      )}
    />
    <Modal visible={Boolean(gallery)} transparent animationType="fade" onRequestClose={() => setGallery(null)}>
      <View style={styles.gallery}><Pressable style={styles.galleryClose} onPress={() => setGallery(null)} accessibilityLabel="Galerie schließen"><Ionicons name="close" size={23} color={c.text} /></Pressable>{gallery ? <><Image source={{ uri: gallery.images[gallery.index].accessUrl }} style={styles.galleryImage} resizeMode="contain" /><Text style={styles.galleryCount}>{gallery.index + 1} / {gallery.images.length}</Text>{gallery.images.length > 1 ? <><Pressable style={[styles.galleryNav, styles.galleryPrev]} onPress={() => setGallery(current => current ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length } : current)} accessibilityLabel="Vorheriges Bild"><Ionicons name="chevron-back" size={28} color={c.text} /></Pressable><Pressable style={[styles.galleryNav, styles.galleryNext]} onPress={() => setGallery(current => current ? { ...current, index: (current.index + 1) % current.images.length } : current)} accessibilityLabel="Nächstes Bild"><Ionicons name="chevron-forward" size={28} color={c.text} /></Pressable></> : null}</> : null}</View>
    </Modal>
    </>
  );
}


function statusChips(item: Habitat) {
  const d = item.details;
  const value = (key: string) => d[key] == null || d[key] === "" ? null : String(d[key]);
  const chips: Array<{ label: string; value: string }> = [];
  const temperature = value(item.kind === "terrarium" ? "dayTemperatureC" : "temperatureC");
  const humidity = value("humidityPercent");
  const ph = value("ph");
  if (temperature) chips.push({ label: "TEMP", value: `${temperature} °C` });
  if (humidity) chips.push({ label: "LUFT", value: `${humidity} %` });
  if (ph) chips.push({ label: "pH", value: ph });
  return chips;
}
function Field({
  accent,
  surface,
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  numeric = false,
}: {
  accent: string;
  surface: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  numeric?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: accent }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: `${accent}66`, backgroundColor: surface },
          multiline && styles.textarea,
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9BB39F"
        multiline={multiline}
        keyboardType={numeric ? "decimal-pad" : "default"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 112, gap: 12 },
  headingHero: { minHeight: 174, overflow: "hidden", borderRadius: 18, borderWidth: 1, backgroundColor: c.surface, justifyContent: "flex-end" },
  headingHeroImage: { opacity: 0.42 },
  heading: { gap: 7, marginBottom: 5 },
  eyebrow: {
    color: c.lime,
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: "800",
  },
  title: { color: c.text, fontSize: 28, lineHeight: 33, fontWeight: "800" },
  copy: { color: c.muted, fontSize: 12, lineHeight: 18 },
  kindRow: { flexDirection: "row", gap: 8 },
  kind: {
    flex: 1,
    minHeight: 76,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    backgroundColor: c.surface,
  },
  kindText: { color: c.muted, fontSize: 9, fontWeight: "800" },
  addButton: {
    minHeight: 45,
    borderRadius: 10,
    backgroundColor: c.lime,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addText: { color: c.bg, fontSize: 11, fontWeight: "900", letterSpacing: 0.6 },
  form: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.raised,
    gap: 10,
  },
  formTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  formTitle: { color: c.text, fontSize: 14, fontWeight: "900" },
  field: { gap: 5 },
  label: { color: c.mint, fontSize: 10, fontWeight: "800" },
  input: {
    minHeight: 43,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: c.border,
    color: c.text,
    backgroundColor: c.bg,
    fontSize: 13,
  },
  textarea: { minHeight: 78, paddingTop: 10, textAlignVertical: "top" },
  split: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  saveButton: {
    minHeight: 45,
    borderRadius: 10,
    backgroundColor: c.lime,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  disabled: { opacity: 0.55 },
  photoButton: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderWidth: 1, borderRadius: 10 },
  photoButtonCopy: { flex: 1, gap: 3 },
  photoButtonTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  photoStrip: { flexDirection: "row", gap: 8 },
  photoThumb: { width: 96, height: 96, borderRadius: 10, borderWidth: 1, borderColor: c.border },
  savedPhotoStrip: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 9, width: "100%" },
  savedPhotoFrame: { width: "31%", aspectRatio: 1, position: "relative" },
  savedPhotoThumb: { width: "100%", height: "100%", borderRadius: 10, borderWidth: 1, borderColor: c.border },
  imageDeleteOverlay: { position: "absolute", right: 4, bottom: 4, width: 25, height: 25, borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(3,17,8,.88)", borderWidth: 1, borderColor: c.danger },
  cardActions: { position: "absolute", top: 12, right: 12 },
  cardIconButton: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(3,17,8,.86)", borderWidth: 1, borderColor: c.border },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 7 },
  statusChip: { flexDirection: "row", gap: 4, alignItems: "center", paddingHorizontal: 7, paddingVertical: 4, borderRadius: 99, borderWidth: 1, backgroundColor: "rgba(3,17,8,.68)" },
  statusLabel: { fontSize: 8, fontWeight: "900" },
  statusValue: { color: c.text, fontSize: 10, fontWeight: "800" },
  empty: {
    minHeight: 165,
    padding: 22,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyTitle: {
    color: c.text,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  item: {
    minHeight: 220,
    overflow: "hidden",
    justifyContent: "flex-end",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  itemImage: { opacity: 0.9 },
  itemShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(1,10,5,.42)" },
  itemContent: { flexDirection: "row", alignItems: "flex-end", gap: 12, padding: 15 },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  itemBody: { flex: 1, gap: 3 },
  itemTitle: { color: c.text, fontSize: 14, fontWeight: "800" },
  gallery: { flex: 1, backgroundColor: "rgba(1,8,4,.97)", alignItems: "center", justifyContent: "center" },
  galleryImage: { width: "100%", height: "78%" },
  galleryClose: { position: "absolute", zIndex: 2, top: 48, right: 20, width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(3,18,9,.86)", borderWidth: 1, borderColor: c.border },
  galleryCount: { position: "absolute", bottom: 44, color: c.mint, fontSize: 12, fontWeight: "900" },
  galleryNav: { position: "absolute", top: "48%", width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(3,18,9,.86)", borderWidth: 1, borderColor: c.border },
  galleryPrev: { left: 16 },
  galleryNext: { right: 16 },
});
