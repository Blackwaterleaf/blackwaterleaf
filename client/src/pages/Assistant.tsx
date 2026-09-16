import { StatePanel } from "@/components/StatePanel";
import { useI18n } from "@/i18n";
import { trpc } from "@/lib/trpc";
import { Bot, Leaf, LockKeyhole } from "lucide-react";

export default function Assistant() {
  const { t } = useI18n();
  const platform = trpc.platform.availability.useQuery(undefined, { retry: false });
  const statusCode = platform.isLoading ? "AI/CHECKING" : platform.isError ? "AI/STATUS_ERROR" : "AI/POLICY_LOCK";

  return (
    <div className="page-stack assistant-page">
      <section className="assistant-orbit bracket-panel">
        <div className="assistant-core" aria-hidden="true"><Leaf size={42} fill="currentColor" /><span /><span /></div>
        <p className="eyebrow">[{t("assistant.eyebrow")}]</p>
        <h1 className="glitch-title" data-text={t("assistant.title")}>{t("assistant.title")}</h1>
        <p>{t("assistant.body")}</p>
      </section>
      <StatePanel
        code={statusCode}
        state={platform.isLoading ? "loading" : platform.isError ? "error" : "locked"}
        title={t("assistant.rule")}
        body={t("assistant.body")}
        action={<button className="primary-action" type="button" disabled><LockKeyhole size={16} /> {t("common.notConnected")}</button>}
      />
      <div className="ai-context-grid">
        {["BOTANIK", "AQUARISTIK", "TERRARISTIK", "NATURWISSEN"].map(label => <div key={label} className="glass-panel"><Bot size={17} /><span>{label}</span><small>{t("common.notConnected")}</small></div>)}
      </div>
    </div>
  );
}
