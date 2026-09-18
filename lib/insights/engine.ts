import { formatNaira, formatNairaCompact } from "@/lib/format";

/**
 * Deterministic insight engine.
 *
 * Every answer here is computed from rows the database returned for the
 * caller's school. There is no language model and no sampling: the same data
 * always produces the same answer, which is what makes the output safe to show
 * to a proprietor or bursar. Functions stay pure so the reasoning can be
 * tested without a database.
 */

export type InsightIntent = "intervention" | "fees" | "reminder" | "attendance" | "general";

export type RiskRow = {
  student_name: string | null;
  admission_no: string | null;
  classroom: string | null;
  risk_score: number | string | null;
  risk_level_computed: string | null;
  attendance_rate: number | string | null;
  absent_count: number | string | null;
  outstanding_balance: number | string | null;
  overdue_invoices: number | string | null;
  average_score: number | string | null;
  result_records: number | string | null;
};

export type FinanceSummary = {
  invoice_count: number | string | null;
  total_billed: number | string | null;
  total_collected: number | string | null;
  total_outstanding: number | string | null;
  overdue_count: number | string | null;
  paid_count: number | string | null;
};

export type AttendanceDay = {
  attendance_date: string | null;
  total_marked: number | string | null;
  present_count: number | string | null;
  absent_count: number | string | null;
  late_count: number | string | null;
};

export type ClassAttendance = {
  classroom: string;
  marked: number;
  present: number;
  absent: number;
  rate: number;
};

export type OverdueInvoice = {
  invoice_no: string | null;
  title: string | null;
  balance: number;
  due_date: string | null;
  admission_no: string | null;
  student_name: string | null;
};

export type ResultTerm = {
  term: string | null;
  session: string | null;
  student_count: number | string | null;
  published_count: number | string | null;
  draft_count: number | string | null;
  review_count: number | string | null;
  approved_count: number | string | null;
};

export type InsightContext = {
  schoolName: string | null;
  students: number;
  teachers: number;
  classes: number;
  attendanceRate: number;
  highRisk: number;
  mediumRisk: number;
  risks: RiskRow[];
  finance: FinanceSummary | null;
  overdueInvoices: OverdueInvoice[];
  attendanceDaily: AttendanceDay[];
  classAttendance: ClassAttendance[];
  resultTerms: ResultTerm[];
};

export type InsightAction = { label: string; href: string };

export type InsightAnswer = {
  intent: InsightIntent;
  title: string;
  body: string;
  facts: string[];
  action?: InsightAction;
};

export type DecisionSignal = {
  title: string;
  message: string;
  action: string;
  severity: "High" | "Medium" | "Low";
  href: string;
};

