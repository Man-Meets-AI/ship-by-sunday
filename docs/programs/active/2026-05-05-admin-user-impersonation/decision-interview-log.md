---
title: Decision Interview Log
summary: Locked planning-interview decisions for the Admin User Impersonation Program.
docType: program_decision_log
status: active
read_when:
  - Checking the resolved design choices for admin user impersonation.
  - Authoring child ExecPlans from the impersonation Program.
---

# Decision Interview Log

This file records decisions locked during the 2026-05-05 design-tree interview. Treat these as Program inputs unless a later Program update explicitly supersedes them.

## Admin Authority

Admin impersonation is gated by an environment-backed allowlist, initially containing only `me@parkerrex.com`.

The code should expose a narrow helper such as `requireImpersonationAdmin()` and should not hardcode Parker's email directly into scattered runtime checks.

Configured admin emails are excluded from the eligible customer picker and rejected by the start boundary if request parameters are tampered with.

Impersonation also requires an explicit feature flag or kill switch such as `ADMIN_IMPERSONATION_ENABLED`.

`ADMIN_IMPERSONATION_EMAILS` is required whenever impersonation is enabled, with no permissive local default.

Local, preview, and production can all support impersonation when explicitly configured. Missing required config should produce a setup error rather than a partially working feature.

V1 becomes available immediately when `ADMIN_IMPERSONATION_ENABLED=true` and `ADMIN_IMPERSONATION_EMAILS` are configured. No extra database rollout stage is required.

Impersonation enablement is evaluated from server runtime environment, not client or build-time env.

The kill switch is the emergency invalidation path. There is no separate invalidate-all UI in v1.

Disabling the feature invalidates active sessions rather than allowing resume later.

Kill-switch invalidation is lazy when observed, not an eager rewrite or scheduled sweep.

Support UI shows a distinct disabled/kill-switch state.

Audit/history distinguishes kill-switch invalidation from ordinary expiry using session status `invalidated` plus reason `feature_disabled`.

## Customer Selection

The admin start surface is `/admin/impersonation`, linked from Parker's account menu or header controls.

V1 should show an eligible customer picker/list instead of relying on a raw email field. The list is Clerk-first: any existing non-admin Clerk user is eligible to impersonate.

In this product, Clerk users are expected to exist only after purchase. If a Clerk user exists, product access and workspace records are expected invariants.

Convex can still be checked server-side for setup integrity. Missing expected access or workspace state does not block impersonation; it is flagged as a setup-integrity issue and recorded on the impersonation session.

The list uses server-side Clerk pagination/search, optimized for email search. Do not load all customers into the browser.

Email is the primary customer identity in the picker and support bar. Name and avatar are optional secondary context when Clerk has them.

Customer search supports partial email search only in v1.

The picker shows a paginated recent-customer list initially, sorted by most recently created Clerk users, then filters by partial email search.

Setup-integrity checks run after a customer is selected, not inline for every list row.

Final confirmation waits for integrity checks to finish. If checks fail due to an internal error, Parker can proceed only with a visible warning that integrity could not be verified, and that warning is snapshotted into the session.

## Reason Capture

Every impersonation session requires a freeform reason before start. The reason exists so support/debugging episodes can later be analyzed and used to understand what customers needed help with.

Do not add a structured category in v1.

The reason is 10-500 characters, immutable after session start, and shown with helper text warning not to paste secrets, tokens, private repo contents, sensitive stack traces, or unnecessary personal data.

The support bar shows a truncated reason with the full reason available on demand.

The start confirmation says customers are not notified and actions are recorded in the support audit log.

Starting impersonation requires an explicit final confirmation. The final confirmation CTA is `Start impersonating customer`.

## Session Model

Create both `impersonationSessions` and `impersonationAuditEvents`.

The `impersonationSessions` record is created server-side before minting the Clerk actor token. Every audited impersonated write must link to this session id.

Use a secure httpOnly app cookie as the practical session-id bridge. Also include non-secret `impersonationSessionId` in the Clerk actor claim when creating the actor token if Clerk accepts it cleanly.

If the actor-claim session id and app cookie session id disagree, fail closed: treat support mode as invalid, block writes, show an integrity error, and require stop/restart.

Sessions expire automatically after 2 hours. Expiry is lazy in backend helpers for v1; no scheduled cleanup job is required.

Expired sessions block writes and require a new session with a new reason. Do not auto-extend.

Parker cannot directly switch customers while already impersonating. Stop first, then start a new session.

If Parker closes the tab or signs out without stopping, backend expiry handles the abandoned session. Do not rely on browser unload events.

Multi-tab use is allowed within one impersonation session. All tabs share the same session id, and writes are audited into the same `impersonationSessions` record.

