# Ship by Sunday Launch AGENTS

This workspace exists to launch `Ship by Sunday` as a sellable, deliverable, promotable product.

The goal is not to brainstorm endlessly or produce fake progress. The goal is to get the offer live, make the buyer journey work end to end, and create a real student experience that can convert and deliver.

## North Star

Launch `Ship by Sunday` so a cold or warm visitor can:

1. Understand the offer quickly
2. Buy cleanly
3. Get onboarded without confusion
4. Start the course immediately
5. Make progress toward a shipped v1

## What Is Already Locked

- Core offer: `Ship by Sunday`
- Core promise: `Go from idea to v1 this weekend`
- Core audience: builders who can already prototype or get things working, but keep getting stuck before they ship a real v1
- Core mechanism: `The Product Trinity` = product strategy, design, and development working together
- Product format: software-guided weekend sprint plus on-demand walkthroughs, digital guide/workbook, prompts, templates, and artifacts
- Product vehicle: the `Ship by Sunday` workspace plus the guided 4-block sprint
- Fear-reducing bonus: `Product Management for Beginners` for buyers who do not trust their product judgment yet
- Landing page strategy and offer critique are complete enough to move on
- App stack: `Next.js` app on `Vercel` with `Clerk` for auth, `Convex` for app data, and `Stripe` for checkout / entitlement handoff
- Tripwire is deprioritized for now

## Current Priorities

Do these before vanity work:

1. Record the core lessons
2. Finish the live `Stripe` -> `Clerk` -> `Convex` purchase-to-access handoff
3. Decide final lesson video hosting and attach the first real lesson media
4. Define the support inbox / ownership path and tighten live post-purchase `Start Here` guidance
5. Instrument minimum viable launch analytics and run the first full buyer journey QA pass

## What Not To Get Distracted By

- Tripwire strategy unless explicitly re-prioritized
- Broad content vault packaging
- Nice-to-have social content
- Large outbound volume before the product and buyer flow are stable
- More website strategy loops unless a real blocker appears

## Team

These are the working launch roles in `docs/internal/roles/` and what each one owns.

### Launch Chief of Staff / COO

File: `docs/internal/roles/launch-chief-of-staff-coo.md`

Owns launch sequencing, priorities, blockers, dependencies, founder-only asks, and daily operating cadence.

### Offer and Funnel Strategist

File: `docs/internal/roles/offer-and-funnel-strategist.md`

Owns offer clarity, funnel logic, objection handling, guarantee language, CTA logic, and commercial consistency.

### Course Operations Producer

File: `docs/internal/roles/course-operations-producer.md`

Owns lesson structure, student journey, template/resource audit, start-here flow, upload checklist, and support documentation.

### Founder Recording Producer

File: `docs/internal/roles/founder-recording-producer.md`

Owns recording packets, lesson-by-lesson recording schedule, talking points, screen-share notes, and pickup tracking.

### Lifecycle Email Strategist

File: `docs/internal/roles/lifecycle-email-strategist.md`

Owns launch emails, buyer onboarding emails, subject lines, sequence order, and segmentation logic.

### Design Production Lead

File: `docs/internal/roles/design-production-lead.md`

Owns sales page graphics, proof assets, thumbnails, promo visuals, and launch asset prioritization.

### Analytics and QA Operator

File: `docs/internal/roles/analytics-and-qa-operator.md`

Owns KPI tracking, event map, end-to-end QA, bug logging, and buyer journey validation.

### Outbound Systems and Deliverability Lead

File: `docs/internal/roles/outbound-systems-and-deliverability-lead.md`

Owns outbound setup, domains, inboxes, warmup, Instantly architecture, and deliverability risk management.

### List Building and Target Researcher

File: `docs/internal/roles/list-building-and-target-researcher.md`

Owns target segment definitions, outreach list quality, personalization fields, and fit-based segmentation.

### YouTube Launch Producer

File: `docs/internal/roles/youtube-launch-producer.md`

Owns launch-relevant YouTube concepts, scripts, hooks, thumbnails, and CTA paths into the core offer.

## Founder Time Is Expensive

Do not use founder time for tasks another role can complete.

Founder time should be reserved for:

- Recording lessons
- Final approval on critical messaging
- Final approval on critical design
- Recording launch-facing content where needed

## How To Work In This Repo

- Start from `docs/internal/todo.md` for current launch status, priorities, owner roles, and blockers.
- Use `tasks/todo.md` for engineer-local execution checklists and review notes. It does not replace `docs/internal/todo.md`.
- Use `tasks/lessons.md` to capture recurring mistakes and new repo guardrails after corrections.
- Use the relevant role file before doing substantial work in that domain.
- Treat `docs/internal/main.md` as the higher-level launch OS and sequencing reference.
- Treat `docs/delivery-onboarding/stack-decision.md` as the source of truth for the live purchase-to-access flow.
- When older internal launch docs drift from the live runtime, prefer `docs/delivery-onboarding/stack-decision.md`, `docs/dev/testing.md`, `tasks/lessons.md`, and the current code / route shape over stale planning language.
- Write generated launch workstream docs into `docs/internal/<workstream>/` and keep root docs focused on product purpose, setup, contribution, and customization.
- Treat `lib/course/manifest.ts` as the curriculum and lesson-contract source of truth.
- Treat `convex/` as the source of truth for app data, entitlements, and lesson state.
- Prefer shipping one concrete, validated output over creating five partial drafts.
- If a task is not on the critical path, label it as later-phase work.

