---
title: Admin Impersonation Foundation Schema And Provider Contract
status: complete
created_at: 2026-05-05
completed_at: 2026-05-07
summary: Build the backend, provider, and documentation foundation that makes Clerk actor-token support mode safe to implement in the UI.
post_build_recap: Added explicit admin impersonation env gating, allowlisted-admin classification, Convex session/audit schema and handlers, actor-claim parsing, UI-safe support-mode status, fail-closed write policy, provider docs, generated Convex API bindings, and focused tests.
program_id: admin-user-impersonation
planning_brief: docs/programs/active/2026-05-05-admin-user-impersonation/planning-brief-1.md
read_when:
  - Resuming the first admin impersonation implementation slice.
  - Changing support-mode auth, Convex schema, audit, or provider setup.
  - Validating the foundation before the start/stop UI slice.
---

# Admin Impersonation Foundation Schema And Provider Contract

This is a living execution plan. It captures the first implementation slice for admin user impersonation: the backend, provider, schema, status, and documentation contract that later UI and write-policy slices will depend on.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Parker needs a safe support mode that can later let him enter a customer's session, debug what they see, and act within their permissions. This first slice deliberately does not build the full `/admin/impersonation` browser flow. It creates the trusted foundation: explicit environment gating, a narrow admin authority helper, Convex tables for impersonation sessions and audit events, actor/subject/session parsing, a support-mode status model, kill-switch behavior, and operator docs for Clerk and Convex setup.

After this slice, the app should have a testable contract that says when impersonation is enabled, who is allowed to use it, how support sessions and audit events are shaped, how raw Clerk Dashboard impersonation is detected as unsupported, and how later write paths must fail closed if a valid app-managed session is missing.

## Progress

- [x] 2026-05-05 EDT: Created this ExecPlan from `docs/programs/active/2026-05-05-admin-user-impersonation/planning-brief-1.md`.
- [x] 2026-05-07: Read root `AGENTS.md`, `apps/web/AGENTS.md`, `docs/release-workflow.md`, `apps/web/convex/_generated/ai/guidelines.md`, the Convex auth skill, official Clerk impersonation/session-token docs, official Convex Clerk/auth-in-functions docs, and this ExecPlan before editing.
- [x] 2026-05-07: Implemented server runtime feature gating and verified-email admin allowlist helpers under `apps/web/platform/admin-impersonation/`.
- [x] 2026-05-07: Implemented Convex impersonation validators, schema tables, model helpers, generated API bindings, and narrow status/session/audit functions under `apps/web/convex/impersonation*`.
- [x] 2026-05-07: Implemented the UI-safe support-mode status model and fail-closed write classification for unsupported dashboard impersonation, missing sessions, expired sessions, mismatches, kill-switch invalidation, and unclassified writes.
- [x] 2026-05-07: Documented Clerk/Convex provider setup, env ownership, `{{session.actor}}` JWT template setup, app-managed session pointer, unsupported Clerk Dashboard impersonation, verification, and failure modes in `docs/internal/admin-impersonation.md`.
- [x] 2026-05-07: Added focused config, admin, status, and Convex model tests; ran codegen, focused tests, docs/plan/program validation, app lint/format/typecheck, repo gates, and `git diff --check`.

## Surprises & Discoveries

- 2026-05-07: Clerk's current impersonation docs confirm that actor tokens place actor metadata in the `act` claim, and custom JWT templates must expose `{{session.actor}}` for Convex to see it. Convex auth docs confirm `ctx.auth.getUserIdentity()` returns the fields configured in the Clerk integration.
- 2026-05-07: `bunx --cwd apps/web convex codegen` is not the right local invocation here because Bun treated `apps/web` as a package target. Running `bunx convex codegen` from `apps/web` reached hosted Convex dev and generated bindings.
- 2026-05-07: Hosted Convex rejected the first session index name because Convex identifiers must be 64 characters or fewer. The implementation keeps the same indexed fields and uses `by_actor_and_subject_and_status_and_updated_at`.

## Decision Log

Decision: Use Clerk actor tokens, not a custom impersonation auth layer.
Rationale: Clerk already represents impersonation as a customer session with an actor claim. The app should preserve Clerk as the session owner and use Convex for actor-aware audit and policy.
Date: 2026-05-05

Decision: Split the foundation from the start/stop UI proof.
Rationale: The first attempt to scope this slice included schema, provider setup, actor-token handoff, support bar, and history UI. Splitting lets the backend/provider contract be tested before UI code depends on it.
Date: 2026-05-05

