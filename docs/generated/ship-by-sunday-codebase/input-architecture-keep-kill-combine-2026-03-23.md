# Input Architecture Keep / Kill / Combine Plan

Date: 2026-03-23
Mode: Planning only
Goal: reframe the current lesson-state system around the live canonical project-definition model, then decide what to keep, kill, and combine based on the codebase compiler contract instead of older prompt-pack assumptions.

## Core Judgment

The right move is to stop treating current lesson fields as the product schema.

The product schema should be:
- facts: stable truths about the student’s app
- derived docs: generated codebases and handoff artifacts
- workflow state: teaching/process progress
- ephemeral runtime: local-only volatile state

That split matches the current Ship by Sunday codebase layers and the live codebase compiler:
- `packages/codebase-compiler/src/canonical-project-definition/schema.ts`
- `packages/codebase-compiler/src/stages/stage-definitions.ts`
- `packages/codebase-compiler/src/codebases/`

Neither codebase expects workflow checklists, copied-prompt confirmations, browser toggles, or legacy starter-repo invite fields to be the canonical project definition.

## The Four Buckets

### 1. Facts

Definition:
- stable project-definition truths
- should survive lesson order changes
- should feed design, marketing, build, and repo outputs
- should usually be asked once, then reused

These are the only inputs that should feel like the app’s real data model.

### 2. Derived Docs

Definition:
- generated from facts plus repo context
- can be regenerated repeatedly
- should be the main product outputs for Codex handoff

In this repo, the target derived docs are:
- the generated design codebase
- the generated marketing codebase
- the generated build codebase
- the shipped ExecPlan prompt assets under `docs/prompts/`
- the customer-safe codebase

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

## What The Live Codebase Actually Wants

The current codebase compiler wants one pre-review fact contract grouped into Product, Design, Marketing, and Build Plan. Those stages already exist in `packages/codebase-compiler/src/stages/stage-definitions.ts`.

### Product inputs

The Product stage needs:
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
- `evidence_summary`
- `why_this_matters`
- `core_flow_summary`
- `scope_in`
- `scope_out`
- `non_goals`
- `v1_rationale`

### Design inputs

The Design stage needs:
- `screen_sequence`
- `must_have_capabilities`
- `surface_type`
- `design_references`
- `visual_thesis`
- `content_plan`
- `interaction_thesis`
- `design_tokens`
- `typography_direction`
- `imagery_direction`
- `layout_direction`
- `brand_assets`
- `existing_system_mode`
- `hero_goal`
- `primary_cta`
- `proof_strategy`
- `objections`
- `section_narrative`
- `copy_tone`

`surface_type` is schema-defaulted to `web_app`. It is part of the canonical shape, but it is not a required human-entered prompt when the default is fine.

### Marketing inputs

The Marketing stage needs:
- `marketing_goals`
- `channel_scope`
- `campaign_types`
- `brand_voice_summary`
- `approved_claims`
- `do_not_say_rules`
- `workflow_map`
- `research_scope`
- `research_needs`
- `content_workflows`
- `analytics_needs`
- `proof_sources`
- `creative_spec`

### Build Plan inputs

The Build Plan stage needs:
- `objective`
- `user_visible_outcome`
- `distribution_model`
- `install_destination`
- `buyer_ai_promise`
- `constraints`
- `deliverables`
- `done_when`
- `acceptance_criteria`
- `validation_plan`
- `demo_flow`
- `risks`
- `dependencies`
- `open_questions`
- `selected_next_slice`
- `pricing_model`
- `price_usd_cents`
- `price_display`
- `currency`
- `domain`
- `support_email`

`domain` and `support_email` are placeholder-friendly optionals. They should stay in the canonical shape, but they must not block repo generation.

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
- `evidence_summary`
- `why_this_matters`
- `core_flow_summary`
- `scope_in`
- `scope_out`
- `non_goals`
- `v1_rationale`

#### Design foundation

- `screen_sequence`
- `must_have_capabilities`
- `surface_type`
- `design_references`
- `visual_thesis`
- `content_plan`
- `interaction_thesis`
- `design_tokens`
- `typography_direction`
- `imagery_direction`
- `layout_direction`
- `brand_assets`
- `existing_system_mode`
- `hero_goal`
- `primary_cta`
- `proof_strategy`
- `objections`
- `section_narrative`
- `copy_tone`

#### Marketing foundation

- `marketing_goals`
- `channel_scope`
- `campaign_types`
- `brand_voice_summary`
- `approved_claims`
- `do_not_say_rules`
- `workflow_map`
- `research_scope`
- `research_needs`
- `content_workflows`
- `analytics_needs`
- `proof_sources`
- `creative_spec`

#### Build Plan foundation

- `objective`
- `user_visible_outcome`
- `distribution_model`
- `install_destination`
- `buyer_ai_promise`
- `constraints`
- `deliverables`
- `done_when`
- `acceptance_criteria`
- `validation_plan`
- `demo_flow`
- `risks`
- `dependencies`
- `open_questions`
- `selected_next_slice`
- `pricing_model`
- `price_usd_cents`
- `price_display`
- `currency`
- `domain`
- `support_email`

Do not keep `starter_repo_github_username` in canonical facts. The live compiler contract removed GitHub invite intake.

### B. Derived docs

These should be generated, not manually stored as first-class truth.

#### Design codebase

