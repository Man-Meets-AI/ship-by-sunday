# Simplify the Post-Review Bonus Library Into a Clean Video-Only Continuation System

This document is a living execution plan for cleaning up the continuation bonus system that unlocks after `Review & Download`. It is written so a new coding agent can execute the work from the repository alone, then keep the plan updated as discoveries, scope decisions, milestone results, and validation evidence come in.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this change, a customer who reaches review, downloads the Codebase, and then explicitly continues into the bonus will get a clear post-review continuation flow instead of a half-restored lesson system. `/execute` will stay a bridge page with a video and exactly two choices: the recommended `Continue` path jumps to lesson `3.1`, and the secondary `Start from the beginning` path jumps to lesson `1.1`. After unlock, `/mission` remains the browseable library home for all 29 lessons, and `/lesson/*` remains directly bookmarkable. The bonus lessons themselves will be view-only: video, transcript, helpful links, and static copyable reference cards are allowed, but no workbench, no entry fields, no completion checklists, and no broken dynamic prompt cards that depend on saved lesson state. A human will know this works when they unlock the bonus from `/review`, land on `/execute`, choose either path, see Product -> Design -> Build -> Ship in the top rail, see the bottom video-game skill rail only on lesson pages, and never encounter stale workbench UI or misleading `completed` language.

## Progress

