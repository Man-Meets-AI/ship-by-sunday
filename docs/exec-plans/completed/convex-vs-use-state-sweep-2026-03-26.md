---
summary: "A sweep of `useState` usage in `apps/web` that classifies each instance as Convex-worthy, local UI state, or derivable state. The conclusion is that no obvious high-confidence Convex migrations remain after the lesson-state and blueprint-state work."
read_when: "Open this when you want to check whether a new local state candidate belongs in Convex or should stay browser-local."
plan_status: "done"
---

# Convex vs useState Sweep

Date: 2026-03-26
Scope: `apps/web`

## Summary

I swept all current `useState` usage in `apps/web` and classified each occurrence as one of:

- `Convex candidate`: obvious product state that should be sourced from Convex instead of mirrored locally
- `Local UI state`: browser-only interaction state, secret entry, animation state, upload progress, or temporary form flow state that should stay client-local
- `Ref or derived candidate`: not a Convex concern, but possibly simplifiable without `useState`

Current conclusion: after the lesson-state and blueprint-state work, there are no additional obvious `Convex candidate` cases left in `apps/web`.

## Convex Candidates

- None remaining that are obvious and high-confidence.

Notes:

- `apps/web/features/course/lesson/hooks/use-lesson-state.ts` is no longer on this list. It now uses Convex-backed lesson truth with a local pending patch buffer.
- `apps/web/features/blueprint-flow/hooks/use-blueprint-stage-step-state.ts` is no longer on this list. It now uses Convex-backed blueprint truth with local unsaved-change and validation state only.
- `apps/web/features/blueprint-flow/components/review/blueprint-review-download-bridge.tsx` is no longer on this list for execute unlock state. It now derives unlock from live workspace state.

## Local UI State

These are not good Convex migrations. They are intentionally browser-local or per-session UI concerns.

### Product and auth flows

- `apps/web/features/product-access/hooks/use-access-required-controller.ts`
  - `workspaceEntryRefreshAttemptCount`
  - `isRetryingAccess`
  - Reason: retry loop and refresh feedback for the mounted gate UI

- `apps/web/features/checkout/hooks/use-stripe-checkout.ts`
  - `isLoading`
  - `error`
  - Reason: request lifecycle for a single checkout attempt

- `apps/web/features/checkout/components/checkout-success-view.tsx`
  - `statusIndex`
  - Reason: rotating success copy while waiting for access propagation

- `apps/web/features/auth/sign-in/use-sign-in-flow.ts`
  - `emailAddress`
  - `newPassword`
  - `password`
  - `verificationCode`
  - `isStartingGoogle`
  - Reason: auth form inputs and flow progress

### Blueprint flow

- `apps/web/features/blueprint-flow/hooks/use-blueprint-stage-step-state.ts`
  - `hasUnsavedChanges`
  - `validationStateByStepId`
  - `invalidFieldKeysByStepId`
  - `saveErrorByStepId`
  - `successStepId`
  - `isSaving`
  - Reason: inline validation, save feedback, and pending draft behavior on top of Convex truth

- `apps/web/features/blueprint-flow/components/review/blueprint-review-download-bridge.tsx`
  - `hasRequestedStarterDownload`
  - `isUnlockPending`
  - Reason: client-only acknowledgement of a browser download plus in-flight mutation state

### Starter repo

- `apps/web/features/starter-repo/components/starter-repo-access-card.tsx`
  - `isEditingRequested`
  - Reason: local edit/reveal toggle over a Convex-backed record, not persisted product state

### Lesson workbench

- `apps/web/features/course/lesson/workbench/fields/reference-gallery-field-control.tsx`
  - `urlInput`
  - `dropActive`
  - `pasteArmed`
  - Reason: transient field interaction state

- `apps/web/features/course/lesson/workbench/fields/upload-field-control.tsx`
  - `isUploading`
  - `uploadError`
  - Reason: upload lifecycle state

- `apps/web/features/course/lesson/workbench/shared/prompt-import-card.tsx`
  - `pastedResponse`
  - `isGenerating`
  - `isAssistToolsOpen`
  - Reason: temporary prompt UI state

- `apps/web/features/course/lesson/workbench/modes/production-deploy-handoff/production-deploy-handoff-secrets-panel.tsx`
  - `cloudflareToken`
  - `stripeSecret`
  - `clerkKeys`
  - Reason: secrets must stay browser-local and should never move to Convex

- `apps/web/features/course/lesson/workbench/modes/core-flow-sketch/core-flow-sketch-timer.tsx`
  - `running`
  - `remaining`
  - Reason: timer state, local to one device/session

- `apps/web/features/course/lesson/workbench/modes/build-setup-launchpad/build-setup-launchpad-commands-block.tsx`
  - `copied`
  - Reason: clipboard feedback

- `apps/web/features/course/lesson/workbench/modes/build-setup-launchpad/build-setup-launchpad-starter-template-card.tsx`
  - `copied`
  - Reason: clipboard feedback

- `apps/web/features/course/lesson/workbench/modes/repo-map-project-map-tab.tsx`
  - `activeId`
  - Reason: local tab selection

- `apps/web/features/course/lesson/workbench/modes/brand-kit/brand-kit-brand-inputs-image-field.tsx`
  - `isUploading`
  - Reason: upload lifecycle state

- `apps/web/features/course/lesson/workbench/modes/paper-photo-upload-pending-video-card.tsx`
  - `examplesOpen`
  - Reason: local disclosure state

### Theme and mounted guards

- `apps/web/features/marketing/components/home-page/home-hero-theme-toggle.tsx`
  - `mounted`

- `apps/web/features/docs/components/docs-theme-toggle.tsx`
  - `mounted`

- `apps/web/features/course/shared/components/app-shell/app-shell-theme-toggle.tsx`
  - `mounted`

Reason: client-only hydration guard

### Shared UI components

- `apps/web/components/ui/*`
  - carousel, code-block, cover, encrypted-text, globe, pointer-highlight, sidebar, sparkles, text-hover-effect
  - Reason: generic UI behavior and animation state, not product state

## Ref or Derived Candidates

These are not Convex migrations, but they are plausible simplification candidates if someone wants to keep shrinking state usage.

- `apps/web/features/product-access/hooks/use-access-required-controller.ts`
  - `lastRefreshAt` and `lastRefreshLabel` could potentially be reduced if the timestamp label is not important
  - Not a Convex concern

- `apps/web/features/starter-repo/components/starter-repo-access-card.tsx`
  - `isEditingRequested` might be reducible to a tighter derived mode model
  - Not a Convex concern

- Theme-toggle `mounted` guards across docs, marketing, and app shell
  - Could potentially be centralized behind a shared hydration-safe theme helper
  - Not a Convex concern

## Practical Rule

- If the state is a durable product fact and a Convex query already returns it, do not mirror it with `useState`.
- If the state is save feedback, upload progress, clipboard feedback, a timer, a tab, a disclosure toggle, or secret input, keep it local.
- If the state is awkward but clearly not durable product truth, simplify it with refs or derived view models rather than trying to push it into Convex.
