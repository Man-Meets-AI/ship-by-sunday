---
summary: "ExecPlan for unifying public builder docs and adjacent public copy around one codebase-first story. It treats legacy route names like mission, lesson, and artifacts as compatibility-only language unless the docs are explicitly explaining redirects or internal implementation details."
read_when: "Open this when public docs or marketing copy still teach the wrong product model or expose obsolete route names as current."
plan_status: "done"
---

# Unify the Public Codebase-First Story

This document is a living execution plan for collapsing the public-facing vocabulary around one codebase-first story so builders and agents stop hearing two different product models at once. It is intentionally scoped to public builder docs, public route descriptions, and any public-facing labels or copy that still teach obsolete `mission`, `lesson`, or `artifacts` surfaces as if they were current product entry points.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this change, a newcomer who reads the public builder docs or other public-facing guidance should hear one consistent story: the protected journey begins on `/start`, then moves through `/product`, `/design`, `/marketing`, `/build-plan`, `/review`, and the optional `/execute` branch. Legacy route names such as `/mission`, `/lesson/[lessonKey]`, and `/artifacts` should only appear when the docs are explicitly explaining backward-compatibility redirects or internal implementation details that are not part of the public product contract. This matters because the repo already warns that wrong route language makes builders and agents implement the right idea on the wrong surface. The visible success case is simple: the public docs and adjacent public copy read as one codebase-first system, and any remaining legacy terms are clearly marked as compatibility-only.

## Progress

- [x] 2026-03-26 19:25 EDT — Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, and `docs/prompts/execplan-writer.md`, then inspected the canonical codebase-first source docs plus the public docs pages, route config, selector layer, and compatibility redirect routes that govern the public story.
- [ ] 2026-03-26 19:25 EDT — Rewrite the primary public docs pages so they teach only the codebase-first route model and reframe legacy terms as compatibility-only.
- [ ] 2026-03-26 19:25 EDT — Audit adjacent public-facing copy and config-driven labels, and rewrite only the surfaces that still expose obsolete public nouns.
- [ ] 2026-03-26 19:25 EDT — Validate the rewritten story with focused grep, a production build, and manual review of the affected public docs routes.

## Surprises & Discoveries

The leak is narrower and more concentrated than the original complaint suggested. The core route contract is already codebase-first in `apps/web/config/product.ts`, and the compatibility routes physically redirect to canonical codebase surfaces in `apps/web/app/(workspace)/mission/page.tsx`, `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx`, and `apps/web/app/(workspace)/artifacts/page.tsx`. That means this slice does not need a routing migration. It needs a public-language cleanup.

The worst contradiction is in `apps/web/content/docs/implement-the-first-protected-ux.mdx`, which still declares the protected product language to be `mission`, `lesson/[lessonId]`, `artifacts`, and `settings`. That page is now materially wrong for the current public story and should be treated as a primary rewrite target rather than a minor copy tweak.

Most of the other public docs are already partially correct. `apps/web/content/docs/index.mdx`, `how-the-starter-works.mdx`, and `route-map.mdx` already describe the codebase-first routes and the compatibility redirects. Their remaining work is to remove mixed framing, not to rediscover the route model from scratch.

`starterConfig.workspace.artifactsLabel` still exists in `apps/web/config/product.ts`, but the current repo inspection did not find an active public consumer of that label. This is a public-vocabulary risk, not yet a proven public leak. Treat it as an audit item, not a mandatory rename unless the implementation surfaces it in a visible public page.

The current repository baseline is healthy enough to use `bun run build` as a real acceptance check. A root build run completed successfully on 2026-03-26 19:25 EDT, so this plan should require a green build instead of assuming unrelated breakage.

## Decision Log

Decision: Scope this slice to public-facing docs, public route explanations, and public-facing labels or copy only. Rationale: the user explicitly narrowed the request to "whatever's publicly facing," and the internal course engine is a much larger migration that is not necessary to fix the public story. Date/Author: 2026-03-26 / Codex

