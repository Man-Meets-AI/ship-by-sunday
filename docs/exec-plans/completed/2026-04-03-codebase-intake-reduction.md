---
summary: Reduce the current codebase intake into a smaller codebase intake backed by compiler-derived defaults and a first-pass field optimizer. Keep review/download and starter repo generation working while existing projectDefinition records transition safely.
read_when: Open this when implementing the codebase intake reduction, derived-facts layer, and first sparkle-button field optimizer without breaking the current codebase flow and review download path.
plan_status: done
---
# Reduce codebase intake to a codebase core

This is a living execution plan for turning the current codebase-first intake into a smaller codebase-first intake while preserving the current review, download, and starter repo generation path until the new model is fully proven.

Maintain this ExecPlan in accordance with `.plans/PLANS.md` so a fresh coding agent can resume the work from this file alone.

## Purpose / Big Picture

Today the founder-facing intake asks for too many fields because the stored schema mirrors every downstream document heading the compiler could ever want. After this change, a founder should be able to answer a compact codebase form with roughly ten required fields plus a few optional ones, click Review, and still receive a strong generated repo snapshot with design, marketing, build, and prompt materials. The product, not the founder, should own the narrative boilerplate: smart defaults, derived sections, and field-specific optimization should fill the gap so the user gets a better codebase with less effort. The visible proof is simple: the founder fills the reduced form, optional fields can remain blank, the Review page still becomes ready, the download still contains the expected docs tree, and the generated README, design docs, marketing docs, build docs, and starter overrides reflect derived codebase content rather than a sprawling manual intake.

## Progress

- [x] 2026-04-03 13:10 EDT — Inspected the current codebase schema, stage definitions, save path, review readiness logic, codebase renderers, repo snapshot builder, and existing Codex generation route.
- [x] 2026-04-03 13:25 EDT — Drafted the initial ExecPlan, then tightened it with the approved reduced codebase contract, the single `problem_trigger` decision, and the rule that marketing/content-planning sections become compiler-owned defaults rather than founder-authored intake.
- [x] 2026-04-03 13:40 EDT — Updated the optimizer plan so a disconnected founder connects their ChatGPT/Codex subscription inside a small modal or sheet that wraps the existing managed login endpoints instead of being sent to Settings.
- [x] 2026-04-03 14:05 EDT — Folded in the final grill decisions: CLI stays aligned with the reduced codebase contract, `core_flow` is a numbered list, `theme_hex` is prefilled and non-blocking, `pricing` is one numeric USD amount, `contact_email` is canonical and web-prefilled when possible, `scope_in` and `scope_out` auto-regenerate until manually edited, and the first optimizer is web-only and overwrites `problem_statement` immediately.
- [x] 2026-04-03 15:26 EDT — Reduced the shared compiler and stage contract, added derived codebase facts, shrank the founder-facing web and CLI field model, and kept review/download generation working through compatibility derivation.
- [x] 2026-04-03 15:29 EDT — Landed the first web-only `problem_statement` sparkle optimizer, including the inline Codex connect sheet, login polling, and route/template coverage.
- [x] 2026-04-03 15:33 EDT — Updated the shared presentation layer plus web and CLI tests to the reduced codebase model, including non-blocking `theme_hex`, canonical `contact_email`, and generated `scope_in`/`scope_out` behavior.
- [x] 2026-04-03 15:38 EDT — Completed validation: package tests, CLI end-to-end dry-run checks, full `apps/web` unit/integration suites, static checks, and production build all passed.

## Surprises & Discoveries

The current `surface_type` field is already optional in practice. `packages/codebase-compiler/src/canonical-project-definition/schema.ts` defaults it to `web_app`, `packages/codebase-compiler/src/stages/stage-definitions.ts` does not require it in the design flow, and `packages/codebase-compiler/src/codebase-field-helpers.ts` already formats a missing value as `web_app`. The UI can remove it without inventing new fallback behavior.

The Convex-side validator for `projectDefinition.facts` is intentionally loose. `apps/web/convex/codebase/validators.ts` accepts a record of `string | number | string[]` rather than a shape-specific validator, so the real contract lives in the codebase compiler Zod schema and the save path parser. That makes model evolution easier, but it also means the implementation must be disciplined about versioned parsing and not rely on Convex validation alone.

The current renderers and starter override files consume flat codebase facts directly. `packages/codebase-compiler/src/codebases/*.ts` and `packages/codebase-compiler/src/repo-generation/render-template-overrides.ts` read values like `facts.outcome_statement`, `facts.primary_cta`, and `facts.price_display` directly, so the plan must insert a derived-facts layer before changing the stored intake or the generated repo output will break.

