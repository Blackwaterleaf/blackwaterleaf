import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from "@/components/ImageUpload";
import { Sparkles, Loader2 } from "lucide-react";

export default function PlantCreate() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [description, setDescription] = useState("");
  const [lightRequirement, setLightRequirement] = useState<string>("");
  const [wateringFrequency, setWateringFrequency] = useState("");
  const [humidity, setHumidity] = useState<string>("");
  const [temperature, setTemperature] = useState("");
  const [substrate, setSubstrate] = useState("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [coverBase64, setCoverBase64] = useState<string | null>(null);
  const [coverMimeType, setCoverMimeType] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const identifyMutation = trpc.ai.identify.useMutation();
  const uploadMutation = trpc.upload.photo.useMutation();

  const handleIdentify = async () => {
    if (!coverBase64 || !coverMimeType) { toast.error("Bitte zuerst ein Foto hochladen"); return; }
    try {
      const r = await identifyMutation.mutateAsync({ imageBase64: coverBase64, imageMimeType: coverMimeType });
      if (r.commonName && !name.trim()) setName(r.commonName);
      if (r.scientificName && !scientificName.trim()) setScientificName(r.scientificName);
      if (r.category && ["aquatic","tropical","alocasia","monstera","philodendron","other"].includes(r.category)) setCategory(r.category);
      if (r.care && !description.trim()) setDescription(r.care);
      toast.success(`Erkannt: ${r.commonName || "unbekannt"} (${Math.round((r.confidence || 0))}%)`);
    } catch {
      toast.error("Bestimmung fehlgeschlagen");
    }
  };
  const createMutation = trpc.plants.create.useMutation({
    onSuccess: (data) => {
      toast.success("Pflanze angelegt!");
      navigate(`/plants/${data.id}`);
    },
    onError: () => toast.error("Fehler beim Anlegen"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name ist erforderlich"); return; }

    let coverImageUrl: string | undefined;
    if (coverBase64 && coverMimeType) {
      try {
        const uploaded = await uploadMutation.mutateAsync({
          base64: coverBase64,
          mimeType: coverMimeType,
          folder: "plants/covers",
        });
        coverImageUrl = uploaded.url;
      } catch {
        toast.error("Fehler beim Hochladen des Fotos");
        return;
      }
    }

    createMutation.mutate({
      name: name.trim(),
      scientificName: scientificName.trim() || undefined,
      category: category as any,
      description: description.trim() || undefined,
      coverImageUrl,
      lightRequirement: lightRequirement as any || undefined,
      wateringFrequency: wateringFrequency.trim() || undefined,
      humidity: humidity as any || undefined,
      temperature: temperature.trim() || undefined,
      substrate: substrate.trim() || undefined,
      difficulty: difficulty as any || undefined,
    });
  };

  const isLoading = uploadMutation.isPending || createMutation.isPending;

  return (
    <div className="container py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/plants")} className="w-8 h-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-display font-semibold">Neue Pflanze</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image */}
        <div>
          <Label className="mb-2 block">Titelbild</Label>
          <ImageUpload
            value={coverPreview}
            onChange={(b64, mime) => {
              setCoverBase64(b64);
              setCoverMimeType(mime);
              setCoverPreview(`data:${mime};base64,${b64}`);
            }}
            onClear={() => { setCoverBase64(null); setCoverMimeType(null); setCoverPreview(null); }}
            aspectRatio="landscape"
            className="max-w-sm"
          />
          {coverBase64 && (
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={handleIdentify} disabled={identifyMutation.isPending}>
              {identifyMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
              Per KI bestimmen & Felder ausfüllen
            </Button>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Grundinformationen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="z.B. Monstera deliciosa" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scientific">Wissenschaftlicher Name</Label>
              <Input id="scientific" value={scientificName} onChange={e => setScientificName(e.target.value)} placeholder="z.B. Monstera deliciosa" className="italic" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Kategorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aquatic">Wasserpflanze</SelectItem>
                <SelectItem value="tropical">Tropisch</SelectItem>
                <SelectItem value="alocasia">Alocasia</SelectItem>
                <SelectItem value="monstera">Monstera</SelectItem>
                <SelectItem value="philodendron">Philodendron</SelectItem>
                <SelectItem value="other">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Besonderheiten, Herkunft, persönliche Notizen..."
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>

        {/* Care Parameters */}
        <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Pflegeparameter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Lichtbedarf</Label>
              <Select value={lightRequirement} onValueChange={setLightRequirement}>
                <SelectTrigger>
                  <SelectValue placeholder="Auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Wenig Licht</SelectItem>
                  <SelectItem value="medium">Mittleres Licht</SelectItem>
                  <SelectItem value="high">Viel Licht</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Luftfeuchtigkeit</Label>
              <Select value={humidity} onValueChange={setHumidity}>
                <SelectTrigger>
                  <SelectValue placeholder="Auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Trocken (&lt;40%)</SelectItem>
                  <SelectItem value="medium">Mittel (40–60%)</SelectItem>
                  <SelectItem value="high">Hoch (&gt;60%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="watering">Gießhäufigkeit</Label>
              <Input id="watering" value={wateringFrequency} onChange={e => setWateringFrequency(e.target.value)} placeholder="z.B. 2× pro Woche" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="temp">Temperatur</Label>
              <Input id="temp" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="z.B. 18–28°C" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="substrate">Substrat</Label>
              <Input id="substrate" value={substrate} onChange={e => setSubstrate(e.target.value)} placeholder="z.B. Aroid-Mix" />
            </div>
            <div className="space-y-1.5">
              <Label>Schwierigkeitsgrad</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Einsteiger</SelectItem>
                  <SelectItem value="intermediate">Fortgeschritten</SelectItem>
                  <SelectItem value="expert">Experte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/plants")} className="flex-1">
            Abbrechen
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1 press-active">
            {isLoading ? "Wird gespeichert..." : "Pflanze anlegen"}
          </Button>
        </div>
      </form>
    </div>
  );
}
