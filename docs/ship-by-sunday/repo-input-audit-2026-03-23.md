# Repository Input Audit And Change Plan

Date: 2026-03-23
Mode: Planning only. No product code changed.
Primary objective: audit every current product-definition, design, planning, implementation, scope, constraint, asset, and output-shaping input in the repo; compare it against `docs/long-horizon-checklist.md` and `docs/design-checklist.md`; recommend the minimum high-leverage path to complete coverage.

## Executive Summary

The repo already has a coherent lesson-state engine, but it does not yet have a coherent input architecture.

What works today:
- The curriculum is code-defined and auditable. Input definitions live in lesson configs under `features/course/lesson/model/lessons/*.ts` and `features/course/lesson/content/build.ts`, render through a generic workbench system, and persist to Convex `lessonStates.fieldValues`.
- A narrow shared foundation does exist. The main cross-flow inputs reused later are the selected user/problem from lesson `1.4`, the outcome statement from lesson `1.5`, and the core-flow sketch from lesson `2.1`.
- The repo already contains pieces of the long-horizon target: prompt builders, handoff cards, deploy packet assembly, and the new durable-memory templates in `docs/codex_long_horizon_templates/`.

What is broken:
- The live design flow is extremely underpowered. The active Design block asks for only one real structured artifact, the `2.1` core-flow sketch in `features/course/lesson/model/lessons/design.ts`. It does not actively collect visual references, visual direction, design tokens, motion direction, composition guidance, or a design-spec-grade handoff.
- Build and long-horizon collection is broader, but fragmented. Build lessons collect many planning and implementation fields, yet most of them terminate in artifact preview or copy-paste UX instead of feeding a reusable typed package.
- The repo carries a second, older architecture for prompt import, stage unlock, visual direction, and brief assembly, but current lesson configs do not activate most of it. That creates drift between what the repo can theoretically do and what the current curriculum actually does.
- The new long-horizon templates exist as documentation assets only. Search found no runtime or lesson wiring to `docs/codex_long_horizon_templates/*`.

Bottom line:
- Current status for the target product outcome is:
  - Strong design spec generation: not supported yet.
  - Strong long-horizon implementation plan generation: partially supported.
  - Strong repo package that combines starter template, doc pack, and build prompt: not supported yet.
- The cleanest path is not a broad redesign. It is:
  1. formalize a shared foundation model from existing CEO + Design answers,
  2. fill the missing design inputs in the active Design flow,
  3. assemble long-horizon docs from saved structured state using `docs/codex_long_horizon_templates`,
  4. make current build prompts and packets derive from that shared model instead of static templates.

## Repo Map

### 1. Input definition

Primary lesson definitions:
- `features/course/lesson/model/lessons/start-here.ts`
- `features/course/lesson/model/lessons/ceo.ts`
- `features/course/lesson/model/lessons/design.ts`
- `features/course/lesson/content/build.ts`
- `features/course/lesson/model/contracts.ts`
- `features/course/lesson/model/curriculum.ts`

Operational non-lesson input:
- `features/starter-repo/components/starter-repo-access-form.tsx`
- `features/starter-repo/lib/github-username.ts`
- `convex/course/starterRepoAccess.ts`

### 2. Route entry and rendering

Lesson routes and shells:
- `app/(workspace)/lesson/[lessonKey]/page.tsx`
- `features/course/lesson/components/lesson-page.tsx`
- `features/course/lesson/hooks/use-lesson-page-data.ts`
- `features/course/lesson/workbench/renderer.tsx`

Generic field rendering:
- `features/course/lesson/workbench/fields/field-control.tsx`
- `features/course/lesson/workbench/fields/basic-field-controls.tsx`
- `features/course/lesson/workbench/fields/collection-field-controls.tsx`
- `features/course/lesson/workbench/fields/upload-field-control.tsx`
- `features/course/lesson/workbench/fields/reference-gallery-field-control.tsx`

### 3. Validation, storage, and normalization

Client autosave:
- `features/course/lesson/hooks/use-lesson-state.ts`

Convex read/write path:
- `convex/course/lessonState.ts`
- `convex/course/shared.ts`
- `convex/course/validators.ts`
- `convex/schema.ts`

Normalization and compatibility:
- `features/course/lesson/model/registry/persistence.ts`
- `features/course/lesson/model/registry/legacy.ts`
- `features/course/lesson/model/registry/completion.ts`
- `features/course/lesson/model/registry/artifacts.ts`

### 4. Downstream consumers

Shared artifact reuse:
- `features/course/lesson/workbench/shared/artifact-context.tsx`
- `features/course/lesson/workbench/modes/build-setup-launchpad/build-setup-launchpad-strategy-card.tsx`
- `features/course/lesson/model/research-prompt.ts`
- `features/course/lesson/workbench/modes/paper-photo-upload-context-values.ts`

Prompt and packet builders:
- `features/course/lesson/workbench/modes/fresh-template-plan/build-fresh-template-plan-prompt.ts`
- `features/course/lesson/workbench/shared/prompt-import-card.tsx`
- `features/course/lesson/workbench/modes/codex-marketing-site/codex-marketing-site-constants.ts`
- `features/course/lesson/workbench/modes/production-deploy-handoff/production-deploy-handoff-readme-prompt-card.tsx`
- `features/course/lesson/workbench/modes/production-deploy-handoff/production-deploy-handoff-secrets-panel.tsx`
- `app/api/codex/generate/route.ts`

Saved-work aggregation:
- `convex/course/artifacts.ts`
- `features/course/artifacts/components/artifacts-page.tsx`