The existing Codex generation route is reusable, but it currently exposes only three template IDs. `apps/web/app/api/codex/generate/route.ts` already enforces managed ChatGPT account connection and records runs. The optimizer work should extend this existing path with a new codebase-specific template or equivalent server-side prompt registry rather than inventing a second generation endpoint.

## Decision Log

- Decision: Keep the implementation scoped to intake/model/rendering and the first optimizer path, and do not attempt a broad codebase-to-codebase file and symbol rename in this initiative.
  Rationale: Another agent is already expected to work on terminology updates. Mixing structural schema changes with broad naming rewrites would make validation and rollback harder. The implementation may use codebase wording in user-facing copy where needed, but the internal `codebase` module paths should remain stable unless a specific change is required for correctness.
  Date/Author: 2026-04-03 / Codex

- Decision: Persist a compact codebase intake and derive the richer generator facts on demand instead of storing every downstream narrative field in Convex.
  Rationale: The user experience goal is minimum irreducible facts. A derived-facts layer keeps the founder form short while preserving the detailed materials required by the generated docs and starter overrides.
  Date/Author: 2026-04-03 / Codex

- Decision: Treat the web app and the local CLI as part of the same reduced codebase contract, but keep the first optimizer web-only.
  Rationale: The CLI directly imports the compiler schema, stage definitions, review readiness, and generation flow, so it cannot remain on the old larger model without drift. The Codex login and optimizer surfaces already exist in the web app, and reproducing that account flow in the CLI would widen scope without improving the first shipped codebase experience.
  Date/Author: 2026-04-03 / Codex

- Decision: Preserve the existing multi-stage codebase route shell for the first implementation, but drastically reduce which pages collect manual input and allow generated preview-only stages where appropriate.
  Rationale: `apps/web/features/codebase-flow/lib/codebase-stage-routes.ts`, the route segments under `apps/web/app/(workspace)`, and multiple tests assume the current codebase route structure. Keeping the route shell stable de-risks the migration while still delivering the smaller codebase intake.
  Date/Author: 2026-04-03 / Codex

- Decision: Start the sparkle-button optimization pattern with `problem_statement` only, using an extensible registry of field-specific prompt builders.
  Rationale: The user explicitly called out `problem_statement` as the first valuable optimizer. Shipping one field end to end proves the architecture, reuses the existing Codex connection flow, and avoids blocking the codebase reduction on a larger prompt system.
  Date/Author: 2026-04-03 / Codex

- Decision: In v1, the first optimizer overwrites `problem_statement` immediately and leaves normal manual editing available afterward.
  Rationale: The user explicitly wants the first sparkle action to write the improved text straight into the field rather than creating a separate suggestion workflow. That keeps the first slice simple and avoids introducing parallel saved-state or accept-reject mechanics.
  Date/Author: 2026-04-03 / Codex

- Decision: When the founder clicks the optimizer while disconnected, open a small modal or sheet that wraps the existing managed ChatGPT/Codex login start and poll endpoints rather than redirecting them to Settings.
  Rationale: The user wants the connect step to stay local to the sparkle action. Reusing the existing endpoints keeps auth logic centralized while avoiding a jarring context switch away from the field they were trying to improve.
  Date/Author: 2026-04-03 / Codex

- Decision: Treat `problem_trigger` as the single user-authored context field for when, where, and why the pain shows up, and remove separate `problem_context_when` and `problem_context_where` inputs from the founder-facing flow.
  Rationale: The user explicitly prefers one stronger “moment of pain” field over multiple overlapping context prompts. This keeps the form smaller while preserving enough context for derivation and optimization when the helper text explains that the answer should include situation, location, and attempted action.
  Date/Author: 2026-04-03 / Codex

- Decision: Treat `theme_hex` as the only first-pass design field shown to the founder, with a product-provided default and a link out to the shadcn presets page in a new tab.
  Rationale: The user wants a simple design affordance that still anchors design derivation, but does not want it to become form friction. The field should be visible and editable, yet prefilled with one product-owned default so it never blocks progress when untouched. The exact fallback color must live in one constant so the later terminology or theming work can update it without hunting across the form.
  Date/Author: 2026-04-03 / Codex

- Decision: Treat `pricing` as one founder-facing one-time USD amount in the first pass, then derive `price_usd_cents`, `price_display`, and `currency` for existing renderers.
  Rationale: The current generator and starter overrides still need numeric cents, display text, and currency, but the user explicitly wants pricing intake simplified and does not need optimizer support here. Limiting the first pass to one-time USD pricing avoids scope creep into subscriptions or multi-currency logic.
  Date/Author: 2026-04-03 / Codex

