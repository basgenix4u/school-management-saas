import type { ReactNode } from "react";

export function Table({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <div className="ui-table-wrap">
      <table className="ui-table">
        {caption ? <caption>{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}
