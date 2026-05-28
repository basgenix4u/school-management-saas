export const communicationMetrics = [
  { label: "Messages Sent", value: "2,842", change: "+18% this week", tone: "blue" },
  { label: "Read Rate", value: "87%", change: "+9%", tone: "emerald" },
  { label: "Fee Reminders", value: "42", change: "₦4.1M likely", tone: "amber" },
  { label: "Urgent Alerts", value: "7", change: "2 pending", tone: "rose" },
];

export const messageCampaigns = [
  { id: "CMP-001", title: "Second term fee reminder", audience: "Parents with balances", channel: "Email + WhatsApp", status: "Ready", recipients: 42, performance: 82 },
  { id: "CMP-002", title: "Open Day invitation", audience: "All parents", channel: "Email", status: "Scheduled", recipients: 1180, performance: 91 },
  { id: "CMP-003", title: "Attendance intervention", audience: "Risk guardians", channel: "SMS + Email", status: "Draft", recipients: 17, performance: 76 },
  { id: "CMP-004", title: "Result publication notice", audience: "SS2 Science parents", channel: "Portal + Email", status: "Sent", recipients: 45, performance: 94 },
];

export const messageTemplates = [
  { title: "Fee Balance Reminder", body: "Dear Parent/Guardian, this is a friendly reminder that your child has an outstanding school fee balance. Kindly complete payment before the due date. Thank you." },
  { title: "Attendance Concern", body: "Dear Parent/Guardian, we noticed repeated absences/late arrivals for your child. Kindly contact the school so we can support improvement." },
  { title: "Result Published", body: "Dear Parent/Guardian, your child’s report card is now available on the parent portal. Please log in to review academic progress." },
  { title: "Open Day Invitation", body: "Dear Parent/Guardian, you are invited to our Open Day session. We look forward to discussing your child’s academic progress." },
];

export const communicationTimeline = [
  { time: "08:00", title: "Fee reminder batch prepared", body: "42 guardians matched to pending balances and high payment probability." },
  { time: "09:30", title: "Open Day campaign scheduled", body: "Email campaign scheduled for all parent accounts." },
  { time: "10:15", title: "Attendance alerts generated", body: "17 guardians added to attendance intervention queue." },
  { time: "12:45", title: "Report card notification sent", body: "45 SS2 Science parents notified about approved results." },
];

export const communicationInsights = [
  { title: "WhatsApp-style copy increases fee response", detail: "Short personalized reminders are producing higher response rates for partial-payment guardians.", severity: "Low", action: "Use friendly reminder template" },
  { title: "Attendance alerts need escalation", detail: "7 guardians have not opened attendance intervention messages after 24 hours.", severity: "High", action: "Escalate to class teacher call list" },
  { title: "Open Day campaign ready", detail: "Audience is clean and duplicate contacts have been removed.", severity: "Medium", action: "Approve scheduled delivery" },
];
