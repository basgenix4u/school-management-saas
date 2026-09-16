import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-between">
          <Logo />
          <div className="flex gap-4 text-sm">
            <Link href="/login">Log in</Link>
            <Link href="/signup" className="btn btn-primary">Get started</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 pt-24 text-center">
        <h1 className="text-7xl font-semibold tracking-tighter">School management.<br />Reimagined.</h1>
        <p className="mt-6 text-2xl text-zinc-600">Simple. Modern. Built for real schools.</p>
        
        <div className="mt-10">
          <Link href="/signup" className="btn btn-primary px-10 py-4 text-lg">Start free trial</Link>
        </div>
      </div>
    </div>
  );
}
