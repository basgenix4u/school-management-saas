# EduManage School Management SaaS

EduManage is a full-stack SaaS school management platform for schools, academies and training institutions. It is designed to manage students, teachers, attendance, results, fees, parent communication and admin analytics from one modern dashboard.

👤 **Author:** [Abdulbasit Abdulalim](https://github.com/basgenix4u)  
🌐 **Portfolio:** https://alimswrite.com

---

## Why This Project Exists

Many schools still manage operations with paper records, spreadsheets and scattered WhatsApp messages. EduManage provides a structured SaaS foundation that can be extended into a real commercial school management product.

This repository demonstrates advanced full-stack skills for client-facing software:

- Multi-tenant SaaS data modelling
- Admin dashboards
- Student and teacher management
- Attendance workflows
- Results/report-card workflows
- Fees, invoices and payment-ready architecture
- Role-based access planning
- Production documentation and deployment readiness

---

## Current Features

- Professional landing page
- Premium executive command-center dashboard
- AI-style intelligence copilot experience
- Workspace onboarding launch flow
- Premium login and role-based access matrix
- Supabase Auth foundation with protected routes
- Audit trail and trust center experience
- Student 360 directory and profile experience
- Teacher daily workspace and smart attendance marking
- Attendance overview
- Results command center and report card designer
- Premium finance command center and invoice intelligence
- Health API endpoint at `/api/health`
- Prisma/PostgreSQL schema for SaaS school operations
- Supabase production schema migration, demo seed data, intelligence views and CRUD API layer
- Live UI wiring for Student 360, Finance, Attendance and Results modules
- Seed script foundation
- CI workflow
- Security, contribution and architecture documentation
- Launch-grade public pages: contact, support, FAQ, pricing, privacy, terms and security
- Professional brand assets and design system documentation

---

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS, custom design system |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth Foundation | Role-based architecture planned |
| Email | Resend-ready |
| Payments | Paystack/Stripe-ready placeholders |
| UI | Lucide Icons, custom dashboard components |
| Deployment | Vercel-ready |

---

## Project Structure

```txt
app/                    Next.js app routes, dashboard pages and API routes
components/             Reusable UI and layout components
lib/                    Demo data and future utilities
prisma/                 Prisma schema and seed script
docs/                   Architecture, UX strategy and product documentation
public/screenshots/     Screenshots for portfolio/demo assets
.github/workflows/      GitHub Actions CI
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/basgenix4u/school-management-saas.git
cd school-management-saas
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Update `DATABASE_URL`, auth secret, email and payment keys.

### 4. Generate Prisma client

```bash
npm run db:generate
```

### 5. Push schema to database

```bash
npm run db:push
```

### 6. Seed demo data

```bash
npm run db:seed
```

### 7. Run locally

```bash
npm run dev
```

Run full local checks:

```bash
npm run check
```

Open http://localhost:3000.

---

## Demo Routes

```txt
/                       Landing page
/dashboard              Executive command center
/dashboard/intelligence Intelligence center and AI-style copilot
/dashboard/onboarding   Workspace launch onboarding
/dashboard/launch       Production launch center
/dashboard/database     Supabase database control room
/dashboard/communications Communication center
/dashboard/communications/campaigns Campaign manager
/dashboard/access       Role-based access control matrix
/dashboard/audit        Audit trail and sensitive action monitoring
/dashboard/trust        Trust center and security posture
/login                  Supabase Auth login experience
/auth/callback          Supabase Auth callback
/portal/parent          Parent portal
/portal/student         Student portal
/dashboard/students     Student 360 directory
/dashboard/students/[id]  Student 360 profile
/dashboard/teachers     Teacher management
/dashboard/teacher-desk Teacher daily workspace
/dashboard/attendance/mark Smart attendance marking
/dashboard/attendance   Attendance overview
/dashboard/results      Results command center
/dashboard/results/entry Score entry matrix
/dashboard/results/report-card/[student] Report card preview
/dashboard/fees         Finance command center
/dashboard/fees/invoices Invoice intelligence board
/dashboard/fees/[invoice] Invoice detail workspace
/api/health             Health check API
```

---

## Premium UX Documentation

See `docs/UX_STRATEGY.md` for the product experience direction and high-end UX roadmap.

See `docs/AUTH_RBAC.md` for authentication and role-based access architecture. Demo credentials are documented there for development/testing.

See `docs/SUPABASE_SETUP.md` for Supabase database setup and migration details.

See `docs/REMAINING_FEATURES.md` for the full production roadmap.

See `docs/DEPLOYMENT_TESTING.md` for Vercel deployment, Supabase setup and QA testing steps.

See `docs/PRODUCT_UX_AUDIT.md` for the full product UX audit and conversion strategy.

See `docs/DESIGN_SYSTEM.md` for typography, color, component and layout standards.

See `docs/BRAND_ASSET_PROMPTS.md` for logo and marketing image generation prompts.

See `docs/IMAGE_ASSET_AUDIT.md` for uploaded image placement, usage and performance guidance.

---

## Roadmap

- Connect command center to live database metrics
- Supabase-backed CRUD for students, attendance, invoices and results
- Authentication and role-based access control
- Multi-school workspace onboarding
- Student enrollment forms
- Premium parent and student portals
- Premium score entry and report card designer
- Smart attendance marking workflow
- Report card PDF generation
- Fee payment integration with Paystack
- Communication center and campaign manager
- Email/SMS reminders
- Audit logs
- Real command palette and keyboard shortcuts
- Admin analytics charts
- Automated tests
- Production launch center
- Production deployment

---

## Security Notes

- Do not commit real `.env` files.
- Protect student and parent data with strict role-based permissions.
- Encrypt or hash sensitive credentials.
- Use audit logs for finance and result changes.
- Add authentication before connecting real school data.

---

## Author

Built and maintained by **Abdulbasit Abdulalim** — Full-stack Software Developer and Founder of **ALIM CREATIVE**.

- GitHub: https://github.com/basgenix4u
- Website: https://alimswrite.com
- LinkedIn: https://www.linkedin.com/in/abdulbasit-abdulalim-94a701354