V1 relies on next-load or next-action detection across tabs. Do not add dedicated cross-tab sync.

Session status is an explicit enum: `starting`, `active`, `stopped`, `expired`, `start_failed`, and `invalidated`.

## Stop Behavior

Stopping impersonation must close the Convex session record and end the Clerk actor-token session.

If either side fails, prefer safety: mark the local support session unusable and instruct Parker to fully sign back in or restart support mode rather than leaving an apparently valid session.

The stop CTA is `Stop impersonating`.

`Stop impersonating` is one-click with no extra confirmation.

After stopping, Parker lands on `/admin/impersonation`, where the just-stopped session is visible in history.

Starting impersonation lands Parker on the customer's `/workspace` home.

Preserve the admin form draft when start fails.

Post-confirmation start failures are audited. Do not create customer-linked audit events for unauthenticated or non-admin attempts.

## UI Scope

Impersonation UI and behavior apply only to authenticated workspace/admin routes in v1.

The active support bar appears globally above the authenticated workspace shell. It shows customer email, truncated reason, time remaining, and a prominent stop action.

The bar uses a persistent high-contrast warning-style treatment: severe enough to be unmistakable, but compact enough to keep the app usable.

Render the support bar from server-validated initial status with client-side countdown and stop behavior layered on.

The support bar appears on both workspace and admin pages while impersonating.

`/admin/impersonation` stays reachable during impersonation but is locked to current-session controls until Parker stops.

Expired or mismatched support mode blocks writes but does not block normal navigation.

Add a shared support-mode status read model for UI and route decisions. It should cover disabled, misconfigured, not-admin, normal, active, expired, stopped, invalid mismatch, and unsupported Clerk Dashboard impersonation states.

The client status payload is narrow and UI-safe. It must not expose raw actor claims, cookie values, or session internals.

Display customer email from the session snapshot and cross-check against Clerk for integrity. If they disagree, treat it as a mismatch and block writes.

The compact support bar omits Parker's admin email. Actor email can appear in details/history.

The impersonation reason is admin-only internal data and is never customer-visible.

## Writes, Side Effects, And Audit

Normal in-app customer state changes can be allowed only after they have support-mode audit coverage.

V1 allowed audited writes are limited to product-state and customer-setup families:

- workspace setup/profile/intake edits
- lesson/course progress changes
- generated codebase workflow state changes that stay inside Convex
- dismissing or retrying in-app setup steps
- support notes and session audit records

Unclassified writes fail closed while impersonating with a clear message that the action is unavailable until support-mode audit coverage exists.

High-impact external side effects are blocked in v1, including Stripe Checkout or billing changes, Clerk account/email changes, managed GitHub mutations, Codex account operations, and outbound customer notifications.

Customer artifact downloads are allowed while impersonating if the customer can download them, but every download event is audited.

Internal generation or regeneration jobs are allowed when they stay within Ship by Sunday's internal Convex/workflow state. Generation paths that touch blocked external side effects are blocked.

Customer intake/profile answers can be edited through the same UI/actions the customer can use, and each write is audited.

Destructive deletes are blocked while impersonating.

Narrow non-destructive repair actions can be allowed when audited. Broad reset, wipe, recreate, or workspace-destructive operations are blocked.

Support mode never reveals customer-connected secrets or tokens. It can show derived status, scopes, timestamps, and error codes when needed.

Customer repository operations are blocked while impersonating, including branch creation, PR creation, CI reruns, pushes, merges, or proof commands. Support mode can view status and error metadata.

Customer-facing outbound notifications are blocked while impersonating.

Billing and checkout UI remains visible so Parker can see the customer experience, but billing/checkout actions are blocked and audited.

Known blocked UI actions should be disabled with a support-mode reason, and the backend must still reject and audit attempts.

Every impersonation lifecycle event and every write attempt is audited. Read-only page-view logging is skipped in v1.

Blocked actions are also audited with result `blocked`, stable action identifier, actor, subject, session id, and block reason.

Audit writes use stable internal action identifiers such as `workspace.updateSetup` or `stripe.checkout.blockedDuringImpersonation`, not display labels.

Changed record ids should be stored when practical. Do not store full before/after document snapshots in v1.

Valid session records are required for writes. Read-only customer views may still render from Clerk while the support bar forces stop/restart on expired or mismatched sessions.

Generated or downloaded artifacts are not modified during impersonation. Audit the download instead.

Audit events include request metadata when available, but not raw IP in v1. Store `requestId`, `userAgent` when available, and optional `ipHash` only if a deliberate hashing helper/salt is added.

Audit event result is an explicit enum: `success`, `blocked`, and `failed`.

