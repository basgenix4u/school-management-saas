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
