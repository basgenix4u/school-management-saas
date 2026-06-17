import { DashboardLayout } from "@/components/DashboardLayout";

export default function DashboardOverview() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight">Good morning, Abdulbasit</h1>
          <p className="text-xl text-zinc-600 mt-1">Here's what's happening at Brighton Academy today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Students", value: "1,248", change: "+12 this week" },
            { label: "Today's Attendance", value: "94.8%", change: "↑ 2.3%" },
            { label: "Pending Fees", value: "₦4.2M", change: "42 invoices" },
            { label: "Results Published", value: "87%", change: "This term" },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-zinc-100 p-6 rounded-3xl">
              <div className="text-sm text-zinc-500">{stat.label}</div>
              <div className="text-5xl font-semibold tracking-tighter mt-3">{stat.value}</div>
              <div className="text-emerald-600 text-sm mt-1">{stat.change}</div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="font-semibold mb-4 text-lg">Quick Actions</h3>
          <div className="flex gap-4">
            <a href="/dashboard/attendance/mark" className="px-6 py-3 rounded-2xl bg-white border text-sm font-medium hover:bg-zinc-50">Mark Attendance</a>
            <a href="/dashboard/results/entry" className="px-6 py-3 rounded-2xl bg-white border text-sm font-medium hover:bg-zinc-50">Enter Results</a>
            <a href="/dashboard/fees/invoices" className="px-6 py-3 rounded-2xl bg-white border text-sm font-medium hover:bg-zinc-50">Create Invoice</a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
