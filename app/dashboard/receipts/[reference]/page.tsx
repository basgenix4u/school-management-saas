import { ArrowLeft, Receipt } from "lucide-react";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { getReceiptByReference } from "@/lib/supabase/school-data";
import { formatDateTime } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReceiptCard } from "@/components/receipts/ReceiptCard";

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

  return (
    <div className="page">
      <p className="no-print"><Button variant="ghost" size="sm" href="/dashboard/fees"><ArrowLeft size={16} /> Back to finance</Button></p>
      <header className="page-head">
        <p className="page-eyebrow">{String(receipt.organization_name ?? "School receipt")}</p>
        <h1 className="page-title">Payment receipt.</h1>
        <p className="page-subtitle">Issued {receipt.issued_at ? formatDateTime(String(receipt.issued_at)) : "—"} · keep this as proof of payment.</p>
      </header>

      <ReceiptCard receipt={receipt} />
    </div>
  );
}
