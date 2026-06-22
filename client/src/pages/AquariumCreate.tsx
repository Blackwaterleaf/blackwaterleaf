import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUpload from "@/components/ImageUpload";

export default function AquariumCreate() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("freshwater");
  const [description, setDescription] = useState("");
  const [volumeLiters, setVolumeLiters] = useState("");
  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [phValue, setPhValue] = useState("");
  const [ghValue, setGhValue] = useState("");
  const [khValue, setKhValue] = useState("");
  const [temperatureCelsius, setTemperatureCelsius] = useState("");
  const [filterType, setFilterType] = useState("");
  const [lightingType, setLightingType] = useState("");
  const [substrate, setSubstrate] = useState("");
  const [inhabitants, setInhabitants] = useState("");
  const [plants, setPlants] = useState("");
  const [coverBase64, setCoverBase64] = useState<string | null>(null);
  const [coverMimeType, setCoverMimeType] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const uploadMutation = trpc.upload.photo.useMutation();
  const createMutation = trpc.aquariums.create.useMutation({
    onSuccess: (data) => { toast.success("Aquarium angelegt!"); navigate(`/aquariums/${data.id}`); },
    onError: () => toast.error("Fehler beim Anlegen"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name ist erforderlich"); return; }
    let coverImageUrl: string | undefined;
    if (coverBase64 && coverMimeType) {
      try {
        const uploaded = await uploadMutation.mutateAsync({ base64: coverBase64, mimeType: coverMimeType, folder: "aquariums/covers" });
        coverImageUrl = uploaded.url;
      } catch { toast.error("Fehler beim Hochladen"); return; }
    }
    createMutation.mutate({
      name: name.trim(), type: type as any, description: description.trim() || undefined,
      volumeLiters: volumeLiters ? parseFloat(volumeLiters) : undefined,
      lengthCm: lengthCm ? parseFloat(lengthCm) : undefined,
      widthCm: widthCm ? parseFloat(widthCm) : undefined,
      heightCm: heightCm ? parseFloat(heightCm) : undefined,
      phValue: phValue ? parseFloat(phValue) : undefined,
      ghValue: ghValue ? parseFloat(ghValue) : undefined,
      khValue: khValue ? parseFloat(khValue) : undefined,
      temperatureCelsius: temperatureCelsius ? parseFloat(temperatureCelsius) : undefined,
      filterType: filterType.trim() || undefined,
      lightingType: lightingType.trim() || undefined,
      substrate: substrate.trim() || undefined,
      inhabitants: inhabitants.trim() || undefined,
      plants: plants.trim() || undefined,
    });
  };

  const isLoading = uploadMutation.isPending || createMutation.isPending;

  return (
    <div className="container py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/aquariums")} className="w-8 h-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-display font-semibold">Neues Aquarium</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label className="mb-2 block">Titelbild</Label>
          <ImageUpload
            value={coverPreview}
            onChange={(b64, mime) => { setCoverBase64(b64); setCoverMimeType(mime); setCoverPreview(`data:${mime};base64,${b64}`); }}
            onClear={() => { setCoverBase64(null); setCoverMimeType(null); setCoverPreview(null); }}
            aspectRatio="landscape"
            className="max-w-sm"
          />
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Grundinformationen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="z.B. Schwarzwasser-Biotop" required />
            </div>
            <div className="space-y-1.5">
              <Label>Typ</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="freshwater">Süßwasser</SelectItem>
                  <SelectItem value="saltwater">Salzwasser</SelectItem>
                  <SelectItem value="blackwater">Schwarzwasser</SelectItem>
                  <SelectItem value="planted">Pflanzenaquarium</SelectItem>
                  <SelectItem value="biotope">Biotop</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Beschreibung</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Konzept, Besonderheiten, Ziele..." className="min-h-[80px] resize-none" />
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Abmessungen</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label>Volumen (L)</Label>
              <Input type="number" value={volumeLiters} onChange={e => setVolumeLiters(e.target.value)} placeholder="z.B. 200" />
            </div>
            <div className="space-y-1.5">
              <Label>Länge (cm)</Label>
              <Input type="number" value={lengthCm} onChange={e => setLengthCm(e.target.value)} placeholder="120" />
            </div>
            <div className="space-y-1.5">
              <Label>Breite (cm)</Label>
              <Input type="number" value={widthCm} onChange={e => setWidthCm(e.target.value)} placeholder="50" />
            </div>
            <div className="space-y-1.5">
              <Label>Höhe (cm)</Label>
              <Input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="50" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Wasserwerte</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label>pH-Wert</Label>
              <Input type="number" step="0.1" value={phValue} onChange={e => setPhValue(e.target.value)} placeholder="6.5" />
            </div>
            <div className="space-y-1.5">
              <Label>GH (°dH)</Label>
              <Input type="number" value={ghValue} onChange={e => setGhValue(e.target.value)} placeholder="8" />
            </div>
            <div className="space-y-1.5">
              <Label>KH (°dH)</Label>
              <Input type="number" value={khValue} onChange={e => setKhValue(e.target.value)} placeholder="4" />
            </div>
            <div className="space-y-1.5">
              <Label>Temperatur (°C)</Label>
              <Input type="number" step="0.5" value={temperatureCelsius} onChange={e => setTemperatureCelsius(e.target.value)} placeholder="26" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Ausstattung & Besatz</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Filter</Label>
              <Input value={filterType} onChange={e => setFilterType(e.target.value)} placeholder="z.B. Außenfilter Eheim" />
            </div>
            <div className="space-y-1.5">
              <Label>Beleuchtung</Label>
              <Input value={lightingType} onChange={e => setLightingType(e.target.value)} placeholder="z.B. Chihiros A-Serie" />
            </div>
            <div className="space-y-1.5">
              <Label>Bodengrund</Label>
              <Input value={substrate} onChange={e => setSubstrate(e.target.value)} placeholder="z.B. JBL Manado" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Besatz</Label>
            <Textarea value={inhabitants} onChange={e => setInhabitants(e.target.value)} placeholder="z.B. 10× Neon, 5× Corydoras..." className="min-h-[60px] resize-none" />
          </div>
          <div className="space-y-1.5">
            <Label>Bepflanzung</Label>
            <Textarea value={plants} onChange={e => setPlants(e.target.value)} placeholder="z.B. Anubias, Java-Farn..." className="min-h-[60px] resize-none" />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/aquariums")} className="flex-1">Abbrechen</Button>
          <Button type="submit" disabled={isLoading} className="flex-1 press-active">
            {isLoading ? "Wird gespeichert..." : "Aquarium anlegen"}
          </Button>
        </div>
      </form>
    </div>
  );
}
