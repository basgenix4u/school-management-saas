import Link from "next/link";
import { BrainCircuit, CheckCircle2, CircleDashed } from "lucide-react";
import { IntelligenceCopilot } from "@/components/premium/IntelligenceCopilot";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { getInsightContext } from "@/lib/supabase/school-data";
import { buildDecisionQueue } from "@/lib/insights/engine";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Decision intelligence for the school.
 *
 * The briefing, the question box and the decision queue all read the same
 * live context for the caller's school. An empty school sees honest empty
 * states pointing at setup — never sample figures.
 */
export const dynamic = "force-dynamic";

export default async function IntelligencePage() {
  const supabase = await requestClientOrNull();
  const context = supabase ? await getInsightContext(supabase).catch(() => null) : null;
  const queue = context ? buildDecisionQueue(context) : [];

  const coverage = context
    ? [
        { label: "Students enrolled", value: context.students, done: context.students > 0 },
        { label: "Staff records", value: context.teachers, done: context.teachers > 0 },
        { label: "Classes set up", value: context.classes, done: context.classes > 0 },
        { label: "Invoices raised", value: Number(context.finance?.invoice_count ?? 0), done: Number(context.finance?.invoice_count ?? 0) > 0 },
        { label: "Days of registers", value: context.attendanceDaily.length, done: context.attendanceDaily.length > 0 },
        { label: "Result terms entered", value: context.resultTerms.length, done: context.resultTerms.length > 0 },
      ]
    : [];

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow"><BrainCircuit size={14} aria-hidden="true" /> Intelligence layer</p>
        <h1 className="page-title">Decisions, backed by {context?.schoolName ?? "your school"}&apos;s records.</h1>
        <p className="page-subtitle">
          Who needs attention, where money stands, which class is falling behind and what to say
          to parents next.
        </p>
      </header>

      {!context ? (
        <Alert tone="info"><p>Connect your database to activate live intelligence for your school.</p></Alert>
      ) : (
        <>
          <section className="premium-grid-2 align-start">
            <IntelligenceCopilot />
            <Card title="Decision queue" subtitle="Prioritized next best actions.">
              {queue.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 size={22} />}
                  title="Nothing needs urgent attention"
                  body="As registers, invoices and scores arrive, the queue will order them here by severity."
                />
              ) : (
                <div className="signal-list">
                  {queue.map((signal) => (
                    <article className="signal-item" key={signal.title}>
                      <div>
                        <strong>{signal.title}</strong>
                        <p>{signal.message}</p>
                        <small>{signal.action}</small>
                      </div>
                      <span className={`severity severity-${signal.severity.toLowerCase()}`}>{signal.severity}</span>
                    </article>
                  ))}
                </div>
              )}
            </Card>
          </section>

          <Card title="Data coverage" subtitle="What the analysis is working with.">
            <div className="signal-list">
              {coverage.map((row) => (
                <article className="signal-item" key={row.label}>
                  <div>
                    <strong>{row.label}</strong>
                    <p>{row.done ? `${row.value} on record` : "Not yet — add this in setup to sharpen the analysis"}</p>
                  </div>
                  {row.done ? (
                    <CheckCircle2 size={20} className="ui-icon-success" aria-label="Done" />
                  ) : (
                    <CircleDashed size={20} className="ui-icon-muted" aria-label="Pending" />
                  )}
                </article>
              ))}
            </div>
            <p className="muted-copy">
              Intelligence improves as records grow. <Link href="/dashboard/setup">Continue setup</Link>
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
