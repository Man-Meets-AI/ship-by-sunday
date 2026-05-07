---
program_id: admin-user-impersonation
title: Admin User Impersonation
status: active
created_at: 2026-05-05
completed_at: null
summary: Add Clerk actor-token impersonation so the sole super admin can view and act as customers with a visible support-mode UI, Convex-aware audit logging, and release-safe boundaries.
post_build_recap: null
read_when:
  - Planning or implementing admin impersonation.
  - Updating Clerk, Convex auth, customer support controls, audit logging, or side-effect policy.
  - Validating impersonation release proof or support-mode UI.
---

# Admin User Impersonation

This Program is a living initiative document. Update it whenever a child slice lands, the ordering changes, or validation changes the durable truth.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Ship by Sunday needs one super admin, `me@parkerrex.com`, to enter a customer session, see the product exactly as that customer sees it, reproduce customer-specific bugs, and perform permitted customer actions on their behalf.

The right foundation is Clerk actor-token impersonation, not a homegrown replacement for auth. Clerk owns the effective user session; Convex continues to receive the customer as `identity.subject`; the app exposes a persistent impersonation bar; and Ship by Sunday records the real admin actor wherever impersonation affects product state.

The initiative is moving in the right direction when the support flow has no custom auth fork, only the configured super admin can start it, every impersonated session is visibly marked, Convex can tell actor from subject for audit-sensitive writes, risky external side effects have explicit policy, and the release proof covers start, act, audit, and stop flows.

## Program Inputs

The durable packet artifacts for this Program live in `docs/programs/active/2026-05-05-admin-user-impersonation/`.

The local codebase research is recorded in `research-pass-codebase-auth-boundaries.md`. The provider and UI-pattern research is recorded in `research-pass-clerk-convex-impersonation-primitives.md`. The normalized implementation direction is `normalized-pass-clerk-actor-token-support-mode.md`. The locked interview decisions are recorded in `decision-interview-log.md`. The initiative decision is in `converged-decision-packet.md`. Ordering is in `dependency-graph.md` and `plan-split-recommendation.md`. Risk review is in `cross-repo-review.md`. The current immutable implementation brief is `planning-brief-1.md`, and `current-planning-brief.txt` points at that brief.

## Current State

The app currently uses Clerk for authentication and Convex for the backend. `ClerkProvider` wraps the app, `ConvexProviderWithClerk` passes Clerk auth to Convex, and Convex auth is configured through `apps/web/convex/auth.config.ts`.

Runtime ownership is still customer-subject-first. Convex helpers derive the viewer from `ctx.auth.getUserIdentity()`, and app state tables use `clerkUserId` as the owner key. The foundation slice added explicit admin impersonation runtime gates, a verified-email allowlist for `me@parkerrex.com`, `impersonationSessions`, `impersonationAuditEvents`, actor-claim parsing, UI-safe support-mode status, and fail-closed write policy helpers. There is still no `/admin/impersonation` start/stop UI and no persistent support-mode bar.

The workspace shell already has the right UI insertion points: `apps/web/app/(workspace)/_components/app-shell.tsx` for a persistent top bar and account/header components for an admin-only entry point. The backend has several mutation families that need actor-aware audit decisions before support mode can ship.

Clerk supports the needed provider primitive through actor tokens. Convex does not ship an impersonation template, but Convex can receive custom Clerk JWT claims when the Clerk Convex JWT template includes the actor claim. `docs/internal/admin-impersonation.md` now owns the setup contract for `ADMIN_IMPERSONATION_ENABLED`, `ADMIN_IMPERSONATION_EMAILS`, the Clerk `convex` JWT template `act` claim, app-managed `impersonationSessionId`, unsupported raw Clerk Dashboard impersonation, and verification/failure modes.

## Progress

- [x] 2026-05-05: Ran a five-agent codebase research pass over identity, backend authorization, frontend session/UI, side effects/audit, and validation/release surfaces.
- [x] 2026-05-05: Verified provider direction with web research: Clerk actor tokens are the right primitive; Convex has no first-party impersonation template.
- [x] 2026-05-05: Created the Admin User Impersonation Program packet and selected the first foundation slice.
- [x] 2026-05-05: Locked the first interview decision set covering admin eligibility, customer selection, reason capture, session/audit model, expiry, stop behavior, UI scope, write blocking, analytics, and history.
- [x] 2026-05-05: Locked the second interview decision set covering raw Clerk Dashboard impersonation, allowed write families, downloads, internal generation, destructive actions, secrets, repository operations, billing UI, authorization, integrity warnings, environments, allowlist requirements, and the feature kill switch.
- [x] 2026-05-05: Locked the third interview decision set covering rollout availability, runtime env reads, support bar rendering, admin-page behavior during impersonation, multi-tab behavior, status read model, request metadata, retention, customer notification policy, start/stop UX, admin access responses, customer search behavior, integrity-check timing, and schema enums.
- [x] 2026-05-05: Locked the fourth interview decision set covering release proof, real Clerk provider proof, dedicated test customers, production smoke, kill-switch invalidation, and splitting the original first implementation slice into smaller foundation and UI proof ExecPlans.
- [x] 2026-05-07: Completed Slice 1 in `docs/exec-plans/completed/2026-05-05-admin-impersonation-foundation-schema-provider-contract.md`: env gating, admin allowlist classification, Convex session/audit schema, actor/session parsing, UI-safe support-mode status, mutation-path expiry and kill-switch invalidation, fail-closed unclassified write policy, provider docs, generated Convex API bindings, focused tests, and repo gates landed.

