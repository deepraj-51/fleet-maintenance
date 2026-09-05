# AI prompts

I used Claude throughout this project as a coding collaborator — but
every architectural call, every bug diagnosis, and every fix that
actually shipped came from testing the app myself and directing the
work, not from accepting whatever came back. Logged below in the
order I used them, grouped by what I was doing.

## Deciding the stack and the plan

I came in with the stack already decided — Spring Boot, React,
Postgres — because it's what I can move fastest and most confidently
in under a one-week deadline. I used Claude to turn that decision
into a concrete day-by-day plan and an initial schema, then reviewed
and adjusted the relationships myself before building anything.

## Designing the database schema

I directed the schema design decision by decision: which fields each
table needed, and specifically why the technician-assignment
relationship couldn't be a plain many-to-many join table — I wanted
`assigned_at`/`unassigned_at` history for the audit timeline, which
meant it had to be its own entity. That requirement came from
re-reading the assignment's goal 9 myself, not from a suggestion.

## Building the backend

I built the backend layer by layer — enums, entities, repositories,
services, scheduler, security, controllers — reviewing each layer
before moving to the next rather than generating the whole thing at
once. This was a deliberate choice on my part: building in dependency
order (nothing depends on something that doesn't exist yet) let me
verify each piece was correct in isolation.

## Catching a real bug: CORS, fixed wrong the first time

**What happened:** I hit a genuine CORS failure when connecting my
frontend to my backend. The first fix I was given — a `CorsFilter`
bean — didn't work. I know this because I tested it myself: same
error, unchanged, after applying the fix.

**What I did about it:** I didn't just ask for another guess. I
pulled up my actual `SecurityConfig.java` and provided the real,
current state of my code so the actual bug could be found instead of
guessed at. That surfaced the real issue: `.cors(cors -> {})` in
Spring Security requires a `CorsConfigurationSource` bean
specifically, not a `CorsFilter`. I applied the corrected bean type,
restarted my backend, and verified it worked before moving on. This
is logged as a reversed decision in `decisions.md` because it's a
real example of a first attempt failing and a second, evidence-based
attempt fixing it.

## Catching a real bug: form input losing focus

**What happened:** While testing my own "Add Vehicle" form by hand —
not reading code, actually using the UI as a user would — I found
that typing into any field only accepted one letter before losing
focus, forcing a click between every keystroke. I caught this because
I tested my own work.

**What I did about it:** I described the exact symptom precisely
(what key sequence produced what behavior), which is what let the
root cause get found quickly: a helper component defined inside
another component's function body, causing React to remount the
input on every keystroke. I applied the fix, then verified it myself
by typing a full word continuously before considering it closed.

## Migrating to Tailwind and catching a rendering bug

I made the call to migrate the frontend to Tailwind mid-build, after
the app was already functionally complete, as a deliberate
improvement rather than something required. After the migration, I
checked the actual rendered pages myself, found the Service Records
and Bulk Upload pages visually broken (text with no spacing, no
visible input borders), and reported it with a screenshot rather than
just a description — that's what let the real cause (leftover dead
class names from deleted CSS files) get found and fixed correctly on
the first attempt.

## Running and verifying an accessibility/performance audit

I ran Lighthouse and axe DevTools against my own app — this wasn't
optional polish, it was a deliberate response to the assignment's
requirement that the UI meet real accessibility standards, not just
look accessible. When the initial performance scores came back
suspiciously low (40s-50s, with a claimed 10MB+ payload), I didn't
take the number at face value — I had it investigated, which
surfaced that I'd been testing against the dev server, not a
production build. I re-tested against my own production build myself
and confirmed real scores of 82-92 before considering that closed.
The two real accessibility issues that were found (color contrast,
an invalid aria-hidden/focusable combination) were fixed and then
independently re-verified by me running the audit a second time.

## Planning the commit history

Before writing a single commit, I made the call that committing
everything in one shot was the wrong approach for how this assignment
is graded — that it needed to show incremental, ordered process, not
just a final state. I directed the actual commit sequence to match
the real order I built things in throughout this project, then
reviewed and adjusted file paths against my actual project structure
before running any of it.
