export const auditEvents = [
  { id: "AUD-9001", actor: "Mrs. Grace Adams", role: "Teacher", action: "Updated Mathematics CA scores", resource: "SS2 Science", time: "2 min ago", risk: "Low" },
  { id: "AUD-9002", actor: "Mr. Daniel Okafor", role: "Accountant", action: "Reconciled partial payment", resource: "INV-2026-002", time: "14 min ago", risk: "Medium" },
  { id: "AUD-9003", actor: "Principal Office", role: "Principal", action: "Approved result publication", resource: "JSS3 Gold", time: "31 min ago", risk: "Medium" },
  { id: "AUD-9004", actor: "System Intelligence", role: "Automation", action: "Flagged attendance anomaly", resource: "SS2 Science", time: "45 min ago", risk: "High" },
  { id: "AUD-9005", actor: "Parent Portal", role: "Parent", action: "Downloaded report card", resource: "Amina Yusuf", time: "1 hr ago", risk: "Low" },
  { id: "AUD-9006", actor: "School Owner", role: "Owner", action: "Viewed finance forecast", resource: "Executive Dashboard", time: "2 hrs ago", risk: "Low" },
];

export const trustControls = [
  { title: "Role-Based Access", status: "Designed", detail: "Every workspace action maps to explicit permissions and role boundaries." },
  { title: "Tenant Data Isolation", status: "Planned", detail: "All production queries must enforce organization-level scoping." },
  { title: "Audit Logging", status: "Designed", detail: "Sensitive operations are structured for actor, action, resource, timestamp and risk review." },
  { title: "Secure Secrets", status: "Required", detail: "Production keys must live only in environment variables and deployment secrets." },
  { title: "Payment Safety", status: "Planned", detail: "Fee reconciliation should verify payment references server-side." },
  { title: "Student Data Protection", status: "Required", detail: "Student records require strict access checks and privacy-first UX." },
];

export const securityScores = [
  { label: "Access Design", score: 92 },
  { label: "Audit Readiness", score: 88 },
  { label: "Data Isolation Plan", score: 84 },
  { label: "Production Hardening", score: 76 },
];
