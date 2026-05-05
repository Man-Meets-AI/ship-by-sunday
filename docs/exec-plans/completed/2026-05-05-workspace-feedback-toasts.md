---
title: Workspace Feedback Toasts
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Replace cheap workspace action feedback banners with fast bottom-right toasts and report failed workspace actions through the existing client PostHog error path.
post_build_recap: Workspace setup, privacy, and doctor-pass action feedback now uses fast bottom-right Sonner toasts, failed actions report through the existing client PostHog error path, inline generic feedback banners are removed, and focused workspace tests plus repo gates passed.
read_when:
  - Resuming implementation of workspace feedback cleanup.
  - Validating toast behavior on setup, privacy, and doctor-pass workspace pages.
  - Deciding whether another workspace save confirmation should be inline or ephemeral.
---

# Workspace Feedback Toasts

This document is a living execution plan for replacing cheap workspace confirmation and error banners with fast toasts while keeping unrelated durable inline feedback intact.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The existing workspace pages render short action feedback as full-width banners directly under the page header. On `/workspace/setup`, changing the default open destination shows "Default open destination saved." above every card, which reads as heavier than the action deserves. Mutation failures on the same pages also use the same generic banner. After this change, a user can click a workspace action and get a quick bottom-right toast without the page layout shifting or a new banner competing with the cards. If the action fails, the user gets a longer-lived error toast and the failure is reported through the existing client PostHog error path.

The plan intentionally separates ephemeral workspace action feedback from durable workflow feedback. A "toast" is a floating notification from the existing `sonner` package. It is already mounted globally and defaults to the bottom-right corner. Durable inline feedback means content that remains in the page because it explains validation, missing fields, or multi-step state. The user-visible proof is simple: clicking the default open destination buttons on `/workspace/setup` saves through the same Convex mutation and shows a short bottom-right toast; no "Default open destination saved." banner appears between the header and the page cards.

## Progress

- [x] 2026-05-05 EDT: Read root `AGENTS.md`, `apps/web/AGENTS.md`, root `DESIGN.md`, `docs/ship-by-sunday/design-pack/AGENTS.md`, `docs/ship-by-sunday/design-pack/CHECKLIST.md`, and `docs/ship-by-sunday/design-pack/surfaces/app-surface.md`.
- [x] 2026-05-05 EDT: Inspected the current workspace feedback owners: `apps/web/app/(workspace)/_components/existing-codebase-setup/existing-codebase-setup-page.tsx`, `apps/web/app/(workspace)/_components/existing-codebase-support/workspace-privacy-page.tsx`, `apps/web/app/(workspace)/_components/existing-codebase-support/use-workspace-privacy-actions.ts`, and `apps/web/app/(workspace)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-page.tsx`.
- [x] 2026-05-05 EDT: Confirmed `sonner` is already available through `apps/web/components/ui/sonner.tsx` and globally mounted in `apps/web/app/layout.tsx`.
- [x] 2026-05-05 EDT: Created this ExecPlan from the research pass.
- [x] 2026-05-05 EDT: Interviewed product owner on decision branches. Locked: success and error feedback both use toasts, no page-level generic `feedbackMessage` state remains on the three pages, failures also call `reportClientError(...)`, success duration is 1800 ms, error duration is 6000 ms, toast ids are required and separate for success versus error, copy uses short unpunctuated titles, descriptions are reserved for next-step meaning, and no design-pack docs update is needed unless implementation broadens.
- [x] 2026-05-05 EDT: Implemented `apps/web/app/(workspace)/_lib/workspace-action-feedback.ts`, made the global Sonner position explicit, and converted setup, privacy, and doctor-pass action success and error feedback to toasts.
- [x] 2026-05-05 EDT: Updated focused integration UI tests to assert toast calls, failed-action reporting, and unchanged Convex mutation arguments.
- [x] 2026-05-05 EDT: Focused validation passed: workspace setup page, workspace privacy page, workspace doctor-pass page, and codebase page integration UI tests.
- [x] 2026-05-05 EDT: Repo validation passed: targeted format, `bun run format`, `bun run format:check`, `bun lint`, `bun typecheck`, plan lint, markdown lint, and `git diff --check`.
- [x] 2026-05-05 EDT: Browser proof was attempted against the existing local dev server on `http://localhost:3000/workspace/setup`, but the protected route redirected to sign-in with `x-clerk-auth-status: signed-out`. No Convex local mode or provider setup was introduced; integration UI tests are the workspace behavior proof for this protected surface.
- [x] 2026-05-05 EDT: Completed this ExecPlan and moved it to `docs/exec-plans/completed/`.

