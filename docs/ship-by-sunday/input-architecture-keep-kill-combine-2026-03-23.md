# Input Architecture Keep / Kill / Combine Plan

Date: 2026-03-23
Mode: Planning only
Goal: reframe the current lesson-state system around a canonical project-definition model, then decide what to keep, kill, and combine based on the OpenAI-derived Design and Long Horizon packets in:

- `docs/design-checklist/`
- `docs/codex_long_horizon_templates/`

## Core Judgment

The right move is to stop treating current lesson fields as the product schema.

The product schema should be:
- facts: stable truths about the student’s app
- derived docs: generated packets and handoff artifacts
- workflow state: teaching/process progress
- ephemeral runtime: local-only volatile state

That split matches both packet folders:
- `docs/design-checklist/*` expects a design brief, design plan, and design documentation package.
- `docs/codex_long_horizon_templates/*` expects a long-horizon spec/plan/runbook/status package.

Neither packet expects workflow checklists or browser toggles to be the canonical project definition.

## The Four Buckets

### 1. Facts

Definition:
- stable project-definition truths
- should survive lesson order changes
- should feed both design and build outputs
- should usually be asked once, then reused

These are the only inputs that should feel like the app’s real data model.

### 2. Derived Docs

Definition:
- generated from facts plus repo context
- can be regenerated repeatedly
- should be the main product outputs for Codex handoff

In this repo, the target derived docs are already implied by the packet folders:
- design packet
- long-horizon packet
- implementation prompt pack
- repo handoff package

### 3. Workflow State

Definition:
- teaching scaffolding
- progress through a lesson or exercise
- “did the student do the step”
- useful for UI progression, not for downstream generation

This data should not be mixed with project facts.

### 4. Ephemeral Runtime

Definition:
- local-only or short-lived operational state
- unsafe or pointless to persist as project definition

Examples:
- secrets
- live browser status
- currently running QA step
- temporary clipboard text

This should stay out of canonical persistence unless there is a separate secure operational need.

## What The OpenAI Packets Actually Want

### Design packet expectations

From `docs/design-checklist/PLANS.md`, `docs/design-checklist/CHECKLIST.md`, and `docs/design-checklist/documentation.md`, the useful inputs are:
- surface type
- goal
- user / audience
- job to be done
- existing system vs new surface
- references
- constraints
- visual thesis
- content plan
- interaction thesis
- design-system plan
- imagery plan
- copy plan
- implementation plan
- verification plan
- acceptance criteria
- risks and follow-ups

Those are facts plus derived-doc structure.

What the packet does not want as canonical project data:
- “copied prompt”
- “opened README”
- “reviewed the example”
- “connected account”

### Long-horizon packet expectations

From `docs/codex_long_horizon_templates/docs/prompt.md`, `docs/codex_long_horizon_templates/docs/plans.md`, `docs/codex_long_horizon_templates/docs/implement.md`, and `docs/codex_long_horizon_templates/docs/documentation.md`, the useful inputs are:
- objective
- why this matters
- in-scope / out-of-scope
- user-visible outcome
- constraints
- relevant code paths / docs / examples
- deliverables
- done-when
- validation / demo flow
- risks / edge cases
- open questions

Then the derived planning layer adds:
- milestones
- acceptance criteria
- validation commands
- architecture intent
- rollback
- status log

Again: facts plus derived-doc structure.

What the packet does not want as canonical project data:
- lesson completion checklists
- “generated plan reviewed”
- “browser running”
- “copied the prompt”

## Proposed Canonical Split

### A. Canonical facts model

This is the model worth preserving across lessons.

#### Product foundation

- `product_name`
- `product_summary`
- `primary_user`
- `problem_statement`
- `problem_context_when`
- `problem_context_where`
- `problem_trigger`
- `problem_severity`
- `problem_urgency`
- `outcome_statement`
- `success_looks_like`
- `user_benefit`

#### Design foundation

- `surface_type`
- `core_flow_summary`
- `screen_sequence`
- `must_have_capabilities`
- `design_references`
- `visual_thesis`
- `content_plan`
- `interaction_thesis`
- `design_tokens`
- `typography_direction`
- `imagery_direction`
- `layout_direction`
- `brand_assets`

#### Build / planning foundation

