---
summary: "ExecPlan for making blueprint stage saves truthful across all stages so blank, partial, and complete saves produce the right user-facing result. It adds inline feedback, field-level errors, and navigation behavior that matches what actually happened on save."
read_when: "Open this when blueprint stage save behavior needs to distinguish blank, partial, cleared, and complete submissions correctly."
plan_status: "done"
---

# Make Blueprint Step Saves Truthful Across All Stages

This document is a living execution plan for making every blueprint stage tell the truth when a user tries to save a blank, partial, or complete step. It is written so a fresh coding agent can execute the work without prior chat context and must be updated as progress, discoveries, validation results, and scope decisions accumulate.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this change, a user who clicks `Save step` in `/product`, `/design`, `/marketing`, or `/build-plan` will immediately understand what happened. A blank step will no longer look like it worked; the UI will explain that nothing has been entered yet and will keep the user on the same step. A partially filled step will save as a draft, but the UI will explain what is still missing before that step counts as complete. A complete step will save and advance as it does today. A human can see this working by opening any blueprint stage, trying to save an empty step, trying again with only some required answers, and then completing the step and watching the messaging and navigation change accordingly.

## Progress

- [x] 2026-03-26 15:44 EDT — Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, `docs/prompts/execplan-writer.md`, `todo.md`, the existing blueprint progression ExecPlan, the blueprint compiler stage model, the blueprint-stage UI, the Convex blueprint handlers, and the current integration-ui tests to freeze this planning slice.
- [x] 2026-03-26 15:44 EDT — Confirmed the root cause from the live code: `apps/web/features/blueprint-flow/lib/blueprint-field-helpers.ts` can produce an empty save payload, while `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx` still calls the save mutation and advances to the next step when the mutation resolves.
- [x] 2026-03-26 15:44 EDT — Locked the intended product behavior for this plan: blank save attempts are blocked with inline guidance, partial save attempts persist as drafts but stay on the same step, and complete save attempts persist and auto-advance.
- [x] 2026-03-26 16:10 EDT — Grilled the plan against the real component and form primitives. Resolved the high-impact behavior branches: intentional clears are allowed but warning-level, missing required fields receive field-level error treatment, invalid fields clear one-by-one as they are fixed, failed save attempts move focus to the first missing required field, server or network save failures show a separate destructive inline error while preserving the draft, unresolved feedback persists per step, and successful-save confirmations do not persist across step switches.
- [x] 2026-03-26 16:07 EDT — Added `apps/web/features/blueprint-flow/lib/blueprint-step-save-feedback.ts` plus `apps/web/tests/unit/blueprint-step-save-feedback.test.ts`, proving the shared blank, partial, complete, and cleared-to-incomplete classification rules with stable required-field ordering.
- [x] 2026-03-26 16:18 EDT — Extended the helper layer with `buildBlueprintStepSaveInlineFeedback()` and the shared field-id utility so blueprint-flow now has one feature-local source for save classification, inline copy, and focus targeting.
- [x] 2026-03-26 16:18 EDT — Rewired the shared blueprint-stage shell through `apps/web/features/blueprint-flow/hooks/use-blueprint-stage-step-state.ts`, added inline save feedback plus field-level invalid state, and updated the shared `BlueprintStageField` / `BlueprintStageStepCard` surface so the behavior now applies across `Product`, `Design`, `Marketing`, and `Build Plan`.
- [x] 2026-03-26 16:19 EDT — Added focused regression coverage in `apps/web/tests/integration-ui/blueprint-stage-page.test.tsx` for blank, partial, complete, cleared-to-incomplete, and failed-save behavior, plus `apps/web/tests/integration-ui/blueprint-stage-sidebar.test.tsx` for human-readable missing-field labels.
- [x] 2026-03-26 16:20 EDT — Passed narrow validation: `oxlint`, `oxfmt --check`, `tests/unit/blueprint-step-save-feedback.test.ts`, and the blueprint-stage integration-ui coverage all ran green.
- [ ] 2026-03-26 16:21 EDT — `bun run build` is still blocked by an unrelated docs frontmatter parse error in `apps/web/content/docs/video-pipeline.mdx`; record the blocker here and in `todo.md`, but do not fold that unrelated docs repair into this blueprint-flow slice.

## Surprises & Discoveries

This is one shared shell bug, not four separate stage bugs. The route files under `apps/web/app/(workspace)/product/page.tsx`, `apps/web/app/(workspace)/design/page.tsx`, `apps/web/app/(workspace)/marketing/page.tsx`, and `apps/web/app/(workspace)/build-plan/page.tsx` all render the same `BlueprintStagePage` component. Fixing the save behavior in that one feature-local shell will automatically cover all blueprint stages unless a route bypasses the shared component, which the current code does not do.

