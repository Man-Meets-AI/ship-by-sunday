---
title: "Standalone Telegram Chat Widget Plan Split Recommendation"
summary: "Recommended child ExecPlan split for the standalone widget package initiative."
docType: "plan_split_recommendation"
status: "active"
read_when:
  - "Writing child ExecPlans for the standalone widget Program."
  - "Checking which implementation slice should come next."
---

# Standalone Telegram Chat Widget Plan Split Recommendation

This Program should be split into several child ExecPlans so package extraction, host migration, realtime, auth, and docs remain independently reviewable.

## Recommended Child Plans

1. `Package Contract And Scaffold`

Create `packages/telegram-chat-widget` with package metadata, TypeScript config, Vitest config, exports, initial CSS strategy, core public types, content defaults, event sink types, attachment policy, focused contract tests, a working configurable fetch adapter, and a reserved Convex subpath without live realtime behavior. Update root package validation scripts so lint, typecheck, and package tests include the new package immediately. Do not move runtime UI yet.

2. `Support Widget UI Extraction With Fetch Transport`

Move the polished widget UI, message rendering, composer, bug-report fields, attachment affordances, and state hook into the package. Preserve the current fetch bridge and support behavior.

3. `Ship By Sunday Widget Consumer Migration`

Make homepage and workspace support wrappers import the package. Keep placement, app copy, analytics wiring, and fallback URLs in `apps/web`. Run integration-ui and browser proof.

4. `Convex Realtime Adapter`

Add the optional Convex adapter entrypoint, wire it in `apps/web` where safe, and remove route polling for transcript updates when the conversation authority model supports it.

5. `Standalone Conversation Authority`

Design and implement the scoped conversation capability needed for route-free anonymous direct Convex usage, or explicitly decide to keep a host bridge for anonymous visitors.

6. `Attachment And Bug Report Adapter Hardening`

Finalize screenshot upload, file limits, bug report payload, storage, Telegram rendering, and retention behavior across fetch and Convex paths.

7. `Standalone Docs And Example`

Document package usage, CSS import, host adapter contracts, Convex setup, Clerk behavior, Telegram setup, env ownership, verification, and common failure modes.

## First Slice Recommendation

Start with `Package Contract And Scaffold`.

This slice is small enough to land cleanly and large enough to prevent later extraction from guessing the package API. It should produce a package shell that future child ExecPlans can import, test, and evolve without moving app behavior yet.
