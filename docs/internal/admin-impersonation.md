# Admin Impersonation

Admin impersonation is an app-managed support mode built on Clerk actor tokens and Convex audit state. Clerk owns the browser session. Convex continues to authorize product data as the customer subject while the app records Parker as the actor for support-mode policy and audit.

The supported entry point is `/admin/impersonation`. It searches Clerk users server-side, requires a support reason, creates a Convex `impersonationSessions` record, mints a Clerk actor token, signs the browser into the customer session with Clerk's ticket strategy, and shows a persistent support-mode bar until Parker stops the session.

## Runtime Env

Set these values in every environment where support mode should be available:

```bash
ADMIN_IMPERSONATION_ENABLED=true
ADMIN_IMPERSONATION_EMAILS=me@parkerrex.com
```

`ADMIN_IMPERSONATION_ENABLED` must be exactly `true` to enable support mode. Missing, empty, or `false` disables the feature. Any other value is misconfigured.

`ADMIN_IMPERSONATION_EMAILS` is a comma-separated allowlist of verified Clerk emails that may start app-managed impersonation. The first supported production allowlist is `me@parkerrex.com`. When the feature is enabled, an empty allowlist is misconfigured.

Local, preview, and production may each enable support mode, but none of them defaults open. Store the values with the same environment owner that runs the app server and Convex functions for that environment. In hosted Convex, set matching values with:

```bash
npx convex env set ADMIN_IMPERSONATION_ENABLED true
npx convex env set ADMIN_IMPERSONATION_EMAILS me@parkerrex.com
```

## Clerk And Convex Setup

Keep Clerk as the only browser-session provider. Do not create a custom impersonation auth layer.

Convex already validates Clerk JWTs through `apps/web/convex/auth.config.ts` with the `convex` JWT template. The Clerk `convex` JWT template must expose the actor claim so Convex can see support-mode actor metadata:

```json
{
  "act": "{{session.actor}}"
}
```

Clerk includes the `act` claim only during impersonation. The actor object must contain the admin actor user id as `sub`. Clerk's actor session id appears as `sid` when available. The app-managed Convex session id is passed through the installed Clerk Backend SDK actor `additionalProperties.impersonationSessionId` field; Convex accepts that nested shape and the direct `act.impersonationSessionId` shape if Clerk exposes it directly.

The start UI must create an `impersonationSessions` row before creating the Clerk actor token. It must pass the created Convex session id into Clerk's actor token `actor` object, along with the actor `sub`. The customer remains the Clerk session subject.

## Supported Path

Only the app-managed `/admin/impersonation` flow is supported for customer support.

Raw Clerk Dashboard impersonation is not supported. It can create an impersonated Clerk session, but it bypasses Ship by Sunday's reason capture, Convex session bridge, setup-integrity checks, and audit trail. When Convex sees an actor claim without a valid `impersonationSessionId`, support-mode status reports `unsupported_clerk_dashboard_impersonation`, and support-mode write policy fails closed.

## Operator Flow

1. Sign in as an allowlisted admin, initially `me@parkerrex.com`.
2. Open `/admin/impersonation` from the account menu or directly.
3. Search by customer email and select a non-admin Clerk user.
4. Enter a 10-500 character reason. Do not paste secrets, tokens, private repo contents, sensitive stack traces, or unnecessary personal data.
5. Confirm `Start impersonating customer`.
6. After Clerk handoff, use the customer workspace with the high-contrast support-mode bar visible.
7. Use `Stop impersonating` to close the Convex session record and sign out the active actor-token Clerk session.

Starting a second customer session is blocked until the current session is stopped. The admin page remains reachable during support mode, but it is locked to current-session controls.

## Convex Contract

`impersonationSessions` stores one app-managed support session with actor id/email, customer subject id/email, immutable reason, status, setup-integrity warnings, request metadata, timestamps, expiry, failure reason, and invalidation reason.

`impersonationAuditEvents` is append-only. It records session events and blocked write attempts with the session id, action id, result, actor id/email, customer subject id/email, optional changed record ids, block reason, failure reason, setup-integrity warnings, request id, user agent, IP hash, and creation time. It does not store arbitrary JSON blobs, token claims, cookies, before/after snapshots, secrets, or transcript-style payloads.

The status model is UI-safe. It can return state, customer email, reason, time remaining, start/stop eligibility, and setup-integrity warnings. It must not return raw cookies, raw JWTs, actor-token URLs, Clerk secret keys, raw token claims, or internal session pointer details.

