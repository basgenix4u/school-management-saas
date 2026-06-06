import { InvoicePaymentDetail } from "@/components/finance/InvoicePaymentDetail";

export default async function InvoicePage({ params }: { params: Promise<{ invoice: string }> }) {
  const { invoice } = await params;
  return <InvoicePaymentDetail invoiceNo={invoice} />;
}