### 5. Long-horizon template assets

Template-only, currently not wired:
- `docs/codex_long_horizon_templates/AGENTS.md`
- `docs/codex_long_horizon_templates/CHECKLIST.md`
- `docs/codex_long_horizon_templates/docs/prompt.md`
- `docs/codex_long_horizon_templates/docs/plans.md`
- `docs/codex_long_horizon_templates/docs/implement.md`
- `docs/codex_long_horizon_templates/docs/documentation.md`

## Current System Facts

- The repo-derived lesson inventory found 29 lessons, 21 with active workbench fields, and 148 configured workbench fields.
- The Build block contributes 17 lessons and 96 configured fields from `features/course/lesson/content/build.ts`.
- The active Design block contributes only 3 lessons, and only `2.1` has real structured inputs, with 10 fields from `features/course/lesson/model/lessons/design.ts`.
- The only active asset/reference collection in the live curriculum is late and build-scoped:
  - `core_ux_brand_references`
  - `core_ux_post_mimic_image`
  - `brand_kit_icon_upload`
  - `brand_kit_wordmark_upload`
- The system’s real shared foundation today is:
  - `user_statement`
  - `outcome_statement`
  - `core_flow_sketch_state`

## Canonical Input Matrix

Legend:
- Design mapping:
  - D1 = project and design brief fundamentals
  - D2 = visual references and assets
  - D3 = design system and tokens
  - D4 = screen/flow structure
  - D5 = content, copy, CTA, narrative
  - D6 = product-UI operating clarity and states
  - D7 = motion, responsive behavior, visual verification
  - D8 = Figma / design-to-code round-trip
- Long-horizon mapping:
  - L1 = task/spec definition
  - L2 = durable-memory docs stack
  - L3 = milestone planning, acceptance, validation, rollback
  - L4 = environment, setup, safety, permissions
  - L5 = execution, verification, handoff

