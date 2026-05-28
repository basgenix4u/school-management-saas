import Link from "next/link";
import { ArrowRight, BarChart3, Bell, BookOpenCheck, CreditCard, ShieldCheck, UsersRound } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";

const features = [
  { icon: UsersRound, title: "Student & Parent CRM", text: "Centralized records, guardians, classes, communication history and enrollment status." },
  { icon: BookOpenCheck, title: "Results & Report Cards", text: "Manage scores, subjects, grading, comments and publishable reports." },
  { icon: CreditCard, title: "Fees & Invoices", text: "Track invoices, partial payments, outstanding balances and payment reminders." },
  { icon: BarChart3, title: "Admin Analytics", text: "Monitor attendance, collections, student growth and academic performance." },
  { icon: Bell, title: "Notifications", text: "Email/SMS-ready architecture for announcements, fee reminders and alerts." },
  { icon: ShieldCheck, title: "Role-Based Access", text: "Designed for admins, teachers, accountants, parents and students." },
];

export default function Home() {
  return (
    <main>
      <section style={{ padding: "28px 0 90px", background: "radial-gradient(circle at top left,#dbeafe,transparent 32%), linear-gradient(180deg,#fff,#f6f8fb)" }}>
        <div className="container">
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, marginBottom: 80 }}>
            <AppLogo />
            <div style={{ display: "flex", gap: 12 }}>
              <Link className="btn btn-secondary" href="/dashboard">Demo Dashboard</Link>
              <a className="btn btn-primary" href="https://github.com/basgenix4u/school-management-saas">GitHub</a>
            </div>
          </nav>

          <div style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 34, alignItems: "center" }}>
            <div>
              <span className="badge">Production-ready SaaS foundation</span>
              <h1 style={{ fontSize: "clamp(42px, 7vw, 76px)", lineHeight: 0.95, margin: "22px 0", letterSpacing: "-0.06em" }}>
                Modern school management for growing institutions.
              </h1>
              <p style={{ fontSize: 20, color: "#475569", lineHeight: 1.75, maxWidth: 680 }}>
                EduManage is a full-stack SaaS platform for managing students, teachers, attendance, results, fees, parent communication and admin analytics from one clean dashboard.
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 30 }}>
                <Link className="btn btn-primary" href="/dashboard">Open Demo Dashboard <ArrowRight size={18} /></Link>
                <a className="btn btn-secondary" href="#features">Explore Features</a>
              </div>
            </div>

            <div className="card" style={{ padding: 22 }}>
              <div style={{ padding: 18, borderRadius: 20, background: "#0f172a", color: "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
                  <strong>Greenfield School</strong>
                  <span style={{ color: "#93c5fd" }}>Live term</span>
                </div>
                <div className="grid" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
                  {["1,248 Students", "86 Teachers", "94% Attendance", "₦18.4M Fees"].map((item) => (
                    <div key={item} style={{ padding: 18, background: "rgba(255,255,255,0.08)", borderRadius: 18, fontWeight: 800 }}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="container" style={{ padding: "70px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <span className="badge">Core Modules</span>
          <h2 style={{ fontSize: 42, margin: "16px 0 8px", letterSpacing: "-0.04em" }}>Everything a school needs to operate smarter</h2>
          <p style={{ color: "#64748b", fontSize: 18 }}>Built as a serious portfolio SaaS foundation with real business use cases.</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div className="card" key={feature.title} style={{ padding: 26 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: "#eff6ff", color: "#2563eb", display: "grid", placeItems: "center", marginBottom: 18 }}><Icon /></div>
                <h3 style={{ margin: "0 0 10px", fontSize: 21 }}>{feature.title}</h3>
                <p style={{ color: "#64748b", lineHeight: 1.7 }}>{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