The save path is currently optimistic in a misleading way. `apps/web/features/blueprint-flow/lib/blueprint-field-helpers.ts` trims each field, drops empty values, and returns `clearedFieldKeys` plus `factsPatch`. When every field in the current step is blank, `factsPatch` can be empty and `clearedFieldKeys` can simply clear existing values. `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx` does not distinguish that case from a meaningful save; it awaits the mutation and then advances if there is another step. That is why the UI can appear to accept an empty step without telling the user what happened.

The stage shell already has the data needed to fix this without changing the blueprint compiler contract. `packages/blueprint-compiler/src/stages/stage-definitions.ts` defines `fieldKeys` and optional `requiredFieldKeys` per step. `packages/blueprint-compiler/src/readiness/derive-stage-status.ts` already defines stage completion from missing required facts. The missing layer is a feature-local classification of the current save attempt, not a deeper readiness rewrite.

The current sidebar weakens clarity further because it prints raw fact keys such as `scope_in` and `problem_summary` directly from `stageStatus.missingFactKeys`. That means the user can hit a silent save, then look right and see internal `snake_case` names instead of helpful field labels. The fix should therefore improve both the button outcome and the missing-field presentation that surrounds it.

The repository already has the right accessibility and visual primitives for field-level invalid state. `apps/web/components/ui/input.tsx` and `apps/web/components/ui/textarea.tsx` both respond to `aria-invalid`, and `apps/web/components/ui/field.tsx` already provides `Field`, `FieldError`, and descriptive invalid styling that other form surfaces use. That means this slice does not need a custom validation look; it only needs to adopt the same primitives inside blueprint flow.

The current plan needed one more behavioral distinction that the original draft had not frozen: a step that was never filled and a step that was intentionally cleared after a prior save cannot be treated as the same user action. The payload layer already supports clearing through `clearedFieldKeys`, so the UI must allow that path while making the checkpoint status honest again.

The pure helper implementation locked one subtle boundary that will matter in the UI layer: the warning-level `cleared_to_incomplete` branch only fires when the step was previously complete and the new save clears enough saved data to make a required field missing. If a still-incomplete step loses optional saved text, the helper returns `partial` instead so the UI does not falsely tell the user the checkpoint became incomplete “again.”

The broader app validation revealed an unrelated repository issue outside blueprint flow. `bun run build` fails in the docs app layer before it can finish the Next build because `apps/web/content/docs/video-pipeline.mdx` contains frontmatter that Nextra/YAML cannot parse. The exact parser complaint is `Nested mappings are not allowed in compact mappings` at the `description:` line. That file was already dirty before this slice, so the blueprint-stage work should document the blocker rather than silently widening scope into a docs repair.

Evidence from repo inspection:

    apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx
      const payload = buildSavePayload(currentStep, currentDraftValues);
      await saveProjectDefinitionFacts({ stageId, ...payload });
      if (activeStepIndex < stage.steps.length - 1) setActiveStepIndex((index) => index + 1);

    apps/web/features/blueprint-flow/lib/blueprint-field-helpers.ts
      if (!rawValue) {
        clearedFieldKeys.push(fieldKey);
        continue;
      }

    apps/web/features/blueprint-flow/components/blueprint-stage-sidebar.tsx
      {stageStatus.missingFactKeys.map((fieldKey) => (
        <li key={fieldKey}>{fieldKey}</li>
      ))}

## Decision Log

Decision: Treat a fully blank save attempt as a blocked action, not as a successful save.
Rationale: The user’s complaint is not that validation is too strict. It is that the UI currently implies success while providing no guidance. Blocking the blank attempt at the shared stage shell is the smallest truthful fix because no canonical facts changed and no useful draft was created.
Date/Author: 2026-03-26 / Codex

Decision: Treat a partially complete step as a saved draft that stays on the same step instead of auto-advancing.
Rationale: The blueprint stages already support flexible in-stage browsing from the earlier progression work, so draft persistence is valuable. However, auto-advancing on partial saves makes the run feel complete when the required checkpoint is not. Keeping the user on the same step preserves momentum without lying about completion.
Date/Author: 2026-03-26 / Codex

Decision: Make inline step-level feedback the primary message surface, with any toast kept optional and secondary.
Rationale: The user is focused on the form they just submitted. Inline feedback near the step title and fields is more durable, more accessible, and easier to understand than a transient toast alone. This slice should not depend on a toast for correctness.
Date/Author: 2026-03-26 / Codex