| Canonical input | Current label(s) | Flow(s) | File path(s) | Validation/schema source | Storage/state location | Downstream consumers | Design checklist mapping | Long-horizon checklist mapping | Status | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Shared product / slice name | `What are you building?`; `Product`; `App name`; `Product name` | `1.1`, `3.5`, `3.9`, `3.14` | `features/course/lesson/model/lessons/start-here.ts`; `features/course/lesson/content/build.ts` | Generic required field + broad `fieldValuesValidator` | `lessonStates.fieldValues` | Mostly local; copied into deploy packet context in `production-deploy-handoff-readme-prompt-card.tsx` | D1, D5 | L1 | Partial | Merge into one shared `product_name` and reuse everywhere. |
| Shared problem statement | `What problem does it solve?`; `What recurring pain...`; `Problem` | `1.1`, `1.3`, `1.4`, `1.5`, `3.5` | `features/course/lesson/model/lessons/start-here.ts`; `features/course/lesson/model/lessons/ceo.ts`; `features/course/lesson/content/build.ts` | Presence-only | `lessonStates.fieldValues` | Reused via `selected_problem_statement`; prompt builders and strategy card | D1, D4, D5 | L1 | Partial | Collapse to one canonical `problem_statement`; keep candidate capture separate from canonical selection. |
| Chosen user / persona | Derived `selected_problem_owner`; `Person`; `Audience / ICP` | `1.4`, `1.5`, `3.5` | `features/course/lesson/model/lessons/ceo.ts`; `features/course/lesson/workbench/modes/candidate-problem-handoff-content.tsx`; `features/course/lesson/content/build.ts` | Handoff-derived + presence-only | Derived into `lessonStates.fieldValues` | `research-prompt.ts`; `build-setup-launchpad-strategy-card.tsx`; `paper-photo-upload-context-values.ts` | D1, D4, D5 | L1 | Partial | Make the chosen user a first-class shared field and reuse it instead of retyping audience later. |
| Problem context | `When`; `Where / situation`; `Trigger` | `1.4` | `features/course/lesson/model/lessons/ceo.ts` | Presence-only | `lessonStates.fieldValues` | `research-prompt.ts`; `paper-photo-upload-context-values.ts`; strategy card | D1, D4 | L1 | Covered | Keep, but label it as canonical context instead of leaving it lesson-local. |
| Problem severity / urgency | `How painful is this?`; `Why is this painful enough to solve now?`; candidate severity/frequency | `1.3`, `1.4` | `features/course/lesson/model/lessons/ceo.ts` | Presence-only | `lessonStates.fieldValues` | Prompt context only | D1 | L1 | Partial | Keep severity and urgency, but drop duplicate candidate-vs-selected phrasing once the problem is chosen. |
| Outcome statement | `Outcome statement` | `1.5` | `features/course/lesson/model/lessons/ceo.ts` | Presence-only | `lessonStates.fieldValues` | Prompt builder; strategy card; paper-photo context; artifact preview | D1, D5 | L1 | Covered | Keep as the core shared promise field. |
| Outcome scaffold | `What it does`; `What they get out of it` | `1.5` | `features/course/lesson/model/lessons/ceo.ts` | Presence-only | `lessonStates.fieldValues` | `research-prompt.ts`; paper-photo context | D1, D5 | L1 | Partial | Keep, but rename to `success_looks_like` and `user_benefit`. |
| Foundational research evidence | `Competitors you already know`; pricing/messaging/product notes; takeaway | `1.6` | `features/course/lesson/model/lessons/ceo.ts`; `features/course/lesson/workbench/modes/competitor-research-light/*` | Presence-only | `lessonStates.fieldValues` | Almost entirely local; not reused by later live flows | D1, D5 | L1, L3 | Partial | Convert to a normalized `evidence_summary` plus reusable structured rows, or stop pretending it is shared. |
| Core flow summary | `Problem being solved`; `Who it’s for`; `How it changes them`; `Desired outcome` | `2.1` | `features/course/lesson/model/lessons/design.ts` | Presence-only | `lessonStates.fieldValues` | `build-setup-launchpad-strategy-card.tsx`; artifact preview | D1, D4 | L1 | Covered | Keep, but explicitly mark it as the design-to-build handoff core. |
| Screen list / flow sequence | `Your screen list (in order)` | `2.1` | `features/course/lesson/model/lessons/design.ts` | Presence-only | `lessonStates.fieldValues` | Stored, but only lightly reused | D4 | L1, L3 | Partial | Promote to canonical `screen_sequence` and carry into plan, brief, QA, and repo package outputs. |
| Must-have features | `Must-have features (for this flow)` | `2.1` | `features/course/lesson/model/lessons/design.ts` | Presence-only | `lessonStates.fieldValues` | Local / artifact preview | D4, D6 | L1, L3 | Partial | Keep, but separate essential user-visible capabilities from implementation chores. |
| Scope boundary / explicit non-goals | No live canonical field. Closest inputs: `build_ship_roadmap_scope`; `Slices`; `Selected slice` | `3.4`, `3.8`, `3.10` | `features/course/lesson/content/build.ts` | Presence-only | `lessonStates.fieldValues` | No canonical reuse | D4, D6 | L1, L3 | Missing | Add explicit `in_scope`, `out_of_scope`, `v1_rationale`, and `non_goals` early, before build starts. |
| Success criteria / done-when / demo flow | No live canonical field. Closest inputs: checklists and QA report | Build-wide | `features/course/lesson/content/build.ts`; `features/course/lesson/workbench/modes/checkout-qa-loop/*` | Checklist completion only | `lessonStates.fieldValues` or ephemeral UI | No formal plan/doc output | D6, D7 | L1, L3, L5 | Missing | Add shared `success_criteria`, `demo_flow`, and `validation_plan` fields. |
| Brand asset readiness | `Brand assets`; `I already have a Figma or Canva brand file`; `I need to create a brand guide first` | `2.1` | `features/course/lesson/model/lessons/design.ts`; `features/course/lesson/workbench/modes/core-flow-sketch/core-flow-sketch-brand-section.tsx` | Presence-only | `lessonStates.fieldValues` | Local only | D2, D3, D8 | L1 | Partial | Keep, but follow it immediately with actual reference and token capture instead of a note box only. |
| Visual references / moodboard | No active design-time capture. Late substitutes: `Brand references`; `Image upload (post to mimic)` | `3.11` | `features/course/lesson/content/build.ts`; `features/course/lesson/workbench/fields/reference-gallery-field-control.tsx` | Reference gallery requires min 1 item; otherwise generic | `lessonStates.fieldValues`; storage for uploads | Handoff is manual; not assembled into design spec | D2, D8 | L1 | Missing | Move reference collection into the active Design block and use the existing `reference_gallery` control there. |
| Visual direction / design thesis | No live canonical field. Closest inputs: `Brand guide notes`; `Brand strategy instructions`; `Brand design instructions`; dormant `visual_direction_*` legacy adapters | `2.1`, `3.1`, dormant legacy paths | `features/course/lesson/model/lessons/design.ts`; `features/course/lesson/content/build.ts`; `features/course/lesson/model/registry/legacy.ts`; `features/course/lesson/model/research-prompt.ts` | Presence-only or dormant | `lessonStates.fieldValues` | No active assembler | D1, D2, D3 | L1 | Missing | Add explicit fields for visual thesis, typography direction, color direction, layout feel, and interaction tone. |
| Design system tokens | Only late brand-kit fields: `Primary hex`, `Accent hex` | `3.9` | `features/course/lesson/content/build.ts`; `features/course/lesson/workbench/modes/brand-kit/*` | Plain text only | `lessonStates.fieldValues` | Preview only | D3 | L1 | Missing | Collect tokens in Design, not after build starts; validate hex values semantically. |
| Motion / interaction direction | No live input | None | No active lesson config | None | None | None | D7 | L1 | Missing | Add a compact `interaction_and_motion_notes` field in Design. |
| Marketing offer brief | `Product`; `Audience`; `Problem`; `Pain`; `Frequency`; `Why it matters`; `Outcome`; `Product capability` | `3.5` | `features/course/lesson/content/build.ts`; `features/course/lesson/workbench/modes/codex-marketing-site/*` | Presence-only | `lessonStates.fieldValues` | Used only manually; not assembled into prompt | D5 | L1 | Partial | Keep, but derive the prompt from these fields automatically and drop `savedPrompt` as a manual duplicate. |
| Marketing copy blocks | `Eyebrow`; `Subheader`; `Primary CTA`; `Secondary CTA`; `Promise line`; `Highlights`; `FAQ / comparison notes` | `3.5` | `features/course/lesson/content/build.ts`; `features/course/lesson/workbench/modes/codex-marketing-site/*` | Presence-only | `lessonStates.fieldValues` | Artifact preview only | D5 | L5 | Partial | Keep, but supplement with narrative structure, proof, hero image intent, and section jobs. |
| Style reference URL | `Style reference URL (optional)` | `3.5` | `features/course/lesson/content/build.ts`; `features/course/lesson/workbench/fields/basic-field-controls.tsx` | Client URL input only; server stores any string | `lessonStates.fieldValues` | Not used beyond manual copying | D2, D3 | L1 | Partial | Replace with active reference gallery plus optional URL metadata. |
| Distribution / install path / AI promise | `Release distribution`; `Local Codex bridge`; `Buyer-facing AI promise`; `After purchase, where do buyers install?` | `3.10` | `features/course/lesson/content/build.ts`; `features/course/lesson/workbench/modes/core-ux-plan-flow/*` | Presence-only | `lessonStates.fieldValues` | Compact summary only | D6 | L1, L3 | Partial | Keep; these are important shared build constraints. Carry them into the long-horizon doc stack and repo package. |
| Planning prompt controls | `Manual planning prompt`; `Reasoning depth`; stack flags; `Reference codebase path` | `3.7` | `features/course/lesson/content/build.ts`; `features/course/lesson/workbench/modes/fresh-template-plan/*` | Defaults and enum normalization only on client | `lessonStates.fieldValues` | Assembled into copyable prompt in `build-fresh-template-plan-prompt.ts` | D1 | L1, L3 | Partial | Keep; this is the best current prompt assembler. Extend it into generated plan docs. |
| Plan output | `Codex plan`; `Slices`; `Affected codebase areas`; `Risks`; `Dependencies`; `Slice packet` | `3.7`, `3.8`, `3.10` | `features/course/lesson/content/build.ts`; `features/course/lesson/workbench/modes/build-setting-up-slices/*`; `features/course/lesson/workbench/modes/core-ux-plan-flow/*` | Presence-only | `lessonStates.fieldValues` | Mostly stops at local summaries / saved work | D6 | L1, L3, L5 | Partial | Consolidate into one reusable plan artifact and generate the durable `prompt.md` / `plans.md` / `implement.md` / `documentation.md` stack from it. |
| Next slice selection | `Next slice to build` | `3.8` | `features/course/lesson/content/build.ts` | Presence-only | `lessonStates.fieldValues` | Not carried forward | D6 | L3 | Partial | Carry it into the next implementation handoff and QA plan. |
| Source content for UX build | `Blog link`; `Image upload (post to mimic)` | `3.11` | `features/course/lesson/content/build.ts`; `features/course/lesson/workbench/modes/core-ux-build/*` | URL input plus upload storage; no semantic source validation | `lessonStates.fieldValues`; storage | Manual only | D2, D5 | L1 | Partial | Keep; add source-purpose labels and make them part of the implementation packet. |
| Brand references | `Brand references` | `3.11` | `features/course/lesson/content/build.ts`; `features/course/lesson/workbench/fields/reference-gallery-field-control.tsx` | Min-item requirement, direct image URL validation | `lessonStates.fieldValues`; storage | Not packaged with brief | D2, D3 | L1 | Partial | Move earlier and include in generated design spec and implementation package. |
| Implementation brief | `Codex implementation brief (dictate or edit)` | `3.11` | `features/course/lesson/content/build.ts`; `features/course/lesson/workbench/modes/core-ux-build/core-ux-build-handoff-card.tsx` | Presence-only | `lessonStates.fieldValues` | Copy-only; not bundled with refs/source/context | D6 | L1, L3, L5 | Partial | Keep, but bundle it with brand refs, source inputs, core flow, and selected slice automatically. |
| QA inputs and findings | `Testing preflight checklist`; `QA test prompt`; `QA report`; `Current step`; `Last issue`; `Scenario` | `3.12` | `features/course/lesson/content/build.ts`; `features/course/lesson/workbench/modes/checkout-qa-loop/*` | Checklist + presence only | `lessonStates.fieldValues` | No downstream parameterization | D7 | L5 | Partial | Keep, but make scenario drive prompt assembly and feed found issues into the deploy/handoff stack. |
| Deploy context | `Product name`; `Domain`; deploy steps; success checks | `3.14` | `features/course/lesson/content/build.ts`; `features/course/lesson/workbench/modes/production-deploy-handoff/*` | Presence-only | `lessonStates.fieldValues` | Added to README prompt context | D5 | L4, L5 | Partial | Merge product/domain with earlier shared fields; keep steps as operational checklist. |
| Deploy secrets packet | `Cloudflare API token`; `Stripe live secret key`; `Clerk keys` | `3.14` | `features/course/lesson/workbench/modes/production-deploy-handoff/production-deploy-handoff-secrets-panel.tsx` | No persistence by design | Browser session only | Copy-only deploy packet | N/A | L4, L5 | Partial | Keep ephemeral, but add explicit secure handoff guidance and resumability expectations outside persisted lesson state. |
| Starter repo access | `GitHub username` | Mission, settings, build gates | `features/starter-repo/components/starter-repo-access-form.tsx`; `convex/course/starterRepoAccess.ts` | Strong client + server validation | `starterRepoAccess` table | Unlocks starter-template links in build lessons | N/A | L4 | Covered | Keep as a separate operational model. |
| Skill invocation habit | `Skill usage habit`; `Your first tagged prompt` | `3.16` | `features/course/lesson/content/build.ts`; `features/course/lesson/workbench/modes/skills-quickstart/*` | Checklist + presence only | `lessonStates.fieldValues` | No downstream reuse | N/A | L5 | Partial | Keep as onboarding, but do not confuse it with project-definition data. |
| Durable-memory doc stack | No active runtime generation. Templates only: `AGENTS.md`, `CHECKLIST.md`, `docs/prompt.md`, `docs/plans.md`, `docs/implement.md`, `docs/documentation.md` | Docs only | `docs/codex_long_horizon_templates/*` | None | Not wired | None | N/A | L2, L3, L5 | Partial | Use these templates as the generated long-horizon output package. |
| Hidden derived fields | `selected_problem_owner`; `selected_problem_statement`; `__objectiveChecklist`; `__fieldShapeVersion` | Cross-flow / system | `features/course/lesson/workbench/modes/candidate-problem-handoff-content.tsx`; `features/course/lesson/model/registry/shared.ts`; `features/course/lesson/model/registry/persistence.ts` | System-generated | `lessonStates.fieldValues` | Prompt builders, artifact compatibility, manual objective tracking | N/A | L5 | Covered | Keep, but formalize which ones are first-class derived outputs vs private plumbing. |

