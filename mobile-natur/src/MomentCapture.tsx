import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { createObservation, setConsent, uploadObservationImage } from "./api";

const c = { bg: "#031108", surface: "#092117", raised: "#0c2a1c", border: "rgba(140,238,171,.25)", mint: "#9cebc6", lime: "#b9fb83", aqua: "#69def2", gold: "#e5c679", text: "#ecf8ee", muted: "#a0b8a6", danger: "#ff9ea8" };
type Realm = "botany" | "aquarium" | "terrarium";
const realmLabel: Record<Realm, string> = { botany: "BOTANIK", aquarium: "AQUARISTIK", terrarium: "TERRARISTIK" };
const realmIcon: Record<Realm, keyof typeof Ionicons.glyphMap> = { botany: "leaf", aquarium: "water", terrarium: "bug" };
const realmColor: Record<Realm, string> = { botany: c.mint, aquarium: c.aqua, terrarium: c.gold };

export function MomentCapture({ token, onComplete }: { token: string; onComplete: () => Promise<void> }) {
  const [realm, setRealm] = useState<Realm>("botany");
  const [subject, setSubject] = useState("");
  const [note, setNote] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mediaConsent, setMediaConsent] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectImage = async (camera: boolean) => {
    const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert("Fotozugriff erforderlich", camera ? "Ohne Kamerafreigabe kann kein Moment aufgenommen werden." : "Ohne Freigabe kann kein Foto ausgewählt werden."); return; }
    const result = camera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.7, allowsEditing: false })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7, allowsEditing: false });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const save = async () => {
    if (!subject.trim() && !note.trim() && !imageUri) { Alert.alert("Moment ergänzen", "Füge mindestens einen Titel, eine Notiz oder ein Foto hinzu."); return; }
    if (imageUri && !mediaConsent) { Alert.alert("Foto-Freigabe erforderlich", "Bitte bestätige zuerst die Verarbeitung des ausgewählten Fotos für diesen privaten Moment."); return; }
    setSaving(true);
    try {
      const observation = await createObservation(token, { clientId: Crypto.randomUUID(), realm, subject: subject.trim() || null, scientificName: null, note: note.trim() || null, metrics: [], evidenceState: "unverified", visibility: "private" });
      if (imageUri) {
        await setConsent(token, { purpose: "media_processing", policyVersion: "native-1.0.4", granted: true });
        const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
        await uploadObservationImage(token, { observationId: Number(observation.id), base64, mimeType: "image/jpeg" });
      }
      setSubject(""); setNote(""); setImageUri(null); setMediaConsent(false); await onComplete();
      Alert.alert("Privater Moment gespeichert", "Der Moment ist nur in deinem BlackWaterLeaf-Konto sichtbar.");
    } catch (cause) { Alert.alert("Moment konnte nicht gespeichert werden", cause instanceof Error ? cause.message : "Bitte versuche es später erneut."); }
    finally { setSaving(false); }
  };

  return <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>IN DIESEM MOMENT</Text><Text style={styles.title}>Beobachtung erfassen.</Text><Text style={styles.copy}>Notiere, was du wirklich siehst. Private Momente werden nicht veröffentlicht und Fotos werden nur mit deiner Medienfreigabe hochgeladen.</Text>
    <View style={styles.realmRow}>{(Object.keys(realmLabel) as Realm[]).map(value => <Pressable key={value} onPress={() => setRealm(value)} style={[styles.realm, realm === value && { borderColor: realmColor[value], backgroundColor: "rgba(156,235,198,.11)" }]}><Ionicons name={realmIcon[value]} size={18} color={realmColor[value]} /><Text style={[styles.realmText, realm === value && { color: c.text }]}>{realmLabel[value]}</Text></Pressable>)}</View>
    <View style={styles.card}><Field label="Was beobachtest du?" value={subject} onChange={setSubject} placeholder="z. B. neues Blatt, Wasserwechsel, Aktivität" /><Field label="Notiz" value={note} onChange={setNote} placeholder="Was ist dir aufgefallen?" multiline />
      {imageUri ? <View style={styles.preview}><Image source={{ uri: imageUri }} style={styles.image} /><Pressable style={styles.remove} onPress={() => setImageUri(null)}><Ionicons name="close" size={19} color={c.text} /></Pressable></View> : <View style={styles.photoRow}><Pressable style={styles.photoButton} onPress={() => void selectImage(true)}><Ionicons name="camera-outline" size={21} color={c.mint} /><Text style={styles.photoText}>KAMERA</Text></Pressable><Pressable style={styles.photoButton} onPress={() => void selectImage(false)}><Ionicons name="images-outline" size={21} color={c.mint} /><Text style={styles.photoText}>FOTO WÄHLEN</Text></Pressable></View>}
      {imageUri ? <View style={styles.consentRow}><Switch value={mediaConsent} onValueChange={setMediaConsent} trackColor={{ false: "#345440", true: c.lime }} thumbColor={mediaConsent ? c.bg : c.muted} /><Text style={styles.consentText}>Ich willige ein, dass dieses Foto zur Speicherung meines privaten Moments verarbeitet wird.</Text></View> : null}
      <Pressable style={[styles.save, saving && styles.disabled]} onPress={() => void save()} disabled={saving}><Ionicons name="lock-closed-outline" size={16} color={c.bg} /><Text style={styles.saveText}>{saving ? "WIRD GESPEICHERT …" : "PRIVAT SPEICHERN"}</Text></Pressable>
    </View>
    <View style={styles.notice}><Ionicons name="shield-checkmark-outline" size={20} color={c.mint} /><Text style={styles.copy}>Keine automatische Artbestimmung, keine Diagnose und keine Veröffentlichung. Für KI-Analyse oder öffentliche Beiträge ist eine separate, klare Freigabe erforderlich.</Text></View>
  </ScrollView>;
}
function Field({ label, value, onChange, placeholder, multiline = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; multiline?: boolean }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput style={[styles.input, multiline && styles.textarea]} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#78907f" multiline={multiline} /></View>; }
const styles = StyleSheet.create({ page: { padding: 16, paddingBottom: 112, gap: 12 }, eyebrow: { color: c.lime, fontSize: 9, letterSpacing: 1.3, fontWeight: "800" }, title: { color: c.text, fontSize: 29, lineHeight: 34, fontWeight: "800" }, copy: { color: c.muted, fontSize: 12, lineHeight: 18 }, realmRow: { flexDirection: "row", gap: 8 }, realm: { flex: 1, minHeight: 73, alignItems: "center", justifyContent: "center", gap: 5, borderWidth: 1, borderColor: c.border, borderRadius: 12, backgroundColor: c.surface }, realmText: { color: c.muted, fontSize: 8, fontWeight: "900" }, card: { padding: 15, gap: 12, borderRadius: 15, borderWidth: 1, borderColor: c.border, backgroundColor: c.raised }, field: { gap: 5 }, label: { color: c.mint, fontSize: 10, fontWeight: "800" }, input: { minHeight: 43, paddingHorizontal: 12, borderRadius: 9, borderWidth: 1, borderColor: c.border, color: c.text, backgroundColor: c.bg, fontSize: 13 }, textarea: { minHeight: 92, paddingTop: 10, textAlignVertical: "top" }, photoRow: { flexDirection: "row", gap: 10 }, photoButton: { flex: 1, minHeight: 76, borderWidth: 1, borderRadius: 10, borderColor: c.border, alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: c.surface }, photoText: { color: c.mint, fontSize: 9, fontWeight: "900" }, preview: { height: 220, borderRadius: 11, overflow: "hidden", backgroundColor: c.bg }, image: { width: "100%", height: "100%" }, remove: { position: "absolute", right: 9, top: 9, width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "rgba(1,9,5,.7)" }, consentRow: { padding: 10, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 10, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface }, consentText: { flex: 1, color: c.muted, fontSize: 11, lineHeight: 16 }, save: { minHeight: 46, borderRadius: 10, backgroundColor: c.lime, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, saveText: { color: c.bg, fontSize: 11, fontWeight: "900", letterSpacing: .65 }, disabled: { opacity: .55 }, notice: { padding: 15, flexDirection: "row", gap: 11, borderRadius: 15, borderWidth: 1, borderColor: "rgba(156,235,198,.3)", backgroundColor: "rgba(57,106,40,.18)" } });
