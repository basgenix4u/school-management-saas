import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpenCheck,
  CheckCircle2,
  CreditCard,
  Database,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { EduManageLogo } from "@/components/brand/EduManageLogo";

const modules = [
  { icon: UsersRound, title: "Student 360", text: "A complete student view across guardians, attendance, finance, results, risk and interventions." },
  { icon: BookOpenCheck, title: "Results & report cards", text: "Score entry, approval workflow and parent-ready report cards built for term operations." },
  { icon: CreditCard, title: "Fees & invoices", text: "Invoice intelligence, collection forecasting, payment risk and guardian follow-up workflows." },
  { icon: Bell, title: "Attendance operations", text: "Teacher-first attendance marking, intervention signals, heatmaps and class reliability insights." },
  { icon: MessageCircle, title: "Parent communication", text: "Campaigns, announcements, fee reminders and engagement intelligence for stronger parent trust." },
  { icon: ShieldCheck, title: "Trust and audit", text: "Role-based access, audit trail, Supabase-backed data model and security-ready product architecture." },
];

const roles = [
  { title: "School owners", outcome: "See revenue, enrollment, risk and growth signals without waiting for reports." },
  { title: "Principals", outcome: "Control academics, attendance, approvals and interventions from one operating cockpit." },
  { title: "Teachers", outcome: "Mark attendance, enter scores, follow lesson flow and escalate concerns quickly." },
  { title: "Accountants", outcome: "Track balances, partial payments, overdue risk and invoice follow-up in real time." },
  { title: "Parents", outcome: "Access fees, report cards, messages and child progress from a simple mobile portal." },
  { title: "Students", outcome: "Understand progress, tasks, results and learning momentum without confusion." },
];

const proof = ["45 production-built routes", "Supabase Auth foundation", "Protected dashboards and portals", "Database migrations and views", "CI build checks", "Deployment and QA guide"];

const faqs = [
  { q: "Is EduManage only a dashboard?", a: "No. It is structured as a school operating system covering academics, finance, attendance, communication, portals, trust and launch readiness." },
  { q: "Can it support multiple roles?", a: "Yes. The architecture includes school owner, principal, teacher, accountant, parent, student and super admin role planning." },
  { q: "Is it ready for Supabase?", a: "Yes. The project includes Supabase migrations, auth foundation, CRUD APIs, database views and demo users." },
  { q: "Can this become a paid SaaS?", a: "Yes. Remaining work includes strict RLS, live UI wiring, payments, PDF exports, support workflows and production monitoring." },
];

