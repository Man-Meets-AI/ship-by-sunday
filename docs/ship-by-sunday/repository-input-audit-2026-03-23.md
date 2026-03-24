# Repository Input Audit and Change Plan

Date: 2026-03-23
Scope: planning only

## Executive summary

The product has a real input system already, but it is fragmented. I found 21 active lesson surfaces with structured fields and 148 active lesson fields across CEO, Design, and Build, plus a small number of non-lesson input surfaces such as starter-repo access and local-only deploy secrets. The lesson system is well structured for capture and autosave, but most inputs stay lesson-local instead of being normalized once and reused downstream.

The strongest current coverage is early product-definition capture: problem, user, outcome, research, core flow, and some build/setup constraints. The weakest current coverage is design-spec quality, long-horizon execution quality, and final-package assembly. There is no active code path that turns student answers into one canonical design spec, one durable long-horizon file stack, or one combined repo package. Instead, the current product emits scattered artifacts: lesson previews, copied prompts, static PDFs, static starter-repo links, and a few local handoff packets.

Two major dormant assets exist and should shape the minimal-diff plan:

1. The repo already has a generic prompt generation/import pipeline in `features/course/lesson/model/research-prompt.ts`, `features/course/lesson/workbench/shared/prompt-import-card.tsx`, and `app/api/codex/generate/route.ts`, but no active lesson definition currently sets `promptImport` or `briefAssembler` in `features/course/lesson/model/lessons/*` or `features/course/lesson/content/build.ts`.
2. The new long-horizon durable-memory stack in `docs/codex_long_horizon_templates/` is strong and product-relevant, but it currently stands alone. The docs app serves `content/docs` via `features/docs/server/page-paths.ts`; the new folder is outside that tree and is not referenced by current app, lesson, starter-template, or download workflows.

The cleanest path is not a redesign. It is:

1. Define a shared canonical product brief model once.
2. Map existing lesson fields into that model.
3. Add a small set of missing design and long-horizon fields.
4. Reuse the dormant prompt/template infrastructure.
5. Generate three first-class outputs from the canonical model:
   - design spec
   - long-horizon plan packet
   - starter handoff package

## Repo map of relevant flows and code paths

| Flow / subsystem | Definition | Rendering | Validation | Storage / state | Transformation / consumption |
|---|---|---|---|---|---|
| Lesson registry and curriculum | `features/course/lesson/model/lessons/start-here.ts`, `features/course/lesson/model/lessons/ceo.ts`, `features/course/lesson/model/lessons/design.ts`, `features/course/lesson/content/build.ts`, assembled in `features/course/lesson/model/curriculum.ts` | `features/course/lesson/workbench/renderer.tsx` plus per-mode components | Required-field and completion logic in `features/course/lesson/model/registry/completion.ts` | `features/course/lesson/hooks/use-lesson-state.ts`, `convex/course/lessonState.ts`, `convex/schema.ts` (`lessonStates`) | `features/course/lesson/model/registry/artifacts.ts`, `features/course/lesson/model/stage-unlock.ts`, `convex/course/artifacts.ts`, `convex/course/mission.ts` |
| Generic field system | `features/course/lesson/model/contracts.ts` (`WorkbenchField`, field kinds) | `features/course/lesson/workbench/fields/field-control.tsx`, `basic-field-controls.tsx`, `collection-field-controls.tsx`, `reference-gallery-field-control.tsx`, `upload-field-control.tsx` | Broad structural validator in `convex/course/validators.ts`; completion-only messages in `features/course/lesson/model/registry/completion.ts` | `fieldValues` state in `use-lesson-state.ts`; persisted into `lessonStates.fieldValues` in `convex/course/shared.ts` | Persistence normalization in `features/course/lesson/model/registry/persistence.ts`; legacy migration in `features/course/lesson/model/registry/legacy.ts` |
| Artifact and pinned-artifact reuse | Lesson `artifact` and `pinnedArtifacts` in lesson source files | `features/course/lesson/workbench/shared/artifact-context.tsx`, `artifact-preview-content.tsx`, `features/course/artifacts/components/*` | Completion gating consumes pinned artifacts in `completion.ts` | Returned from `convex/course/lessonState.ts` and `convex/course/artifacts.ts` | Preview assembly in `registry/artifacts.ts`; stage-bridge summaries in `stage-unlock.ts` |
| Prompt resource generation | Prompt templates and parsers in `features/course/lesson/model/research-prompt.ts` | Active copy-prompt surface in `features/course/lesson/shells/index.tsx`, `shells/use-copy-prompt-resource-card.ts`, and `modes/competitor-research-light/competitor-research-prompt-section.tsx` | Prompt enablement is presence-based only (`getPromptTemplateState`) | No persistence unless a lesson uses `promptImport` | Generates `competitor_research`, `scope_boundary`, and `visual_direction_guide` prompts; only `competitor_research` is actively surfaced today |
| Prompt import + Codex generation infrastructure | `features/course/lesson/workbench/shared/prompt-import-card.tsx`, `app/api/codex/generate/route.ts`, `features/codex/server/app-server.ts` | Would render inside lessons that set `promptImport` | Zod request validation in `app/api/codex/generate/route.ts` | Local pasted-response state in `prompt-import-card.tsx`; optional `codexRuns` logging in Convex | Current lesson source files do not set `promptImport`; pipeline exists but is dormant |
| Starter template access | `features/starter-repo/components/starter-repo-access-form.tsx`, `features/starter-repo/components/starter-repo-access-card.tsx` | Mission / settings / build cards | Strong username validation in `features/starter-repo/lib/github-username.ts` and mutation validation in `convex/course/starterRepoAccess.ts` | `starterRepoAccess` table in `convex/schema.ts` | GitHub provisioning automation in `scripts/starter-repo-access.mjs` and `scripts/lib/starter-repo-access.mjs` |
| Static doc-pack / starter links | `config/product.ts`, `features/course/lesson/model/resources.ts` | Welcome/build cards and resource links | None beyond link presence | Static config only | Exposes static PDFs and starter repo URL; not personalized from student inputs |
| Deploy handoff | `features/course/lesson/content/build.ts` lesson 3.14 fields; local-only secrets in `features/course/lesson/workbench/modes/production-deploy-handoff/production-deploy-handoff-secrets-panel.tsx` | `production-deploy-handoff-workbench.tsx` | Required checklist/product/domain fields via completion logic | Product/domain save to `lessonStates`; secrets remain browser-local only | `production-deploy-handoff-readme-prompt-card.tsx` and `production-deploy-handoff-secrets-panel.tsx` build clipboard packets |
| New long-horizon templates folder | `docs/codex_long_horizon_templates/AGENTS.md`, `CHECKLIST.md`, `docs/prompt.md`, `docs/plans.md`, `docs/implement.md`, `docs/documentation.md` | Not rendered in current app | Not referenced by app validation | Standalone files only | Not wired into docs routing, downloads, lesson resources, starter-template flow, or package assembly |

