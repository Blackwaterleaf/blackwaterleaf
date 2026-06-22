import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowLeft, Bot, Camera, Droplets, Plus, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ImageUpload";

const TYPE_LABELS: Record<string, string> = {
  freshwater: "Süßwasser", saltwater: "Salzwasser", blackwater: "Schwarzwasser",
  planted: "Pflanzenaquarium", biotope: "Biotop", other: "Sonstiges",
};

const EVENT_LABELS: Record<string, string> = {
  water_change: "Wasserwechsel", feeding: "Fütterung", fertilizing: "Düngung",
  maintenance: "Wartung", measurement: "Messung", new_inhabitant: "Neuer Bewohner",
  health_issue: "Gesundheitsproblem", other: "Sonstiges",
};

const EVENT_ICONS: Record<string, string> = {
  water_change: "💧", feeding: "🐟", fertilizing: "🌿", maintenance: "🔧",
  measurement: "📊", new_inhabitant: "🐠", health_issue: "⚠️", other: "📝",
};

interface Props { id: number; }

export default function AquariumDetail({ id }: Props) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventType, setEventType] = useState("water_change");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");

  const { data: aquarium, isLoading } = trpc.aquariums.get.useQuery({ id });
  const { data: photos } = trpc.aquariums.getPhotos.useQuery({ aquariumId: id });
  const { data: events } = trpc.aquariums.getEvents.useQuery({ aquariumId: id });

  const addPhotoMutation = trpc.aquariums.addPhoto.useMutation({
    onSuccess: () => { utils.aquariums.getPhotos.invalidate({ aquariumId: id }); toast.success("Foto hinzugefügt!"); },
  });
  const addEventMutation = trpc.aquariums.addEvent.useMutation({
    onSuccess: () => {
      utils.aquariums.getEvents.invalidate({ aquariumId: id });
      setShowAddEvent(false); setEventTitle(""); setEventDesc("");
      toast.success("Ereignis protokolliert!");
    },
  });
  const deleteMutation = trpc.aquariums.delete.useMutation({
    onSuccess: () => { toast.success("Aquarium gelöscht"); navigate("/aquariums"); },
  });

  if (isLoading) {
    return (
      <div className="container py-6 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!aquarium) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        <Droplets className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>Aquarium nicht gefunden</p>
      </div>
    );
  }

  const isOwner = user?.id === aquarium.userId;

  const WaterParam = ({ label, value, unit }: { label: string; value: number | null | undefined; unit: string }) => {
    if (!value) return null;
    return (
      <div className="text-center p-3 rounded-lg bg-secondary/50">
        <p className="text-lg font-semibold text-primary">{value}{unit}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    );
  };

  return (
    <div className="container py-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/aquariums")} className="w-8 h-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Zurück zu Aquarien</span>
      </div>

      {/* Hero */}
      <div className="relative rounded-xl overflow-hidden mb-6 bg-secondary">
        {aquarium.coverImageUrl ? (
          <img src={aquarium.coverImageUrl} alt={aquarium.name} className="w-full max-h-80 object-cover" />
        ) : (
          <div className="h-48 flex items-center justify-center">
            <Droplets className="w-16 h-16 text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute inset-0 img-overlay" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end justify-between">
            <div>
              <Badge variant="outline" className={cn("text-xs border mb-2 backdrop-blur-sm", `badge-${aquarium.type}`)}>
                {TYPE_LABELS[aquarium.type] ?? aquarium.type}
              </Badge>
              <h1 className="text-2xl font-display font-semibold text-white">{aquarium.name}</h1>
              {aquarium.volumeLiters && <p className="text-sm text-white/70">{aquarium.volumeLiters} Liter</p>}
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Link href={`/ai?context=aquarium&id=${id}`}>
                  <Button size="icon" variant="secondary" className="w-9 h-9 bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Bot className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  size="icon" variant="secondary"
                  className="w-9 h-9 bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                  onClick={() => { if (confirm("Aquarium wirklich löschen?")) deleteMutation.mutate({ id }); }}
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
          <TabsTrigger value="events">Protokoll ({events?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          {/* Water Values */}
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Wasserwerte</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              <WaterParam label="pH-Wert" value={aquarium.phValue} unit="" />
              <WaterParam label="GH" value={aquarium.ghValue} unit="°dH" />
              <WaterParam label="KH" value={aquarium.khValue} unit="°dH" />
              <WaterParam label="Temperatur" value={aquarium.temperatureCelsius} unit="°C" />
              <WaterParam label="Nitrat" value={aquarium.nitrate} unit=" mg/L" />
              <WaterParam label="Nitrit" value={aquarium.nitrite} unit=" mg/L" />
              <WaterParam label="Ammoniak" value={aquarium.ammonia} unit=" mg/L" />
              <WaterParam label="Leitfähigkeit" value={aquarium.conductivity} unit=" µS" />
            </div>
            {!aquarium.phValue && !aquarium.temperatureCelsius && (
              <p className="text-sm text-muted-foreground text-center py-4">Noch keine Wasserwerte hinterlegt.</p>
            )}
          </div>

          {/* Setup */}
          {(aquarium.filterType || aquarium.lightingType || aquarium.substrate || aquarium.inhabitants || aquarium.plants) && (
            <div className="bg-card border border-border/50 rounded-xl p-5 space-y-3">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Ausstattung & Besatz</h2>
              {aquarium.filterType && (
                <div className="flex gap-2 text-sm"><span className="text-muted-foreground w-24 flex-shrink-0">Filter:</span><span>{aquarium.filterType}</span></div>
              )}
              {aquarium.lightingType && (
                <div className="flex gap-2 text-sm"><span className="text-muted-foreground w-24 flex-shrink-0">Beleuchtung:</span><span>{aquarium.lightingType}</span></div>
              )}
              {aquarium.substrate && (
                <div className="flex gap-2 text-sm"><span className="text-muted-foreground w-24 flex-shrink-0">Bodengrund:</span><span>{aquarium.substrate}</span></div>
              )}
              {aquarium.inhabitants && (
                <div className="flex gap-2 text-sm"><span className="text-muted-foreground w-24 flex-shrink-0">Besatz:</span><span>{aquarium.inhabitants}</span></div>
              )}
              {aquarium.plants && (
                <div className="flex gap-2 text-sm"><span className="text-muted-foreground w-24 flex-shrink-0">Pflanzen:</span><span>{aquarium.plants}</span></div>
              )}
            </div>
          )}

          {/* AI CTA */}
          <Link href={`/ai?context=aquarium&id=${id}`}>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 cursor-pointer hover:bg-primary/10 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">KI-Assistent fragen</p>
                  <p className="text-xs text-muted-foreground">Wasserwerte analysieren, Probleme diagnostizieren und mehr</p>
                </div>
              </div>
            </div>
          </Link>
        </TabsContent>

        <TabsContent value="photos" className="animate-fade-in">
          {isOwner && (
            <div className="mb-4">
              <ImageUpload
                onChange={(b64, mime) => addPhotoMutation.mutate({ aquariumId: id, base64: b64, mimeType: mime })}
                aspectRatio="landscape"
                placeholder="Foto zur Timeline hinzufügen"
                className="max-w-xs"
              />
            </div>
          )}
          {photos && photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="relative rounded-xl overflow-hidden bg-secondary aspect-video group">
                  <img src={photo.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
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

        <TabsContent value="events" className="animate-fade-in">
          {isOwner && (
            <div className="mb-4">
              {!showAddEvent ? (
                <Button size="sm" onClick={() => setShowAddEvent(true)} className="press-active">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Ereignis protokollieren
                </Button>
              ) : (
                <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Typ</Label>
                      <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(EVENT_LABELS).map(([v, l]) => (
                            <SelectItem key={v} value={v}>{EVENT_ICONS[v]} {l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Titel</Label>
                      <Input value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="z.B. 30% Wasserwechsel" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Notiz (optional)</Label>
                    <Textarea value={eventDesc} onChange={e => setEventDesc(e.target.value)} placeholder="Details..." className="min-h-[60px] resize-none" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowAddEvent(false)}>Abbrechen</Button>
                    <Button size="sm" disabled={!eventTitle.trim() || addEventMutation.isPending}
                      onClick={() => addEventMutation.mutate({ aquariumId: id, type: eventType as any, title: eventTitle.trim(), description: eventDesc.trim() || undefined })}
                      className="press-active"
                    >
                      Speichern
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {events && events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex gap-3 p-3 bg-card border border-border/50 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-lg flex-shrink-0">
                    {EVENT_ICONS[event.type] ?? "📝"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true, locale: de })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{EVENT_LABELS[event.type]}</p>
                    {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Noch keine Ereignisse protokolliert</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
