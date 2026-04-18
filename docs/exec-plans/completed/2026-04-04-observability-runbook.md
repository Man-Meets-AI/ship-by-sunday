---
summary: "Create one canonical internal observability runbook and remove the repeated observability setup prose from the surrounding docs."
read_when: "Read this when observability setup, incident handling, or docs duplication needs one authoritative repository runbook."
plan_status: done
---

# Create the Canonical Observability Runbook

This is a living execution plan. It should be updated as soon as the scope, file list, or validation path changes so the next contributor can resume from this document alone.

It must be maintained in accordance with `.plans/PLANS.md`.

## Purpose / Big Picture

The repository already has a real observability system, but its operational guidance is split across several places. A maintainer currently has to piece together the same `.convex.site` transport detail, env-var explanation, release-proof expectation, and incident-status flow from `apps/web/content/docs/local-qa.mdx`, `apps/web/content/docs/deploy-to-vercel.mdx`, `apps/web/content/docs/environment-variables.mdx`, `apps/web/content/docs/troubleshooting/stripe-convex.mdx`, `apps/web/content/docs/ship-live.mdx`, `apps/web/content/docs/stripe-checkout-webhook.mdx`, `docs/release-workflow.md`, `qa/README.md`, and `README.md`.

After this change, one internal runbook will explain the observability system end to end, and the surrounding docs will shrink to short pointers or narrow context that do not repeat the same operational story. A novice should be able to start from the root docs, open one canonical file, and learn which routes, env vars, tests, and recovery commands matter when observability breaks.

## Progress

- [x] 2026-04-04 12:45 EDT - Inspected the repo planning rules, app-level docs rules, observability runtime files, QA docs, and release docs to identify the duplicated guidance and the actual codepaths.
- [x] 2026-04-04 13:03 EDT - Added `docs/internal/observability.md`, trimmed the repeated observability prose in the selected docs, and prepared the repo-wide validation pass.
- [x] 2026-04-04 13:11 EDT - Verified the maintainer-facing validation path with `bunx convex data incidents --format jsonLines`, the targeted docs format checks, `bun run qa:validate`, `bun run format`, `bun run lint`, `bun run typecheck`, and `bun run build`.

## Surprises & Discoveries

The repo already says `docs/internal/` is where internal launch ops should live, but that directory does not currently exist. The root `README.md`, `apps/web/content/docs/index.mdx`, and `CHANGELOG.md` all imply that internal-docs home, so this initiative is partly about restoring a missing docs structure, not inventing a new one.

The observability transport split is real in code, not just in prose. Both `apps/web/features/observability/server/ingest-error-event.ts` and `apps/web/features/observability/server/update-incident-status.ts` prefer `NEXT_PUBLIC_CONVEX_SITE_URL` and only fall back to `NEXT_PUBLIC_CONVEX_URL`, which means the runbook has to explain why `.convex.site` matters for HTTP actions.

The actual observability surface is compact but distributed. The user-facing entrypoints are `apps/web/app/api/observability/client-error/route.ts`, `apps/web/app/api/observability/clerk/route.ts`, `apps/web/app/api/observability/vercel/route.ts`, and `apps/web/app/api/observability/incidents/[incidentId]/status/route.ts`, while `apps/web/convex/observability.ts` and `apps/web/convex/observability/model.ts` own the durable incident state and Telegram delivery. That is the material the runbook should centralize.

The incident-control route is a browser-hosted app route that still has to relay to the Convex HTTP-action endpoint, so the canonical runbook needs to describe both the user-facing path and the backend relay token rather than only the Convex table.

The dev inspection command works as documented. `bunx convex data incidents --format jsonLines` returned live `incidents` rows from the active deployment, which means the runbook can safely point maintainers at that exact CLI surface instead of a hypothetical query path.

## Decision Log

- 2026-04-04 - Author: Codex. Create `docs/internal/observability.md` as the single canonical observability runbook instead of adding another public troubleshooting page, because the repo already reserves `docs/internal/` for launch-ops material.
- 2026-04-04 - Author: Codex. Keep the general evidence-capture page `apps/web/content/docs/debugging-with-logs-and-screenshots.mdx` out of scope unless it turns out to repeat the same observability drill, because it teaches how to supply logs and screenshots rather than how the incident pipeline works.
- 2026-04-04 - Author: Codex. Public docs under `apps/web/content/docs/` should not link directly to the repo-internal `docs/internal/observability.md`; they should keep only minimal public-safe context, while contributor-facing docs such as `README.md`, `docs/release-workflow.md`, and `qa/README.md` point to the canonical internal runbook.
- 2026-04-04 - Author: Codex. Trim duplicate observability detail from `README.md`, `docs/release-workflow.md`, `qa/README.md`, `apps/web/content/docs/local-qa.mdx`, `apps/web/content/docs/deploy-to-vercel.mdx`, `apps/web/content/docs/environment-variables.mdx`, and `apps/web/content/docs/troubleshooting/stripe-convex.mdx` so those docs stay useful without becoming a second source of truth.
- 2026-04-04 - Author: Codex. Keep `apps/web/content/docs/ship-live.mdx` and `apps/web/content/docs/stripe-checkout-webhook.mdx` focused on checkout and release operations, while routing incident-control detail to the internal runbook and leaving the public pages with only the minimum webhook-origin context they need.