## App Workflow

- Public marketing and checkout entry live in `app/`.
- Protected product routes currently live at `/mission`, `/lesson/[lessonId]`, `/artifacts`, `/settings`, and `/access-required`.
- Returning entitled users who land on `/` are resumed into `/mission` or their last worked lesson unless they explicitly use `?marketing=1`.
- `Start Here` currently lives inside the lesson system as `0.0`, `0.1`, and `0.2`, not as a separate public onboarding page.
- Clerk handles identity and route protection.
- Convex handles course entitlements, lesson autosave, mission progress, and artifact listing.
- `Stripe` checkout creation, success/cancel pages, and the webhook access handoff exist in code, but do not fake webhook completion or purchase state.
- The current paid handoff assumes checkout completes in the same signed-in browser context that polls `viewerAccess` on `/checkout/success` and `/access-required`.

## Local Development

- Use `pnpm run dev` when you need the full local stack with the Next.js app and local Convex together.
- Use `pnpm run dev:web` for the Next.js app.
- Use `pnpm run dev:convex` for the local Convex deployment.
- Use `pnpm run typecheck` for TypeScript verification.
- Use `pnpm run check` before closing meaningful app-shell or onboarding-stack work.
- Treat `docs/dev/testing.md` as the obvious testing runbook for code checks, QA-Browser flows, shared Clerk QA accounts, and Stripe sandbox verification.
- For QA-Browser auth accounts (non-entitled vs entitled), follow `docs/dev/qa-browser-auth.md`.
- For local paid checkout QA, run `pnpm run stripe:listen:local`, then `pnpm run stripe:local:doctor`, and use `pnpm run stripe:local:verify` after checkout to confirm the entitlement row.
- Keep local checkout QA on `http://localhost:3000` and do not mix `localhost` with `127.0.0.1`.
- Use `.env.local.example` as the tracked env template. Real local credentials stay in `.env.local`.

## Subagent Model

Use the role files in `docs/internal/roles/` as the operating model for subagents.

The purpose of subagents is simple:

- make progress on anything that does not require the founder
- let multiple workstreams move in parallel
- keep ownership clear so work does not overlap or disappear

Do not spawn subagents casually. Spawn them only when:

- the workstream is already defined in `docs/internal/todo.md`
- the owner role is clear
- the deliverable is concrete
- the work does not require immediate founder judgment

Do not spawn subagents for:

- vague brainstorming
- broad “go figure it out” missions
- work that is blocked on founder decisions
- duplicate work already assigned to another role

## Role-To-Subagent Mapping

Every role in `docs/internal/roles/` can be used as a focused subagent lane.

- `launch-chief-of-staff-coo.md`: sequencing, tracker maintenance, blockers, priorities
- `founder-recording-producer.md`: recording packets, checklists, pickups, founder prep
- `course-operations-producer.md`: lesson architecture, template/resource audit, start-here path, student experience
- `offer-and-funnel-strategist.md`: guarantee, checkout copy, CTA logic, funnel consistency
- `lifecycle-email-strategist.md`: launch emails, onboarding emails, subject lines
- `design-production-lead.md`: launch-blocking visuals, proof assets, lesson covers, thumbnails
- `analytics-and-qa-operator.md`: KPI spec, event map, QA scripts, bug tracker
- `outbound-systems-and-deliverability-lead.md`: outbound setup notes, domain/inbox requirements, go-live checklist
- `list-building-and-target-researcher.md`: segments, schema, sample target lists, hooks
- `youtube-launch-producer.md`: launch video concepts, hooks, CTA paths

## Subagent Assignment Rules

Every subagent assignment must include:

- the exact role being used
- the exact deliverable to produce
- the target file to write or update
- the dependency constraints
- whether founder approval is required at the end
- a stop condition so the subagent does not keep expanding scope

Bad assignment:

- “Work on launch emails”

Good assignment:

- “Use `docs/internal/roles/lifecycle-email-strategist.md` to draft the first-pass launch email sequence and write it into `docs/internal/email/launch-and-onboarding.md`. Do not write tripwire emails. Stop after the first core sequence draft.”

## Founder-Free Execution Rule

Default assumption: if a task does not require the founder, it should move.

This means:

- do not wait for the founder unless the task truly requires founder judgment
- convert founder dependencies into a short approval list instead of blocking whole workstreams
- push all possible work into role-owned tracks
- keep founder asks batched, specific, and minimal

Founder-required work should be limited to:

