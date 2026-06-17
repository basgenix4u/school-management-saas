import Link from 'next/link';
import { Logo } from './Logo';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white p-6">
        <div className="mb-10">
          <Logo />
        </div>
        
        <nav className="space-y-1">
          <Link href="/dashboard" className="block px-4 py-3 rounded-xl hover:bg-zinc-100 font-medium">Overview</Link>
          <Link href="/dashboard/students" className="block px-4 py-3 rounded-xl hover:bg-zinc-100 font-medium">Students</Link>
          <Link href="/dashboard/attendance" className="block px-4 py-3 rounded-xl hover:bg-zinc-100 font-medium">Attendance</Link>
          <Link href="/dashboard/results" className="block px-4 py-3 rounded-xl hover:bg-zinc-100 font-medium">Results</Link>
          <Link href="/dashboard/fees" className="block px-4 py-3 rounded-xl hover:bg-zinc-100 font-medium">Fees</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}
