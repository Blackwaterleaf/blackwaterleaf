import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  ArrowLeft,
  Bot,
  Camera,
  Droplets,
  Edit,
  Leaf,
  Sun,
  Thermometer,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUpload from "@/components/ImageUpload";

const CATEGORY_LABELS: Record<string, string> = {
  aquatic: "Wasserpflanze", tropical: "Tropisch", alocasia: "Alocasia",
  monstera: "Monstera", philodendron: "Philodendron", other: "Sonstiges",
};

interface Props { id: number; }

export default function PlantDetail({ id }: Props) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const utils = trpc.useUtils();

  const { data: plant, isLoading } = trpc.plants.get.useQuery({ id });
  const { data: photos } = trpc.plants.getPhotos.useQuery({ plantId: id });

  const addPhotoMutation = trpc.plants.addPhoto.useMutation({
    onSuccess: () => {
      utils.plants.getPhotos.invalidate({ plantId: id });
      utils.plants.get.invalidate({ id });
      toast.success("Foto hinzugefügt!");
      setUploadingPhoto(false);
    },
    onError: () => { toast.error("Fehler beim Hochladen"); setUploadingPhoto(false); },
  });

  const deleteMutation = trpc.plants.delete.useMutation({
    onSuccess: () => { toast.success("Pflanze gelöscht"); navigate("/plants"); },
  });

  if (isLoading) {
    return (
      <div className="container py-6 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        <Leaf className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>Pflanze nicht gefunden</p>
      </div>
    );
  }

  const isOwner = user?.id === plant.userId;

  const handlePhotoUpload = (base64: string, mimeType: string) => {
    setUploadingPhoto(true);
    addPhotoMutation.mutate({ plantId: id, base64, mimeType });
  };

  const CareItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-secondary/50">
      <Icon className="w-4 h-4 text-primary flex-shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="container py-6 max-w-3xl mx-auto">
      {/* Back */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/plants")} className="w-8 h-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Zurück zu Botanik</span>
      </div>

      {/* Hero */}
      <div className="relative rounded-xl overflow-hidden mb-6 bg-secondary">
        {plant.coverImageUrl ? (
          <img src={plant.coverImageUrl} alt={plant.name} className="w-full max-h-80 object-cover" />
        ) : (
          <div className="h-48 flex items-center justify-center">
            <Leaf className="w-16 h-16 text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute inset-0 img-overlay" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end justify-between">
            <div>
              <Badge variant="outline" className={cn("text-xs border mb-2 backdrop-blur-sm", `badge-${plant.category}`)}>
                {CATEGORY_LABELS[plant.category] ?? plant.category}
              </Badge>
              <h1 className="text-2xl font-display font-semibold text-white">{plant.name}</h1>
              {plant.scientificName && (
                <p className="text-sm text-white/70 italic">{plant.scientificName}</p>
              )}
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Link href={`/ai?context=plant&id=${id}`}>
                  <Button size="icon" variant="secondary" className="w-9 h-9 bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Bot className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-9 h-9 bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                  onClick={() => {
                    if (confirm("Pflanze wirklich löschen?")) deleteMutation.mutate({ id });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6 bg-secondary/50">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="photos">Fotos ({photos?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          {/* Description */}
          {plant.description && (
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Beschreibung</h2>
              <p className="text-sm leading-relaxed">{plant.description}</p>
            </div>
          )}

          {/* Care Parameters */}
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Pflegeparameter</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {plant.lightRequirement && (
                <CareItem icon={Sun} label="Lichtbedarf"
                  value={plant.lightRequirement === "low" ? "Wenig" : plant.lightRequirement === "medium" ? "Mittel" : "Viel"} />
              )}
              {plant.humidity && (
                <CareItem icon={Droplets} label="Luftfeuchtigkeit"
                  value={plant.humidity === "low" ? "Trocken" : plant.humidity === "medium" ? "Mittel" : "Hoch"} />
              )}
              {plant.temperature && <CareItem icon={Thermometer} label="Temperatur" value={plant.temperature} />}
              {plant.wateringFrequency && <CareItem icon={Droplets} label="Gießen" value={plant.wateringFrequency} />}
              {plant.substrate && <CareItem icon={Leaf} label="Substrat" value={plant.substrate} />}
              {plant.difficulty && (
                <CareItem icon={Sun} label="Schwierigkeit"
                  value={plant.difficulty === "beginner" ? "Einsteiger" : plant.difficulty === "intermediate" ? "Fortgeschritten" : "Experte"} />
              )}
            </div>
            {!plant.lightRequirement && !plant.humidity && !plant.temperature && (
              <p className="text-sm text-muted-foreground text-center py-4">Noch keine Pflegeparameter hinterlegt.</p>
            )}
          </div>

          {/* AI CTA */}
          <Link href={`/ai?context=plant&id=${id}`}>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 cursor-pointer hover:bg-primary/10 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">KI-Assistent fragen</p>
                  <p className="text-xs text-muted-foreground">Pflegeberatung, Problemdiagnose und mehr für {plant.name}</p>
                </div>
              </div>
            </div>
          </Link>
        </TabsContent>

        <TabsContent value="photos" className="animate-fade-in">
          {isOwner && (
            <div className="mb-4">
              <ImageUpload
                onChange={handlePhotoUpload}
                aspectRatio="landscape"
                placeholder={uploadingPhoto ? "Wird hochgeladen..." : "Foto zur Timeline hinzufügen"}
                className="max-w-xs"
              />
            </div>
          )}
          {photos && photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="relative rounded-xl overflow-hidden bg-secondary aspect-square group">
                  <img src={photo.imageUrl} alt={photo.caption ?? ""} className="w-full h-full object-cover" loading="lazy" />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 img-overlay opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white truncate">{photo.caption}</p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {format(new Date(photo.takenAt), "dd.MM.yy", { locale: de })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Camera className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Noch keine Fotos</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
