import type { ReactNode } from "react";

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="ui-empty">
      {icon ? <span className="ui-empty-icon">{icon}</span> : null}
      <p className="ui-empty-title">{title}</p>
      {body ? <p className="ui-empty-body">{body}</p> : null}
      {action}
    </div>
  );
}
