import { PortalReceipt } from "@/components/portal/PortalReceipt";

export default async function PortalReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { reference } = await params;
  const { from } = await searchParams;
  return <PortalReceipt reference={reference} from={from === "student" ? "student" : "parent"} />;
}