## What the product asks for today, exactly

### Active lesson inputs

Source of truth:

- CEO and Design lesson fields are defined in `features/course/lesson/model/lessons/start-here.ts`, `features/course/lesson/model/lessons/ceo.ts`, and `features/course/lesson/model/lessons/design.ts`.
- Build lesson fields are defined in `features/course/lesson/content/build.ts`.

Exact field inventory:

### 1.1 Welcome (CEO / guided_form)
- `app_idea`: What are you building? [textarea; required]
- `problem_to_solve`: What problem does it solve? [text; required]
- `why_ship_now`: Why is this worth shipping by Sunday? [text; required]
- `intro_readiness_checklist`: Readiness checklist [checklist; required]

### 1.3 Start With the Problem (CEO / guided_form)
- `problem_1_who`: Who has this problem? [text; required]
- `problem_1_pain`: What recurring pain do they keep running into? [textarea; required]
- `problem_1_frequency`: How frequent is this problem? [radio_group; required]
- `problem_1_severity`: How painful is the problem? [select; required]
- `problem_2_who`: Who has this problem? [text; required]
- `problem_2_pain`: What recurring pain do they keep running into? [textarea; required]
- `problem_2_frequency`: How frequent is this problem? [radio_group; required]
- `problem_2_severity`: How painful is the problem? [select; required]
- `problem_3_who`: Who has this problem? [text; required]
- `problem_3_pain`: What recurring pain do they keep running into? [textarea; required]
- `problem_3_frequency`: How frequent is this problem? [radio_group; required]
- `problem_3_severity`: How painful is the problem? [select; required]

### 1.4 Pick One User (CEO / guided_form)
- `problem_when`: When does this problem happen? [text; required]
- `problem_where`: Where / in what situation does it happen? [text; required]
- `problem_trigger`: What is the trigger? [text; required]
- `pain_level`: How painful is this? [select; required]
- `pain_why_now`: Why is this painful enough to solve now? [textarea; required]
- `commitment_readiness`: Readiness [checklist; required]

### 1.5 Define the Outcome (CEO / guided_form)
- `messaging_person`: Person [text; required]
- `messaging_problem`: Problem [text; required]
- `messaging_what_it_does`: What it does [text; required]
- `messaging_benefit`: What they get out of it [text; required]
- `outcome_statement_body`: Outcome statement [textarea; required]
- `outcome_self_review`: Quick self-check [checklist; optional]

### 1.6 Light Research, Not a Thesis (CEO / competitor_research_light)
- `research_known_competitors`: Competitors you already know [textarea; required]
- `research_problem_patterns`: What problem patterns keep showing up? [textarea; optional]
- `research_pricing_notes`: Pricing - likes, dislikes, patterns [textarea; optional]
- `research_messaging_notes`: Messaging - likes, dislikes, patterns [textarea; optional]
- `research_product_notes`: Product - likes, dislikes, patterns [textarea; optional]
- `research_flow_checklist`: Research flow [checklist; required]
- `research_things_tried`: What you opened, downloaded, or tried [textarea; optional]
- `research_directional_takeaway`: Directional takeaway [textarea; required]

### 1.8 CEO Wrap-Up (CEO / guided_form)
- `ceo_wrap_carry_forward`: What you're carrying into Design [textarea; optional]
- `ceo_wrap_risk_watch`: One risk to watch [textarea; optional]

### 1.9 CEO Skills (CEO / guided_form)
- `ceo_skills_setup_checklist`: In Codex, I have... [checklist; required]
- `codex_project_folder_name`: Project / folder name [text; required]
- `ceo_skills_building_and_problem`: What am I building and what problem does it solve? [textarea; required]
- `ceo_skills_workflow_stage`: Current focus (optional) [select; optional]

### 2.1 Map the Core Flow (DESIGN / core_flow_sketch)
- `core_problem`: Problem being solved [text; required]
- `core_audience`: Who it's for [text; required]
- `core_transformation`: How it changes them [text; required]
- `core_desired_outcome`: Desired outcome [text; required]
- `core_must_have_features`: Must-have features (for this flow) [textarea; required]
- `core_execution_checklist`: Execution checklist [checklist; required]
- `core_sketch_notes`: Sketch notes [textarea; optional]
- `core_named_screens`: Your screen list (in order) [textarea; required]
- `core_brand_path`: Brand assets [radio_group; required]
- `core_brand_guide_notes`: Brand guide notes (optional) [textarea; optional]

### 3.0 Build Kickoff (BUILD / build_setup_launchpad)
- `build_product_folder_name`: Product folder name [text; required]
- `build_setup_prereqs`: Setup checklist [checklist; required]

### 3.1 Iterate the product with AI (BUILD / build_product_iteration)
- `build_product_iteration_setup_checklist`: Setup checklist [checklist; required]
- `build_product_iteration_brand_strategy`: Brand strategy instructions [textarea; required]
- `build_product_iteration_brand_design`: Brand design instructions [textarea; required]
- `build_product_iteration_starter_idea`: Selected starter idea [textarea; required]
- `build_product_iteration_generated_posts`: Generated posts (v1 batch) [textarea; required]

### 3.4 Wire DB, Auth, and Payments (BUILD / build_ship_roadmap)
- `build_ship_roadmap_build_phase`: Build phase checklist [checklist; required]
- `build_ship_roadmap_ship_phase`: Ship phase checklist [checklist; required]
- `build_ship_roadmap_service_accounts`: Service account readiness [checklist; required]
- `build_ship_roadmap_scope`: Scope decision [checklist; required]
- `build_ship_roadmap_marketing_brief`: Marketing site copy brief [textarea; required]
- `build_ship_roadmap_preferred_domain`: Preferred domain [text; required]
- `build_ship_roadmap_support_email`: Support email [text; required]
- `build_ship_roadmap_logging_plan`: Logging plan [textarea; required]
- `build_ship_roadmap_first_testers`: First testers / friends to send it to [textarea; required]

### 3.5 Codex Marketing Site (BUILD / codex_marketing_site)
- `codex_marketing_saved_prompt`: Your reusable marketing-site prompt [textarea; required]
- `codex_marketing_product`: Product (one line) [text; required]
- `codex_marketing_audience`: Audience / ICP [text; required]
- `codex_marketing_problem`: Problem [textarea; required]
- `codex_marketing_pain`: Pain [textarea; required]
- `codex_marketing_frequency`: Frequency [text; required]
- `codex_marketing_why_matters`: Why it matters [textarea; required]
- `codex_marketing_outcome`: Outcome [text; required]
- `codex_marketing_capability`: Product capability [textarea; required]
- `codex_marketing_copy_eyebrow`: Eyebrow [textarea; required]
- `codex_marketing_copy_subheader`: Subheader [textarea; required]
- `codex_marketing_copy_primary_cta`: Primary CTA [textarea; required]
- `codex_marketing_copy_secondary_cta`: Secondary CTA [textarea; required]
- `codex_marketing_copy_promise`: Promise line [textarea; required]
- `codex_marketing_copy_highlights`: Highlights [textarea; required]
- `codex_marketing_copy_faq`: FAQ / comparison notes [textarea; required]
- `codex_marketing_style_reference_url`: Style reference URL (optional) [url; optional]
- `codex_marketing_workflow`: Workflow checklist [checklist; required]