## Checklist Coverage Matrix

### Design Checklist Coverage

| Requirement group | Type | Coverage | Evidence | Gap | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Goal, context, constraints, preserve existing patterns | Direct input | Partial | CEO + `2.1` collect product/user/problem/outcome/core flow; `3.5` collects offer brief | No explicit constraints, non-goals, preserve-existing-UI rule, or done-when capture | Add shared `constraints`, `non_goals`, `done_when`, `existing_pattern_notes`. |
| Design brief before UI: typography, color, layout, visual thesis, content plan, interaction thesis | Direct input | Missing | Only `core_brand_path` and optional `core_brand_guide_notes` in `2.1`; late brand-kit fields in `3.9` | No structured visual thesis, content plan, layout direction, or motion thesis | Add a design-brief section to the active Design block. |
| Visual references / mood board / screenshots | Direct input | Missing | No active Design lesson collects them; only late `core_ux_brand_references` and `core_ux_post_mimic_image` in `3.11` | References arrive after build has started | Move reference capture into `2.1` or `2.2` using existing `reference_gallery`. |
| Design tokens and typography roles | Direct input | Missing | `3.9` only captures two hex strings | No background/surface/text/accent/typography roles | Add token fields and derive starter token file or spec from them. |
| First viewport / hero / composition guidance | Direct input | Missing | `3.5` captures copy only | No composition, hero, brand prominence, imagery intent, or CTA placement input | Add marketing-page composition and hero-intent inputs. |
| Narrative section structure | Direct input | Partial | `3.5` collects CTA/highlights/FAQ | No section jobs, proof strategy, or scan-by-headline structure | Add section-purpose and proof inputs to marketing flow. |
| Imagery and context visuals | Direct input | Partial | `3.11` reference gallery and mimic image exist | Too late and too product-UI-specific; no marketing hero/context image capture | Add explicit imagery inputs in Design and marketing flows. |
| Copy discipline and product language | Direct input | Partial | `1.5` outcome statement; `3.5` marketing brief/copy blocks; `3.11` strategy prompt | Voice/tone is indirect; no explicit copy constraints or reuse hierarchy | Promote tone/voice rules into shared foundation and derive copy prompts from them. |
| Product-UI operating clarity | Direct input | Partial | `3.10` and `3.11` capture distribution, install path, AI promise, core UX brief | No explicit page goals, states, operator tasks, or decision surfaces | Add product-UI-specific plan fields: primary workspace, states, actions, freshness, errors. |
| Motion and responsive behavior | Direct input | Missing | No live motion input; QA lesson only finds bugs later | No motion direction, transitions, or device-specific intent | Add compact motion/responsive notes in Design. |
| Visual verification across viewports | Process / derived | Partial | QA loop exists in `3.12` | It is downstream QA, not design-time intent or spec | Add required viewport and visual-check criteria to generated design spec and plan docs. |
| Figma / design-to-code round-trip | Direct input / process | Missing | Active curriculum does not collect Figma URLs or node ids; dormant visual-direction code exists but is not live | No Figma-backed handoff path in the live design flow | Either add Figma node/reference capture or explicitly scope the product away from Figma-based handoff. |

