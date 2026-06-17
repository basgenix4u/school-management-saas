import { DashboardLayout } from "@/components/DashboardLayout";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Good morning</h1>
        <p className="text-xl text-zinc-600 mt-1">Brighton Academy • Today’s overview</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
          {[
            { label: "Students", value: "1,248" },
            { label: "Attendance", value: "94.8%" },
            { label: "Pending Fees", value: "₦4.2M" },
            { label: "Results Published", value: "87%" },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-zinc-200 p-6 rounded-3xl">
              <div className="text-sm text-zinc-500">{stat.label}</div>
              <div className="text-5xl font-semibold tracking-tighter mt-3">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