## Outcomes & Retrospective

The canonical internal runbook now exists at `docs/internal/observability.md`, and the surrounding contributor and QA docs point to it instead of repeating the same observability story. The public app docs still explain the local and release context they need, but they no longer try to be the incident-control handbook themselves. Validation proved the maintainer CLI inspection path, the docs control plane, and the Next build all still work after the trim. The remaining risk is only documentation drift if the runtime routes or env names change later.

## Context and Orientation

`docs/` is the contributor and launch-ops doc tree, while `apps/web/content/docs/` is the shipped public docs surface. This initiative should keep the full observability operations guide in `docs/internal/observability.md` and reduce the public docs to short pointers and local context.

Before:
docs/
codex/
openai/
prompts/
ship-by-sunday/
After:
docs/
codex/
internal/
observability.md
openai/
prompts/
ship-by-sunday/

The observability system itself is built from a few stable layers. The Next.js routes normalize incoming client errors and provider webhooks, the server helpers in `apps/web/features/observability/server/` add request ids and forward incidents into Convex, the Convex HTTP-action router in `apps/web/convex/http.ts` exposes `/observability/events` and `/observability/incidents/status`, and the Convex code in `apps/web/convex/observability.ts` plus `apps/web/convex/observability/model.ts` records incidents, updates status, and drives Telegram delivery. The key environment contract lives in `apps/web/platform/env/server.ts`, `apps/web/convex/env.ts`, and `apps/web/content/docs/environment-variables.mdx`, where the observability tokens and webhook secrets are defined.

For a novice, the important terms are simple. An "incident" in this repo is a normalized operational error record stored in Convex. `OBSERVABILITY_INGEST_TOKEN` authenticates the Next.js app when it posts incidents into Convex. `OBSERVABILITY_INCIDENT_CONTROL_TOKEN` protects the maintainer-only incident-status route. `CLERK_WEBHOOK_SIGNING_SECRET` and `OBSERVABILITY_VERCEL_WEBHOOK_SECRET` verify incoming provider webhooks. `NEXT_PUBLIC_CONVEX_SITE_URL` is the Convex HTTP-actions origin, and that is why observability ingest and incident control cannot rely on the browser-facing `.convex.cloud` URL alone.

## Plan of Work

First, create `docs/internal/observability.md` as the canonical internal runbook. It should explain the observability architecture in plain language, name the exact route files and server helpers, list the required env vars, describe the `.convex.site` versus `.convex.cloud` split, and document the incident state workflow, including `acked`, `muted`, `resolved`, and `firing`. It should also include the narrow observability validation command from `apps/web/content/docs/local-qa.mdx` and the backend inspection command that reads incident rows from Convex.

Next, update the root discovery docs so maintainers can find the runbook quickly. `README.md` should get one clear operations link to `docs/internal/observability.md`, and `docs/release-workflow.md` should point to the same file instead of re-explaining the observability transport details in its own release checklist.

Then, trim the duplicated guidance from the docs that currently repeat the same story. `apps/web/content/docs/local-qa.mdx` should keep the local QA flow but shrink the observability smoke section to a short internal-operator note that does not try to restate the runbook. `apps/web/content/docs/deploy-to-vercel.mdx`, `apps/web/content/docs/ship-live.mdx`, and `apps/web/content/docs/stripe-checkout-webhook.mdx` should keep deployment and billing guidance but stop repeating the full observability env and incident-control walkthrough. `apps/web/content/docs/environment-variables.mdx` should keep the variable list but shorten the observability explanation to a concise reference. `apps/web/content/docs/troubleshooting/stripe-convex.mdx` should keep the Stripe-specific diagnosis while removing the repeated `.convex.site` explanation. `qa/README.md` should keep the QA pack policy but stop restating the observability smoke drill in full.

## Milestones

**Milestone 1 - Canonical internal runbook exists.** At the end of this slice, `docs/internal/observability.md` should be the single place that explains the observability codepaths, env contract, incident lifecycle, and validation commands. A novice should be able to read that one file and understand how the Next.js routes, Convex functions, and provider webhooks fit together.

**Milestone 2 - Duplicate docs are shortened.** At the end of this slice, the surrounding docs should still do their own jobs, but the repeated observability prose should be reduced to short pointers or narrow context. The visible result should be that the same `.convex.site` and incident-status story is not repeated at length in multiple docs.

**Milestone 3 - Repo checks are green.** At the end of this slice, the docs-only change should pass the normal repository quality gates, and any docs-navigation or MDX errors should be fixed before the work is considered complete.