### 3.6 Switch to Sandbox and Boot Local (BUILD / route_access_orientation)
- `route_access_codex_prompt`: Codex prompt [textarea; optional]
- `route_access_inspection_checklist`: Inspection workflow [checklist; required]
- `route_access_pages_public`: Pages I want public [textarea; required]
- `route_access_pages_paywall`: Pages I want behind the paywall [textarea; required]
- `route_access_route_map`: Protected route map (your app) [textarea; required]
- `route_access_access_stack_note`: Access stack in this template [textarea; required]
- `route_access_routes_to_change`: Routes I plan to change later [textarea; required]

### 3.7 Read and Execute AI Plans (BUILD / fresh_template_plan)
- `fresh_template_plan_manual_prompt`: Manual planning prompt [textarea; required]
- `fresh_template_plan_reasoning`: Reasoning depth [text; required]
- `fresh_template_plan_reference_path`: Reference codebase path [text; optional]
- `fresh_template_plan_include_convex`: Include Convex [toggle; optional]
- `fresh_template_plan_include_nextjs`: Include Next.js [toggle; optional]
- `fresh_template_plan_include_clerk`: Include Clerk [toggle; optional]
- `fresh_template_plan_include_stripe`: Include Stripe [toggle; optional]
- `fresh_template_plan_stack_other`: Other stack notes [text; optional]
- `fresh_template_plan_codex_output`: Codex plan [textarea; optional]

### 3.8 Build Setting Up Slices (BUILD / build_setting_up_slices)
- `build_slices_planning_path`: Planning path [text; required]
- `build_slices_core_ux_or_prompt`: Core UX or planning prompt [textarea; required]
- `build_slices_reference_link`: Reference link (optional) [url; optional]
- `build_slices_packet`: Slices packet (planner output) [textarea; required]
- `build_slices_selected_slice`: Next slice to build [textarea; required]
- `build_slices_review_checklist`: Review before build [checklist; required]
- `build_slices_user_flow_sketch`: User flow sketch (optional) [textarea; optional]

### 3.9 Implement the First Slice (BUILD / brand_kit_workbench)
- `brand_kit_app_name`: App name [text; required]
- `brand_kit_initials`: Initials [text; required]
- `brand_kit_domain`: Domain [text; required]
- `brand_kit_primary_hex`: Primary hex [text; required]
- `brand_kit_accent_hex`: Accent hex [text; required]
- `brand_kit_naming_exercise`: Naming exercise [textarea; required]
- `brand_kit_icon_upload`: Icon upload (optional) [image_upload; optional]
- `brand_kit_wordmark_upload`: Wordmark upload (optional) [image_upload; optional]
- `brand_kit_artifact_checklist`: Brand kit checklist [checklist; required]

### 3.10 Build Core UX Plan Flow (BUILD / core_ux_plan_flow)
- `ux_plan_raw_build_idea`: Rough build idea (optional) [textarea; optional]
- `ux_plan_release_distribution`: Release distribution (your build) [text; required]
- `ux_plan_local_codex_bridge`: Local Codex bridge (your build) [text; required]
- `ux_plan_buyer_ai_promise`: Buyer-facing AI promise (your build) [textarea; required]
- `ux_plan_install_destination`: After purchase, where do buyers install? (your build) [text; required]
- `ux_plan_plan_slices`: Slices (v1 plan) [textarea; required]
- `ux_plan_plan_affected_areas`: Affected codebase areas [textarea; required]
- `ux_plan_plan_risks`: Risks [textarea; required]
- `ux_plan_plan_dependencies`: Dependencies [textarea; required]
- `ux_plan_workflow_checklist`: Workflow checklist [checklist; required]

### 3.11 Core UX Build (BUILD / core_ux_build)
- `core_ux_onboarding_checklist`: Onboarding requirements [checklist; required]
- `core_ux_strategy_prompt`: Strategy prompt (edit, copy to ChatGPT) [textarea; required]
- `core_ux_brand_references`: Brand references [reference_gallery; required]
- `core_ux_blog_link`: Blog link (source material) [url; required]
- `core_ux_post_mimic_image`: Image upload (post to mimic) [image_upload; required]
- `core_ux_codex_brief`: Codex implementation brief (dictate or edit) [textarea; required]
- `core_ux_handoff_checklist`: Handoff package [checklist; required]

### 3.12 Core UX Build 3 (BUILD / checkout_qa_loop)
- `checkout_qa_preflight`: Testing preflight checklist [checklist; required]
- `checkout_qa_prompt`: QA test prompt (editable) [textarea; optional]
- `checkout_qa_report`: Fresh-account checkout QA report [textarea; required]
- `checkout_qa_current_step`: Current step (live status) [text; optional]
- `checkout_qa_last_issue`: Last issue found (live status) [text; optional]
- `checkout_qa_browser_running`: QA browser session running [toggle; optional]
- `checkout_qa_scenario`: Account scenario [text; optional]

### 3.14 Production Deploy Handoff (BUILD / production_deploy_handoff)
- `deploy_handoff_steps`: Deployment steps [checklist; required]
- `deploy_handoff_product_name`: Product name [text; required]
- `deploy_handoff_domain`: Domain [text; required]
- `deploy_handoff_success_checks`: Tick when each check is true [checklist; optional]

### 3.16 Finalize Build Handoff and Unlock Ship (BUILD / skills_quickstart)
- `build_skills_usage_checklist`: Skill usage habit [checklist; required]
- `build_skills_first_tagged_prompt`: Your first tagged prompt [textarea; required]

### Non-lesson inputs

1. Starter repo access
   - Visible field: `githubUsername`
   - Definition / render: `features/starter-repo/components/starter-repo-access-form.tsx`
   - Validation: `features/starter-repo/lib/github-username.ts`, `convex/course/starterRepoAccess.ts`
   - Storage: `starterRepoAccess` table in `convex/schema.ts`
   - Consumption: starter-template access cards, GitHub invite script, mission/settings/build gating

2. Production deploy secrets
   - Visible local-only fields: `cloudflareToken`, `stripeSecret`, `clerkKeys`
   - Definition / render: `features/course/lesson/workbench/modes/production-deploy-handoff/production-deploy-handoff-secrets-panel.tsx`
   - Validation: none beyond raw input
   - Storage: not persisted; browser session only
   - Consumption: clipboard-only full handoff packet

