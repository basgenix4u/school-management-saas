import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { EduManageLogo } from "@/components/brand/EduManageLogo";

const plans = [
  { name: "Launch", fit: "Small schools starting digital operations", features: ["Student records", "Attendance", "Invoices", "Parent portal", "Basic reports"] },
  { name: "Growth", fit: "Schools needing automation and stronger reporting", features: ["Everything in Launch", "Results workflow", "Communication campaigns", "Audit trail", "Finance intelligence"] },
  { name: "Enterprise", fit: "School groups and high-compliance institutions", features: ["Multi-campus controls", "Advanced roles", "Custom onboarding", "Priority support", "Security review"] },
];

export default function PricingPage() {
  return (
    <main className="public-page">
      <div className="public-nav"><EduManageLogo /><Link className="ds-btn ds-btn-secondary" href="/">Back home</Link></div>
      <section className="public-hero"><span className="ds-eyebrow">Pricing strategy</span><h1>Plans designed around school maturity.</h1><p>Pricing should be finalized after customer discovery, but the product is structured for tiered SaaS packaging.</p></section>
      <section className="pricing-grid">{plans.map((plan) => <article className="ds-card pricing-card" key={plan.name}><h2>{plan.name}</h2><p>{plan.fit}</p><ul>{plan.features.map((feature) => <li key={feature}><CheckCircle2 size={16} /> {feature}</li>)}</ul><Link className="ds-btn ds-btn-primary" href="/contact">Discuss plan</Link></article>)}</section>
    </main>
  );
}
