import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Compass, Droplets, Leaf, Search, TrendingUp, BookOpen, Sparkles, Target, Crown, ArrowRight, Clock } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

const TABS = [
  { value: "all", label: "Alle" },
  { value: "plants", label: "Pflanzen" },
  { value: "aquariums", label: "Aquarien" },
  { value: "posts", label: "Beiträge" },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  aquatic: "Wasserpflanze", tropical: "Tropisch", alocasia: "Alocasia",
  monstera: "Monstera", philodendron: "Philodendron", other: "Sonstiges",
  freshwater: "Süßwasser", saltwater: "Salzwasser", blackwater: "Schwarzwasser",
  planted: "Pflanzenaquarium", biotope: "Biotop",
};

export default function Discover() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "plants" | "aquariums" | "posts">("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data, isLoading } = trpc.discover.search.useQuery(
    { query: debouncedQuery || undefined, type, limit: 24 },
    { staleTime: 30_000 }
  );

  const handleSearch = (value: string) => {
    setQuery(value);
    const timer = setTimeout(() => setDebouncedQuery(value), 400);
    return () => clearTimeout(timer);
  };

  const totalResults = (data?.plants.length ?? 0) + (data?.aquariums.length ?? 0) + (data?.posts.length ?? 0);
  const isSearching = debouncedQuery.trim().length > 0;
  const { data: hub, isLoading: hubLoading } = trpc.discover.hub.useQuery(undefined, { staleTime: 60_000 });

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold mb-4">Entdecken</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Pflanzen, Aquarien oder Beiträge suchen..."
            className="pl-10 bg-secondary/50 border-border/50"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={cn("flex gap-1 mb-6", !isSearching && "hidden")}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setType(tab.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 press-active",
              type === tab.value
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!isSearching ? (
        <DiscoverHub hub={hub} loading={hubLoading} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Compass className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Keine Ergebnisse</p>
          <p className="text-sm mt-1">Versuche andere Suchbegriffe</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Plants */}
          {(type === "all" || type === "plants") && data?.plants && data.plants.length > 0 && (
            <section>
              {type === "all" && (
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" /> Pflanzen
                </h2>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.plants.map((plant, i) => (
                  <Link key={plant.id} href={`/plants/${plant.id}`}>
                    <article className={cn("bg-card border border-border/50 rounded-xl overflow-hidden hover-card cursor-pointer animate-fade-in", `stagger-${Math.min(i + 1, 5)}`)}>
                      <div className="aspect-square bg-secondary relative">
                        {plant.coverImageUrl ? (
                          <img src={plant.coverImageUrl} alt={plant.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Leaf className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <Badge variant="outline" className={cn("text-xs border backdrop-blur-sm", `badge-${plant.category}`)}>
                            {CATEGORY_LABELS[plant.category] ?? plant.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-medium truncate">{plant.name}</p>
                        {plant.scientificName && <p className="text-xs text-muted-foreground italic truncate">{plant.scientificName}</p>}
                        {plant.userName && <p className="text-xs text-muted-foreground mt-1">von {plant.userName}</p>}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Aquariums */}
          {(type === "all" || type === "aquariums") && data?.aquariums && data.aquariums.length > 0 && (
            <section>
              {type === "all" && (
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" /> Aquarien
                </h2>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.aquariums.map((aq, i) => (
                  <Link key={aq.id} href={`/aquariums/${aq.id}`}>
                    <article className={cn("bg-card border border-border/50 rounded-xl overflow-hidden hover-card cursor-pointer animate-fade-in", `stagger-${Math.min(i + 1, 5)}`)}>
                      <div className="aspect-video bg-secondary relative">
                        {aq.coverImageUrl ? (
                          <img src={aq.coverImageUrl} alt={aq.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Droplets className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <Badge variant="outline" className={cn("text-xs border backdrop-blur-sm", `badge-${aq.type}`)}>
                            {CATEGORY_LABELS[aq.type] ?? aq.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-medium truncate">{aq.name}</p>
                        {aq.volumeLiters && <p className="text-xs text-muted-foreground">{aq.volumeLiters} L</p>}
                        {aq.userName && <p className="text-xs text-muted-foreground">von {aq.userName}</p>}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Posts */}
          {(type === "all" || type === "posts") && data?.posts && data.posts.length > 0 && (
            <section>
              {type === "all" && (
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Beiträge</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.posts.map((post, i) => (
                  <article key={post.id} className={cn("bg-card border border-border/50 rounded-xl overflow-hidden hover-card animate-fade-in", `stagger-${Math.min(i + 1, 5)}`)}>
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="" className="w-full max-h-48 object-cover" loading="lazy" />
                    )}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={post.userAvatarUrl ?? undefined} />
                          <AvatarFallback className="text-xs bg-secondary">
                            {post.userName?.charAt(0)?.toUpperCase() ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{post.userName ?? "Unbekannt"}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: de })}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-3">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>❤️ {post.likesCount}</span>
                        <span>💬 {post.commentsCount}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

const CATEGORY_LABELS_HUB: Record<string, string> = {
  aquaristik: "Aquaristik", aquascaping: "Aquascaping", channa: "Channa",
  blackwater: "Schwarzwasser", houseplants: "Zimmerpflanzen", basics: "Grundlagen",
};

function SectionTitle({ icon: Icon, color, children, href }: { icon: React.ElementType; color: string; children: React.ReactNode; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Icon className={cn("w-4 h-4", color)} /> {children}
      </h2>
      {href && (
        <Link href={href}>
          <span className="text-xs text-primary flex items-center gap-0.5 press-active cursor-pointer">
            Alle <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      )}
    </div>
  );
}

function DiscoverHub({ hub, loading }: { hub: any; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }
  if (!hub) return null;

  return (
    <div className="space-y-8">
      {/* Weekly challenge banner */}
      {hub.challenge && (
        <Link href="/ranking">
          <div className="bg-gradient-to-br from-primary/20 to-card border border-primary/20 rounded-xl p-5 hover-card cursor-pointer">
            <div className="flex items-center gap-2 mb-1.5 text-primary">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Wochen-Challenge</span>
            </div>
            <p className="font-display font-semibold text-lg">{hub.challenge.title}</p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{hub.challenge.description}</p>
            <p className="text-xs text-primary mt-2">Belohnung: +{hub.challenge.rewardXp} XP</p>
          </div>
        </Link>
      )}

      {/* Featured knowledge */}
      {hub.featuredArticles?.length > 0 && (
        <section>
          <SectionTitle icon={BookOpen} color="text-primary" href="/knowledge">BlackwaterLeaf Wissen</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hub.featuredArticles.map((a: any) => (
              <Link key={a.id} href={`/knowledge/${a.slug}`}>
                <article className="bg-card border border-border/50 rounded-xl p-4 hover-card cursor-pointer h-full">
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10 mb-2">
                    {CATEGORY_LABELS_HUB[a.category] ?? a.category}
                  </Badge>
                  <p className="font-display font-semibold leading-snug">{a.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.excerpt}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Clock className="w-3 h-3" /> {a.readingMinutes} Min.</p>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending posts */}
      {hub.trendingPosts?.length > 0 && (
        <section>
          <SectionTitle icon={TrendingUp} color="text-rose-400" href="/feed">Trending Beiträge</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hub.trendingPosts.map((post: any) => (
              <Link key={post.id} href="/feed">
                <article className="bg-card border border-border/50 rounded-xl overflow-hidden hover-card cursor-pointer h-full">
                  {post.imageUrl && <img src={post.imageUrl} alt="" className="w-full max-h-40 object-cover" loading="lazy" />}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={post.userAvatarUrl ?? undefined} />
                        <AvatarFallback className="text-xs bg-secondary">{post.userName?.charAt(0)?.toUpperCase() ?? "U"}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{post.userName ?? "Mitglied"}</span>
                    </div>
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>❤️ {post.likesCount}</span>
                      <span>💬 {post.commentsCount}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New plants */}
      {hub.newPlants?.length > 0 && (
        <section>
          <SectionTitle icon={Leaf} color="text-emerald-400" href="/plants">Neue Pflanzen</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {hub.newPlants.map((plant: any) => (
              <Link key={plant.id} href={`/plants/${plant.id}`}>
                <article className="bg-card border border-border/50 rounded-xl overflow-hidden hover-card cursor-pointer">
                  <div className="aspect-square bg-secondary relative">
                    {plant.coverImageUrl ? (
                      <img src={plant.coverImageUrl} alt={plant.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center"><Leaf className="w-8 h-8 text-muted-foreground/30" /></div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium truncate">{plant.name}</p>
                    {plant.userName && <p className="text-xs text-muted-foreground mt-0.5">von {plant.userName}</p>}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New aquariums */}
      {hub.newAquariums?.length > 0 && (
        <section>
          <SectionTitle icon={Droplets} color="text-cyan-400" href="/aquariums">Neue Aquarien</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {hub.newAquariums.map((aq: any) => (
              <Link key={aq.id} href={`/aquariums/${aq.id}`}>
                <article className="bg-card border border-border/50 rounded-xl overflow-hidden hover-card cursor-pointer">
                  <div className="aspect-video bg-secondary relative">
                    {aq.coverImageUrl ? (
                      <img src={aq.coverImageUrl} alt={aq.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center"><Droplets className="w-8 h-8 text-muted-foreground/30" /></div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium truncate">{aq.name}</p>
                    {aq.volumeLiters && <p className="text-xs text-muted-foreground">{aq.volumeLiters} L</p>}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top members */}
      {hub.topMembers?.length > 0 && (
        <section>
          <SectionTitle icon={Crown} color="text-amber-400" href="/ranking">Aktive Mitglieder</SectionTitle>
          <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40">
            {hub.topMembers.map((m: any, idx: number) => (
              <div key={m.userId} className="flex items-center gap-3 p-3">
                <span className="w-5 text-center text-sm text-muted-foreground">{idx + 1}</span>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={m.userAvatarUrl ?? undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">{m.userName?.charAt(0)?.toUpperCase() ?? "U"}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-medium truncate">{m.userName ?? "Mitglied"}</span>
                <span className="text-xs text-muted-foreground">Level {m.level}</span>
                <span className="text-sm font-semibold text-primary">{m.xp} XP</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
