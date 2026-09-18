import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  answerInsight,
  buildDecisionQueue,
  detectIntent,
  hasInsightData,
  type InsightContext,
} from "../lib/insights/engine";

/**
 * The insight engine is the part of the product that talks about a school's
 * data in plain language. These tests prove two things: the reasoning follows
 * the data, and an empty school gets honest empty states instead of invented
 * figures.
 */

function context(overrides: Partial<InsightContext> = {}): InsightContext {
  return {
    schoolName: "Bright Future College",
    students: 0,
    teachers: 0,
    classes: 0,
    attendanceRate: 0,
    highRisk: 0,
    mediumRisk: 0,
    risks: [],
    finance: null,
    overdueInvoices: [],
    attendanceDaily: [],
    classAttendance: [],
    resultTerms: [],
    ...overrides,
  };
}

const populated = context({
  students: 240,
  teachers: 18,
  classes: 12,
  attendanceRate: 91,
  highRisk: 2,
  mediumRisk: 3,
  risks: [
    {
      student_name: "Adaeze Okafor", admission_no: "BFC/2024/011", classroom: "SS2 Science",
      risk_score: 75, risk_level_computed: "High", attendance_rate: 68, absent_count: 6,
      outstanding_balance: 45000, overdue_invoices: 1, average_score: 58, result_records: 6,
    },
    {
      student_name: "Tunde Bakare", admission_no: "BFC/2024/102", classroom: "JSS3 Gold",
      risk_score: 42, risk_level_computed: "Medium", attendance_rate: 88, absent_count: 2,
      outstanding_balance: 0, overdue_invoices: 0, average_score: 61, result_records: 6,
    },
  ],
  finance: {
    invoice_count: 120, total_billed: 9600000, total_collected: 7200000,
    total_outstanding: 2400000, overdue_count: 9, paid_count: 80,
  },
  overdueInvoices: [
    { invoice_no: "INV-2026-014", title: "First Term Fees", balance: 85000, due_date: "2026-10-15", admission_no: "BFC/2024/011", student_name: "Adaeze Okafor" },
  ],
  attendanceDaily: [
    { attendance_date: "2026-09-17", total_marked: 230, present_count: 205, absent_count: 18, late_count: 7 },
    { attendance_date: "2026-09-16", total_marked: 228, present_count: 210, absent_count: 12, late_count: 6 },
  ],
  classAttendance: [
    { classroom: "SS2 Science", marked: 40, present: 28, absent: 9, rate: 70 },
    { classroom: "JSS3 Gold", marked: 38, present: 36, absent: 1, rate: 95 },
  ],
  resultTerms: [
    { term: "First Term", session: "2026/2027", student_count: 200, published_count: 100, draft_count: 60, review_count: 20, approved_count: 20 },
  ],
});

describe("intent detection", () => {
  it("routes each concern to its analysis", () => {
    expect(detectIntent("Which students need urgent intervention?")).toBe("intervention");
    expect(detectIntent("Summarize fee collection risk this week")).toBe("fees");
    expect(detectIntent("Prepare parent reminder for unpaid invoices")).toBe("reminder");
    expect(detectIntent("Show classes with attendance drop")).toBe("attendance");
  });

  it("prefers the reminder when a question mixes fees and messaging", () => {
    expect(detectIntent("Remind parents about unpaid invoices")).toBe("reminder");
    expect(detectIntent("Draft an SMS for fee defaulters")).toBe("reminder");
  });

  it("falls back to a general briefing", () => {
    expect(detectIntent("Give me today's briefing for my school")).toBe("general");
    expect(detectIntent("hello")).toBe("general");
    expect(detectIntent("")).toBe("general");
  });
});

