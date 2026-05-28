# Authentication and RBAC Architecture

EduManage is designed for role-aware SaaS access across multiple schools.

## Roles

- `SUPER_ADMIN`: SaaS platform owner
- `SCHOOL_OWNER`: school proprietor/director
- `PRINCIPAL`: academic and operations lead
- `TEACHER`: classroom workflow user
- `ACCOUNTANT`: fees and payment user
- `PARENT`: parent portal user
- `STUDENT`: student portal user

## Permission Model

The permission model lives in `lib/rbac.ts` and maps every role to explicit permissions such as:

- `workspace.manage`
- `analytics.view`
- `students.manage`
- `teachers.manage`
- `attendance.mark`
- `results.manage`
- `fees.manage`
- `audit.view`

## Current Implementation

The current repository includes:

- Premium login UX at `/login`
- Role access matrix at `/dashboard/access`
- Demo auth architecture API at `/api/demo-auth`
- Type-safe role and permission definitions
- Role-specific workspace previews

## Production Implementation Plan

1. Add real authentication provider: Auth.js, Clerk or Supabase Auth.
2. Store users with `organizationId` and role.
3. Create route-level guards.
4. Add server-side permission checks for every mutation.
5. Add audit logs for sensitive operations.
6. Add session-aware dashboard redirects.
7. Add invitation flow for staff, parents and students.

## Security Requirement

Never rely only on client-side role checks. Every protected database query and mutation must validate:

- authenticated user
- organization membership
- role permission
- resource ownership/scope
