import { Heart, Leaf, ArrowRight, CheckCircle2, Globe2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/i18n";
import { trpc } from "@/lib/trpc";

const amounts = [5, 10, 25, 50] as const;

const copy = {
  de: { eyebrow: "NATURPROJEKT · DIREKT UNTERSTÜTZEN", title: "GEMEINSAM NATURWISSEN WEITERTRAGEN.", body: "Deine freiwillige Unterstützung finanziert Pflege, Quellenprüfung, Community-Funktionen und die unabhängige Weiterentwicklung von BlackWaterLeaf.", button: "MIT STRIPE UNTERSTÜTZEN", login: "SICHER ANMELDEN", success: "Danke für deine Unterstützung! Deine Spende wurde von Stripe bestätigt.", cancelled: "Die Zahlung wurde abgebrochen. Du kannst es jederzeit erneut versuchen.", currency: "EUR" },
  en: { eyebrow: "NATURE PROJECT · SUPPORT DIRECTLY", title: "HELP CARRY NATURE KNOWLEDGE FORWARD.", body: "Your voluntary support helps fund care tools, source review, community features and independent BlackWaterLeaf development.", button: "SUPPORT WITH STRIPE", login: "SIGN IN SECURELY", success: "Thank you for your support! Stripe confirmed your donation.", cancelled: "The payment was cancelled. You can try again at any time.", currency: "EUR" },
  "zh-CN": { eyebrow: "自然项目 · 直接支持", title: "一起让自然知识持续流动。", body: "你的自愿支持将帮助我们维护自然知识、来源审核、社区功能和 BlackWaterLeaf 的独立发展。", button: "使用 Stripe 支持", login: "安全登录", success: "感谢你的支持！Stripe 已确认你的捐赠。", cancelled: "付款已取消，你可以随时再次尝试。", currency: "EUR" },
  es: { eyebrow: "PROYECTO NATURAL · APOYA DIRECTAMENTE", title: "AYUDA A LLEVAR EL CONOCIMIENTO NATURAL MÁS LEJOS.", body: "Tu apoyo voluntario financia herramientas de cuidado, revisión de fuentes, comunidad y el desarrollo independiente.", button: "APOYAR CON STRIPE", login: "INICIAR SESIÓN", success: "¡Gracias por tu apoyo! Stripe confirmó tu donación.", cancelled: "El pago fue cancelado. Puedes intentarlo de nuevo cuando quieras.", currency: "EUR" },
  fr: { eyebrow: "PROJET NATURE · SOUTENIR DIRECTEMENT", title: "FAISONS GRANDIR LES CONNAISSANCES NATURALISTES.", body: "Votre soutien volontaire finance les outils, la vérification des sources, la communauté et le développement indépendant.", button: "SOUTENIR AVEC STRIPE", login: "SE CONNECTER", success: "Merci pour votre soutien ! Stripe a confirmé votre don.", cancelled: "Le paiement a été annulé. Vous pouvez réessayer à tout moment.", currency: "EUR" },
  it: { eyebrow: "PROGETTO NATURA · SOSTIENI DIRETTAMENTE", title: "PORTIAMO AVANTI LA CONOSCENZA DELLA NATURA.", body: "Il tuo sostegno volontario finanzia strumenti, fonti verificate, community e sviluppo indipendente.", button: "SOSTIENI CON STRIPE", login: "ACCEDI IN SICUREZZA", success: "Grazie per il sostegno! Stripe ha confermato la donazione.", cancelled: "Il pagamento è stato annullato. Puoi riprovare quando vuoi.", currency: "EUR" },
  "pt-BR": { eyebrow: "PROJETO NATUREZA · APOIE DIRETAMENTE", title: "AJUDE O CONHECIMENTO DA NATUREZA A AVANÇAR.", body: "Seu apoio voluntário ajuda a financiar ferramentas, fontes, comunidade e o desenvolvimento independente.", button: "APOIAR COM STRIPE", login: "ENTRAR COM SEGURANÇA", success: "Obrigado pelo apoio! O Stripe confirmou sua doação.", cancelled: "O pagamento foi cancelado. Você pode tentar novamente a qualquer momento.", currency: "EUR" },
  ja: { eyebrow: "自然プロジェクト · 直接支援", title: "自然の知識をともに未来へ。", body: "ご支援は、情報の確認、コミュニティ機能、BlackWaterLeaf の継続的な開発に活用されます。", button: "Stripe で支援", login: "安全にログイン", success: "ご支援ありがとうございます。Stripe が寄付を確認しました。", cancelled: "支払いはキャンセルされました。いつでも再試行できます。", currency: "EUR" },
  ko: { eyebrow: "자연 프로젝트 · 직접 후원", title: "자연 지식을 함께 이어갑니다.", body: "후원금은 출처 검증, 커뮤니티 기능과 BlackWaterLeaf의 독립적인 개발을 지원합니다.", button: "Stripe로 후원", login: "안전하게 로그인", success: "후원해 주셔서 감사합니다. Stripe가 기부를 확인했습니다.", cancelled: "결제가 취소되었습니다. 언제든 다시 시도할 수 있습니다.", currency: "EUR" },
  nl: { eyebrow: "NATUURPROJECT · DIRECT STEUNEN", title: "SAMEN NATUURKENNIS VERDER BRENGEN.", body: "Jouw vrijwillige bijdrage ondersteunt broncontrole, communityfuncties en onafhankelijke ontwikkeling.", button: "STEUNEN MET STRIPE", login: "VEILIG INLOGGEN", success: "Bedankt voor je steun! Stripe heeft je donatie bevestigd.", cancelled: "De betaling is geannuleerd. Probeer het gerust opnieuw.", currency: "EUR" },
  tr: { eyebrow: "DOĞA PROJESİ · DOĞRUDAN DESTEK", title: "DOĞA BİLGİSİNİ BİRLİKTE İLERİ TAŞIYALIM.", body: "Gönüllü desteğiniz kaynak doğrulama, topluluk özellikleri ve bağımsız geliştirmeyi destekler.", button: "STRIPE İLE DESTEKLE", login: "GÜVENLİ GİRİŞ", success: "Desteğiniz için teşekkürler! Stripe bağışınızı doğruladı.", cancelled: "Ödeme iptal edildi. İstediğiniz zaman tekrar deneyebilirsiniz.", currency: "EUR" },
  pl: { eyebrow: "PROJEKT NATURY · WESPRZYJ BEZPOŚREDNIO", title: "RAZEM ROZWIJAJMY WIEDZĘ O NATURZE.", body: "Dobrowolne wsparcie finansuje weryfikację źródeł, funkcje społeczności i niezależny rozwój.", button: "WESPRZYJ PRZEZ STRIPE", login: "BEZPIECZNE LOGOWANIE", success: "Dziękujemy za wsparcie! Stripe potwierdził darowiznę.", cancelled: "Płatność została anulowana. Możesz spróbować ponownie w dowolnym momencie.", currency: "EUR" },
  ar: { eyebrow: "مشروع الطبيعة · ادعمنا مباشرة", title: "معًا نحمل معرفة الطبيعة إلى الأمام.", body: "يساعد دعمك الطوعي في تمويل مراجعة المصادر وميزات المجتمع وتطوير BlackWaterLeaf المستقل.", button: "الدعم عبر Stripe", login: "تسجيل دخول آمن", success: "شكرًا لدعمك! أكد Stripe تبرعك.", cancelled: "تم إلغاء الدفع. يمكنك المحاولة مرة أخرى في أي وقت.", currency: "EUR" },
} as const;

export default function Support() {
  const { locale } = useI18n();
  const auth = useAuth();
  const [, setLocation] = useLocation();
  const t = copy[locale];
  const checkout = trpc.billing.createCheckout.useMutation({ onSuccess: result => window.open(result.url, "_blank", "noopener,noreferrer") });
  const params = new URLSearchParams(window.location.search);
  const confirmation = trpc.billing.donationConfirmation.useQuery({ sessionId: params.get("session_id") ?? "" }, { enabled: auth.isAuthenticated && params.get("checkout") === "success" && Boolean(params.get("session_id")), retry: false });
  const success = params.get("checkout") === "success" && confirmation.data?.paid;
  const cancelled = params.get("checkout") === "cancelled";
  const begin = (amount: number) => {
    if (!auth.isAuthenticated) { setLocation("/login?returnTo=/support"); return; }
    checkout.mutate({ kind: "donation", donationAmountEur: amount });
  };
  return <div className="observatory-route observatory-route--botany support-page">
    <section className="support-hero observatory-context-header">
      <div className="support-hero__icon"><Heart size={32} /></div>
      <p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.body}</p>
      <div className="support-hero__proof"><span><Leaf size={16} /> Naturwissen</span><span><Globe2 size={16} /> 13 Sprachen vorbereitet</span></div>
    </section>
    {success ? <div className="support-notice support-notice--success"><CheckCircle2 size={20} />{t.success}</div> : cancelled ? <div className="support-notice">{t.cancelled}</div> : null}
    <section className="support-card observatory-data-panel"><p className="eyebrow">{auth.isAuthenticated ? "BLACKWATERLEAF · STRIPE" : "BLACKWATERLEAF · MEMBER ACCESS"}</p><h2>{auth.isAuthenticated ? "WÄHLE DEINE UNTERSTÜTZUNG" : t.login}</h2><div className="support-amounts">{amounts.map(amount => <button key={amount} className="support-amount" disabled={checkout.isPending} onClick={() => begin(amount)}><strong>€{amount}</strong><span>{auth.isAuthenticated ? t.button : t.login}<ArrowRight size={15} /></span></button>)}</div><small className="support-card__note">Einmalige Zahlung · sicher verarbeitet durch Stripe · keine automatische Verlängerung</small></section>
    <Link href="/pro" className="section-link">{locale === "de" ? "KI-Credits und Pro ansehen" : "View AI credits and Pro"}<ArrowRight size={14} /></Link>
  </div>;
}
