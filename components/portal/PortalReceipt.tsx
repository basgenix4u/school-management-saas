"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Receipt } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ReceiptCard, type ReceiptView } from "@/components/receipts/ReceiptCard";
import { PortalTopbar } from "@/components/portal/PortalTopbar";

type ReceiptPayload = { status: string; receipt?: ReceiptView; message?: string };

export function PortalReceipt({ reference, from }: { reference: string; from: "parent" | "student" }) {
  const [receipt, setReceipt] = useState<ReceiptView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/receipts/${encodeURIComponent(reference)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as ReceiptPayload;
        if (cancelled) return;
        if (!response.ok || payload.status !== "ok" || !payload.receipt) {
          setError(payload.message ?? "This receipt could not be opened.");
          return;
        }
        setReceipt(payload.receipt);
      })
      .catch(() => {
        if (!cancelled) setError("The connection dropped before the receipt arrived.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reference]);

  const backHref = from === "student" ? "/portal/student" : "/portal/parent";
  const backLabel = from === "student" ? "Back to student portal" : "Back to parent portal";

  return (
    <main className="portal-shell">
      <div className="no-print"><PortalTopbar label="Payment receipt" homeHref={backHref} /></div>
      <p className="no-print"><Button variant="ghost" size="sm" href={backHref}><ArrowLeft size={16} /> {backLabel}</Button></p>

      {loading ? (
        <div className="ui-form" aria-label="Loading receipt">
          <Skeleton height="3rem" />
          <Skeleton height="12rem" />
        </div>
      ) : error || !receipt ? (
        <EmptyState
          icon={<Receipt size={22} />}
          title="Receipt unavailable"
          body={error ?? "No verified payment carries this reference."}
          action={<Button href={backHref}>{backLabel}</Button>}
        />
      ) : (
        <>
          <header className="page-head">
            <p className="page-eyebrow">{String(receipt.organization_name ?? "School receipt")}</p>
            <h1 className="page-title">Payment receipt.</h1>
            <p className="page-subtitle">
              Issued {receipt.issued_at ? formatDateTime(receipt.issued_at) : "—"} · keep this as proof of payment.
            </p>
          </header>
          <ReceiptCard receipt={receipt} />
          <Alert tone="success"><p>This receipt matches a verified payment in the school&apos;s records.</p></Alert>
        </>
      )}
    </main>
  );
}