## Surprises & Discoveries

`sonner` does not need to be installed or wired. `apps/web/package.json` already depends on `sonner`, `apps/web/components/ui/sonner.tsx` wraps the toaster with repository icons and tokens, and `apps/web/app/layout.tsx` mounts `<Toaster />` under the theme and Convex providers.

The cheap setup message is not a shared app-shell concern. It is local `feedbackMessage` state in `ExistingCodebaseSetupPage`. The same above-the-cards banner pattern also appears on the privacy and doctor-pass workspace pages, so a complete slice should fix the pattern across the existing-codebase workspace pages, not only the one literal string.

The main `/codebase` save bar uses a different contract. `apps/web/app/(workspace)/_components/codebase-flow/codebase-page-save-bar.tsx` renders feedback such as "Draft saved." together with validation and redirect state. That feedback can tell the user which required fields are missing or that review is opening. It should remain inline in this slice.

The existing client observability path is `apps/web/lib/observability/client-error-report.ts`. It exposes `reportClientError(...)`, normalizes the event as `source: "next_client"`, and calls `capturePostHogClientException(...)` from `apps/web/lib/observability/posthog-client.ts`. The supported severity values are `medium`, `high`, and `critical`; there is no `warning`. Workspace action failures in this plan should default to `medium`.

Local browser proof for the protected workspace route was blocked by auth in this checkout. `curl -I http://localhost:3000/workspace/setup` returned `HTTP/1.1 307 Temporary Redirect` with `location: /sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fworkspace%2Fsetup`, `x-clerk-auth-reason: dev-browser-missing`, and `x-clerk-auth-status: signed-out`. This is an environment limitation, not a code failure.

## Decision Log

Decision: Use the existing `sonner` dependency instead of creating a new toast primitive.

Rationale: The app already mounts the repository-styled `Toaster`, lesson copy prompts and the codebase local draft seeder already call `toast.success(...)`, and adding another notification system would widen the UI surface without solving a new problem.

Date: 2026-05-05.

Decision: Convert setup, privacy, and doctor-pass workspace action success and error feedback to toasts, and remove the generic page-level `feedbackMessage` banner path from those pages.

Rationale: "Default open destination saved." is a transient acknowledgement and should not consume page layout. The same generic banner is also too heavy for retryable mutation failures. Error toasts should live longer than success toasts and should report to PostHog, while `/codebase` save-bar feedback remains inline because it can include validation details and next-step state.

Date: 2026-05-05.

Decision: Make the bottom-right behavior explicit for this pattern even though Sonner defaults to bottom-right.

Rationale: The user requested bottom-right behavior. Encoding either a global `position="bottom-right"` on the existing `Toaster` or explicit per-toast `position: "bottom-right"` options makes the contract visible to future maintainers.

Date: 2026-05-05.

Decision: Add a workspace-local feedback helper at `apps/web/app/(workspace)/_lib/workspace-action-feedback.ts`.

Rationale: Success and error toasts now share product policy: required stable ids, bottom-right placement, 1800 ms success duration, 6000 ms error duration, no punctuation in short titles, and `medium` severity failure reporting. A small feature-local helper keeps that policy out of the action handlers without turning it into a global notification abstraction.

Date: 2026-05-05.

Decision: Report failed workspace actions through `reportClientError(...)` beside the error toast.

Rationale: A failed mutation should be visible to the user and discoverable in PostHog. Reporting in the client catch block preserves the caught error and exact user action context. The report should include a stable code, human-readable title, static pathname, severity `medium`, and only safe low-cardinality details such as an enum destination value or stable action name. It must not include customer repository names, runner ids, finding ids, run ids, digests, or local paths.

Date: 2026-05-05.

Decision: Do not add new success product analytics events in this slice.

Rationale: The product need is UI feedback cleanup plus failure visibility. Success analytics would require an event taxonomy decision and could add noise without answering a current product question.

Date: 2026-05-05.

## Outcomes & Retrospective

Completed on 2026-05-05. The implementation added a feature-local workspace action feedback helper, made the global Sonner position explicit, removed generic inline feedback banners from setup, privacy, and doctor-pass workspace pages, and converted both success and error mutation feedback to toasts. Failed workspace actions now call `reportClientError(...)` with stable codes, static route paths, `medium` severity, and safe low-cardinality details.