Decision: Preserve legacy compatibility routes and internal implementation names in code. Rationale: `apps/web/AGENTS.md` explicitly preserves `/mission`, `/lesson/[lessonKey]`, and `/artifacts` as compatibility redirects, and the runtime already depends on that contract. This slice is about making those names compatibility-only in public language, not deleting them. Date/Author: 2026-03-26 / Codex

Decision: Treat `apps/web/content/docs/*.mdx` as the primary source of public-story truth for this slice. Rationale: those files are the shipped builder docs under `/docs`, and they are the fastest way a newcomer learns which routes and nouns matter. Date/Author: 2026-03-26 / Codex

Decision: Audit homepage and blog copy, but only rewrite non-doc public copy when it teaches the obsolete product surface rather than using an acceptable generic noun. Rationale: the user asked for public-facing cleanup, but the motivating problem is route and surface confusion, not a blanket ban on every historical English word. Date/Author: 2026-03-26 / Codex

Decision: Require focused grep plus `bun run build` as the main proof surface for this slice, and use manual page review for the affected docs routes instead of broader checkout or browser-smoke flows. Rationale: this is a public-story and docs-contract cleanup, not a runtime purchase-flow change. Date/Author: 2026-03-26 / Codex

## Outcomes & Retrospective

This section should be updated after implementation with the exact files changed, the final public vocabulary rules, and any legacy terms that intentionally remain visible. At plan creation time, the expected outcome is a smaller and more precise diff than a general docs rewrite: a handful of public docs pages should change substantially, a few compatibility notes should become more explicit, and most internal `features/course/**` terminology should remain untouched. If the work expands into renaming active runtime components or changing route contracts, that is scope drift and should be documented before continuing.

## Context and Orientation

The canonical public route story already exists in the codebase-first planning and runtime contract. `docs/ship-by-sunday/codebase-contract-and-question-map-2026-03-23.md` defines the product as codebase-first, not lesson-first. `apps/web/AGENTS.md` says the required funnel is Start, Product, Design, Marketing, Build Plan, Review & Download, with Execute / Ship as an optional post-download library. `apps/web/config/product.ts` implements that contract in `routeConfig` by defining `/start`, `/product`, `/design`, `/marketing`, `/build-plan`, `/review`, and `/execute`, while also retaining `/mission` and `/artifacts` as compatibility routes.

The public builder docs live in `apps/web/content/docs/`. These `.mdx` files are rendered by the docs app under `apps/web/app/docs/[[...mdxPath]]/page.tsx` with shared chrome from `apps/web/features/docs/`. The most important public-story pages for this slice are `apps/web/content/docs/index.mdx`, `how-the-starter-works.mdx`, `customize-the-starter.mdx`, `route-map.mdx`, `implement-the-first-protected-ux.mdx`, and `troubleshooting/access.mdx`. Those files are where a new builder learns what the protected product is called and which routes matter.

The compatibility boundary is explicit in code. `apps/web/app/(workspace)/mission/page.tsx` redirects to `routeConfig.start`. `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx` also redirects to `routeConfig.start`. `apps/web/app/(workspace)/artifacts/page.tsx` redirects to `routeConfig.review`. Those routes are real and must stay real, but they are not supposed to be taught as the current primary product surfaces.

Public-facing labels can also leak from config. `apps/web/features/starter/lib/starter-selectors.ts` exposes `workspaceDisplayConfig` from `starterConfig.workspace` in `apps/web/config/product.ts`. Today that object still includes `artifactsLabel: "Artifacts"`, even though repo inspection did not find an active public consumer. The implementer should treat this as an adjacent audit surface: if any visible public page or public UI imports that label, it belongs in the cleanup. If it remains unused or internal-only, leave it alone.

There are two categories of public language in this slice. The first category is route-and-surface language, which is the main target: names like `mission`, `lesson`, `artifacts`, `workspace`, `codebase pages`, `packs`, and `review`. The second category is generic durable-output language in editorial copy, such as "artifacts" meaning reusable files rather than a route. That second category should only be rewritten if it conflicts with the product's current codebase-first story. The goal is not to create a robotic vocabulary blacklist. The goal is to make sure a builder never mistakes a compatibility route or an internal lesson engine concept for the public route model they should actually use.

