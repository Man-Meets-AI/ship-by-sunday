---
title: Admin User Impersonation Planning Brief 1
program_id: admin-user-impersonation
brief_version: 1
status: current
summary: Build the foundation schema and provider contract for support mode.
read_when:
  - Authoring the first child ExecPlan for the Admin User Impersonation Program.
---

# Admin User Impersonation Planning Brief 1

The first implementation slice should create the support-mode foundation/schema/provider contract, not the Clerk handoff UI.

Use Clerk actor tokens as the impersonation primitive, but this slice does not need to complete the browser handoff UI. It should establish the contracts that the next UI slice will depend on.

Impersonation availability requires explicit environment setup. Add `ADMIN_IMPERSONATION_ENABLED` as a kill switch and require `ADMIN_IMPERSONATION_EMAILS` whenever the feature is enabled. Do not provide a permissive local default. Local, preview, and production can all support the feature when configured.

Add a narrow admin helper, such as `requireImpersonationAdmin()`, that evaluates server runtime env and the current Clerk user's verified email. Signed-in non-admin page access should be modeled as 404 at the page layer, while API/server-action boundaries return 403 and unauthenticated API/server-action callers return 401.

Make Convex actor-aware. Update the Clerk provider setup documentation for the `convex` JWT template so the session actor claim is included. Add a small Convex-side parser/helper that returns the effective customer subject, admin actor metadata, and `impersonationSessions` id from the authenticated identity when present.

Create the first support-mode session and audit contract. Add `impersonationSessions` and `impersonationAuditEvents`. The session record is created server-side before minting the Clerk actor token in the next slice. The freeform reason is required, 10-500 characters, immutable, and stored with the session. Every audited impersonated write must link to a session id. The contract should expect a secure httpOnly app cookie and, when Clerk accepts it cleanly, an actor claim value named `impersonationSessionId`. If those session pointers disagree, fail closed.

Sessions expire after 2 hours with lazy backend expiry. Expired or mismatched sessions block writes and force stop/restart. The stop flow closes the Convex session record and ends the Clerk actor-token session.

Add a shared support-mode status read model for the bar, admin page, and blocked-action UI. It should expose a narrow UI-safe status shape, not raw actor/cookie/session internals. Status must cover disabled, misconfigured, not-admin, normal, active, expired, stopped, invalid mismatch, kill-switch disabled, and unsupported Clerk Dashboard impersonation states.

Block unclassified writes while impersonating until they have support-mode audit coverage. Audit blocked attempts with a stable action identifier and block reason. Suppress ordinary customer analytics while impersonating and rely on Convex support-mode audit instead.

Raw Clerk Dashboard impersonation is unsupported for product use. If the app detects Clerk actor state without a valid app-managed `impersonationSessions` record, it should show an integrity warning and block writes. Operator docs must explicitly direct Parker to use `/admin/impersonation`, not Clerk Dashboard impersonation, for customer support.

The kill switch is the emergency invalidation path. When disabled, active sessions become unusable and are lazily treated as `invalidated` with reason `feature_disabled` when observed. Do not add an invalidate-all UI or eager rewrite/sweep in this slice.

Do not add broad role management. Do not pass target customer ids into ordinary product functions. Do not fake Clerk user data in React. Do not silently allow risky external side effects just because the customer session is active.

Focused validation should include:

```bash
bun run programs:lint
bun run markdown:lint -- --paths docs/programs
```

The implementation ExecPlan should add the narrow app and Convex tests for the touched files, plus a browser-level proof if a runnable support-mode path exists in the slice.

After this slice lands, refresh `program.md` with the exact files changed, validation evidence, and the next recommended child slice.
