import type { ReactNode } from "react";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

export function badgeClass(tone: BadgeTone = "neutral", extra = ""): string {
  return ["ui-badge", `ui-badge-${tone}`, extra].filter(Boolean).join(" ");
}

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={badgeClass(tone)}>{children}</span>;
}