Audit events use both a broad fixed `eventType` enum and a specific stable `actionId`.

Broad event types include `session_started`, `session_stopped`, `session_expired`, `session_invalidated`, `write_attempted`, `download_attempted`, `external_action_blocked`, and `start_failed`.

Do not add arbitrary audit detail blobs. Use explicit structured metadata fields such as `changedRecordIds`, `blockReason`, `failureReason`, `requestId`, `userAgent`, `ipHash`, and `setupIntegrityIssues`.

Setup-integrity issues use fixed enum values such as `missing_product_access_grant`, `missing_workspace_project`, `checkout_claim_mismatch`, and `integrity_check_failed`.

Block reasons use fixed enum codes, including `support_session_expired`, `support_session_mismatch`, `unsupported_clerk_dashboard_impersonation`, `unclassified_write`, `external_side_effect_blocked`, `destructive_action_blocked`, `customer_repository_operation_blocked`, `customer_notification_blocked`, `billing_action_blocked`, and `secret_access_blocked`.

Failure reasons use fixed enum codes with `unexpected_error` fallback. Known examples include `clerk_actor_token_failed`, `session_cookie_failed`, `session_handoff_failed`, `convex_session_create_failed`, `convex_audit_write_failed`, and `integrity_check_failed`.

Support mode preserves customer authorization exactly. It does not grant extra access. If the customer cannot access something, Parker should see that same denial.

Entitlement or access repair stays outside impersonation as a separate admin repair workflow with its own audit and confirmation.

## Analytics And Training Data

Suppress ordinary PostHog/customer analytics while impersonating and rely on Convex impersonation audit for support-mode data.

Impersonation audit and reason data are internal support/debugging data usable for product analysis and training. Do not store secrets or sensitive customer payloads in audit fields.

Retain impersonation audit and session records indefinitely in v1. No automatic deletion.

Do not automatically notify customers about impersonation sessions in v1.

## History

V1 includes a minimal admin-only impersonation history list with customer email, reason, status, started/stopped/expired time, and blocked action count.

History is read-only. There is no resume or reopen action.

History supports expanding a session to view audit events.

History includes post-confirmation failed start sessions with status `start_failed`.

## Release Proof

V1 release proof covers one complete happy path and important safety failures:

- admin sees `/admin/impersonation`
- non-admin gets 404 for the page
- Parker selects an eligible customer and enters a valid reason
- integrity checks snapshot into the session
- start lands on customer `/workspace`
- support bar is visible with customer email, reason preview, time remaining, and stop action
- one allowed audited in-app write succeeds
- one blocked action is disabled or rejected and audited
- one artifact download is audited
- stop returns Parker to `/admin/impersonation`
- history shows the session and expandable audit events

Unit and integration tests can mock Clerk, but v1 requires at least one real Clerk actor-token proof in a configured non-production environment before production enablement.

The real-provider proof uses a dedicated eligible test customer account, not a real customer.

Document the dedicated test customer and provider setup in internal operator/release docs, including Clerk user, environment, required entitlement/workspace state, and verification steps.

Production enablement requires a non-destructive post-deploy smoke checklist.

Production smoke uses a dedicated internal production test customer, not a real customer.

## Implementation Split

Split the original first implementation slice into two smaller ExecPlans.

Slice 1 is foundation/schema/provider contract: environment gate, admin helper, session/audit schema, actor claim parsing, status model, kill-switch behavior, and provider docs.

Slice 2 is start/stop minimal UI proof: `/admin/impersonation`, picker, reason, actor-token handoff, bar, stop, and history skeleton.

## Unsupported Clerk Dashboard Impersonation

Raw Clerk Dashboard impersonation is unsupported for product support.

If the app detects a Clerk actor claim without a valid app-managed `impersonationSessions` record and session-id bridge, it should show an integrity warning and block writes until Parker stops and restarts through `/admin/impersonation`.

Operator docs must explicitly prohibit Clerk Dashboard impersonation for customer support because it bypasses reason capture, session bridge, and Convex audit.

## Integrity Warnings

The admin impersonation page should show pre-start setup-integrity warnings when expected customer setup is missing or inconsistent, including missing product access grant, missing workspace project, or checkout claim mismatch.

Integrity warnings are not blockers. They are shown before start and snapshotted into the `impersonationSessions` record for later analysis.

Integrity warnings are read-only in v1. Do not add repair buttons or repair actions to the warning UI.

## Admin Route Responses

Signed-in non-admin access to `/admin/impersonation` returns 404.

Unauthenticated page requests follow normal sign-in behavior.

Admin API and server-action boundaries return 403 for signed-in non-admin callers without sensitive admin details.

API and server-action boundaries return 401 for unauthenticated callers rather than redirects.
