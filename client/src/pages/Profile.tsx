import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Camera, Droplets, Leaf, MapPin, Pencil, Save, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ProfileProps { userId?: number; }

export default function Profile({ userId: _userId }: ProfileProps) {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  const { data: plants } = trpc.plants.myList.useQuery(undefined, { enabled: !!user });
  const { data: aquariums } = trpc.aquariums.myList.useQuery(undefined, { enabled: !!user });
  const { data: posts } = trpc.posts.list.useQuery({ userId: user?.id, limit: 20 }, { enabled: !!user });
  const { data: game } = trpc.gamification.me.useQuery(undefined, { enabled: !!user });

  const updateMutation = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      setEditing(false);
      toast.success("Profil aktualisiert!");
    },
    onError: () => toast.error("Fehler beim Speichern"),
  });

  const uploadAvatarMutation = trpc.users.uploadAvatar.useMutation({
    onSuccess: () => { utils.auth.me.invalidate(); toast.success("Avatar aktualisiert!"); },
    onError: () => toast.error("Fehler beim Hochladen"),
  });

  const startEditing = () => {
    setName(user?.name ?? "");
    setBio((user as any)?.bio ?? "");
    setLocation((user as any)?.location ?? "");
    setEditing(true);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max. 5 MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const base64 = result.split(",")[1];
      uploadAvatarMutation.mutate({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (loading) {
    return (
      <div className="container py-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container py-6 max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="bg-card border border-border/50 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-display">
                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Dein Name" className="font-semibold" />
                <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Über dich..." className="min-h-[60px] resize-none text-sm" />
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Standort" className="text-sm" />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                    <X className="w-3.5 h-3.5 mr-1" /> Abbrechen
                  </Button>
                  <Button size="sm" disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ name: name.trim() || undefined, bio: bio.trim() || undefined, location: location.trim() || undefined })}
                    className="press-active"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" /> Speichern
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-display font-semibold">{user.name ?? "Unbekannt"}</h1>
                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={startEditing}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {(user as any).bio && <p className="text-sm text-muted-foreground mb-2">{(user as any).bio}</p>}
                {(user as any).location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {(user as any).location}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-border/30">
          <div className="text-center">
            <p className="text-2xl font-display font-semibold">{plants?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Pflanzen</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display font-semibold">{aquariums?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Aquarien</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display font-semibold">{posts?.posts.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Beiträge</p>
          </div>
        </div>
      </div>

      {/* Gamification: Level, XP, Streak & Abzeichen */}
      {game?.stats && (
        <div className="bg-card border border-border/50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-primary mb-1">Level {game.level.level} · {game.level.title}</p>
              <p className="text-sm text-muted-foreground">{game.stats.xp} XP · {game.stats.streak} Tage Streak</p>
            </div>
            <Button asChild variant="outline" size="sm"><Link href="/ranking">Ranking</Link></Button>
          </div>
          {game.level.nextLevelXp != null && (
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-4">
              <div className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((game.stats.xp / game.level.nextLevelXp) * 100))}%` }} />
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Abzeichen ({game.badges.length})</p>
            {game.badges.length === 0 ? (
              <p className="text-xs text-muted-foreground/70">Noch keine Abzeichen – werde aktiv, um welche zu verdienen!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {game.badges.map((b: any) => (
                  <Badge key={b.id} variant="secondary" className="gap-1" title={b.description}>{b.name}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Tabs defaultValue="plants">
        <TabsList className="mb-4 bg-secondary/50">
          <TabsTrigger value="plants">Pflanzen</TabsTrigger>
          <TabsTrigger value="aquariums">Aquarien</TabsTrigger>
          <TabsTrigger value="posts">Beiträge</TabsTrigger>
        </TabsList>

        <TabsContent value="plants" className="animate-fade-in">
          {plants?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Leaf className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Noch keine Pflanzen</p>
              <Button asChild size="sm" className="mt-3 press-active">
                <Link href="/plants/new">Pflanze hinzufügen</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {plants?.map((plant) => (
                <Link key={plant.id} href={`/plants/${plant.id}`}>
                  <div className="bg-card border border-border/50 rounded-xl overflow-hidden hover-card cursor-pointer">
                    <div className="aspect-square bg-secondary relative">
                      {plant.coverImageUrl ? (
                        <img src={plant.coverImageUrl} alt={plant.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Leaf className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium truncate">{plant.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="aquariums" className="animate-fade-in">
          {aquariums?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Droplets className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Noch keine Aquarien</p>
              <Button asChild size="sm" className="mt-3 press-active">
                <Link href="/aquariums/new">Aquarium hinzufügen</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {aquariums?.map((aq) => (
                <Link key={aq.id} href={`/aquariums/${aq.id}`}>
                  <div className="bg-card border border-border/50 rounded-xl overflow-hidden hover-card cursor-pointer">
                    <div className="aspect-video bg-secondary relative">
                      {aq.coverImageUrl ? (
                        <img src={aq.coverImageUrl} alt={aq.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Droplets className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium truncate">{aq.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="animate-fade-in">
          {posts?.posts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-sm">Noch keine Beiträge</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts?.posts.map((post) => (
                <div key={post.id} className="bg-card border border-border/50 rounded-xl p-4">
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="" className="w-full max-h-48 object-cover rounded-lg mb-3" loading="lazy" />
                  )}
                  <p className="text-sm">{post.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>❤️ {post.likesCount}</span>
                    <span>💬 {post.commentsCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