- [x] 2026-03-27 12:25 EDT — Read the repo root `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, `docs/prompts/execplan-writer.md`, `docs/prompts/execplan-grill.md`, the codebase contract docs, and the recent execute-ship ExecPlans to freeze the planning slice.
- [x] 2026-03-27 12:25 EDT — Inspected the live post-review bonus route, the execute bridge, the bonus mission query, the shared lesson registry, the workbench runtime, the shell codebase, the media map, the lesson-video remap data, and the current unit and integration tests.
- [x] 2026-03-27 12:25 EDT — Confirmed that the live `/lesson/[lessonKey]` route already renders `BonusLessonPage` and `LessonShellWatch`, while the older interactive `LessonPage` runtime is no longer reached by the current route tree.
- [x] 2026-03-27 12:25 EDT — Confirmed that the shared lesson model still carries old workbench semantics: all 29 student-facing lessons still have a `workbench` value, 21 still carry `workbenchFields`, and 14 still carry `workbenchSections`, even though the unlocked bonus route no longer renders them.
- [x] 2026-03-27 12:25 EDT — Confirmed that runtime video attachment still comes from `videoAssetId` in `apps/web/features/course/lesson/model/curriculum.ts` plus `apps/web/features/course/lesson/model/media.ts`, while `apps/web/features/course/lesson/model/video-assignments.ts` is unused by runtime and `apps/web/scripts/data/lesson-video-remap.json` is only part of the transcript pipeline.
- [x] 2026-03-27 13:44 EDT — Completed the grill pass with the product owner. Locked the post-review contract: keep all 29 lessons in the library, keep the shared lesson catalog as the source of lesson identity and order, use route and state overrides instead of introducing a second manifest, keep `/execute` as a bridge page with two CTAs (`3.1` and `1.1`), keep `/mission` and `/lesson/*` directly bookmarkable after unlock, keep the explicit review-side unlock after the user requests the Codebase download, redirect repeat `/execute` visits to `/mission`, render the top rail in natural order `Product -> Design -> Build -> Ship`, default `/mission` to the Build block, show the bottom skill rail only on lesson pages, normalize all bonus progress language to explored or unopened, and allow only static copy-prompt/reference cards on bonus lessons.
- [x] 2026-03-27 14:04 EDT — Reconciled the bonus route and shell behavior to the grilled contract. `/execute` is now a clean bridge with CTAs to `3.1` and `1.1`, bonus labels use natural `Product / Design / Build / Ship` order, `/mission` keeps Build as the default active block, and the shell now supports independent top and bottom rail visibility so `/execute`, `/mission`, and `/lesson/*` can each render the intended navigation chrome.
- [x] 2026-03-27 14:04 EDT — Converted the bonus prompt-card path to a static contract. `CopyPromptResourceCard` now copies `resource.body` directly, `LessonShellWatch` presents prompt cards and links as passive teaching aids, and lesson `1.6` now carries a static research prompt body that works without pinned artifacts.
- [x] 2026-03-27 14:05 EDT — Kept `apps/web/features/course/lesson/model/video-assignments.ts` as the single runtime lesson-to-video resolver, updated `curriculum.ts` to validate against it instead of duplicating it, and updated `video.ts` plus `lesson-video-support.test.ts` so lesson identity wins over Bunny title metadata.
- [x] 2026-03-27 14:06 EDT — Deleted the bounded unreachable `LessonPage` chain and its direct hook test: `lesson-page.tsx`, the lesson-page footer/skeleton helpers, `use-lesson-page.tsx`, `use-lesson-page-data.ts`, `use-lesson-state.ts`, and `tests/unit/use-lesson-state.test.tsx`.
- [x] 2026-03-27 14:09 EDT — Updated route docs and local QA docs for the restored bonus behavior and ran focused validation. Targeted bonus unit tests, targeted integration-ui tests, `apps/web bun run typecheck`, and root `bun run build` all passed.
- [x] 2026-03-27 14:10 EDT — Ran the broader `apps/web bun run test:unit` suite. The only failure introduced by this slice was the old `Completed lesson` aria expectation in `tests/unit/skill-rail.test.tsx`, which was fixed to `Explored lesson`. The suite still ends with two unrelated failures in `tests/unit/vercel-output-tracing.test.ts` caused by the already-dirty output-tracing work in the tree, not by the bonus-route cleanup.
- [ ] Run a real authenticated browser proof of the unlocked `/review -> /execute -> /mission|/lesson/*` path with an account that has already reached the post-review bonus unlock.
- [ ] Decide whether the deeper `features/course/lesson/workbench/**` tree should be deleted in a follow-up slice. The bounded unreachable `LessonPage` chain is gone, but the renderer and mode tree still remain because shared lesson seed files and legacy unit tests still import them.

## Surprises & Discoveries

The live bonus lesson route is already video-only at the page layer. `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx` resolves the route segment, gates on post-review unlock, and then renders `apps/web/features/execute-ship/components/bonus-lesson-page.tsx`. That page mounts `BonusLessonViewTracker` and `LessonShellWatch`. It does not mount `WorkbenchRenderer`, `useLessonPage`, or the old interactive lesson page.

The underlying lesson model is still carrying the old course-era scaffolding. `apps/web/features/course/lesson/model/video-lesson-factory.ts` defaults every video lesson to `shell: "split"`, `workbench: "guided_form"`, `coachVideoPlacement: "workbench"`, and always writes `content.workbench`, even when a lesson has no fields and the live route only renders the watch shell. The current shared curriculum therefore says “workbench lesson” even when the customer experience says “video-only reference lesson.”

The shared lesson catalog is still the live source of truth for the bonus library, and the product owner wants to keep it that way. The cleanup therefore must not invent a second manifest for the same 29 lessons. Instead, it must keep the shared lesson catalog as the identity and ordering source, then override the post-review route, shell, and state behavior so the same lessons render as a view-only bonus system.

There are real media mismatches in the current repo, so the plan needs a dedicated lesson-to-video audit. Comparing shared lesson titles to attached Bunny asset titles shows at least three live mismatches today:

    1.3  start-with-the-problem  LESSON=Start With the Problem  VIDEO=Pick One User
    1.4  pick-one-user           LESSON=Pick One User           VIDEO=Define the Outcome
    3.14 wrapping                LESSON=Production Deploy Handoff VIDEO=Wrapping

The product owner explicitly said to ignore the Bunny title metadata where it conflicts and repair the mapping by judgment, then perform a human QA pass afterward. That means lesson identity in the shared catalog is the canonical source, while Bunny titles are treated as unreliable metadata.

The shell behavior is more coupled than it looks. Passing a `mission` object into `AppShell` currently gives bonus pages both the top block rail and the bottom lesson rail. The grilled product contract requires a split: `/execute` should show no codebase, `/mission` should show only the top block rail, and `/lesson/*` should show both the top block rail and the bottom video-game lesson rail. The plan therefore needs a specific shell seam, not just copy updates.

Dynamic copy-prompt cards are incompatible with the current bonus route as written. `BonusLessonPage` passes `pinnedArtifacts={[]}` into `LessonShellWatch`, and `use-copy-prompt-resource-card.ts` resolves prompts through `getPromptTemplateState()`, which depends on pinned artifacts for some templates. At least one current lesson resource, the competitor research prompt in `apps/web/features/course/lesson/model/lessons/ceo.ts`, needs prior saved artifact context. The grilled contract therefore now allows only static copyable prompt and reference cards on bonus lessons. Dynamic cards must be removed or rewritten before they appear on the bonus route.

The existing bonus UI still encodes outdated assumptions that conflict with the grilled contract. `buildBonusShellMission()` in `apps/web/features/execute-ship/lib/bonus-library-presentation.ts` currently forces BUILD first, `BonusMissionPage` hardcodes `currentBlockId="BUILD"`, `BonusMissionBlockCard` still shows `Completed earlier`, and the current `/execute` bridge only offers “Start lesson 3.1” plus “Browse the bonus library.” All of those behaviors now need explicit plan updates rather than being left to implementer interpretation.

The current local tree already reintroduced `video-assignments.ts` into the runtime path. The earlier planning assumption that it was unused by runtime was stale by the time implementation began: `curriculum.ts` now validates manifest `videoAssetId` values against `resolveLessonVideoAssetId()`, and `video.ts` resolves lesson assets through the same helper. The correct cleanup in this tree was therefore to keep `video-assignments.ts` as the single runtime resolver and stop duplicating the resolved asset id onto the runtime lesson registry.

The broader `apps/web` unit suite is not fully green, but the remaining failures are outside this slice. After fixing the bonus-related `skill-rail` wording expectation, the only remaining failures came from `tests/unit/vercel-output-tracing.test.ts`, which is already drifting because unrelated output-tracing work is present in the dirty tree. The bonus-route cleanup therefore has focused green coverage plus successful typecheck, contracts, and production build, but not a fully clean all-unit run.

Evidence from repo inspection:

    $ bun -e 'import { getStudentFacingLessons } from "./apps/web/features/course/lesson/model/registry"; const lessons = getStudentFacingLessons(); console.log(JSON.stringify({ total: lessons.length, withWorkbench: lessons.filter(l => Boolean(l.workbench)).length, withFields: lessons.filter(l => (l.workbenchFields?.length ?? 0) > 0).length }, null, 2));'
    {
      "total": 29,
      "withWorkbench": 29,
      "withFields": 21
    }

    $ rg -n "LessonPage" apps/web -g '!**/node_modules/**'
    apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx:5:import { BonusLessonPage } ...
    apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx:43:return <BonusLessonPage ... />
    apps/web/features/course/lesson/components/lesson-page.tsx:125:export function LessonPage({

    $ rg -n "lessonVideoAssignments" apps/web/features/course/lesson/model -g '!**/node_modules/**'
    apps/web/features/course/lesson/model/video-assignments.ts:3:export const lessonVideoAssignments ...

    $ rg -n "lesson-video-remap.json" apps/web -g '!**/node_modules/**'
    apps/web/scripts/lib/video-transcript-pipeline.mjs:32:"lesson-video-remap.json",

## Decision Log

Decision: This plan supersedes the narrower route-restoration framing in `docs/codex/2026-03-27-execute-ship-workspace-refresh-execplan.md`.
Rationale: The current problem is not only route restoration. The bonus system still carries bad shell assumptions, stale workbench semantics, unreliable video mapping, and dead interactive lesson runtime. Fixing only the route layer would preserve the same structural mess.
Date/Author: 2026-03-27 / Codex

Decision: Keep the current shared 29-lesson catalog as the canonical source of lesson identity and natural ordering for the bonus library.
Rationale: The product owner wants all lessons kept and wants this solved as a state and route change rather than by maintaining a second manifest for the same lesson inventory.
Date/Author: 2026-03-27 / Codex

Decision: The post-review cleanup will use route and state overrides on top of the shared catalog, not a separate bonus manifest.
Rationale: The product owner explicitly prefers the simpler architecture. The current live routes already prove that a bonus-specific route mode can render the shared lesson catalog differently after unlock.
Date/Author: 2026-03-27 / Codex

Decision: `/execute` remains a bridge page with exactly two CTAs: `Continue` goes to lesson `3.1`, and `Start from the beginning` goes to lesson `1.1`.
Rationale: This preserves a recommended continuation path while also giving the user an explicit way to start from the first block and first lesson of the unlocked library.
Date/Author: 2026-03-27 / Codex

Decision: The post-review unlock remains a separate review-side action that appears only after the user requests the `Download Codebase`.
Rationale: The product owner chose to keep the required funnel ending at download, then offer the bonus as a conscious next step. This keeps `executeShipUnlockedAt` meaningful and preserves the current clean separation between download and bonus continuation.
Date/Author: 2026-03-27 / Codex

Decision: After unlock, `/mission` and `/lesson/*` remain directly bookmarkable and do not require the user to visit `/execute` first.
Rationale: The bridge is recommended orientation, not a mandatory checkpoint. This matches the current route model better and avoids inventing more state such as a bridge-consumed flag.
Date/Author: 2026-03-27 / Codex

Decision: Repeat visits to `/execute` after the user has opened any bonus lesson should redirect to `/mission`.
Rationale: The bridge is a first-time orientation surface. Once the bonus library has been entered, the browseable home should be `/mission`, not the same orientation page forever.
Date/Author: 2026-03-27 / Codex

Decision: The top block rail on bonus surfaces uses the natural course order `Product -> Design -> Build -> Ship` and the visible labels are exactly `Product`, `Design`, `Build`, and `Ship`.
Rationale: The grilled product contract needs the “start from the beginning” path to be truthful about the full sequence. Recommended BUILD-first behavior now belongs in CTA copy and default library focus, not in block reordering.
Date/Author: 2026-03-27 / Codex

Decision: `/mission` defaults to the Build block but shows only the top block rail. `/lesson/*` shows both the top block rail and the bottom skill rail. `/execute` shows neither rail.
Rationale: This matches the product owner’s desired UI split: library home for sections, lesson page for the video-game lesson rail, and a clean execute bridge.
Date/Author: 2026-03-27 / Codex

Decision: Bonus status language collapses all non-available states to explored or opened. The bonus system should never show `completed` wording.
Rationale: The cleaned-up bonus library is explicitly view-only. Preserving `Completed earlier` would leak old lesson-era semantics back into the post-review experience.
Date/Author: 2026-03-27 / Codex

Decision: Bonus lessons may render video, transcript, helpful links, and static copyable prompt or reference cards. Dynamic cards that require pinned artifacts or saved lesson-state context must not appear on the bonus route.
Rationale: The product owner wants explicit teaching aids kept, but the bonus path should not quietly pull the old workbench graph back into the system just to support dynamic prompt generation.
Date/Author: 2026-03-27 / Codex

Decision: Shared lesson identity wins over Bunny title metadata when they disagree.
Rationale: The product owner explicitly called the historical lesson-to-video mapping unreliable and asked for a pragmatic remap pass followed by human QA. The cleanup should therefore repair `videoAssetId` assignments to fit lesson identity rather than renaming the shared lesson catalog to match bad asset metadata.
Date/Author: 2026-03-27 / Codex

Decision: In the current local tree, `video-assignments.ts` remains the single runtime lesson-to-video mapping source.
Rationale: The active worktree already resolves lesson media through `resolveLessonVideoAssetId()` from both `curriculum.ts` and `video.ts`. Keeping that sparse assignment map and removing duplicated runtime `videoAssetId` state from the lesson registry is a smaller and clearer cleanup than deleting the resolver and rewiring runtime again.
Date/Author: 2026-03-27 / Codex

Decision: Static copy-prompt cards stay on the bonus route, so the prompt-card implementation was converted to use `resource.body` directly instead of hiding prompt cards entirely.
Rationale: The product owner explicitly approved static copyable prompt/reference cards. Converting the card implementation to a body-based static contract preserved those teaching aids while severing the dependency on pinned artifacts and saved lesson-state context.
Date/Author: 2026-03-27 / Codex

Decision: The bounded `LessonPage` chain was deleted now, but the deeper `features/course/lesson/workbench/**` tree remains for a follow-up audit.
Rationale: The route tree no longer referenced `LessonPage`, its footer helpers, or the `use-lesson-page*` and `use-lesson-state` hooks, so that dead slice could be removed safely. The deeper workbench tree is still imported by shared lesson seed files and legacy tests, so deleting it inside this slice would have widened scope materially beyond the route and bonus cleanup.
Date/Author: 2026-03-27 / Codex

Decision: Delete dead interactive lesson runtime only after the shared catalog can fully serve the grilled bonus flow without the workbench stack.
Rationale: Keeping the shared catalog means some lesson metadata still survives. The cleanup should therefore first sever all live dependencies on interactive runtime and dynamic prompt plumbing, then prune the dead code and replace obsolete tests.
Date/Author: 2026-03-27 / Codex

## Outcomes & Retrospective

Most of the intended outcome is now real in code. The post-review continuation system still uses the shared 29-lesson catalog, but the live routes and shell now behave like a dedicated bonus flow instead of a half-restored interactive lesson app. `/execute` is a bridge page with two explicit paths, `/mission` is the direct library home after unlock, `/lesson/*` remains directly bookmarkable, the top rail uses natural `Product -> Design -> Build -> Ship` order, the bottom skill rail stays on lesson pages only, and the bonus surfaces no longer show completion wording.

The prompt-card contract is also cleaner than it was at plan creation time. Instead of hiding prompt cards completely, the live bonus path now keeps static copyable cards and removes the dependency on pinned-artifact context, which better matches the product owner’s desired “view-only but still useful” lesson surface.

The lesson-to-video mapping is structurally cleaner but still requires human QA. The active tree now has a single runtime resolver in `video-assignments.ts`, and the lesson registry no longer carries a duplicated `videoAssetId` runtime copy. That removes a class of drift, but it does not prove every current assignment is semantically correct. The product owner explicitly accepted a manual verification pass for that.

The main remaining gap is verification, not architecture. Targeted bonus tests, targeted integration-ui checks, app typecheck, and root build are green. The remaining work is a real unlocked-browser walkthrough and, if desired later, a deeper follow-up slice to delete the broader workbench renderer and mode tree that still remains because shared lesson seed files and legacy unit tests import it.

## Context and Orientation

The required paid product is the codebase-first funnel documented in `apps/web/AGENTS.md` and the codebase docs under `docs/ship-by-sunday/`. The canonical customer path is `Start -> Product -> Design -> Marketing -> Build Plan -> Review & Download`. The codebase docs say that durable product data lives in canonical codebase facts, while post-download guidance is workflow state or optional execution support. This matters because the post-review bonus library is no longer allowed to act like the place where the app collects or stores real project-definition inputs.

The current post-review bonus surfaces live under `apps/web/features/execute-ship/`. The route entrypoints are `apps/web/app/(workspace)/execute/page.tsx`, `apps/web/app/(workspace)/mission/page.tsx`, and `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx`. The execute and mission pages already load bonus unlock state through `apps/web/features/execute-ship/server/load-bonus-route-access.ts`. The lesson route checks the same unlock and renders `apps/web/features/execute-ship/components/bonus-lesson-page.tsx`, which uses `LessonShellWatch` from the old lesson shell codebase.

The current bonus mission state comes from `apps/web/convex/course/bonusMission.ts`. That file uses the shared lesson registry from `apps/web/features/course/lesson/model/registry.ts`. The registry is assembled by `apps/web/features/course/lesson/model/curriculum.ts` out of lesson seeds from `apps/web/features/course/lesson/model/lessons/start-here.ts`, `apps/web/features/course/lesson/model/lessons/ceo.ts`, `apps/web/features/course/lesson/model/lessons/design.ts`, `apps/web/features/course/lesson/content/build.ts`, and `apps/web/features/course/lesson/model/lessons/ship.ts`. The grilled contract keeps that shared registry as the source of lesson identity and order, but the live bonus flow must stop behaving like an interactive lesson-workbench system.

The shell has two separate navigation systems. The top block rail is rendered by `apps/web/features/course/shared/components/app-shell/app-shell-header.tsx` through `AppShellMissionRail` or `AppShellMissionRailShadcn`. The bottom lesson rail is rendered by `apps/web/features/course/shared/components/app-shell/app-shell-footer-rail.tsx` through `SkillRailShadcn`. Today passing a mission into `AppShell` is enough to render both codebase. The grilled contract requires a specific split: `/execute` no codebase, `/mission` top rail only, `/lesson/*` top rail plus bottom rail.

The media layer is split across several files. `apps/web/features/course/lesson/model/media.ts` contains the Bunny assets keyed by asset id. `apps/web/features/course/lesson/model/video-assignments.ts` is now the single runtime lesson-to-video resolver. `apps/web/features/course/lesson/model/curriculum.ts` validates its manifest `videoAssetId` fields against that resolver but no longer emits a second runtime `videoAssetId` copy onto the lesson registry. `apps/web/features/course/lesson/model/video.ts` attaches assets by calling the same resolver. `apps/web/scripts/data/lesson-video-remap.json` is still used by the transcript pipeline and does not drive customer-facing routing.

The shared lesson model still contains a large amount of interactive runtime that the current route tree does not appear to use. The likely dead stack includes `apps/web/features/course/lesson/components/lesson-page.tsx`, `apps/web/features/course/lesson/hooks/use-lesson-page.tsx`, `apps/web/features/course/lesson/hooks/use-lesson-page-data.ts`, `apps/web/features/course/lesson/hooks/use-lesson-state.ts`, `apps/web/features/course/lesson/hooks/use-lesson-completion.ts`, and the `apps/web/features/course/lesson/workbench/` subtree. That stack cannot be deleted until the bonus routes, prompt-card handling, and any lingering tests no longer depend on it.

For this plan, a shared catalog means the current lesson identity source in `curriculum.ts` and the lesson seed files. A route and state override means changing the post-review bonus routes and shell behavior without creating a second lesson manifest. A static copyable card means a copy-prompt or reference card that can render its final contents without pinned artifacts or saved lesson-state context. A dynamic prompt card means a card whose prompt body is computed from earlier saved artifacts and therefore must be removed or rewritten before it can appear on the bonus route.

## Plan of Work

The work should proceed in five movements. First, align the route and shell contract to the grilled product decisions. The implementation should keep the shared lesson catalog as the source of lesson identity and ordering, then update the execute bridge, mission page, lesson page, and shell controls so the post-review bonus flow behaves exactly as agreed: `/execute` stays a bridge with two CTAs, `/mission` is the direct library home after unlock, `/lesson/*` remains directly bookmarkable, the top rail shows `Product -> Design -> Build -> Ship` in natural order, and the bottom skill rail appears only on lesson pages.

Second, make the bonus lesson surface truly view-only while preserving the allowed teaching aids. This means the bonus route must continue to render watch-mode lessons, but the content contract must be explicit: no workbench, no entry fields, no completion prompts, no dynamic prompt cards that depend on pinned artifacts, and no misleading `completed` language. Helpful links, transcripts, and static copyable prompt/reference cards may remain.

Third, repair the lesson-to-video mapping in the shared catalog. Because the shared lesson identity remains canonical, the implementation should treat `curriculum.ts` lesson identity and ordering as the truth and fix `videoAssetId` assignments accordingly. Bunny titles are not the acceptance source of truth; the product owner will do a human QA pass after implementation. The plan therefore needs explicit automated checks for obvious mismatches and one focused place where the mapping is edited.

Fourth, delete or reduce the now-dead interactive lesson runtime and replace obsolete tests. Once the live bonus flow no longer needs dynamic prompt-card state, workbench fields, or interactive lesson hooks, the implementation should run a reachability audit and then prune the dead modules in a controlled order. Tests that currently assert the old workbench or guided-form contract should be removed or replaced with tests that assert the grilled bonus-flow behavior instead.

Fifth, update docs and run end-to-end validation. The plan must leave behind a route contract and media ownership story that the next contributor can follow. Final validation must include focused tests, a production build, and a real browser walk through the post-review path with an unlocked account.

## Milestones

### Milestone 1: Align the execute bridge and shell behavior to the grilled post-review contract

At the end of this milestone, the live bonus routes and shell will match the product decisions made during the grill. `/execute` will be a clean bridge page with no top or bottom codebase. It will keep the bonus-context video and expose exactly two CTAs: the primary CTA jumps to lesson `3.1`, and the secondary CTA jumps to lesson `1.1`. `/execute` will remain directly protected by the existing post-review unlock and will continue to redirect repeat visitors who have already opened any bonus lesson to `/mission`.

`/mission` will be the library home after unlock. It will remain directly bookmarkable. It will show the top block rail only, using natural block order and the labels `Product`, `Design`, `Build`, and `Ship`. The library home will still default to the Build block as the active section, because Build remains the recommended continuation path. `/lesson/*` will remain directly bookmarkable after unlock and will show both the top block rail and the bottom skill rail, with the current lesson reflected in the bottom rail for its block.

The main files touched in this milestone are `apps/web/features/execute-ship/components/execute-ship-page.tsx`, `apps/web/features/execute-ship/components/execute-bonus-bridge-page.tsx`, `apps/web/features/execute-ship/components/bonus-mission-page.tsx`, `apps/web/features/execute-ship/components/bonus-lesson-page.tsx`, `apps/web/features/execute-ship/lib/bonus-library-presentation.ts`, and the relevant shell files under `apps/web/features/course/shared/components/app-shell/`. Success for this milestone means the shell and route behavior are correct before any deeper runtime deletion starts.

### Milestone 2: Make bonus lessons view-only and static-card safe

At the end of this milestone, the bonus lesson surface will be explicitly view-only. Bonus lesson pages must never render workbench panels, field validation, manual completion controls, or entry input UI. They may render video, transcript, helpful resource links, and static copyable prompt/reference cards. Any card that depends on pinned artifacts or previously saved lesson fields must be removed from the bonus path or rewritten into a static reference artifact.

The main files touched here are `apps/web/features/execute-ship/components/bonus-lesson-page.tsx`, `apps/web/features/course/lesson/shells/index.tsx`, the bonus presentation helpers, and whichever lesson seed files currently declare dynamic prompt resources that can leak into the bonus route. The likely examples to audit first are `apps/web/features/course/lesson/model/lessons/ceo.ts` and `apps/web/features/course/lesson/content/build.ts`. Success for this milestone means the bonus route can keep the approved teaching aids without pulling pinned-artifact or workbench-state plumbing back into the system.

### Milestone 3: Repair shared-catalog lesson-to-video mapping

At the end of this milestone, the shared lesson catalog will still be the source of lesson identity and ordering, but its post-review routes will play the intended videos. The implementation should audit the current `videoAssetId` assignments in `apps/web/features/course/lesson/model/curriculum.ts`, compare them to lesson identity rather than Bunny title metadata, and update the assignments so the post-review lesson pages and mission cards reflect the intended sequence. The implementation should also decide whether `apps/web/features/course/lesson/model/video-assignments.ts` becomes the maintained runtime source, or whether it is removed in favor of editing `videoAssetId` directly in `curriculum.ts`. Whichever path is chosen, there must be only one runtime mapping source afterward.

Success for this milestone means a customer who opens a visible lesson from `/mission` sees the intended video for that lesson, and a future contributor can answer “which video does this lesson play?” by reading one place in the runtime code. Because Bunny titles are unreliable, human QA remains part of this milestone’s acceptance criteria.

### Milestone 4: Delete dead interactive lesson runtime and obsolete tests

At the end of this milestone, the code paths that only existed to support the old interactive lesson-workbench runtime will be removed or sharply reduced. The likely audit targets are `apps/web/features/course/lesson/components/lesson-page.tsx`, `apps/web/features/course/lesson/hooks/use-lesson-page.tsx`, `apps/web/features/course/lesson/hooks/use-lesson-page-data.ts`, `apps/web/features/course/lesson/hooks/use-lesson-state.ts`, `apps/web/features/course/lesson/hooks/use-lesson-completion.ts`, and the `apps/web/features/course/lesson/workbench/` tree. The implementer must confirm reachability before deleting and should remove only after the live bonus routes, static prompt-card rule, and shared-catalog mapping are stable.

The test suite must be updated in the same phase. `apps/web/tests/unit/watch-lesson-contract.test.ts`, `apps/web/tests/unit/course-registry.test.ts`, `apps/web/tests/unit/guided-form-lessons.test.tsx`, `apps/web/tests/unit/use-lesson-state.test.tsx`, and `apps/web/tests/unit/course-state-lifecycle.test.ts` should be audited for obsolete assumptions and replaced with bonus-focused tests where appropriate. Success means the test suite no longer asserts the old workbench contract for the current product path.

### Milestone 5: Update docs and prove the post-review path end to end

At the end of this milestone, the route model, shell behavior, and media ownership story will be documented in the repo and validated in tests and a real browser session. The implementer should update any docs that still describe `/execute`, `/mission`, or `/lesson/*` incorrectly, then run focused bonus tests, the relevant unit and contract checks, a production build, and a browser proof with an unlocked account.

Success for this milestone means a human can go from `/review` to the explicit post-download continue CTA, land on `/execute`, choose either `Continue` or `Start from the beginning`, navigate through `/mission` and `/lesson/*`, and see coherent codebase, coherent bonus-language status badges, static teaching aids only, and the intended video content.

## Concrete Steps

Work from `/Users/parkerrex/Projects/ship-by-sunday` unless a step says otherwise.

Start by re-generating the current inventory and current mapping evidence before editing any files:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun -e 'import { getStudentFacingLessons } from "./apps/web/features/course/lesson/model/registry"; const lessons = getStudentFacingLessons(); for (const lesson of lessons) console.log(`${lesson.id}\t${lesson.block}\t${lesson.lessonKey}\t${lesson.workbench ?? "none"}\t${lesson.workbenchFields?.length ?? 0}\t${lesson.videoAssetId ?? "none"}`);'
    $ bun -e 'import { getStudentFacingLessons } from "./apps/web/features/course/lesson/model/registry"; import { getLessonVideoAsset } from "./apps/web/features/course/lesson/model/video"; const lessons = getStudentFacingLessons(); for (const lesson of lessons) { const asset = getLessonVideoAsset(lesson); const lessonTitle = lesson.title.trim(); const assetTitle = asset?.title?.trim() ?? ""; if (assetTitle && assetTitle.toLowerCase() !== lessonTitle.toLowerCase()) console.log(`${lesson.id}\t${lesson.lessonKey}\tLESSON=${lessonTitle}\tVIDEO=${assetTitle}`); }'

The expected observation is a 29-line lesson inventory showing old workbench semantics still attached, followed by a short list of title or mapping mismatches that need to be reconciled.

Next, inspect the bonus route, the shell codebase, and the current review-side unlock sequence:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ sed -n '1,220p' apps/web/features/execute-ship/components/execute-ship-page.tsx
    $ sed -n '1,260p' apps/web/features/execute-ship/components/execute-bonus-bridge-page.tsx
    $ sed -n '1,240p' apps/web/features/execute-ship/components/bonus-mission-page.tsx
    $ sed -n '1,260p' apps/web/features/execute-ship/components/bonus-lesson-page.tsx
    $ sed -n '1,260p' apps/web/features/course/shared/components/app-shell/app-shell-header.tsx
    $ sed -n '1,260p' apps/web/features/course/shared/components/app-shell/app-shell-footer-rail.tsx
    $ sed -n '1,260p' apps/web/features/codebase-flow/components/review/codebase-review-download-bridge.tsx

The expected observation is that the current bonus flow is close to the product goal but still has wrong CTA shape, wrong block ordering, wrong rail visibility, and wrong state labels.

When Milestone 1 starts, update the shell seam first. The likely change is to make `AppShell` independently control top mission rail visibility and bottom skill rail visibility so `/execute`, `/mission`, and `/lesson/*` can each render the intended combination. Then update the bonus presentation layer so the top rail uses natural block order and the visible labels `Product`, `Design`, `Build`, and `Ship`, while `/mission` still defaults to Build as the active block.

When Milestone 2 starts, audit every bonus-visible lesson resource that can render through `LessonShellWatch`. Remove or rewrite any copy-prompt card that needs pinned artifacts. Keep only static cards, transcripts, and explicit links. Do not solve this by wiring pinned artifacts back into the bonus route.

When Milestone 3 starts, choose one runtime mapping source and migrate to it. If `curriculum.ts` remains the source of `videoAssetId`, remove or clearly deprecate `video-assignments.ts` as runtime input. If `video-assignments.ts` is promoted, rewire `video.ts` to read it and eliminate conflicting runtime mapping elsewhere. After the mapping changes compile, run the focused bonus tests plus a focused mapping audit command again.

When Milestone 4 starts, run a reachability audit before deleting modules:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ rg -n "LessonPage|useLessonPage|useLessonState|WorkbenchRenderer" apps/web -g '!**/node_modules/**'

The expected observation before deletion is that the remaining hits are definitions, tests, or imports inside dead lesson-runtime files rather than live route entrypoints. Remove obsolete tests in the same phase that the dead runtime is deleted so the suite stops asserting the old guided-form contract.

Before closing the work, run the focused checks from `apps/web`, then the broader validation from the repository root:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project unit tests/unit/app-workspace-mission-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/bonus-mission-page.test.tsx tests/unit/bonus-lesson-page.test.tsx
    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run test:unit
    $ bun run test:contracts
    $ bun run build

If the route behavior or bonus surfaces change materially, run a real authenticated browser proof against a local dev session with the bonus already unlocked. Record the exact route walk and observations in `Artifacts and Notes` when implementation reaches that point.

## Validation and Acceptance

Acceptance is behavior-based.

The first acceptance criterion is that the post-review bonus library keeps all 29 lessons while behaving as a route and state override on top of the shared catalog, not as a second parallel catalog. The live bonus path must still use the shared lesson identity and natural order, while the post-review routes render it as a view-only continuation system.

The second acceptance criterion is that `/execute` behaves exactly as agreed. It must remain locked until the user reaches `/review`, clicks `Download Codebase`, and then explicitly chooses the continue CTA. Once unlocked, `/execute` must show a video bridge with exactly two choices: `Continue` goes to lesson `3.1`, and `Start from the beginning` goes to lesson `1.1`. If the user has already opened any bonus lesson, repeat visits to `/execute` must redirect to `/mission`.

The third acceptance criterion is that codebase behave exactly as agreed. `/execute` shows no codebase. `/mission` shows only the top block rail in natural order with labels `Product`, `Design`, `Build`, and `Ship`, while defaulting the active block to Build. `/lesson/*` shows the top block rail and the bottom skill rail for the current block. The library home must not show the bottom lesson rail.

The fourth acceptance criterion is that the bonus lesson surface is truly view-only. After unlock, opening `/lesson/*` must never render old input forms, workbench panels, field validation messages, or manual completion checklists. The only allowed lesson content is video, transcript, helpful resource links, and static copyable prompt or reference cards that work without pinned artifacts.

The fifth acceptance criterion is that bonus status language is normalized. The bonus system must not show `Completed earlier` or any other completion wording. Any bonus lesson that is not `available` should be presented as explored or opened.

The sixth acceptance criterion is that the lesson-to-video mapping is repaired enough to be trustworthy. When a customer opens a visible lesson from `/mission`, the lesson identity, the mission-card metadata, and the played video must line up according to the intended shared lesson catalog. Bunny title metadata does not have to match, but the product owner must be able to do a human QA pass without finding obvious route-level mismatches.

The seventh acceptance criterion is that dead lesson-era runtime and tests are removed or replaced. The test suite must stop asserting the old guided-form contract for the current product path, and the route tree must no longer carry unused lesson-workbench runtime solely because old tests still mention it.

The eighth acceptance criterion is that the unlocked customer path works end to end. A human with an unlocked account must be able to visit `/review`, request the starter download, continue into `/execute`, choose either path, land in `/mission` or the intended lesson page, and navigate the rest of the bonus system without stale workbench UI or broken prompt cards.

## Idempotence and Recovery

This cleanup should be performed in an additive-first, subtractive-second order. First align the shell, route, and content rules for the current live bonus path. Only after the bonus route is stable should the implementation delete the old interactive lesson runtime and obsolete tests.

Do not change the post-review unlock contract unless a real migration blocker forces it. Keeping `codebaseWorkflowStates.executeShipUnlockedAt` and the current review-side “download requested, then explicit continue” sequence avoids unnecessary schema churn and keeps the browser proof straightforward.

Do not solve static versus dynamic prompt-card problems by wiring pinned artifacts back into the bonus route. If a card depends on saved lesson-state context, remove it from the bonus surface or rewrite it as a static teaching aid. Reintroducing dynamic artifact plumbing would undermine the whole cleanup.

If the shared lesson-to-video mapping remains ambiguous during migration, prefer failing fast over silent fallback. Leave a lesson out of the visible bonus library temporarily or mark it for human follow-up rather than silently attaching a likely wrong asset.

If deleting the old interactive lesson runtime causes compile failures, restore only the smallest removed export needed to get the tree compiling, confirm which live file still depends on it, then either migrate that consumer or revise the deletion order in the plan before trying again. Avoid bulk restore of the entire workbench tree unless the reachability audit shows the migration path was wrong.

If the broad unit suite proves too coupled to the old lesson model, replace the obsolete tests incrementally instead of trying to keep both the old guided-form contract and the new bonus-video contract green at the same time. Record each replacement in `Progress` and `Decision Log`.

## Artifacts and Notes

The most important repo evidence for this initiative is:

    Live bonus route entry:
    apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx

    Live execute bridge:
    apps/web/features/execute-ship/components/execute-ship-page.tsx
    apps/web/features/execute-ship/components/execute-bonus-bridge-page.tsx

    Current bonus mission and lesson presentation:
    apps/web/features/execute-ship/components/bonus-mission-page.tsx
    apps/web/features/execute-ship/components/bonus-mission-block-card.tsx
    apps/web/features/execute-ship/components/bonus-lesson-page.tsx
    apps/web/features/execute-ship/lib/bonus-library-presentation.ts

    Current review-side unlock bridge:
    apps/web/features/codebase-flow/components/review/codebase-review-download-bridge.tsx

    Shared lesson registry and media attachment:
    apps/web/features/course/lesson/model/curriculum.ts
    apps/web/features/course/lesson/model/video.ts
    apps/web/features/course/lesson/model/media.ts

    Candidate dead interactive lesson runtime:
    apps/web/features/course/lesson/components/lesson-page.tsx
    apps/web/features/course/lesson/hooks/use-lesson-page.tsx
    apps/web/features/course/lesson/hooks/use-lesson-page-data.ts
    apps/web/features/course/lesson/hooks/use-lesson-state.ts
    apps/web/features/course/lesson/workbench/

    Obsolete tests to audit and likely replace:
    apps/web/tests/unit/watch-lesson-contract.test.ts
    apps/web/tests/unit/course-registry.test.ts
    apps/web/tests/unit/guided-form-lessons.test.tsx
    apps/web/tests/unit/use-lesson-state.test.tsx
    apps/web/tests/unit/course-state-lifecycle.test.ts

Current inventory proof from repo inspection:

    $ bun -e 'import { getStudentFacingLessons } from "./apps/web/features/course/lesson/model/registry"; const lessons = getStudentFacingLessons(); console.log(JSON.stringify({ total: lessons.length, withWorkbench: lessons.filter(l => Boolean(l.workbench)).length, withFields: lessons.filter(l => (l.workbenchFields?.length ?? 0) > 0).length }, null, 2));'
    {
      "total": 29,
      "withWorkbench": 29,
      "withFields": 21
    }

Current mapping-mismatch proof from repo inspection:

    $ bun -e 'import { getStudentFacingLessons } from "./apps/web/features/course/lesson/model/registry"; import { getLessonVideoAsset } from "./apps/web/features/course/lesson/model/video"; const lessons = getStudentFacingLessons(); for (const lesson of lessons) { const asset = getLessonVideoAsset(lesson); const lessonTitle = lesson.title.trim(); const assetTitle = asset?.title?.trim() ?? ""; if (assetTitle && assetTitle.toLowerCase() !== lessonTitle.toLowerCase()) console.log(`${lesson.id}\t${lesson.lessonKey}\tLESSON=${lessonTitle}\tVIDEO=${assetTitle}`); }'
    1.1  welcome-to-ship-by-sunday  LESSON=Welcome  VIDEO=Welcome Video
    1.3  start-with-the-problem     LESSON=Start With the Problem  VIDEO=Pick One User
    1.4  pick-one-user              LESSON=Pick One User           VIDEO=Define the Outcome
    3.14 wrapping                   LESSON=Production Deploy Handoff VIDEO=Wrapping

## Interfaces and Dependencies

The post-review gate depends on `apps/web/convex/codebase/workflowState.ts` and the `workflowState.executeShipUnlockedAt` field returned through `api.codebase.getCodebaseWorkspaceState`. This plan assumes that unlock contract stays in place and that `/execute`, `/mission`, and `/lesson/*` remain downstream of it.

The current viewed-progress model depends on `apps/web/convex/course/bonusMission.ts`, `apps/web/convex/course/bonusRoute.ts`, `apps/web/features/execute-ship/components/bonus-lesson-view-tracker.tsx`, and `api.course.markBonusLessonViewed`. This plan assumes those interfaces remain the bonus progress store, but the presentation layer must collapse all non-available states to explored rather than exposing old completion semantics.

The shared lesson catalog in `apps/web/features/course/lesson/model/curriculum.ts` remains the source of lesson identity, lesson keys, route segments, display labels, and natural ordering. The cleanup must not introduce a second lesson manifest for the same 29 lessons. Instead, the post-review routes should layer bonus-specific shell and presentation rules on top of the shared catalog.

The shell needs an explicit new interface boundary. `AppShell` currently couples top mission rail visibility and bottom skill rail visibility through whether a `mission` object is present. The cleaned-up bonus system likely needs separate controls so `/execute`, `/mission`, and `/lesson/*` can each render the correct combination of codebase without forking the entire shell.

The current media interfaces are `lessonVideoAssignments` and `resolveLessonVideoAssetId()` in `apps/web/features/course/lesson/model/video-assignments.ts`, `videoAssets` in `apps/web/features/course/lesson/model/media.ts`, and `attachGeneratedLessonMedia()` in `apps/web/features/course/lesson/model/video.ts`. The intended runtime ownership after this cleanup is that a contributor changes `video-assignments.ts` when a lesson should point at a different Bunny asset, and the rest of the runtime follows that canonical resolver.

Static copyable prompt/reference cards are allowed on bonus lessons. Dynamic cards that rely on `getPromptTemplateState()` and pinned artifacts are not. Any lesson resource type that cannot satisfy that rule must be rewritten or removed from the bonus surface before the cleanup is considered complete.

The dead interactive lesson runtime currently hangs off `apps/web/features/course/lesson/components/lesson-page.tsx`, `apps/web/features/course/lesson/hooks/use-lesson-page.tsx`, `apps/web/features/course/lesson/hooks/use-lesson-page-data.ts`, `apps/web/features/course/lesson/hooks/use-lesson-state.ts`, `apps/web/features/course/lesson/hooks/use-lesson-completion.ts`, and the `apps/web/features/course/lesson/workbench/` subtree. These modules must not be deleted until the bonus routes, shell seams, static card rule, and shared-catalog mapping no longer import or infer anything from the old workbench-heavy flow.

The required tests after cleanup are bonus-focused rather than workbench-focused. The key maintained test surfaces should be the bonus route entry tests in `apps/web/tests/unit/app-workspace-mission-page.test.tsx` and `apps/web/tests/unit/app-workspace-lesson-page.test.tsx`, the rendering tests in `apps/web/tests/unit/bonus-mission-page.test.tsx` and `apps/web/tests/unit/bonus-lesson-page.test.tsx`, focused execute and review-bridge coverage, and at least one focused mapping audit or contract test that proves the shared lesson catalog plays the intended bonus videos.