3. Prompt-import pasted response
   - Visible local-only field: `pastedResponse`
   - Definition / render: `features/course/lesson/workbench/shared/prompt-import-card.tsx`
   - Validation: parser in `features/course/lesson/model/research-prompt.ts`
   - Storage: local state only until parsed into lesson fields
   - Consumption: dormant because no active lesson sets `promptImport`

4. Codex generation payload
   - Accepted fields: `templateId`, `prompt`, `lessonId`, `model`
   - API schema: `app/api/codex/generate/route.ts`
   - Consumption: Codex app-server text generation in `features/codex/server/app-server.ts`
   - Current state: reachable from `prompt-import-card.tsx`, but dormant in active curriculum

## Hidden, defaulted, derived, and system-generated inputs

| Input | Evidence | Current behavior | Audit note |
|---|---|---|---|
| `selected_problem_index` | `features/course/lesson/model/lessons/ceo.ts` | Hidden handoff selection from lesson 1.3 into 1.4 | Derived from earlier candidate problems; not user-retyped as a free field |
| `selected_problem_owner`, `selected_problem_statement` | `features/course/lesson/model/lessons/ceo.ts`, `features/course/lesson/model/registry/artifacts.ts` | Derived persisted fields used in artifact previews and prompt context | Good reuse pattern; should be extended to later flows |
| `__fieldShapeVersion` | `features/course/lesson/model/registry/shared.ts`, `features/course/lesson/model/registry/persistence.ts` | Auto-added during persistence | Internal schema-compatibility field, not a student input |
| Default `core_ux_strategy_prompt` | `features/course/lesson/workbench/modes/core-ux-build/core-ux-build-use-field-seeds.ts`, `core-ux-build-constants.ts` | Seeded automatically if empty | Output-shaping prompt, but currently generic and not derived from saved CEO/design context |
| Default `core_ux_codex_brief` | `core-ux-build-use-field-seeds.ts`, `core-ux-build-constants.ts` | Seeded automatically if empty | Same issue: useful scaffold, weak contextual grounding |
| Default `fresh_template_plan_manual_prompt` | `fresh-template-plan-workbench.tsx`, `fresh-template-plan-constants.ts` | Seeded automatically if empty | Long-horizon planning prompt scaffold exists, but not fed by prior student inputs |
| Default `fresh_template_plan_reasoning` | `fresh-template-plan-workbench.tsx` | Defaults to `medium` | Good hidden default, but no rationale guidance from student complexity data |
| Default QA prompt display | `checkout-qa-loop-prompt-panel.tsx`, `checkout-qa-loop-constants.ts` | Shows instructor template when empty | Not saved unless edited; does not interpolate current product data |
| Deploy secrets | `production-deploy-handoff-secrets-panel.tsx` | Browser-local only, intentionally unsaved | Correct for security, but makes the final handoff packet ephemeral |
| Legacy migrated fields | `features/course/lesson/model/registry/legacy.ts` | Migrates legacy reference-board, sketch-upload, and visual-direction fields | Important because visual-direction/scope infrastructure exists even though active lessons do not use it |

## Canonical input matrix

Status legend:

- Covered: current inputs are strong enough for the intended downstream outcome.
- Partial: some relevant data exists, but not in the right structure or not strong enough.
- Missing: required input is not collected anywhere active.
- Not applicable: should not be asked directly in-product; belongs in system templates, repo docs, or derived outputs.

