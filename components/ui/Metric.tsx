import type { ReactNode } from "react";

export function MetricGrid({ children }: { children: ReactNode }) {
  return <div className="ui-metric-grid">{children}</div>;
}

export function Metric({ icon, label, value, caption }: { icon?: ReactNode; label: string; value: string; caption?: string }) {
  return (
    <article className="ui-metric">
      {icon ? <span className="ui-metric-icon">{icon}</span> : null}
      <p className="ui-metric-label">{label}</p>
      <p className="ui-metric-value">{value}</p>
      {caption ? <p className="ui-metric-caption">{caption}</p> : null}
    </article>
  );
}