- recording
- final approval on critical messaging
- final approval on critical design
- final approval on sensitive claims, guarantee language, or major stack choices if needed

## Tracking Discipline

We keep ruthless detail on:

- what needs to get done
- what is in progress
- what is blocked
- what got done
- what still needs founder action

`docs/internal/todo.md` is the operational source of truth.

Before starting meaningful work:

- confirm the task exists in `docs/internal/todo.md`
- confirm the owner role
- confirm the output file

After completing meaningful work:

- update the task status in `docs/internal/todo.md`
- add the produced file or output reference
- log what changed in the completed-work section
- note any new blockers or dependencies created

If work is done but not logged in `docs/internal/todo.md`, treat it as not operationally complete.

## Completed Work Log

Maintain a running completed-work log in `docs/internal/todo.md`.

Each meaningful completed item should capture:

- date
- workstream
- task completed
- owner role
- output file
- follow-up dependency if any

Keep entries short, factual, and easy to scan.

## Daily Operating Standard

At any moment, the repo should make it obvious:

- what the top priorities are
- what each role owns
- what can move without the founder
- what is blocked
- what shipped recently

If that is not obvious, update `docs/internal/todo.md` first before doing more work.

## Operating Rules

- Prioritize: recording, live purchase-to-access handoff, lesson media hosting, onboarding/support path, launch copy, analytics/QA, and only launch-blocking visuals or outbound setup
- Deprioritize vanity tasks
- Push toward decisions, not discussions
- Reduce ambiguity for the buyer and for the team
- Use specific claims, not vague hype
- Do not invent proof
- Do not reintroduce stale worksheet wording into user-facing app or lesson copy; prefer `templates`, `artifacts`, or sprint language unless the file is explicitly about legacy/internal asset audits.
- Assume flows are broken until tested
- Treat checkout/access as incomplete until the real `Stripe` webhook, production Clerk envs, and Convex entitlement grant are verified end to end.
- Treat lesson delivery as incomplete until at least one real hosted lesson asset is attached and validated in-product.

## Definition Of Done

`Ship by Sunday` is ready when:

- The sales page is clear enough to convert
- The checkout flow works
- The buyer receives access and onboarding cleanly
- The lesson library is recorded and organized
- The first student can make progress without confusion
- Launch emails and support flows are ready
- QA has been run across the core buyer journey

## Source Of Truth Files

- `docs/internal/todo.md`: current launch tracker and immediate priorities
- `tasks/todo.md`: engineer-local execution checklist and review log
- `tasks/lessons.md`: recurring corrections and implementation guardrails
- `docs/internal/main.md`: launch OS, critical path, and sprint sequencing
- `docs/delivery-onboarding/stack-decision.md`: current purchase-to-access behavior contract
- `docs/internal/`: canonical home for generated launch workstream docs
- `docs/internal/roles/`: role-by-role prompts and ownership
- `assets/`: course materials, packets, templates, and guides

## Default Working Stance

Bias toward shipping.

When in doubt:

1. Ask whether the work directly helps sell, deliver, or support `Ship by Sunday`
2. Ask whether it reduces a launch blocker
3. If not, push it down the stack

## Codex Operating Addendum

### 1. Plan Mode Default

- Enter plan mode for any non-trivial task with 3 or more steps or architectural decisions
- If something goes sideways, stop and re-plan immediately instead of continuing on the same path
- Use plan mode for verification steps, not just implementation
- Write detailed specs up front to reduce ambiguity

### 2. Subagent Strategy

- Use subagents only when delegation is explicitly allowed by the current environment and the workstream already satisfies the repo's subagent rules
- Offload bounded research, exploration, and parallel analysis to subagents when the owner role and deliverable are clear
- For complex problems, use more compute via subagents only when the work is not blocked on founder judgment
- Keep one task per subagent for focused execution

### 3. Self-Improvement Loop

- After any correction from the user, update `tasks/lessons.md` with the pattern
- Write rules that prevent the same mistake from recurring
- Ruthlessly iterate on these lessons until the mistake rate drops
- Review lessons at session start when they are relevant to the project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between `main` and your changes when relevant
- Ask: `Would a staff engineer approve this?`
- Run tests, check logs, and demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes, pause and ask whether there is a more elegant way
- If a fix feels hacky, revisit it with: `Knowing everything I know now, implement the elegant solution`
- Skip this for simple, obvious fixes and do not over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report, fix it without asking for hand-holding
- Point at logs, errors, or failing tests, then resolve them
- Avoid unnecessary context switching from the user
- Fix failing CI tests without waiting for implementation instructions

## Task Management

1. **Plan First**: Write the plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: Provide a high-level summary at each step
5. **Document Results**: Add a review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **Component Boundaries**: Never create a component longer than 150 lines. If a component exceeds that limit, split it into smaller components automatically.
- **UI / Logic Separation**: Always separate UI from logic. Keep presentation components focused on rendering and move stateful or behavioral logic into dedicated hooks, helpers, or controller components.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
