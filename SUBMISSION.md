# Submission

## Links

- **GitHub repository:** https://github.com/deepraj-51/fleet-maintenance
- **Live application:** https://fleet-maintenance-frontend.onrender.com/

## Notes for the reviewer

Both the frontend and backend are hosted on Render's free tier, and
the backend goes to sleep after a period of inactivity. The first
request — including your first login — can take 30–60 seconds to
wake it up. If the app looks stuck at first, that's why. Give it a
minute and try again; it stays fast after that.

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | demo1@gmail.com | demo12345 |
| Technician | technician@gmail.com | tech1234 |

## Stack

| Layer | What you used | Why |
|-------|---------------|-----|
| Frontend | React (JavaScript), Vite, Tailwind CSS, React Router, Axios, Recharts | Fastest stack I could move in confidently under a one-week deadline |
| Backend | Spring Boot, Spring Data JPA, Spring Security (JWT) | Same reason — most confident, fastest to build correctly |
| Database | PostgreSQL | Relational fit for the data (vehicles, records, assignments, audit log) and what I'm most comfortable with |
| Hosting | Render (free tier), both frontend and backend | Straightforward GitHub-connected deploys, no cost |

## Goal checklist

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Roles with server-enforced permissions | Done | Enforced via Spring Security, not just hidden in the UI |
| 2 | Vehicle CRUD + archive/restore | Done | Archive is a soft delete; service history is preserved |
| 3 | Service records tied to vehicles | Done | |
| 4 | Due → Booked → In Service → Completed lifecycle | Done | Illegal transitions are rejected server-side with a clear error |
| 5 | Many-to-many technician assignment | Done | Assign/unassign tracked with timestamps, not just current state |
| 6 | Server-side search/filter/pagination | Done | Text search, status filter, and pagination, combined via JPA Specifications |
| 7 | CSV bulk upload + export | Done | Per-row report on upload; per-vehicle service history export |
| 8 | Dashboard with stats + 8-week chart | Done | |
| 9 | Immutable audit timeline | Done | Append-only — no update/delete exposed on that repository at all |
| 10 | Overdue alerts with dismiss/reappear | Done | Backed by an hourly scheduled job, not computed live on each request |

## How much time did you actually spend?

Around 12–15 hours, spread across the week.

## What would you do next, with another 12 hours?

In priority order:

1. **Flyway migrations** instead of Hibernate's `ddl-auto=update` —
   this is the biggest real production gap in the project right now.
2. **Refresh tokens** — right now the JWT just expires after 24
   hours with no renewal path, so a user gets silently logged out
   mid-session.
3. **Email notifications** when a vehicle becomes overdue, instead
   of only an in-app alert — this is probably the single most
   useful real-world feature that isn't built yet.
4. **Vehicle-level permissions for technicians** — right now any
   technician can see any vehicle or record; a real fleet would
   likely want technicians scoped to only what's assigned to them.

## What are you least happy with in this codebase, and why?

The due-vehicle detection job re-checks vehicles one at a time in a
loop rather than as a single batch query. It's fine at the scale
this app runs at, but it's the piece I'd fix first if this had to
handle a fleet of a few thousand vehicles instead of a handful.