## Plan of Work

Start by freezing the public vocabulary rules in the implementation itself. The canonical protected story for public readers is `/start` first, then the stage roots `/product`, `/design`, `/marketing`, and `/build-plan`, then `/review`, then optional `/execute`. The canonical public nouns are "workspace," "codebase pages," "packs," "Codebase," "review," and "execute" where those terms already match the shipped UI. The forbidden use of `mission`, `lesson`, and `artifacts` in this slice is not absolute; those terms may still appear when the docs are explicitly describing compatibility redirects or the internal course runtime. They may not appear as the default way to teach the current product.

Once that rule set is frozen, rewrite the highest-leverage public docs pages first. `implement-the-first-protected-ux.mdx` needs a conceptual rewrite because its opening vocabulary is wrong. `customize-the-starter.mdx` needs its "Protected workspace" row and starter-mode explanation updated so the builder hears codebase pages and review instead of mission, lesson chrome, and artifacts. `index.mdx`, `how-the-starter-works.mdx`, and `route-map.mdx` already have the right architecture, so the work there is to tighten phrasing and make the compatibility boundary more explicit where mixed language still remains.

After the primary docs pages are consistent, audit the nearby public surfaces that can still undermine the story. This includes `troubleshooting/access.mdx`, any other docs pages that still mention `/mission`, `/lesson/[lessonKey]`, or `/artifacts`, and any public marketing or editorial copy that teaches the obsolete route model. The homepage and public blog should be read with a narrow question: do they expose the old route language or product surface names as if they were still current? If not, leave them unchanged. If yes, rewrite only the contradictory lines.

Finally, validate the cleanup as a public contract change, not as a generic copy pass. The key proof is that a focused grep across public docs and adjacent public surfaces only returns legacy terms where they are clearly labeled compatibility references or internal implementation notes. Pair that grep with a green `bun run build`, then manually read the affected `/docs` pages in a local dev server to confirm the story reads naturally from page to page without bouncing between old and new product models.

## Milestones

### Milestone 1: Rewrite the primary public-story docs

At the end of this milestone, the core public builder docs teach one codebase-first route model without contradiction. The main files are `apps/web/content/docs/index.mdx`, `apps/web/content/docs/how-the-starter-works.mdx`, `apps/web/content/docs/customize-the-starter.mdx`, `apps/web/content/docs/route-map.mdx`, and `apps/web/content/docs/implement-the-first-protected-ux.mdx`.

This milestone is complete when a newcomer can read those pages in sequence and learn the correct protected flow without being told that `mission`, `lesson`, or `artifacts` are the current product surfaces. Compatibility routes may still be named, but only as redirects from the old model into the new one. Run a focused grep after these edits and expect the remaining hits in those files to read as compatibility notes rather than primary nouns.

### Milestone 2: Align supporting public references and public-facing labels

At the end of this milestone, the supporting public docs and any actually consumed public labels reinforce the same codebase-first story. The likely files are `apps/web/content/docs/troubleshooting/access.mdx` and any other docs pages returned by the focused grep, plus `apps/web/config/product.ts` or adjacent public-copy files only if the audit proves that a stale label is visibly leaking into a public surface.

This milestone is intentionally conservative. Do not rename internal modules, internal hooks, or compatibility route keys just because their names are old. Only touch public surfaces that would confuse a builder. Success means the cleanup extends across the pages a builder is likely to read after the main overview pages, and any config changes are justified by a proven visible leak rather than speculation.

### Milestone 3: Validate the public story and record the remaining boundaries

At the end of this milestone, the changed public pages build cleanly, the affected docs routes read naturally in the browser, and this plan records what legacy terms intentionally remain visible and why. The validation should prove both negative and positive conditions: obsolete public nouns are no longer taught as the active route model, and compatibility redirects are still documented truthfully where they matter.

