# Changelog

## 2026-03-28

### Changed

- Reworked the protected packet stage experience around step-local components, leave-guard behavior, and clearer scale-style inputs so stage progress, save feedback, and navigation stay tighter and more resilient while the packet path remains the same.
- Added a local Ship by Sunday CLI with shared packet-compiler contract helpers, readiness review, import/export/apply/generate flows, agent-oriented introspection and mutation commands, batch mutation support, and docs that explain both the human and machine workflows.

## 2026-03-27

### Changed

- Collapsed Review & Download to one `Starter Snapshot` repo archive, retired the standalone Design/Marketing/Build zip endpoints, and moved the generated pack materials into the repo-root `docs/` tree inside that single download.
- Restored the post-review bonus library so `/execute` now hands first-time users into the bonus bridge, `/mission` becomes the unlocked continuation library, and bonus lessons read from dedicated Convex route state instead of falling back to legacy redirects.
- Refreshed the public homepage, docs shell, and auth surfaces with tighter copy, calmer docs chrome, a new tech-stack cloud, and a checkout flow that waits for the server auth response before redirecting signed-out visitors.

## 2026-03-26

### Changed

- Reframed the public homepage around the Sunday promise, added the new starter-system section, removed the badge-and-card-heavy landing-page chrome, refreshed the Open Graph surface, and kept the homepage CTA and structured-data contracts green through targeted smoke coverage.
- Turned the protected packet flow into a clearer progression with stage-level navigation, a stronger review-and-download checkpoint, and a new post-review `Execute / Ship` hub that unlocks only after the required review step.
- Reframed the protected packet funnel around routed packet pages: `/product`, `/design`, `/marketing`, and `/build-plan` now redirect into semantic nested packet pages, complete saves advance by URL, Start and Review use the packet-local Bunny video system, and the Product problem page intentionally uses a non-video `L2` fallback until the missing recording exists.
- Refreshed the identity auth surfaces so `/sign-in` now uses a branded Ship by Sunday shell with cold-visit versus recovery-state handling, while `/session-tasks/reset-password` and `/sso-callback` inherit the same premium identity frame instead of falling back to generic auth cards.

## 2026-03-25

### Changed

- Established the `dev -> main` production release workflow: `dev` now acts as the shared integration branch, `main` is the protected production branch, Vercel production tracks `main`, and the root/docs guidance now explains the real promotion path instead of a local-shell-first deploy habit.
- Added `.github/workflows/convex-production-deploy.yml` so Convex production deploys are controlled from GitHub on `main`, with an explicit rollout guard, a manual dry-run path, and a repository variable switch (`CONVEX_PRODUCTION_DEPLOY_ENABLED`) that can pause or resume automatic production deploys.
- Hardened CI to match the release workflow by giving the static job safe build-time placeholder env values, fixing Playwright browser smoke so it can boot without a real hosted Convex URL in CI, and adding focused observability coverage tests so `bun run check` now passes before release promotion.
- Reframed the public product story around `Agent-Ready Packs`, added a new homepage `durability` section plus pack-system visuals, and removed the old guided-sprint / four-block / starter-template pitch from the visible homepage contract.
- Renamed the protected review and download contract to the outward artifact set `Design Pack`, `Marketing Pack`, `Build Pack`, `Prompt Pack`, and `Starter Snapshot`, including the review UI, packet headings, and archive filenames.
- Disabled the legacy visible `starterRepo` path by default, removed it from the visible protected workspace inventory, and aligned the shipped docs entry points with the new pack-first public story.
- Clarified the hosted and production QA runbooks so they now distinguish `qa/personas.local.json` account credentials from the selected Clerk and Convex env source, document `QA_ENV_FILE` plus `PLAYWRIGHT_BASE_URL` for non-local targets, and point operators at the single `qa:run-pack` command for post-deploy verification.
- Closed the journey-first QA initiative by documenting the team’s shared QA operating model in the root README, capturing the role split in durable docs, and proving the repaired production billing handoff with both a webhook-fix report and a fresh automatic live no-cost rerun.

## 2026-03-24

### Changed

