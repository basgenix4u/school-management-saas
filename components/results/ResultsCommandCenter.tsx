import Link from "next/link";
import { ArrowRight, Award, BookOpenCheck, ClipboardCheck, FileText, GraduationCap, Send, ShieldCheck } from "lucide-react";
import { approvalSteps, getAverage, getGrade, getResultSummary, resultInsights, resultStudents, subjectAverages } from "@/lib/results-center";

function statusClass(status: string) {
  if (status === "APPROVED" || status === "PUBLISHED") return "good";
  if (status === "REVIEW") return "warn";
  return "bad";
}

export function ResultsCommandCenter() {
  const summary = getResultSummary();

  return (
    <div className="results-center premium-dashboard">
      <section className="card-aurora results-hero">
        <div>
          <span className="premium-kicker"><Award size={14} /> Results Command Center</span>
          <h1>From score entry to polished report cards.</h1>
          <p>Manage academic scores, approval workflows, comments, performance signals and parent-ready report cards with a premium school SaaS experience.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/dashboard/results/entry"><ClipboardCheck size={18} /> Enter Scores</Link>
            <Link className="btn btn-secondary" href="/dashboard/results/report-card/amina-yusuf"><FileText size={18} /> Preview Report Card</Link>
          </div>
        </div>
        <div className="results-hero-card">
          <span>Academic Average</span>
          <strong>{summary.average}%</strong>
          <small>{summary.approved} approved • {summary.review} in review • {summary.draft} draft</small>
        </div>
      </section>

      <section className="premium-metrics">
        <article className="premium-metric tone-blue"><div className="metric-icon"><BookOpenCheck /></div><span>Result Records</span><strong>{summary.total}</strong><small>demo students</small><p>Academic records ready for entry, review and publishing.</p></article>
        <article className="premium-metric tone-emerald"><div className="metric-icon"><ShieldCheck /></div><span>Approved</span><strong>{summary.approved}</strong><small>ready</small><p>Results approved for parent/student access.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><ClipboardCheck /></div><span>In Review</span><strong>{summary.review}</strong><small>principal queue</small><p>Results that need review before release.</p></article>
        <article className="premium-metric tone-rose"><div className="metric-icon"><Send /></div><span>Drafts</span><strong>{summary.draft}</strong><small>teacher entry</small><p>Results still waiting for completion.</p></article>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <div className="panel-header compact"><div><span className="premium-kicker"><GraduationCap size={14} /> Student Result Board</span><h2>Academic records</h2></div><Link className="mini-link" href="/dashboard/results/entry">Score entry <ArrowRight size={15} /></Link></div>
          <div className="result-list">
            {resultStudents.map((student) => {
              const average = getAverage(student.subjects);
              const grade = getGrade(average);
              return (
                <Link className="result-row" href={`/dashboard/results/report-card/${student.slug}`} key={student.id}>
                  <div><strong>{student.name}</strong><span>{student.id} • {student.className}</span></div>
                  <div><strong>{average}%</strong><span>{grade.grade} • {grade.remark}</span></div>
                  <span className={`status ${statusClass(student.status)}`}>{student.status}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker"><ShieldCheck size={14} /> Approval Workflow</span>
          <h2>Publishing pipeline</h2>
          <div className="approval-list">{approvalSteps.map((step) => <article key={step.title}><div><strong>{step.title}</strong><p>{step.description}</p></div><span>{step.status}</span></article>)}</div>
        </div>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><Award size={14} /> Subject Performance</span>
          <h2>Average by subject</h2>
          <div className="subject-bars">{subjectAverages.map((item) => <article key={item.subject}><div><strong>{item.subject}</strong><span>{item.average}%</span></div><div className="progress-track"><span style={{ width: `${item.average}%` }} /></div></article>)}</div>
        </div>
        <div className="card premium-panel">
          <span className="premium-kicker">Academic Intelligence</span>
          <h2>Result insights</h2>
          <div className="signal-list">{resultInsights.map((insight) => <article className="signal-item" key={insight.title}><div><strong>{insight.title}</strong><p>{insight.detail}</p><small>{insight.action}</small></div><span className={`status ${insight.severity === "High" ? "bad" : insight.severity === "Medium" ? "warn" : "good"}`}>{insight.severity}</span></article>)}</div>
        </div>
      </section>
    </div>
  );
}