Focused tests prove the route behavior at the component level: setup still saves the selected default open destination through the same Convex mutation and now emits `Open destination saved` with the selected option label; setup save failures emit an error toast and report the failure; privacy actions emit success toasts and managed-GitHub request failures report through the client error path; doctor-pass approval emits success and error toasts with failure reporting. The `/codebase` page integration UI test still passes, confirming the validation-oriented save bar remains untouched.

Browser proof was attempted but blocked by local signed-out Clerk state on the protected route. No external setup or generated documentation changed. No design-pack documentation update was needed because this was a transient feedback chrome cleanup rather than a durable surface contract change.

## Context and Orientation

This repository uses a Next.js app under `apps/web`. The affected routes live in the protected workspace route group under `apps/web/app/(workspace)/workspace`. The user-facing pages are client components that call Convex mutations from `convex/react` and update local React state for pending and feedback states.

The current setup page owner is `apps/web/app/(workspace)/_components/existing-codebase-setup/existing-codebase-setup-page.tsx`. It defines `feedbackMessage` with `useState`, clears it before each mutation, sets success text after successful mutations, sets error text after failed mutations, and renders the text in a bordered `role="status"` banner between the header and the cards. The default open destination save path is the `updateOpenDestination` function. It calls `api.workspace.createOrLoadWorkspaceProject` through `saveWorkspaceProject({ defaultOpenDestination })`, then currently sets `feedbackMessage` to "Default open destination saved." The replacement toast should use title `Open destination saved` and the selected option label as its description, such as `VS Code`.

The current privacy page owner is split between `apps/web/app/(workspace)/_components/existing-codebase-support/workspace-privacy-page.tsx` and `apps/web/app/(workspace)/_components/existing-codebase-support/use-workspace-privacy-actions.ts`. The hook owns action state and feedback. The page renders the same full-width banner above the cards. Success messages include runner revocation, synced finding deletion, managed GitHub consent request, and managed GitHub consent revocation.

The current doctor-pass page owner is `apps/web/app/(workspace)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-page.tsx`. It uses the same inline `feedbackMessage` pattern after approving a sync preview.

The existing toast boundary is `apps/web/components/ui/sonner.tsx`. It imports `Toaster as Sonner` from `sonner`, injects lucide icons for success, info, warning, error, and loading, and styles the toast with repository color tokens. `apps/web/app/layout.tsx` imports this component and renders `<Toaster />` globally. The implementation should keep a single global toaster and make `position="bottom-right"` explicit there.

The new workspace helper should live at `apps/web/app/(workspace)/_lib/workspace-action-feedback.ts`. It should export `showWorkspaceActionSuccessToast({ id, title, description })` and `showWorkspaceActionErrorToast({ id, error, fallbackMessage, report })`. The `report` object should contain `title`, `code`, `pathname`, and optional safe `details`. The helper should call `toast.success(...)` or `toast.error(...)`, normalize non-`Error` toast messages with the fallback message, pass the raw caught error to `reportClientError(...)`, and bake in `position: "bottom-right"`, success duration `1800`, error duration `6000`, and failure severity `medium`.

### In Scope

This plan owns converting success confirmations and mutation failure messages on the existing-codebase workspace pages to `sonner` toasts. The concrete surfaces are `/workspace/setup`, `/workspace/privacy`, and `/workspace/doctor-pass`. It owns removing the generic page-level `feedbackMessage` banner from those surfaces. It owns updating focused integration UI tests that currently assert the banner text. It owns explicit bottom-right toast behavior, named durations, stable toast ids, short toast copy, error reporting through `reportClientError(...)`, and safe low-cardinality failure details.

### Out Of Scope

Do not change Convex mutations, schemas, route access, checkout, entitlement, or workspace navigation. Do not redesign the setup, privacy, doctor-pass, or codebase pages. Do not change the `/codebase` save bar, codebase section validation feedback, or any feedback tied to missing required fields. Do not add a new toast library. Do not add a custom global notification store. Do not change unrelated lesson copy prompt or local draft seeder toast behavior except if a narrow type or lint issue requires it.

## Plan of Work