- Replaced the protected product contract with a packet-first runtime on `/start`, `/product`, `/design`, `/marketing`, `/build-plan`, `/review`, backed by canonical `projectDefinitions` in Convex instead of `lessonStates` for the new product path.
- Added a real `packages/packet-compiler` workspace package that owns canonical packet schemas, stage readiness, deterministic packet rendering, packet archive generation, repo snapshot materialization, and the final review-download zip.
- Added protected packet download routes for design, marketing, build, and the final repo snapshot, with the generated repo embedding `packet/` at the root and overlaying starter seams such as `apps/web/config/product.ts` and `apps/web/features/marketing/content/home.ts`.
- Changed checkout and protected-home recovery to land in `/start` and the first incomplete packet-first stage, while converting `/mission`, `/lesson/[lessonKey]`, and `/artifacts` into compatibility redirects instead of canonical product surfaces.
- Updated the live starter docs and route map to describe the packet-first flow, and increased the local Playwright production-server timeout to match the real `next build` cost during browser smoke.
- Removed the Turbopack NFT warning for filesystem-heavy packet and Codex server code by moving those imports behind Node-runtime dynamic boundaries instead of static route imports.
- Shipped the observability incident bus end to end: normalized `incidents` now drive Telegram delivery, production Clerk and Vercel webhooks land as first-class incidents, Telegram delivery failures become non-recursive `telegram_delivery` incidents, and maintainers can change live incident state through a token-protected status route.
- Hardened the production deploy path for observability by splitting Convex browser traffic from Convex HTTP-action traffic (`NEXT_PUBLIC_CONVEX_URL` vs `NEXT_PUBLIC_CONVEX_SITE_URL`), fixing the Convex env loader so unrelated secrets no longer block backend deploys, and documenting the exact env parity required across Vercel and Convex.
- Enriched Stripe failure incidents so checkout failures, webhook verification failures, missing `clerkUserId`, and grant-persistence failures now include stronger dashboard links and configuration context instead of generic billing errors.
- Modularized the public homepage so starter config now controls fixed top-level sections and CTA targets, while the landing page keeps the default checkout funnel, founder-led social proof, truthful FAQ/Product schema, and browser-smoke-verified anchors.
- Added a backward-compatible starter contract in `config/product.ts`, so brand defaults, workspace labels, and optional modules now have a single code-defined control plane.
- Added soft module gating for `docs`, `course`, and `starterRepo`, so the app now hides or disables those surfaces deliberately instead of leaving haunted leftovers.
- Replaced the `course = false` protected-shell dead end with a real neutral starter workspace home on `/mission`, while leaving lesson and artifacts routes on explicit disabled states and keeping the purchase-to-access contract unchanged.
- Synced the canonical starter docs so `README.md`, public builder docs, and the route/customization docs now describe starter mode, module flags, and the neutral protected workspace home.

## 2026-03-21

### Changed

- Moved the protected workspace and auth entrypoints into dedicated route groups, so `/mission` now handles access recovery inline instead of bouncing through a separate recovery route.

## 2026-03-20

### Changed

- Fixed the stage-unlock repair buttons so Design handoff call-to-actions now follow canonical lesson-key routes instead of stale numeric lesson URLs after the lesson identity migration.
- Added public SEO infrastructure for the marketing and docs surface: root metadata defaults, canonical host resolution, generated `robots.txt` and `sitemap.xml`, Open Graph and Twitter image routes, homepage JSON-LD, and explicit `noindex` metadata on protected/auth/checkout/session-task flows.
- Expanded the SEO pass with docs-specific canonical/OG/Twitter metadata defaults, FAQ schema on the homepage, docs `lastModified` sitemap hints, and regression coverage for rendered metadata, crawl endpoints, and non-indexable auth surfaces. Also hardened `/checkout/success` so missing-session recovery no longer triggers unnecessary authenticated access preloads.
- Replaced the old lesson registry stack with a single curriculum kernel, so lesson order, canonical labels, stable lesson identity, route segments, and in-app video attachment now come from one typed source instead of being split across lesson files, rail logic, and video remaps.
- Switched lesson routing and saved course progress from numeric lesson ids to stable lesson keys, while keeping numeric lesson labels as display-only UI and redirecting old numeric lesson URLs onto the new stable lesson routes.
- Unified the student lesson labels across mission, lesson, artifact, and footer-rail surfaces so the UI now shows the same canonical lesson label instead of mixing numeric lesson ids with local rail-only step numbers.
- Simplified the starter access model so the code and docs now describe one generic `product access` layer backed by Convex, with a shared protected route-group layout instead of repeating page-level access checks.
- Switched the JavaScript toolchain from `pnpm` plus the leftover ESLint path to Bun plus Oxc, updating package scripts, CI, local helper commands, and the repo’s setup and QA docs to use `bun run` and `bunx`.
- Hardened protected-route and checkout hydration so pages now render from server-fetched access or mission snapshots first, then resume Clerk-gated live Convex queries without the transient client-side `Unauthorized` error.

