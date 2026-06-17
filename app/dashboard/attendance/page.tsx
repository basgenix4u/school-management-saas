import { DashboardLayout } from "@/components/DashboardLayout";

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight">Attendance</h1>
          <p className="text-lg text-zinc-600 mt-1">Today’s overview • 94.8% present</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Present Today", value: "1,182", sub: "94.8%" },
            { label: "Absent", value: "41", sub: "3.3%" },
            { label: "Late", value: "25", sub: "2.0%" },
          ].map((stat, i) => (
            <div key={i} className="card">
              <div className="text-sm text-zinc-500">{stat.label}</div>
              <div className="text-5xl font-semibold tracking-tighter mt-2">{stat.value}</div>
              <div className="text-emerald-600 text-sm mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>

        <a 
          href="/dashboard/attendance/mark" 
          className="inline-flex btn btn-primary"
        >
          Mark Today’s Attendance
        </a>
      </div>
    </DashboardLayout>
  );
}
