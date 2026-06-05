import Image from "next/image";
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
  { icon: ShieldCheck, title: "Trust and audit", text: "Role-based access, audit trail, Cloud-backed data model and security-ready product architecture." },
];

const roles = [
  { title: "School owners", outcome: "See revenue, enrollment, risk and growth signals without waiting for reports." },
  { title: "Principals", outcome: "Control academics, attendance, approvals and interventions from one operating cockpit." },
  { title: "Teachers", outcome: "Mark attendance, enter scores, follow lesson flow and escalate concerns quickly." },
  { title: "Accountants", outcome: "Track balances, partial payments, overdue risk and invoice follow-up in real time." },
  { title: "Parents", outcome: "Access fees, report cards, messages and child progress from a simple mobile portal." },
  { title: "Students", outcome: "Understand progress, tasks, results and learning momentum without confusion." },
];

const proof = ["Secure role-based access", "Parent and student portals", "Fees and invoice tracking", "Attendance and results workflows", "Audit-ready school records", "Built for real school operations"];

const faqs = [
  { q: "Is EduManage only a dashboard?", a: "No. It is structured as a school operating system covering academics, finance, attendance, communication, portals, trust and launch readiness." },
  { q: "Can it support multiple roles?", a: "Yes. The architecture includes school owner, principal, teacher, accountant, parent, student and super admin role planning." },
  { q: "Is it ready for Cloud?", a: "Yes. The project includes Cloud migrations, auth foundation, CRUD APIs, database views and demo users." },
  { q: "Can this become a paid SaaS?", a: "Yes. Remaining work includes final security hardening, payments, PDF exports, support workflows and production monitoring before onboarding real schools." },
];