`/admin/impersonation` history is read-only. It shows recent app-managed sessions for the admin actor with customer email, reason, status, timing, event count, blocked event count, and setup-integrity warnings. There is no resume or reopen action.

## Write And Side-Effect Policy

Allowed support-mode writes are ordinary in-app product state and customer setup changes that stay inside Convex, including course progress, codebase definition facts, fulfillment-track resolution, workspace setup/pairing metadata, and repository metadata binding. These preflight the current support-mode session before mutating customer state, then append `write_attempted` audit events with result `success` when the request runs under a valid app-managed support-mode session.

High-impact external side effects are blocked while impersonating. Stripe checkout session creation, express checkout, Codex account login/logout, Codex generation, managed GitHub consent changes, workspace workflow/run starts, sync approval, finding/project deletes, and runner revocation are unavailable during support mode. Route-level blockers write a support-mode audit event before returning an HTTP error so the evidence is not lost with a rolled-back mutation.

Review repo downloads are allowed when the customer can otherwise download the artifact and any active support-mode session is still valid. The route checks support-mode status before building the zip and rechecks audit state before returning it. Successful downloads append a `download_attempted` audit event.

## Verify Implementation

Run the focused implementation tests:

```bash
bun run --cwd apps/web test:unit -- tests/unit/admin-impersonation-config.test.ts tests/unit/admin-impersonation-admin.test.ts tests/unit/admin-impersonation-status.test.ts tests/unit/convex-impersonation.test.ts
bun run --cwd apps/web test:integration:ui -- tests/integration-ui/support-mode-bar.test.tsx tests/integration-ui/admin-impersonation-page.test.tsx
```

After schema changes, regenerate Convex types against hosted Convex dev:

```bash
cd apps/web
bunx convex codegen
```

Run docs and plan checks from the repo root:

```bash
bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-admin-impersonation-foundation-schema-provider-contract.md
bun run programs:lint
bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-admin-impersonation-foundation-schema-provider-contract.md docs/programs/active/2026-05-05-admin-user-impersonation docs/internal/admin-impersonation.md
git diff --check
```

## Failure Modes

- Missing or false `ADMIN_IMPERSONATION_ENABLED`: support mode is disabled.
- `ADMIN_IMPERSONATION_ENABLED` set to anything other than `true` or `false`: support mode is misconfigured.
- Enabled feature with empty `ADMIN_IMPERSONATION_EMAILS`: support mode is misconfigured.
- Signed-in user email missing, unverified, or not allowlisted: the user is not an impersonation admin.
- Clerk `convex` JWT template missing `act`: Convex cannot see actor metadata, so support-mode audit cannot prove the actor.
- Actor claim present without `impersonationSessionId`: unsupported Clerk Dashboard impersonation.
- Actor claim/session mismatch: support-mode status reports invalid mismatch and write policy blocks.
- Expired session: the mutation path lazily marks the session expired and write policy blocks.
- Kill switch disabled during an active session: the mutation path lazily invalidates the session with `feature_disabled` and write policy blocks.
- Clerk actor-token creation failure: the Convex session is marked `start_failed`.
- Browser ticket handoff failure: the start UI marks the Convex session `start_failed` where it still has the session id.
- Stop failure: the UI still signs out the active actor-token Clerk session and lands on `/admin/impersonation`.

## Release Proof

Before production enablement, prove one complete non-production flow with a dedicated eligible Clerk test customer:

- feature flag and allowlist configured in the app runtime and hosted Convex dev environment
- customer has a Clerk user, product access, and workspace state
- admin opens `/admin/impersonation`, selects the customer, enters a reason, and starts
- Clerk ticket handoff lands on the customer workspace
- support bar shows customer email, reason preview, time remaining, and stop action
- one allowed in-app write succeeds and writes audit
- one blocked side effect returns unavailable and writes audit
- one review download succeeds and writes audit
- stop returns to `/admin/impersonation`
- history shows the session and blocked event count

Production enablement also requires a non-destructive post-deploy smoke using a dedicated internal production test customer. Do not use a real customer for either proof.

Current checkout limitation, 2026-05-07: `.env.local` does not define `ADMIN_IMPERSONATION_ENABLED`, `ADMIN_IMPERSONATION_EMAILS`, or dedicated Clerk test-user credentials. The implementation and mocked tests can be validated here, but the required real Clerk actor-token proof remains blocked until those environment-owned inputs and dedicated test customers exist.
