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
- Demo admin dashboard
- Student management screen
- Teacher management screen
- Attendance overview
- Results overview
- Fees/invoice overview
- Health API endpoint at `/api/health`
- Prisma/PostgreSQL schema for SaaS school operations
- Seed script foundation
- CI workflow
- Security, contribution and architecture documentation

---

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS, custom design system |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth Foundation | Auth.js / NextAuth-ready |
| Email | Resend-ready |
| Payments | Paystack/Stripe-ready placeholders |
| Charts/UI | Recharts, Lucide Icons |
| Deployment | Vercel-ready |

---

## Project Structure

```txt
app/                    Next.js app routes, dashboard pages and API routes
components/             Reusable UI and layout components
lib/                    Demo data and future utilities
prisma/                 Prisma schema and seed script
docs/                   Architecture and product documentation
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

Open http://localhost:3000.

---

## Demo Routes

```txt
/                       Landing page
/dashboard              Admin overview
/dashboard/students     Student management
/dashboard/teachers     Teacher management
/dashboard/attendance   Attendance overview
/dashboard/results      Results overview
/dashboard/fees         Fees/invoices overview
/api/health             Health check API
```

---

## Roadmap

- Authentication and role-based access control
- Multi-school workspace onboarding
- Student enrollment forms
- Parent and student portals
- Teacher grade entry workflow
- Attendance marking workflow
- Report card PDF generation
- Fee payment integration with Paystack
- Email/SMS reminders
- Audit logs
- Admin analytics charts
- Automated tests
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
