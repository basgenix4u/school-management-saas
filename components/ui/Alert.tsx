import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from "lucide-react";
import type { ReactNode } from "react";

export type AlertTone = "info" | "success" | "warning" | "danger";

export function alertClass(tone: AlertTone = "info", extra = ""): string {
  return ["ui-alert", `ui-alert-${tone}`, extra].filter(Boolean).join(" ");
}

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: OctagonAlert,
} as const;

export function Alert({ tone = "info", children }: { tone?: AlertTone; children: ReactNode }) {
  const Icon = icons[tone];
  return (
    <div className={alertClass(tone)} role={tone === "danger" ? "alert" : "status"}>
      <Icon size={18} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
