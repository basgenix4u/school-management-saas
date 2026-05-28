export type InvoiceStatus = "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";

export const financeMetrics = [
  { label: "Collected", value: "₦18.4M", change: "+₦1.8M today", tone: "emerald" },
  { label: "Outstanding", value: "₦6.4M", change: "42 invoices", tone: "amber" },
  { label: "Overdue Risk", value: "₦2.3M", change: "17 guardians", tone: "rose" },
  { label: "Collection Rate", value: "78%", change: "+9% vs last term", tone: "blue" },
];

export const invoices = [
  { id: "INV-2026-001", student: "Amina Yusuf", className: "SS2 Science", guardian: "Mr. Yusuf", amount: 145000, paid: 145000, status: "PAID" as InvoiceStatus, due: "2026-06-10", probability: 100, method: "Bank Transfer" },
  { id: "INV-2026-002", student: "Daniel Okoro", className: "JSS3 Gold", guardian: "Mrs. Okoro", amount: 120000, paid: 72000, status: "PARTIAL" as InvoiceStatus, due: "2026-06-12", probability: 82, method: "Paystack" },
  { id: "INV-2026-003", student: "Fatima Bello", className: "SS1 Arts", guardian: "Alh. Bello", amount: 135000, paid: 0, status: "OVERDUE" as InvoiceStatus, due: "2026-05-25", probability: 38, method: "Pending" },
  { id: "INV-2026-004", student: "Victor James", className: "Primary 5", guardian: "Mrs. James", amount: 90000, paid: 90000, status: "PAID" as InvoiceStatus, due: "2026-06-05", probability: 100, method: "POS" },
  { id: "INV-2026-005", student: "Zainab Musa", className: "JSS1 Blue", guardian: "Mrs. Musa", amount: 118000, paid: 86000, status: "PARTIAL" as InvoiceStatus, due: "2026-06-14", probability: 76, method: "Bank Transfer" },
  { id: "INV-2026-006", student: "Samuel Peter", className: "SS2 Science", guardian: "Mr. Peter", amount: 145000, paid: 0, status: "PENDING" as InvoiceStatus, due: "2026-06-18", probability: 64, method: "Pending" },
];

export const paymentTimeline = [
  { time: "08:45", title: "Payment received", detail: "Amina Yusuf invoice fully paid via bank transfer.", amount: "₦145,000" },
  { time: "09:20", title: "Partial payment", detail: "Daniel Okoro guardian paid 60% through Paystack.", amount: "₦72,000" },
  { time: "10:05", title: "Reminder sent", detail: "17 overdue guardians received personalized reminder messages.", amount: "17 sent" },
  { time: "11:40", title: "Reconciliation", detail: "12 bank transfers matched to invoices automatically.", amount: "12 matched" },
];

export const financeInsights = [
  { title: "High-value overdue invoice", detail: "Fatima Bello has a full unpaid invoice and high attendance risk. Finance and principal follow-up recommended.", action: "Escalate to accountant", severity: "High" },
  { title: "Likely payment window", detail: "Daniel Okoro's guardian usually completes payments within 48 hours after partial payment.", action: "Send gentle reminder", severity: "Medium" },
  { title: "Collection momentum strong", detail: "Today's payment flow is 18% above the average daily term collection rate.", action: "Maintain reminder cadence", severity: "Low" },
];

export const collectionForecast = [42, 48, 53, 61, 67, 72, 78, 83, 87, 91, 94, 97];

export function getInvoiceById(id: string) {
  return invoices.find((invoice) => invoice.id.toLowerCase() === id.toLowerCase());
}

export function getFinanceSummary() {
  const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paid = invoices.reduce((sum, invoice) => sum + invoice.paid, 0);
  const outstanding = total - paid;
  const overdue = invoices.filter((invoice) => invoice.status === "OVERDUE").reduce((sum, invoice) => sum + invoice.amount - invoice.paid, 0);
  return { total, paid, outstanding, overdue, collectionRate: Math.round((paid / total) * 100) };
}

export function currency(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}