- `scope_in`
- `scope_out`
- `non_goals`
- `v1_rationale`
- `distribution_model`
- `install_destination`
- `buyer_ai_promise`
- `risks`
- `dependencies`
- `success_criteria`
- `validation_plan`
- `demo_flow`
- `selected_next_slice`

#### Operational foundation

- `starter_repo_github_username`
- `domain`
- `support_email`

### B. Derived docs

These should be generated, not manually stored as first-class truth.

#### Design packet

Generate from facts plus repo context:
- `design-brief.md`
- `design-checklist/PLANS.md` task instance
- `design-checklist/documentation.md` starter
- optional `visualguide.md`

#### Long-horizon packet

Generate from facts plus plan context:
- `docs/prompt.md`
- `docs/plans.md`
- `docs/implement.md`
- `docs/documentation.md`
- task-level AGENTS addendum when useful

#### Prompt pack

Generate:
- marketing build prompt
- implementation prompt
- QA prompt
- deploy handoff prompt

#### Repo package

Generate one package manifest that points to:
- starter template access state
- shared facts snapshot
- design packet
- long-horizon packet
- prompt pack

### C. Workflow state

Keep only for teaching/progress UX.

Examples from the current repo that belong here:
- `intro_readiness_checklist`
- `commitment_readiness`
- `research_flow_checklist`
- `ceo_skills_setup_checklist`
- `build_setup_prereqs`
- `build_product_iteration_setup_checklist`
- `build_ship_roadmap_build_phase`
- `build_ship_roadmap_ship_phase`
- `build_ship_roadmap_service_accounts`
- `build_ship_roadmap_scope`
- `codex_marketing_workflow`
- `route_access_inspection_checklist`
- `build_slices_review_checklist`
- `brand_kit_artifact_checklist`
- `ux_plan_workflow_checklist`
- `core_ux_onboarding_checklist`
- `core_ux_handoff_checklist`
- `checkout_qa_preflight`
- `deploy_handoff_steps`
- `deploy_handoff_success_checks`
- `build_skills_usage_checklist`

These can stay in lesson state if needed for progression, but they should not feed the canonical project definition.

### D. Ephemeral runtime

Keep out of canonical lesson persistence.

Examples from the current repo:
- `cloudflareToken`
- `stripeSecret`
- `clerkKeys`
- `checkout_qa_current_step`
- `checkout_qa_last_issue`
- `checkout_qa_browser_running`

These are correct as ephemeral or local-only.

## Keep / Kill / Combine

### Keep

Keep as canonical facts:

- `selected_problem_owner`
- `selected_problem_statement`
- `problem_when`
- `problem_where`
- `problem_trigger`
- `pain_level`
- `pain_why_now`
- `outcome_statement_body`
- `messaging_what_it_does`
- `messaging_benefit`
- `core_problem`
- `core_audience`
- `core_transformation`
- `core_desired_outcome`
- `core_must_have_features`
- `core_named_screens`
- `core_brand_path`
- `build_ship_roadmap_preferred_domain`
- `build_ship_roadmap_support_email`
- `ux_plan_release_distribution`
- `ux_plan_local_codex_bridge`
- `ux_plan_buyer_ai_promise`
- `ux_plan_install_destination`
- `ux_plan_plan_risks`
- `ux_plan_plan_dependencies`
- `starterRepoAccess.githubUsername`

Keep as workflow-only:

- all lesson checklists
- completion toggles
- progress gating items

Keep as ephemeral runtime:

- deploy secrets
- live QA status fields

### Kill

Kill means “stop treating as canonical project-definition inputs.”

Kill from the facts model:

- `app_idea` as a separate canonical field if `product_summary` exists
- `problem_to_solve` as a separate canonical field once `problem_statement` exists
- `why_ship_now` as a separate canonical field if urgency/rationale is captured later in a stronger way
- `codex_marketing_saved_prompt`
- `fresh_template_plan_codex_output`
- `route_access_codex_prompt`
- `checkout_qa_prompt` as canonical truth
- duplicated product/domain fields across later build lessons

These can remain as lesson aids or editable working notes, but not as the source of truth.

Kill as student-facing persisted state entirely if possible:

- `checkout_qa_current_step`
- `checkout_qa_last_issue`
- `checkout_qa_browser_running`

They are runtime telemetry for a session, not project definition.

### Combine

#### Combine into shared product-definition facts

- `app_idea`
- `codex_marketing_product`
- `brand_kit_app_name`
- `deploy_handoff_product_name`

