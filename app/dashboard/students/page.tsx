import { DashboardLayout } from "@/components/DashboardLayout";
import Link from "next/link";

const students = [
  { id: "1", name: "Aisha Bello", class: "JSS 2", admissionNo: "EDU-2024-0842", status: "Active" },
  { id: "2", name: "Chinedu Okoro", class: "SSS 1", admissionNo: "EDU-2023-1193", status: "Active" },
  { id: "3", name: "Fatima Yusuf", class: "JSS 3", admissionNo: "EDU-2024-0567", status: "Active" },
  { id: "4", name: "Emmanuel Adebayo", class: "SSS 2", admissionNo: "EDU-2022-3011", status: "Active" },
];

export default function StudentsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Students</h1>
            <p className="text-lg text-zinc-600 mt-1">1,248 total students</p>
          </div>
          <button className="btn btn-primary">+ Add Student</button>
        </div>

        <div className="card">
          <div className="flex gap-4 mb-6">
            <input 
              type="text" 
              placeholder="Search students..." 
              className="flex-1 px-4 py-3 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:border-zinc-400" 
            />
            <select className="px-4 py-3 border border-zinc-200 rounded-2xl text-sm">
              <option>All Classes</option>
              <option>JSS 1</option>
              <option>JSS 2</option>
              <option>SSS 1</option>
            </select>
          </div>

          <div className="divide-y">
            {students.map((student) => (
              <Link 
                href={`/dashboard/students/${student.id}`} 
                key={student.id}
                className="flex items-center justify-between py-5 px-2 hover:bg-zinc-50 rounded-2xl group"
              >
                <div>
                  <div className="font-semibold text-lg tracking-tight">{student.name}</div>
                  <div className="text-sm text-zinc-500">{student.admissionNo} • {student.class}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                    {student.status}
                  </span>
                  <span className="text-zinc-400 group-hover:text-zinc-600">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