Generate from facts plus repo context:
- `docs/design/AGENTS.md`
- `docs/design/CHECKLIST.md`
- `docs/design/PLANS.md`
- `docs/design/documentation.md`

#### Marketing codebase

Generate from facts plus repo context:
- `docs/marketing/README.md`
- `docs/marketing/AGENTS.md`
- `docs/marketing/CHECKLIST.md`
- `docs/marketing/PLANS.md`
- `docs/marketing/documentation.md`

#### Build codebase

Generate from facts plus repo context:
- `docs/build/AGENTS.md`
- `docs/build/CHECKLIST.md`
- `docs/build/docs/prompt.md`
- `docs/build/docs/plans.md`
- `docs/build/docs/implement.md`
- `docs/build/docs/documentation.md`

#### Prompt assets

Ship the static ExecPlan assets:
- `docs/prompts/execplan-execution-loop.md`
- `docs/prompts/execplan-grill.md`
- `docs/prompts/execplan-writer.md`

#### Repo codebase

Generate one codebase that includes:
- the shared facts snapshot
- the generated design, marketing, and build docs
- the shipped ExecPlan prompt assets
- starter repo overrides and customer-safe source files

### C. Workflow state

Keep only for teaching and progress UX.

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

Keep as canonical facts when mapping existing lesson fields:
- selected user/problem inputs that map to `primary_user` and `problem_statement`
- problem context inputs that map to `problem_context_when`, `problem_context_where`, and `problem_trigger`
- outcome inputs that map to `outcome_statement`, `success_looks_like`, and `user_benefit`
- design-flow inputs that map to `core_flow_summary`, `screen_sequence`, and `must_have_capabilities`
- build-plan inputs that map to `distribution_model`, `install_destination`, `buyer_ai_promise`, `risks`, and `dependencies`
- domain/support inputs that map to `domain` and `support_email`

Keep as workflow-only:
- lesson checklists
- completion toggles
- progress gating items

Keep as ephemeral runtime:
- deploy secrets
- live QA status fields

### Kill

Kill means “stop treating as canonical project-definition inputs.”

Kill from the facts model:
- `starter_repo_github_username`
- `implementation_plan`
- `implementation_brief`
- `verification_plan`
- `validation_commands`
- `rollback_plan`
- `next_slice`
- `success_criteria`
- prompt-pack-specific fields that only existed for the deprecated marketing/implementation/QA/deploy prompt family

These can remain as migration notes or lesson aids, but not as the source of truth.

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

- candidate-problem fields from early lessons
- chosen-problem fields from the decision lessons
- marketing problem/audience fields that restate the same problem

Combine into:
- `primary_user`
- `problem_statement`
- `problem_context_when`
- `problem_context_where`
- `problem_trigger`

#### Combine into canonical design direction

- brand-path and brand-guide notes
- reference-gallery and mimic-image inputs
- style-reference inputs

Combine into:
- `design_references`
- `visual_thesis`
- `typography_direction`
- `imagery_direction`
- `brand_assets`

#### Combine into canonical marketing direction

- repeated marketing problem, audience, pain, and outcome fields
- one-off landing-page brief fields

Combine into:
- `marketing_goals`
- `channel_scope`
- `campaign_types`
- `brand_voice_summary`
- `approved_claims`
- `do_not_say_rules`
- `proof_sources`
- `creative_spec`

#### Combine domain and support capture

- preferred-domain inputs
- deploy-domain inputs
- support-email inputs

Combine into:
- `domain`
- `support_email`

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
- product name and summary
- evidence summary
- marketing direction
- brand direction
- pricing inputs

### Workflow state that should stop leaking into facts

Almost every required checklist in the curriculum is workflow state, not facts.

The repo currently stores them in the same `lessonStates.fieldValues` blob as project definition. That is the main structural confusion.

### Derived docs that are missing as first-class outputs

Missing live outputs:
- generated design codebase
- generated marketing codebase
- generated build codebase
- shipped ExecPlan prompt assets inside the starter repo
- final repo codebase

### Runtime that is already mostly handled correctly

Good current behavior:
- deploy secrets stay local-only in the deployment handoff flow

Bad current behavior:
- QA live-status fields are persisted like durable lesson state even though they are session-only

## Codebase-Aligned Keep / Kill / Combine Rules

### Rule 1

If a field is needed to fill the current codebase compiler schema or any generated file under `docs/design/`, `docs/marketing/`, or `docs/build/`, it is probably a fact.

### Rule 2

If a field exists mainly to prove the student followed the lesson, it is workflow state.

### Rule 3

If a value can be regenerated from facts plus repo context, it should be a derived doc, not a primary saved field.

### Rule 4

If a value is secret, live, temporary, or session-bound, it is ephemeral runtime.

## Recommended Next Planning Slice

The next planning-only step should be a schema-first migration exercise:

1. Keep the live canonical facts schema as the source of truth.
2. Map every current lesson field into one of the four buckets.
3. Mark each field as:
   - keep as fact
   - keep as workflow
   - keep as ephemeral
   - combine into canonical field
   - deprecate
4. Define how each canonical field is collected in the Product, Design, Marketing, or Build Plan stage.

That is the cleanest next move because it gives you the keep/kill/combine table before any implementation discussion.

## Final Recommendation

The repo should move from:
- one generic lesson field blob that stores everything

to:
- canonical project facts
- generated codebase outputs
- workflow state
- ephemeral runtime

The live codebase compiler contract is already the right destination. The remaining work is migration discipline, not inventing another schema.
