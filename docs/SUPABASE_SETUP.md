# Supabase Setup

This project is connected to a Supabase project for production-style database readiness.

## Supabase Project

- Project name: ALIMS Project
- Project ref: `xevoiljsumlqqamqkwla`
- Region: `eu-central-1`

## Migration

The initial schema lives at:

```txt
supabase/migrations/202605290001_initial_school_os.sql
```

It creates:

- organizations
- app_users
- classrooms
- teachers
- students
- subjects
- attendance_records
- results
- invoices
- payments
- announcements
- audit_events

It also adds indexes, update triggers, RLS, demo read policies and demo seed data.

## Security

Never commit Supabase service role keys, access tokens or database passwords.

Use environment variables only:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
```

## Production RLS Plan

The migration enables RLS and adds demo authenticated-read policies. Before production launch, replace demo policies with strict organization-scoped policies based on `auth.uid()` and role membership.


## Database Intelligence Views

The second migration adds database-powered views and an RPC function:

```txt
v_command_center_summary
v_student_360
v_finance_summary
v_attendance_daily
v_results_summary
get_school_command_center(org_slug)
```

These views prepare the app for live dashboard metrics and replace mock data progressively.

## Runtime API Integration

The Next.js app includes Supabase-aware API routes:

```txt
/api/database/status
/api/database/command-center
```

These routes use environment variables and safely return `not_configured` if Supabase keys are not present in the runtime.


## CRUD API Layer

The project now includes Supabase-aware CRUD endpoints. They fall back to mock data when runtime environment variables are missing, and use Supabase when configured.

```txt
GET  /api/students
POST /api/students
GET  /api/students/[id]
PATCH /api/students/[id]

GET  /api/attendance
POST /api/attendance

GET  /api/finance/invoices
POST /api/finance/invoices
GET  /api/finance/invoices/[invoice]

GET  /api/results
POST /api/results
GET  /api/results/[student]

GET  /api/live/command-center
```

These endpoints are the bridge from premium UI prototypes to production database-backed workflows.
