import Link from "next/link";
import { BrainCircuit, CheckCircle2, CircleDashed, Target } from "lucide-react";
import { IntelligenceCopilot } from "@/components/premium/IntelligenceCopilot";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { getInsightContext } from "@/lib/supabase/school-data";
import { buildDecisionQueue } from "@/lib/insights/engine";

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
    <div className="premium-dashboard">
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker"><BrainCircuit size={14} /> Intelligence Layer</span>
        <h1>Decision intelligence for {context?.schoolName ?? "your school"}.</h1>
        <p>
          Who needs attention, where money stands, which class is falling behind and what to say
          to parents next — computed from live school records.
        </p>
      </section>

      {!context ? (
        <div className="notice notice-info" role="status">
          <p>Connect your database to activate live intelligence for your school.</p>
        </div>
      ) : (
        <>
          <section className="premium-grid-2 align-start">
            <IntelligenceCopilot />
            <div className="card premium-panel">
              <span className="premium-kicker"><Target size={14} /> Decision Queue</span>
              <h2>Prioritized next best actions</h2>
              {queue.length === 0 ? (
                <div className="empty-state-card">
                  Nothing needs urgent attention. As registers, invoices and scores arrive, the
                  queue will order them here by severity.
                </div>
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
            </div>
          </section>

          <section className="card premium-panel">
            <span className="premium-kicker"><CheckCircle2 size={14} /> Data Coverage</span>
            <h2>What the analysis is working with</h2>
            <div className="signal-list">
              {coverage.map((row) => (
                <article className="signal-item" key={row.label}>
                  <div>
                    <strong>{row.label}</strong>
                    <p>{row.done ? `${row.value} on record` : "Not yet — add this in setup to sharpen the analysis"}</p>
                  </div>
                  {row.done ? <CheckCircle2 size={20} color="#05603a" /> : <CircleDashed size={20} color="#56637a" />}
                </article>
              ))}
            </div>
            <p className="muted-copy">
              Intelligence improves as records grow. <Link href="/dashboard/setup">Continue setup</Link>
            </p>
          </section>
        </>
      )}
    </div>
  );
}