Decision: Require explicit runtime environment setup.
Rationale: Support mode must never default open. The server must require both a kill switch such as `ADMIN_IMPERSONATION_ENABLED=true` and a populated `ADMIN_IMPERSONATION_EMAILS` allowlist whenever the feature is enabled.
Date: 2026-05-05

Decision: Fail closed for writes when support-mode state is missing, expired, mismatched, disabled, or unsupported.
Rationale: Read-only customer visibility can come from Clerk's customer session, but product writes need an app-managed session and audit trail. Raw Clerk Dashboard impersonation is unsupported because it bypasses reason capture and the session bridge.
Date: 2026-05-05

## Outcomes & Retrospective

This plan is complete. The foundation now has explicit `ADMIN_IMPERSONATION_ENABLED` and `ADMIN_IMPERSONATION_EMAILS` parsing, verified-email admin classification, additive `impersonationSessions` and `impersonationAuditEvents` tables, fixed enum validators, actor-claim parsing for Clerk's `act` claim, UI-safe support-mode status, lazy mutation-path expiry and kill-switch invalidation, append-only audit helpers, and an internal fail-closed write policy that blocks unclassified support-mode writes.

No clickable `/admin/impersonation` UI shipped in this slice. The next slice should create the app-managed start/stop browser flow that creates an `impersonationSessions` row, mints the Clerk actor token with `impersonationSessionId` in the actor object, renders the persistent support-mode bar, and proves stop behavior.

## Context and Orientation

The web app lives under `apps/web`. Clerk is the auth provider. Convex is the backend. `apps/web/app/layout.tsx` installs Clerk, `apps/web/platform/convex/convex-client-provider.tsx` bridges Clerk into Convex, and `apps/web/convex/auth.config.ts` configures Clerk as a Convex auth provider.

Convex product ownership is currently single-principal. Helpers such as `requireGrantedProductAccess` in `apps/web/convex/access/model.ts` read `ctx.auth.getUserIdentity()` and use `identity.subject` as the Clerk user id. Tables such as `productAccessGrants`, `projectDefinitions`, `codebaseWorkflowStates`, `workspaceProjects`, lesson state, and Codex state store customer ownership by `clerkUserId`.

This slice should preserve that model. During impersonation, Clerk's active session subject is the customer, so ordinary customer authorization still sees the customer. The new foundation adds actor and session awareness for audit and write policy.

Before changing Convex code, read `apps/web/convex/_generated/ai/guidelines.md`. Do not use Convex local mode. Validate against the repo's hosted Convex development workflow and focused tests.

The first place for shared implementation code should be a feature-specific support-mode boundary, not scattered checks. A reasonable shape is:

    apps/web/platform/admin-impersonation/
    apps/web/convex/impersonation/
    apps/web/convex/impersonation.ts
    docs/internal/admin-impersonation.md

Use the existing repo style if current code suggests a better exact path while implementing. Keep names domain-specific. Avoid generic files named `utils`, `helpers`, or `misc`.

### In Scope

Implement server runtime feature gating for admin impersonation. Add a narrow helper that can decide whether the current Clerk user is an impersonation admin based on verified email and runtime env.

Add Convex validators, schema fields, and model helpers for `impersonationSessions` and `impersonationAuditEvents`. The schema must use explicit enums for session status, audit event type, audit result, setup-integrity issue, block reason, and failure reason.

Add actor/session parsing helpers that can read the Clerk actor claim exposed through the Clerk `convex` JWT template. The helper must return the effective customer subject, optional actor metadata, and optional `impersonationSessionId`.

Add a support-mode status read model that produces a narrow UI-safe status shape for later use by the support bar, admin page, and blocked-action UI. It must not expose raw actor claims, cookie values, or token internals.

Add lazy expiry and kill-switch invalidation behavior at the model/helper layer. Disabling the feature should make active sessions unusable and lazily record invalidation with reason `feature_disabled` when observed.

Add operator docs that name the required environment variables, Clerk actor-token contract, Clerk `convex` JWT template actor claim, unsupported raw Clerk Dashboard impersonation, and verification/failure modes.

Add focused tests for the new config/admin helper, Convex model helpers, validators, status model, expiry, mismatch handling, unsupported Clerk Dashboard impersonation, and kill-switch behavior.

### Out Of Scope

