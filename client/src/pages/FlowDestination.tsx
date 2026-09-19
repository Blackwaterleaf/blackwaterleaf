import { ReferenceActionGrid, ReferenceEmptyState, ReferenceHero, type ReferenceAction, type ReferenceTone } from "@/components/ReferenceOverlay";
import { REFERENCE_ASSETS, WORLD_ASSETS } from "@/lib/worlds";
import { Bell, Bot, Camera, Droplets, FileText, Fish, Leaf, Map, Radio, Send, UsersRound, Video } from "lucide-react";
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
      { title: "Als Pflanzenfoto", note: "Beobachtung in Botanik erfassen", icon: Leaf, image: WORLD_ASSETS.botany, href: "/botanik#capture" },
      { title: "Als Aquariumfoto", note: "Beobachtung im Becken erfassen", icon: Fish, image: WORLD_ASSETS.aquarium, href: "/aquaristik#capture" },
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

export default function FlowDestination() {
  const params = useParams<{ flow: string }>();
  const flow = (params.flow in FLOW_SPECS ? params.flow : "live") as FlowId;
  const spec = FLOW_SPECS[flow];
  return (
    <div className={`reference-page reference-page--${spec.tone}`}>
      <ReferenceHero {...spec} />
      <ReferenceActionGrid tone={spec.tone} actions={spec.actions} />
      {flow === "live" ? <ReferenceEmptyState tone="aquarium" code="LIVE-VERBINDUNG" title="NOCH NICHT VERBUNDEN" body="Smartgeräte, Kamera und automatische Benachrichtigungen werden erst nach einer echten, widerrufbaren Verbindung aktiviert." /> : null}
      {flow === "foto" ? <ReferenceEmptyState tone="botany" code="PHOTO / SECURE_CAPTURE" title="BEREICH ZUERST WÄHLEN" body="Wähle Botanik, Aquaristik oder den Community-Feed. Das Bild wird erst im angemeldeten Zielbereich sicher ausgewählt und gespeichert – eine lokale Vorschau gilt nicht als Erfassung." /> : null}
    </div>
  );
}
