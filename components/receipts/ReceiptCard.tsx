import { formatDateTime, formatNaira } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { PrintButton } from "@/components/ui/PrintButton";

export type ReceiptView = {
  organization_name?: string | null;
  receipt_no?: string | null;
  student_name?: string | null;
  admission_no?: string | null;
  invoice_no?: string | null;
  invoice_title?: string | null;
  amount?: string | number | null;
  payer_email?: string | null;
  provider?: string | null;
  reference?: string | null;
  issued_at?: string | null;
};

/**
 * Official payment receipt, shared by the finance desk and the portals.
 * Renders the verified record exactly as stored at payment time.
 */
export function ReceiptCard({ receipt }: { receipt: ReceiptView }) {
  const rows: Array<[string, string]> = [
    ["Receipt number", String(receipt.receipt_no ?? "—")],
    ["Student", `${String(receipt.student_name ?? "—")} (${String(receipt.admission_no ?? "—")})`],
    ["Invoice", `${String(receipt.invoice_no ?? "—")} · ${String(receipt.invoice_title ?? "")}`.trim()],
    ["Amount received", formatNaira(receipt.amount)],
    ["Payer email", String(receipt.payer_email ?? "—")],
    ["Channel", String(receipt.provider ?? "—")],
    ["Reference", String(receipt.reference ?? "—")],
    ["Issued", receipt.issued_at ? formatDateTime(receipt.issued_at) : "—"],
  ];

  return (
    <Card title={formatNaira(receipt.amount)} subtitle={`Received for ${String(receipt.student_name ?? "the student")}`}>
      <dl className="receipt-rows">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="no-print"><PrintButton /></p>
    </Card>
  );
}