Decision: Keep this slice in the blueprint-flow feature layer and avoid blueprint compiler or Convex schema changes unless implementation proves they are absolutely necessary.
Rationale: The current bug is about save-attempt classification and copy clarity, not about canonical fact readiness. The existing blueprint compiler definitions and Convex mutation interface already expose enough information to classify blank, partial, and complete attempts on the client.
Date/Author: 2026-03-26 / Codex

Decision: Replace raw missing fact keys with human-readable labels wherever this slice touches stage feedback.
Rationale: `scope_in` and similar field IDs are implementation details. The user needs labels such as `Scope In` and `V1 Rationale`, especially when the whole point of this slice is clarity.
Date/Author: 2026-03-26 / Codex

Decision: Distinguish an untouched blank step from an intentionally cleared previously saved step.
Rationale: The existing payload model already supports clearing through `clearedFieldKeys`. Blocking that case would make it impossible to deliberately reset a step. The UI should therefore allow the clear, keep the user on the same step, and show a warning-style message that the step is now incomplete again.
Date/Author: 2026-03-26 / Codex

Decision: Pair the summary message with field-level invalid styling and per-field helper text for missing required fields.
Rationale: A summary alone explains that something is wrong, but it still makes the user hunt through the form. The repo already supports `aria-invalid` and `FieldError`, so field-level guidance is a low-risk extension of existing patterns.
Date/Author: 2026-03-26 / Codex

Decision: Clear invalid state field-by-field as soon as each field becomes non-empty again.
Rationale: This gives immediate progress feedback and prevents the form from feeling punitive. Waiting for another submit would add unnecessary friction and would not match the repo’s broader form behavior.
Date/Author: 2026-03-26 / Codex

Decision: After a blank or partial save attempt, move focus to the first missing required field and scroll it into view if needed.
Rationale: The user explicitly wants the UI to do something obvious when the step is incomplete. Moving focus to the first missing requirement is the most actionable next-step cue and improves keyboard accessibility.
Date/Author: 2026-03-26 / Codex

Decision: Handle mutation failures separately from validation failures.
Rationale: A server or network failure is not the user’s mistake. The UI should show a destructive inline save error near the step actions, preserve the draft text, keep the user on the same step, and leave the validation state unchanged until the next retry.
Date/Author: 2026-03-26 / Codex

Decision: Persist unresolved feedback per step, but do not persist success confirmations across step switches.
Rationale: Each step already has its own local draft, so unresolved blockers and warnings should remain attached to that step until fixed. Old success messages become noise when the user returns later, so only unresolved states should be sticky.
Date/Author: 2026-03-26 / Codex

Decision: Only classify a save attempt as `cleared_to_incomplete` when the step was complete before the save.
Rationale: The warning copy for that branch says the checkpoint is incomplete again. That is truthful only when the required fields were previously satisfied. For already-incomplete steps, further clears should stay in the `partial` branch so the UI can keep using the draft-saved guidance instead of implying a regression that did not happen.
Date/Author: 2026-03-26 / Codex

## Outcomes & Retrospective

The blueprint-stage shell now tells the truth across all blueprint stages. Blank saves are blocked before the mutation. Partial saves persist drafts but stay on the same step with inline guidance. Required-field errors are rendered at the field level, clear as the user fixes each field, and move focus to the first missing requirement after a failed save attempt. Clearing previously complete required data now persists the clear but warns that the checkpoint became incomplete again. Save failures render a separate destructive inline error while keeping the user’s draft intact. The sidebar now formats missing facts with the same human-readable label helper instead of leaking raw `snake_case` identifiers.

This slice stayed inside the intended blueprint-flow boundary. It did not change Convex schemas, the blueprint compiler readiness contract, or route-specific shells. The only remaining gap is broader build proof: `bun run build` is currently blocked by the unrelated docs frontmatter parse error in `apps/web/content/docs/video-pipeline.mdx`. That blocker should be fixed in a separate docs-focused slice or by the owner of that in-flight docs work.

## Context and Orientation

The relevant product surface lives entirely inside the `apps/web/features/blueprint-flow/` feature. The route entries in `apps/web/app/(workspace)/product/page.tsx`, `apps/web/app/(workspace)/design/page.tsx`, `apps/web/app/(workspace)/marketing/page.tsx`, and `apps/web/app/(workspace)/build-plan/page.tsx` are thin wrappers around `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx`. That component owns local step selection, draft state, the save mutation call, and the wiring to the progress panel, the step card, and the sidebar.

