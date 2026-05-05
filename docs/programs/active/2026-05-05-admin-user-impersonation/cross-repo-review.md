---
title: Cross Repo Review
summary: Risk review for the Admin User Impersonation Program.
docType: program_cross_repo_review
status: active
read_when:
  - Reviewing impersonation plans for security, audit, or release risk.
---

# Cross Repo Review

## Security Risks

The central risk is confusing effective subject with real actor. Customer-facing authorization should use the customer subject, while audit and policy must preserve the admin actor. Any helper that returns only one user id is unsafe for support-mode writes.

The impersonation start path must not trust client-provided authority. The server must verify the current Clerk user email before creating a Clerk actor token.

Target-user lookup must avoid turning public product APIs into arbitrary user data access. Admin search can exist behind an admin-only boundary, but ordinary Convex functions should not accept customer ids from the browser to simulate impersonation.

## Product And UX Risks

The support-mode state must be persistent and unmistakable. An account-menu-only label is easy to miss after navigating through workspace screens.

Stopping support mode must end the actor-token session, not merely clear local UI state.

The UI should not rewrite every user-facing identity display to say Parker. Customer-facing surfaces should show the customer view, and the support bar should carry the admin context.

## Data And Audit Risks

Existing tables mostly store one `clerkUserId`. That is correct for owned customer state but insufficient for support-mode provenance. An append-only audit model should capture actor, subject, reason/session metadata, function or route name, result, and changed ids where practical.

Provider state can outlive the support session. Billing, Clerk, GitHub, Codex, PostHog, and notification paths need explicit policy before support-mode writes are considered production-ready.

## Validation Risks

Unit tests alone can miss the session handoff. At least one browser-level proof should demonstrate start, visible support bar, customer workspace rendering, audited action, and stop.

Provider setup drift can break Convex actor visibility without compile failures. The setup docs should name the Clerk JWT template change and the failure mode when it is missing.

## Scope Risks

Do not let this become a broad admin platform. The first production goal is one super admin support-mode feature. Multi-admin roles, support case management, and broad customer analytics can be separate programs if needed.
