# Architecture

## What are the moving pieces, and how do they talk to each other?

There are two independent applications and one shared contract between
them.

The **backend** is a Spring Boot REST API. Internally it's layered:
controllers receive HTTP requests and map them to DTOs, services hold
all business logic and transaction boundaries, repositories talk to
the database via Spring Data JPA, and a scheduler runs one background
job independent of any request. A security layer (JWT filter +
Spring Security config) sits in front of every controller.

The **frontend** is a React single-page app. It never talks to the
database directly — every piece of data it shows comes from calling
the backend's REST API over HTTP, using a small `api/` layer (one file
per backend resource: `vehicles.js`, `serviceRecords.js`, etc.) so the
shape of each request is defined in exactly one place.

The **database** is PostgreSQL, and only the backend talks to it —
the frontend has no direct database access at all, by design.

They talk to each other through one channel: HTTP, JSON bodies, and a
JWT sent as a `Bearer` token in the `Authorization` header on every
authenticated request. The frontend attaches that token automatically
via an Axios interceptor; the backend's `JwtAuthFilter` reads it,
validates it, and populates Spring Security's context so
`@AuthenticationPrincipal` and `hasRole(...)` checks work downstream.
There is no shared session state, no server-side session store, and
no direct coupling beyond that one HTTP contract — either side could
be rewritten in a different language without the other knowing.

## Where does each piece run?

Locally during development: the backend runs on `localhost:8080` via
`./mvnw spring-boot:run`, talking to a Postgres instance (run via
Docker locally). The frontend runs on `localhost:5173` via Vite's dev
server for day-to-day work, and on `localhost:4173` via `vite preview`
when testing the actual production build (this distinction mattered —
see the performance note below).

In deployment, the two are hosted as two separate services on free
tiers, each with its own URL, communicating over HTTPS. The backend
also owns its own environment variables (`DB_PASSWORD`, `JWT_SECRET`,
the Postgres connection string) and its own CORS allow-list, which has
to explicitly include whatever origin the frontend is actually served
from — this isn't automatic, and it's the one piece of config that
has to be updated by hand whenever either side's URL changes.

The scheduled due-detection job runs inside the backend process
itself, on the same JVM, on an hourly cron — there's no separate
worker or queue.

## What is the request path for one representative user action, end to end?

Take **a fleet manager transitioning a service record from `BOOKED` to
`IN_SERVICE`**, since it touches most of the stack:

1. On the service record detail page, the manager clicks "Mark as in
   service." The React component calls `transitionServiceRecord()` in
   `api/serviceRecords.js`.
2. Axios attaches the stored JWT as a `Bearer` token and sends
   `POST /api/service-records/{id}/transition` with `{ targetStatus: "IN_SERVICE" }`.
3. The request hits `JwtAuthFilter` first. It validates the token,
   loads the `User` from the database by the email in the token's
   subject claim, and sets it as the authenticated principal.
4. Spring Security's filter chain checks the route is allowed for an
   authenticated user (this endpoint has no role restriction beyond
   being logged in), then the request reaches `ServiceRecordController.transition()`.
5. The controller pulls the authenticated `User` via
   `@AuthenticationPrincipal` and calls
   `ServiceRecordService.transition(id, IN_SERVICE, actor, ...)`.
6. The service loads the record, checks the requested transition
   against the `LEGAL_TRANSITIONS` map (`BOOKED → IN_SERVICE` is
   valid), updates the record's status, and writes a new
   `ServiceRecordEvent` row (`STATUS_CHANGE`, old value `BOOKED`, new
   value `IN_SERVICE`, `performed_by` = the manager) in the same
   transaction.
7. The controller maps the updated entity back to a
   `ServiceRecordResponse` DTO and returns `200` with the new state,
   including the currently assigned technicians.
8. The frontend receives the response, updates its local state,
   shows an `aria-live` status message ("Status updated to in
   service"), and re-renders the badge and the lifecycle panel to
   reflect there's no further transition available until completion.

If the manager had instead tried an illegal transition (say,
`DUE → COMPLETED` directly), step 6 would throw an
`IllegalStateException`, the global `@RestControllerAdvice` would map
that to a `409` with a `{ "message": "..." }` body naming exactly why,
and the frontend would surface that message in the same error banner
rather than silently failing or showing a generic error.

## What did you decide not to build, and why?

**No Redux/Zustand.** The app's actual state needs — a handful of
list/detail pages, one auth context — didn't justify a global state
library. Plain `useState`/`useEffect` per page plus one `AuthContext`
was enough, and skipping it meant less boilerplate and fewer
concepts to explain.

**No Flyway migrations.** Schema is managed with Hibernate
`ddl-auto=update` for development speed within the one-week window.
`docs/schema.md` is the source of truth in its place. This is a
real gap for a production system — auto-DDL doesn't give you
reviewable, rollback-able migrations — and I'm naming it rather than
pretending `ddl-auto=update` is a permanent choice.

**No httpOnly cookie for the JWT.** It's stored in `localStorage`
instead, which is simpler when frontend and backend are separately
deployed services rather than same-origin, but is more exposed to
XSS-based token theft than a cookie would be. Chose the simpler path
given the timeline; flagged as the tradeoff it is.

**No live/on-the-fly due-date computation.** Vehicle due status is
computed by an hourly batch job and persisted as an actual `DUE` row,
not recalculated on every request. This was the more expensive choice
upfront, but it's what makes "dismiss now, reappear once still
overdue" (a real requirement) simple — a computed-on-read value would
still need its own separate table to track dismissal, so persisting
it does double duty.

**No SEO work.** Lighthouse flags a missing meta description and an
invalid `robots.txt` on every page. Left alone deliberately — this is
an internal, login-gated tool with no public pages meant to rank in
search results, so search-engine optimization doesn't map to a real
requirement here, and I'd rather spend the time on something that does.

**No batched/optimized queries in the due-detector.** It re-queries
per vehicle in a loop rather than one batch query. Fine at the data
scale a take-home realistically has; a known, named shortcut rather
than an oversight, and the first thing I'd fix if this had to run
against a fleet of thousands of vehicles.