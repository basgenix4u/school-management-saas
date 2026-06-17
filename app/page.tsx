import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login">Log in</Link>
            <Link href="/signup" className="btn btn-primary">Start free trial</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 pt-20 text-center">
        <h1 className="text-7xl font-semibold tracking-tighter">School management.<br />Reimagined.</h1>
        <p className="mt-6 text-2xl text-zinc-600">The modern platform schools actually enjoy using.</p>
        
        <div className="mt-10">
          <Link href="/signup" className="btn btn-primary px-8 py-4 text-lg">Start 14-day free trial</Link>
        </div>
      </div>
    </div>
  );
}