### Long-Horizon Checklist Coverage

| Requirement group | Type | Coverage | Evidence | Gap | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Explicit goal, context, constraints, non-goals, done-when | Direct input | Partial | CEO/build lessons collect problem, outcome, flow, risks, dependencies, distribution, AI promise | No single spec surface for non-goals, done-when, deliverables, demo flow, rollback expectations | Add canonical shared spec fields and generate `docs/prompt.md`. |
| Durable-memory docs stack | Derived/system | Partial | Templates exist in `docs/codex_long_horizon_templates/*` | Templates are not wired into lesson outputs or generated artifacts | Make the doc stack a generated output from structured state. |
| Milestone planning, acceptance criteria, validation commands, rollback | Direct input + derived | Partial | `3.7`, `3.8`, `3.10` capture prompts, slices, risks, dependencies | No acceptance criteria, no validation commands, no rollback, no milestone statuses | Extend plan capture and generate `docs/plans.md`. |
| Environment, setup, safety, access | Direct input + system | Partial | `3.0`, `3.4`, `3.14`, starter repo access | No sandbox/approval expectations, worktree strategy, forbidden-path rules, network policy | Keep most as system-generated guidance; add only product-specific setup constraints as inputs. |
| Execution discipline and verification loop | Derived/system | Partial | QA loop, deploy checklist, skill habits | No generated stop-and-fix rule, no diff review, no lint/typecheck/build commands in outputs | Generate `docs/implement.md` and `docs/documentation.md` from plan + repo defaults. |
| Thread/session hygiene and compaction | Process-only | Missing as product output | Not collected or generated | This should not be a student form; it should be system guidance | Put it in generated AGENTS/docs, not user-facing forms. |
| Parallelism and isolation | Process-only | Missing as product output | Not collected or generated | Same as above | Put it in generated AGENTS/docs, not student forms. |
| Skills / MCP / automation reuse | Process-only | Partial | `1.9` and `3.16` teach skills | Not represented in any durable output package | Keep instructional surface, but generate pointers in AGENTS / runbook as needed. |
| Final summary, handoff, demo/run instructions | Derived/system | Partial | Deploy handoff packet and a few copyable prompts exist | No unified final package combining starter repo, docs stack, prompts, and next-step instructions | Add a final repo-package assembler. |