This milestone is complete when focused grep passes the agreed rule, `bun run build` passes, and a manual read of the affected docs routes shows a coherent codebase-first narrative from `Start Here` through the route map and protected-UX guidance. Any intentional residual uses of `mission`, `lesson`, or `artifacts` must be called out in this plan's `Outcomes & Retrospective` section so the next agent does not mistake them for accidental leftovers.

## Concrete Steps

Work from the repository root.

Begin by re-running the focused inventory on the public docs and adjacent public surfaces:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ rg -n "\bmission\b|\blesson\b|\bartifacts\b|/mission|/lesson/\[lessonKey\]|/artifacts|codebase-first" apps/web/content/docs apps/web/features/marketing apps/web/content/blog -g '*.mdx' -g '*.tsx'

The expected observation is a short, reviewable hit list rather than thousands of scattered uses. At plan creation time, the strongest known contradictions are in `implement-the-first-protected-ux.mdx` and `customize-the-starter.mdx`, while `index.mdx`, `how-the-starter-works.mdx`, and `route-map.mdx` are mostly alignment edits.

Read the canonical codebase-first contract again before editing any docs page:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ sed -n '1,220p' apps/web/AGENTS.md
    $ sed -n '1,220p' docs/ship-by-sunday/codebase-contract-and-question-map-2026-03-23.md
    $ sed -n '25,150p' apps/web/config/product.ts

The expected observation is that the public contract is already settled. `/start`, `/product`, `/design`, `/marketing`, `/build-plan`, `/review`, and `/execute` are the active story. `/mission`, `/lesson/[lessonKey]`, and `/artifacts` are compatibility routes only.

Rewrite the primary public docs pages in one pass so the language stays consistent across them. After editing, rerun a narrower grep on just the touched files:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ rg -n "\bmission\b|\blesson\b|\bartifacts\b|/mission|/lesson/\[lessonKey\]|/artifacts" \
      apps/web/content/docs/index.mdx \
      apps/web/content/docs/how-the-starter-works.mdx \
      apps/web/content/docs/customize-the-starter.mdx \
      apps/web/content/docs/route-map.mdx \
      apps/web/content/docs/implement-the-first-protected-ux.mdx

The expected observation is that any remaining hits are compatibility-only wording such as "legacy compatibility route" or an explicit statement that the internal lesson engine still exists behind the public codebase flow.

Audit the supporting public surfaces and only expand the diff when the page still teaches the wrong public product model:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ rg -n "\bmission\b|\blesson\b|\bartifacts\b|/mission|/lesson/\[lessonKey\]|/artifacts" apps/web/content/docs -g '*.mdx'
    $ rg -n "\bartifacts\b" apps/web/features/marketing apps/web/content/blog -g '*.tsx' -g '*.mdx'

The expected observation is that some hits may be acceptable generic or compatibility references. Do not remove those automatically. Read each hit in context and only rewrite the lines that still create route or surface confusion for a public reader.

When the doc edits are complete, run the build:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run build

The expected observation is a successful Next build. At plan creation time, the root build already passes, so a failure after the docs edits should be treated as a real regression to diagnose, not as a known baseline issue.

Finish by manually reviewing the affected docs routes in local development:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run dev:web

Open `/docs`, `/docs/how-the-starter-works`, `/docs/customize-the-starter`, `/docs/route-map`, `/docs/implement-the-first-protected-ux`, and `/docs/troubleshooting/access`. The expected observation is that the pages now read as one coherent codebase-first builder story, and any legacy route names appear only as clearly labeled compatibility notes.

## Validation and Acceptance

Acceptance is behavioral and reader-visible. A public reader who starts on `/docs` and follows the main builder guidance should be able to identify the correct protected route model without guessing: `/start` first, then the codebase stages, then `/review`, then optional `/execute`. They should not be told that `mission`, `lesson`, or `artifacts` are the current primary product surfaces.

The required automated proof is a focused grep plus a green build. The focused grep must show that remaining legacy-term hits inside `apps/web/content/docs` are compatibility-only or internal-context references. `bun run build` must pass from the repository root.

