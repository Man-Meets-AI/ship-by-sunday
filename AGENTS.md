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
- Core audience: junior and mid-level engineers who can code, have ideas, and keep getting stuck before anything goes live
- Product format: on-demand videos plus a digital guide/workbook
- Landing page strategy and offer critique are complete enough to move on
- Tripwire is deprioritized for now

## Current Priorities

Do these before vanity work:

1. Record the core lessons
2. Stand up checkout, delivery, and onboarding
3. Finalize lesson order, worksheet usage, and student-facing structure
4. Draft launch emails and onboarding emails
5. Prepare launch QA, analytics, and bug tracking

## What Not To Get Distracted By

- Tripwire strategy unless explicitly re-prioritized
- Broad content vault packaging
- Nice-to-have social content
- Large outbound volume before the product and buyer flow are stable
- More website strategy loops unless a real blocker appears

## Team

These are the working launch roles in `roles/` and what each one owns.

### Launch Chief of Staff / COO

File: `roles/launch-chief-of-staff-coo.md`

Owns launch sequencing, priorities, blockers, dependencies, founder-only asks, and daily operating cadence.

### Offer and Funnel Strategist

File: `roles/offer-and-funnel-strategist.md`

Owns offer clarity, funnel logic, objection handling, guarantee language, CTA logic, and commercial consistency.

### Course Operations Producer

File: `roles/course-operations-producer.md`

Owns lesson structure, student journey, worksheet audit, start-here flow, upload checklist, and support documentation.

### Founder Recording Producer

File: `roles/founder-recording-producer.md`

Owns recording packets, lesson-by-lesson recording schedule, talking points, screen-share notes, and pickup tracking.

### Lifecycle Email Strategist

File: `roles/lifecycle-email-strategist.md`

Owns launch emails, buyer onboarding emails, subject lines, sequence order, and segmentation logic.

### Design Production Lead

File: `roles/design-production-lead.md`

Owns sales page graphics, proof assets, thumbnails, promo visuals, and launch asset prioritization.

### Analytics and QA Operator

File: `roles/analytics-and-qa-operator.md`

Owns KPI tracking, event map, end-to-end QA, bug logging, and buyer journey validation.

### Outbound Systems and Deliverability Lead

File: `roles/outbound-systems-and-deliverability-lead.md`

Owns outbound setup, domains, inboxes, warmup, Instantly architecture, and deliverability risk management.

### List Building and Target Researcher

File: `roles/list-building-and-target-researcher.md`

Owns target segment definitions, outreach list quality, personalization fields, and fit-based segmentation.

### YouTube Launch Producer

File: `roles/youtube-launch-producer.md`

Owns launch-relevant YouTube concepts, scripts, hooks, thumbnails, and CTA paths into the core offer.

## Founder Time Is Expensive

Do not use founder time for tasks another role can complete.

Founder time should be reserved for:

- Recording lessons
- Final approval on critical messaging
- Final approval on critical design
- Recording launch-facing content where needed

## How To Work In This Repo

- Start from `todo.md` for current launch status and priorities.
- Use the relevant role file before doing substantial work in that domain.
- Treat `main.md` as the higher-level launch OS and sequencing reference.
- Prefer shipping one concrete, validated output over creating five partial drafts.
- If a task is not on the critical path, label it as later-phase work.

## Subagent Model

Use the role files in `roles/` as the operating model for subagents.

The purpose of subagents is simple:

- make progress on anything that does not require the founder
- let multiple workstreams move in parallel
- keep ownership clear so work does not overlap or disappear

Do not spawn subagents casually. Spawn them only when:

- the workstream is already defined in `todo.md`
- the owner role is clear
- the deliverable is concrete
- the work does not require immediate founder judgment

Do not spawn subagents for:

- vague brainstorming
- broad “go figure it out” missions
- work that is blocked on founder decisions
- duplicate work already assigned to another role

## Role-To-Subagent Mapping

Every role in `roles/` can be used as a focused subagent lane.

- `launch-chief-of-staff-coo.md`: sequencing, tracker maintenance, blockers, priorities
- `founder-recording-producer.md`: recording packets, checklists, pickups, founder prep
- `course-operations-producer.md`: lesson architecture, worksheet audit, start-here path, student experience
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

- “Use `roles/lifecycle-email-strategist.md` to draft the first-pass launch email sequence and write it into `launch-emails.md`. Do not write tripwire emails. Stop after the first core sequence draft.”

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

`todo.md` is the operational source of truth.

Before starting meaningful work:

- confirm the task exists in `todo.md`
- confirm the owner role
- confirm the output file

After completing meaningful work:

- update the task status in `todo.md`
- add the produced file or output reference
- log what changed in the completed-work section
- note any new blockers or dependencies created

If work is done but not logged in `todo.md`, treat it as not operationally complete.

## Completed Work Log

Maintain a running completed-work log in `todo.md`.

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

If that is not obvious, update `todo.md` first before doing more work.

## Operating Rules

- Prioritize: offer clarity, recording, delivery, checkout, onboarding, launch copy, key visuals, outbound infrastructure, QA
- Deprioritize vanity tasks
- Push toward decisions, not discussions
- Reduce ambiguity for the buyer and for the team
- Use specific claims, not vague hype
- Do not invent proof
- Assume flows are broken until tested

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

- `todo.md`: current launch tracker and immediate priorities
- `main.md`: launch OS, critical path, and sprint sequencing
- `roles/`: role-by-role prompts and ownership
- `assets/`: course materials, packets, worksheets, and guides

## Default Working Stance

Bias toward shipping.

When in doubt:

1. Ask whether the work directly helps sell, deliver, or support `Ship by Sunday`
2. Ask whether it reduces a launch blocker
3. If not, push it down the stack
