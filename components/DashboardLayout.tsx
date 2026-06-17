'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { 
  Users, Calendar, Award, CreditCard, BarChart3, 
  Settings, LogOut 
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: BarChart3 },
  { href: '/dashboard/students', label: 'Students', icon: Users },
  { href: '/dashboard/attendance', label: 'Attendance', icon: Calendar },
  { href: '/dashboard/results', label: 'Results', icon: Award },
  { href: '/dashboard/fees', label: 'Fees', icon: CreditCard },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-zinc-50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white flex flex-col">
        <div className="h-20 flex items-center px-8 border-b">
          <Logo />
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 transition-colors"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Link 
            href="/dashboard/settings" 
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl hover:bg-zinc-100 text-zinc-700"
          >
            <Settings size={18} /> Settings
          </Link>
          <button 
            onClick={() => alert('Logged out (demo)')}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl hover:bg-zinc-100 text-zinc-700 mt-1"
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-20 border-b bg-white px-8 flex items-center justify-between">
          <div className="text-sm text-zinc-500">Welcome back, Abdulbasit</div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">Brighton Academy</div>
            <div className="w-9 h-9 rounded-full bg-zinc-200" />
          </div>
        </header>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