## Decision Log

Decision: Use Clerk actor tokens for impersonation.
Rationale: Clerk already supports impersonation as an authenticated session with an actor claim. This preserves provider-owned session semantics and avoids building a second identity layer.
Date: 2026-05-05

Decision: Make Convex actor-aware through the Clerk Convex JWT template.
Rationale: Convex should continue authorizing as the customer subject, while audit and policy code can inspect the real admin actor from the JWT claim.
Date: 2026-05-05

Decision: Keep the visible app identity as the customer, but make support mode unmistakable.
Rationale: The purpose is to experience the customer view. The persistent top bar should show `Impersonating customer@example.com`, include a stop action, and avoid pretending the admin is no longer responsible for the session.
Date: 2026-05-05

Decision: Gate impersonation to `me@parkerrex.com` initially.
Rationale: The current product has one super admin. A broader role system would add scope that is not needed for this support tool.
Date: 2026-05-05

Decision: Treat side effects as a first-class slice, not an afterthought.
Rationale: Acting as a customer can touch checkout, generated codebase workflows, Codex connections, managed GitHub, PostHog events, and notification surfaces. Those writes need explicit policy and audit before release.
Date: 2026-05-05

Decision: The first interview decisions are binding Program inputs.
Rationale: The planning interview resolved enough design branches that later ExecPlans should not re-litigate them. The detailed locked decisions live in `decision-interview-log.md`.
Date: 2026-05-05

Decision: The supported path is only the app-managed impersonation flow.
Rationale: Raw Clerk Dashboard impersonation bypasses reason capture, the Convex session record, the session-id bridge, and Ship by Sunday's audit trail. The app should detect unsupported actor sessions and block writes.
Date: 2026-05-05

Decision: Use explicit environment setup and a kill switch.
Rationale: Local, preview, and production should all be testable, but the feature must never default open. `ADMIN_IMPERSONATION_ENABLED` and `ADMIN_IMPERSONATION_EMAILS` make availability and authority explicit.
Date: 2026-05-05

