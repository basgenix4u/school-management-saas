import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-zinc-950">
      {/* Navbar */}
      <nav className="border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-zinc-600">Features</a>
            <a href="#pricing" className="hover:text-zinc-600">Pricing</a>
            <Link href="/login" className="hover:text-zinc-600">Log in</Link>
            <Link 
              href="/signup" 
              className="bg-zinc-950 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-black transition-colors"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-zinc-100 text-sm mb-6">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Trusted by 240+ schools
        </div>

        <h1 className="text-7xl font-semibold tracking-[-3.2px] leading-none mb-6">
          School management.<br />Reimagined.
        </h1>
        <p className="max-w-lg mx-auto text-2xl text-zinc-600 tracking-tight mb-10">
          The modern platform schools actually enjoy using.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link 
            href="/signup" 
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-zinc-950 px-10 text-lg font-semibold text-white hover:bg-black active:scale-[0.985] transition-all"
          >
            Start 14-day free trial
          </Link>
          <Link 
            href="#demo" 
            className="inline-flex h-14 items-center justify-center rounded-2xl border border-zinc-200 px-8 text-lg font-medium hover:bg-zinc-50"
          >
            Watch demo
          </Link>
        </div>
        <p className="mt-4 text-sm text-zinc-500">No credit card required</p>
      </div>

      {/* Trust bar */}
      <div className="border-y border-zinc-100 py-8">
        <div className="max-w-5xl mx-auto px-8 flex justify-center gap-x-14 text-sm font-medium text-zinc-400 tracking-[2px]">
          BRIGHTON ACADEMY • ST. MARY’S • RIVERSIDE • HORIZON PREP
        </div>
      </div>

      {/* Features */}
      <div id="features" className="max-w-6xl mx-auto px-8 pt-24 pb-20">
        <div className="text-center mb-16">
          <div className="uppercase tracking-[3px] text-xs font-semibold text-zinc-500 mb-3">EVERYTHING YOU NEED</div>
          <h2 className="text-6xl font-semibold tracking-[-1.5px]">Built for how schools actually work.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            ["Student Management", "Complete lifecycle from admission to alumni with powerful profiles."],
            ["Smart Attendance", "Real-time marking with AI risk alerts and automated notifications."],
            ["Results & Exams", "Flexible grading, instant report cards, and performance analytics."],
            ["Fee Collection", "Automated invoicing, online payments, and defaulter intelligence."],
            ["Parent Portal", "Real-time access to grades, attendance, and teacher messaging."],
            ["AI Insights", "Predict at-risk students and surface actionable school KPIs."],
          ].map(([title, desc], index) => (
            <div key={index} className="p-8 rounded-3xl border border-zinc-100 hover:border-zinc-200 bg-white group transition-all">
              <div className="font-semibold text-2xl tracking-tight mb-3 group-hover:text-[#0A66C2] transition-colors">{title}</div>
              <p className="text-lg text-zinc-600 leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-zinc-950 py-20 text-center text-white">
        <div className="max-w-xl mx-auto px-8">
          <h2 className="text-6xl font-semibold tracking-[-1.5px] mb-4">Ready to modernize your school?</h2>
          <p className="text-2xl text-white/70 mb-9">Join forward-thinking schools already using EduCore.</p>
          <Link 
            href="/signup" 
            className="inline-block bg-white text-zinc-950 px-10 py-4 rounded-2xl font-semibold text-lg active:scale-[0.985]"
          >
            Start your free trial
          </Link>
        </div>
      </div>

      <footer className="border-t py-12 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} EduCore. All rights reserved.
      </footer>
    </div>
  );
}