## Gap Analysis

### A. Missing data collection

Highest-value missing inputs:
- Explicit scope boundary:
  - in-scope
  - out-of-scope
  - non-goals
  - why this v1 is enough
- Explicit success criteria:
  - what “done” means
  - user-visible acceptance criteria
  - demo flow
  - validation commands
- Design direction:
  - visual thesis
  - typography direction
  - color/tone direction
  - layout/composition direction
  - motion / interaction direction
- Design references:
  - real screenshots
  - moodboard / references
  - primary visual anchor intent
- Product-UI structure:
  - primary workspace
  - states
  - key actions
  - operator decision points
- Final repo package requirements:
  - what files should be generated
  - what the starter template must be customized with
  - what the build prompt must include

### B. Weak or poorly placed questions

- Design-defining inputs are collected too late:
  - `3.9` brand kit
  - `3.11` brand references and mimic image
  - these belong before or during Design, not after build has started
- Planning questions are split across three lessons:
  - `3.7` prompt controls
  - `3.8` slice packet
  - `3.10` plan brief
  - this creates fragmentation instead of one durable plan object
- Marketing copy collection in `3.5` is strong on text but weak on structure and visual direction.

### C. Duplication

Main duplicates:
- Product name:
  - `1.1 app_idea`
  - `3.5 product`
  - `3.9 brand_kit_app_name`
  - `3.14 deploy_handoff_product_name`
- Domain:
  - `3.4 build_ship_roadmap_preferred_domain`
  - `3.9 brand_kit_domain`
  - `3.14 deploy_handoff_domain`
- Marketing brief:
  - `3.4 build_ship_roadmap_marketing_brief`
  - `3.5` full marketing-site brief
- Planning:
  - `3.7 codexOutput`
  - `3.8 packet`
  - `3.10 planSlices` + `planAffectedAreas` + `planRisks` + `planDependencies`
- Implementation handoff:
  - `3.10` plan brief
  - `3.11` Codex brief

### D. Unclear ownership between Design and Build

Current boundary problems:
- The active Design block does not actually own reference capture, visual direction, or design tokens.
- The Build block is absorbing design work:
  - brand kit
  - design references
  - mimic image
  - marketing visual cues
- This makes the design spec impossible to assemble cleanly by the end of Design.

### E. Inputs collected but underused

Underused or effectively terminal inputs:
- `1.1` welcome brief fields
- most `1.6` research fields
- `3.4` marketing brief, preferred domain, support email, logging plan, first testers
- `3.7` codex plan output
- `3.8` selected slice
- `3.10` approved plan brief
- `3.11` brand refs + source inputs as a package
- `3.12` scenario, live status fields

### F. Downstream generation is underpowered

Current downstream state:
- A few good prompt builders exist.
- A few good packet builders exist.
- There is no final assembler for:
  - design spec
  - long-horizon plan doc stack
  - repo package
- `docs/codex_long_horizon_templates/*` gives the repo a target output shape, but the product does not generate that shape.

## Recommended Target Input Architecture

### Shared foundation

Ask once, reuse everywhere:
- `product_name`
- `product_slice_summary`
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
- `core_flow_summary`
- `screen_sequence`
- `must_have_capabilities`
- `in_scope`
- `out_of_scope`
- `non_goals`
- `v1_rationale`
- `success_criteria`
- `demo_flow`
- `risks`
- `dependencies`
- `distribution_model`
- `install_destination`
- `buyer_ai_promise`
- `starter_repo_access.github_username`

### Design

Design-specific inputs:
- `brand_asset_status`
- `design_reference_gallery`
- `hero_or_primary_visual_intent`
- `visual_thesis`
- `typography_direction`
- `color_direction`
- `layout_direction`
- `interaction_motion_notes`
- `marketing_page_structure`
- `proof_strategy`
- `product_ui_structure`
- `state_requirements`
- `figma_reference` if relevant

### Build / long-horizon

Build-specific inputs:
- `planning_prompt_body`
- `planning_reasoning_depth`
- `planning_reference_path`
- `stack_flags`
- `milestones`
- `acceptance_criteria`
- `validation_commands`
- `rollback_plan`
- `selected_next_slice`
- `implementation_brief`
- `qa_scenario`
- `qa_report`
- `deploy_domain`
- `support_email`
- `observability_plan`

### Derived / system-generated

Do not ask directly; derive or generate:
- `selected_problem_owner`
- `selected_problem_statement`
- `__objectiveChecklist`
- `__fieldShapeVersion`
- `design_spec.md`
- `docs/prompt.md`
- `docs/plans.md`
- `docs/implement.md`
- `docs/documentation.md`
- generated AGENTS addendum for task-specific constraints
- assembled build prompts
- final repo package manifest / README handoff

## Recommended Merge / Rename / Split / Remove

### Merge

- Merge all product-name variants into `product_name`.
- Merge all domain variants into `domain`.
- Merge plan outputs into one canonical `implementation_plan`.
- Merge brand strategy + brand design + brand refs into one `design_direction` package.

### Rename

