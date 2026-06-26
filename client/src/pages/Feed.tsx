import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import {
  Heart, ImagePlus, MessageCircle, MoreHorizontal,
  Send, Trash2, X, Leaf, Fish, HelpCircle, Lightbulb,
  Star, ShoppingBag, Grid3X3, Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  { value: "plant",       label: "Pflanze",    icon: Leaf },
  { value: "aquarium",    label: "Aquarium",   icon: Fish },
  { value: "question",    label: "Frage",      icon: HelpCircle },
  { value: "tip",         label: "Tipp",       icon: Lightbulb },
  { value: "showcase",    label: "Showcase",   icon: Star },
  { value: "marketplace", label: "Marktplatz", icon: ShoppingBag },
  { value: "other",       label: "Sonstiges",  icon: Grid3X3 },
] as const;

const CAT_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  plant:       { bg: "oklch(0.52 0.14 148 / 0.12)", text: "oklch(0.65 0.16 148)", border: "oklch(0.52 0.14 148 / 0.25)" },
  aquarium:    { bg: "oklch(0.52 0.14 220 / 0.12)", text: "oklch(0.65 0.14 220)", border: "oklch(0.52 0.14 220 / 0.25)" },
  question:    { bg: "oklch(0.55 0.14 280 / 0.12)", text: "oklch(0.68 0.14 280)", border: "oklch(0.55 0.14 280 / 0.25)" },
  tip:         { bg: "oklch(0.72 0.14 78 / 0.12)",  text: "oklch(0.78 0.14 78)",  border: "oklch(0.72 0.14 78 / 0.25)" },
  showcase:    { bg: "oklch(0.60 0.14 350 / 0.12)", text: "oklch(0.70 0.14 350)", border: "oklch(0.60 0.14 350 / 0.25)" },
  marketplace: { bg: "oklch(0.55 0.14 170 / 0.12)", text: "oklch(0.65 0.14 170)", border: "oklch(0.55 0.14 170 / 0.25)" },
  other:       { bg: "oklch(0.25 0.008 200)",        text: "oklch(0.60 0.008 200)", border: "oklch(0.30 0.008 200)" },
};

function CategoryBadge({ category }: { category: string }) {
  const style = CAT_STYLE[category] ?? CAT_STYLE.other;
  const cat = CATEGORIES.find(c => c.value === category);
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
      style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
    >
      {cat?.label ?? category}
    </span>
  );
}

