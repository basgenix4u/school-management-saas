import { DashboardLayout } from "@/components/DashboardLayout";
import Link from "next/link";

export default function StudentProfile({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <Link href="/dashboard/students" className="text-sm text-zinc-500 hover:text-zinc-700">← Back to Students</Link>

        <div className="mt-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-zinc-200" />
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Aisha Bello</h1>
            <p className="text-lg text-zinc-600">JSS 2 • EDU-2024-0842</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="card">
            <div className="text-sm text-zinc-500 mb-1">Attendance Rate</div>
            <div className="text-5xl font-semibold tracking-tighter">96%</div>
            <div className="text-emerald-600 text-sm mt-1">Excellent</div>
          </div>
          <div className="card">
            <div className="text-sm text-zinc-500 mb-1">Current Term Average</div>
            <div className="text-5xl font-semibold tracking-tighter">82.4</div>
            <div className="text-emerald-600 text-sm mt-1">+4.2 from last term</div>
          </div>
          <div className="card">
            <div className="text-sm text-zinc-500 mb-1">Fee Status</div>
            <div className="text-5xl font-semibold tracking-tighter">Paid</div>
            <div className="text-emerald-600 text-sm mt-1">Up to date</div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="font-semibold text-xl mb-4">Recent Activity</h3>
          <div className="card space-y-4 text-sm">
            <div className="flex justify-between py-1 border-b">
              <span>Marked present in Mathematics</span>
              <span className="text-zinc-500">Today</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Result published for English</span>
              <span className="text-zinc-500">2 days ago</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Invoice paid (Term 2)</span>
              <span className="text-zinc-500">Jan 12</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
