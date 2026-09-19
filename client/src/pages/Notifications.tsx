import { Bell, CheckCheck, ChevronRight, MessageCircle, ShieldAlert, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { StatePanel } from "@/components/StatePanel";
import { ObservatoryContextHeader, ObservatoryStateSurface } from "@/components/ObservatoryPrimitives";

function notificationIcon(type: string) {
  if (type.includes("comment")) return MessageCircle;
  if (type.includes("moderation") || type.includes("report")) return ShieldAlert;
  if (type.includes("ai") || type.includes("identification")) return Sparkles;
  return Bell;
}

function notificationTarget(postId: number | null, commentId: number | null) {
  if (postId) return `/community?post=${postId}${commentId ? `&comment=${commentId}` : ""}`;
  return "/community";
}

export default function Notifications() {
  const auth = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const feed = trpc.notifications.feed.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      void utils.notifications.feed.invalidate();
      void utils.notifications.unreadCount.invalidate();
    },
  });

  if (!auth.isAuthenticated) {
    return (
      <div className="observatory-route observatory-route--botany notification-page">
        <ObservatoryStateSurface tone="botany" code="NOTIFICATIONS / PRIVATE" title="DEINE BENACHRICHTIGUNGEN" body="Melde dich an, um Kommentare, Prüfhinweise und wichtige Ereignisse sicher zu sehen." action={<button type="button" className="primary-action" onClick={startLogin}>ANMELDEN</button>} />
      </div>
    );
  }

  const markAllRead = () => markRead.mutate({});

  return (
    <div className="observatory-route observatory-route--botany notification-page">
      <ObservatoryContextHeader tone="botany" eyebrow="PRIVATE / BENACHRICHTIGUNGEN" title="BENACHRICHTIGUNGEN" subtitle="Kommentare, Prüfhinweise und sichere Systemereignisse an einem Ort." icon={Bell} badge={`${feed.data?.filter(item => !item.isRead).length ?? 0} UNGELESEN`} children={<button type="button" className="secondary-action" onClick={markAllRead} disabled={markRead.isPending || !feed.data?.some(item => !item.isRead)}><CheckCheck size={16} /> ALLE GELESEN</button>} />

      {feed.isLoading ? <StatePanel code="NOTIFICATIONS / CONNECT" state="loading" title="Benachrichtigungen werden geladen" body="Dein privater Feed wird sicher abgefragt." /> : null}
      {feed.isError ? <StatePanel code="NOTIFICATIONS / ERROR" state="error" title="Benachrichtigungen nicht verfügbar" body="Es werden keine Ersatzdaten angezeigt. Bitte versuche es erneut." /> : null}
      {!feed.isLoading && !feed.isError && !feed.data?.length ? <ObservatoryStateSurface tone="botany" code="NOTIFICATIONS / EMPTY" title="NOCH KEINE BENACHRICHTIGUNGEN" body="Wenn jemand auf deine Beiträge antwortet oder eine Prüfung abgeschlossen wird, erscheint der Hinweis hier." action={<Link href="/community" className="primary-action">COMMUNITY ÖFFNEN</Link>} /> : null}
      {!feed.isLoading && !feed.isError && feed.data?.length ? (
        <section className="notification-list observatory-data-panel" aria-label="Private Benachrichtigungen">
          {feed.data.map(item => {
            const Icon = notificationIcon(item.type);
            const target = notificationTarget(item.postId, item.commentId);
            return (
              <article key={item.id} className={`notification-card ${item.isRead ? "is-read" : "is-unread"}`}>
                <button
                  type="button"
                  className="notification-card__main"
                  onClick={() => {
                    if (!item.isRead) markRead.mutate({ notificationId: item.id });
                    setLocation(target);
                  }}
                  aria-label={`${item.isRead ? "Gelesete" : "Ungelesene"} Benachrichtigung öffnen`}
                >
                  <span className="notification-card__icon" aria-hidden="true"><Icon size={18} /></span>
                  <span className="notification-card__copy">
                    <strong>{item.actorName}</strong>
                    <span>{item.message}</span>
                    <time dateTime={new Date(item.createdAt).toISOString()}>{new Date(item.createdAt).toLocaleString("de-DE")}</time>
                  </span>
                  {!item.isRead ? <span className="notification-card__dot" aria-label="Ungelesen" /> : null}
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}

export { notificationTarget };
      