The current save path has four distinct pieces. `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx` owns `handleSave`. `apps/web/features/blueprint-flow/lib/blueprint-field-helpers.ts` builds the trimmed payload for the current step. `apps/web/convex/blueprint/projectDefinition.ts` persists the provided facts patch and cleared keys, but it does not reject an empty or low-value save attempt. `packages/blueprint-compiler/src/stages/stage-definitions.ts` defines which fields exist in each step and which ones are actually required for completion. Together, those files explain why the app currently advances too eagerly: the client never decides whether the save attempt was meaningful before calling the mutation.

The current visible UI has three relevant feedback surfaces. `apps/web/features/blueprint-flow/components/blueprint-stage-step-card.tsx` renders the current step title, fields, and `Save step` button, but no save-result messaging. `apps/web/features/blueprint-flow/components/blueprint-stage-sidebar.tsx` shows the stage status and all missing fact keys, but it uses raw implementation names. `apps/web/features/blueprint-flow/components/progression/blueprint-stage-progress-panel.tsx` already distinguishes `Current objective`, `Required facts saved`, and `required fields left` at the step-map level. This plan should build on that progress vocabulary rather than invent a second contradictory language system. It should also reuse the existing `Field` and `FieldError` primitives from `apps/web/components/ui/field.tsx` so blueprint flow stays visually consistent with other validated forms in the app.

The plain-language terms in this plan must remain stable. A “blank save attempt” means every field in the current step is empty after trimming whitespace and there was no previously saved value being intentionally removed. A “partial save attempt” means at least one field has useful content and the mutation should persist it, but one or more required fields for that step are still empty after the attempted save. A “complete save attempt” means all required fields for that step have non-empty values after trimming, so the save should count as a completed checkpoint and may auto-advance. An “intentional clear” means the user removed previously saved content from one or more fields and clicked `Save step`, causing the step to become incomplete again; that branch is allowed, but it stays on the same step and shows a warning-level message rather than a positive success confirmation. An “inline feedback block” means a persistent message rendered inside the current step card, not only a temporary toast.

The likely file shape for implementation should stay feature-local and minimal. The current feature already has the main shell files. The before and after structure should remain close to this:

    Before
    apps/web/features/blueprint-flow/components/
      blueprint-stage-page.tsx
      blueprint-stage-step-card.tsx
      blueprint-stage-sidebar.tsx
    apps/web/features/blueprint-flow/lib/
      blueprint-field-helpers.ts
      blueprint-stage-progress.ts

    After
    apps/web/features/blueprint-flow/components/
      blueprint-stage-page.tsx
      blueprint-stage-step-card.tsx
      blueprint-stage-sidebar.tsx
      blueprint-stage-save-feedback.tsx
    apps/web/features/blueprint-flow/lib/
      blueprint-field-helpers.ts
      blueprint-stage-progress.ts
      blueprint-step-save-feedback.ts

If implementation proves that `blueprint-stage-step-card.tsx` can absorb the feedback markup cleanly without approaching the repository’s component-length limits, the extra feedback component is optional. The helper in `lib/` is not optional because the classification logic should stay out of the rendering component.

## Plan of Work

Start by isolating the save-attempt rules into a pure helper in `apps/web/features/blueprint-flow/lib/`. That helper should accept the current `BlueprintStepDefinition`, the current draft values, the existing saved values for the same step, and the just-built save payload, then return a small discriminated result that says whether the attempt is `blank`, `partial`, `complete`, or `cleared_to_incomplete`. It should also return human-readable metadata for the UI, including the ordered list of missing required fields after the attempted save. This helper is where the plain-English rules should live so the page component does not grow into a branch-heavy tangle.

Once the classification helper exists, wire it into `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx`. `handleSave` should stop treating every payload the same. A blank attempt should set per-step unresolved feedback, mark the missing required fields invalid, focus the first missing required field, and return early without calling the mutation or advancing. A partial attempt should call the mutation, update the per-step feedback state to a draft-saved-but-incomplete message, keep the same step selected, and focus the first still-missing required field. A clear-to-incomplete attempt should call the mutation, keep the user on the same step, and show a warning-level message that the step is incomplete again. A complete attempt should call the mutation, clear any unresolved feedback for that step, set a non-sticky success message, and auto-advance only if there is another step. If the mutation throws, the page should show a separate destructive inline save error, preserve the current draft text, and leave validation state untouched. The page should keep unresolved feedback keyed by step id so a user can leave a step and return to the same unresolved message later, while successful-save confirmations should not survive step switches. As the user edits one of the invalid fields, that field’s invalid state should clear as soon as it becomes non-empty again.

