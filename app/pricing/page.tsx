import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { EduCoreLogo } from "@/components/brand/EduCoreLogo";

const plans = [
  { name: "Launch", fit: "Small schools moving off paper for the first time", features: ["Student records", "Attendance registers", "Term invoices", "Parent portal", "Basic reports"] },
  { name: "Growth", fit: "Schools that want results, reminders and reporting handled", features: ["Everything in Launch", "Results and report cards", "Fee reminders and campaigns", "Audit trail", "Fee intelligence"] },
  { name: "Group", fit: "School groups and institutions with several campuses", features: ["Everything in Growth", "Multi-campus workspaces", "Advanced roles", "Guided onboarding", "Priority support"] },
];

export default function PricingPage() {
  return (
    <main className="public-page">
      <div className="public-nav"><EduCoreLogo /><Link className="ds-btn ds-btn-secondary" href="/">Back home</Link></div>
      <section className="public-hero"><span className="ds-eyebrow">Pricing</span><h1>Plans that grow with your school.</h1><p>Pricing depends on enrolment size and the modules you need. Tell us about your school and we will recommend the right plan.</p></section>
      <section className="pricing-grid">{plans.map((plan) => <article className="ds-card pricing-card" key={plan.name}><h2>{plan.name}</h2><p>{plan.fit}</p><ul>{plan.features.map((feature) => <li key={feature}><CheckCircle2 size={16} /> {feature}</li>)}</ul><Link className="ds-btn ds-btn-primary" href="/contact">Discuss plan</Link></article>)}</section>
    </main>
  );
}
