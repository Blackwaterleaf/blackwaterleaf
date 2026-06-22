import { trpc } from "@/lib/trpc";
import { Compass, Droplets, Leaf, Search, TrendingUp, BookOpen, Target, Crown, ArrowRight, Clock } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
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

const card = {
  background: "oklch(0.12 0.008 200)",
  border: "1px solid oklch(0.20 0.008 200)",
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
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 lg:pb-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-brand text-4xl leading-none mb-4" style={{ color: "oklch(0.95 0.005 200)", letterSpacing: "0.04em" }}>
          ENTDECKEN
        </h1>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "oklch(0.45 0.008 200)" }} />
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Pflanzen, Aquarien oder Beiträge suchen..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-150"
            style={{
              background: "oklch(0.14 0.008 200)",
              border: "1px solid oklch(0.22 0.008 200)",
              color: "oklch(0.88 0.005 200)",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "oklch(0.52 0.14 148 / 0.50)")}
            onBlur={e => (e.currentTarget.style.borderColor = "oklch(0.22 0.008 200)")}
          />
        </div>
      </div>

      {/* Filter Tabs (only when searching) */}
      {isSearching && (
        <div className="flex gap-1 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setType(tab.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={{
                background: type === tab.value ? "oklch(0.52 0.14 148 / 0.15)" : "transparent",
                color: type === tab.value ? "oklch(0.65 0.16 148)" : "oklch(0.48 0.008 200)",
                border: type === tab.value ? "1px solid oklch(0.52 0.14 148 / 0.30)" : "1px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {!isSearching ? (
        <DiscoverHub hub={hub} loading={hubLoading} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={card}>
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={card}>
          <Compass className="w-10 h-10 mx-auto mb-3" style={{ color: "oklch(0.30 0.008 200)" }} />
          <p className="font-medium" style={{ color: "oklch(0.88 0.005 200)" }}>Keine Ergebnisse</p>
          <p className="text-sm mt-1" style={{ color: "oklch(0.48 0.008 200)" }}>Versuche andere Suchbegriffe</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Plants */}
          {(type === "all" || type === "plants") && data?.plants && data.plants.length > 0 && (
            <section>
              {type === "all" && (
                <h2 className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "oklch(0.52 0.14 148)" }}>
                  <Leaf className="w-3.5 h-3.5" /> Pflanzen
                </h2>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.plants.map((plant) => (
                  <Link key={plant.id} href={`/plants/${plant.id}`}>
                    <article className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200" style={card}
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
                        <div className="absolute top-2 left-2">
                          <span className="text-xs px-2 py-0.5 rounded-md backdrop-blur-sm" style={{ background: "oklch(0.52 0.14 148 / 0.18)", color: "oklch(0.72 0.16 148)", border: "1px solid oklch(0.52 0.14 148 / 0.25)" }}>
                            {CATEGORY_LABELS[plant.category] ?? plant.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-medium truncate" style={{ color: "oklch(0.88 0.005 200)" }}>{plant.name}</p>
                        {plant.scientificName && <p className="text-xs italic truncate" style={{ color: "oklch(0.48 0.008 200)" }}>{plant.scientificName}</p>}
                        {plant.userName && <p className="text-xs mt-1" style={{ color: "oklch(0.42 0.008 200)" }}>von {plant.userName}</p>}
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
                <h2 className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "oklch(0.55 0.14 220)" }}>
                  <Droplets className="w-3.5 h-3.5" /> Aquarien
                </h2>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.aquariums.map((aq) => (
                  <Link key={aq.id} href={`/aquariums/${aq.id}`}>
                    <article className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200" style={card}
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
                        {aq.volumeLiters && <p className="text-xs" style={{ color: "oklch(0.48 0.008 200)" }}>{aq.volumeLiters} L</p>}
                        {aq.userName && <p className="text-xs" style={{ color: "oklch(0.42 0.008 200)" }}>von {aq.userName}</p>}
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
                <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "oklch(0.65 0.14 78)" }}>Beiträge</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.posts.map((post) => (
                  <article key={post.id} className="rounded-2xl overflow-hidden" style={card}>
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="" className="w-full max-h-48 object-cover" loading="lazy" />
                    )}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={post.userAvatarUrl ?? undefined} />
                          <AvatarFallback className="text-xs" style={{ background: "oklch(0.52 0.14 148 / 0.15)", color: "oklch(0.65 0.16 148)" }}>
                            {post.userName?.charAt(0)?.toUpperCase() ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium" style={{ color: "oklch(0.80 0.005 200)" }}>{post.userName ?? "Unbekannt"}</span>
                        <span className="text-xs ml-auto" style={{ color: "oklch(0.42 0.008 200)" }}>
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: de })}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-3" style={{ color: "oklch(0.72 0.005 200)" }}>{post.content}</p>
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

function SectionTitle({ icon: Icon, iconColor, children, href }: { icon: React.ElementType; iconColor: string; children: React.ReactNode; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2" style={{ color: iconColor }}>
        <Icon className="w-3.5 h-3.5" /> {children}
      </h2>
      {href && (
        <Link href={href}>
          <span className="text-xs flex items-center gap-0.5 cursor-pointer transition-colors" style={{ color: "oklch(0.52 0.14 148)" }}>
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
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }
  if (!hub) return null;

  return (
    <div className="space-y-8">
      {/* Weekly challenge banner */}
      {hub.challenge && (
        <Link href="/ranking">
          <div
            className="rounded-2xl p-5 cursor-pointer transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, oklch(0.52 0.14 148 / 0.15), oklch(0.12 0.008 200))",
              border: "1px solid oklch(0.52 0.14 148 / 0.25)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.14 148 / 0.45)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.14 148 / 0.25)"; }}
          >
            <div className="flex items-center gap-2 mb-1.5" style={{ color: "oklch(0.65 0.16 148)" }}>
              <Target className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-widest">Wochen-Challenge</span>
            </div>
            <p className="font-brand text-xl tracking-wide" style={{ color: "oklch(0.92 0.005 200)" }}>{hub.challenge.title}</p>
            <p className="text-sm mt-1 line-clamp-2" style={{ color: "oklch(0.55 0.008 200)" }}>{hub.challenge.description}</p>
            <p className="text-xs mt-2" style={{ color: "oklch(0.65 0.16 148)" }}>Belohnung: +{hub.challenge.rewardXp} XP</p>
          </div>
        </Link>
      )}

      {/* Featured knowledge */}
      {hub.featuredArticles?.length > 0 && (
        <section>
          <SectionTitle icon={BookOpen} iconColor="oklch(0.65 0.16 148)" href="/knowledge">BlackwaterLeaf Wissen</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hub.featuredArticles.map((a: any) => (
              <Link key={a.id} href={`/knowledge/${a.slug}`}>
                <article
                  className="rounded-2xl p-4 cursor-pointer h-full transition-all duration-200"
                  style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.14 148 / 0.35)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.20 0.008 200)"; }}
                >
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-md mb-2 inline-block"
                    style={{ background: "oklch(0.52 0.14 148 / 0.15)", color: "oklch(0.65 0.16 148)", border: "1px solid oklch(0.52 0.14 148 / 0.25)" }}
                  >
                    {CATEGORY_LABELS_HUB[a.category] ?? a.category}
                  </span>
                  <p className="font-semibold leading-snug" style={{ color: "oklch(0.90 0.005 200)" }}>{a.title}</p>
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: "oklch(0.52 0.008 200)" }}>{a.excerpt}</p>
                  <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "oklch(0.42 0.008 200)" }}>
                    <Clock className="w-3 h-3" /> {a.readingMinutes} Min.
                  </p>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending posts */}
      {hub.trendingPosts?.length > 0 && (
        <section>
          <SectionTitle icon={TrendingUp} iconColor="oklch(0.65 0.14 25)" href="/feed">Trending Beiträge</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hub.trendingPosts.map((post: any) => (
              <Link key={post.id} href="/feed">
                <article
                  className="rounded-2xl overflow-hidden cursor-pointer h-full transition-all duration-200"
                  style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.14 148 / 0.35)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.20 0.008 200)"; }}
                >
                  {post.imageUrl && <img src={post.imageUrl} alt="" className="w-full max-h-40 object-cover" loading="lazy" />}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={post.userAvatarUrl ?? undefined} />
                        <AvatarFallback className="text-xs" style={{ background: "oklch(0.52 0.14 148 / 0.15)", color: "oklch(0.65 0.16 148)" }}>
                          {post.userName?.charAt(0)?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium" style={{ color: "oklch(0.80 0.005 200)" }}>{post.userName ?? "Mitglied"}</span>
                    </div>
                    <p className="text-sm line-clamp-2" style={{ color: "oklch(0.68 0.005 200)" }}>{post.content}</p>
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
          <SectionTitle icon={Leaf} iconColor="oklch(0.65 0.16 148)" href="/plants">Neue Pflanzen</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {hub.newPlants.map((plant: any) => (
              <Link key={plant.id} href={`/plants/${plant.id}`}>
                <article
                  className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
                  style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}
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
                    {plant.userName && <p className="text-xs mt-0.5" style={{ color: "oklch(0.42 0.008 200)" }}>von {plant.userName}</p>}
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
          <SectionTitle icon={Droplets} iconColor="oklch(0.60 0.14 220)" href="/aquariums">Neue Aquarien</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {hub.newAquariums.map((aq: any) => (
              <Link key={aq.id} href={`/aquariums/${aq.id}`}>
                <article
                  className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
                  style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}
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
                    {aq.volumeLiters && <p className="text-xs" style={{ color: "oklch(0.48 0.008 200)" }}>{aq.volumeLiters} L</p>}
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
          <SectionTitle icon={Crown} iconColor="oklch(0.72 0.16 78)" href="/ranking">Aktive Mitglieder</SectionTitle>
          <div className="rounded-2xl overflow-hidden" style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
            {hub.topMembers.map((m: any, idx: number) => (
              <div
                key={m.userId}
                className="flex items-center gap-3 p-3"
                style={{ borderBottom: idx < hub.topMembers.length - 1 ? "1px solid oklch(0.18 0.008 200)" : "none" }}
              >
                <span className="w-5 text-center text-sm font-bold" style={{ color: "oklch(0.38 0.008 200)" }}>{idx + 1}</span>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={m.userAvatarUrl ?? undefined} />
                  <AvatarFallback className="text-xs" style={{ background: "oklch(0.52 0.14 148 / 0.15)", color: "oklch(0.65 0.16 148)" }}>
                    {m.userName?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-medium truncate" style={{ color: "oklch(0.85 0.005 200)" }}>{m.userName ?? "Mitglied"}</span>
                <span className="text-xs" style={{ color: "oklch(0.45 0.008 200)" }}>Level {m.level}</span>
                <span className="text-sm font-bold" style={{ color: "oklch(0.65 0.16 148)" }}>{m.xp} XP</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