Start with the global toaster contract. Open `apps/web/components/ui/sonner.tsx` and decide whether to make the default `position` and short duration explicit on `<Sonner />`. If the global default changes, be conservative: keep existing visual styling, icons, theme behavior, and `toastOptions.classNames.toast`. A safe implementation is to add `position="bottom-right"` and leave the default duration alone, then set short durations per cheap workspace toast. This avoids accidentally shortening existing toasts such as the local draft seeder's longer informational message.

Next edit `apps/web/app/(workspace)/_components/existing-codebase-setup/existing-codebase-setup-page.tsx`. Import the new helper from `apps/web/app/(workspace)/_lib/workspace-action-feedback.ts`. Remove the `feedbackMessage` state. In `updateOpenDestination`, keep `setPendingAction("open_destination")`, keep the exact `saveWorkspaceProject({ defaultOpenDestination })` call, and replace `setFeedbackMessage("Default open destination saved.")` with a success toast titled `Open destination saved` and a description containing the selected option label. Use separate stable ids for success and error such as `workspace-open-destination-success` and `workspace-open-destination-error`. Convert the other success and error messages in this file, such as pairing token preparation, pairing cancelation, and doctor-pass start. Remove the banner render block between the header and `SetupPairingPanel`.

Then edit `apps/web/app/(workspace)/_components/existing-codebase-support/use-workspace-privacy-actions.ts` and `apps/web/app/(workspace)/_components/existing-codebase-support/workspace-privacy-page.tsx`. Keep mutation orchestration inside the hook. Import the workspace action feedback helper in the hook, replace all success and error `setFeedbackMessage(...)` calls with helper calls, stop returning `feedbackMessage`, and remove the banner render from the page. Successful destructive actions still use success toasts because the toast tone describes execution result; the action copy carries risk before the click.

Then edit `apps/web/app/(workspace)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-page.tsx`. Import the workspace action feedback helper, replace the sync-preview success and error banners with toasts, and remove the banner render block.

Update tests after the production behavior is changed. The existing toast tests mock `sonner` in `apps/web/tests/integration-ui/copy-prompt-resource-card.test.tsx`; use the same pattern in `workspace-setup-page.test.tsx`, `workspace-privacy-page.test.tsx`, and `workspace-doctor-pass-page.test.tsx`. Hoist `toastSuccessMock`, `toastErrorMock`, and a `reportClientErrorMock` with `vi.hoisted`, mock `sonner` and `@/lib/observability/client-error-report`, reset mocks in `beforeEach`, and assert calls with the relevant message and options. Keep existing mutation assertions intact because the Convex contract must not change. Add focused failure-path assertions for setup open destination failure, privacy action failure, and doctor-pass approval failure.

Finally run focused tests first, then the required gates. Update this ExecPlan's `Progress`, `Surprises & Discoveries`, `Outcomes & Retrospective`, and `Artifacts and Notes` with exact evidence. If implementation changes user-facing workspace behavior in a meaningful way beyond swapping transient banners for toasts, update `docs/ship-by-sunday/design-pack/documentation.md`; otherwise record in the retrospective that no durable design-pack documentation update was needed because this only reduces transient confirmation chrome.

## Milestones

The first milestone is a setup-page conversion. At the end, `/workspace/setup` should still save the default open destination through `api.workspace.createOrLoadWorkspaceProject`, the selected button should still show the saved value through the live setup model, and the user should see a short bottom-right toast instead of a full-width banner. Run the focused setup page test file and expect the mutation assertions and toast assertions to pass.

The second milestone is workspace support page parity. At the end, `/workspace/privacy` and `/workspace/doctor-pass` should not render the same above-the-cards success banner pattern for cheap completed actions. Success confirmations should use bottom-right toasts. Any remaining inline error or recovery feedback must be intentionally named and documented in the decision log. Run the focused privacy and doctor-pass test files and expect the action state assertions, mutation assertions, and toast assertions to pass.

The third milestone is browser proof. At the end, a real dev server should show the workspace setup page without layout-shifting success banners. The manual smoke should cover at least one desktop viewport and one mobile viewport. If authentication or Convex hosted dev state blocks direct browser proof, record the blocker and rely on focused integration UI proof, but do not claim browser proof ran.

The fourth milestone is closeout. At the end, focused tests, formatting, linting, typecheck, plan lint, markdown lint, and `git diff --check` should pass, this ExecPlan should contain implementation evidence, and the plan should be moved to `docs/exec-plans/completed/` with complete front matter only after all implementation and validation work is done.

