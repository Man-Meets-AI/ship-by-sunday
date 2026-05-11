---
title: "Standalone Telegram Chat Widget Cross-Repo Review"
summary: "Risk review for package extraction, app consumption, realtime, and provider setup boundaries."
docType: "cross_repo_review"
status: "active"
read_when:
  - "Reviewing a child ExecPlan or PR for the standalone widget Program."
  - "Checking package extraction risks before implementation."
---

# Standalone Telegram Chat Widget Cross-Repo Review

## Real Risks

Package extraction can accidentally import app-only modules. The package must not import Next.js routes, `apps/web` content modules, generated Convex API references, Clerk hooks, PostHog implementations, or app-specific config.

The current support session model is stronger than a naive browser token because it uses an HttpOnly cookie. Direct Convex realtime for anonymous visitors must not expose a raw long-lived transcript credential just to avoid polling.

The package can become visually broken outside `apps/web` if it depends on host Tailwind utilities. Default CSS and variables are required for standalone behavior.

Convex realtime should use Convex subscriptions. A manual WebSocket would add a second realtime system and make correctness harder to prove.

Attachment support touches storage, Telegram delivery, retention, and privacy. The package can own UI and file policy, but backend storage and retention need adapter-specific validation.

Existing unrelated release and billing changes are dirty in the local checkout. Commits for this Program should stage only standalone widget files and required package/app integration changes.

## Review Questions For Child Plans

Does the child plan keep package, host, and backend responsibilities separate?

Does it preserve current support behavior before changing transport or auth authority?

Does it add tests at the package boundary and at the `apps/web` integration boundary?

Does it document any new external setup in active docs, not chat memory?

Does it avoid using Convex local mode?

Does it avoid broad changes to the existing Telegram Support Bot Program unless the slice intentionally updates backend truth?

## Acceptance Review Bar

A child slice is acceptable only if a later worker can tell which files belong to the package, which files belong to the host app, what validation was run, and what auth/session assumptions remain.