- Decision: Keep `scope_in` and `scope_out` optional, and derive a first-pass version from `core_flow` when the founder leaves them blank.
  Rationale: The reduced intake should stay lightweight, but the generated build materials still need scope boundaries. Deriving defaults from `core_flow` preserves output quality while letting the founder tighten scope explicitly when they care.
  Date/Author: 2026-04-03 / Codex

- Decision: Replace `support_email` with canonical `contact_email` in founder-facing intake, prefill it from the signed-in web account when available, keep it editable, and leave it blank and optional in the CLI.
  Rationale: The user called out a generic email field rather than support-specific wording and explicitly wants it derived from login when possible. Using `contact_email` as the source-of-truth key keeps the reduced codebase contract honest while preserving a compatibility mapping back to any downstream `support_email` outputs. The CLI has no equivalent signed-in identity, so it should not fake an autofill.
  Date/Author: 2026-04-03 / Codex

- Decision: `core_flow` is a numbered list and is the structural backbone for downstream derivation.
  Rationale: The user wants the flow to read as ordered steps rather than a paragraph blob. A numbered list keeps the field simple enough for web and CLI inputs while providing a stable structure for deriving scope defaults and later render-time artifacts.
  Date/Author: 2026-04-03 / Codex

- Decision: `scope_in` and `scope_out` should auto-generate from `core_flow` until the founder manually edits either field, then the compiler must stop overwriting that field automatically.
  Rationale: The user wants generated scope defaults to feel magical, but not destructive. This ownership rule lets the system keep helping while the founder has not taken over the field and avoids clobbering intentional edits later.
  Date/Author: 2026-04-03 / Codex

- Decision: Keep the current marketing route in the codebase shell, but make it a generated preview stage with zero manual inputs and zero readiness blockers in the first pass.
  Rationale: This preserves route stability and existing navigation assumptions while removing the worst founder-facing marketing intake burden immediately. It also creates a clear home for reviewing compiler-owned defaults later without forcing manual data entry.
  Date/Author: 2026-04-03 / Codex

- Decision: Do not keep `content_plan` as manual marketing intake. Marketing-language sections should come from compiler-owned defaults and derivation, not from a founder-authored content-planning worksheet.
  Rationale: The user explicitly rejected content planning as a founder-facing requirement. The whole point of the codebase flow is to front-load value and let the compiler produce the heavier marketing structure.
  Date/Author: 2026-04-03 / Codex

## Outcomes & Retrospective

The reduced codebase contract is now live across the compiler, web flow, shared presentation layer, and CLI. Founders answer a much smaller set of fields, `theme_hex` is prefilled and non-blocking, `contact_email` is canonical, the marketing stage is generated preview only, and the first `problem_statement` optimizer runs through the existing Codex account flow with an inline connect sheet. Review/download and CLI generation still work because the compiler now derives the richer legacy/output fields on demand instead of asking the founder to author them manually.

The biggest lesson from implementation was that the shared stage contract mattered more than the field renderers themselves. Once `packages/codebase-compiler/src/stages/stage-definitions.ts`, readiness, and the shared presentation helpers reflected the reduced model, the rest of the web and CLI fallout became mostly deterministic test updates. The remaining follow-up is optional cleanup, not blocked delivery: if the team wants to fully remove the legacy compatibility fields from internal types later, that can now be done as a separate simplification pass rather than a risky product migration.

## Context and Orientation

The current founder intake lives in the codebase flow. The core data object is `projectDefinition.facts`, which is saved in Convex by `apps/web/convex/codebase/projectDefinition.ts`. The actual structural contract for that object is defined in `packages/codebase-compiler/src/canonical-project-definition/schema.ts`, not in Convex. The current schema is a flat object with many required string and list fields plus `price_usd_cents`, optional `domain`, and optional `support_email`.

The user-facing stage and step structure lives in `packages/codebase-compiler/src/stages/stage-definitions.ts`. Those steps drive routing and readiness. `apps/web/features/codebase-flow/lib/codebase-stage-routes.ts` turns stage definitions into routes and pager links. `apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts` uses `buildStepDraftValues` and `buildSavePayload` from `packages/codebase-compiler/src/codebase-field-helpers.ts` to format current values, coerce drafts, and send mutations to Convex. The field metadata used by the UI also lives in `codebase-field-helpers.ts`, including labels, helper text, input kinds, list splitting, and the special handling for `problem_severity`, `problem_urgency`, `surface_type`, and `price_usd_cents`.