## Slice Ledger

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-05-05-admin-impersonation-foundation-schema-provider-contract.md`: completed Slice 1 foundation/schema/provider contract.

No active child ExecPlan currently exists.

Completed Slice 1: Foundation/schema/provider contract. This slice added the environment gate, admin helper, Convex session/audit schema, actor-claim parsing, support-mode status model, kill-switch behavior, provider setup docs, generated Convex API bindings, and focused tests before UI handoff depends on them.

Recommended Slice 2: Start/stop minimal UI proof. This slice should add `/admin/impersonation`, eligible customer picker, reason capture, final confirmation, Clerk actor-token handoff, persistent support-mode bar, stop flow, read-only history skeleton, and browser proof.

Recommended Slice 3: Mutation audit and side-effect policy. This slice should classify customer-impacting mutations, record actor/subject/reason/session metadata, and block or confirm risky external side effects.

Recommended Slice 4: Release proof, docs, and operator workflow. This slice should document required Clerk configuration, prove the support journey, and wire the relevant release validation.

## Next Slice

No active child ExecPlan currently exists. The next recommended slice is Slice 2: Start/stop minimal UI proof. It should create a new versioned planning brief and child ExecPlan for `/admin/impersonation`, eligible customer picker, reason capture, final confirmation, Clerk actor-token handoff, persistent support-mode bar, stop flow, read-only history skeleton, and browser proof.

Boundary rules for the next slice: use the completed foundation instead of replacing it, do not replace Clerk session handling, do not add broad role management, do not fake Clerk user data in React, do not let public functions accept arbitrary target user ids, do not support raw Clerk Dashboard impersonation, and do not silently permit impersonated external side effects without audit metadata.

## Risks and Watchpoints

Clerk session subject changes to the customer during impersonation. Code that only asks "who is the viewer" will see the customer, which is desired for customer-facing behavior but insufficient for audit-sensitive writes.

The existing schema uses `clerkUserId` broadly. Support mode should work with that model by making the effective subject the customer, not by introducing parallel owner fields across every table.

The Convex JWT template must include the actor claim for backend audit. If that provider setup is missing, the UI may show support mode while Convex cannot record the admin actor.

External side effects need policy. Creating Stripe Checkout sessions, sending Clerk emails, mutating managed GitHub state, triggering Codex account operations, or emitting analytics as the customer can be misleading without explicit handling.

Support mode must be impossible to miss. A hidden toggle or account-menu-only state is not enough once the browser is inside a customer session.

Do not touch `.worktrees/`.

## Outcomes & Retrospective

This Program is active. The expected outcome is a production-ready support-mode feature where Parker can safely impersonate a customer, debug and act within that customer's permissions, stop impersonation cleanly, and later prove who acted on whose behalf.

The retrospective should be filled after all required slices land, including what the final side-effect policy allowed, what it blocked, and which provider setup became part of the maintained operating contract.

## Validation and Acceptance

At Program completion, impersonation must require an explicit feature flag and only emails in the environment-backed impersonation admin allowlist, initially `me@parkerrex.com`, can initiate impersonation. Non-admin users and unauthenticated requests must fail before an actor token is created.

An impersonated browser session must render the customer-owned workspace state, show a persistent high-contrast support bar with customer email, truncated reason, time remaining, and stop action, and provide a reliable stop path that ends the Clerk actor-token session and closes the Convex session record.

Convex must receive or derive actor, subject, and `impersonationSessions` id during impersonation. Customer-impacting writes performed in support mode must be attributable to the admin actor, customer subject, immutable reason, session, stable action identifier, result, and changed record ids where practical. Unclassified or blocked writes must be audited as blocked.

Provider setup must be documented where future maintainers will look, including the Clerk actor-token flow and the Convex JWT template actor claim.

Operator docs must state that raw Clerk Dashboard impersonation is unsupported for customer support because it bypasses Ship by Sunday's reason capture, session bridge, and audit trail.

Release proof must include one real Clerk actor-token proof in a configured non-production environment using a dedicated eligible test customer, plus a non-destructive post-deploy production smoke using a dedicated internal production test customer.

Validation should include focused unit tests for auth helpers and audit parsing, route/action tests for start and stop boundaries, Convex tests for actor-aware audit writes, UI tests for the persistent bar, at least one end-to-end browser proof of start and stop, `bun run programs:lint`, and the normal repo gates required for the touched implementation slices.

## Artifacts and Notes

Provider research anchors:

- Clerk impersonation guide: `https://clerk.com/docs/guides/users/impersonation`
- Clerk custom Next.js impersonation flow: `https://clerk.com/docs/nextjs/guides/development/custom-flows/account-updates/user-impersonation`
- Convex Clerk auth docs: `https://docs.convex.dev/auth/clerk`
- Convex custom auth integration docs: `https://docs.convex.dev/auth/advanced/custom-auth`

UI pattern anchors:

- Sigma impersonation docs: `https://help.sigmacomputing.com/docs/impersonate-users`
- Docebo impersonation docs: `https://help.docebo.com/hc/en-us/articles/360020125239-Impersonating-a-user`

Important repo anchors:

- `apps/web/platform/auth/convex-auth.ts`
- `apps/web/platform/admin-impersonation/config.ts`
- `apps/web/platform/admin-impersonation/status.ts`
- `apps/web/platform/access/product-access.ts`
- `apps/web/convex/auth.config.ts`
- `apps/web/convex/access.ts`
- `apps/web/convex/access/model.ts`
- `apps/web/convex/impersonation.ts`
- `apps/web/convex/impersonation/model.ts`
- `apps/web/convex/impersonation/validators.ts`
- `apps/web/convex/schema.ts`
- `apps/web/app/(workspace)/_components/app-shell.tsx`
- `apps/web/app/(workspace)/_components/app-shell-header-trailing.tsx`
- `apps/web/app/(workspace)/_components/app-shell-user-menu.tsx`
- `docs/internal/admin-impersonation.md`

Locked decision anchor:

- `decision-interview-log.md`

## Interfaces and Dependencies

The Program depends on Clerk session and actor-token APIs, the Clerk Convex JWT template, Convex hosted auth identity, existing `clerkUserId` ownership tables, workspace shell UI, app route protection, checkout and entitlement recovery paths, Codex connection/workflow paths, managed GitHub integration paths, PostHog instrumentation, release workflow proof, and docs for external provider setup.

Child ExecPlans should carry `program_id: admin-user-impersonation` and `planning_brief: docs/programs/active/2026-05-05-admin-user-impersonation/planning-brief-<N>.md` in their frontmatter.