Do not build the full `/admin/impersonation` page in this slice. Do not build the eligible customer picker, final confirmation UI, actor-token browser handoff, support bar component, stop button, or history UI beyond any pure status/read-model contract needed for tests.

Do not classify every customer mutation or wrap all writes in this slice. Provide the shared model and block-reason contract, but leave mutation-by-mutation audit coverage for the later mutation audit and side-effect policy slice.

Do not add broad role management, multi-admin roles, customer notification emails, automatic audit deletion, an invalidate-all UI, scheduled cleanup jobs, or repair buttons for setup-integrity warnings.

Do not make raw Clerk Dashboard impersonation a supported path. If actor state exists without a valid app-managed session, the status model must report unsupported state and write policy must block.

Do not touch `.worktrees/`.

## Plan of Work

Start by adding a runtime config boundary for support mode. Create a feature-specific module under `apps/web/platform/admin-impersonation/` that parses `ADMIN_IMPERSONATION_ENABLED` and `ADMIN_IMPERSONATION_EMAILS` from server runtime env. It should return explicit states such as disabled, misconfigured, enabled, admin, and not-admin rather than loose booleans. A missing allowlist while enabled is misconfiguration. There is no permissive local default.

Add an admin authority helper that accepts the current Clerk identity shape used by server code and checks verified email against the allowlist. Keep the helper pure where practical so it can be unit-tested without live Clerk.

Next, add Convex validators and schema. Add feature-local validator exports under `apps/web/convex/impersonation/validators.ts` and, if useful, domain types under `apps/web/convex/impersonation/types.ts`. Update `apps/web/convex/schema.ts` with two new tables:

`impersonationSessions` stores one row per app-managed support session. It should include actor Clerk id/email, subject Clerk id/email, immutable reason, status, setup-integrity issues, started/updated/expires timestamps, optional stopped/failed/invalidated timestamps, optional failure reason, optional invalidation reason, and request metadata where available.

`impersonationAuditEvents` stores append-only session and action events. It should include session id, broad event type, stable action id, result, actor and subject ids/emails, optional changed record ids, optional block reason, optional failure reason, optional request id, optional user agent, optional ip hash, optional setup-integrity issues, and created timestamp. Do not add arbitrary JSON detail blobs or before/after snapshots.

Add indexes that match the first read paths: session lookup by actor/subject/status/update time, session lookup by subject/status/update time, audit events by session and created time, and audit events by result or event type if the history view will need it later. Keep indexes minimal and motivated by reads named in this plan.

Then add Convex model helpers under `apps/web/convex/impersonation/model.ts` and exported Convex functions in `apps/web/convex/impersonation.ts` only where needed. The helper layer should be able to create a starting session, mark start failure, mark active, mark stopped, lazily treat expired sessions as expired, lazily invalidate active sessions when the feature is disabled, append audit events, and compute a status result.

Implement fixed enums exactly enough for the locked Program decisions. Session status is `starting`, `active`, `stopped`, `expired`, `start_failed`, and `invalidated`. Audit result is `success`, `blocked`, and `failed`. Broad event types include `session_started`, `session_stopped`, `session_expired`, `session_invalidated`, `write_attempted`, `download_attempted`, `external_action_blocked`, and `start_failed`. Setup-integrity issues include `missing_product_access_grant`, `missing_workspace_project`, `checkout_claim_mismatch`, and `integrity_check_failed`. Block reasons include `support_session_expired`, `support_session_mismatch`, `unsupported_clerk_dashboard_impersonation`, `unclassified_write`, `external_side_effect_blocked`, `destructive_action_blocked`, `customer_repository_operation_blocked`, `customer_notification_blocked`, `billing_action_blocked`, and `secret_access_blocked`. Failure reasons include `clerk_actor_token_failed`, `session_cookie_failed`, `session_handoff_failed`, `convex_session_create_failed`, `convex_audit_write_failed`, `integrity_check_failed`, and `unexpected_error`.

Add an actor-claim parser. Clerk actor tokens put actor data into the session actor claim. The Clerk `convex` JWT template must include that actor claim so Convex can see it. The parser should tolerate absent claims, malformed claims, and actor claims missing `impersonationSessionId`. It should fail closed for writes when the actor claim indicates impersonation but no valid app-managed session exists.

Add a UI-safe status read model in the platform or Convex boundary. It should represent disabled, misconfigured, not-admin, normal, active, expired, stopped, invalid mismatch, kill-switch disabled, and unsupported Clerk Dashboard impersonation. It should include only display-safe fields such as state, customer email, reason, time remaining, integrity warnings, and start/stop eligibility. It must not return raw cookies, raw token claims, or internal session pointer details.

