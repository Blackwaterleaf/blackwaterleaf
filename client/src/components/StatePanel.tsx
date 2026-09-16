import { AlertTriangle, LoaderCircle, RadioTower } from "lucide-react";
import React from "react";

type StatePanelProps = {
  code: string;
  title: string;
  body: string;
  state?: "empty" | "loading" | "error" | "locked";
  action?: React.ReactNode;
};

export function StatePanel({ code, title, body, state = "empty", action }: StatePanelProps) {
  const Icon = state === "loading" ? LoaderCircle : state === "error" ? AlertTriangle : RadioTower;
  return (
    <section className={`state-panel state-${state}`} role={state === "error" ? "alert" : "status"}>
      <span className="corner corner-top" aria-hidden="true" />
      <span className="corner corner-bottom" aria-hidden="true" />
      <div className="state-code"><Icon size={15} className={state === "loading" ? "spin" : ""} /> [{code}]</div>
      <h2>{title}</h2>
      <p>{body}</p>
      {action ? <div className="state-action">{action}</div> : null}
    </section>
  );
}
