import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  Camera, Droplets, Leaf, Pencil, Save, X, Award, Zap,
  Shield, ChevronRight, Star, TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeoEnhanced } from "@/components/SeoEnhanced";
import ReputationSystem from "@/components/ReputationSystem";

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
    onSuccess: () => {
      utils.auth.me.invalidate();
      utils.users.getProfile.invalidate();
      toast.success("Avatar aktualisiert!");
    },
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
      <div className="max-w-lg mx-auto px-4 py-8 pb-24 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Gamification-Werte
  const level = game?.level?.level ?? 0;
  const xp = game?.stats?.xp ?? 0;
  const streak = game?.stats?.streak ?? 0;
  const badgeCount = game?.badges?.length ?? 0;
  const levelTitle = game?.level?.title ?? "Einsteiger";

  // Interessen aus Bio extrahieren oder Standardwerte
  const interests = (display?.interests as string[] | undefined) ?? ["Botanik", "Aquaristik"];

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24 lg:pb-8">
      <SeoEnhanced
        title="Mein Profil"
        path="/profile"
        description="Dein persönliches BlackwaterLeaf-Profil: Pflanzensammlung, Aquarien, XP-Fortschritt und Community-Beiträge."
        noindex={true}
      />

      {/* ── Avatar & Name (zentriert wie Native App) ── */}
      <div className="flex flex-col items-center mb-8">
        {/* Avatar mit Kamera-Button */}
        <div className="relative mb-4">
          {editing ? (
            <label className="w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-95"
              style={{ background: "rgba(45,155,110,0.15)", border: "2px solid #2D9B6E" }}>
              <Camera className="w-8 h-8" style={{ color: "#34D399" }} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          ) : (
            <>
              <Avatar className="w-24 h-24" style={{ border: "2px solid rgba(45,155,110,0.40)" }}>
                <AvatarImage src={display?.avatarUrl ?? undefined} />
                <AvatarFallback className="text-3xl font-bold"
                  style={{ background: "rgba(45,155,110,0.15)", color: "#34D399" }}>
                  {display?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              {/* Kamera-Badge */}
              <label
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-95"
                style={{ background: "#2D9B6E", border: "2px solid #070A08" }}
              >
                <Camera className="w-4 h-4" style={{ color: "#070A08" }} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </>
          )}
        </div>

        {editing ? (
          /* Edit-Modus */
          <div className="w-full space-y-3">
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Dein Name"
              className="text-center font-brand text-xl"
              style={{ background: "rgba(13,17,14,0.90)", border: "1px solid rgba(45,107,63,0.30)", color: "rgba(255,255,255,0.88)" }}
            />
            <Textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Über dich..."
              className="min-h-[60px] resize-none text-sm text-center"
              style={{ background: "rgba(13,17,14,0.90)", border: "1px solid rgba(45,107,63,0.30)", color: "rgba(255,255,255,0.88)" }}
            />
            <Input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Standort (optional)"
              className="text-center text-sm"
              style={{ background: "rgba(13,17,14,0.90)", border: "1px solid rgba(45,107,63,0.30)", color: "rgba(255,255,255,0.88)" }}
            />
            <div className="flex gap-2 justify-center">
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                <X className="w-3.5 h-3.5 mr-1" /> Abbrechen
              </Button>
              <Button
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate({
                  name: name.trim() || undefined,
                  bio: bio.trim() || undefined,
                  location: location.trim() || undefined,
                })}
                style={{ background: "#2D9B6E", color: "#0D110E" }}
              >
                <Save className="w-3.5 h-3.5 mr-1" /> Speichern
              </Button>
            </div>
          </div>
        ) : (
          /* Anzeige-Modus (zentriert wie Native App) */
          <>
            {/* Name */}
            <div className="flex items-center gap-2 mb-1">
              <h1
                className="font-brand text-3xl tracking-wide"
                style={{ color: "#FFFFFF", letterSpacing: "0.06em" }}
              >
                {display?.name?.toUpperCase() ?? "PROFIL"}
              </h1>
              {display?.role === "moderator" && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(45,155,110,0.20)", border: "1px solid rgba(45,155,110,0.40)" }}>
                  <Shield className="w-3 h-3" style={{ color: "#2D9B6E" }} />
                  <span className="text-xs font-semibold" style={{ color: "#2D9B6E" }}>Mod</span>
                </div>
              )}
              {display?.role === "admin" && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(212,175,55,0.20)", border: "1px solid rgba(212,175,55,0.40)" }}>
                  <Award className="w-3 h-3" style={{ color: "#D4AF37" }} />
                  <span className="text-xs font-semibold" style={{ color: "#D4AF37" }}>Admin</span>
                </div>
              )}
            </div>

            {/* E-Mail */}
            <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.50)" }}>
              {display?.email ?? ""}
            </p>

            {/* Bio */}
            {display?.bio && (
              <p className="text-sm text-center mb-4 max-w-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                {display.bio}
              </p>
            )}

            {/* Profil bearbeiten Button (wie Native App) */}
            <button
              onClick={startEditing}
              className="px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-150 active:scale-95"
              style={{
                background: "transparent",
                border: "1.5px solid rgba(45,107,63,0.40)",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              Profil bearbeiten
            </button>
          </>
        )}
      </div>

      {/* ── 4 Stats-Karten (wie Native App: Level, XP, Streak, Abzeichen) ── */}
      <div className="grid grid-cols-4 gap-2.5 mb-5">
        {[
          { value: level, label: "Level", color: "#34D399", icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { value: xp, label: "XP", color: "#34D399", icon: <Zap className="w-3.5 h-3.5" /> },
          { value: streak, label: "Streak", color: "#34D399", icon: <Star className="w-3.5 h-3.5" /> },
          { value: badgeCount, label: "Abzeichen", color: "#34D399", icon: <Award className="w-3.5 h-3.5" /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-3 flex flex-col items-center justify-center"
            style={{ background: "rgba(13,17,14,0.90)", border: "1px solid rgba(45,107,63,0.30)" }}
          >
            <p
              className="text-2xl font-bold leading-none mb-1"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── "Dein Profil" Karte (wie Native App) ── */}
      <div
        className="rounded-2xl p-4 mb-5"
        style={{ background: "rgba(13,17,14,0.90)", border: "1px solid rgba(45,107,63,0.30)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.88)" }}>
              Dein Profil
            </p>
            <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.65)" }}>
              Level: <span className="font-semibold" style={{ color: "rgba(255,255,255,0.88)" }}>{levelTitle}</span>
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
              Interessen:{" "}
              <span className="font-semibold" style={{ color: "rgba(255,255,255,0.88)" }}>
                {interests.join(", ")}
              </span>
            </p>
          </div>
          <button
            onClick={startEditing}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-95"
            style={{ background: "rgba(13,17,14,0.85)", border: "1px solid rgba(45,107,63,0.35)" }}
          >
            <Pencil className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.60)" }} />
          </button>
        </div>
      </div>

      {/* ── "MEINE BEREICHE" Sektion (wie Native App) ── */}
      <div className="mb-6">
        <p
          className="text-xs font-bold uppercase mb-3"
          style={{ color: "rgba(255,255,255,0.50)", letterSpacing: "0.12em" }}
        >
          MEINE BEREICHE
        </p>
        <div className="space-y-2">
          {[
            { href: "/plants", icon: <Leaf className="w-5 h-5" style={{ color: "#34D399" }} />, label: "Meine Pflanzen", count: plants?.length },
            { href: "/aquariums", icon: <Droplets className="w-5 h-5" style={{ color: "rgba(100,160,240,0.90)" }} />, label: "Meine Aquarien", count: aquariums?.length },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-150 active:scale-[0.99]"
                style={{ background: "rgba(13,17,14,0.90)", border: "1px solid rgba(45,107,63,0.30)" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(45,155,110,0.12)" }}
                >
                  {item.icon}
                </div>
                <span className="flex-1 font-medium" style={{ color: "rgba(255,255,255,0.88)" }}>
                  {item.label}
                </span>
                {item.count !== undefined && (
                  <span className="text-sm mr-1" style={{ color: "rgba(255,255,255,0.50)" }}>
                    {item.count}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.40)" }} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Reputation System ── */}
      {game && (
        <ReputationSystem
          className="mb-6"
          reputation={{
            currentXp: xp,
            level: level,
            xpToNextLevel: Math.max(0, (game.level?.nextLevelXp ?? xp + 100) - xp),
            rank: levelTitle,
            expertiseRanks: [],
            badges: (game.badges ?? []).map((b: any) => ({
              id: String(b.id ?? b.code),
              name: b.name ?? b.code,
              description: b.description ?? "",
              icon: null,
              earnedAt: b.earnedAt ? new Date(b.earnedAt) : new Date(),
            })),
          }}
        />
      )}

      {/* ── Tabs: Sammlung & Beiträge ── */}
      <h2 className="font-brand text-xl mb-4" style={{ color: "rgba(255,255,255,0.90)", letterSpacing: "0.03em" }}>
        Sammlung &amp; Beiträge
      </h2>
      <Tabs defaultValue="plants">
        <TabsList className="mb-4 w-full" style={{ background: "rgba(13,17,14,0.90)", border: "1px solid rgba(45,107,63,0.30)" }}>
          <TabsTrigger value="plants" className="flex-1">Botanik</TabsTrigger>
          <TabsTrigger value="aquariums" className="flex-1">Aquarien</TabsTrigger>
          <TabsTrigger value="posts" className="flex-1">Beiträge</TabsTrigger>
        </TabsList>

        <TabsContent value="plants" className="animate-fade-in">
          {plants?.length === 0 ? (
            <div className="text-center py-10 rounded-2xl" style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }}>
              <Leaf className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(45,107,63,0.50)" }} />
              <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>Noch keine Pflanzen</p>
              <Button asChild size="sm" style={{ background: "#2D9B6E", color: "#0D110E" }}>
                <Link href="/plants/new">Pflanze hinzufügen</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {plants?.map((plant) => (
                <Link key={plant.id} href={`/plants/${plant.id}`}>
                  <div
                    className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
                    style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(45,155,110,0.35)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(45,107,63,0.30)"; }}
                  >
                    <div className="aspect-square relative overflow-hidden" style={{ background: "#070A08" }}>
                      {plant.coverImageUrl ? (
                        <img src={plant.coverImageUrl} alt={plant.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Leaf className="w-8 h-8" style={{ color: "rgba(45,107,63,0.35)" }} />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium truncate" style={{ color: "rgba(255,255,255,0.88)" }}>{plant.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="aquariums" className="animate-fade-in">
          {aquariums?.length === 0 ? (
            <div className="text-center py-10 rounded-2xl" style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }}>
              <Droplets className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(45,107,63,0.50)" }} />
              <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>Noch keine Aquarien</p>
              <Button asChild size="sm" style={{ background: "#2D9B6E", color: "#0D110E" }}>
                <Link href="/aquariums/new">Aquarium hinzufügen</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {aquariums?.map((aq) => (
                <Link key={aq.id} href={`/aquariums/${aq.id}`}>
                  <div
                    className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
                    style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(45,155,110,0.35)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(45,107,63,0.30)"; }}
                  >
                    <div className="aspect-video relative overflow-hidden" style={{ background: "#070A08" }}>
                      {aq.coverImageUrl ? (
                        <img src={aq.coverImageUrl} alt={aq.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Droplets className="w-8 h-8" style={{ color: "rgba(45,107,63,0.35)" }} />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium truncate" style={{ color: "rgba(255,255,255,0.88)" }}>{aq.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="animate-fade-in">
          {posts?.posts.length === 0 ? (
            <div className="text-center py-10 rounded-2xl" style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }}>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>Noch keine Beiträge</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts?.posts.map((post) => (
                <div key={post.id} className="rounded-2xl p-4" style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }}>
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="" className="w-full max-h-48 object-cover rounded-lg mb-3" loading="lazy" />
                  )}
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.72)" }}>{post.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
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
