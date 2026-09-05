# Schema

## Table by table: columns and types

### `users`

| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL PK | |
| email | VARCHAR(255) UNIQUE NOT NULL | login identifier |
| password_hash | VARCHAR(255) NOT NULL | BCrypt hash, never the raw password |
| full_name | VARCHAR(255) NOT NULL | |
| role | VARCHAR(20) NOT NULL | CHECK IN ('FLEET_MANAGER', 'TECHNICIAN') |
| created_at | TIMESTAMPTZ NOT NULL DEFAULT now() | |

### `vehicles`

| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL PK | |
| registration_number | VARCHAR(50) UNIQUE NOT NULL | set once at creation, never editable afterward |
| make | VARCHAR(100) NOT NULL | |
| model | VARCHAR(100) NOT NULL | |
| current_odometer | INTEGER NOT NULL | CHECK >= 0 |
| date_interval_days | INTEGER NOT NULL | CHECK > 0 |
| mileage_interval | INTEGER NOT NULL | CHECK > 0 |
| last_service_date | DATE | null until the vehicle's first completed service |
| last_service_odometer | INTEGER | null until the vehicle's first completed service |
| archived | BOOLEAN NOT NULL DEFAULT false | soft delete flag |
| created_at | TIMESTAMPTZ NOT NULL DEFAULT now() | |

### `service_records`

| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL PK | |
| vehicle_id | BIGINT NOT NULL REFERENCES vehicles(id) | |
| description | TEXT NOT NULL | |
| status | VARCHAR(20) NOT NULL DEFAULT 'DUE' | CHECK IN ('DUE','BOOKED','IN_SERVICE','COMPLETED') |
| scheduled_date | DATE | set when it moves to BOOKED |
| completed_date | DATE | set when it moves to COMPLETED |
| completed_odometer | INTEGER | set when it moves to COMPLETED |
| became_due_at | TIMESTAMPTZ NOT NULL DEFAULT now() | |
| alert_dismissed_at | TIMESTAMPTZ | null means the overdue alert is still active |
| created_at | TIMESTAMPTZ NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ NOT NULL DEFAULT now() | |

### `service_assignments`

| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL PK | |
| service_record_id | BIGINT NOT NULL REFERENCES service_records(id) | |
| technician_id | BIGINT NOT NULL REFERENCES users(id) | |
| assigned_at | TIMESTAMPTZ NOT NULL DEFAULT now() | |
| unassigned_at | TIMESTAMPTZ | null means still currently assigned |

### `service_record_events`

| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL PK | |
| service_record_id | BIGINT NOT NULL REFERENCES service_records(id) | |
| event_type | VARCHAR(30) NOT NULL | CREATED, STATUS_CHANGE, ASSIGNED, UNASSIGNED, NOTE |
| old_value | TEXT | nullable, meaning depends on event_type |
| new_value | TEXT | nullable, meaning depends on event_type |
| note | TEXT | nullable, free text |
| performed_by | BIGINT NOT NULL REFERENCES users(id) | system-generated events are attributed to a seeded system user, never null |
| created_at | TIMESTAMPTZ NOT NULL DEFAULT now() | |

## Which relationships are one-to-many, and which are many-to-many?

**One-to-many:**
- `vehicles` → `service_records` (one vehicle has many service records)
- `service_records` → `service_record_events` (one record accumulates many audit events over its lifetime)
- `users` → `service_record_events` (one user, as `performed_by`, can be the actor behind many events)

**Many-to-many:**
- `service_records` ↔ `users` (technicians), resolved through the `service_assignments` join table. I gave that join table its own real columns (`assigned_at`, `unassigned_at`) instead of using a plain two-column join table, because the assignment history itself needed to be queryable — a bare join table can tell you *who's* assigned right now, but not *when* an assignment started or ended, which the audit timeline needs.

## Which constraints are enforced by the database, and which by application code — and why?

