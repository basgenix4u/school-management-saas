import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ReportCardPreview } from "@/components/results/ReportCardPreview";
import { getStudentResult } from "@/lib/results-center";

export default async function ReportCardPage({ params }: { params: Promise<{ student: string }> }) {
  const { student: slug } = await params;
  const student = getStudentResult(slug);
  if (!student) notFound();
  return (
    <div className="premium-dashboard">
      <Link className="back-link" href="/dashboard/results"><ArrowLeft size={16} /> Back to results</Link>
      <ReportCardPreview student={student} />
    </div>
  );
}
