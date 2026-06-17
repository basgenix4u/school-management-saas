import { DashboardLayout } from "@/components/DashboardLayout";
import Link from "next/link";

const students = [
  { id: "1", name: "Aisha Bello", class: "JSS 2", admission: "EDU-2024-0842" },
  { id: "2", name: "Chinedu Okoro", class: "SSS 1", admission: "EDU-2023-1193" },
  { id: "3", name: "Fatima Yusuf", class: "JSS 3", admission: "EDU-2024-0567" },
];

export default function Students() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Students</h1>
            <p className="text-lg text-zinc-600">1,248 total</p>
          </div>
          <button className="btn btn-primary">+ Add Student</button>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-2">
          {students.map((student) => (
            <Link 
              href={`/dashboard/students/${student.id}`} 
              key={student.id}
              className="flex items-center justify-between px-6 py-5 hover:bg-zinc-50 rounded-2xl"
            >
              <div>
                <div className="font-semibold text-lg">{student.name}</div>
                <div className="text-sm text-zinc-500">{student.admission} • {student.class}</div>
              </div>
              <div className="text-zinc-400">→</div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