Review readiness is calculated in `packages/codebase-compiler/src/readiness/evaluate-codebase-readiness.ts` and surfaced through `deriveStageStatus`. Review and download use the current parsed facts as if they are complete and canonical. `apps/web/features/codebase-flow/server/downloads.ts` converts the saved draft into a fully validated project definition. `packages/codebase-compiler/src/server/rendered-codebase-tree.ts` then renders `docs/README.md`, `docs/facts/project-definition.json`, the design, marketing, and build markdown codebases, and the prompt pack. `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts` combines those rendered files with starter overrides and repo files before `packages/codebase-compiler/src/bundle/build-review-download-zip.ts` wraps everything into the downloadable archive.

For this initiative, a “codebase intake” means the small founder-authored field set persisted in the flat `projectDefinition.facts` object. A “derived fact” means any additional field the compiler computes from those persisted intake facts plus product defaults at readiness, review, render, or generation time. A “legacy codebase record” means an older flat fact object that still contains the bloated codebase-era keys. Even though this project is effectively greenfield from a product perspective, the implementation should still prefer compatibility-safe reads and avoid making existing drafts or fixtures explode without a clear reason.

The approved reduced intake contract is this. Required core fields are `product_name`, `product_summary`, `primary_user`, `problem_statement`, `problem_trigger`, `problem_severity`, `success_looks_like`, `core_flow`, and `pricing`. `core_flow` is a numbered list, not a paragraph. The only first-pass design field shown to the founder is `theme_hex`, but it should be prefilled with a product-owned default and must not block progress if untouched. Optional founder-authored fields are `design_references`, `scope_in`, `scope_out`, `domain`, and `contact_email`. `pricing` means one numeric one-time USD amount in the first pass, not subscriptions or multi-currency. `scope_in` and `scope_out` should be auto-derived from `core_flow` when blank and remain auto-regenerated until the founder edits them manually. `design_references` should be stored as editable links only. `problem_trigger` is the single user-authored context field and should use helper text that tells the founder to describe the moment, place, and attempted action that make the pain real. On web, `contact_email` should prefill from the signed-in Clerk account when available and remain editable. In the CLI, `contact_email` remains blank and optional. The implementation may keep internal compatibility aliases while migrating, but this is the target user-facing contract.

Several current fields are explicitly no longer user intake. `surface_type` becomes a compiler-owned default of `web_app`. `problem_context_when`, `problem_context_where`, and the old redundant trigger/context split collapse into `problem_trigger`. `problem_urgency` disappears. `outcome_statement` is replaced by `success_looks_like` as the user-facing outcome field. Marketing, design, and build narrative fields such as `primary_cta`, `proof_strategy`, `section_narrative`, `copy_tone`, `content_plan`, and the old validation/build-plan narrative keys should become derived defaults rather than manual input.

The optimizer work should build on the existing Codex account connection and app-server generation path. `apps/web/features/codex/server/app-server.ts` manages the per-user Codex app-server process. `apps/web/app/api/codex/generate/route.ts` already authenticates the user, verifies the managed ChatGPT connection, runs generation, and records the result. `apps/web/app/api/codex/account/login/start/route.ts` and `apps/web/app/api/codex/account/login/poll/route.ts` already support the managed login loop. The sparkle-button path should extend this surface with codebase field templates rather than creating a parallel AI endpoint, and the disconnected state should be handled inside a local modal or sheet that wraps these existing login endpoints. The first optimizer is web-only in this slice; the CLI should stay in sync with the reduced codebase schema and generation behavior, but it does not need Codex auth or optimizer commands yet.

## Plan of Work

Begin by freezing a reduced codebase intake schema and a versioned compatibility story. The first implementation should not try to persist both a small intake and a giant derived object in Convex. Instead, keep the stored data minimal and introduce a deterministic `deriveCodebaseFacts(...)` step in the compiler that produces the richer fields required by the existing design, marketing, build, starter override, and CLI output surfaces. Put the migration logic close to the schema layer so every read path can normalize older codebase facts into the new codebase intake before the rest of the app reasons about readiness or rendering.

Once the intake contract is stable, update the stage definitions and field helpers so the web UI and the local CLI collect only the new required and optional fields. Preserve the current route shell and codebase modules in this pass, but reduce the number of editable fields per stage. Product should gather the core codebase fields. Design should surface `theme_hex` with one default already present, a clear link to the shadcn presets page, and optional `design_references`. Build Plan should gather pricing and the optional setup fields such as `domain`, `contact_email`, `scope_in`, and `scope_out`. `scope_in` and `scope_out` should materialize as generated editable defaults once `core_flow` exists and keep regenerating until the founder manually edits them. Marketing should stop being a heavy manual intake stage and become a generated preview stage with no editable fields and no readiness blockers in the first pass. The review gating logic must therefore depend on codebase intake completeness plus successful derivation, not on manual marketing answers.