## Concrete Steps

Start by confirming the worktree and rereading the target files from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday
    git status --short
    sed -n '1,260p' apps/web/app/'(workspace)'/_components/existing-codebase-setup/existing-codebase-setup-page.tsx
    sed -n '1,240p' apps/web/app/'(workspace)'/_components/existing-codebase-support/use-workspace-privacy-actions.ts
    sed -n '1,140p' apps/web/app/'(workspace)'/_components/existing-codebase-support/workspace-privacy-page.tsx
    sed -n '1,140p' apps/web/app/'(workspace)'/_components/existing-codebase-doctor-pass/workspace-doctor-pass-page.tsx
    sed -n '1,80p' apps/web/components/ui/sonner.tsx

Expected observation: the setup, privacy, and doctor-pass files contain local `feedbackMessage` state and render a `role="status"` banner above the main page cards. `components/ui/sonner.tsx` wraps Sonner, and `apps/web/app/layout.tsx` already mounts it globally.

Implement the setup page slice, then run:

    cd /Users/bazelrex/Developer/ship-by-sunday
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-setup-page.test.tsx

Expected observation: Vitest reports the workspace setup page test file passing. The "saves the default open destination through the workspace contract" test should still assert `saveWorkspaceProjectMock` receives `{ defaultOpenDestination: "vscode" }`, and it should now assert the success toast instead of the inline banner.

Implement the privacy and doctor-pass slice, then run:

    cd /Users/bazelrex/Developer/ship-by-sunday
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-privacy-page.test.tsx tests/integration-ui/workspace-doctor-pass-page.test.tsx

Expected observation: Vitest reports both files passing. Mutation assertions remain unchanged. Success feedback assertions use mocked `sonner` toast calls.

If a browser smoke is possible in the local environment, start the app in the narrowest reasonable mode:

    cd /Users/bazelrex/Developer/ship-by-sunday
    bun run --cwd apps/web dev:core

Expected observation: Next.js and hosted Convex dev both start. Open `/workspace/setup` in a signed-in entitled local session. Change "Default open destination" on desktop and mobile. The page should show a bottom-right toast and should not insert a banner between the header and `SetupPairingPanel`.

After implementation, run the closeout commands listed in `Validation and Acceptance`. If a command fails, fix the narrow cause, rerun the failed command, and update this plan with the failure and repair evidence before continuing.

## Validation and Acceptance

Acceptance requires observable behavior and passing commands. The default open destination control on `/workspace/setup` must still call the same Convex mutation with the chosen `defaultOpenDestination`, disable appropriately while pending, and update from live workspace state as before. Its success feedback must be a quick bottom-right toast, not an inline banner above the setup cards.

Privacy and doctor-pass cheap success confirmations must use the same toast pattern so workspace pages no longer repeat the full-width "saved" chrome above every card. If any inline message remains, it must be because the message is not a cheap confirmation and the reason must be recorded in `Decision Log`.

The implementation must not change `/codebase` save-bar behavior. Tests that cover "Draft saved." in `apps/web/tests/integration-ui/codebase-page.test.tsx` should continue to pass if run, and no code in `apps/web/app/(workspace)/_components/codebase-flow/codebase-page-save-bar.tsx` should be changed for this plan unless a focused test reveals a direct compatibility issue.

### Test Commands

Run focused UI tests first:

    cd /Users/bazelrex/Developer/ship-by-sunday
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-setup-page.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-privacy-page.test.tsx tests/integration-ui/workspace-doctor-pass-page.test.tsx

Run a focused regression test for the codebase save bar if any shared toast or feedback helper is introduced:

    cd /Users/bazelrex/Developer/ship-by-sunday
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx

Run repository gates before completion:

    cd /Users/bazelrex/Developer/ship-by-sunday
    bun run format
    bun lint
    bun typecheck

Validate the plan and markdown:

    cd /Users/bazelrex/Developer/ship-by-sunday
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-workspace-feedback-toasts.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-workspace-feedback-toasts.md
    git diff --check

The plan has been moved to `docs/exec-plans/completed/`; run the plan and markdown commands with the completed path.

## Idempotence and Recovery

The changes are local UI and test changes. Re-running the implementation should be safe because toast calls replace local banner state and do not change persisted data. Stable toast ids prevent duplicate success toasts from stacking if a user clicks a cheap save control repeatedly.