| Canonical input | Current label(s) | Flow(s) | File path(s) | Validation / schema source | Storage / state | Downstream consumers | Design checklist mapping | Long-horizon checklist mapping | Status | Recommendation |
|---|---|---|---|---|---|---|---|---|---|---|
| Product concept | `app_idea`, `codex_marketing_product`, `ceo_skills_building_and_problem`, `build_product_iteration_starter_idea` | Welcome, CEO Skills, Marketing Site, AI Iteration | `features/course/lesson/model/lessons/start-here.ts`, `features/course/lesson/model/lessons/ceo.ts`, `features/course/lesson/content/build.ts` | Generic `fieldValuesValidator`; completion presence | `lessonStates.fieldValues` | Artifact previews, pinned summaries, manual prompt copy | Real content / product context | Goal / context | Partial | Normalize into one shared `product_summary` and stop re-asking variants |
| Problem candidates | `problem_1_*`, `problem_2_*`, `problem_3_*` | CEO 1.3 | `features/course/lesson/model/lessons/ceo.ts` | Completion only | `lessonStates` | Handoff into selected problem | Ground the task in a real problem | Explicit task context | Covered | Keep; add optional evidence/source note per candidate |
| Selected user and problem | hidden `selected_problem_*`, visible `problem_when`, `problem_where`, `problem_trigger`, `pain_level`, `pain_why_now` | CEO 1.4 | `features/course/lesson/model/lessons/ceo.ts` | Completion only | `lessonStates` | Competitor research prompt, pinned artifacts, later summaries | Audience, context, problem | Context / constraints | Covered | Keep; expose selected problem as canonical shared brief data, not only an artifact preview |
| Problem frequency and severity | `problem_*_frequency`, `problem_*_severity`, `pain_level` | CEO 1.3-1.4 | `features/course/lesson/model/lessons/ceo.ts` | Select/radio only | `lessonStates` | Mostly stays local | Problem urgency | Scope and prioritization | Partial | Keep but normalize as `problem_recurrence` and `problem_severity` once, not repeated slots only |
| Why now / urgency | `why_ship_now`, `pain_why_now`, `codex_marketing_why_matters` | Welcome, CEO 1.4, Marketing Site | `start-here.ts`, `ceo.ts`, `content/build.ts` | Completion only | `lessonStates` | Manual reuse in marketing brief | Narrative and stakes | Why this matters / urgency | Partial | Merge into one shared `why_now` field and prefill later brief flows |
| Outcome scaffold | `messaging_person`, `messaging_problem`, `messaging_what_it_does`, `messaging_benefit` | CEO 1.5 | `features/course/lesson/model/lessons/ceo.ts` | Completion only | `lessonStates` | Prompt context and previews | Narrative/content plan input | Deliverable framing | Partial | Keep, but promote to shared foundation and auto-feed later prompts |
| Outcome statement | `outcome_statement_body` | CEO 1.5 | `features/course/lesson/model/lessons/ceo.ts` | Completion only | `lessonStates` | Competitor research prompt, stage summaries | Core message / promise | Goal and done-when context | Covered | Keep as canonical `value_promise` |
| Research evidence | known competitors, product/pricing/messaging notes, things tried, directional takeaway | CEO 1.6 | `features/course/lesson/model/lessons/ceo.ts` | Completion only | `lessonStates` | Artifact preview only; competitor prompt resource uses earlier user/outcome, not saved research | Competitive context | Risks / decision notes | Partial | Add structured evidence rows and summary fields in the active lesson instead of freeform notes only |
| Codex/tooling readiness | `ceo_skills_setup_checklist`, `codex_project_folder_name`, `ceo_skills_workflow_stage` | CEO 1.9 | `features/course/lesson/model/lessons/ceo.ts` | Completion only | `lessonStates` | Mostly local orientation | Reusable workflow | Durable memory / tool setup | Partial | Keep as orientation, but this belongs more in template docs than in final product-brief model |
| Core UX / core flow definition | `core_problem`, `core_audience`, `core_transformation`, `core_desired_outcome`, `core_must_have_features`, `core_named_screens` | Design 2.1 | `features/course/lesson/model/lessons/design.ts` | Completion only | `lessonStates` | Pinned artifacts and stage summaries | Section purpose, narrative, first flow composition | Scope and architecture intent | Covered | Keep; this is one of the strongest inputs in the product |
| Brand path decision | `core_brand_path`, `core_brand_guide_notes` | Design 2.1 | `features/course/lesson/model/lessons/design.ts` | Completion only | `lessonStates` | Mostly local | Brand-asset readiness | Context / constraints | Partial | Keep the decision, but add explicit typography/color/layout/system fields instead of only notes |
| Build environment readiness | `build_product_folder_name`, `build_setup_prereqs` | Build 3.0 | `features/course/lesson/content/build.ts` | Completion only | `lessonStates` | Local starter setup | None directly | Environment / bootstrap | Partial | Keep as onboarding metadata, but it should not be part of the final product-definition model |
| Brand/voice outputs from AI iteration | `build_product_iteration_brand_strategy`, `build_product_iteration_brand_design`, `build_product_iteration_starter_idea`, `build_product_iteration_generated_posts` | Build 3.1 | `features/course/lesson/content/build.ts`, `build-product-iteration-constants.ts` | Completion only | `lessonStates` | Export markdown; later manual reuse | Brand direction, copy inputs | Not long-horizon-specific | Partial | Reframe as derived outputs from shared brief + design inputs, not as an isolated lesson silo |
| Build/ship execution constraints | build phase, ship phase, service accounts, scope, domain, support email, logging, testers | Build 3.4 | `features/course/lesson/content/build.ts` | Completion only | `lessonStates` | Artifact preview only | Limited product UI / ops context | Constraints, dependencies, validation, rollout | Partial | Split into shared `launch_constraints`, `distribution`, `ops`, `testing`, `support` sections and reuse downstream |
| Marketing site brief | product, audience, problem, pain, frequency, why matters, outcome, capability | Build 3.5 | `features/course/lesson/content/build.ts`, `codex-marketing-site-brief-block.tsx` | Completion only | `lessonStates` | Used only as manual brief fields beside static prompt | Narrative, copy discipline, CTA inputs | Prompt spec context | Partial | Stop re-entering these manually; derive them from shared product brief and only ask for missing marketing-specific nuance |
| Marketing copy outputs | eyebrow, subheader, primary CTA, secondary CTA, promise, highlights, FAQ | Build 3.5 | `content/build.ts`, `codex-marketing-site-copy-tabs.tsx` | Completion only | `lessonStates` | Artifact preview only | Copy structure | Not a long-horizon requirement | Covered | Keep as output fields, not shared foundation |
| Marketing style reference | `codex_marketing_style_reference_url` | Build 3.5 | `content/build.ts`, `codex-marketing-site-style-workflow.tsx` | URL field only | `lessonStates` | Manual style pass only | Visual references / mood board | UI-context attachment | Partial | Expand to multi-reference gallery and desired style attributes |
| Route/access model | public pages, paywalled pages, route map, access-stack note | Build 3.6 | `features/course/lesson/content/build.ts` | Completion only | `lessonStates` | Local planning only | Product/workspace IA | Architecture intent / file ownership | Partial | Keep, but merge into the final build plan packet rather than a standalone lesson artifact |
| Long-horizon planning prompt config | manual prompt, reasoning depth, reference path, stack flags, other stack notes | Build 3.7 | `features/course/lesson/content/build.ts`, `fresh-template-plan-prompt-controls.tsx`, `build-fresh-template-plan-prompt.ts` | Completion only; reasoning enum parser | `lessonStates` | Clipboard-only planning prompt; optional saved Codex plan | Spec / constraints only indirectly | Plan, reasoning level, context, stack | Partial | Keep, but auto-assemble from shared brief and wire to durable spec templates |
| Planner output and slice choice | planning path, core UX or planning prompt, reference link, packet, selected slice, review checklist | Build 3.8 | `features/course/lesson/content/build.ts`, `build-setting-up-slices-guide.tsx` | Completion only | `lessonStates` | Artifact preview only | Implementation decomposition | Milestones / next slice / dependencies | Partial | Convert into structured slice objects and a single authoritative milestone plan packet |
| Brand system basics | app name, initials, domain, primary hex, accent hex, naming, icon, wordmark | Build 3.9 | `features/course/lesson/content/build.ts` | Completion only | `lessonStates` plus upload storage | Artifact previews, later manual use | Design system tokens and assets | None directly | Partial | Add typography roles, surface/text tokens, visual thesis, and usage rules |
| Build plan brief | release distribution, local bridge, buyer AI promise, install destination, slices, affected areas, risks, dependencies | Build 3.10 | `features/course/lesson/content/build.ts`, `core-ux-plan-flow-constants.ts`, `core-ux-plan-flow-approved-summary.tsx` | Completion only | `lessonStates` | Summary card only | Some product/distribution context | Strong overlap with long-horizon plan requirements | Partial | This should become the core of the long-horizon packet, but it is currently too narrow and too manual |
| Core UX build handoff | strategy prompt, brand references, blog link, mimic image, Codex brief, handoff checklist | Build 3.11 | `features/course/lesson/content/build.ts`, `core-ux-build-constants.ts`, `core-ux-build-handoff-card.tsx` | Completion only; uploads structurally validated | `lessonStates`, upload storage | Copy-to-clipboard prompt/brief only | Visual references, imagery, implementation handoff | Prompt context, deliverable context | Partial | Strong foundation; add explicit design-spec sections so it becomes a real implementation packet |
| Checkout QA setup and report | preflight, QA prompt, QA report, current step, last issue, browser running, scenario | Build 3.12 | `features/course/lesson/content/build.ts`, `checkout-qa-loop-prompt-panel.tsx` | Completion only | `lessonStates` | Clipboard QA prompt; report artifact | Visual verification / browser QA | Validation loop / smoke flow | Partial | Keep; interpolate current product/route context into the QA prompt automatically |
| Production deploy context | deploy steps, product name, domain, success checks | Build 3.14 | `features/course/lesson/content/build.ts`, `production-deploy-handoff-context-fields-card.tsx` | Completion only | `lessonStates` | README prompt + context block | Not design-specific | Deploy/run/demo context | Partial | Keep, but fold into final repo package / launch packet |
| Production secrets | cloudflare token, stripe secret, clerk keys | Deploy secrets panel | `production-deploy-handoff-secrets-panel.tsx` | None | Browser-local only | Clipboard-only full packet | N/A | Secrets / env handoff | Partial | Correctly local-only, but the workflow is ephemeral and not integrated with the final package |
| Skill usage / tagged prompt | checklist, first tagged prompt | Build 3.16 | `features/course/lesson/content/build.ts` | Completion only | `lessonStates` | Artifact only | Reusable workflow extraction | Skills / reusable workflow | Partial | Keep as training support, not part of product-definition core |
| Starter repo provisioning | `githubUsername` | Mission, settings, build cards | `features/starter-repo/components/starter-repo-access-form.tsx`, `convex/course/starterRepoAccess.ts`, `scripts/starter-repo-access.mjs` | Strong username validation | `starterRepoAccess` table | GitHub invite automation and template gating | N/A | Repo/package access | Covered | Keep exactly; this is one of the few non-lesson inputs with strong validation and real downstream effect |
| Prompt import / Codex generation | `templateId`, `prompt`, `lessonId`, `model`, pasted response | Dormant infrastructure | `prompt-import-card.tsx`, `app/api/codex/generate/route.ts`, `research-prompt.ts` | Zod request validation + parser validation | Local UI state plus `codexRuns` logging | Would populate structured fields automatically | Strong potential for design prompt import | Strong potential for long-horizon plan import | Missing in active workflow | Wire this before building new generation infrastructure |
| Long-horizon durable-memory templates | `AGENTS.md`, `CHECKLIST.md`, `docs/prompt.md`, `docs/plans.md`, `docs/implement.md`, `docs/documentation.md` templates | Standalone docs folder | `docs/codex_long_horizon_templates/*` | None | Files only | None today | Reusable design/build guidance indirectly | Directly maps to long-horizon durable-memory requirements | Missing in active workflow | Promote into starter/doc-pack workflow and link from active lessons/docs |