After the intake is smaller, add the first optimizer path for `problem_statement`. The web UI should expose a sparkle affordance on that field only. The button should call an extendable codebase-field optimizer surface built on top of the existing Codex route. If the user is disconnected, open a small modal or sheet that starts and polls the existing managed ChatGPT/Codex login flow, then returns them to the same field so they can retry immediately. The prompt should use the other accepted codebase intake fields as context, return only improved field text, and immediately replace the current `problem_statement` value in the editable field. The plan must preserve the current connected-account checks and error behavior from the existing Codex generation route. The CLI does not need optimizer support in this milestone.

Finally, switch the renderers, starter overrides, and CLI generation flow to consume derived codebase facts rather than the old raw flat codebase facts. This includes the codebase README, the design codebase, the marketing codebase, the build codebase, the starter overrides for `apps/web/config/product.ts` and `apps/web/features/marketing/content/home.ts`, and the `generate`, `review`, `validate`, `stage`, and `fields` commands in `packages/ship-by-sunday-cli`. Once the derived-facts layer is in place, update tests and review download validation so a reduced codebase still yields the same categories of generated output, and older drafts or fixtures continue to load safely where practical.

## Milestones

### Milestone 1 — Freeze the reduced codebase contract and legacy compatibility rules

At the end of this milestone, there is a precise schema for the founder-authored codebase intake, a deterministic list of compiler-derived facts, and a documented mapping from legacy codebase facts to the new intake contract. The touched systems are the codebase compiler schema and parsing layer under `packages/codebase-compiler/src/canonical-project-definition`, the stage/readiness layer under `packages/codebase-compiler/src/readiness`, and the Convex save/load surface under `apps/web/convex/codebase`. Run the codebase compiler tests from the codebase root and add or update tests that prove legacy records can still parse or normalize. Success looks like a newcomer being able to point to a single reduced intake contract and a single derivation path for everything that used to be manual codebase intake.

### Milestone 2 — Rebuild the founder-facing intake around the reduced codebase fields

At the end of this milestone, the founder-facing web forms and the local CLI stage prompts collect only the reduced codebase inputs and no longer show deprecated fields such as `surface_type`, `problem_urgency`, `screen_sequence`, or the old marketing/build narrative sprawl. The touched systems are `packages/codebase-compiler/src/stages/stage-definitions.ts`, `packages/codebase-compiler/src/codebase-field-helpers.ts`, the codebase flow field components under `apps/web/features/codebase-flow/components`, the optimistic save hook `apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts`, and the CLI field and prompt surfaces under `packages/ship-by-sunday-cli/src/field-contract.ts`, `packages/ship-by-sunday-cli/src/prompts`, and `packages/ship-by-sunday-cli/src/commands`. This milestone must also prove that the marketing route now renders a generated preview rather than a manual form, that `theme_hex` appears prefilled and non-blocking, and that `scope_in` and `scope_out` remain optional generated defaults. Run the relevant unit and integration UI tests for codebase stage routing and field save behavior plus the CLI prompt and field-contract tests. Success looks like the founder progressing through much smaller forms, with `theme_hex` visible as the design anchor, the marketing page no longer asking for manual boilerplate, the CLI exposing the same reduced field set, and the deprecated fields no longer present in either surface.

### Milestone 3 — Add the first sparkle-button optimizer for `problem_statement`

At the end of this milestone, the `problem_statement` field shows an optimization affordance that uses the existing Codex connection path, runs a field-specific prompt, and immediately replaces the current field value with the refined statement while leaving normal editing available. If the founder is disconnected, the same interaction opens a small modal or sheet that wraps the existing managed login start and poll endpoints, then returns them to the field without a Settings detour. The touched systems are the Codex generation route under `apps/web/app/api/codex/generate/route.ts`, the account login routes under `apps/web/app/api/codex/account/login`, any new codebase field template registry or prompt builder module under `apps/web/features/codebase-flow` or `apps/web/features/codex`, and the field component or step card that renders `problem_statement`. Run targeted unit or integration tests for the new template registration, login-sheet behavior, and UI behavior, plus any existing Codex route tests that need to cover the new template ID. Success looks like the sparkle action surfacing the inline connect sheet when disconnected and writing deterministic improved text back into the field when the mocked Codex route succeeds.

### Milestone 4 — Rewire generated outputs to derived codebase facts and prove review/download still works

