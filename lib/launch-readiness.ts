export const launchReadiness = [
  { area: "Product UX", status: "Advanced", score: 96, detail: "Premium command center, portals, role UX and operational modules are in place." },
  { area: "Database", status: "Connected", score: 88, detail: "Supabase schema, RLS foundation, seed data and intelligence views are available." },
  { area: "Authentication", status: "Designed", score: 72, detail: "RBAC architecture exists; production auth provider wiring is next." },
  { area: "Payments", status: "Designed", score: 70, detail: "Finance and invoice UX exists; Paystack/Stripe integration is next." },
  { area: "Reports", status: "Ready for PDF", score: 82, detail: "Report card designer exists; server PDF export is next." },
  { area: "Deployment", status: "Ready", score: 78, detail: "Build passes; environment configuration and Vercel setup are next." },
];

export const deploymentChecklist = [
  { title: "Push latest commits to GitHub", done: true },
  { title: "Configure Supabase environment variables", done: false },
  { title: "Deploy to Vercel", done: false },
  { title: "Add production domain", done: false },
  { title: "Enable real authentication", done: false },
  { title: "Connect live CRUD modules", done: false },
  { title: "Integrate payment provider", done: false },
  { title: "Generate screenshots and demo video", done: false },
];

export const clientDemoScript = [
  "Open the premium landing page and explain the School OS concept.",
  "Show the executive command center and intelligence layer.",
  "Open Student 360 and explain risk/guardian/finance/attendance context.",
  "Open Teacher Desk and mark attendance.",
  "Open Finance Command Center and invoice intelligence.",
  "Open Results module and preview report card.",
  "Open Parent Portal and Student Portal to show end-user experience.",
  "Open Trust Center and Audit Trail to show enterprise readiness.",
];
