import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Camera, Droplets, Leaf, MapPin, Pencil, Save, X, Award, Zap, Shield } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileProps { userId?: number; }

export default function Profile({ userId: _userId }: ProfileProps) {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  const { data: profile } = trpc.users.getProfile.useQuery({}, { enabled: !!user });
  const { data: plants } = trpc.plants.myList.useQuery(undefined, { enabled: !!user });
  const { data: aquariums } = trpc.aquariums.myList.useQuery(undefined, { enabled: !!user });
  const { data: posts } = trpc.posts.list.useQuery({ userId: user?.id, limit: 20 }, { enabled: !!user });
  const { data: game } = trpc.gamification.me.useQuery(undefined, { enabled: !!user });

  const display = (profile ?? user) as any;

  const updateMutation = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      utils.users.getProfile.invalidate();
      setEditing(false);
      toast.success("Profil aktualisiert!");
    },
    onError: (e) => toast.error(e.message || "Fehler beim Speichern"),
  });

  const uploadAvatarMutation = trpc.users.uploadAvatar.useMutation({
    onSuccess: () => { utils.auth.me.invalidate(); utils.users.getProfile.invalidate(); toast.success("Avatar aktualisiert!"); },
    onError: (e) => toast.error(e.message || "Fehler beim Hochladen"),
  });

  const startEditing = () => {
    setName(display?.name ?? "");
    setBio(display?.bio ?? "");
    setLocation(display?.location ?? "");
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
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-8 space-y-6">
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
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Profile Header */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-20 h-20 border-2" style={{ borderColor: "oklch(0.52 0.14 148)" }}>
              <AvatarImage src={display?.avatarUrl ?? undefined} />
              <AvatarFallback className="text-2xl font-bold" style={{ background: "oklch(0.52 0.14 148 / 0.15)", color: "oklch(0.65 0.16 148)" }}>
                {display?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150" style={{ background: "oklch(0.52 0.14 148)" }}>
              <Camera className="w-3.5 h-3.5" style={{ color: "oklch(0.12 0.008 200)" }} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Dein Name" className="font-semibold" style={{ background: "oklch(0.14 0.008 200)", border: "1px solid oklch(0.22 0.008 200)", color: "oklch(0.88 0.005 200)" }} />
                <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Über dich..." className="min-h-[60px] resize-none text-sm" style={{ background: "oklch(0.14 0.008 200)", border: "1px solid oklch(0.22 0.008 200)", color: "oklch(0.88 0.005 200)" }} />
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Standort" className="text-sm" style={{ background: "oklch(0.14 0.008 200)", border: "1px solid oklch(0.22 0.008 200)", color: "oklch(0.88 0.005 200)" }} />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                    <X className="w-3.5 h-3.5 mr-1" /> Abbrechen
                  </Button>
                  <Button size="sm" disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ name: name.trim() || undefined, bio: bio.trim() || undefined, location: location.trim() || undefined })}
                    style={{ background: "oklch(0.52 0.14 148)", color: "oklch(0.12 0.008 200)" }}
                  >
                    <Save className="w-3.5 h-3.5 mr-1" /> Speichern
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-brand text-2xl" style={{ color: "oklch(0.90 0.005 200)" }}>{display?.name ?? "Unbekannt"}</h1>
                  {display?.role === "moderator" && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: "oklch(0.52 0.14 148 / 0.2)", border: "1px solid oklch(0.52 0.14 148 / 0.4)" }}>
                      <Shield className="w-3.5 h-3.5" style={{ color: "oklch(0.52 0.14 148)" }} />
                      <span className="text-xs font-semibold" style={{ color: "oklch(0.52 0.14 148)" }}>Moderator</span>
                    </div>
                  )}
                  {display?.role === "admin" && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: "oklch(0.65 0.16 40 / 0.2)", border: "1px solid oklch(0.65 0.16 40 / 0.4)" }}>
                      <Award className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.16 40)" }} />
                      <span className="text-xs font-semibold" style={{ color: "oklch(0.65 0.16 40)" }}>Admin</span>
                    </div>
                  )}
                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={startEditing}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {display?.bio && <p className="text-sm mb-2" style={{ color: "oklch(0.55 0.008 200)" }}>{display.bio}</p>}
                {display?.location && (
                  <p className="text-xs flex items-center gap-1" style={{ color: "oklch(0.48 0.008 200)" }}>
                    <MapPin className="w-3 h-3" /> {display.location}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-5" style={{ borderTop: "1px solid oklch(0.18 0.008 200)" }}>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: "oklch(0.88 0.005 200)" }}>{plants?.length ?? 0}</p>
            <p className="text-xs mt-1" style={{ color: "oklch(0.48 0.008 200)" }}>Pflanzen</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: "oklch(0.88 0.005 200)" }}>{aquariums?.length ?? 0}</p>
            <p className="text-xs mt-1" style={{ color: "oklch(0.48 0.008 200)" }}>Aquarien</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: "oklch(0.88 0.005 200)" }}>{posts?.posts.length ?? 0}</p>
            <p className="text-xs mt-1" style={{ color: "oklch(0.48 0.008 200)" }}>Beiträge</p>
          </div>
        </div>
      </div>

      {/* Gamification: Level, XP, Streak & Abzeichen */}
      {game?.stats && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
          <h2 className="font-brand text-lg mb-4" style={{ color: "oklch(0.90 0.005 200)" }}>Fortschritt &amp; Abzeichen</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: "oklch(0.65 0.16 148)" }}>
                <Zap className="w-3.5 h-3.5 inline mr-1" /> Level {game.level.level} · {game.level.title}
              </p>
              <p className="text-sm" style={{ color: "oklch(0.55 0.008 200)" }}>{game.stats.xp} XP · {game.stats.streak} Tage Streak</p>
            </div>
            <Button asChild size="sm" style={{ background: "oklch(0.52 0.14 148)", color: "oklch(0.12 0.008 200)" }}>
              <Link href="/ranking">Ranking</Link>
            </Button>
          </div>
          {game.level.nextLevelXp != null && (
            <div className="w-full h-2 rounded-full overflow-hidden mb-4" style={{ background: "oklch(0.14 0.008 200)" }}>
              <div className="h-full rounded-full transition-all"
                style={{ background: "oklch(0.52 0.14 148)", width: `${Math.min(100, Math.round((game.stats.xp / game.level.nextLevelXp) * 100))}%` }} />
            </div>
          )}
          <div>
            <p className="text-xs mb-2 flex items-center gap-1" style={{ color: "oklch(0.48 0.008 200)" }}>
              <Award className="w-3.5 h-3.5" /> Abzeichen ({game.badges.length})
            </p>
            {game.badges.length === 0 ? (
              <p className="text-xs" style={{ color: "oklch(0.38 0.008 200)" }}>Noch keine Abzeichen – werde aktiv, um welche zu verdienen!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {game.badges.map((b: any) => (
                  <span key={b.id} className="text-xs px-2 py-1 rounded-md" style={{ background: "oklch(0.52 0.14 148 / 0.15)", color: "oklch(0.65 0.16 148)", border: "1px solid oklch(0.52 0.14 148 / 0.25)" }} title={b.description}>
                    {b.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <h2 className="font-brand text-xl mb-4" style={{ color: "oklch(0.90 0.005 200)", letterSpacing: "0.03em" }}>
        Sammlung &amp; Beiträge
      </h2>
      <Tabs defaultValue="plants">
        <TabsList className="mb-4 w-full" style={{ background: "oklch(0.14 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
          <TabsTrigger value="plants" className="flex-1">Pflanzen</TabsTrigger>
          <TabsTrigger value="aquariums" className="flex-1">Aquarien</TabsTrigger>
          <TabsTrigger value="posts" className="flex-1">Beiträge</TabsTrigger>
        </TabsList>

        <TabsContent value="plants" className="animate-fade-in">
          {plants?.length === 0 ? (
            <div className="text-center py-10 rounded-2xl" style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
              <Leaf className="w-8 h-8 mx-auto mb-2" style={{ color: "oklch(0.30 0.008 200)" }} />
              <p className="text-sm" style={{ color: "oklch(0.55 0.008 200)" }}>Noch keine Pflanzen</p>
              <Button asChild size="sm" className="mt-3" style={{ background: "oklch(0.52 0.14 148)", color: "oklch(0.12 0.008 200)" }}>
                <Link href="/plants/new">Pflanze hinzufügen</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {plants?.map((plant) => (
                <Link key={plant.id} href={`/plants/${plant.id}`}>
                  <div className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200" style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.14 148 / 0.35)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.20 0.008 200)"; }}
                  >
                    <div className="aspect-square relative overflow-hidden" style={{ background: "oklch(0.10 0.008 200)" }}>
                      {plant.coverImageUrl ? (
                        <img src={plant.coverImageUrl} alt={plant.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Leaf className="w-8 h-8" style={{ color: "oklch(0.25 0.008 200)" }} />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium truncate" style={{ color: "oklch(0.88 0.005 200)" }}>{plant.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="aquariums" className="animate-fade-in">
          {aquariums?.length === 0 ? (
            <div className="text-center py-10 rounded-2xl" style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
              <Droplets className="w-8 h-8 mx-auto mb-2" style={{ color: "oklch(0.30 0.008 200)" }} />
              <p className="text-sm" style={{ color: "oklch(0.55 0.008 200)" }}>Noch keine Aquarien</p>
              <Button asChild size="sm" className="mt-3" style={{ background: "oklch(0.52 0.14 148)", color: "oklch(0.12 0.008 200)" }}>
                <Link href="/aquariums/new">Aquarium hinzufügen</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {aquariums?.map((aq) => (
                <Link key={aq.id} href={`/aquariums/${aq.id}`}>
                  <div className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200" style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.14 148 / 0.35)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.20 0.008 200)"; }}
                  >
                    <div className="aspect-video relative overflow-hidden" style={{ background: "oklch(0.10 0.008 200)" }}>
                      {aq.coverImageUrl ? (
                        <img src={aq.coverImageUrl} alt={aq.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Droplets className="w-8 h-8" style={{ color: "oklch(0.25 0.008 200)" }} />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium truncate" style={{ color: "oklch(0.88 0.005 200)" }}>{aq.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="animate-fade-in">
          {posts?.posts.length === 0 ? (
            <div className="text-center py-10 rounded-2xl" style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
              <p className="text-sm" style={{ color: "oklch(0.55 0.008 200)" }}>Noch keine Beiträge</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts?.posts.map((post) => (
                <div key={post.id} className="rounded-2xl p-4" style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="" className="w-full max-h-48 object-cover rounded-lg mb-3" loading="lazy" />
                  )}
                  <p className="text-sm" style={{ color: "oklch(0.72 0.005 200)" }}>{post.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "oklch(0.48 0.008 200)" }}>
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

