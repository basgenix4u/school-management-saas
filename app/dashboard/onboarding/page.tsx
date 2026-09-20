import { ArrowRight, CheckCircle2, CircleDashed } from "lucide-react";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { getSetupReadiness } from "@/lib/supabase/school-data";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/**
 * Launch readiness for the school.
 *
 * Every step reflects the caller's real records: a step is complete only when
 * its rows exist. Progress here is the activation metric, so it must never be
 * sampled or estimated.
 */
export const dynamic = "force-dynamic";

type Readiness = {
  organization_name?: string | null;
  students_count?: number | string | null;
  teachers_count?: number | string | null;
  classes_count?: number | string | null;
  fee_categories_count?: number | string | null;
  academic_sessions_count?: number | string | null;
  readiness_score?: number | string | null;
};

export default async function OnboardingPage() {
  const supabase = await requestClientOrNull();
  const readiness = (supabase ? await getSetupReadiness(supabase).catch(() => null) : null) as Readiness | null;

  const count = (value: unknown) => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const steps = readiness
    ? [
        { item: "School workspace created", done: true, detail: readiness.organization_name ?? "Your school", href: "/dashboard/setup" },
        { item: "Academic session and current term", done: count(readiness.academic_sessions_count) > 0, detail: count(readiness.academic_sessions_count) > 0 ? "Session is set" : "Set the session and term", href: "/dashboard/setup" },
        { item: "Classes set up", done: count(readiness.classes_count) > 0, detail: count(readiness.classes_count) > 0 ? `${count(readiness.classes_count)} classes` : "Add JSS/SSS arms or primary classes", href: "/dashboard/setup" },
        { item: "Staff records added", done: count(readiness.teachers_count) > 0, detail: count(readiness.teachers_count) > 0 ? `${count(readiness.teachers_count)} staff` : "Add teachers and the bursar", href: "/dashboard/setup" },
        { item: "Students enrolled", done: count(readiness.students_count) > 0, detail: count(readiness.students_count) > 0 ? `${count(readiness.students_count)} students` : "Enrol students with admission numbers", href: "/dashboard/setup" },
        { item: "Fee structure defined", done: count(readiness.fee_categories_count) > 0, detail: count(readiness.fee_categories_count) > 0 ? `${count(readiness.fee_categories_count)} fee items` : "Define term fees before billing", href: "/dashboard/setup" },
      ]
    : [];

  const score = readiness ? Math.max(0, Math.min(100, count(readiness.readiness_score))) : 0;
  const complete = steps.filter((step) => step.done).length;

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Workspace launch</p>
        <h1 className="page-title">Get {readiness?.organization_name ?? "your school"} live.</h1>
        <p className="page-subtitle">Work through these steps once. Each one unlocks the part of the system that depends on it.</p>
      </header>

      {!readiness ? (
        <Alert tone="info"><p>Connect your database to see your school&apos;s launch progress.</p></Alert>
      ) : (
        <section className="premium-grid-2 align-start">
          <Card title={`Launch readiness — ${score}%`} subtitle={readiness.organization_name ?? "Your school"}>
            <div className="launch-list">
              {steps.map((step) => (
                <article key={step.item}>
                  <div className="launch-top">
                    <strong>
                      {step.done ? (
                        <CheckCircle2 size={16} className="ui-icon-success" aria-label="Done" />
                      ) : (
                        <CircleDashed size={16} className="ui-icon-muted" aria-label="Pending" />
                      )}{" "}
                      {step.item}
                    </strong>
                    <span>{step.done ? "Done" : "Pending"}</span>
                  </div>
                  <p className="muted-copy">{step.detail}</p>
                </article>
              ))}
            </div>
          </Card>

          <Card title={`${complete} of ${steps.length} steps done`}>
            <p>
              <CheckCircle2 size={38} className="ui-icon-success" aria-hidden="true" />
            </p>
            <p>
              {score >= 100
                ? "Your school is fully set up. Daily operations — registers, fees, results — are ready."
                : "Finish the pending steps in setup and this page will confirm each one as it lands."}
            </p>
            <p>
              <Button href="/dashboard/setup">
                Continue setup <ArrowRight size={18} />
              </Button>
            </p>
          </Card>
        </section>
      )}
    </div>
  );
}
