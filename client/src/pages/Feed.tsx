import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Seo } from "@/components/Seo";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import {
  Heart, ImagePlus, MessageCircle, MoreHorizontal,
  Send, Trash2, X, Leaf, Fish, HelpCircle, Lightbulb,
  Star, ShoppingBag, Grid3X3, Video, Users, Plus, Share2, Bookmark,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
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
  { value: "plant",       label: "Botanik",    icon: Leaf },
  { value: "aquarium",    label: "Aquarium",   icon: Fish },
  { value: "question",    label: "Frage",      icon: HelpCircle },
  { value: "tip",         label: "Tipp",       icon: Lightbulb },
  { value: "showcase",    label: "Showcase",   icon: Star },
  { value: "marketplace", label: "Marktplatz", icon: ShoppingBag },
  { value: "other",       label: "Sonstiges",  icon: Grid3X3 },
] as const;

const CAT_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  plant:       { bg: "rgba(45,155,110,0.12)", text: "#34D399", border: "rgba(45,155,110,0.25)" },
  aquarium:    { bg: "rgba(45,100,200,0.12)", text: "rgba(100,160,240,0.90)", border: "rgba(45,100,200,0.25)" },
  question:    { bg: "rgba(120,80,200,0.12)", text: "rgba(160,120,240,0.90)", border: "rgba(120,80,200,0.25)" },
  tip:         { bg: "rgba(212,175,55,0.12)",  text: "#D4AF37",              border: "rgba(212,175,55,0.25)" },
  showcase:    { bg: "rgba(200,60,80,0.12)",   text: "rgba(240,100,120,0.90)", border: "rgba(200,60,80,0.25)" },
  marketplace: { bg: "rgba(45,155,110,0.12)", text: "#34D399",              border: "rgba(45,155,110,0.25)" },
  other:       { bg: "rgba(45,107,63,0.35)",  text: "rgba(255,255,255,0.60)", border: "rgba(45,107,63,0.30)" },
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
    <motion.article
      className="overflow-hidden rounded-2xl anim-glass-reflex"
      style={{
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.4)",
      }}
      whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2" style={{ "--tw-ring-color": "rgba(45,155,110,0.20)" } as any}>
            <AvatarImage src={post.userAvatarUrl} />
            <AvatarFallback
              className="text-sm font-bold"
              style={{ background: "rgba(45,155,110,0.15)", color: "#34D399" }}
            >
              {post.userName?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold leading-none" style={{ color: "#FFFFFF" }}>
              {post.userName ?? "Unbekannt"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
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
                style={{ background: "rgba(13,17,14,0.90)", border: "1px solid rgba(45,107,63,0.30)" }}
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
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.82)" }}>
          {post.content}
        </p>
      </div>

      {/* ── Actions ── */}
      <div
        className="flex items-center gap-1 px-4 pb-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem" }}
      >
        {/* Like */}
        <motion.button
          onClick={handleLike}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
          style={{
            color: post.isLiked ? "rgba(240,80,80,0.95)" : "rgba(255,255,255,0.50)",
            background: post.isLiked ? "rgba(240,80,80,0.12)" : "transparent",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.88 }}
          transition={{ duration: 0.15 }}
        >
          <Heart className={cn("w-4 h-4", post.isLiked && "fill-current")} />
          <span className="text-xs">{post.likesCount}</span>
        </motion.button>

        {/* Kommentar */}
        <motion.button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
          style={{ color: showComments ? "#2D9B6E" : "rgba(255,255,255,0.50)" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.88 }}
          transition={{ duration: 0.15 }}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{post.commentsCount}</span>
        </motion.button>

        {/* Bookmark */}
        <motion.button
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.50)" }}
          whileHover={{ scale: 1.05, color: "#D4AF37" } as any}
          whileTap={{ scale: 0.88 }}
          transition={{ duration: 0.15 }}
          onClick={() => toast.info("Gespeichert – demnächst verfügbar")}
        >
          <Bookmark className="w-4 h-4" />
        </motion.button>

        <div className="flex-1" />

        {/* Teilen */}
        <motion.button
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.50)" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.88 }}
          transition={{ duration: 0.15 }}
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: "BlackwaterLeaf", text: post.content?.slice(0, 80) ?? "", url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link kopiert!");
            }
          }}
        >
          <Share2 className="w-4 h-4" />
          <span className="text-xs hidden sm:inline">Teilen</span>
        </motion.button>
      </div>

      {/* ── Comments ── */}
      {showComments && (
        <div className="px-5 pb-5 space-y-3" style={{ borderTop: "1px solid rgba(13,17,14,0.85)" }}>
          <div className="pt-3 space-y-3">
            {commentsData?.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarImage src={comment.userAvatarUrl ?? undefined} />
                  <AvatarFallback className="text-xs" style={{ background: "rgba(13,17,14,0.85)", color: "rgba(255,255,255,0.60)" }}>
                    {comment.userName?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 rounded-xl px-3 py-2" style={{ background: "rgba(13,17,14,0.90)" }}>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "rgba(255,255,255,0.80)" }}>
                    {comment.userName ?? "Unbekannt"}
                  </p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
          {user && (
            <div className="flex gap-2 pt-1">
              <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback className="text-xs" style={{ background: "rgba(45,155,110,0.15)", color: "#34D399" }}>
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
                    background: "rgba(13,17,14,0.90)",
                    border: "1px solid rgba(45,107,63,0.30)",
                    color: "rgba(255,255,255,0.88)",
                  }}
                  onFocus={e => { (e.target as HTMLElement).style.borderColor = "rgba(45,155,110,0.50)"; }}
                  onBlur={e => { (e.target as HTMLElement).style.borderColor = "rgba(45,107,63,0.30)"; }}
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
    </motion.article>
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
      style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }}
    >
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={user.avatarUrl ?? undefined} />
          <AvatarFallback
            className="text-sm font-bold"
            style={{ background: "rgba(45,155,110,0.15)", color: "#34D399" }}
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
            background: "rgba(13,17,14,0.90)",
            border: "1px solid rgba(45,107,63,0.30)",
            color: "rgba(255,255,255,0.88)",
          }}
        />
      </div>

      {imagePreview && (
        <div className="relative rounded-xl overflow-hidden ml-13">
          <img src={imagePreview} alt="Preview" className="max-h-56 w-auto rounded-xl" />
          <button
            onClick={() => { setImagePreview(null); setImageBase64(null); setImageMimeType(null); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "rgba(7,10,8,0.80)" }}
          >
            <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.90)" }} />
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
            style={{ background: "rgba(5,8,6,1)" }}
          />
          <div className="flex items-center gap-2 mt-2">
            <Video className="w-3.5 h-3.5" style={{ color: "#34D399" }} />
            <span className="text-xs truncate" style={{ color: "rgba(255,255,255,0.55)" }}>{videoName}</span>
          </div>
          <button
            onClick={() => { setVideoPreview(null); setVideoBase64(null); setVideoMimeType(null); setVideoName(null); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "rgba(7,10,8,0.80)" }}
          >
            <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.90)" }} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pl-13">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer"
              style={{ color: "rgba(255,255,255,0.55)", border: "1px solid rgba(45,107,63,0.30)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(45,107,63,0.30)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(45,107,63,0.30)";
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
              style={{ color: "rgba(255,255,255,0.55)", border: "1px solid rgba(45,107,63,0.30)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "#34D399";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(45,155,110,0.40)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(45,107,63,0.30)";
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
                background: "rgba(13,17,14,0.90)",
                border: "1px solid rgba(45,107,63,0.30)",
                color: "rgba(255,255,255,0.70)",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              style={{ background: "rgba(13,17,14,0.90)", border: "1px solid rgba(45,107,63,0.30)" }}
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

// Empfohlene Accounts Sektion (wie in Native App)
function FeaturedAccountsRow() {
  const { data: accounts } = trpc.featured.listCommunity.useQuery();
  if (!accounts || accounts.length === 0) return null;

  const PLATFORM_ICONS: Record<string, string> = {
    tiktok: "🎵",
    instagram: "📸",
    youtube: "▶️",
    facebook: "👤",
    whatsapp: "💬",
    website: "🌐",
  };

  return (
    <div className="mb-5">
      <p
        className="text-xs font-bold uppercase mb-3 flex items-center gap-1.5"
        style={{ color: "#34D399", letterSpacing: "0.14em" }}
      >
        EMPFOHLENE ACCOUNTS
        <span style={{ fontSize: "0.85em" }}>📣</span>
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {accounts.map((acc) => (
          <a
            key={acc.id}
            href={acc.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-28 rounded-2xl p-3 transition-all duration-150 active:scale-95"
            style={{
              background: "rgba(13,17,14,0.90)",
              border: "1px solid rgba(45,107,63,0.30)",
              textDecoration: "none",
            }}
          >
            {/* Avatar */}
            <div className="relative mb-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden mx-auto"
                style={{ background: "rgba(45,155,110,0.15)", border: "1px solid rgba(45,155,110,0.25)" }}
              >
                {acc.imageUrl ? (
                  <img src={acc.imageUrl} alt={acc.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold" style={{ color: "#34D399" }}>
                    {acc.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </span>
                )}
              </div>
              {/* Platform-Badge */}
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{ background: "#070A08", border: "1px solid rgba(45,107,63,0.30)" }}
              >
                {PLATFORM_ICONS[acc.platform ?? ""] ?? "🌐"}
              </div>
            </div>
            <p
              className="text-xs font-semibold text-center truncate"
              style={{ color: "rgba(255,255,255,0.88)" }}
            >
              {acc.name}
            </p>
            <p
              className="text-xs text-center mt-0.5 capitalize"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {acc.platform ?? ""}
            </p>
          </a>
        ))}
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
      <Seo
        title="Community Feed – Aquaristik & Botanik"
        path="/feed"
        description="Der BlackwaterLeaf Community Feed: Teile Fortschritte, Showcases und Fragen rund um Aquaristik, Aquascaping, Channa und Zimmerpflanzen – und lerne von Gleichgesinnten."
      />

      {/* ── Page Header (wie Native App) ── */}
      <div
        className="relative rounded-3xl overflow-hidden mb-5 px-5 py-5"
        style={{
          background: "linear-gradient(135deg, rgba(45,155,110,0.14) 0%, rgba(7,10,8,0.96) 100%)",
          border: "1px solid rgba(45,107,63,0.30)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Glow oben rechts */}
        <div
          className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
          style={{ background: "radial-gradient(circle at 80% 10%, rgba(52,211,153,0.12) 0%, transparent 65%)" }}
        />
        <p
          className="text-xs font-bold uppercase mb-1 relative flex items-center gap-1.5"
          style={{ color: "#34D399", letterSpacing: "0.16em" }}
        >
          <span className="w-1 h-1 rounded-full" style={{ background: "#34D399", display: "inline-block" }} />
          COMMUNITY
        </p>
        <div className="flex items-center justify-between relative">
          <h1
            className="font-brand leading-none"
            style={{ fontSize: "clamp(2rem, 7vw, 2.8rem)", color: "#FFFFFF", letterSpacing: "0.04em" }}
          >
            FEED
          </h1>
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95"
                style={{ background: "rgba(13,17,14,0.85)", border: "1px solid rgba(45,107,63,0.30)" }}
                onClick={() => toast.info("Mitglieder – demnächst verfügbar")}
              >
                <Users className="w-4 h-4" style={{ color: "rgba(255,255,255,0.65)" }} />
              </button>
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95"
                style={{ background: "rgba(13,17,14,0.85)", border: "1px solid rgba(45,107,63,0.30)" }}
                onClick={() => toast.info("Direktnachrichten – demnächst verfügbar")}
              >
                <MessageCircle className="w-4 h-4" style={{ color: "rgba(255,255,255,0.65)" }} />
              </button>
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95"
                style={{ background: "#2D9B6E", border: "none" }}
                onClick={() => {
                  const el = document.getElementById("create-post-area");
                  el?.scrollIntoView({ behavior: "smooth" });
                  el?.querySelector("textarea")?.focus();
                }}
              >
                <Plus className="w-4 h-4" style={{ color: "#070A08" }} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter Tabs als Pills (wie Native App) ── */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        {[{ value: "all", label: "Alle" }, ...CATEGORIES].map((cat) => {
          const isActive = filter === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 active:scale-95"
              style={{
                background: isActive ? "transparent" : "rgba(13,17,14,0.85)",
                color: isActive ? "#34D399" : "rgba(255,255,255,0.60)",
                border: isActive ? "2px solid #34D399" : "2px solid rgba(45,107,63,0.30)",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Empfohlene Accounts (wie Native App) ── */}
      <FeaturedAccountsRow />

      {/* ── Create Post ── */}
      {isAuthenticated && (
        <div id="create-post-area" className="mb-6">
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
              style={{ background: "#0D110E", border: "1px solid rgba(13,17,14,0.85)" }}
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
              style={{ background: "rgba(13,17,14,0.90)", border: "1px solid rgba(45,107,63,0.30)" }}
            >
              <MessageCircle className="w-7 h-7" style={{ color: "rgba(255,255,255,0.40)" }} />
            </div>
            <p className="font-semibold mb-1" style={{ color: "rgba(255,255,255,0.70)" }}>
              Noch keine Beiträge
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
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
