import { Bell, CheckCheck, ChevronRight, MessageCircle, ShieldAlert, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { StatePanel } from "@/components/StatePanel";

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
      <div className="reference-page reference-page--botany notification-page">
        <section className="reference-empty glass-panel" aria-labelledby="notification-login-title">
          <Bell size={28} aria-hidden="true" />
          <span className="eyebrow">NOTIFICATIONS / PRIVATE</span>
          <h1 id="notification-login-title">Deine Benachrichtigungen</h1>
          <p>Melde dich an, um Kommentare, Prüfhinweise und wichtige Ereignisse sicher zu sehen.</p>
          <button type="button" className="primary-action" onClick={startLogin}>ANMELDEN</button>
        </section>
      </div>
    );
  }

  const markAllRead = () => markRead.mutate({});

  return (
    <div className="reference-page reference-page--botany notification-page">
      <header className="notification-page__header">
        <div>
          <span className="eyebrow">PRIVATE / BENACHRICHTIGUNGEN</span>
          <h1>Benachrichtigungen</h1>
          <p>Kommentare, Prüfhinweise und sichere Systemereignisse an einem Ort.</p>
        </div>
        <button type="button" className="secondary-action" onClick={markAllRead} disabled={markRead.isPending || !feed.data?.some(item => !item.isRead)}>
          <CheckCheck size={16} /> ALLE GELESEN
        </button>
      </header>

      {feed.isLoading ? <StatePanel code="NOTIFICATIONS / CONNECT" state="loading" title="Benachrichtigungen werden geladen" body="Dein privater Feed wird sicher abgefragt." /> : null}
      {feed.isError ? <StatePanel code="NOTIFICATIONS / ERROR" state="error" title="Benachrichtigungen nicht verfügbar" body="Es werden keine Ersatzdaten angezeigt. Bitte versuche es erneut." /> : null}
      {!feed.isLoading && !feed.isError && !feed.data?.length ? (
        <section className="reference-empty glass-panel" aria-labelledby="notification-empty-title">
          <Bell size={28} aria-hidden="true" />
          <span className="eyebrow">NOTIFICATIONS / EMPTY</span>
          <h2 id="notification-empty-title">Noch keine Benachrichtigungen</h2>
          <p>Wenn jemand auf deine Beiträge antwortet oder eine Prüfung abgeschlossen wird, erscheint der Hinweis hier.</p>
          <Link href="/community" className="primary-action">COMMUNITY ÖFFNEN</Link>
        </section>
      ) : null}
      {!feed.isLoading && !feed.isError && feed.data?.length ? (
        <section className="notification-list" aria-label="Private Benachrichtigungen">
          {feed.data.map(item => {
            const Icon = notificationIcon(item.type);
            const target = notificationTarget(item.postId, item.commentId);
            return (
              <article key={item.id} className={`notification-card glass-panel ${item.isRead ? "is-read" : "is-unread"}`}>
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
      
