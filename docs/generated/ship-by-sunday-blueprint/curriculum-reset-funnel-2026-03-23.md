# Curriculum Reset Funnel

Date: 2026-03-23
Mode: Planning only

## One-line thesis

If we restarted the curriculum from zero, we would not design “a course with lessons.”

We would design:
- one canonical facts intake
- three blueprint compilers
- one download moment
- one optional execution track after download

The curriculum would be an input funnel around these blueprint families:
- `docs/openai/design-checklist/`
- `docs/openai/openai-marketing-kit/`
- `docs/openai/codex_long_horizon_templates/`

## What The Product Actually Is

The product is:
- a guided intake experience
- that collects the exact facts required
- to generate a custom folder
- that gives the student a design blueprint, marketing blueprint, build blueprint, and prompt pack

Everything else is secondary.

That means:
- videos exist to help students answer the right questions well
- lesson progress exists to keep them moving
- workflow state exists for the app
- but the real output is the folder

## Clean-Slate Setup

### 1. Data model

Split persistence into four layers.

#### A. Canonical facts

Single durable source of truth.

Examples:
- product name
- product summary
- user
- problem
- context
- outcome
- evidence
- core flow
- screen sequence
- scope boundary
- visual direction
- tokens
- marketing goals
- channel scope
- brand voice
- distribution
- install path
- implementation plan
- success criteria
- risks
- dependencies
- domain
- support email

#### B. Derived docs

Generated on demand from canonical facts plus repo context.

Outputs:
- design blueprint
- marketing blueprint
- long-horizon build blueprint
- prompt pack
- root README
- `project-definition.json`

#### C. Workflow state

App-only scaffolding.

Examples:
- “watched video”
- “opened README”
- “copied prompt”
- “completed checklist”

#### D. Ephemeral runtime

Session-only.

Examples:
- deploy secrets
- QA browser live status
- current step labels

### 2. Compiler layer

The app needs one compiler service that:
- reads canonical facts
- reads repo context
- renders blueprint files
- zips the folder
- makes it downloadable

### 3. Download UX

The download moment should be explicit.

Recommended:
- show blueprint readiness score
- show missing facts blocking generation
- preview file list
- allow re-generate after edits

## Ideal Funnel

## Stage 0. Orientation

Purpose:
- explain the outcome
- explain the blueprints
- explain that students are answering questions to generate their operating system

Ask:
- almost nothing permanent

Keep:
- maybe `product_name` if they already know it

Do not collect:
- workflow checklists as project definition

## Stage 1. Product definition

This is the real foundation.

### Module 1. Name the thing

Ask:
- working product name
- one-line product summary
- why this matters now

Output:
- `product_name`
- `product_summary`
- `why_this_matters`

### Module 2. Lock the user and pain

Ask:
- primary user
- core problem
- when it happens
- where it happens
- trigger
- severity
- urgency

Output:
- canonical user/problem block

### Module 3. Lock the promised outcome

Ask:
- desired outcome
- what success looks like
- what the user gets
- one plain-language outcome statement

Output:
- canonical outcome block

### Module 4. Bring in evidence

Ask:
- known alternatives
- repeated patterns
- what matters
- directional takeaway

Output:
- normalized evidence summary

### Module 5. Kill scope early

Ask:
- what must be in v1
- what is out of scope
- non-goals
- why this smaller version is enough

Output:
- canonical scope block

This module does not exist cleanly in the current curriculum. It should.

## Stage 2. Design blueprint intake

This should be the actual Design block.

### Module 6. Map the core flow

Ask:
- core flow summary
- must-have capabilities
- screen sequence
- optional rough flow notes

Output:
- canonical flow block

### Module 7. Gather references

Ask:
- reference gallery
- optional Figma links
- moodboard direction
- example product/UI surfaces

Output:
- `design_references`

### Module 8. Define design direction

Ask:
- visual thesis
- content plan
- interaction thesis
- imagery direction
- layout direction

Output:
- design direction block

### Module 9. Define system/tokens

Ask:
- typography direction
- color/tokens
- brand assets available
- existing system vs net new surface

Output:
- design system block

### Module 10. Define marketing surface

Ask:
- hero goal
- primary CTA
- proof strategy
- objections
- section narrative
- copy tone

Output:
- marketing surface block

At the end of Stage 2, the product should be able to generate the full design blueprint.

## Stage 3. Marketing blueprint intake

This is not “write some copy.”
This is “define the GTM operating system.”

### Module 11. Marketing goals and scope

Ask:
- marketing goals
- channels in scope
- campaign types needed
- approval rules

Output:
- marketing goals block

### Module 12. Voice and claim system

Ask:
- brand voice summary
- approved claims
- do-not-say rules
- proof sources

Output:
- voice + claim block

### Module 13. Workflow map

Ask:
- repeatable marketing workflows needed
- stable knowledge vs fresh inputs
- research needs
- content needs
- analytics needs

Output:
- workflow map for the marketing kit

At the end of Stage 3, the product should be able to generate the marketing blueprint.

## Stage 4. Build blueprint intake

This is the long-horizon Codex handoff.

### Module 14. Delivery model

Ask:
- distribution model
- install destination
- AI promise
- starter template usage

Output:
- delivery model block

### Module 15. Technical context

Ask:
- stack
- integrations
- constraints
- domain
- support email
- dependencies

Output:
- technical context block

### Module 16. Plan the work

Ask:
- implementation slices
- affected areas
- risks
- dependencies
- deliverables
- done-when

Output:
- implementation plan block

### Module 17. Verification and rollback

Ask:
- success criteria
- validation plan
- demo flow
- rollback / escape hatch
- open questions

Output:
- execution-quality block

At the end of Stage 4, the product should be able to generate the long-horizon build blueprint.

## Stage 5. Blueprint review and download

This is where the magic folder becomes the product moment.

### Module 18. Review

Show:
- missing facts
- blueprint previews
- readiness status for:
  - design
  - marketing
  - build

### Module 19. Download

Deliver:
- root README
- `facts/project-definition.json`
- design blueprint
- marketing blueprint
- build blueprint
- prompt pack

### Module 20. Optional next-step routing

After download:
- build now
- refine design
- refine marketing
- run QA
- prepare deploy

But these are post-blueprint modules, not blueprint-definition modules.

## What I Would Remove Or Demote In A Rebuild

### Demote to workflow-only

- all “did you do the step” checklists
- setup confirmation checklists
- copied-prompt confirmations
- skill usage habit checklists
- onboarding checklists

### Keep only as app/runtime state

- browser-running toggles
- current QA step
- last issue found
- local secrets

### Delete as primary data

- duplicated product-name fields
- duplicated domain fields
- manual saved-prompt fields that should be generated from facts
- free-text plan copies when a structured plan block exists

## Recommended New Unlock Points

### Design blueprint

Unlock after:
- Stage 2

### Marketing blueprint

Unlock after:
- Stage 3

### Build blueprint

Unlock after:
- Stage 4

### Full magical folder

Unlock after:
- Stage 4

Everything after that is execution support, not blueprint definition.

## Why This Funnel Is Better

- It asks only for information that changes the output.
- It stops mixing teaching state with project definition.
- It makes the download blueprint the center of gravity.
- It aligns directly with OpenAI’s blueprint expectations.
- It makes re-recording viable because each video has one clear input job.

## Recommended Rebuild Principle

If we re-recorded from scratch, every lesson should answer one question:

What blueprint fact am I collecting right now?

If the answer is:
- none

then the lesson is either:
- orientation
- workflow scaffolding
- or unnecessary in the blueprint funnel.

That is the cleanest way to make the curriculum “literally perfect for the best practices.”
