export type Tone = "emerald" | "blue" | "amber" | "rose" | "violet";

export const executiveMetrics = [
  {
    label: "Operational Health",
    value: "96.4%",
    change: "+4.2% this term",
    tone: "emerald" as Tone,
    detail: "Attendance, fee flow, result progress and teacher activity are above target.",
  },
  {
    label: "Revenue Predictability",
    value: "₦24.8M",
    change: "₦6.4M pending",
    tone: "blue" as Tone,
    detail: "Projected fee collection before term close based on invoice status and guardian behavior.",
  },
  {
    label: "Student Risk Signals",
    value: "37",
    change: "12 urgent",
    tone: "amber" as Tone,
    detail: "Students with attendance dips, unpaid fees or falling assessment patterns.",
  },
  {
    label: "Parent Engagement",
    value: "82%",
    change: "+18% vs last month",
    tone: "violet" as Tone,
    detail: "Portal views, message reads, invoice acknowledgement and result downloads.",
  },
];

export const commandModules = [
  {
    title: "Enroll a Student",
    description: "Capture biodata, guardian details, class placement and billing profile in one guided flow.",
    shortcut: "⌘E",
    status: "Ready",
  },
  {
    title: "Publish Results",
    description: "Validate scores, detect outliers, generate report cards and notify parents.",
    shortcut: "⌘R",
    status: "12 drafts",
  },
  {
    title: "Chase Payments",
    description: "Send intelligent reminders to guardians with outstanding balances.",
    shortcut: "⌘P",
    status: "₦6.4M due",
  },
  {
    title: "Mark Attendance",
    description: "Teacher-friendly class register with absence patterns and daily summaries.",
    shortcut: "⌘A",
    status: "Live",
  },
];

export const intelligenceSignals = [
  {
    title: "Attendance anomaly detected",
    severity: "High",
    message: "SS2 Science attendance dropped 8% after lunch period for three consecutive school days.",
    action: "Review timetable and teacher coverage",
  },
  {
    title: "Fee collection opportunity",
    severity: "Medium",
    message: "42 guardians historically pay within 48 hours after personalized reminder messages.",
    action: "Send targeted reminder batch",
  },
  {
    title: "Academic performance trend",
    severity: "Medium",
    message: "JSS3 Gold shows strong English improvement but Mathematics average is down 11%.",
    action: "Schedule intervention class",
  },
  {
    title: "Parent engagement boost",
    severity: "Low",
    message: "Result downloads increased after WhatsApp-style notification copy was introduced.",
    action: "Reuse copy for fee receipts",
  },
];

export const experienceTimeline = [
  { time: "07:30", title: "Morning attendance sync", text: "42 classes updated. 94.2% attendance captured before 8AM." },
  { time: "09:15", title: "Finance pulse", text: "₦1.8M received across 31 invoices. 12 partial payments reconciled." },
  { time: "11:40", title: "Teacher workflow", text: "18 teachers entered continuous assessment scores for second term." },
  { time: "13:10", title: "Risk engine", text: "12 students flagged for attendance + performance intervention." },
  { time: "15:00", title: "Parent communication", text: "684 guardians received dismissal and fee-balance updates." },
];

export const roleExperiences = [
  {
    role: "School Owner",
    promise: "Revenue, enrollment and school health in one executive command center.",
    features: ["Fee collection forecast", "Enrollment growth", "Teacher productivity", "Risk alerts"],
  },
  {
    role: "Principal",
    promise: "Academic quality, attendance and discipline visibility without spreadsheet chaos.",
    features: ["Class performance", "Attendance anomalies", "Result publishing", "Intervention tracking"],
  },
  {
    role: "Teacher",
    promise: "Fast daily workflows for attendance, scores, comments and class communication.",
    features: ["Smart registers", "Score sheets", "Report comments", "Class notices"],
  },
  {
    role: "Parent",
    promise: "Simple child progress, invoices, attendance and announcements from any phone.",
    features: ["Invoices", "Report cards", "Attendance", "Announcements"],
  },
];

export const financeTrend = [64, 72, 58, 81, 86, 91, 78, 96, 102, 118, 124, 138];
export const attendanceTrend = [91, 94, 95, 92, 96, 93, 97, 94, 95, 96, 98, 94];

export const launchChecklist = [
  { item: "Create school workspace", status: "Completed", progress: 100 },
  { item: "Configure classes and arms", status: "In progress", progress: 72 },
  { item: "Invite teachers and accountants", status: "Ready", progress: 44 },
  { item: "Import student records", status: "Ready", progress: 38 },
  { item: "Connect payment provider", status: "Pending", progress: 18 },
  { item: "Publish parent portal", status: "Pending", progress: 12 },
];
