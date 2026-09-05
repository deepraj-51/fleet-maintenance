# Decisions

Log the decisions that actually shaped this codebase — the ones
where a real alternative existed and I picked one.

## Decision 1

- **Chose:** Spring Boot + React + PostgreSQL as the full stack.
- **Rejected:** Evaluating other stacks (e.g. Node/Express, or a
  different frontend framework) before starting.
- **Why:** Given a one-week deadline and a ~12-hour budget, the
  priority was maximizing time spent on the actual ten goals, not on
  learning or comparing technology. This is the stack I'm fastest
  and most confident in, so no time was spent second-guessing it.

## Decision 2

- **Chose:** Modeling technician assignment (`service_assignments`)
  as its own full JPA entity, with `assigned_at` and `unassigned_at`
  columns.
- **Rejected:** A plain `@ManyToMany` relationship with an implicit,
  columnless join table.
- **Why:** The audit timeline (goal 9) needs to show when a
  technician was assigned and unassigned, not just who's currently
  assigned. A bare `@ManyToMany` join table in JPA can't carry extra
  columns — modeling it as a real entity with `@ManyToOne` on both
  sides was the only way to keep that history queryable.

## Decision 3

- **Chose:** Detecting overdue vehicles via an hourly `@Scheduled`
  background job that writes a persistent `DUE` row.
- **Rejected:** Computing "is this vehicle due?" live, on every
  request, without storing anything.
- **Why:** The dismiss/reappear alert behavior (goal 10) needs an
  actual row to dismiss. If due-ness were computed fresh on every
  read instead of persisted, dismissal would need its own separate
  tracking table anyway to remember "the user already dismissed
  this" — so persisting the due state up front does double duty and
  avoids a second, parallel state to keep in sync.

## Decision 4

- **Chose:** A `CorsConfigurationSource` bean for CORS configuration.
- **Rejected:** A `CorsFilter` bean, registered directly.
- **Why:** `CorsFilter` is what I reached for first, and it's a
  perfectly valid Spring Security concept — it just isn't what
  `.cors(cors -> {})` in the security filter chain actually looks
  for. `.cors(cors -> {})` specifically resolves a
  `CorsConfigurationSource` bean; with only a `CorsFilter` present,
  it silently found nothing, and Spring Security's own filter chain
  kept rejecting the preflight request before it ever reached my
  filter. The error on the frontend ("No
  'Access-Control-Allow-Origin' header") looked identical either
  way, which is what made this take a second pass to actually fix.
- **Later reversed:** Yes — this is the reversed decision. The
  original `CorsFilter` approach didn't work in practice; I found
  out when registration requests kept failing with the exact same
  CORS error even after adding it. Swapping to a
  `CorsConfigurationSource` bean, with no other config changes,
  resolved it immediately.

## Decision 5

- **Chose:** Throwing plain `IllegalArgumentException` (mapped to
  400) and `IllegalStateException` (mapped to 409) from the service
  layer, caught by a single global `@RestControllerAdvice`.
- **Rejected:** Custom exception classes per error type (e.g.
  `InvalidTransitionException`, `VehicleNotFoundException`), or
  handling errors inline per-controller with try/catch.
- **Why:** The distinction that actually matters here isn't the
  specific error, it's whether the request itself was malformed (bad
  input → 400) versus whether the request was well-formed but
  arrived at the wrong time (valid input, wrong state — like an
  illegal lifecycle transition → 409). Two built-in exception types
  were enough to capture that distinction cleanly, and one global
  handler could map both consistently everywhere, rather than
  writing a growing set of custom exception classes or repeating
  try/catch blocks in every controller.

## Decision 6

- **Chose:** Storing the JWT in `localStorage` on the frontend.
- **Rejected:** An httpOnly cookie.
- **Why:** The frontend and backend are deployed as two separate
  services on different origins, not same-origin. `localStorage` was
  the simpler path to get working correctly under the deadline. I'm
  aware this is more exposed to XSS-based token theft than an
  httpOnly cookie would be, and I'd switch to a cookie-based approach
  first if this were going into real production use.

## Decision 7

- **Chose:** Hibernate's `ddl-auto=update` for schema management.
- **Rejected:** Flyway (or another versioned migration tool).
- **Why:** Speed, given the timeline — `ddl-auto=update` needs zero
  setup and just works as entities change. The real cost is that
  there's no reviewable, rollback-able migration history, which
  matters a lot more in a real production system than it does for a
  one-week take-home. `schema.md` serves as the documentation
  Flyway migrations would otherwise provide.
