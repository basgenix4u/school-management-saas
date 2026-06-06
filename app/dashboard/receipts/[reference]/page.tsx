import Link from "next/link";
import { ArrowLeft, Receipt } from "lucide-react";

export default async function ReceiptPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return (
    <div className="premium-dashboard">
      <Link className="back-link" href="/dashboard/fees"><ArrowLeft size={16} /> Back to finance</Link>
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker"><Receipt size={14} /> Payment Receipt</span>
        <h1>{reference}</h1>
        <p>If the payment has been verified, the receipt API will return the official receipt record.</p>
      </section>
      <section className="card premium-panel">
        <span className="premium-kicker">Receipt API</span>
        <h2>Receipt record</h2>
        <p className="muted-copy">Open <code>/api/receipts/{reference}</code> to retrieve the receipt record. A full printable receipt UI will be completed in the PDF/receipt batch.</p>
      </section>
    </div>
  );
}