describe("answers follow the data", () => {
  it("names the real students at risk", () => {
    const answer = answerInsight(populated, "Who needs urgent intervention?");
    expect(answer.intent).toBe("intervention");
    expect(answer.body).toContain("Adaeze Okafor");
    expect(answer.facts.join(" ")).toContain("SS2 Science");
  });

  it("reports the real fee position", () => {
    const answer = answerInsight(populated, "How are fee collections doing?");
    expect(answer.intent).toBe("fees");
    expect(answer.title).toContain("2,400,000");
    expect(answer.facts.join(" ")).toContain("INV-2026-014");
  });

  it("drafts reminders from real balances", () => {
    const answer = answerInsight(populated, "Draft a reminder for parents");
    expect(answer.intent).toBe("reminder");
    expect(answer.facts.join(" ")).toContain("Bright Future College");
    expect(answer.facts.join(" ")).toContain("2,400,000");
  });

  it("flags the real weak classes", () => {
    const answer = answerInsight(populated, "How is attendance by class?");
    expect(answer.intent).toBe("attendance");
    expect(answer.body).toContain("SS2 Science");
    expect(answer.body).not.toContain("JSS3 Gold");
  });

  it("briefs from real headline figures", () => {
    const answer = answerInsight(populated, "Good morning, brief me");
    expect(answer.body).toContain("240 students");
    expect(answer.body).toContain("2,400,000");
  });
});

describe("empty schools get honesty, not invention", () => {
  const empty = context();

  it("detects the absence of data", () => {
    expect(hasInsightData(empty)).toBe(false);
    expect(hasInsightData(populated)).toBe(true);
  });

  it("says plainly that there is nothing to assess", () => {
    for (const question of [
      "Who needs urgent intervention?",
      "How are fee collections doing?",
      "Draft a reminder for parents",
      "How is attendance by class?",
      "Brief me",
    ]) {
      const answer = answerInsight(empty, question);
      // No invented people, classes, counts or money anywhere in the answer.
      expect(JSON.stringify(answer)).not.toMatch(/\d{2,}/);
      expect(answer.body.length).toBeGreaterThan(40);
    }
  });

  it("points empty states at the screen that fixes them", () => {
    expect(answerInsight(empty, "Who needs help?").action?.href).toBe("/dashboard/setup");
    expect(answerInsight(empty, "How are fees?").action?.href).toBe("/dashboard/fees/invoices");
  });
});

describe("decision queue", () => {
  it("orders worst-first and caps at five", () => {
    const queue = buildDecisionQueue(populated);
    expect(queue.length).toBeGreaterThan(0);
    expect(queue.length).toBeLessThanOrEqual(5);
    expect(queue[0].severity).toBe("High");
    for (const signal of queue) {
      expect(signal.href.startsWith("/dashboard/")).toBe(true);
    }
  });

  it("stays empty for an empty school", () => {
    expect(buildDecisionQueue(context())).toEqual([]);
  });
});

describe("no fabricated metrics in the product", () => {
  const root = process.cwd();

  function sources(dir: string, found: string[] = []): string[] {
    for (const entry of readdirSync(join(root, dir))) {
      if (entry === "node_modules" || entry === ".next") continue;
      const rel = join(dir, entry);
      if (entry.includes(".")) {
        if (/\.(ts|tsx)$/.test(entry)) found.push(rel);
      } else {
        sources(rel, found);
      }
    }
    return found;
  }

  it("removed the dead command center and its invented figures", () => {
    expect(existsSync(join(root, "components", "premium", "ExecutiveCommandCenter.tsx"))).toBe(false);
    expect(existsSync(join(root, "lib", "intelligence-data.ts"))).toBe(false);
  });

  it("keeps invented school figures out of components and pages", () => {
    const banned = ["₦6.4M", "₦24.8M", "₦1.8M", "96.4%", "94.2%", "684 guardians", "42 classes"];
    const offenders: string[] = [];
    for (const file of [...sources("app"), ...sources("components")]) {
      const text = readFileSync(join(root, file), "utf8");
      if (banned.some((phrase) => text.includes(phrase))) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it("keeps demo confessions out of product pages", () => {
    const banned = ["Next implementation step", "onboarding concept", "feel like a real SaaS"];
    const offenders: string[] = [];
    for (const file of sources("app")) {
      const text = readFileSync(join(root, file), "utf8");
      if (banned.some((phrase) => text.includes(phrase))) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});
