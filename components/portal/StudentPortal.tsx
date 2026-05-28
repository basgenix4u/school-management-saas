import Link from "next/link";
import { Award, BookOpenCheck, CalendarCheck, Flame, GraduationCap, ListChecks, Trophy } from "lucide-react";
import { studentProfile, studentSubjects, studentTasks, studentTimeline } from "@/lib/portal-data";

export function StudentPortal() {
  return (
    <main className="portal-shell">
      <section className="portal-hero card-aurora">
        <div>
          <span className="premium-kicker"><GraduationCap size={14} /> Student Portal</span>
          <h1>A focused learning dashboard for students.</h1>
          <p>Students can track attendance, results, tasks, teacher feedback and learning progress in a clean experience designed to motivate action.</p>
          <div className="role-metrics"><span>{studentProfile.name}</span><span>{studentProfile.className}</span><span>{studentProfile.rank} position</span></div>
        </div>
        <div className="portal-live-card"><strong>{studentProfile.average}%</strong><span>Academic average</span><small>{studentProfile.points} learning points</small></div>
      </section>

      <section className="premium-metrics">
        <article className="premium-metric tone-blue"><div className="metric-icon"><Award /></div><span>Average</span><strong>{studentProfile.average}%</strong><small>{studentProfile.rank}</small><p>Current approved academic performance.</p></article>
        <article className="premium-metric tone-emerald"><div className="metric-icon"><CalendarCheck /></div><span>Attendance</span><strong>{studentProfile.attendance}%</strong><small>excellent</small><p>Attendance consistency for the current term.</p></article>
        <article className="premium-metric tone-violet"><div className="metric-icon"><Flame /></div><span>Learning Streak</span><strong>{studentProfile.streak}</strong><small>days</small><p>Motivation layer for continuous student engagement.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><ListChecks /></div><span>Tasks</span><strong>{studentTasks.length}</strong><small>active</small><p>Assignments and follow-up learning actions.</p></article>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><BookOpenCheck size={14} /> Subject Progress</span>
          <h2>Current performance</h2>
          <div className="subject-progress-list">
            {studentSubjects.map((subject) => <article key={subject.subject}><div><strong>{subject.subject}</strong><span>{subject.teacher}</span></div><div><strong>{subject.score}%</strong><span className="status good">{subject.grade}</span></div></article>)}
          </div>
          <Link className="btn btn-primary" href="/dashboard/results/report-card/amina-yusuf">View Report Card</Link>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker"><ListChecks size={14} /> Learning Tasks</span>
          <h2>What to do next</h2>
          <div className="trust-list">{studentTasks.map((task) => <article key={task.title}><div><strong>{task.title}</strong><p>{task.subject} • Due {task.due}</p></div><span>{task.status}</span></article>)}</div>
        </div>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><Trophy size={14} /> Achievement Path</span>
          <h2>Recommended growth</h2>
          <div className="achievement-path"><span>Science Excellence</span><span>Leadership Track</span><span>Scholarship Ready</span><span>Lab Practical Mastery</span></div>
        </div>
        <div className="card premium-panel">
          <span className="premium-kicker">Today</span>
          <h2>Learning timeline</h2>
          <div className="timeline-list">{studentTimeline.map((item) => <article key={item.time}><time>{item.time}</time><div><strong>{item.title}</strong><p>{item.body}</p></div></article>)}</div>
        </div>
      </section>
    </main>
  );
}