function PostCard({ post, onDelete }: { post: any; onDelete: () => void }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const likeMutation = trpc.posts.like.useMutation({
    onSuccess: () => utils.posts.list.invalidate(),
  });
  const unlikeMutation = trpc.posts.unlike.useMutation({
    onSuccess: () => utils.posts.list.invalidate(),
  });
  const deleteMutation = trpc.posts.delete.useMutation({
    onSuccess: () => { onDelete(); toast.success("Beitrag gelöscht"); },
  });
  const addCommentMutation = trpc.posts.addComment.useMutation({
    onSuccess: () => {
      setCommentText("");
      utils.posts.getComments.invalidate({ postId: post.id });
      utils.posts.list.invalidate();
    },
  });

  const { data: commentsData } = trpc.posts.getComments.useQuery(
    { postId: post.id },
    { enabled: showComments }
  );

  const handleLike = () => {
    if (!user) { toast.error("Bitte anmelden"); return; }
    if (post.isLiked) unlikeMutation.mutate({ postId: post.id });
    else likeMutation.mutate({ postId: post.id });
  };

  return (
    <article
      className="overflow-hidden rounded-2xl transition-all duration-200"
      style={{
        background: "oklch(0.12 0.008 200)",
        border: "1px solid oklch(0.20 0.008 200)",
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2" style={{ "--tw-ring-color": "oklch(0.52 0.14 148 / 0.2)" } as any}>
            <AvatarImage src={post.userAvatarUrl} />
            <AvatarFallback
              className="text-sm font-bold"
              style={{ background: "oklch(0.52 0.14 148 / 0.15)", color: "oklch(0.65 0.16 148)" }}
            >
              {post.userName?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold leading-none" style={{ color: "oklch(0.92 0.005 200)" }}>
              {post.userName ?? "Unbekannt"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "oklch(0.48 0.008 200)" }}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: de })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CategoryBadge category={post.category} />
          {user?.id === post.userId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl"
                style={{ background: "oklch(0.14 0.008 200)", border: "1px solid oklch(0.22 0.008 200)" }}
              >
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => deleteMutation.mutate({ id: post.id })}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* ── Video (large, full width) ── */}
      {post.videoUrl && (
        <div className="relative w-full overflow-hidden bg-black" style={{ maxHeight: "600px" }}>
          <video
            src={post.videoUrl}
            controls
            playsInline
            preload="metadata"
            poster={post.imageUrl ?? undefined}
            className="w-full"
            style={{ maxHeight: "600px" }}
          />
        </div>
      )}

      {/* ── Image (large, full width) ── */}
      {post.imageUrl && !post.videoUrl && (
        <div className="relative w-full overflow-hidden" style={{ maxHeight: "520px" }}>
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full object-cover"
            style={{ maxHeight: "520px" }}
            loading="lazy"
          />
        </div>
      )}

      {/* ── Content ── */}
      <div className="px-5 py-4">
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "oklch(0.82 0.005 200)" }}>
          {post.content}
        </p>
      </div>

      {/* ── Actions ── */}
      <div
        className="flex items-center gap-1 px-5 pb-4"
        style={{ borderTop: "1px solid oklch(0.18 0.008 200)", paddingTop: "0.75rem" }}
      >
        <button
          onClick={handleLike}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95"
          style={{
            color: post.isLiked ? "oklch(0.70 0.18 15)" : "oklch(0.50 0.008 200)",
            background: post.isLiked ? "oklch(0.60 0.18 15 / 0.10)" : "transparent",
          }}
          onMouseEnter={e => {
            if (!post.isLiked) (e.currentTarget as HTMLElement).style.color = "oklch(0.70 0.18 15)";
          }}
          onMouseLeave={e => {
            if (!post.isLiked) (e.currentTarget as HTMLElement).style.color = "oklch(0.50 0.008 200)";
          }}
        >
          <Heart className={cn("w-4 h-4", post.isLiked && "fill-current")} />
          <span>{post.likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95"
          style={{ color: showComments ? "oklch(0.65 0.16 148)" : "oklch(0.50 0.008 200)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "oklch(0.65 0.16 148)"; }}
          onMouseLeave={e => {
            if (!showComments) (e.currentTarget as HTMLElement).style.color = "oklch(0.50 0.008 200)";
          }}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.commentsCount}</span>
        </button>
      </div>

      {/* ── Comments ── */}
      {showComments && (
        <div className="px-5 pb-5 space-y-3" style={{ borderTop: "1px solid oklch(0.16 0.008 200)" }}>
          <div className="pt-3 space-y-3">
            {commentsData?.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarImage src={comment.userAvatarUrl ?? undefined} />
                  <AvatarFallback className="text-xs" style={{ background: "oklch(0.18 0.008 200)", color: "oklch(0.60 0.008 200)" }}>
                    {comment.userName?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 rounded-xl px-3 py-2" style={{ background: "oklch(0.15 0.008 200)" }}>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "oklch(0.80 0.005 200)" }}>
                    {comment.userName ?? "Unbekannt"}
                  </p>
                  <p className="text-sm" style={{ color: "oklch(0.65 0.008 200)" }}>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
          {user && (
            <div className="flex gap-2 pt-1">
              <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback className="text-xs" style={{ background: "oklch(0.52 0.14 148 / 0.15)", color: "oklch(0.65 0.16 148)" }}>
                  {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Kommentar schreiben..."
                  className="flex-1 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                  style={{
                    background: "oklch(0.15 0.008 200)",
                    border: "1px solid oklch(0.22 0.008 200)",
                    color: "oklch(0.88 0.005 200)",
                  }}
                  onFocus={e => { (e.target as HTMLElement).style.borderColor = "oklch(0.52 0.14 148 / 0.5)"; }}
                  onBlur={e => { (e.target as HTMLElement).style.borderColor = "oklch(0.22 0.008 200)"; }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && commentText.trim()) {
                      e.preventDefault();
                      addCommentMutation.mutate({ postId: post.id, content: commentText.trim() });
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="w-9 h-9 flex-shrink-0 rounded-xl"
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                  onClick={() => {
                    if (commentText.trim()) {
                      addCommentMutation.mutate({ postId: post.id, content: commentText.trim() });
                    }
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function CreatePost() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const [videoMimeType, setVideoMimeType] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);

  const resetMedia = () => {
    setImagePreview(null); setImageBase64(null); setImageMimeType(null);
    setVideoPreview(null); setVideoBase64(null); setVideoMimeType(null); setVideoName(null);
  };

  const createMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      setContent(""); setCategory("other");
      resetMedia();
      utils.posts.list.invalidate();
      toast.success("Beitrag veröffentlicht!");
    },
    onError: (err) => toast.error(err.message || "Fehler beim Veröffentlichen"),
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Bild-Fehlerprüfung: Format & Größe
    const allowedImg = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    if (!allowedImg.includes(file.type)) {
      toast.error("Nicht unterstütztes Bildformat. Erlaubt: JPG, PNG, WebP, HEIC.");
      e.target.value = ""; return;
    }
    if (file.size > 10 * 1024 * 1024) { toast.error("Bild zu groß (max. 10 MB)"); e.target.value = ""; return; }
    // Auflösungs-Check (warnt bei sehr kleinen Bildern)
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const probe = new Image();
      probe.onload = () => {
        if (probe.width < 320 || probe.height < 320) {
          toast.warning("Bild hat eine niedrige Auflösung – für Showcase empfehlen wir mind. 1000px.");
        }
      };
      probe.src = result;
      setVideoPreview(null); setVideoBase64(null); setVideoMimeType(null); setVideoName(null);
      setImagePreview(result);
      setImageBase64(result.split(",")[1]);
      setImageMimeType(file.type);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Video-Fehlerprüfung: Format & Größe
    const allowedVid = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];
    if (!allowedVid.includes(file.type)) {
      toast.error("Nicht unterstütztes Videoformat. Erlaubt: MP4, WebM, MOV, OGG.");
      e.target.value = ""; return;
    }
    if (file.size > 25 * 1024 * 1024) { toast.error("Video zu groß (max. 25 MB). Für kurze Showcase-Clips ideal."); e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(null); setImageBase64(null); setImageMimeType(null);
      setVideoPreview(result);
      setVideoBase64(result.split(",")[1]);
      setVideoMimeType(file.type);
      setVideoName(file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (!user) return null;

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}
    >
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={user.avatarUrl ?? undefined} />
          <AvatarFallback
            className="text-sm font-bold"
            style={{ background: "oklch(0.52 0.14 148 / 0.15)", color: "oklch(0.65 0.16 148)" }}
          >
            {user.name?.charAt(0)?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Teile deine Fortschritte, Fragen oder Inspirationen..."
          className="flex-1 min-h-[80px] resize-none text-sm rounded-xl"
          style={{
            background: "oklch(0.15 0.008 200)",
            border: "1px solid oklch(0.22 0.008 200)",
            color: "oklch(0.88 0.005 200)",
          }}
        />
      </div>

      {imagePreview && (
        <div className="relative rounded-xl overflow-hidden ml-13">
          <img src={imagePreview} alt="Preview" className="max-h-56 w-auto rounded-xl" />
          <button
            onClick={() => { setImagePreview(null); setImageBase64(null); setImageMimeType(null); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.08 0.008 200 / 0.8)" }}
          >
            <X className="w-3.5 h-3.5" style={{ color: "oklch(0.90 0.005 200)" }} />
          </button>
        </div>
      )}

      {videoPreview && (
        <div className="relative rounded-xl overflow-hidden ml-13">
          <video
            src={videoPreview}
            controls
            playsInline
            className="max-h-72 w-full rounded-xl"
            style={{ background: "oklch(0.06 0.008 200)" }}
          />
          <div className="flex items-center gap-2 mt-2">
            <Video className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.16 148)" }} />
            <span className="text-xs truncate" style={{ color: "oklch(0.55 0.008 200)" }}>{videoName}</span>
          </div>
          <button
            onClick={() => { setVideoPreview(null); setVideoBase64(null); setVideoMimeType(null); setVideoName(null); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.08 0.008 200 / 0.8)" }}
          >
            <X className="w-3.5 h-3.5" style={{ color: "oklch(0.90 0.005 200)" }} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pl-13">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer"
              style={{ color: "oklch(0.55 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "oklch(0.75 0.008 200)";
                (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.30 0.008 200)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "oklch(0.55 0.008 200)";
                (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.20 0.008 200)";
              }}
            >
              <ImagePlus className="w-4 h-4" />
              <span className="hidden sm:inline">Foto</span>
            </div>
          </label>
          <label className="cursor-pointer">
            <input type="file" accept="video/mp4,video/webm,video/quicktime,video/ogg" className="hidden" onChange={handleVideoSelect} />
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer"
              style={{ color: "oklch(0.55 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "oklch(0.65 0.16 148)";
                (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.40 0.12 148)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "oklch(0.55 0.008 200)";
                (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.20 0.008 200)";
              }}
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Video</span>
            </div>
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              className="h-9 text-xs w-32 rounded-xl"
              style={{
                background: "oklch(0.15 0.008 200)",
                border: "1px solid oklch(0.22 0.008 200)",
                color: "oklch(0.70 0.008 200)",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              style={{ background: "oklch(0.14 0.008 200)", border: "1px solid oklch(0.22 0.008 200)" }}
            >
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          className="rounded-xl px-5"
          disabled={!content.trim() || createMutation.isPending}
          onClick={() => {
            if (content.trim()) {
              createMutation.mutate({
                content: content.trim(),
                category: category as any,
                imageBase64: imageBase64 ?? undefined,
                imageMimeType: imageMimeType ?? undefined,
                videoBase64: videoBase64 ?? undefined,
                videoMimeType: videoMimeType ?? undefined,
              });
            }
          }}
        >
          {createMutation.isPending ? "..." : "Teilen"}
        </Button>
      </div>
    </div>
  );
}

export default function Feed() {
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.posts.list.useQuery({
    limit: 30,
    category: filter !== "all" ? (filter as any) : undefined,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 lg:pb-8">

      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1
          className="font-brand text-4xl leading-none mb-1"
          style={{ color: "oklch(0.95 0.005 200)", letterSpacing: "0.04em" }}
        >
          COMMUNITY FEED
        </h1>
        <p className="text-sm" style={{ color: "oklch(0.50 0.008 200)" }}>
          Teile deine Leidenschaft mit der Community
        </p>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        {[{ value: "all", label: "Alle" }, ...CATEGORIES].map((cat) => {
          const isActive = filter === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 active:scale-95"
              style={{
                background: isActive ? "oklch(0.52 0.14 148 / 0.15)" : "oklch(0.14 0.008 200)",
                color: isActive ? "oklch(0.65 0.16 148)" : "oklch(0.55 0.008 200)",
                border: `1px solid ${isActive ? "oklch(0.52 0.14 148 / 0.35)" : "oklch(0.20 0.008 200)"}`,
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Create Post ── */}
      {isAuthenticated && (
        <div className="mb-6">
          <CreatePost />
        </div>
      )}

      {/* ── Posts ── */}
      <div className="space-y-5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.18 0.008 200)" }}
            >
              <div className="flex items-center gap-3 p-5">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
              <Skeleton className="h-64 w-full rounded-none" />
              <div className="p-5">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : data?.posts.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "oklch(0.14 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}
            >
              <MessageCircle className="w-7 h-7" style={{ color: "oklch(0.40 0.008 200)" }} />
            </div>
            <p className="font-semibold mb-1" style={{ color: "oklch(0.70 0.008 200)" }}>
              Noch keine Beiträge
            </p>
            <p className="text-sm" style={{ color: "oklch(0.45 0.008 200)" }}>
              Sei der Erste und teile deine Sammlung!
            </p>
          </div>
        ) : (
          data?.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={() => utils.posts.list.invalidate()}
            />
          ))
        )}
      </div>
    </div>
  );
}