**Database-enforced:**
- Uniqueness (`email`, `registration_number`) — this has to be atomic and race-safe, and the database is the only place that can guarantee that under concurrent requests. Two simultaneous registration attempts with the same email need the database's unique index to be the final arbiter, not an application-level check-then-insert that has a race window.
- Foreign keys — referential integrity (you can't have a service record pointing at a vehicle that doesn't exist) is a structural guarantee I want the database itself to hold, not something I trust every code path to remember to check.
- Basic value sanity (`CHECK` constraints on odometer >= 0, intervals > 0, role and status enums) — these are cheap, permanent, and don't depend on any other row's state, so there's no reason to leave them to application code where a future bug could skip the check.

**Application-code-enforced:**
- The entire lifecycle state machine (`DUE → BOOKED → IN_SERVICE → COMPLETED`) — this is *not* a database constraint. It lives entirely in `ServiceRecordService.transition()` as a lookup map. I drew the line here because the rule isn't about a single column's value in isolation — it's about a value transition depending on the row's current state, which needs the same read-then-write logic already happening at the service layer anyway. A database-level constraint (a trigger, say) could technically enforce it too, but it would duplicate logic across two places and be harder to give a clear, specific error message from ("you can't go from DUE to COMPLETED directly" is much easier to produce and test in Java than in a Postgres trigger).
- Whether an odometer reading can *decrease* during a CSV bulk update — this depends on comparing the incoming value to the vehicle's current stored value, which is exactly the kind of cross-row business rule I don't want living in the schema.
- Preventing a second `DUE` record from being created for a vehicle that already has one open — checked in the scheduler before insert, not a database uniqueness constraint, since "no more than one *open* record per vehicle" isn't expressible as a simple unique index (it depends on `status`, not just `vehicle_id`).

The general principle: constraints that are true regardless of any other row's state went in the database; constraints that depend on comparing against current state, or that need a specific, explainable rejection reason, went in the service layer.

## What did I deliberately denormalize?

`vehicles.last_service_date` and `vehicles.last_service_odometer` are redundant — both values are technically derivable by finding the most recent `COMPLETED` `service_records` row for that vehicle. I stored them directly on `vehicles` anyway, updated at the moment a record completes, because the hourly due-detection job and the vehicle list page both need this value on *every single vehicle*, every run — recomputing it via a per-vehicle subquery or join at that frequency would be materially more expensive than keeping one small, cheap-to-update pair of columns in sync at write time. This is the one place I chose write-time cost (updating two extra columns on completion) over read-time cost (a join or subquery on every scheduler tick and every vehicle list load), because reads happen far more often than completions do.

## What would break first at 100x the data?

**The due-detection scheduler.** It currently loops over every active vehicle and issues a separate existence-check query per vehicle (`existsByVehicleIdAndStatusIn`). At current scale that's fine; at 100x it becomes 100x the round-trips on every single hourly run, and it's the first thing I'd rewrite — into one batch query that returns all vehicles needing a new `DUE` record in a single round trip, instead of one query per vehicle.

**Missing indexes on foreign keys and filter columns.** Postgres does not automatically index foreign key columns the way it indexes primary keys. Right now `service_records.vehicle_id`, `service_assignments.service_record_id`, `service_assignments.technician_id`, and `service_record_events.service_record_id` have no explicit index beyond what the FK constraint itself requires (none) — small tables hide this completely, but at 100x scale every join and every timeline lookup would start doing sequential scans instead of index lookups. I'd add explicit B-tree indexes on all of these, plus on `service_records.status` and `service_records.scheduled_date`, since those are exactly the columns the search/filter endpoint (goal 6) filters on.

**Unpaginated endpoints.** `GET /api/vehicles` and `GET /api/vehicles/archived` currently return the full list with no pagination — fine for a handful of vehicles, but at 100x fleet size that response grows linearly with no cap, and the frontend renders the entire table into the DOM at once. This is the second thing I'd fix, using the same `Pageable` approach already built for the service record search endpoint.
