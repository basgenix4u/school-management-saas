import type { ReactNode } from "react";

export function Card({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="ui-card ui-card-pad">
      {title ? <h2 className="ui-card-title">{title}</h2> : null}
      {subtitle ? <p className="ui-card-subtitle">{subtitle}</p> : null}
      {children}
    </section>
  );
}