- `messaging_what_it_does` -> `success_looks_like`
- `messaging_benefit` -> `user_benefit`
- `core_named_screens` -> `screen_sequence`
- `build_slices_packet` -> `implementation_plan_packet`
- `build_slices_selected_slice` -> `next_slice`

### Split

- Split `build_ship_roadmap_marketing_brief` into:
  - offer / promise
  - proof / evidence
  - CTA / conversion intent
- Split `core_ux_codex_brief` into:
  - implementation goal
  - screen map
  - brand constraints
  - open risks / unknowns

### Remove

- Remove `savedPrompt` as a manual duplicate once prompt assembly is automatic.
- Remove duplicated product/domain capture from later build lessons after shared foundation exists.

### Add

- Add explicit scope boundary fields.
- Add explicit success-criteria and validation-plan fields.
- Add active design-reference and visual-direction fields in Design.
- Add milestone / acceptance / rollback fields for long-horizon output.

## Suggested Structure Change

This is the smallest structural refactor that materially improves clarity.

Before:

```text
features/course/lesson/model/
features/course/lesson/workbench/
features/course/lesson/content/build.ts
docs/codex_long_horizon_templates/
```

After:

```text
features/course/input-handoff/
  model/
    canonical-inputs.ts
    checklist-mappings.ts
  lib/
    build-shared-foundation.ts
    build-design-spec.ts
    build-long-horizon-doc-stack.ts
    build-repo-package-plan.ts
features/course/lesson/model/
features/course/lesson/workbench/
docs/codex_long_horizon_templates/
```

Why this shape:
- It avoids a repo-wide redesign.
- It keeps lesson configs where they are.
- It introduces one feature-scoped place for canonicalization and generation logic.

## Phased Implementation Plan

### Phase 1. Canonical foundation model

Goal:
- Introduce a shared canonical input model without changing route structure.

Changes:
- Add canonical shared-foundation schema and mapping layer.
- Map current CEO + Design fields into that schema.
- Keep raw lesson fields for backwards compatibility.

Minimum changes:
- Storage/model:
  - add canonical builder functions, not a new table yet
- UI:
  - no UI changes required in the first pass
- Prompt/generation:
  - none yet

Risk:
- Low. Mostly additive.

Validation:
- Unit tests for field mapping and legacy compatibility.

### Phase 2. Fill the design-spec gaps in the active Design flow

Goal:
- Make the Design block sufficient to produce a real design spec before Build.

Changes:
- Add reference gallery to `2.1` or `2.2`.
- Add visual-direction fields.
- Add design-token and motion notes.
- Keep using existing generic field controls.

Minimum changes:
- UI/form:
  - extend `features/course/lesson/model/lessons/design.ts`
- Storage:
  - no new table; still `lessonStates.fieldValues`
- Validation:
  - semantic validation for URLs and at least minimal structure on token fields

Risk:
- Medium. This changes student workflow order.

Validation:
- Unit test field shape compatibility.
- Manual smoke test: existing lesson states still load.

### Phase 3. Normalize build planning into one reusable plan object

Goal:
- Stop scattering long-horizon planning across `3.7`, `3.8`, and `3.10`.

Changes:
- Keep the lessons, but map them into one canonical `implementation_plan`.
- Add missing:
  - acceptance criteria
  - validation commands
  - rollback plan
  - done-when

Minimum changes:
- UI/form:
  - add a few focused fields to `3.7` / `3.10`
- Generation:
  - compact assembler that merges current planning inputs

Risk:
- Medium. Needs careful migration of the existing captured plan text.

Validation:
- Unit tests on plan assembly.
- Regression tests on lesson completion compatibility.

### Phase 4. Generate the durable long-horizon docs stack

Goal:
- Turn structured planning state into the exact file stack in `docs/codex_long_horizon_templates`.

Changes:
- Generate:
  - task spec
  - milestone plan
  - implement/runbook
  - documentation/status log
  - task-level AGENTS addendum if needed
- Make the long-horizon templates an active output, not just a folder of examples.

Minimum changes:
- Generation pipeline:
  - render markdown from canonical input model + implementation plan
- UI:
  - expose preview / copy / download of generated docs

Risk:
- Low to medium. Mostly additive, but wording quality matters.

Validation:
- Snapshot tests for markdown renderers.
- Manual spot-check against both checklist docs.

### Phase 5. Assemble the final repo package handoff

Goal:
- Produce one package that combines:
  - starter template access state
  - canonical design spec
  - long-horizon doc stack
  - assembled build prompt(s)
  - next-slice / QA / deploy notes

Changes:
- Add one final package view/export.
- Pull in current deploy prompt and secure handoff boundaries.

Minimum changes:
- Consumer pipeline:
  - one package builder under `features/course/input-handoff/lib/`
- UI:
  - one output surface

Risk:
- Medium. This is the first truly cross-flow assembler.

Validation:
- End-to-end smoke path from completed lesson state to generated package.

## Risks, Assumptions, And Open Questions

- Dormant code path risk:
  - `promptImport`, `stage_unlock`, `visual_direction`, and `external_workspace` plumbing exists but is not active in current lesson configs.
  - Decide whether to revive or remove it before layering more behavior on top.
- Security boundary risk:
  - deploy secrets are intentionally ephemeral in `production-deploy-handoff-secrets-panel.tsx`.
  - If resumable operator handoff is required, this needs a separate secure design.
- Canonical-source question:
  - should `1.1` welcome brief remain part of the shared foundation, or should the real foundation start at `1.4` + `1.5` + `2.1`?
