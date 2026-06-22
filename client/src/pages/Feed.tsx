import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import {
  Heart,
  ImagePlus,
  MessageCircle,
  MoreHorizontal,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { value: "plant", label: "Pflanze" },
  { value: "aquarium", label: "Aquarium" },
  { value: "question", label: "Frage" },
  { value: "tip", label: "Tipp" },
  { value: "showcase", label: "Showcase" },
  { value: "marketplace", label: "Marktplatz" },
  { value: "other", label: "Sonstiges" },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  plant: "badge-tropical",
  aquarium: "badge-aquatic",
  question: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  tip: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  showcase: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  marketplace: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  other: "badge-other",
};

function PostCard({ post, onDelete }: { post: any; onDelete: () => void }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const likeMutation = trpc.posts.like.useMutation({
    onMutate: () => utils.posts.list.invalidate(),
    onSuccess: () => utils.posts.list.invalidate(),
  });
  const unlikeMutation = trpc.posts.unlike.useMutation({
    onMutate: () => utils.posts.list.invalidate(),
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
    if (post.isLiked) {
      unlikeMutation.mutate({ postId: post.id });
    } else {
      likeMutation.mutate({ postId: post.id });
    }
  };

  return (
    <article className="bg-card border border-border/50 rounded-xl overflow-hidden animate-fade-in hover-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={post.userAvatarUrl} />
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {post.userName?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">{post.userName ?? "Unbekannt"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: de })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs border", CATEGORY_COLORS[post.category] ?? "badge-other")}>
            {CATEGORIES.find(c => c.value === post.category)?.label ?? post.category}
          </Badge>
          {user?.id === post.userId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-7 h-7">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
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

      {/* Image */}
      {post.imageUrl && (
        <div className="relative">
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full max-h-96 object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 pb-3 border-t border-border/30 pt-3">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 press-active",
            post.isLiked
              ? "text-rose-400 bg-rose-500/10"
              : "text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
          )}
        >
          <Heart className={cn("w-4 h-4", post.isLiked && "fill-current")} />
          <span>{post.likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150 press-active"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.commentsCount}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-border/30 px-4 py-3 space-y-3">
          {commentsData?.map((comment) => (
            <div key={comment.id} className="flex gap-2.5">
              <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarImage src={comment.userAvatarUrl ?? undefined} />
                <AvatarFallback className="bg-secondary text-xs">
                  {comment.userName?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-secondary/50 rounded-lg px-3 py-2">
                <p className="text-xs font-medium mb-0.5">{comment.userName ?? "Unbekannt"}</p>
                <p className="text-sm text-muted-foreground">{comment.content}</p>
              </div>
            </div>
          ))}
          {user && (
            <div className="flex gap-2">
              <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Kommentar schreiben..."
                  className="flex-1 bg-secondary/50 border border-border/50 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && commentText.trim()) {
                      e.preventDefault();
                      addCommentMutation.mutate({ postId: post.id, content: commentText.trim() });
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="w-8 h-8 flex-shrink-0"
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
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const createMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      setContent("");
      setCategory("other");
      setImagePreview(null);
      setImageBase64(null);
      utils.posts.list.invalidate();
      toast.success("Beitrag veröffentlicht!");
    },
    onError: () => toast.error("Fehler beim Veröffentlichen"),
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Max. 10 MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setImageBase64(result.split(",")[1]);
      setImageMimeType(file.type);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (!user) return null;

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
      <div className="flex gap-3">
        <Avatar className="w-9 h-9 flex-shrink-0">
          <AvatarImage src={user.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-primary/20 text-primary text-sm">
            {user.name?.charAt(0)?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Teile deine Fortschritte, Fragen oder Inspirationen..."
          className="flex-1 min-h-[80px] bg-secondary/50 border-border/50 resize-none text-sm"
        />
      </div>

      {imagePreview && (
        <div className="relative rounded-lg overflow-hidden ml-12">
          <img src={imagePreview} alt="Preview" className="max-h-48 w-auto rounded-lg" />
          <button
            onClick={() => { setImagePreview(null); setImageBase64(null); }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between ml-12">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <ImagePlus className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Foto</span>
            </div>
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-8 text-xs w-32 bg-secondary/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          disabled={!content.trim() || createMutation.isPending}
          onClick={() => {
            if (content.trim()) {
              createMutation.mutate({
                content: content.trim(),
                category: category as any,
                imageBase64: imageBase64 ?? undefined,
                imageMimeType: imageMimeType ?? undefined,
              });
            }
          }}
          className="press-active"
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
    <div className="container py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold">Community Feed</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {[{ value: "all", label: "Alle" }, ...CATEGORIES].map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 press-active",
              filter === cat.value
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Create Post */}
      {isAuthenticated && (
        <div className="mb-6">
          <CreatePost />
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))
        ) : data?.posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Noch keine Beiträge</p>
            <p className="text-sm mt-1">Sei der Erste und teile deine Sammlung!</p>
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
