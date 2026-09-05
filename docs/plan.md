# Plan

## How did I break the work into sessions?

I split it by day against the one-week deadline, budgeting roughly
2 hours a day against the ~12-hour estimate I'd been given, with the
last day held back for deployment and documentation rather than new
features:

| Day | Focus |
|---|---|
| 1 | Project setup, database schema, auth (roles + JWT), vehicle CRUD |
| 2 | Service record lifecycle state machine |
| 3 | Technician assignment, search/filter/paginate |
| 4 | CSV bulk upload + export, dashboard stats |
| 5 | Audit timeline, overdue alerts (dismiss/reappear) |
| 6 | Deployment, demo data, documentation |

In practice the frontend wasn't a separate day in this plan — it
ended up happening after the backend was fully working and tested
end-to-end through Postman, as its own extended pass, then a further
pass converting it to Tailwind, then a final pass fixing
accessibility and performance issues an audit turned up. So the real
shape ended up being: backend first, entirely, verified working on
its own — then frontend, entirely, built page by page against the
already-working API.

## What order did I build in, and why that order?

**Backend, strictly bottom-up:** enums, then entities, then
repositories, then services, then the scheduler, then security, then
controllers, then cross-cutting fixes (CORS, global exception
handling). Each layer only depends on the one below it, so building
in that order meant I was never blocked waiting on something that
didn't exist yet, and I could sanity-check each layer in isolation
before stacking the next one on top.

Within the backend, I did the **data model and the lifecycle state
machine before anything else** — vehicle CRUD, then the
`DUE → BOOKED → IN_SERVICE → COMPLETED` transitions — because
everything else in the assignment (search, the dashboard, the audit
timeline, alerts) is really just a different view or side-effect of
that same core data. Building search or the dashboard first would
have meant building against a model I hadn't finished deciding on
yet.

**Auth came before any protected endpoint**, not after, because I
didn't want to write a single controller and then have to retrofit
permission checks onto it later — every endpoint from `VehicleController`
onward was written already knowing which role could call it.

**Frontend, in the order a user actually moves through the app:**
auth pages first, then the layout shell, then vehicles, then service
records, then the dashboard, then bulk upload. This roughly matches
how a fleet manager would actually use the tool for the first time,
and it meant I always had a real, working screen to test the next
feature against rather than building in the dark.

I tested the entire backend independently through Postman — register,
login, CRUD, every lifecycle transition, assignment, search — before
writing a single line of frontend code, so that any bug I hit while
building the UI was much more likely to be a frontend bug, not an
ambiguous "is this frontend or backend" question.

## What did I estimate versus what it actually took?

I was given roughly 12 hours as the expected effort. I actually spent
around 12–15 hours. The overrun mostly came from three places that
weren't in the original plan at all: migrating the frontend from
hand-written CSS to Tailwind partway through (a deliberate scope
addition, not something that went wrong), debugging the CORS
configuration twice before it actually worked (documented in
`decisions.md`), and running a full accessibility and performance
audit pass with Lighthouse and axe, then fixing what it found — none
of which was in the original day-by-day plan, since I hadn't
initially scoped a dedicated audit step.

The ten backend goals themselves roughly matched my per-day estimate.
The frontend took longer than I'd implicitly assumed, because I
underestimated how much of it is genuinely separate work — forms,
validation, accessible modals, a real state machine mirrored in the
UI — rather than a thin layer over the API.

## What did I cut when I ran short?

- **Automated tests.** Everything was verified manually — through
  Postman for the backend and by hand through the browser for the
  frontend — rather than with a test suite. This is the single
  biggest thing I'd add back first with more time.
- **Flyway migrations**, in favor of Hibernate's `ddl-auto=update`.
  Documented as a known gap in `decisions.md` and `schema.md` rather
  than fixed.
- **Debouncing the service record search input** — it fires a
  request on every keystroke rather than waiting for a pause. Left
  as a known, named shortcut rather than fixed.
- **Batch querying in the due-detection scheduler** — it checks
  vehicles one at a time in a loop instead of one batch query.
  Fine at this data scale; the first thing that would need fixing
  at real fleet size.
- **A landing/marketing page.** Decided deliberately not to build
  one — it doesn't touch any of the 10 required goals or anything a
  grader actually needs to test the app, so it wasn't worth the time
  against the things that were still open.
- **Vehicle-level scoping for technicians.** Right now any
  technician can see any vehicle or record; a real deployment would
  likely want technicians restricted to only what's assigned to
  them. Cut for time, not forgotten.
