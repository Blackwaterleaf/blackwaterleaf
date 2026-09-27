import { lazy, Suspense } from "react";
import type { StreamdownProps } from "streamdown";

const Streamdown = lazy(() => import("streamdown").then(module => ({ default: module.Streamdown })));

export function LazyStreamdown(props: StreamdownProps) {
  return <Suspense fallback={<span className="observatory-inline-state">MARKDOWN WIRD GELADEN …</span>}><Streamdown {...props} /></Suspense>;
}