Document provider setup in `docs/internal/admin-impersonation.md`. The doc must say what to configure in each environment, where env values go, how to configure Clerk's Convex JWT template to expose the actor claim, why Clerk Dashboard impersonation is not supported for support work, how to verify the foundation, and what failure looks like when env vars or the actor claim are missing.

Finally, add focused tests. Prefer pure unit tests for config parsing and status modeling. Use the existing Convex test style in `apps/web/tests/unit/codex-convex.test.ts` for handler/model tests with mocked `ctx.auth` and `ctx.db`. Keep tests narrow to this slice.

## Milestones

The first milestone is runtime configuration and admin authority. At the end, tests should prove that missing env disables the feature, enabled-without-allowlist is misconfigured, enabled-with-allowlist permits only matching verified admin emails, signed-in non-admins are classified as not admin, and no local environment defaults to permissive access.

The second milestone is Convex schema and domain helpers. At the end, the schema has `impersonationSessions` and `impersonationAuditEvents`, validators enforce fixed enum values, and model tests prove session creation, immutable reason bounds, audit append, expiry, start failure, stop, invalidation, and changed-record metadata behavior.

The third milestone is actor/session/status policy. At the end, tests prove the actor parser handles absent, valid, malformed, and missing-session actor claims; raw Clerk Dashboard impersonation is classified as unsupported; actor-claim/cookie mismatches are invalid; expired or disabled sessions block writes; and read-only UI status is narrow and safe.

The fourth milestone is provider/operator documentation and closeout. At the end, `docs/internal/admin-impersonation.md`, this ExecPlan, and the Program packet name the implemented contract, provider setup, verification commands, and remaining next slice.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Before editing, read the required implementation context:

    sed -n '1,220p' AGENTS.md
    sed -n '1,220p' apps/web/AGENTS.md
    sed -n '1,220p' docs/release-workflow.md
    sed -n '1,220p' apps/web/convex/_generated/ai/guidelines.md
    sed -n '1,260p' docs/exec-plans/completed/2026-05-05-admin-impersonation-foundation-schema-provider-contract.md

Inspect current auth and ownership code before writing:

    sed -n '1,220p' apps/web/platform/auth/convex-auth.ts
    sed -n '1,220p' apps/web/platform/access/product-access.ts
    sed -n '1,220p' apps/web/convex/auth.config.ts
    sed -n '1,260p' apps/web/convex/schema.ts
    sed -n '1,260p' apps/web/convex/access/model.ts

Implement the platform config/admin helper under `apps/web/platform/admin-impersonation/`. Add focused unit tests under `apps/web/tests/unit/` with names such as `admin-impersonation-config.test.ts` and `admin-impersonation-admin.test.ts`.

Implement Convex validators, schema, model helpers, and any narrow exported functions under `apps/web/convex/impersonation/` and `apps/web/convex/impersonation.ts`. Add focused tests under `apps/web/tests/unit/`, for example `convex-impersonation.test.ts`.

Implement the support-mode status read model and tests, for example `apps/web/tests/unit/admin-impersonation-status.test.ts`. If the model needs request metadata, reuse the existing request id convention from `apps/web/platform/observability/request-id.ts` and store user agent only when available. Do not store raw IP in v1.

Create `docs/internal/admin-impersonation.md` with environment setup, Clerk/Convex JWT setup, unsupported Clerk Dashboard impersonation policy, verification, and failure modes.

Update `docs/programs/active/2026-05-05-admin-user-impersonation/program.md` after implementation with exact files changed, validation evidence, and the next recommended slice. Keep this ExecPlan current during implementation.

## Validation and Acceptance

Acceptance for this slice is a testable foundation, not a clickable impersonation UI. A maintainer should be able to read the new docs and understand exactly which env vars and Clerk JWT template changes are required. Tests should prove the feature is unavailable unless explicitly enabled and allowlisted, support sessions and audit events use explicit schema contracts, malformed or unsupported actor sessions fail closed for writes, expired and kill-switch-disabled sessions become unusable, and UI status never exposes raw token or cookie internals.

The Convex schema must compile and generated Convex types must stay consistent with the repo workflow. If changing Convex schema requires generated file updates, perform the repo's normal generated update path and include the result in the plan progress.

No release claim should be made from this slice alone. Real Clerk actor-token browser proof belongs to the later start/stop UI proof slice, after this foundation exists.