Combine into:
- `product_name`
- `product_summary`

#### Combine into canonical user/problem

- candidate-problem fields from `1.3`
- chosen-problem fields from `1.4`
- marketing problem/audience fields from `3.5`

Combine into:
- candidate problem exploration (workflow/lesson-local)
- canonical selected user/problem (facts)

#### Combine into canonical design direction

- `core_brand_path`
- `core_brand_guide_notes`
- `build_product_iteration_brand_strategy`
- `build_product_iteration_brand_design`
- `brand_kit_primary_hex`
- `brand_kit_accent_hex`
- `core_ux_brand_references`
- `core_ux_post_mimic_image`
- `codex_marketing_style_reference_url`

Combine into:
- `design_references`
- `visual_thesis`
- `typography_direction`
- `color_direction`
- `imagery_direction`
- `brand_assets`

#### Combine into canonical implementation plan

- `fresh_template_plan_manual_prompt`
- `fresh_template_plan_reasoning`
- `fresh_template_plan_reference_path`
- `build_slices_packet`
- `build_slices_selected_slice`
- `ux_plan_plan_slices`
- `ux_plan_plan_affected_areas`
- `ux_plan_plan_risks`
- `ux_plan_plan_dependencies`
- `core_ux_codex_brief`

Combine into:
- `implementation_plan`
- `next_slice`
- `implementation_brief`
- generated long-horizon docs

#### Combine into canonical marketing brief

- `build_ship_roadmap_marketing_brief`
- `codex_marketing_product`
- `codex_marketing_audience`
- `codex_marketing_problem`
- `codex_marketing_pain`
- `codex_marketing_frequency`
- `codex_marketing_why_matters`
- `codex_marketing_outcome`
- `codex_marketing_capability`

Combine into:
- one `marketing_brief` fact set
- derived landing-page prompt

#### Combine domain capture

- `build_ship_roadmap_preferred_domain`
- `brand_kit_domain`
- `deploy_handoff_domain`

Combine into:
- `domain`

## Current Repo Mapping By Bucket

### Facts that already exist but need canonicalization

Strong:
- selected user/problem
- outcome statement
- problem context
- core flow
- screen sequence
- key build constraints

Weak but salvageable:
- marketing brief
- brand direction
- implementation brief
- QA report

### Workflow state that should stop leaking into facts

Almost every required checklist in the curriculum is workflow state, not facts.

The repo currently stores them in the same `lessonStates.fieldValues` blob as project definition. That is the main structural confusion.

### Derived docs that are missing as first-class outputs

Missing live outputs:
- design brief packet
- long-horizon docs packet generated from facts
- integrated implementation prompt pack
- final repo package

### Runtime that is already mostly handled correctly

Good current behavior:
- deploy secrets stay local-only in `production-deploy-handoff-secrets-panel.tsx`

Bad current behavior:
- QA live-status fields are persisted like durable lesson state even though they are session-only.

## Packet-Aligned Keep / Kill / Combine Rules

### Rule 1

If a field is needed to fill `docs/design-checklist/PLANS.md` or `docs/codex_long_horizon_templates/docs/prompt.md`, it is probably a fact.

### Rule 2

If a field exists mainly to prove the student followed the lesson, it is workflow state.

### Rule 3

If a value can be regenerated from facts plus repo context, it should be a derived doc, not a primary saved field.

### Rule 4

If a value is secret, live, temporary, or session-bound, it is ephemeral runtime.

## Recommended Next Planning Slice

The next planning-only step should be a schema-first exercise:

1. Define the canonical facts schema.
2. Map every current field into one of the four buckets.
3. Mark each field as:
   - keep as fact
   - keep as workflow
   - keep as ephemeral
   - combine into canonical field
   - deprecate
4. Define the generated outputs:
   - design packet
   - long-horizon packet
   - prompt pack
   - repo package

That is the cleanest next move because it gives you the keep/kill/combine table before any implementation discussion.

## Final Recommendation

The split you proposed is the right architecture.

The repo should move from:
- one generic lesson field blob that stores everything

to:
- canonical project facts
- generated packet outputs
- workflow scaffolding
- ephemeral runtime

The important consequence is this:

You do not need to preserve most current lesson fields as sacred data.

You only need to preserve the facts.

Everything else can be:
- recomputed
- regenerated
- lesson-local
- or deleted from the canonical model.