export default function Home() {
  return (
    <main className="marketing-site">
      <section className="marketing-hero">
        <div className="marketing-nav ds-container">
          <EduManageLogo uploaded />
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
            <h1 className="ds-display">Run your entire school from one calm, connected platform.</h1>
            <p className="ds-lead">
              EduManage helps school owners, principals, teachers and parents manage students, attendance, fees, results and communication without spreadsheet chaos.
            </p>
            <div className="marketing-hero-actions">
              <Link className="ds-btn ds-btn-primary ds-btn-lg" href="/login">Start now <ArrowRight size={18} /></Link>
              <Link className="ds-btn ds-btn-secondary ds-btn-lg" href="/dashboard/launch">See how it works</Link>
            </div>
            <div className="trust-strip" aria-label="Trust highlights">
              {proof.slice(0, 3).map((item) => <span key={item}><CheckCircle2 size={15} /> {item}</span>)}
            </div>
          </div>

          <aside className="hero-operating-panel" aria-label="EduManage product overview">
            <div className="hero-panel-header">
              <div>
                <span>Today at a glance</span>
                <strong>Your school command center</strong>
              </div>
              <small>Live-ready</small>
            </div>
            <div className="hero-panel-image">
              <Image src="/marketing/platform-intelligence.webp" alt="EduManage platform dashboard showing school overview, academic insights, attendance signals and finance charts" width={1376} height={768} priority sizes="(max-width: 980px) 100vw, 48vw" />
            </div>
            <div className="hero-kpi-grid">
              <div><span>Attendance</span><strong>94.2%</strong><small>today</small></div>
              <div><span>Fees tracked</span><strong>₦18.4M</strong><small>this term</small></div>
              <div><span>Needs attention</span><strong>12</strong><small>need review</small></div>
              <div><span>Parent updates</span><strong>87%</strong><small>messages</small></div>
            </div>
            <div className="hero-action-row">
              <span><ShieldCheck size={16} /> Secure access</span>
              <span><Database size={16} /> Organized records</span>
              <span><CheckCircle2 size={16} /> Clear accountability</span>
            </div>
          </aside>        </div>
      </section>

      <section className="ds-section ds-container proof-section" aria-label="Product proof">
        {proof.map((item) => <div key={item}><CheckCircle2 size={18} /><span>{item}</span></div>)}
      </section>

      <section id="platform" className="ds-section ds-container">
        <div className="section-heading">
          <span className="ds-eyebrow">Platform modules</span>
          <h2 className="ds-section-title">Everything your school needs, organized around daily work.</h2>
          <p className="ds-body-large">Each workspace is designed for the way real school teams work: owners need clarity, teachers need speed, parents need trust, and accountants need accuracy.</p>
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

      <section className="ds-section ds-container visual-proof-section">
        <div className="section-heading">
          <span className="ds-eyebrow">Real school workflows</span>
          <h2 className="ds-section-title">Designed for the people who run, teach, pay, support and trust the school.</h2>
          <p className="ds-body-large">These product surfaces are mapped to real school behavior: administrators need oversight, teachers need speed, parents need clarity, and finance teams need confidence.</p>
        </div>
        <div className="visual-story-grid">
          <article className="visual-story-card large">
            <Image src="/marketing/school-operations.webp" alt="School administrators using EduManage dashboards in a modern school office" width={1376} height={768} sizes="(max-width: 980px) 100vw, 55vw" />
            <div><span>Operations</span><h3>School teams get one operating rhythm.</h3><p>Attendance, invoices and student records become visible across the school office without spreadsheet chaos.</p></div>
          </article>
          <article className="visual-story-card">
            <Image src="/marketing/teacher-workflow.webp" alt="Teacher using a tablet in class to manage attendance and learning progress" width={1376} height={768} sizes="(max-width: 980px) 100vw, 45vw" />
            <div><span>Teachers</span><h3>Fast classroom workflows.</h3><p>Teachers can mark attendance and act on student signals without leaving the classroom context.</p></div>
          </article>
          <article className="visual-story-card">
            <Image src="/marketing/parent-portal.webp" alt="Parent checking a school portal on a phone while supporting a child at home" width={1200} height={896} sizes="(max-width: 980px) 100vw, 45vw" />
            <div><span>Parents</span><h3>Trust on mobile.</h3><p>Parents see fees, progress, messages and report cards from a calm mobile-first portal.</p></div>
          </article>
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
            <span className="ds-eyebrow"><LockKeyhole size={15} /> Trust and data protection</span>
            <h2 className="ds-section-title">Built to protect student, parent and financial records.</h2>
            <p className="ds-body-large">EduManage is designed with secure access, role permissions, audit-ready records and clear accountability for sensitive school operations.</p>
            <div className="security-links">
              <Link href="/security">Security center</Link>
              <Link href="/privacy">Privacy policy</Link>
              <Link href="/terms">Terms of service</Link>
            </div>
          </div>
          <div className="trust-metrics">
            <article><Database size={20} /><strong>Cloud</strong><span>Secure data foundation</span></article>
            <article><ShieldCheck size={20} /><strong>Roles</strong><span>Permission-based access</span></article>
            <article><BarChart3 size={20} /><strong>Audit</strong><span>Traceable school actions</span></article>
          </div>
        </div>
      </section>

      <section className="ds-section ds-container image-use-case-grid">
        <article className="use-case-image-card">
          <Image src="/marketing/finance-intelligence.webp" alt="Abstract finance dashboard showing invoice cards, revenue forecast and payment risk signals" width={1376} height={768} sizes="(max-width: 980px) 100vw, 50vw" />
          <div><span className="ds-eyebrow">Finance intelligence</span><h3>Revenue clarity before cashflow problems grow.</h3><p>Invoice cards, collection forecasts and risk signals help schools follow up before balances become operational stress.</p></div>
        </article>
        <article className="use-case-image-card">
          <Image src="/marketing/security-cloud.webp" alt="Secure cloud illustration with protected student records and trust controls" width={1376} height={768} sizes="(max-width: 980px) 100vw, 50vw" />
          <div><span className="ds-eyebrow">Security posture</span><h3>Trust is part of the product experience.</h3><p>Security visuals belong near data protection, audit and role-based access messaging — not as decoration.</p></div>
        </article>
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
          <span className="ds-eyebrow">Ready to modernize school operations</span>
          <h2>Give your school a clearer way to operate every day.</h2>
          <p>Bring academics, attendance, fees, communication and parent trust into one simple operating system.</p>
          <div className="marketing-hero-actions">
            <Link className="ds-btn ds-btn-primary ds-btn-lg" href="/dashboard/launch">Explore the platform</Link>
            <Link className="ds-btn ds-btn-secondary ds-btn-lg" href="/contact">Contact the team</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