After the page has truthful feedback state, add a small render surface for it in `apps/web/features/blueprint-flow/components/blueprint-stage-step-card.tsx`. The feedback block should sit above the button row so it is directly connected to the save action. It should explain what happened and what the user should do next. Example language is enough to guide implementation: a blank scope step might say `Scope is still blank. Add at least one answer before saving this step.` A partial build execution step might say `Draft saved. Finish Done When and Validation Plan before this step can complete.` A clear-to-incomplete result might say `Step cleared. This checkpoint is incomplete again.` A mutation failure might say `We could not save this step right now. Your draft is still here, so try again.` The exact strings can be tuned during implementation, but the message shape must remain direct, human, and actionable.

Finally, tighten the surrounding clarity surfaces. `apps/web/features/blueprint-flow/components/blueprint-stage-field.tsx` should grow the minimal error-aware interface needed to render `aria-invalid`, tie an inline field error to the current field, and expose a stable id that allows focus to move to the first missing required field. `apps/web/features/blueprint-flow/components/blueprint-stage-sidebar.tsx` should format missing fact keys through the existing `blueprintFieldLabel` helper instead of printing raw identifiers. If the helper needs a small extension to support reusable labeled lists, make that change in `apps/web/features/blueprint-flow/lib/blueprint-field-helpers.ts` rather than duplicating formatting logic in the sidebar. Keep these improvements scoped to the blueprint-flow feature and to the fields already exposed there.

## Milestones

### Milestone 1: Model save-attempt outcomes in one shared helper

At the end of this milestone, the repository has one feature-local helper that can classify a save attempt for any blueprint step as blank, partial, complete, or cleared-to-incomplete using the current step definition, the user’s current draft values, and the step’s previously saved values. The main file added should be `apps/web/features/blueprint-flow/lib/blueprint-step-save-feedback.ts`, and it may be accompanied by a focused unit test such as `apps/web/tests/unit/blueprint-step-save-feedback.test.ts`. The helper should rely on `requiredFieldKeys` when present and fall back to `fieldKeys` when a step has no narrower required set. It should also return the missing required fields in a stable order so the UI can focus the first one predictably.

Success for this milestone means a developer can call the helper with representative `Product`, `Design`, `Marketing`, and `Build Plan` steps and get stable results that match the intended product rules, including the intentional-clear branch. The proof should come from a focused unit test or equivalent pure-function assertions rather than from UI testing alone.

### Milestone 2: Wire truthful feedback into the shared blueprint-stage page and step card

At the end of this milestone, `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx` no longer advances optimistically after every mutation. Blank attempts are blocked before the mutation. Partial attempts persist but stay on the same step. Clear-to-incomplete attempts persist but stay on the same step with a warning-level message. Complete attempts persist and advance if another step exists. Mutation failures show a destructive inline error but preserve the draft text. `apps/web/features/blueprint-flow/components/blueprint-stage-step-card.tsx` renders the summary feedback for the current step, and `apps/web/features/blueprint-flow/components/blueprint-stage-field.tsx` renders field-level invalid state and helper text for missing required fields.

Success for this milestone means a user can open `/product`, try to save an untouched step, and immediately see why nothing moved; watch the first missing required field receive focus; fill only some required answers and see a draft-saved message while staying on the step; watch individual field errors clear as they fix them; then finish the required answers and move forward on the next successful save. The same behavior must occur on `/design`, `/marketing`, and `/build-plan` because they share the same shell.

### Milestone 3: Make stage-level missing-field feedback human-readable

At the end of this milestone, `apps/web/features/blueprint-flow/components/blueprint-stage-sidebar.tsx` no longer prints raw `snake_case` fact keys. The sidebar should render the same missing fields as human-readable labels, and any step-level feedback block that references missing fields should use the same label source so the language stays consistent across the stage.

Success for this milestone means a user sees `Scope In` instead of `scope_in`, `Why This Matters` instead of `why_this_matters`, and similar friendly labels everywhere this slice touches. This milestone is complete only when the terminology is consistent between the inline feedback block and the sidebar.

### Milestone 4: Prove the behavior with focused and broad validation

At the end of this milestone, the new behavior is covered by focused tests and passes the relevant broader app checks. `apps/web/tests/integration-ui/blueprint-stage-page.test.tsx` should gain coverage for blank save attempts, partial saves that stay on the current step, clear-to-incomplete saves, complete saves that advance, focus moving to the first missing required field, field-level invalid state clearing as the user fixes fields, and mutation failures that preserve drafts. If a pure helper test was added in Milestone 1, it should also pass. The broader app validation should confirm that the blueprint-flow refactor did not break build or other protected workspace surfaces.