## Checklist coverage matrix: long-horizon

Normalization approach:

- The source doc has 107 individual checklist items in `docs/long-horizon-checklist.md`.
- Many are process-only and should live in starter templates and repo guidance rather than student-facing questions.
- I normalized them into product-relevant requirement groups below.

| Normalized long-horizon requirement | Current evidence | Coverage | Ask directly / derive / system-template | Notes |
|---|---|---|---|---|
| Goal, context, constraints, done-when | Student inputs cover problem, user, outcome, core flow, build constraints in multiple lessons | Partial | Ask directly once, then derive elsewhere | Good raw material exists, but it is fragmented across lessons and not assembled |
| Durable spec file | New templates folder contains `docs/prompt.md` template | Partial | System-template | Strong template now exists in `docs/codex_long_horizon_templates/docs/prompt.md`, but no active flow populates it |
| Explicit non-goals and hard constraints | `build_ship_roadmap_scope`, some service/account constraints | Partial | Ask directly + system-template | Current scope capture is too shallow; no explicit non-goals file |
| Milestone plan with acceptance criteria and validation commands | `fresh_template_plan_*`, `build_slices_*`, `ux_plan_*` collect planning fragments | Partial | Ask some, derive some, template the rest | No current output creates a milestone plan file with commands and stop-and-fix rule |
| Stop-and-fix rule | Present in templates (`docs/plans.md`, `CHECKLIST.md`) only | Partial | System-template | Not represented in active student workflow |
| Decision log / architecture intent | `ux_plan_plan_affected_areas`, `ux_plan_plan_risks`, `ux_plan_plan_dependencies` | Partial | Ask directly + system-template | Needs promotion into durable file output |
| Rollback strategy | Not actively collected | Missing | Ask directly or template | Should be part of the long-horizon plan packet |
| Repo-level AGENTS plus nested memory files | Repo root `AGENTS.md` exists; new template stack exists in `docs/codex_long_horizon_templates/` | Partial | System-template | Not wired into starter or course handoff |
| Live status log | `docs/codex_long_horizon_templates/docs/documentation.md` only | Partial | System-template | No current output populates a running status file |
| Environment/bootstrap/worktree strategy | Build kickoff and repo-map lessons collect setup status | Partial | Ask some, template some | Setup is covered; worktree/isolation strategy is not |
| Validation commands and smoke/demo flow | QA and deploy lessons capture some smoke flow pieces | Partial | Ask some, derive some | Needs one centralized validation section in the final plan packet |
| Thread/session hygiene, compaction, subagents | Not actively collected; only explained in docs/checklists/templates | Not applicable as direct student input | System-template | Belongs in the starter doc pack, not in product-definition forms |
| Worktrees and concurrent isolation | Not actively collected | Not applicable as direct student input | System-template | Same as above |
| Skills/MCP/automation extraction | Skills quickstart lesson exists | Partial | Ask lightly, mostly system-template | Training exists, but no package output captures recommended skills by project |
| Final handoff summary with risks and next steps | Current system has scattered artifacts and status checklists | Partial | Derive + system-template | No single final summary object exists |

## Checklist coverage matrix: design

Normalization approach:

- The source doc has 220 checklist items in `docs/design-checklist.md`.
- Many items are detailed design heuristics that should become generated design-spec sections, not form fields.
- I normalized them into practical design-input requirement groups below.