At the end of this milestone, the review page becomes ready from the reduced codebase intake, the generated docs tree still renders, the starter overrides are populated from derived codebase facts, the local CLI still reports accurate readiness and generation behavior, and the zip download still contains the expected files. The touched systems are the renderers under `packages/codebase-compiler/src/codebases`, repo generation under `packages/codebase-compiler/src/repo-generation`, the CLI commands under `packages/ship-by-sunday-cli/src/commands`, review/download tests under `packages/codebase-compiler/tests`, CLI tests under `packages/ship-by-sunday-cli/tests`, and codebase review tests under `apps/web/tests/integration-ui` and `apps/web/tests/integration`. Run the codebase compiler test suite, the CLI test suite, the relevant web unit and integration suites, and a local smoke flow through Review & Download if the environment is available. Success looks like older drafts or fixtures loading without crashes where practical, new reduced codebases rendering strong outputs, the CLI exposing the same reduced readiness contract, and the downloadable starter snapshot still containing the same major doc categories.

## Concrete Steps

Work from the repository root unless the step says otherwise.

1. Inspect and freeze the old-to-new mapping before touching code. Read `packages/codebase-compiler/src/canonical-project-definition/schema.ts`, `packages/codebase-compiler/src/stages/stage-definitions.ts`, `packages/codebase-compiler/src/codebase-field-helpers.ts`, `apps/web/convex/codebase/projectDefinition.ts`, and `packages/codebase-compiler/src/codebases/*.ts`. Write down which old fields remain founder-authored, which become derived, which disappear, and which need compatibility aliases. The expected observation is that every current render-time dependency has an explicit source in either the new intake or the derived-facts function.

2. Add a reduced codebase intake schema and a derivation module in the codebase compiler. Prefer a new feature-local folder under `packages/codebase-compiler/src/` rather than scattering files across unrelated directories. The derivation module should accept the reduced intake and return the richer render-time fields, including `surface_type`, outcome aliases, starter CTA content, marketing defaults, and price display details. The expected observation is that the renderers can consume derived facts without needing the old founder-authored codebase sprawl.

3. Add a legacy normalization path. Existing `projectDefinition` documents must still load. The safest approach is to normalize legacy codebase facts on read and on save, then bump the canonical schema version only when the normalization story is in place. If the implementation chooses a version bump, update every parser, fixture, and test that assumes `schemaVersion: 1`. The expected observation is that a fixture or test using a legacy codebase record still reaches review and render without a crash.

4. Rebuild stage metadata and field helpers around the reduced codebase intake across both web and CLI. Remove `surface_type` from the editable surfaces. Replace separate when/where problem context inputs with a single `problem_trigger` prompt and helper text. Treat `core_flow` as a numbered list. Move `theme_hex` into the design stage with a friendly default already present and a link to the shadcn presets page. Keep `design_references` link-only and editable. Treat `scope_in` and `scope_out` as optional generated editors whose empty state is meaningful because derivation can fill them later and whose auto-generation stops after manual edit. The expected observation is that `buildStepDraftValues`, `buildSavePayload`, labels, CLI field descriptors, and readiness all speak the new field set.

5. Change marketing from manual intake to generated preview without reintroducing manual fields. Keep the existing route shell, but render a non-blocking generated-preview stage that explains the compiler-owned marketing defaults derived from the codebase. Do not delete the route shell until all stage-nav and review tests are updated, because `apps/web/features/codebase-flow/lib/codebase-stage-routes.ts` and multiple UI tests assume the current stage family exists. The expected observation is that founders no longer have to manually author marketing boilerplate, but navigation and review gating still behave predictably.

6. Extend the existing Codex generation surface with a codebase field optimizer template for `problem_statement`. Reuse the current managed-ChatGPT connection requirement and app-server-backed generation path. Build a small modal or sheet for the disconnected state that wraps `apps/web/app/api/codex/account/login/start/route.ts` and `apps/web/app/api/codex/account/login/poll/route.ts` so the founder can connect in place and then retry the optimizer immediately. The request payload should identify the target field and include the relevant accepted codebase context. The response should be plain text suitable for dropping back into the form. The expected observation is that the user can click a sparkle affordance on `problem_statement`, either connect inline if needed or see a loading state if already connected, and then have the optimized text written directly into the field with normal editing still available afterward. Do not add a CLI-side optimizer command in this milestone.

7. Rewire renderers, starter overrides, and CLI output commands to consume derived codebase facts. Update `packages/codebase-compiler/src/server/rendered-codebase-tree.ts`, the codebase renderers, `packages/codebase-compiler/src/repo-generation/render-template-overrides.ts`, and the CLI review and generation commands so they no longer assume every current field was manually authored. The expected observation is that the generated docs still include design, marketing, build, and prompt materials, the CLI still reports accurate review readiness and generation results, and much of their language now comes from derivation and defaults.