Success for this milestone means the focused tests describe the new save contract in plain product terms and the broader commands pass without blueprint-flow regressions.

## Concrete Steps

Work from the repository root unless a step says otherwise.

Start by capturing the current baseline for the shared blueprint stage UI:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/blueprint-stage-page.test.tsx

The expected baseline observation before implementation is that the current integration-ui test passes, but there is no assertion yet for a blocked blank save or a draft-stays-here partial save. Record the pre-change command in this ExecPlan if implementation begins.

When Milestone 1 starts, add the pure helper under `apps/web/features/blueprint-flow/lib/` and cover it with a narrow unit test if the helper is complex enough to justify one. The helper should take enough information to distinguish a never-started blank step from a step that the user intentionally cleared after saving. The recommended command is:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project unit tests/unit/blueprint-step-save-feedback.test.ts

Observed on 2026-03-26 16:07 EDT:

    RUN  v4.1.0 /Users/parkerrex/Projects/ship-by-sunday/apps/web
    Test Files  1 passed (1)
    Tests  4 passed (4)

The unit test now proves that blank, partial, complete, and cleared-to-incomplete classifications are correct for representative steps. If the helper is instead covered indirectly through integration-ui alone, note that decision in the `Decision Log` before moving on.

When Milestone 2 starts, wire the helper into `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx`, add the field-level error surface in `apps/web/features/blueprint-flow/components/blueprint-stage-field.tsx`, and render the summary message surface from `apps/web/features/blueprint-flow/components/blueprint-stage-step-card.tsx` or a new feature-local child component. Re-run the focused integration-ui test immediately after the page, field, and step-card changes:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/blueprint-stage-page.test.tsx

Observed on 2026-03-26 16:20 EDT:

    Test Files  1 passed (1)
    Tests  5 passed (5)

The updated integration-ui test now proves the key behaviors: blank save attempts stay put and show guidance, focus moves to the first missing required field, partial saves stay put and show draft feedback, clear-to-incomplete results stay put and show a warning, field-level errors clear as the user fixes each field, mutation failures preserve the draft and show a destructive inline error, and complete saves advance.

When Milestone 3 starts, change `apps/web/features/blueprint-flow/components/blueprint-stage-sidebar.tsx` to use human-readable labels and update or add assertions in the same integration-ui test file if practical. If the sidebar wording becomes broad enough that one large test gets hard to read, split out a second focused file such as `apps/web/tests/integration-ui/blueprint-stage-sidebar.test.tsx` instead of creating a giant all-in-one assertion block.

Observed on 2026-03-26 16:20 EDT:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/blueprint-stage-sidebar.test.tsx
    Test Files  1 passed (1)
    Tests  1 passed (1)

Before closing the work, run the narrowest relevant checks first and then the broader app commands:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx oxlint --deny-warnings features/blueprint-flow/components/blueprint-stage-page.tsx features/blueprint-flow/components/blueprint-stage-step-card.tsx features/blueprint-flow/components/blueprint-stage-sidebar.tsx features/blueprint-flow/lib/blueprint-field-helpers.ts features/blueprint-flow/lib/blueprint-stage-progress.ts features/blueprint-flow/lib/blueprint-step-save-feedback.ts tests/integration-ui/blueprint-stage-page.test.tsx tests/unit/blueprint-step-save-feedback.test.ts
    $ bunx oxfmt --check features/blueprint-flow/components/blueprint-stage-page.tsx features/blueprint-flow/components/blueprint-stage-step-card.tsx features/blueprint-flow/components/blueprint-stage-sidebar.tsx features/blueprint-flow/lib/blueprint-field-helpers.ts features/blueprint-flow/lib/blueprint-stage-progress.ts features/blueprint-flow/lib/blueprint-step-save-feedback.ts tests/integration-ui/blueprint-stage-page.test.tsx tests/unit/blueprint-step-save-feedback.test.ts
    $ bunx vitest run --project unit tests/unit/blueprint-step-save-feedback.test.ts
    $ bunx vitest run --project integration-ui tests/integration-ui/blueprint-stage-page.test.tsx
    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run build

Observed on 2026-03-26 16:20 EDT:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx oxlint --deny-warnings ...
    Found 0 warnings and 0 errors.

    $ bunx oxfmt --check ...
    All matched files use the correct format.

    $ bunx vitest run --project unit tests/unit/blueprint-step-save-feedback.test.ts
    Test Files  1 passed (1)
    Tests  4 passed (4)

    $ bunx vitest run --project integration-ui tests/integration-ui/blueprint-stage-page.test.tsx tests/integration-ui/blueprint-stage-sidebar.test.tsx
    Test Files  2 passed (2)
    Tests  6 passed (6)

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run build
    Build error: `apps/web/content/docs/video-pipeline.mdx` frontmatter YAML parse failure at `description:`

