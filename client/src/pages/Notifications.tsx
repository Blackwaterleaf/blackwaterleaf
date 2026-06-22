import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Bell, CheckCheck, Heart, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  like: <Heart className="w-4 h-4 text-rose-400" />,
  comment: <MessageCircle className="w-4 h-4 text-blue-400" />,
  reminder: <Bell className="w-4 h-4 text-amber-400" />,
  system: <Bell className="w-4 h-4 text-primary" />,
};

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: notifications, isLoading } = trpc.notifications.list.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
      toast.success("Alle als gelesen markiert");
    },
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  return (
    <div className="container py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold">Benachrichtigungen</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">{unreadCount} ungelesen</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markReadMutation.mutate({})}
            disabled={markReadMutation.isPending}
            className="press-active"
          >
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Alle gelesen
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-4 bg-card border border-border/50 rounded-xl">
              <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Keine Benachrichtigungen</p>
          <p className="text-sm mt-1">Du bist auf dem neuesten Stand!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications?.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex gap-3 p-4 rounded-xl border transition-colors",
                notification.isRead
                  ? "bg-card border-border/30"
                  : "bg-primary/5 border-primary/20"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                notification.isRead ? "bg-secondary" : "bg-primary/10"
              )}>
                {NOTIFICATION_ICONS[notification.type] ?? <Bell className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", !notification.isRead && "text-foreground")}>
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: de })}
                </p>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
