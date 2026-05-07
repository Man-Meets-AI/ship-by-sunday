# Admin Impersonation

Admin impersonation is an app-managed support mode built on Clerk actor tokens and Convex audit state. Clerk owns the browser session. Convex continues to authorize product data as the customer subject while the app records Parker as the actor for support-mode policy and audit.

This foundation does not ship the `/admin/impersonation` UI. It defines the provider setup, runtime gates, Convex session and audit contract, and failure modes that the UI slice must use.

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

Clerk includes the `act` claim only during impersonation. The actor object should contain the admin actor user id as `sub`, Clerk's actor session id as `sid` when available, and the app-managed Convex session id as `impersonationSessionId`.

The later start UI must create an `impersonationSessions` row before creating the Clerk actor token. It must pass the created Convex session id into Clerk's actor token `actor` object as `impersonationSessionId`, along with the actor `sub`. The customer remains the Clerk session subject.

## Supported Path

Only the future app-managed `/admin/impersonation` flow is supported for customer support.

Raw Clerk Dashboard impersonation is not supported. It can create an impersonated Clerk session, but it bypasses Ship by Sunday's reason capture, Convex session bridge, setup-integrity checks, and audit trail. When Convex sees an actor claim without a valid `impersonationSessionId`, support-mode status reports `unsupported_clerk_dashboard_impersonation`, and support-mode write policy fails closed.

## Convex Contract

`impersonationSessions` stores one app-managed support session with actor id/email, customer subject id/email, immutable reason, status, setup-integrity warnings, request metadata, timestamps, expiry, failure reason, and invalidation reason.

`impersonationAuditEvents` is append-only. It records session events and blocked write attempts with the session id, action id, result, actor id/email, customer subject id/email, optional changed record ids, block reason, failure reason, setup-integrity warnings, request id, user agent, IP hash, and creation time. It does not store arbitrary JSON blobs, token claims, cookies, before/after snapshots, secrets, or transcript-style payloads.

The status model is UI-safe. It can return state, customer email, reason, time remaining, start/stop eligibility, and setup-integrity warnings. It must not return raw cookies, raw JWTs, actor-token URLs, Clerk secret keys, raw token claims, or internal session pointer details.

## Verify Foundation

Run the focused foundation tests:

```bash
bun run --cwd apps/web test:unit -- tests/unit/admin-impersonation-config.test.ts tests/unit/admin-impersonation-admin.test.ts tests/unit/admin-impersonation-status.test.ts tests/unit/convex-impersonation.test.ts
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