export default function Home() {
  return (
    <main className="marketing-site">
      <section className="marketing-hero">
        <div className="marketing-nav ds-container">
          <EduManageLogo />
          <div className="marketing-nav-links" aria-label="Primary navigation">
            <a href="#platform">Platform</a>
            <a href="#roles">Roles</a>
            <a href="#security">Security</a>
            <Link href="/pricing">Pricing</Link>
            <Link href="/support">Support</Link>
          </div>
          <div className="marketing-nav-actions">
            <Link className="ds-btn ds-btn-ghost" href="/login">Sign in</Link>
            <Link className="ds-btn ds-btn-primary" href="/dashboard">Open platform</Link>
          </div>
        </div>

        <div className="ds-container marketing-hero-grid">
          <div className="marketing-hero-copy">
            <span className="ds-eyebrow"><Sparkles size={15} /> School operating system for serious institutions</span>
            <h1 className="ds-display">Run academics, finance, attendance and parent engagement from one trusted platform.</h1>
            <p className="ds-lead">
              EduManage gives school owners and administrators a premium command center for daily operations, revenue visibility, student outcomes, parent trust and secure role-based workflows.
            </p>
            <div className="marketing-hero-actions">
              <Link className="ds-btn ds-btn-primary ds-btn-lg" href="/login">Start secure access <ArrowRight size={18} /></Link>
              <Link className="ds-btn ds-btn-secondary ds-btn-lg" href="/dashboard/launch">View launch readiness</Link>
            </div>
            <div className="trust-strip" aria-label="Trust highlights">
              {proof.slice(0, 3).map((item) => <span key={item}><CheckCircle2 size={15} /> {item}</span>)}
            </div>
          </div>

          <div className="hero-product-frame" aria-label="EduManage product preview">
            <div className="hero-window-top"><span /><span /><span /><strong>Executive Command Center</strong></div>
            <div className="hero-dashboard-preview">
              <div className="hero-dashboard-main">
                <span className="ds-eyebrow">Live school health</span>
                <strong>96%</strong>
                <p>Attendance, finance, results and parent engagement are operating above baseline.</p>
                <div className="hero-chart" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
              </div>
              <div className="hero-dashboard-side">
                {[
                  ["Fees collected", "₦18.4M"],
                  ["Attendance", "94.2%"],
                  ["Risk signals", "12"],
                ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
              </div>
            </div>
            <div className="hero-insight-card"><ShieldCheck size={18} /> Role-based controls, audit trail and Supabase-backed data architecture.</div>
          </div>
        </div>
      </section>

      <section className="ds-section ds-container proof-section" aria-label="Product proof">
        {proof.map((item) => <div key={item}><CheckCircle2 size={18} /><span>{item}</span></div>)}
      </section>

      <section id="platform" className="ds-section ds-container">
        <div className="section-heading">
          <span className="ds-eyebrow">Platform modules</span>
          <h2 className="ds-section-title">Everything important to school operations, designed around real daily workflows.</h2>
          <p className="ds-body-large">The product is intentionally split into focused workspaces so each user gets speed, clarity and confidence instead of a crowded generic dashboard.</p>
        </div>
        <div className="module-grid">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <article className="ds-card module-card" key={module.title}>
                <div className="ds-icon"><Icon size={22} /></div>
                <h3>{module.title}</h3>
                <p>{module.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="roles" className="ds-section role-section">
        <div className="ds-container role-grid-shell">
          <div className="section-heading align-left">
            <span className="ds-eyebrow">Role-first product architecture</span>
            <h2 className="ds-section-title">Every user sees the work that matters to them.</h2>
            <p className="ds-body-large">A school owner, teacher, accountant and parent should not fight through the same interface. EduManage is structured around jobs-to-be-done.</p>
            <Link className="ds-btn ds-btn-secondary" href="/dashboard/access">Explore access matrix</Link>
          </div>
          <div className="role-card-grid">
            {roles.map((role) => <article key={role.title}><strong>{role.title}</strong><p>{role.outcome}</p></article>)}
          </div>
        </div>
      </section>

      <section id="security" className="ds-section ds-container trust-section">
        <div className="trust-panel">
          <div>
            <span className="ds-eyebrow"><LockKeyhole size={15} /> Security and operational trust</span>
            <h2 className="ds-section-title">Built for sensitive student, parent and financial data.</h2>
            <p className="ds-body-large">EduManage includes a Supabase Auth foundation, protected routes, audit trail, role planning, database migrations, intelligence views and deployment QA documentation.</p>
            <div className="security-links">
              <Link href="/security">Security center</Link>
              <Link href="/privacy">Privacy policy</Link>
              <Link href="/terms">Terms of service</Link>
            </div>
          </div>
          <div className="trust-metrics">
            <article><Database size={20} /><strong>Supabase</strong><span>Database + Auth foundation</span></article>
            <article><ShieldCheck size={20} /><strong>RBAC</strong><span>Role and permission architecture</span></article>
            <article><BarChart3 size={20} /><strong>Audit</strong><span>Traceable sensitive actions</span></article>
          </div>
        </div>
      </section>

      <section className="ds-section ds-container faq-section">
        <div className="section-heading">
          <span className="ds-eyebrow">Buyer questions</span>
          <h2 className="ds-section-title">Designed to reduce risk before a school commits.</h2>
        </div>
        <div className="faq-grid">
          {faqs.map((faq) => <article key={faq.q}><h3>{faq.q}</h3><p>{faq.a}</p></article>)}
        </div>
      </section>

      <section className="ds-section final-cta">
        <div className="ds-container final-cta-panel">
          <span className="ds-eyebrow">Ready for launch preparation</span>
          <h2>Deploy, test, and start onboarding real schools.</h2>
          <p>Use the launch center, deployment guide and smoke tests to move from product build to live customer validation.</p>
          <div className="marketing-hero-actions">
            <Link className="ds-btn ds-btn-primary ds-btn-lg" href="/dashboard/launch">Open launch center</Link>
            <Link className="ds-btn ds-btn-secondary ds-btn-lg" href="/contact">Contact the team</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