8. Update tests in layers. Start with the codebase compiler tests under `packages/codebase-compiler/tests`, then update the CLI tests under `packages/ship-by-sunday-cli/tests`, then the web unit and integration UI tests under `apps/web/tests/unit`, `apps/web/tests/integration`, and `apps/web/tests/integration-ui`. Add targeted coverage for the optimizer route, the reduced form, the defaulted `theme_hex` and `contact_email` behavior, and the `scope_in` / `scope_out` regeneration rules. The expected observation is that each layer passes before the next broader validation step runs.

Recommended command sequence during implementation:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd packages/codebase-compiler test

Expected observation: the codebase compiler suite passes after schema, derivation, and renderer changes.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd packages/ship-by-sunday-cli test

Expected observation: CLI command, prompt, draft-store, and generation tests pass against the reduced codebase contract.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd apps/web test:unit

Expected observation: codebase-flow unit tests, Codex route helper tests, and any new field optimizer unit tests pass.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd apps/web test:integration

Expected observation: review/download integration coverage and codebase review UI coverage pass with the reduced codebase flow.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd packages/codebase-compiler typecheck && bun run --cwd packages/ship-by-sunday-cli typecheck && bun run --cwd apps/web typecheck

Expected observation: the compiler, CLI, and app type-check cleanly after the schema and route updates.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd apps/web build

Expected observation: Next.js builds successfully with the new codebase path and no unresolved codebase-flow assumptions.

## Validation and Acceptance

The change is acceptable only when a founder can complete the reduced codebase intake with the approved required fields, see `theme_hex` already prefilled, skip optional fields such as `design_references`, `scope_in`, `scope_out`, `domain`, and `contact_email`, and still reach Review & Download without seeing missing-field blockers for deleted codebase fields. The Review page must still present the generated design, marketing, build, and prompt materials as one starter snapshot.

An older `projectDefinition` record or fixture should continue to load where practical. The founder must be able to revisit the flow, save a step, and keep moving without a schema crash or silent data loss. The implementation should prove this in automated tests by constructing or loading an older fact shape and asserting that readiness, rendering, and download still work, but the rollout does not need a heavy pre-ship backfill plan if the project remains effectively greenfield.

The optimizer acceptance path is narrower. The `problem_statement` field must show a sparkle control, call the existing Codex-connected generation surface, and replace the current field value only for that field. If the user has not connected a managed ChatGPT account, the UI must open the inline connection modal or sheet and complete the existing managed login flow without forcing a Settings redirect. Pricing must not depend on the optimizer. The CLI does not expose optimizer support in this slice.

The generator acceptance path must still produce these observable outputs from the reduced codebase: `docs/README.md`, `docs/facts/project-definition.json`, at least one design codebase file, at least one marketing codebase file, at least one build codebase file, the shipped prompt files under `docs/prompts/`, and the starter overrides under `apps/web/config/product.ts` and `apps/web/features/marketing/content/home.ts`. The zip archive test, the CLI `generate` flow, and at least one UI review test must continue to prove that generation works.

Before marking the work complete, run the narrowest relevant checks first, then broaden:

- `bun run --cwd packages/codebase-compiler test`
- `bun run --cwd packages/codebase-compiler typecheck`
- `bun run --cwd packages/ship-by-sunday-cli test`
- `bun run --cwd packages/ship-by-sunday-cli typecheck`
- `bun run --cwd apps/web test:unit`
- `bun run --cwd apps/web test:integration`
- `bun run --cwd apps/web typecheck`
- `bun run --cwd apps/web build`

If local auth or Codex app-server state blocks an end-to-end UI smoke test, record the exact blocker in this plan and do not claim that the sparkle flow was manually verified.

## Idempotence and Recovery

Make the migration additive first. Do not begin by deleting all legacy codebase fields and hoping the reduced intake will hold. Introduce the reduced intake schema, the derivation function, and the legacy normalization layer together so any partial implementation can still parse existing records. If the derived-facts layer is not ready, do not remove old renderer dependencies yet.

Treat the optimizer path as isolated. It should fail closed for disconnected accounts and should not block ordinary field editing or saving. If the new optimizer template or route integration breaks, remove the sparkle affordance from the field while keeping the reduced codebase intake intact.

Do not run a destructive Convex backfill as the first migration step. Prefer migrate-on-read or migrate-on-save behavior backed by tests. If a later explicit backfill is desired, document it separately after the compatibility layer has proven stable.

Keep the route shell stable until the reduced intake is validated. If reducing the form surfaces introduces broken navigation, revert the stage metadata changes while keeping the schema and derivation work. This preserves review/download while the UI is repaired.