If implementation does not create the helper unit test file, remove that command from the final recorded validation list and replace it with the actual focused test coverage that proves the same behavior. If any validation fails, stop, document the failure in `Surprises & Discoveries`, repair it, rerun the same command, and only then continue.

## Validation and Acceptance

Acceptance is behavior-first.

The first acceptance criterion is that blank step saves are no longer silent. On any blueprint-stage route that renders `BlueprintStagePage`, clicking `Save step` with no entered content must keep the user on the current step and show an inline message that clearly says the step is still blank or missing input. The mutation must not run for that case.

The second acceptance criterion is that validation is actionable, not only descriptive. After a blank or partial save attempt, the missing required fields in the current step must receive visible invalid styling and helper text, and focus must move to the first missing required field. As the user fills those fields, each field’s invalid state must clear as soon as that field becomes non-empty again.

The third acceptance criterion is that partial saves become honest drafts. If the user fills only some required answers for the current step, the mutation should persist the entered values, but the UI must keep the user on the same step and explain which required answers are still missing before the checkpoint can complete. If the user intentionally clears previously saved required content and clicks `Save step`, the mutation should persist the clear, keep the user on the same step, and explain that the step is incomplete again.

The fourth acceptance criterion is that complete saves preserve the current happy path. When all required inputs for the current step are present, the step should save successfully and auto-advance to the next step if another step exists. This behavior must remain consistent across `Product`, `Design`, `Marketing`, and `Build Plan`.

The fifth acceptance criterion is that server or network save failures are clearly distinct from validation failures. If the mutation rejects, the UI must keep the user on the same step, preserve the current draft text, show a destructive inline save error, and avoid rewriting the field-level validation state as if the user had made a form mistake.

The sixth acceptance criterion is that stage-level missing-field feedback uses human-readable labels. The sidebar and any inline references to missing fields must show the same friendly labels and must not expose raw implementation identifiers such as `scope_in` or `why_this_matters`.

The seventh acceptance criterion is that unresolved feedback is sticky per step while success is not. If the user leaves a step with unresolved validation, warning, or failed-save feedback and later comes back, that unresolved feedback should still be visible until the step is fixed or successfully resaved. Positive success confirmations should not persist across step switches.

The eighth acceptance criterion is that the behavior is proven by tests. Focused tests must cover blank, partial, cleared-to-incomplete, complete, and failed-save branches in the shared blueprint-stage shell. The broader `bun run build` command from the repository root must also pass so the blueprint-flow refactor does not break the app shell or surrounding integrations.

Current status on 2026-03-26 16:21 EDT: the focused tests and blueprint-flow lint/format checks now satisfy the behavior proof for this slice. The only unmet acceptance proof is the broader repository build, which is currently blocked by the unrelated `apps/web/content/docs/video-pipeline.mdx` YAML frontmatter parse error captured above.

## Idempotence and Recovery

This slice is intentionally safe to rerun because it stays inside feature-local UI and helper logic. There are no schema migrations, no new tables, and no download-route side effects. Re-running the commands in this plan should not damage the repository or user data.

If the implementation becomes tangled, recover by returning to the smallest truthful rule set. Keep the helper pure. Keep the page component responsible only for local feedback state and save branching. Keep the step card responsible only for rendering. Do not push this slice into blueprint compiler stage definitions or Convex persistence unless a concrete failing test proves the client layer is insufficient.

If a partial implementation leaves stale feedback messages when users change steps or edit fields, fix that in the page-level local state rather than by suppressing the message surface entirely. The recovery goal is a truthful message lifecycle, not message removal. Unresolved feedback should remain keyed to the affected step; successful-save confirmations should be treated as immediate but non-sticky.

If an attempt to improve the sidebar grows into a larger copy redesign, stop and narrow back to label formatting only. This slice is complete once the save outcome is truthful and the missing-field names are human-readable. Broader copy polish can happen later.

## Artifacts and Notes

The implementation should preserve the blueprint-flow feature boundary and keep the diff minimal. The most important proof points to record here during implementation are the first passing blank-save test, the first passing partial-save test, and the final build transcript.