The required manual proof is a local browser read of the affected docs pages. The pages should feel like one narrative rather than a patched set of conflicting updates. If the implementation changes any public-facing labels outside `/docs`, include those exact pages in the manual review set.

This slice does not require checkout, Stripe, Convex, or browser-smoke proof unless the implementation unexpectedly changes runtime route behavior or public UI components outside the docs content. If the work stays docs-and-copy only, broader runtime QA is unnecessary and should not be claimed.

## Idempotence and Recovery

The plan is safe to rerun because it is a language-alignment pass over existing public surfaces, not a data migration or route deletion. Re-running the grep inventory should always produce the current remaining hit list. Re-reading the canonical route contract before each edit pass should always converge on the same codebase-first story.

If a docs edit starts to force an internal rename, stop and revert that scope expansion before continuing. This slice should not delete compatibility routes, rename `features/course/**`, or remove internal lesson-engine concepts that are still required for the runtime. If a public label change in `apps/web/config/product.ts` turns out to affect internal-only UI or tests in unexpected ways, revert that label change and keep the docs cleanup moving independently.

If `bun run build` fails after the edit pass, first check whether the failure is in one of the touched docs or public-copy files. Repair those regressions and rerun the build. If the failure is clearly unrelated to this slice, document the exact failure in `Surprises & Discoveries` and `Outcomes & Retrospective`, then keep the grep and manual-review proof separate from the blocked build result instead of claiming a full pass.

## Artifacts and Notes

The strongest known contradiction at plan creation time is in `apps/web/content/docs/implement-the-first-protected-ux.mdx`:

    In this repo, the protected product language is:
    - mission
    - lesson/[lessonId]
    - artifacts
    - settings

The compatibility routes are already truthful in code:

    apps/web/app/(workspace)/mission/page.tsx -> redirect(routeConfig.start)
    apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx -> redirect(routeConfig.start)
    apps/web/app/(workspace)/artifacts/page.tsx -> redirect(routeConfig.review)

The public docs already explain why this slice matters:

    apps/web/content/docs/route-map.mdx
    "If you use the wrong route language in prompts or docs, the agent can implement the right idea against the wrong surface."

The repository baseline build passed during planning on 2026-03-26 19:25 EDT:

    $ bun run build
    ✓ Compiled successfully
    ✓ Generating static pages
    Route (app) ... /start /product /design /marketing /build-plan /review /execute /mission /artifacts /lesson/[lessonKey]

## Interfaces and Dependencies

`apps/web/AGENTS.md` is the public-story contract for this slice. It defines the required funnel and explicitly preserves compatibility redirects. The implementation must follow that contract rather than inventing new route names.

`apps/web/config/product.ts` is the runtime route and label source. `routeConfig` defines the public codebase-first paths plus the compatibility routes. `starterConfig.workspace` is the adjacent label boundary that may or may not need cleanup depending on whether those labels are actually rendered publicly.

`apps/web/features/starter/lib/starter-selectors.ts` is the bridge between config and visible copy. If a public-facing label leak is found, this file is part of the dependency chain that explains how the label reaches the UI.

`apps/web/content/docs/*.mdx` are the main implementation targets. They are built into the public docs app and should be treated as customer-facing product surfaces, not as internal notes.

`apps/web/app/(workspace)/mission/page.tsx`, `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx`, and `apps/web/app/(workspace)/artifacts/page.tsx` are compatibility-route dependencies. They must continue to exist and continue redirecting to their codebase-first destinations after this slice.

`apps/web/features/marketing/**` and `apps/web/content/blog/**` are adjacent public-copy dependencies. They are not automatic rewrite targets, but they must be checked if the public-story grep shows that they still teach obsolete route or surface language.

The internal `features/course/**` lesson engine, Convex lesson-state storage, and codebase compiler field model are explicitly out of scope for this slice unless a public docs statement about them is materially false. This plan fixes the public story, not the internal implementation vocabulary.