### Test Commands

Run focused tests first from the repository root:

    bun run --cwd apps/web test:unit -- tests/unit/admin-impersonation-config.test.ts tests/unit/admin-impersonation-admin.test.ts tests/unit/admin-impersonation-status.test.ts tests/unit/convex-impersonation.test.ts

Run plan and docs validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-admin-impersonation-foundation-schema-provider-contract.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-admin-impersonation-foundation-schema-provider-contract.md docs/programs/active/2026-05-05-admin-user-impersonation docs/internal/admin-impersonation.md
    git diff --check

Before marking the plan complete after code changes, run the repo completion gates unless a concrete blocker is recorded in this plan:

    bun run format
    bun lint
    bun typecheck

Expected success means every command exits with code 0. If a command fails because a named test file changed during implementation, update the command list to the actual focused test files and record why.

Validation passed on 2026-05-07:

    bunx convex codegen
    bun run --cwd apps/web test:unit -- tests/unit/admin-impersonation-config.test.ts tests/unit/admin-impersonation-admin.test.ts tests/unit/admin-impersonation-status.test.ts tests/unit/convex-impersonation.test.ts
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-admin-impersonation-foundation-schema-provider-contract.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-admin-impersonation-foundation-schema-provider-contract.md docs/programs/active/2026-05-05-admin-user-impersonation docs/internal/admin-impersonation.md
    bun run format
    bun lint
    bun run --cwd apps/web lint
    bun run --cwd apps/web format:check
    bun typecheck
    git diff --check

## Idempotence and Recovery

All schema and helper changes should be additive for this first slice. If a migration is required, stop and either update this plan with a migration strategy or create a separate migration plan. Do not delete or rewrite existing customer-owned records.

The config helper should be safe to call repeatedly and should not cache env in a way that prevents runtime kill-switch changes from being observed on the server. Tests should reset any mutated environment state after each case.

Audit event insertion should be append-only. If an audit insert fails during a support-mode write in later slices, the safe policy is to fail the customer-impacting write rather than write without audit. This slice should encode that policy in helpers and tests where possible.

If provider setup is missing, status should report misconfigured or unsupported state rather than partially enabling writes. Recovery is to configure env and Clerk JWT template correctly, then retry.

If broad gates fail because of unrelated dirty worktree changes, do not revert unrelated files. Record the exact failure and continue only after determining whether the failure belongs to this slice.

## Artifacts and Notes

Important Program artifacts:

    docs/programs/active/2026-05-05-admin-user-impersonation/program.md
    docs/programs/active/2026-05-05-admin-user-impersonation/planning-brief-1.md
    docs/programs/active/2026-05-05-admin-user-impersonation/decision-interview-log.md

Important implementation anchors:

    apps/web/platform/admin-impersonation/config.ts
    apps/web/platform/admin-impersonation/status.ts
    apps/web/convex/impersonation.ts
    apps/web/convex/impersonation/model.ts
    apps/web/convex/impersonation/validators.ts
    apps/web/convex/impersonation/types.ts
    apps/web/platform/auth/convex-auth.ts
    apps/web/platform/access/product-access.ts
    apps/web/convex/auth.config.ts
    apps/web/convex/schema.ts
    apps/web/convex/access/model.ts
    apps/web/platform/observability/request-id.ts
    docs/internal/admin-impersonation.md

Provider setup summary for docs: Clerk actor tokens identify Parker as the actor and the customer as the active session subject. The Clerk `convex` JWT template must expose the actor claim so Convex can distinguish actor from subject. Raw Clerk Dashboard impersonation is not supported for customer support because it bypasses the app-managed reason, session id bridge, and Convex audit trail.

## Interfaces and Dependencies

This slice depends on Clerk auth, Clerk actor-token claims, the Clerk `convex` JWT template, Convex hosted auth identity, Convex schema and validators, server runtime environment variables, and existing `clerkUserId` customer ownership.

The required environment interface is:

    ADMIN_IMPERSONATION_ENABLED
    ADMIN_IMPERSONATION_EMAILS

The required session pointer contract is:

    secure httpOnly app cookie in the later UI slice
    optional Clerk actor claim field named impersonationSessionId
    Convex `impersonationSessions` row created by the app before actor-token handoff

The support-mode status interface must be narrow and UI-safe. It can return state, customer email, reason text, time remaining, integrity warnings, and start/stop eligibility. It must not return raw cookies, raw JWT claims, raw actor payloads, or secret material.
