# Dynamic Doc Blueprint Brainstorm

Informal v1 brainstorm for a generated repo doc blueprint that compiles the best outputs from CEO, Design, and Build into a starter repo that is ready for Codex / ChatGPT to work from.

Status: draft
Last updated: 2026-03-21

## Core idea

The student should not need to understand OpenAI's planning and agent best practices in abstract terms.

Instead:

- CEO lessons collect product truth.
- Design lessons collect UX truth.
- Build lessons collect implementation truth.
- We compile that into a repo-ready blueprint.
- The starter repo is hydrated with that blueprint before serious build work starts.

The blueprint is the translation layer between:

- non-technical student inputs
- our course structure
- what OpenAI says produces better design, planning, and agent execution

## Why this matters

Right now, some of the course already teaches "plan first" and "use Codex with constraints."

The stronger version is:

- treat those outputs as durable project memory
- make the blueprint cumulative across phases
- inject it into the starter repo as working documentation
- let the repo begin with context instead of a blank prompt

This follows OpenAI's direction pretty closely:

- design quality improves when the model gets concrete constraints, references, narrative, and design-system guidance
- long-horizon work improves when the repo contains durable files for spec, plan, runbook, status, and verification
- `AGENTS.md` should hold durable repo guidance instead of repeating rules in prompts

## OpenAI checklist: design

What OpenAI says the model needs for stronger design output:

- explicit design constraints up front
- clear design system guidance
- visual references or a mood board
- a narrative or content strategy
- real content / product context
- low or medium reasoning as the default starting point for frontend work
- imagery that does real narrative work, not generic decoration
- motion used intentionally, not as noise
- verification across desktop and mobile

Useful prompt-level constraints mentioned in the design article:

- one composition in the first viewport
- strong brand signal
- one job per section
- minimal clutter
- clear visual anchor
- typography and color direction defined up front

Implication for the course:

- we should collect not just "copy inputs"
- we should collect the actual visual direction, reference set, narrative structure, and UX constraints needed to steer the build

## OpenAI checklist: planning big work

What OpenAI says long-horizon agent work needs:

- a clear spec / target
- hard constraints and non-goals
- milestone-based plan
- acceptance criteria per milestone
- validation commands or checks
- a stop-and-fix rule before moving on
- decision notes to prevent oscillation
- a runbook for how the agent should operate
- a living documentation / status file
- durable project memory in markdown files

The key pattern is not "one perfect prompt."

It is:

1. freeze the target
2. break work into milestones
3. run validation
4. repair failures
5. keep status and decisions visible

Implication for the course:

- the blueprint should not only describe the product
- it should also contain enough structure for an agent to execute safely

## OpenAI checklist: AGENTS.md

What OpenAI says belongs in `AGENTS.md`:

- repo layout and important directories
- how to run the project
- build, test, and lint commands
- engineering conventions and PR expectations
- constraints and do-not rules
- what "done" means
- how to verify work

Important nuance:

- `AGENTS.md` should stay practical and concise
- if the guidance grows large, it should reference task-specific markdown files instead of becoming a giant blob

Implication for the blueprint:

- `AGENTS.md` should be the operator guide
- the rest of the blueprint should live in focused docs that `AGENTS.md` points to

## Working blueprint hypothesis

V1 generated blueprint could create or update:

- `AGENTS.md`
- `docs/spec.md`
- `docs/design-system.md`
- `docs/plan.md`
- `docs/status.md`

Possible meaning of each file:

- `AGENTS.md`: how the repo should be operated by Codex / agents
- `docs/spec.md`: user, pain, transformation, promise, scope, non-goals
- `docs/design-system.md`: references, mood, brand, layout rules, UX principles, narrative
- `docs/plan.md`: slices, milestones, risks, dependencies, validations
- `docs/status.md`: current milestone, decisions, open issues, next step

## Current coverage we already seem to have

Initial repo read suggests we already collect a meaningful amount of blueprint-ready information, but it is spread across lessons and not compiled.

### Upstream CEO truth already feeding later lessons

Seen repeatedly as pinned artifacts in Design and Build:

- `user_statement`
- `outcome_statement`

Likely role:

- who this is for
- what transformation or outcome matters

### Design phase inputs already visible

From `2.1` in `features/course/lesson/model/lessons/design.ts`:

- core problem
- core audience
- core transformation
- desired outcome
- must-have features for the flow
- execution checklist
- sketch notes
- named screens in order
- brand path
- optional brand guide notes

Artifact already saved:

- `core_flow_sketch_state`

What this means:

- we already collect part of a spec
- we already collect part of a UX flow
- we already collect some brand direction

Concrete Design lesson map:

- `2.0 Design References`
  - video only
  - currently saves nothing
- `2.1 Map the Core Flow`
  - main Design capture surface
  - saves `core_flow_sketch_state`
  - pins `user_statement` and `outcome_statement`
- `2.2 Find References First`
  - video only
  - currently saves nothing

Current Design fields captured in practice:

