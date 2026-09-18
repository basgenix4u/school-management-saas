import { ArrowLeft, Receipt } from "lucide-react";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { getReceiptByReference } from "@/lib/supabase/school-data";
import { formatDateTime, formatNaira } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrintButton } from "@/components/ui/PrintButton";

/**
 * Official payment receipt.
 *
 * Rendered from the verified receipt record: amount, payer, invoice and
 * student as stored at payment time. Prints cleanly for guardians who need
 * a paper copy.
 */
export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const supabase = await requestClientOrNull();
  const receipt = supabase ? await getReceiptByReference(supabase, reference).catch(() => null) : null;

  if (!supabase) {
    return (
      <div className="page">
        <Alert tone="info"><p>Connect your database to load receipts.</p></Alert>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="page">
        <header className="page-head">
          <p className="page-eyebrow">Payment receipt</p>
          <h1 className="page-title">{reference}</h1>
        </header>
        <EmptyState
          icon={<Receipt size={22} />}
          title="Receipt not found"
          body="No verified payment carries this reference. Receipts appear here once a payment is confirmed."
          action={<Button href="/dashboard/fees">Back to finance</Button>}
        />
      </div>
    );
  }

  const rows: Array<[string, string]> = [
    ["Receipt number", String(receipt.receipt_no ?? "—")],
    ["Student", `${String(receipt.student_name ?? "—")} (${String(receipt.admission_no ?? "—")})`],
    ["Invoice", `${String(receipt.invoice_no ?? "—")} · ${String(receipt.invoice_title ?? "")}`.trim()],
    ["Amount received", formatNaira(receipt.amount)],
    ["Payer email", String(receipt.payer_email ?? "—")],
    ["Channel", String(receipt.provider ?? "—")],
    ["Reference", String(receipt.reference ?? "—")],
    ["Issued", formatDateTime(String(receipt.issued_at ?? ""))],
  ];

  return (
    <div className="page">
      <p className="no-print"><Button variant="ghost" size="sm" href="/dashboard/fees"><ArrowLeft size={16} /> Back to finance</Button></p>
      <header className="page-head">
        <p className="page-eyebrow">{String(receipt.organization_name ?? "School receipt")}</p>
        <h1 className="page-title">Payment receipt.</h1>
        <p className="page-subtitle">Issued {formatDateTime(String(receipt.issued_at ?? ""))} · keep this as proof of payment.</p>
      </header>

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
    </div>
  );
}
