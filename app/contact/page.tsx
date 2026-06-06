import Link from "next/link";
import { Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { EduManageLogo } from "@/components/brand/EduManageLogo";

export default function ContactPage() {
  return (
    <main className="public-page">
      <div className="public-nav"><EduManageLogo /><Link className="ds-btn ds-btn-secondary" href="/">Back home</Link></div>
      <section className="public-hero">
        <span className="ds-eyebrow"><MessageCircle size={15} /> Contact</span>
        <h1>Talk to the EduManage team.</h1>
        <p>Use this page for school onboarding, product questions, technical support, partnerships and deployment assistance.</p>
      </section>
      <section className="public-card-grid">
        <article className="ds-card public-card"><Mail /><h2>General enquiries</h2><p>Email the team for school onboarding, pricing, school onboarding and partnerships.</p><a href="mailto:hello@alimswrite.com">hello@alimswrite.com</a></article>
        <article className="ds-card public-card"><ShieldCheck /><h2>Security contact</h2><p>Report security concerns, account access issues or data protection questions privately.</p><a href="mailto:security@alimswrite.com">security@alimswrite.com</a></article>
        <article className="ds-card public-card"><MessageCircle /><h2>Support</h2><p>Need deployment or account help? Open the support guide and follow the escalation path.</p><Link href="/support">Open support</Link></article>
      </section>
    </main>
  );
}
