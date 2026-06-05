import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { EduManageLogo } from "@/components/brand/EduManageLogo";

const faqs = [
  ["Who is EduManage for?", "Private schools, academies, training centers and school groups that need a serious operating system for academics, finance, attendance and communication."],
  ["Does it support multiple roles?", "Yes. The architecture includes owners, principals, teachers, accountants, parents, students and super admins."],
  ["Does it use a real database?", "Yes. Supabase migrations, Auth foundation, CRUD API layer, views and demo users have been implemented."],
  ["Can parents and students log in?", "The portal and auth foundation exist. The next production step is connecting authenticated accounts to their live records."],
  ["Is it production-ready today?", "It is a strong launch foundation. Before real school data, strict RLS, live UI wiring, payments, monitoring and legal review must be completed."],
];

export default function FAQPage() {
  return (
    <main className="public-page">
      <div className="public-nav"><EduManageLogo /><Link className="ds-btn ds-btn-secondary" href="/">Back home</Link></div>
      <section className="public-hero"><span className="ds-eyebrow"><HelpCircle size={15} /> FAQ</span><h1>Answers for schools evaluating EduManage.</h1><p>Clear answers reduce buyer anxiety and help decision makers understand product readiness.</p></section>
      <section className="faq-grid public-faq">{faqs.map(([q, a]) => <article key={q}><h2>{q}</h2><p>{a}</p></article>)}</section>
    </main>
  );
}