| Normalized design requirement | Current evidence | Coverage | Ask directly / derive / system-template | Notes |
|---|---|---|---|---|
| Goal, context, constraints, done-when for design tasks | CEO + Design + Marketing inputs provide user/problem/outcome/flow/copy context | Partial | Ask directly once, derive later | Still fragmented |
| Preserve existing patterns / visual language | No explicit field | Missing | Ask directly or derive from repo/reference | Important for real redesign vs extension work |
| Real content / product context | Strong early-product fields and marketing brief fields | Covered | Ask directly | One of the strongest parts of the current system |
| Design system basics: typography, color palette, layout | Brand kit captures app name, domain, primary/accent hex, icon/wordmark; no typography/layout | Partial | Ask directly | Current system under-collects actual design-system rules |
| Narrative/content strategy | Outcome statement and marketing brief exist | Partial | Ask directly + derive | Missing explicit content-plan structure |
| Hard page constraints (H1, section count, CTA discipline) | No explicit fields | Missing | Ask directly or generate in design spec | Easy high-leverage addition |
| Visual thesis / mood / energy | No explicit field | Missing | Ask directly | Large gap for design quality |
| Interaction thesis / motion ideas | No explicit field | Missing | Ask directly | Large gap |
| Section-by-section responsibilities | Core named screens exist; no section jobs for marketing/design specs | Partial | Ask directly + derive | Core flow covers screens, not page narrative sections |
| Visual references / mood board / screenshots | `core_ux_brand_references`, `core_ux_post_mimic_image`, optional style URL | Partial | Ask directly | Good start, but too late in the flow and not normalized |
| Image-source preferences and asset availability | Icon/wordmark uploads, mimic image, brand references | Partial | Ask directly + derive | Needs explicit "what assets do you already have?" foundation section |
| Token definitions for surface/text/accent roles | Only primary/accent hex captured | Partial | Ask directly | Missing background/surface/text token roles |
| Typography roles and voice | No explicit typography capture; brand strategy/design free text exists | Partial | Ask directly + derive | Free text is too weak for reliable generation |
| Hero / first viewport direction | Marketing brief covers message, not composition | Missing | Ask directly or generate from design spec | Important gap |
| Cardlessness / narrative layout / composition guardrails | No explicit fields | Missing | System-template or generated design spec | Better as generated spec from explicit thesis + references |
| Copy discipline and CTA hierarchy | Marketing copy outputs exist | Covered for marketing output, partial for foundation | Ask directly + derive | Good output capture, weak upstream constraints |
| Product UI vs marketing UI distinction | Build lessons separate marketing site from core UX build | Partial | Derive | Structure exists, but no canonical field in the final model |
| Motion requirements | No explicit fields | Missing | Ask directly | Needed for checklist completeness |
| Responsive safety / mobile constraints | No explicit fields | Missing | Ask directly or template | Could be generated from design spec, but needs at least one explicit constraint field |
| Browser verification expectations | QA lessons exist later | Partial | System-template + derive | Not collected as design intent |
| Figma round-trip / design source of truth | `core_brand_path` mentions Figma or Canva; no active Figma-node intake | Partial | Ask directly when relevant | Dormant `visual_direction` infrastructure suggests a natural next step |
| Reusable design guidance via AGENTS / skills | Present in docs and new templates, not wired into student flow | Partial | System-template | Should land in final package rather than be re-asked |

## Gap analysis

### Highest-value missing inputs

1. Visual thesis
   - No active field captures the intended aesthetic in one sentence.
   - Missing impact: weak design-spec quality and bland downstream UI direction.

2. Typography direction
   - No active field captures type pairings, roles, or brand voice in a structured way.
   - Existing proxies: free-text brand design instructions and optional brand notes.

3. Explicit design-system roles
   - Current brand kit only captures `primary_hex` and `accent_hex`.
   - Missing: background, surface, primary text, muted text, accent usage rules.

4. Interaction / motion intent
   - No active field captures 2-3 motion ideas or interaction tone.
   - Missing impact: design checklist coverage is poor for motion and feel.

5. Section-by-section design narrative
   - Marketing copy asks for copy fragments, not page structure or section jobs.
   - Missing impact: hard to generate a strong landing-page spec from current inputs alone.

6. Explicit non-goals / out-of-scope file-ready structure
   - `build_ship_roadmap_scope` is too coarse.
   - Missing impact: weak long-horizon plan quality and scope control.

7. Milestone acceptance criteria and validation commands
   - Collected nowhere as student data.
   - New template stack supports them, but active workflows do not.

8. Rollback / recovery plan
   - Missing entirely.

9. Final package manifest
   - No active output says: include starter repo X, doc pack Y, generated prompt Z, validations Q.

10. Source-of-truth preference
   - No field asks whether Figma, rough sketch, existing repo pattern, or a reference site is authoritative.

### Structural weaknesses

1. Shared concepts are re-entered repeatedly
   - Product, audience, problem, why-now, outcome, and capability are captured multiple times across Welcome, CEO, Build, and Marketing.
   - Example evidence: `app_idea` / `problem_to_solve` / `why_ship_now` in `start-here.ts`; `ceo_skills_building_and_problem` in `ceo.ts`; `codex_marketing_*` brief fields in `content/build.ts`.

2. Pinned artifacts are visible but not truly reused
   - Many later workbenches show `ArtifactContext` or pinned summaries, but still require manual re-entry into fresh textareas.
   - Evidence: `codex-marketing-site-workbench.tsx`, `build-setting-up-slices-workbench.tsx`, `fresh-template-plan-workbench.tsx`.

3. Active validation mostly checks presence, not quality
   - The lesson system verifies "filled" rather than "strong enough."
   - Evidence: broad `fieldValuesValidator` in `convex/course/validators.ts`; completion logic in `registry/completion.ts`.

4. Strong prompt infrastructure exists but is mostly dormant
   - `research-prompt.ts`, `prompt-import-card.tsx`, and `/api/codex/generate` are ready.
   - Active lesson configs do not use `promptImport` or `briefAssembler`.

5. Final output assembly is missing
   - No code path assembles one design spec, one long-horizon packet, or one repo handoff package from the captured data.

6. The new durable-memory template stack is not part of any current workflow
   - It is exactly the right shape for long-horizon outputs, but it is disconnected from the course product.

## Recommended target input architecture

### Shared foundation

Ask once, reuse everywhere:

1. Product summary
   - name
   - one-sentence product
   - one-sentence why now

2. User and pain
   - primary user
   - core problem
   - when / where / trigger
   - frequency / severity
   - why now

3. Desired outcome
   - outcome statement
   - what it does
   - benefit
   - success metric or success moment

4. Scope and constraints
   - in-scope v1
   - out-of-scope v1
   - key dependencies
   - key risks
   - release distribution
   - install destination

5. Source-of-truth assets
   - core flow / screen list
   - visual references gallery
   - source material URL(s)
   - asset availability: logo, wordmark, screenshots, Figma/Canva, content assets

6. Technical context
   - starter template path
   - stack flags
   - repo path
   - route/access model

### Design-specific

Add these explicitly:

1. Visual thesis
2. Typography direction
3. Color/token roles
4. Layout/composition direction
5. Section/content plan
6. Motion / interaction thesis
7. Responsive / device priorities
8. Existing-pattern preservation rules

### Build / long-horizon-specific

Add or normalize these:

1. Milestone slices
2. Acceptance criteria per slice
3. Validation commands
4. Stop-and-fix rule
5. Rollback plan
6. Decision log
7. Final handoff package manifest

### Derived / system-generated

Do not ask directly unless needed:

1. Selected problem owner / statement
2. Field shape version
3. Assembled planning prompt
4. Assembled README deploy prompt
5. Design spec markdown
6. Long-horizon durable-memory file set
7. Repo package manifest

## Before / after structural model

### Before

- Lesson-local textareas and checklists
- Repeated product/problem/outcome re-entry
- Pinned artifacts shown, not normalized
- Static prompt templates copied manually
- Static PDFs and starter repo URL linked separately
- No final package assembler

### After

