import { LiveSensorStrip } from "@/components/LiveSensorStrip";
import { ReferenceActionGrid, ReferenceEmptyState, ReferenceHero, type ReferenceAction, type ReferenceTone } from "@/components/ReferenceOverlay";
import { REFERENCE_ASSETS, WORLD_ASSETS } from "@/lib/worlds";
import { Bell, Bot, Camera, Droplets, FileText, Fish, Leaf, Map, Radio, Send, Upload, UsersRound, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";

type FlowId = "live" | "foto" | "beitrag";
type FlowSpec = { tone: ReferenceTone; image: string; eyebrow: string; title: string; subtitle: string; icon: typeof Camera; actions: ReferenceAction[] };

const FLOW_SPECS: Record<FlowId, FlowSpec> = {
  live: {
    tone: "aquarium", image: REFERENCE_ASSETS.aquarium, eyebrow: "LIVE-BEREICH", title: "DEINE WELT LIVE", subtitle: "Kamera, Wasserwerte und Stimmung – erst mit echter Verbindung aktiv.", icon: Radio,
    actions: [
      { title: "Kamera starten", note: "Foto sicher auswählen", icon: Camera, image: WORLD_ASSETS.botany, href: "/flow/foto" },
      { title: "Wasserwerte", note: "Private Anlagen öffnen", icon: Droplets, image: WORLD_ASSETS.aquarium, href: "/profile#habitats" },
      { title: "Hinweise", note: "Benachrichtigungen werden vorbereitet", icon: Bell, image: WORLD_ASSETS.terrarium, unavailable: true },
      { title: "Entdecken", note: "Naturwelten öffnen", icon: Map, image: WORLD_ASSETS.botany, href: "/explore" },
    ],
  },
  foto: {
    tone: "botany", image: REFERENCE_ASSETS.botany, eyebrow: "MOMENT FESTHALTEN", title: "FOTO", subtitle: "Wähle einen echten Bildausschnitt und ordne ihn danach deiner Welt zu.", icon: Camera,
    actions: [
      { title: "Als Pflanzenfoto", note: "Beobachtung in Botanik erfassen", icon: Leaf, image: WORLD_ASSETS.botany, href: "/world/botany#capture" },
      { title: "Als Aquariumfoto", note: "Beobachtung im Becken erfassen", icon: Fish, image: WORLD_ASSETS.aquarium, href: "/world/aquarium#capture" },
      { title: "Mit KI bestimmen", note: "Bildbestimmung wird vorbereitet", icon: Bot, image: REFERENCE_ASSETS.ai, unavailable: true },
      { title: "Zum Feed", note: "Beitrag sicher verfassen", icon: UsersRound, image: WORLD_ASSETS.terrarium, href: "/community?compose=1" },
    ],
  },
  beitrag: {
    tone: "botany", image: REFERENCE_ASSETS.botany, eyebrow: "COMMUNITY", title: "BEITRAG", subtitle: "Teile eine Beobachtung, Frage oder Inspiration mit der BlackWaterLeaf-Community.", icon: FileText,
    actions: [
      { title: "Beitrag verfassen", note: "Echten Feed-Editor öffnen", icon: Send, image: WORLD_ASSETS.botany, href: "/community?compose=1" },
      { title: "Foto auswählen", note: "Bildmoment vorbereiten", icon: Camera, image: WORLD_ASSETS.aquarium, href: "/flow/foto" },
      { title: "Video auswählen", note: "Videoaufnahme wird vorbereitet", icon: Video, image: WORLD_ASSETS.terrarium, unavailable: true },
      { title: "Community", note: "Freigegebene Momente ansehen", icon: UsersRound, image: REFERENCE_ASSETS.botany, href: "/community" },
    ],
  },
};

function PhotoCapture() {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  return (
    <section className="reference-capture" aria-label="Foto auswählen oder aufnehmen">
      {preview ? <img src={preview} alt="Lokale Vorschau des ausgewählten Fotos" /> : <div className="reference-capture__placeholder"><Camera size={38} /><span>Dein Bildausschnitt bleibt zunächst nur in diesem Browser.</span></div>}
      <label className="reference-capture__button"><Upload size={17} /> FOTO AUSWÄHLEN ODER AUFNEHMEN<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={event => {
        const file = event.target.files?.[0];
        if (!file) return;
        setPreview(current => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(file); });
        event.target.value = "";
      }} /></label>
    </section>
  );
}

export default function FlowDestination() {
  const params = useParams<{ flow: string }>();
  const flow = (params.flow in FLOW_SPECS ? params.flow : "live") as FlowId;
  const spec = FLOW_SPECS[flow];
  return (
    <div className={`reference-page reference-page--${spec.tone}`}>
      <LiveSensorStrip compact />
      <ReferenceHero {...spec} />
      {flow === "live" ? <ReferenceEmptyState tone="aquarium" code="LIVE-VERBINDUNG" title="NOCH NICHT VERBUNDEN" body="Smartgeräte, Kamera und automatische Benachrichtigungen werden erst nach einer echten, widerrufbaren Verbindung aktiviert." /> : null}
      {flow === "foto" ? <PhotoCapture /> : null}
      {flow === "beitrag" ? <section className="reference-composer-preview"><span><Leaf size={19} /></span><div><strong>DEIN MOMENT</strong><small>Der nächste Schritt öffnet den echten Feed-Editor.</small></div><Link href="/community?compose=1"><Send size={16} /> ZUM FEED-EDITOR</Link></section> : null}
      <ReferenceActionGrid tone={spec.tone} actions={spec.actions} />
    </div>
  );
}