## Concrete Steps

From the repository root, edit the new internal runbook first, then the summary docs, then the duplicated observability sections. The expected end state is that the internal file contains the full operational story while the other docs only contain short references.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bunx convex data incidents --format jsonLines
    bunx convex data incidents --prod --format jsonLines

Expected observation: the first command inspects the active dev deployment's `incidents` table, and the second inspects production. Use the dev command while authoring the runbook and reserve `--prod` for explicitly verifying production wording.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run format

Expected observation: only the intended docs files are rewritten, and formatting should not introduce unrelated file churn.

    bun run lint

Expected observation: the markdown and MDX files remain lint-clean after the doc trims.

    bun run qa:validate

Run this if `qa/README.md` is edited. Expected observation: the QA control plane still validates cleanly after the pointer changes.

    bun run typecheck

Expected observation: the web app typecheck still passes, which confirms the MDX and app metadata changes did not break the typed build.

    bun run build

Expected observation: the web app builds successfully, which is the fastest way to catch bad MDX links or content-file issues after the docs trim.

## Validation and Acceptance

The change is done when one internal file, `docs/internal/observability.md`, is enough to answer the operational questions that were previously scattered across several docs: which observability routes exist, which env vars they need, how `.convex.site` differs from `.convex.cloud`, how incident status is controlled, which Convex table stores the incidents, and which commands prove the path locally in both dev and production.

The surrounding docs should still make sense on their own, but they should no longer repeat the full observability ops story. A contributor reading `README.md`, `docs/release-workflow.md`, or `qa/README.md` should see clear links to the internal runbook. A reader of the affected public docs should see only the minimal local context needed for that page, not a second copy of the runbook and not a broken link to a repo-internal path.

Before calling the work complete, run `bunx convex data incidents --format jsonLines` to confirm the inspection command used in the runbook still matches the active dev deployment, then run `bun run format`, `bun run lint`, `bun run typecheck`, and `bun run build`. If `qa/README.md` changed, also run `bun run qa:validate`. No browser QA pack is required because this is a documentation-only change.

## Idempotence and Recovery

These edits are safe to rerun because they are additive or text-shrinking. If a pass partially lands, keep the new internal runbook and rerun the pointer updates until the remaining docs are short and consistent. If a link or path is wrong, fix the link in the docs file that introduced it and rerun `bun run build` immediately.

If the internal runbook draft needs to change direction, update `docs/internal/observability.md` first and then refresh the surrounding pointers. Do not create a second full observability guide as a fallback, because that would recreate the fragmentation this initiative is trying to remove.

## Artifacts and Notes

Keep the final diff centered on these files:

    docs/internal/observability.md
    README.md
    docs/release-workflow.md
    qa/README.md
    apps/web/content/docs/local-qa.mdx
    apps/web/content/docs/deploy-to-vercel.mdx
    apps/web/content/docs/ship-live.mdx
    apps/web/content/docs/stripe-checkout-webhook.mdx
    apps/web/content/docs/environment-variables.mdx
    apps/web/content/docs/troubleshooting/stripe-convex.mdx

The most useful proof artifact will be the new internal runbook itself, because it should show the exact route names, env vars, and validation commands in one place. The second most useful artifact is the smaller follow-up diff that shows the public and QA docs now defer to that file instead of repeating the same operational story.

Observed proof snippet:

    $ bunx convex data incidents --format jsonLines
    { "_id": "...", "environment": "dev", "status": "firing", ... }

    $ bun run qa:validate
    QA control plane is internally consistent.

## Interfaces and Dependencies

The runbook must stay aligned with the existing code interfaces, not invent a new observability API. The core dependencies to name and describe are:

- `apps/web/app/api/observability/client-error/route.ts`
- `apps/web/app/api/observability/clerk/route.ts`
- `apps/web/app/api/observability/vercel/route.ts`
- `apps/web/app/api/observability/incidents/[incidentId]/status/route.ts`
- `apps/web/features/observability/server/ingest-error-event.ts`
- `apps/web/features/observability/server/update-incident-status.ts`
- `apps/web/features/observability/server/request-id.ts`
- `apps/web/features/observability/lib/incident.ts`
- `apps/web/features/observability/server/source-adapters/clerk-webhook.ts`
- `apps/web/features/observability/server/source-adapters/vercel-webhook.ts`
- `apps/web/features/observability/server/source-adapters/stripe-failure.ts`
- `apps/web/convex/http.ts`
- `apps/web/convex/env.ts`
- `apps/web/convex/observability.ts`
- `apps/web/convex/observability/model.ts`
- `apps/web/platform/env/server.ts`
- `apps/web/content/docs/environment-variables.mdx`

The runbook should also mention the exact local validation command already used in the repo for observability confidence, plus the Convex incident inspection command and the release or QA commands that prove the path in a real environment. The surrounding docs should refer back to that one source of truth rather than re-declaring the same env contract and incident-status mechanics in multiple places.