If a focused test fails after converting a message to a toast, first confirm the Convex mutation assertion still passes. If the mutation assertion fails, revert the local edit in that function and repair the original behavior before touching the toast assertion. If only the toast assertion fails, inspect the mocked `sonner` shape and update the test to match the actual call. Do not broaden scope into Convex backend changes.

If browser proof is blocked by missing local authentication, unavailable hosted Convex dev, or absent workspace seed data, record the blocker in `Surprises & Discoveries` and rely on focused integration UI proof for this slice. Do not switch Convex to local mode. Do not add provider setup requirements for this UI-only change.

If changing global `Toaster` props unexpectedly changes existing long-duration toasts, undo the global duration change and use per-toast durations for workspace confirmations instead. The only global behavior that should remain acceptable is making `position="bottom-right"` explicit.

## Artifacts and Notes

Initial research evidence:

    apps/web/app/(workspace)/_components/existing-codebase-setup/existing-codebase-setup-page.tsx sets feedbackMessage to "Default open destination saved." after saveWorkspaceProject({ defaultOpenDestination }).
    apps/web/app/(workspace)/_components/existing-codebase-support/workspace-privacy-page.tsx renders feedbackMessage in the same above-the-cards role="status" banner.
    apps/web/app/(workspace)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-page.tsx renders sync-preview approval feedback in the same banner position.
    apps/web/components/ui/sonner.tsx wraps Sonner with repository icons and tokens.
    apps/web/app/layout.tsx renders <Toaster /> globally.

Suggested toast shape for the default destination confirmation:

    toast.success("Default open destination saved.", {
      id: "workspace-default-open-destination-saved",
      duration: 1800,
      position: "bottom-right",
    });

Keep final implementation evidence here. Include focused test output, browser proof notes, and any decision to keep a message inline.

Implementation evidence captured on 2026-05-05:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-setup-page.test.tsx
    Test Files  1 passed (1)
    Tests  7 passed (7)

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-privacy-page.test.tsx tests/integration-ui/workspace-doctor-pass-page.test.tsx
    Test Files  2 passed (2)
    Tests  5 passed (5)

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx
    Test Files  1 passed (1)
    Tests  4 passed (4)

    bun run format
    Finished in 354ms on 907 files using 12 threads.

    bun run format:check
    All matched files use the correct format.

    bun lint
    Found 0 warnings and 0 errors.

    bun typecheck
    Next.js production build and TypeScript check completed successfully. The route manifest included /workspace/setup, /workspace/privacy, /workspace/doctor-pass, and /codebase.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-workspace-feedback-toasts.md
    docs/exec-plans/completed/2026-05-05-workspace-feedback-toasts.md: ok

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-workspace-feedback-toasts.md
    docs/exec-plans/completed/2026-05-05-workspace-feedback-toasts.md: ok

    git diff --check
    passed with no output

Browser proof attempt:

    curl -I http://localhost:3000/workspace/setup
    HTTP/1.1 307 Temporary Redirect
    location: /sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fworkspace%2Fsetup
    x-clerk-auth-reason: dev-browser-missing
    x-clerk-auth-status: signed-out

## Interfaces and Dependencies

This plan depends on the existing `sonner` package declared in `apps/web/package.json`. It depends on the `toast` export from `sonner` for triggering notifications and the repository wrapper `apps/web/components/ui/sonner.tsx` for rendering them. It depends on the existing global mount in `apps/web/app/layout.tsx`; implementation should not add another toaster.

This plan depends on Convex mutations only as unchanged interfaces. `api.workspace.createOrLoadWorkspaceProject` must continue to receive `{ defaultOpenDestination }` from setup. `api.workspace.prepareWorkspaceSetupPairing`, `api.workspace.cancelWorkspaceSetupPairing`, `api.workspace.startWorkspaceDoctorPassRun`, `api.workspace.revokeWorkspaceRunner`, `api.workspace.markWorkspaceFindingsDeleted`, `api.workspace.requestManagedGithubExecutionConsent`, `api.workspace.revokeManagedGithubExecutionConsent`, and `api.workspace.approveWorkspaceSyncPreview` must continue to receive the same arguments as before.

This plan depends on the focused integration UI test environment under `apps/web/tests/integration-ui`. Tests may mock `sonner` the same way `apps/web/tests/integration-ui/copy-prompt-resource-card.test.tsx` mocks it. The implementation should not require network access or external provider setup beyond the repo's existing test harness.
