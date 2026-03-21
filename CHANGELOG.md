# Changelog

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