## 2026-03-18

### Changed

- Reorganized the runtime into feature-first folders so `app/` stays focused on Next.js entrypoints while marketing, checkout, course runtime, Codex, shared UI, and platform adapters now live under `features/`, `shared/`, and `platform/`.

## 2026-03-17

### Changed

- Added a repo-local lesson video publish pipeline that validates `Ready/` filenames against live lesson ids, runs approved source videos through Auphonic, uploads the processed output to Bunny Stream, generates the app-owned `lib/course/media.ts` attachment catalog, and switches lesson playback to Bunny’s embed player when media is attached.

## 2026-03-13

### Changed

- Replaced the local sign-in and sign-up route branding with repo-owned `Ship by Sunday` headings and forced those auth links to stay on the local routes instead of jumping to the hosted Clerk domain.
- Hardened `/checkout/success` so it now validates `session_id` against Stripe and shows distinct states for missing session, invalid session, sign-in required, wrong account, payment pending, and validated paid checkout.
- Added an explicit local testing runbook in `docs/dev/testing.md` that covers code checks, shared QA accounts, browser QA flow, and Stripe sandbox verification.
- Removed lesson `2.7` from the live student flow, so finishing `2.6` now unlocks Build directly and the old Design wrap-up no longer interrupts momentum.
- Turned lesson `3.1` into a watch-only Build kickoff, so students now go from Design straight into the kickoff video and then into repo mapping instead of filling out another in-app prompt step.
- Tightened the shared lesson-workbench readability system by using lesson `1.2 Pick One User` as the proving surface, then pushing calmer type hierarchy, spacing, field chrome, and support-card rhythm across guided, focus, watch, prompt-import, and stage-unlock states.
- Tightened lesson `1.6` so Scope Hammer now reads as a manual-first decision pass with ordered keep/cut lists, clearer draft provenance, and a stronger Sunday-sized boundary check.
- Simplified lesson `1.5` so the core-flow page now teaches one clear instruction path, trims repeated scaffolding, and gives `1.6` a cleaner uploaded-map handoff.
- Simplified the bottom lesson rail so students now move with left/right navigation, see lighter step markers instead of repeated status badges, and get clearer stage-boundary movement without visible `Q` / `E` shortcut teaching.
- Tightened lesson `1.7` so the CEO wrap-up now requires a quick handoff review before `Unlock Design`, reframes the summary around Design-ready constraints, adds direct repair links back to weak CEO steps, and gives `2.1` a clearer brief-to-references bridge.
- Reworked lesson `1.3` so students now get inline weak-to-strong outcome coaching, clearer promise/proof/pain-removed prompts, a live `Outcome Statement` preview, and stronger continuity into `1.4`.
- Reworked lesson `1.2` so choosing a user now feels like a real commitment, with inline decision criteria, pressure-test guidance, a live `User Statement` preview, and clearer completion coaching.
- Added managed ChatGPT/Codex account connection in `Settings` and in-app `Generate with Codex` for prompt-import lessons (`1.4`, `1.6`, `2.6`) while keeping manual copy/paste fallback intact.
- Fixed the top lesson-shell stage chips so unlocked blocks now show a `ready` state instead of a false `locked` state, keeping chip visuals consistent with actual clickable access.
- Reworked the `access-required` screen into clearer `Already paid` vs `Need to buy access` decision paths so buyers can recover access faster without guesswork.
- Simplified lesson prompt-import UX by demoting AI import to an optional assist flow, keeping manual editing primary, and collapsing split layouts when coach is hidden so screens do not reserve dead space.
- Reorganized the repo docs so the public root now leads with product/setup/contribution guidance, while launch trackers, role prompts, and workstream plans live under `docs/internal/`.

## 2026-03-12

### Changed

- Stage rail `Q` and `E` navigation now moves across unlocked stage boundaries, so you can jump from the end of one block into the first lesson of the next block and back without reopening the mission map.
- Reworked lesson `1.5` into a video-first paper exercise so students now watch the walkthrough, sketch the core flow off-screen, and upload one photo instead of using the in-app flow editor.
- Reworked the Build block to be prompt-led instead of worksheet filler.
- Added a new kickoff step that lets students choose a starting path, generate a stronger build prompt, and move into the first slice faster.
- Turned the `3.2` Build lesson into a video-first watch step so students move from the walkthrough straight into local setup without extra in-app checklist friction.
- Tightened the rest of the Build lessons around starter setup, first-screen implementation, core UX build, blocker debugging, and local-build handoff.