function num(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

// Words that unambiguously ask for a drafted message. They take priority
// because a question like "remind parents about unpaid invoices" is about the
// reminder even though it also names fees.
const REMINDER_ACTIONS = [
  "reminder", "remind", "draft", "notify", "notification", "send",
  "message", "sms", "whatsapp", "email", "letter",
];

const INTENT_KEYWORDS: Array<{ intent: InsightIntent; words: Array<[string, number]> }> = [
  { intent: "intervention", words: [["intervention", 3], ["urgent", 3], ["risk", 2], ["struggling", 2], ["failing", 2], ["attention", 2], ["review", 1], ["help", 1], ["problem", 1]] },
  { intent: "fees", words: [["fee", 2], ["fees", 2], ["invoice", 2], ["invoices", 2], ["collection", 2], ["collect", 2], ["payment", 2], ["revenue", 2], ["money", 1], ["paid", 1], ["unpaid", 2], ["outstanding", 2], ["debtor", 2], ["balance", 1], ["bursar", 1], ["owe", 2], ["owing", 2], ["due", 1]] },
  { intent: "attendance", words: [["attendance", 3], ["absent", 2], ["absence", 2], ["present", 1], ["late", 1], ["register", 2], ["class", 2], ["classes", 2], ["drop", 2], ["punctual", 2]] },
];

export function detectIntent(question: string): InsightIntent {
  const tokens = new Set(question.toLowerCase().split(/[^a-z]+/).filter(Boolean));
  if (tokens.size === 0) return "general";
  for (const action of REMINDER_ACTIONS) {
    if (tokens.has(action)) return "reminder";
  }
  let best: InsightIntent = "general";
  let bestScore = 0;
  for (const { intent, words } of INTENT_KEYWORDS) {
    let score = 0;
    for (const [word, weight] of words) {
      if (tokens.has(word)) score += weight;
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return best;
}

export function hasInsightData(context: InsightContext): boolean {
  return (
    context.students > 0 ||
    num(context.finance?.invoice_count) > 0 ||
    context.attendanceDaily.length > 0 ||
    context.resultTerms.length > 0
  );
}

function nameOf(row: RiskRow): string {
  return row.student_name?.trim() || row.admission_no?.trim() || "An unnamed record";
}

function riskReasons(row: RiskRow): string[] {
  const reasons: string[] = [];
  if (num(row.absent_count) > 0) {
    reasons.push(`${num(row.absent_count)} ${plural(num(row.absent_count), "absence", "absences")}`);
  }
  if (num(row.outstanding_balance) > 0) {
    reasons.push(`${formatNairaCompact(row.outstanding_balance)} unpaid`);
  }
  if (num(row.result_records) > 0 && num(row.average_score) < 65) {
    reasons.push(`averaging ${num(row.average_score)}%`);
  }
  return reasons;
}

function buildInterventionAnswer(context: InsightContext): InsightAnswer {
  const urgent = context.risks.filter((row) => row.risk_level_computed === "High");
  const watch = context.risks.filter((row) => row.risk_level_computed === "Medium");

  if (!context.risks.length) {
    return {
      intent: "intervention",
      title: "No intervention cases right now",
      body: context.students === 0
        ? "There are no student records yet, so there is nothing to assess. Once students are enrolled and registers, invoices and scores begin to flow in, this view will surface the children who need attention first."
        : "None of the assessed students currently meet the threshold for intervention. The assessment combines attendance below 75%, unpaid balances, overdue invoices and averages below 65%.",
      facts: context.students === 0 ? [] : [`${context.students} ${plural(context.students, "student", "students")} assessed`],
      action: context.students === 0 ? { label: "Enrol students", href: "/dashboard/setup" } : undefined,
    };
  }

  const total = urgent.length + watch.length;
  const top = urgent[0] ?? watch[0];
  const topReasons = top ? riskReasons(top) : [];
  const body = total === 1
    ? `${nameOf(top)} is the one student currently flagged${topReasons.length ? ` (${topReasons.join(", ")})` : ""}. A class-teacher review with the guardian is the fastest way to understand what is happening.`
    : `${total} ${plural(total, "student is", "students are")} currently flagged (${urgent.length} urgent, ${watch.length} to watch). The most pressing case is ${nameOf(top)}${topReasons.length ? `, with ${topReasons.join(", ")}` : ""}. Start there, then work down the list.`;

  return {
    intent: "intervention",
    title: total === 1 ? "1 student needs attention" : `${total} students need attention`,
    body,
    facts: context.risks.slice(0, 5).map((row) => {
      const reasons = riskReasons(row);
      const where = row.classroom ? ` · ${row.classroom}` : "";
      return `${nameOf(row)}${where} — ${row.risk_level_computed} risk (${reasons.length ? reasons.join(", ") : "see record"})`;
    }),
    action: { label: "Open student records", href: "/dashboard/students" },
  };
}

function buildFeesAnswer(context: InsightContext): InsightAnswer {
  const finance = context.finance;
  const billed = num(finance?.total_billed);
  const collected = num(finance?.total_collected);
  const outstanding = num(finance?.total_outstanding);
  const overdue = num(finance?.overdue_count);
  const invoiceCount = num(finance?.invoice_count);

  if (!finance || invoiceCount === 0) {
    return {
      intent: "fees",
      title: "No fee records yet",
      body: "No invoices have been raised, so there is no collection position to report. Once the bursar raises invoices for the term, this view will track what has been collected, what is outstanding and what is overdue.",
      facts: [],
      action: { label: "Create an invoice", href: "/dashboard/fees/invoices" },
    };
  }

  const rate = billed > 0 ? Math.round((collected / billed) * 100) : 0;
  const body = outstanding <= 0
    ? `All ${formatNaira(billed)} billed this period has been collected. That is a clean position — the priority now is keeping receipts issued promptly so guardians stay confident.`
    : `${formatNaira(outstanding)} of ${formatNaira(billed)} billed is still outstanding (${rate}% collected). ${overdue > 0 ? `${overdue} ${plural(overdue, "invoice is", "invoices are")} past due and should go to the bursar's follow-up list first.` : "Nothing is past due yet, so early reminders should recover most of the balance."}`;

  const facts = [
    `Billed ${formatNairaCompact(billed)} · collected ${formatNairaCompact(collected)} · outstanding ${formatNairaCompact(outstanding)}`,
    `${num(finance.paid_count)} paid in full · ${overdue} overdue · ${invoiceCount} invoices raised`,
  ];
  for (const invoice of context.overdueInvoices.slice(0, 3)) {
    const who = invoice.student_name?.trim() ? ` (${invoice.student_name})` : "";
    facts.push(`${invoice.invoice_no ?? "Invoice"}${who} — ${formatNairaCompact(invoice.balance)} outstanding`);
  }

  return {
    intent: "fees",
    title: outstanding <= 0 ? "Fees fully collected" : `${formatNairaCompact(outstanding)} still outstanding`,
    body,
    facts,
    action: { label: "Open fee records", href: "/dashboard/fees" },
  };
}

function buildReminderAnswer(context: InsightContext): InsightAnswer {
  const outstanding = num(context.finance?.total_outstanding);
  const overdue = num(context.finance?.overdue_count);
  const school = context.schoolName ?? "the school";

  if (!context.finance || num(context.finance.invoice_count) === 0) {
    return {
      intent: "reminder",
      title: "Nothing to remind anyone about",
      body: "There are no invoices yet, so a reminder would have nothing to say. Raise invoices first; the reminder draft will then include the real outstanding amount and where to pay.",
      facts: [],
      action: { label: "Create an invoice", href: "/dashboard/fees/invoices" },
    };
  }

  if (outstanding <= 0) {
    return {
      intent: "reminder",
      title: "No reminder needed",
      body: "Every invoice is settled, so sending a reminder now would only confuse guardians. If you still want to write to parents, an announcement about school activities would serve better.",
      facts: [`${num(context.finance.invoice_count)} ${plural(num(context.finance.invoice_count), "invoice", "invoices")} · all paid`],
      action: { label: "Write an announcement", href: "/dashboard/communications" },
    };
  }

  const urgency = overdue > 0
    ? `${overdue} ${plural(overdue, "account is", "accounts are")} already past due, so the tone below is firm but respectful.`
    : "Nothing is past due yet, so a friendly early reminder is the right tone.";
  const draft = `Dear Parent/Guardian, this is a friendly reminder from ${school} that ${formatNaira(outstanding)} in school fees is still outstanding across ${num(context.finance.invoice_count)} ${plural(num(context.finance.invoice_count), "invoice", "invoices")}. Kindly complete payment before the due date so your child's records stay clear. Thank you.`;

  return {
    intent: "reminder",
    title: "Reminder draft, ready to send",
    body: `${urgency} Review the wording, then send it from the communications page.`,
    facts: [draft, `${formatNairaCompact(outstanding)} outstanding in total · ${overdue} overdue`],
    action: { label: "Open communications", href: "/dashboard/communications" },
  };
}

function buildAttendanceAnswer(context: InsightContext): InsightAnswer {
  const days = context.attendanceDaily;
  const classes = context.classAttendance;

  if (days.length === 0) {
    return {
      intent: "attendance",
      title: "No registers submitted yet",
      body: context.students === 0
        ? "There are no students and no registers yet. Once classes are set up and teachers begin marking attendance, this view will show daily reliability and flag classes whose attendance is falling."
        : "No class register has been submitted yet. Attendance analysis begins the moment teachers start marking — even one week of registers is enough to spot patterns.",
      facts: [],
      action: { label: "Mark attendance", href: "/dashboard/attendance/mark" },
    };
  }

  const latest = days[0];
  const latestRate = num(latest.total_marked) > 0
    ? Math.round((num(latest.present_count) / num(latest.total_marked)) * 100)
    : 0;
  const weak = [...classes].filter((row) => row.marked >= 5 && row.rate < 85).sort((a, b) => a.rate - b.rate).slice(0, 3);

  const body = weak.length === 0
    ? `The latest register shows ${latestRate}% present, and no class with enough records is falling behind. Keep the registers coming — consistency is what makes this analysis trustworthy.`
    : `The latest register shows ${latestRate}% present. ${weak.map((row) => `${row.classroom} (${row.rate}% over ${row.marked} records)`).join(", ")} ${plural(weak.length, "is", "are")} the weakest ${plural(weak.length, "class", "classes")} in the recent period and ${plural(weak.length, "deserves", "deserve")} a check-in with the class teacher.`;

  const facts = [
    `Latest register: ${num(latest.present_count)} present · ${num(latest.absent_count)} absent · ${num(latest.late_count)} late`,
    `Overall recent rate: ${context.attendanceRate}% across ${days.length} ${plural(days.length, "day", "days")} of registers`,
  ];
  for (const row of weak) {
    facts.push(`${row.classroom}: ${row.rate}% present (${row.present} of ${row.marked} records)`);
  }

  return {
    intent: "attendance",
    title: weak.length === 0 ? "Attendance looks steady" : `${weak.length} ${plural(weak.length, "class needs", "classes need")} a closer look`,
    body,
    facts,
    action: { label: "Open attendance", href: "/dashboard/attendance" },
  };
}

function buildGeneralAnswer(context: InsightContext): InsightAnswer {
  if (!hasInsightData(context)) {
    return {
      intent: "general",
      title: context.schoolName ? `Welcome to ${context.schoolName}` : "Let's get your school set up",
      body: "There is no school data yet, so there is nothing to analyse — and this page will not pretend otherwise. Work through the setup steps to add classes, students and fees; the moment real records exist, this space will brief you on them every day.",
      facts: [],
      action: { label: "Set up your school", href: "/dashboard/setup" },
    };
  }

  const parts: string[] = [];
  if (context.students > 0) parts.push(`${context.students} ${plural(context.students, "student", "students")}`);
  if (context.teachers > 0) parts.push(`${context.teachers} ${plural(context.teachers, "staff member", "staff members")}`);
  if (context.classes > 0) parts.push(`${context.classes} ${plural(context.classes, "class", "classes")}`);
  const outstanding = num(context.finance?.total_outstanding);
  const invoiceCount = num(context.finance?.invoice_count);

  const highlights: string[] = [];
  if (context.highRisk > 0) highlights.push(`${context.highRisk} urgent student ${plural(context.highRisk, "case", "cases")}`);
  if (outstanding > 0 && invoiceCount > 0) highlights.push(`${formatNairaCompact(outstanding)} in fees outstanding`);
  if (context.attendanceDaily.length > 0) highlights.push(`${context.attendanceRate}% recent attendance`);

  return {
    intent: "general",
    title: `Today at ${context.schoolName ?? "your school"}`,
    body: highlights.length === 0
      ? `Your records cover ${parts.join(", ")}. Nothing needs urgent attention right now — ask about students, fees, reminders or attendance whenever you need detail.`
      : `Your records cover ${parts.join(", ")}. The headlines today: ${highlights.join(" · ")}. Ask about any of them for the full picture.`,
    facts: highlights.map((highlight) => highlight.charAt(0).toUpperCase() + highlight.slice(1)),
    action: context.highRisk > 0 ? { label: "Review urgent cases", href: "/dashboard/students" } : undefined,
  };
}

export function answerInsight(context: InsightContext, question: string): InsightAnswer {
  const intent = detectIntent(question);
  switch (intent) {
    case "intervention":
      return buildInterventionAnswer(context);
    case "fees":
      return buildFeesAnswer(context);
    case "reminder":
      return buildReminderAnswer(context);
    case "attendance":
      return buildAttendanceAnswer(context);
    default:
      return buildGeneralAnswer(context);
  }
}

/**
 * Decision queue for the intelligence page: at most five signals, worst
 * first, each pointing at the screen where it can be acted on. An empty
 * school yields an empty queue rather than invented urgency.
 */
export function buildDecisionQueue(context: InsightContext): DecisionSignal[] {
  const queue: DecisionSignal[] = [];

  const urgent = context.risks.filter((row) => row.risk_level_computed === "High");
  if (urgent.length > 0) {
    const top = urgent[0];
    queue.push({
      title: `${urgent.length} urgent student ${plural(urgent.length, "case", "cases")}`,
      message: `${nameOf(top)}${top.classroom ? ` (${top.classroom})` : ""} needs review first${riskReasons(top).length ? `: ${riskReasons(top).join(", ")}` : ""}.`,
      action: "Schedule class-teacher review and notify the guardian",
      severity: "High",
      href: "/dashboard/students",
    });
  }

  const overdue = num(context.finance?.overdue_count);
  const outstanding = num(context.finance?.total_outstanding);
  if (overdue > 0) {
    queue.push({
      title: `${formatNairaCompact(outstanding)} outstanding, ${overdue} overdue`,
      message: `${overdue} ${plural(overdue, "invoice is", "invoices are")} past due. These go to the bursar's follow-up list before anything else.`,
      action: "Follow up overdue invoices",
      severity: "High",
      href: "/dashboard/fees",
    });
  } else if (outstanding > 0 && num(context.finance?.invoice_count) > 0) {
    queue.push({
      title: `${formatNairaCompact(outstanding)} awaiting payment`,
      message: "Nothing is past due yet — early reminders should recover most of this balance.",
      action: "Send fee reminders",
      severity: "Medium",
      href: "/dashboard/communications",
    });
  }

  const weak = [...context.classAttendance]
    .filter((row) => row.marked >= 5 && row.rate < 85)
    .sort((a, b) => a.rate - b.rate)[0];
  if (weak) {
    queue.push({
      title: `${weak.classroom} attendance at ${weak.rate}%`,
      message: `${weak.absent} ${plural(weak.absent, "absence has", "absences have")} been recorded recently in this class.`,
      action: "Check in with the class teacher",
      severity: weak.rate < 70 ? "High" : "Medium",
      href: "/dashboard/attendance",
    });
  }

  const pendingResults = context.resultTerms.reduce(
    (total, term) => total + num(term.draft_count) + num(term.review_count),
    0,
  );
  if (pendingResults > 0) {
    const term = context.resultTerms[0];
    queue.push({
      title: `${pendingResults} result ${plural(pendingResults, "entry", "entries")} awaiting approval`,
      message: `${term?.term ?? "Current term"}${term?.session ? `, ${term.session} session` : ""} still has scores in draft or review.`,
      action: "Review and publish results",
      severity: "Medium",
      href: "/dashboard/results/publish",
    });
  }

  const watch = context.risks.filter((row) => row.risk_level_computed === "Medium");
  if (watch.length > 0) {
    queue.push({
      title: `${watch.length} ${plural(watch.length, "student", "students")} to watch`,
      message: `${nameOf(watch[0])} and ${watch.length === 1 ? "no others" : `${watch.length - 1} more`} show early warning signs worth monitoring.`,
      action: "Monitor and follow up",
      severity: "Low",
      href: "/dashboard/students",
    });
  }

  const rank = { High: 0, Medium: 1, Low: 2 } as const;
  return queue.sort((a, b) => rank[a.severity] - rank[b.severity]).slice(0, 5);
}
