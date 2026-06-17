import { DashboardLayout } from "@/components/DashboardLayout";
import Link from "next/link";

export default function StudentProfile() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <Link href="/dashboard/students" className="text-sm text-zinc-500">← Back to Students</Link>

        <div className="mt-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-zinc-200" />
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Aisha Bello</h1>
            <p className="text-lg text-zinc-600">JSS 2 • EDU-2024-0842</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white border p-6 rounded-3xl">
            <div className="text-sm text-zinc-500">Attendance</div>
            <div className="text-5xl font-semibold tracking-tighter mt-2">96%</div>
          </div>
          <div className="bg-white border p-6 rounded-3xl">
            <div className="text-sm text-zinc-500">Average Score</div>
            <div className="text-5xl font-semibold tracking-tighter mt-2">82.4</div>
          </div>
          <div className="bg-white border p-6 rounded-3xl">
            <div className="text-sm text-zinc-500">Fee Status</div>
            <div className="text-5xl font-semibold tracking-tighter mt-2">Paid</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