- `core_problem`
- `core_audience`
- `core_transformation`
- `core_desired_outcome`
- `core_must_have_features`
- `core_execution_checklist`
- `core_sketch_notes`
- `core_named_screens`
- `core_brand_path`
- `core_brand_guide_notes`

### Build phase inputs already visible

From a first pass through `features/course/lesson/content/build.ts`, we already collect things that smell like blueprint sections:

- starter setup checklist and repo initialization state
- brand strategy and brand design instructions
- selected starter idea
- generated post batch
- build + ship roadmap
- marketing brief
- domain
- support email
- logging plan
- first testers
- route map and paywall/public route decisions
- access stack note
- implementation planning prompt
- captured Codex plan
- slice blueprint
- selected next slice
- brand kit details
- hex colors
- icon / wordmark uploads
- core UX onboarding checklist
- strategy prompt
- brand references
- blog/source link
- mimic image upload
- Codex implementation brief
- QA report
- deployment checklist

This is already a lot.

The issue is not "we collect nothing."

The issue is:

- some inputs are duplicated
- some important inputs are hidden as lesson-local artifacts
- some things OpenAI recommends are present conceptually but do not have a strong UI affordance
- nothing appears to compile into a single repo blueprint yet

Concrete Build lesson map with strongest blueprint relevance:

- `3.0` starter setup
- `3.1` product iteration outputs
- `3.4` build + ship roadmap
- `3.5` Codex marketing site
- `3.6` route / access orientation
- `3.7` fresh-template planning prompt
- `3.8` slice planning capture
- `3.9` brand kit
- `3.10` core UX plan flow
- `3.11` core UX build + Codex handoff
- `3.12` checkout QA loop
- `3.14` production deploy handoff
- `3.16` skills quickstart

Blueprint-ready Build fields worth calling out explicitly:

- setup
  - product folder name
  - setup prerequisites checklist
- product / brand / offer
  - brand strategy
  - brand design instructions
  - starter idea
  - generated posts
  - marketing brief
  - audience / problem / pain / outcome / capability
  - landing-page copy blocks
- architecture / routes / access
  - pages public
  - pages behind paywall
  - route map
  - access stack note
  - routes likely to change
- planning
  - planning prompt
  - reasoning level
  - optional reference repo path
  - slice blueprint
  - selected next slice
  - release distribution
  - local bridge decision
  - buyer-facing AI promise
  - install destination
  - plan slices
  - affected areas
  - risks
  - dependencies
- design system / assets
  - app name
  - initials
  - domain
  - primary hex
  - accent hex
  - naming exercise
  - icon upload
  - wordmark upload
  - brand references
  - blog / source link
  - mimic image
- handoff / QA / launch
  - Codex implementation brief
  - handoff checklist
  - QA prompt
  - QA report
  - deploy steps
  - deploy success checks
  - first tagged skill prompt

## Early gap hypothesis

Before the subagent findings, these gaps already look likely:

### 1. References / moodboard coverage exists conceptually, but not strongly as a blueprint input

We likely have:

- design references as a lesson topic
- brand references later in Build

We likely do not yet have:

- one canonical "reference board" artifact
- a clear blueprint destination for those references
- a visible affordance that says "this will become your design-system steering context"

### 2. Planning is taught, but may be too late and too lesson-local

Current Build lessons already teach planning mode and slice planning.

But the stronger blueprint model would make planning cumulative:

- CEO gives spec foundations
- Design gives UX and reference foundations
- Build planning compiles those foundations into execution docs

### 3. We have handoff fragments, not one blueprint preview

Current flow appears to save:

- prompts
- plans
- route notes
- brand notes
- handoff checklists

What seems missing:

- a single "your blueprint so far" surface
- a compiled preview before repo hydration
- a clear distinction between student-facing notes and repo-facing generated docs

### 4. AGENTS.md-specific inputs are not yet explicit

OpenAI's `AGENTS.md` guidance needs things like:

- project commands
- standards
- verification rules
- definition of done

Some of this can come from the starter repo defaults.
Some should come from the student's choices.
Some may need product-level defaults we define centrally.

## Proposed doc structure for this brainstorm

This doc should eventually include:

1. OpenAI requirements checklist
2. Current collected data inventory
3. Gap analysis
4. V1 generated blueprint shape
5. Lesson-to-blueprint mapping
6. Questions / risks

## V1 blueprint generation model

Rough idea:

- student fills existing forms across CEO, Design, and Build
- we add a few missing fields / affordances where OpenAI-critical inputs are missing
- we define a blueprint schema
- we compile lesson artifacts into that schema
- we render repo files from the schema
- we inject those files into the template repo at build kickoff or repo generation time

Potential pipeline:

1. collect student inputs
2. normalize into blueprint data model
3. generate doc files from templates
4. inject into starter repo
5. show student a blueprint preview
6. let Codex / ChatGPT operate from those docs

## Early blueprint schema ideas

Possible schema buckets:

