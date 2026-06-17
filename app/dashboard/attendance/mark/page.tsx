import { DashboardLayout } from "@/components/DashboardLayout";

const students = [
  { id: 1, name: "Aisha Bello", class: "JSS 2A" },
  { id: 2, name: "Chinedu Okoro", class: "JSS 2A" },
  { id: 3, name: "Fatima Yusuf", class: "JSS 2A" },
  { id: 4, name: "Emmanuel Adebayo", class: "JSS 2A" },
];

export default function MarkAttendance() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Mark Attendance</h1>
        <p className="text-zinc-600 mb-8">JSS 2A • Today</p>

        <div className="card divide-y">
          {students.map((student) => (
            <div key={student.id} className="flex items-center justify-between py-5 px-2">
              <div>
                <div className="font-medium">{student.name}</div>
                <div className="text-sm text-zinc-500">{student.class}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-5 py-2 text-sm rounded-xl bg-emerald-100 text-emerald-700 font-medium">Present</button>
                <button className="px-5 py-2 text-sm rounded-xl border">Absent</button>
                <button className="px-5 py-2 text-sm rounded-xl border">Late</button>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-8 btn btn-primary w-full">Save Attendance</button>
      </div>
    </DashboardLayout>
  );
}