Useful snippets to preserve as implementation evidence:

    Current silent-save cause:
    `buildSavePayload()` can return no `factsPatch`, but `handleSave()` still saves and advances.

    First passing classification proof:
    `bunx vitest run --project unit tests/unit/blueprint-step-save-feedback.test.ts`
    -> `Tests  4 passed (4)`

    First passing shell-behavior proof:
    `bunx vitest run --project integration-ui tests/integration-ui/blueprint-stage-page.test.tsx`
    -> `Tests  5 passed (5)`

    First passing sidebar-label proof:
    `bunx vitest run --project integration-ui tests/integration-ui/blueprint-stage-sidebar.test.tsx`
    -> `Tests  1 passed (1)`

    Shared-surface guarantee:
    `/product`, `/design`, `/marketing`, and `/build-plan` all render `BlueprintStagePage`.

    Expected post-fix product contract:
    blank -> explain, mark fields invalid, focus first missing, and stay
    partial -> save draft, keep invalid fields visible, focus first missing, and stay
    clear after prior save -> save the clear, warn that the step is incomplete again, and stay
    complete -> save and advance
    mutation failure -> preserve draft, show destructive save error, and stay

    Broader validation blocker:
    `bun run build`
    -> unrelated Nextra/YAML parse failure in `apps/web/content/docs/video-pipeline.mdx`

Final file list for this slice:

    apps/web/features/blueprint-flow/components/blueprint-stage-field.tsx
    apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx
    apps/web/features/blueprint-flow/components/blueprint-stage-save-feedback.tsx
    apps/web/features/blueprint-flow/components/blueprint-stage-sidebar.tsx
    apps/web/features/blueprint-flow/components/blueprint-stage-step-card.tsx
    apps/web/features/blueprint-flow/hooks/use-blueprint-stage-step-state.ts
    apps/web/features/blueprint-flow/lib/blueprint-step-save-feedback.ts
    apps/web/tests/integration-ui/blueprint-stage-page.test.tsx
    apps/web/tests/integration-ui/blueprint-stage-sidebar.test.tsx
    apps/web/tests/unit/blueprint-step-save-feedback.test.ts

## Interfaces and Dependencies

`apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx` remains the route-level behavioral boundary for this slice, but it now depends on `apps/web/features/blueprint-flow/hooks/use-blueprint-stage-step-state.ts` for the save branching, per-step feedback lifecycle, focus management, and local draft state. Keeping that logic in the hook preserves the shared page shell while keeping the rendering component small enough to reason about quickly.

`apps/web/features/blueprint-flow/lib/blueprint-field-helpers.ts` is an existing dependency because it already knows how to trim and serialize the current step’s draft values into `factsPatch` and `clearedFieldKeys`. The new save-attempt helper should either consume that payload or share compatible normalization logic with it. Do not duplicate trimming rules in multiple components.

`packages/blueprint-compiler/src/stages/stage-definitions.ts` is a required dependency because `BlueprintStepDefinition.requiredFieldKeys` determines whether a save attempt is complete. The implementation must respect that contract exactly. In `Design`, for example, `surface_type` is present in the flow step but is not required; in `Build Plan`, the pricing step has a narrower required set than its full field list. The new helper must use the required-field contract rather than assuming every visible field is mandatory.

`apps/web/features/blueprint-flow/components/blueprint-stage-field.tsx` is now a required dependency for this slice because it renders every input in the blueprint flow. It now accepts the minimum invalid-state inputs required to set `aria-invalid`, render an inline field error, and expose a stable target for focusing the first missing required field after a failed save attempt.

`apps/web/features/blueprint-flow/components/blueprint-stage-save-feedback.tsx` is the new shared feedback surface for the current step card. It renders the inline save-result block and depends on the helper-layer copy model instead of owning save-state strings itself.

`apps/web/features/blueprint-flow/components/blueprint-stage-sidebar.tsx` depends on human-readable field labels. The existing `blueprintFieldLabel` function in `apps/web/features/blueprint-flow/lib/blueprint-field-helpers.ts` should remain the single source of truth for those labels unless implementation reveals a real domain naming problem that requires a richer label map.

`apps/web/components/ui/field.tsx`, `apps/web/components/ui/input.tsx`, and `apps/web/components/ui/textarea.tsx` are styling and accessibility dependencies because they already define the repo’s invalid-field behavior through `FieldError` and `aria-invalid`. Blueprint flow should reuse those primitives rather than inventing a second invalid-state treatment.

`apps/web/tests/integration-ui/blueprint-stage-page.test.tsx` is the main shell-behavior proof for this slice and now covers blank, partial, complete, cleared-to-incomplete, and failed-save paths. `apps/web/tests/integration-ui/blueprint-stage-sidebar.test.tsx` is the focused human-label proof for the stage sidebar. The broader `bun run build` command from the repository root remains the final integration dependency for this slice, but it is currently blocked by the unrelated docs parse error captured above.