- product context
- user and outcome
- problem and stakes
- core UX flow
- named screens
- visual references
- brand rules
- copy strategy
- route and access model
- v1 scope and non-goals
- slices and milestones
- risks and dependencies
- deployment context

## Questions worth answering

- Which fields should be raw student input vs generated summary?
- What should compile into `AGENTS.md` vs stay in `docs/*.md`?
- Should blueprint generation happen once at Build kickoff or continuously after each lesson?
- Do we want one blueprint per student repo, or one blueprint preview inside the app plus repo sync later?
- Which lessons should be modified versus left alone with a compiler layer on top?
- How much should be auto-summarized versus copied verbatim?

## Subagent findings

Two read-only explorer passes confirmed the main pattern:

- Design has the beginnings of blueprint-worthy capture, but weak durable reference affordances.
- Build already has enough raw material to generate several repo docs.
- The biggest missing product object is a canonical blueprint compiler / blueprint preview.

### Main finding

The main problem is not raw capture.

The main problem is that the course does not yet compile collected artifacts into a visible, cumulative, repo-facing blueprint.

### Design findings

The Design block is currently too light on durable visual-direction capture.

What is true now:

- `2.1` does a decent job capturing core flow text
- Design references are taught in `2.0` and `2.2`
- there is reusable `reference_gallery` infrastructure in the repo
- there is also evidence of prior / legacy support for richer design capture

What is missing now:

- no reference URLs saved in the Design phase
- no moodboard or screenshot gallery in the Design phase
- no saved sketch-photo upload in the Design phase
- no structured design-system fields for color, typography, layout rules, tone, or do / don'ts
- no blueprint preview showing how Design inputs will become repo docs

Most obvious Design-side v1 upgrade:

- add a real reference gallery / moodboard affordance to Design
- add a saved sketch-photo upload to Design
- add more structured brand / visual-direction capture

### Build findings

Build is already rich in blueprint-ready inputs.

The strongest clusters for generation are:

- `3.1`, `3.4`, `3.5` for product + spec + messaging
- `3.6` for routes + access map
- `3.7`, `3.8`, `3.10` for plan data
- `3.9`, `3.11` for brand / design-system inputs
- `3.11` for the Codex handoff brief
- `3.12`, `3.14` for QA / deploy / launch status

Most obvious Build-side missing pieces:

- no canonical blueprint model
- no explicit `AGENTS.md` input schema
- no durable decision log
- no clean scope / non-goals doc
- no promotion of QA findings into status / known issues
- no durable repo-map summary

### UX / product findings

The strongest UX gap is that students do not see:

- what permanent project doc each input will become
- what the blueprint already contains
- what is still missing for a build-ready repo
- what will actually be injected into the template repo

This suggests a better v1 move than adding many new fields:

- create a blueprint preview / blueprint progress surface above existing forms
- show generated file names and their status
- then add only the missing inputs that materially improve blueprint quality

## Initial direction

Best current direction for v1:

- keep the lesson architecture mostly intact
- add only the missing high-value affordances
- define one blueprint schema
- compile existing artifacts first
- avoid a giant rewrite of the course runtime before proving the blueprint is useful

That keeps this simple:

- first make the blueprint real
- then improve lesson ergonomics where the blueprint reveals weak spots

## V1 recommendation

The leanest useful v1 looks like this:

### Step 1: define one canonical blueprint

Internally treat the blueprint as one schema with stable sections:

- product
- design
- architecture
- plan
- launch
- agent guidance

### Step 2: compile from existing artifacts first

Do not start by redesigning the whole course.

Start by compiling from the strongest existing lessons:

- CEO upstream artifacts already in use
- `2.1` for core flow
- `3.4` for scope / launch prep
- `3.5` for messaging
- `3.6` for route / access map
- `3.7`, `3.8`, `3.10` for planning
- `3.9`, `3.11` for visual system + implementation handoff
- `3.12`, `3.14` for status / QA / deploy

### Step 3: add only the missing high-value Design affordances

Most likely:

- reference gallery / moodboard
- sketch photo upload
- structured visual-direction notes

### Step 4: create a blueprint preview in the app

The preview should show:

- generated file names
- completed vs missing sections
- source lessons feeding each section
- what will be injected into the repo

### Step 5: hydrate the template repo

At Build kickoff or repo generation time:

- generate docs from blueprint schema
- inject docs into the template repo
- keep `AGENTS.md` concise and point it to the generated docs

## Candidate generated files for v1

Most plausible first set:

- `AGENTS.md`
- `docs/spec.md`
- `docs/core-flow.md`
- `docs/design-system.md`
- `docs/plan.md`
- `docs/access-map.md`
- `docs/status.md`
- `docs/launch.md`

## References

- OpenAI: Designing delightful frontends with GPT-5.4
  - https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4
- OpenAI: Run long horizon tasks with Codex
  - https://developers.openai.com/blog/run-long-horizon-tasks-with-codex
- OpenAI: Codex best practices
  - https://developers.openai.com/codex/learn/best-practices/