- Figma scope question:
  - if Figma round-trip is a real product promise, the live curriculum needs a Figma reference input.
  - if not, mark that part of the design checklist as systematically not applicable.
- Repo package question:
  - there is no current assembler that creates the user-requested “starter template + doc pack + build prompt” bundle.
  - that needs an explicit product decision, not just more fields.

## Top 10 Highest-Leverage Changes

1. Add one canonical shared-foundation model and stop treating reusable inputs as loose string ids.
2. Add explicit scope boundary fields: `in_scope`, `out_of_scope`, `non_goals`, `v1_rationale`.
3. Move visual-reference capture into the active Design block using the existing `reference_gallery` control.
4. Add explicit design-direction fields: visual thesis, typography, color, layout, motion.
5. Generate a real design spec from CEO + Design inputs instead of relying on artifact preview.
6. Turn `docs/codex_long_horizon_templates/*` into a generated long-horizon output package.
7. Consolidate `3.7`, `3.8`, and `3.10` into one reusable implementation-plan object with acceptance criteria and validation commands.
8. Auto-assemble build prompts from saved structured inputs and remove manual duplicate prompt fields where possible.
9. Merge duplicated product/domain/marketing/brief fields across build lessons and reuse shared values instead of re-entry.
10. Add structured capture to currently empty but important build lessons: provider setup, debug/stabilize, and production instance.

## Direct Answers

1. What do we ask for today, exactly?
   We ask for a mix of CEO foundation, one core-flow sketch, scattered build-planning notes, marketing copy inputs, brand-kit inputs, UX handoff inputs, QA notes, deploy context, and starter-repo GitHub username. The canonical matrix above lists the active normalized groups and their raw labels.

2. Where in the repo is each input defined and used?
   Definitions live mainly in `features/course/lesson/model/lessons/start-here.ts`, `features/course/lesson/model/lessons/ceo.ts`, `features/course/lesson/model/lessons/design.ts`, and `features/course/lesson/content/build.ts`. Rendering is driven by `features/course/lesson/workbench/renderer.tsx` and mode-specific workbench files. Persistence runs through `features/course/lesson/hooks/use-lesson-state.ts`, `convex/course/lessonState.ts`, and `convex/schema.ts`. Consumers are concentrated in `features/course/lesson/model/research-prompt.ts`, build workbench cards, artifact preview builders, and deploy prompt cards.

3. Which inputs are shared across outputs, and which are flow-specific?
   Truly shared today: selected user/problem, problem context, outcome statement, some outcome scaffold fields, and the `2.1` core-flow sketch. Most build inputs are flow-specific and do not get reused meaningfully beyond the lesson that captures them.

4. What do the two checklist docs require?
   `docs/design-checklist.md` requires a much fuller design brief than the live product currently captures: references, design-system direction, composition, imagery, copy discipline, motion, responsive verification, and optional Figma round-trip. `docs/long-horizon-checklist.md` requires explicit task/spec data, milestone planning, validation strategy, durable memory docs, and disciplined handoff. The normalized checklist matrix above separates direct-user-input requirements from derived/system requirements.

5. What is fully covered, partially covered, missing, or not applicable?
   Fully covered: starter-repo GitHub username, core problem context, outcome statement, basic planning-prompt controls. Partially covered: marketing brief, core flow, distribution/install/AI promise, implementation brief, QA notes, deploy context, brand inputs. Missing: scope boundary, success criteria, validation/demo plan, design references in the active Design block, visual direction, motion, token system, final doc-stack generation, and final repo-package assembly. Not applicable as student-form inputs: session hygiene, sandbox policy, compaction, worktrees, and similar process-only rules.

6. What is redundant, weakly named, poorly placed, or underused?
   Redundant: product name, domain, marketing brief, plan outputs, and implementation brief are recollected across multiple lessons. Poorly placed: design-defining inputs land in BUILD instead of DESIGN. Underused: `1.1` welcome brief, `1.6` research notes, `3.4` launch notes, `3.7` Codex output, `3.8` selected slice, `3.10` plan brief, much of `3.11` brand/source context. Weakly modeled: most lesson fields are just loose string ids in a generic `fieldValues` blob.

7. What is the cleanest target model that gives us complete and useful coverage?
   One shared foundation model plus thin design- and build-specific layers. The shared model should own product name, user, problem, outcome, core flow, scope boundary, success criteria, risks, dependencies, distribution, install path, and AI promise. Design should own references, visual direction, tokens, motion, and page/UI structure. Build should own plan assembly, validation commands, milestones, rollback, implementation brief, QA, and deploy context. The long-horizon doc stack should be derived, not manually asked field-by-field.

8. What is the best implementation sequence to get there with minimal churn?
   First add canonicalization, then fill the missing active Design inputs, then consolidate the fragmented build-planning lessons into one reusable plan object, then generate the long-horizon doc stack from `docs/codex_long_horizon_templates`, and only then add the final repo-package assembler. That sequence minimizes migration risk because it keeps the lesson engine and existing storage model intact while improving reuse step by step.

## Final Judgment

What the product asks for today:
- enough to orient the builder,
- enough to choose a problem, write an outcome, and sketch one core flow,
- enough to collect scattered build notes and prompts,
- not enough to generate a strong design spec,
- only partially enough to generate a strong long-horizon implementation plan,
- not enough to generate a complete repo package.

The cleanest path is additive and minimal-diff:
- keep the lesson engine,
- keep Convex `lessonStates`,
- keep the generic field controls,
- add a canonical handoff layer,
- fill the missing design inputs,
- generate the long-horizon docs stack,
- assemble the final package from saved state.