- Shared canonical brief record
- Flow-specific deltas layered on top
- Derived outputs generated from the canonical brief
- Reused dormant prompt-import infrastructure
- Durable-memory templates wired into final package generation
- Starter repo + doc pack + build prompt assembled from one source

## Checklist-template folder audit

Folder contents:

- `docs/codex_long_horizon_templates/AGENTS.md`
- `docs/codex_long_horizon_templates/CHECKLIST.md`
- `docs/codex_long_horizon_templates/docs/prompt.md`
- `docs/codex_long_horizon_templates/docs/plans.md`
- `docs/codex_long_horizon_templates/docs/implement.md`
- `docs/codex_long_horizon_templates/docs/documentation.md`

What it is:

- A strong durable-memory file stack for long-running Codex work.
- It directly matches the long-horizon checklist requirements for:
  - repo instructions
  - task spec
  - milestone plan
  - execution runbook
  - live status log

Current wiring status:

- It stands alone today.
- I found no active references to `docs/codex_long_horizon_templates` in `app/`, `features/`, `convex/`, `content/`, `config/`, or `scripts/`.
- The docs app resolves only `content/docs` through `features/docs/server/page-paths.ts`, so this folder is not part of the current docs-site routing.
- Current static downloadable resources are only the PDFs and starter repo URL declared in `config/product.ts` and surfaced through `features/course/lesson/model/resources.ts` and starter-template cards.

Audit judgment:

- This folder is high-value and should be used.
- It is not wired into any current workflow.
- It is the clearest candidate for the long-horizon portion of the final repo/doc-pack/build-prompt package.

## Implementation plan

### Phase 1: canonical model and reuse wiring

Goal: stop re-entry and create one shared foundation without a UI rewrite.

1. Introduce a canonical brief mapper
   - Read from existing lesson artifacts and current field values.
   - Output one normalized object for product, user, outcome, flow, constraints, and assets.

2. Reuse that object in downstream build flows
   - Prefill marketing brief fields.
   - Prefill fresh-template planning prompt.
   - Prefill core UX plan/build scaffolds.

3. Keep existing fields and screens
   - Minimal-diff: do not delete current lessons first.
   - Add derivation and prefills before changing lesson structure.

### Phase 2: fill the highest-value design and long-horizon gaps

Goal: collect the small missing set that materially improves output quality.

Add these new fields:

1. Visual thesis
2. Typography direction
3. Token roles
4. Content / section plan
5. Interaction thesis
6. Explicit non-goals
7. Acceptance criteria
8. Validation commands
9. Rollback plan

Where:

- Prefer one new shared foundation step rather than sprinkling duplicates across Build and Design.
- If needed, add one design supplement lesson and one long-horizon supplement lesson rather than editing every existing lesson.

### Phase 3: activate dormant prompt/template infrastructure

Goal: use what already exists instead of inventing another pipeline.

1. Wire an active lesson to `promptImport`
2. Reuse `/api/codex/generate`
3. Generate:
   - design-spec markdown
   - scope-boundary output
   - long-horizon plan draft

4. Parse returned outputs back into structured fields using the existing parser pattern in `research-prompt.ts`

### Phase 4: assemble final package outputs

Goal: produce the actual outcome the product promises.

Add generators for:

1. `design_spec.md`
2. `prompt.md`
3. `plans.md`
4. `implement.md`
5. `documentation.md`
6. package manifest:
   - starter repo URL
   - static PDF/doc resources
   - generated prompts
   - validation/run instructions

Use `docs/codex_long_horizon_templates/` as the template basis for 2-5.

### Phase 5: prune and rename

Goal: reduce duplication after reuse is working.

1. Remove duplicate downstream inputs that are now derived
2. Rename vague field IDs and labels where needed
3. Collapse lesson-local copies into shared brief fields

## Dependencies and migration risks

1. Field-shape compatibility
   - The lesson system already tracks `__fieldShapeVersion`.
   - Use that to add new derived/normalized fields safely.

2. Artifact preview expectations
   - Changing field IDs too early will break artifact summaries and stage-unlock logic.
   - Reuse existing IDs first; add mapping layer before deleting anything.

3. Dormant infrastructure activation
   - `promptImport`, `visual_direction`, `score_table`, and `briefAssembler` paths may need light hardening before being student-facing again.

4. Security
   - Keep deploy secrets browser-local.
   - Do not move them into Convex persistence.

## Validation strategy

Planning-only recommendation:

1. Add fixture-based tests for canonical brief mapping
2. Add parser tests for generated/imported prompt outputs
3. Add one integration test per generated package:
   - design spec
   - long-horizon file stack
   - starter handoff package
4. Add regression checks for:
   - lesson completion
   - artifact preview rendering
   - pinned artifact hydration

## Risks, assumptions, and open questions

### Risks

1. The current product may intentionally be teaching process rather than maximizing automation, which would make some duplication deliberate.
2. Dormant prompt-import and stage-unlock code may hide edge cases because it is currently unused by active lessons.
3. Students may not have enough context to author strong validation commands unless the UI scaffolds examples.

### Assumptions

1. The intended future product outcome is a generated package, not just a teaching workspace.
2. Existing lesson order should mostly stay intact.
3. Minimal-diff means adding mapping/generation layers before restructuring lessons.

### Open questions

1. Should the final repo package be generated inside this repo or in the gated starter repo?
2. Is the long-horizon template folder meant to ship to students as-is, or serve as internal generation templates?
3. Should marketing-site copy remain a manually refined exercise, or become generated from the shared brief with only delta edits?

## Top 10 highest-leverage changes

1. Create one canonical shared brief object from existing lesson outputs before changing any UI.
2. Prefill downstream Build and Marketing fields from that canonical brief instead of asking students to retype them.
3. Promote `docs/codex_long_horizon_templates/` into the real starter/doc-pack workflow.
4. Add explicit design-only fields for visual thesis, typography direction, token roles, and interaction thesis.
5. Add explicit long-horizon fields for non-goals, validation commands, and rollback plan.
6. Activate the dormant `promptImport` plus `/api/codex/generate` path for at least one real lesson.
7. Convert free-text slice planning into structured milestone data.
8. Generate one final design spec markdown artifact instead of scattering design intent across notes and copied prompts.
9. Generate one final long-horizon packet from the new template stack instead of leaving `prompt.md` / `plans.md` / `implement.md` / `documentation.md` standalone.
10. Keep deploy secrets local, but attach a generated non-secret package manifest so the final handoff is reproducible.

## Final judgment

The repo already captures enough raw product context to support a much better design-spec and long-horizon output than it produces today. The main problem is not total lack of inputs. The main problem is that the inputs are siloed, duplicated, weakly normalized, and only partially consumed.

The best plan is not to add a giant new form. It is to:

1. normalize what already exists,
2. add a small missing set of high-value fields,
3. wire the dormant prompt and durable-memory infrastructure,
4. generate the final package from that shared model.