If a partial implementation leaves the generated outputs inconsistent, restore the renderer inputs to the last known good derived-facts adapter instead of reintroducing founder intake fields. The rollback target is “reduced intake plus compatibility adapter,” not “old sprawl form comes back by accident.”

## Artifacts and Notes

The target reduced intake for the founder-facing UI is:

    Required: product_name, product_summary, primary_user, problem_statement, problem_trigger, problem_severity, success_looks_like, core_flow, pricing
    Defaulted but editable: theme_hex
    Optional: design_references, scope_in, scope_out, domain, contact_email
    Notes: pricing is one numeric one-time USD amount in the first pass; core_flow is a numbered list; scope_in and scope_out derive from core_flow when blank and keep regenerating until manually edited; design_references are editable links only; web prefills contact_email from the signed-in account when available

The deprecated manual fields that must not appear in the founder-facing form after this work include `surface_type`, `problem_urgency`, `screen_sequence`, `must_have_capabilities`, `existing_system_mode`, the old marketing boilerplate cluster, and the old build-plan narrative cluster.

The first optimizer target is `problem_statement`. The initial prompt should use the accepted values of `product_name`, `product_summary`, `primary_user`, `problem_trigger`, `problem_severity`, and `success_looks_like` as context and return only improved field text. The first shipped behavior is web-only and writes the result directly back into the editable field.

The current codebase README and starter overrides prove why derived facts are required. Today they read fields such as `outcome_statement`, `primary_cta`, `proof_strategy`, `price_display`, and `currency` directly. The derivation layer must continue to provide equivalents so the generated repo remains coherent even though the founder no longer authors those values by hand.

Validation evidence from the completed implementation:

    bun run --cwd packages/codebase-compiler test
    bun run --cwd packages/codebase-compiler typecheck
    bun run --cwd packages/codebase-compiler lint
    bun run --cwd packages/codebase-compiler format:check
    bun run --cwd packages/codebase-presentation test
    bun run --cwd packages/codebase-presentation typecheck
    bun run --cwd packages/codebase-presentation lint
    bun run --cwd packages/codebase-presentation format:check
    bun run --cwd packages/ship-by-sunday-cli test
    bun run --cwd packages/ship-by-sunday-cli typecheck
    bun run --cwd packages/ship-by-sunday-cli lint
    bun run --cwd packages/ship-by-sunday-cli format:check
    bun run --cwd apps/web test:unit
    bun run --cwd apps/web test:integration
    bun run --cwd apps/web lint
    bun run --cwd apps/web format:check
    bun run --cwd apps/web build
    bun run sbs:check

## Interfaces and Dependencies

The implementation should introduce a clear interface boundary between founder-authored codebase intake and compiler-derived facts. A novice implementer should be able to point to one schema module for stored intake, one normalization module for legacy codebase facts, and one derivation module for render-time facts. Keep these modules feature-local inside `packages/codebase-compiler/src/` instead of scattering codebase logic across unrelated folders.

`apps/web/convex/codebase/projectDefinition.ts` must continue to provide a safe read and save contract for the founder-facing flow. If the saved shape changes, `apps/web/convex/codebase/validators.ts` and any public validators must remain consistent with the actual wire shape returned to the client.

`packages/codebase-compiler/src/stages/stage-definitions.ts` and `packages/codebase-compiler/src/codebase-field-helpers.ts` remain the authoritative contract for which fields appear in the founder-facing flow, what labels and helper text they show, and how drafts become saved values. The reduced codebase field set must be implemented here, not hidden behind ad hoc UI checks.

`packages/ship-by-sunday-cli/` is in scope for this work. Its `field-contract`, prompt sessions, draft store, review command, generate command, and validation command must stay aligned with the reduced codebase contract. Do not leave the CLI on the old large field set after the compiler and web app move.

`apps/web/app/api/codex/generate/route.ts` should remain the single server entry point for managed-ChatGPT-backed field optimization unless a stronger repository-local reason emerges during implementation. Add a codebase-specific template ID or equivalent registry entry here, and keep the existing connection checks, run recording, and error handling intact. The disconnected optimizer UI should wrap the existing login routes under `apps/web/app/api/codex/account/login` inside a local modal or sheet instead of creating a second connection protocol.

The codebase renderer modules under `packages/codebase-compiler/src/codebases` and the starter override generator under `packages/codebase-compiler/src/repo-generation/render-template-overrides.ts` must read from a derived-facts interface rather than directly from sparse founder intake. That is the dependency contract that keeps the reduced codebase UX from weakening the generated repo output.
