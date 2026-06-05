import Link from "next/link";
import { BookOpenCheck, CheckCircle2, LifeBuoy } from "lucide-react";
import { EduManageLogo } from "@/components/brand/EduManageLogo";

const supportPaths = [
  { title: "Deployment help", body: "Use the deployment guide to configure Vercel, Supabase and environment variables.", href: "/dashboard/launch" },
  { title: "Account and login", body: "Check Supabase Auth configuration, redirect URLs and demo credentials.", href: "/login" },
  { title: "Product documentation", body: "Review the product roadmap, design system, deployment guide and Supabase setup docs.", href: "https://github.com/basgenix4u/school-management-saas/tree/main/docs" },
];

export default function SupportPage() {
  return (
    <main className="public-page">
      <div className="public-nav"><EduManageLogo /><Link className="ds-btn ds-btn-secondary" href="/">Back home</Link></div>
      <section className="public-hero">
        <span className="ds-eyebrow"><LifeBuoy size={15} /> Support</span>
        <h1>Support that keeps school operations moving.</h1>
        <p>EduManage support is designed around fast diagnosis, clear ownership and safe handling of school data.</p>
      </section>
      <section className="public-card-grid">
        {supportPaths.map((item) => <article className="ds-card public-card" key={item.title}><BookOpenCheck /><h2>{item.title}</h2><p>{item.body}</p><Link href={item.href}>Open resource</Link></article>)}
      </section>
      <section className="public-panel"><h2>Support escalation policy</h2><ul>{["Critical authentication or data issues should be treated as urgent.", "Payment and invoice problems should include invoice number, student ID and screenshot where possible.", "Security concerns should never be posted publicly; use the security contact channel."].map((item) => <li key={item}><CheckCircle2 size={17} /> {item}</li>)}</ul></section>
    </main>
  );
}
