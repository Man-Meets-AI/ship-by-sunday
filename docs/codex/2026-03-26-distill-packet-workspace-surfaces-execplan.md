---
summary: "ExecPlan for stripping the routed packet workspace down to a cleaner, more premium, lesson-like surface without changing the packet contract or saved outputs. It focuses on removing noisy chrome, tightening hierarchy, and keeping the packet flow functional across Start, core stages, Review, and the optional Execute branch."
read_when: "Open this when you need to implement or understand the simplified packet workspace shell after the route-driven packet funnel lands."
plan_status: "done"
---

# Distill Packet Workspace Surfaces

This document is a living execution plan for stripping the packet workspace pages down to a simpler, more premium, lesson-like experience after the route-driven packet video funnel has landed, without changing the packet contract, route order, or saved outputs.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this change, the required packet workspace should feel focused and expensive instead of busy and over-explained. A buyer who lands on `/start`, then moves through the route-driven packet pages inside Product, Design, Marketing, Build Plan, and Review, should see one clear job per screen, one dominant next action, and a cleaner hierarchy with less visual chrome. The user should no longer encounter pill navigation, badge spam, nested card stacks, card-heavy layouts, or uppercase eyebrow labels across the packet run. They should still be able to do everything they can do today, plus the packet-video-plan behavior that will exist by the time this work starts: watch the mapped packet videos where they exist, move through packet pages in order, save facts inside each packet page, and download the same outputs on `/review`.

This matters because the current packet UI is fighting the product’s own promise. The saved design context in `.impeccable.md` says the user is a serious weekend builder who wants leverage and momentum, and that the interface should feel bold, premium, operational, and deliberate. The current packet shell leans too hard on generic UI chrome instead of that standard. The visible success case is simple: the packet run still works, but it reads as a single clean system rather than a pile of badges, cards, and helper wrappers.

## Progress

- [x] 2026-03-26 18:44 EDT — Ran a live signed-in browser QA pass against `http://localhost:3000`, found a routed workbench render-loop regression on `/product/foundation`, and fixed it in `apps/web/features/packet-flow/hooks/use-packet-stage-step-state.ts` by making draft hydration idempotent when live query results arrive with new object identities. Added regression coverage in `apps/web/tests/integration-ui/packet-stage-page.test.tsx` and reran `bunx vitest run --project unit tests/unit/packet-stage-routes.test.ts`, `bunx vitest run --project integration-ui tests/integration-ui/packet-start-page.test.tsx tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-review-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx`, `bun run lint`, and `bun run build`; all passed.
- [x] 2026-03-26 18:20 EDT — Completed Milestone 4 validation. `bunx vitest run --project unit tests/unit/packet-stage-routes.test.ts` passed, `bunx vitest run --project integration-ui tests/integration-ui/packet-start-page.test.tsx tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-review-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx` passed, `bun run lint` passed, and `bun run build` passed. Attempted both `bun run test:e2e:sandbox --grep @default_ship` and `bun run test:e2e:sandbox`; both exited with every sandbox browser test skipped because the sandbox auth environment was not active.
- [x] 2026-03-26 18:18 EDT — Completed Milestone 3 in the routed workbench. `PacketStageStepCard` is now the dominant single work surface, `use-packet-stage-step-state.ts` now supports both `Save and continue` and `Save and stay`, shared save feedback now speaks in page language instead of step jargon, and `packet-stage-videos.ts` now uses plain metadata instead of lesson-production labels. Reran `bunx vitest run --project integration-ui tests/integration-ui/packet-start-page.test.tsx tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-review-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx`; all four files passed with 11 tests.
- [x] 2026-03-26 18:10 EDT — Completed Milestone 2 in `apps/web/features/packet-flow/components/packet-start-page.tsx` and the `review/` components. `/start` is now a stacked intro without the top-level stage strip, `/review` now centers the Starter Snapshot as the primary outcome, the supporting packs are a vertical list, and the full `Execute / Ship` surface stays hidden until the Starter Snapshot download moment. Reran `bunx vitest run --project integration-ui tests/integration-ui/packet-start-page.test.tsx tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-review-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx`; all four files passed.
- [x] 2026-03-26 18:04 EDT — Completed Milestone 1 in `apps/web/features/packet-flow/`. `PacketStageNav`, `PacketStageProgressPanel`, `PacketStageSidebar`, `PacketVideoCard`, and `PacketStagePage` now use a quieter shared shell, and the new `components/progression/packet-stage-step-strip.tsx` gives packet pages a flatter lesson-like strip on desktop plus a lighter page switcher on mobile. Reran `bunx vitest run --project integration-ui tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx`; both files stayed green after formatting.
- [x] 2026-03-26 17:58 EDT — Ran the packet baseline before editing: `bunx vitest run --project integration-ui tests/integration-ui/packet-start-page.test.tsx tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-review-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx` and `bunx vitest run --project unit tests/unit/packet-stage-routes.test.ts` both passed from the routed packet baseline.
- [x] 2026-03-26 18:02 EDT — Ran focused 5.4-high packet-flow audits for `arrange`, `typeset`, and `clarify`, then folded the findings into this plan. The shared shell remains the highest-leverage target, and the execution order is now explicit: rebuild shared composition first, establish the packet type hierarchy second, and rewrite shared copy/microcopy in the same passes instead of treating UX writing as last-mile polish.
- [x] 2026-03-26 17:47 EDT — Reconfirmed the design direction with the user and tightened this plan so the anti-generic UI rule is explicit: no stock badge/pill/card shell as the default packet-page language, even when using shadcn primitives underneath.
- [x] 2026-03-26 15:49 EDT — Read `AGENTS.md`, `apps/web/AGENTS.md`, `.impeccable.md`, the `distill` and `frontend-design` skill instructions, `docs/prompts/execplan-writer.md`, and `docs/codex/PLANS.md`, then inspected the current packet routes, packet-flow components, packet compiler stage contract, and validation tests to freeze the planning slice.
- [x] 2026-03-26 16:55 EDT — Grilled the plan against the real repo and the dependency plan in `docs/codex/2026-03-26-17-17-38-EDT-packet-video-page-funnel.md`, then resolved the major execution branches: this work starts only after the video funnel lands; core packet work pages become route-driven, video-aware, and desktop-split while `/start` and `/review` stay stacked; `/start` drops the top-level stage strip; packet pages use a quiet top-level stage strip plus a clearer within-stage packet-page strip; Review keeps only a one-line `Execute / Ship` mention before download and expands the real optional branch afterward; blocker guidance stays visible through human-readable labels; the primary stage action becomes `Save and continue` with a secondary stay-put action.
- [x] 2026-03-26 17:24 EDT — Confirmed the dependency plan is implemented in the working tree. The nested packet routes exist under `apps/web/app/(workspace)/*/[stepId]/page.tsx`, the route helpers and packet-local video registry are live, and the current distillation target is the routed packet shell rather than the old stage-root shell.
- [x] Milestone 1 — Distill the shared packet chrome so stage navigation, objective framing, and status surfaces stop relying on pills, badges, and card wrappers.
- [x] Milestone 2 — Distill `/start` and `/review` into cleaner kickoff and checkpoint pages with flatter structure and clearer CTA hierarchy.
- [x] Milestone 3 — Distill the route-driven packet work pages so Product, Design, Marketing, and Build Plan feel like one calm video-plus-work system instead of a dashboard of cards and badges.
- [x] Milestone 4 — Validate the full packet run, update living notes, and record any residual design debt that remains intentionally out of scope.

## Surprises & Discoveries

The anti-patterns are still centralized after the dependency migration, but the leverage points moved. Stage-root routes such as `apps/web/app/(workspace)/product/page.tsx`, `design/page.tsx`, `marketing/page.tsx`, and `build-plan/page.tsx` now only redirect through `apps/web/features/packet-flow/server/packet-stage-route-data.ts`. The real packet pages live under `apps/web/app/(workspace)/*/[stepId]/page.tsx` and still funnel through `apps/web/features/packet-flow/components/packet-stage-page.tsx`. This means the cleanup plan must target the routed packet shell, not the stage-root wrappers.

The specific chrome the user objected to is easy to trace in code. `apps/web/features/packet-flow/components/packet-stage-nav.tsx` renders every stage as a `Badge`, `apps/web/features/packet-flow/components/progression/packet-stage-progress-panel.tsx` uses both `Badge` and `Card`, `apps/web/features/packet-flow/components/packet-stage-sidebar.tsx` uses another `Badge` plus another `Card`, and the review components in `apps/web/features/packet-flow/components/review/` repeat the same card-and-badge treatment. The current shell is simple to describe: nearly every logical subsection becomes a card, and nearly every state label becomes a badge.

The forms themselves are not the noisy part. `apps/web/features/packet-flow/components/packet-stage-field.tsx` already reduces each field to a `Label` plus either `Input` or `Textarea`. That means the cleanup is mostly about layout and hierarchy, not inventing a new form engine. The save behavior and field bindings can remain intact while the surrounding surface becomes much flatter.

`/start` and `/review` are separate page components, but they are part of the same packet system and currently repeat the same design habits. `/start` now uses `apps/web/features/packet-flow/components/start/packet-start-overview-card.tsx` and `apps/web/features/packet-flow/components/start/packet-start-welcome-video-card.tsx`, while `/review` still relies on three separate card-style sections plus an artifact card grid. If the cleanup stops at the shared stage page, the packet run will still feel inconsistent.

The video path for `/start` is already solved, and the dependency plan extends that approach to the rest of the packet run. The welcome surface now uses the packet-flow-local media registry and `PacketVideoCard`, while `docs/codex/2026-03-26-17-17-38-EDT-packet-video-page-funnel.md` formalizes that packet pages get their own packet-flow-local video registry and route-driven page model. The cleanup plan therefore must not invent a second video strategy; it should assume the packet pages already know whether they have a video and design around that.

The raw canonical fact leakage is already fixed in the live tree. `apps/web/features/packet-flow/components/packet-stage-sidebar.tsx` maps `missingFactKeys` through `packetFieldLabel`, and `apps/web/tests/integration-ui/packet-stage-sidebar.test.tsx` covers that behavior. The distillation plan should preserve that improvement and not waste time re-solving it.

The dependency work introduced a new shared chrome boundary that the original distillation plan did not name explicitly. `apps/web/features/packet-flow/components/video/packet-video-card.tsx` now frames Start, Review, and the routed packet work pages. Because it carries border, spacing, and title treatment everywhere, it is now a first-class simplification target alongside `PacketStagePage`, `PacketStageNav`, and the review components.

The lesson-shell inspiration is real but should be borrowed selectively. `apps/web/features/course/shared/components/skill-rail-shadcn.tsx` proves that a flatter, horizontally-scrollable route strip can work well, but the exact footer-rail mounting pattern from the old lesson shell is not appropriate for the packet pages. The best reuse is the visual and behavioral language, not the old placement.

The most generic-feeling language and hierarchy are concentrated in shared files, not leaf forms. `apps/web/features/packet-flow/components/progression/packet-stage-progress-panel.tsx` carries the densest combination of dashboard copy, uppercase metadata, badge-driven state, and nested framing. `apps/web/features/packet-flow/components/video/packet-video-card.tsx` and `apps/web/features/packet-flow/lib/packet-stage-videos.ts` spread lesson-production metadata such as `Packet video`, `Packet page`, and `L2 pending` across Start, Review, and the routed work pages. `apps/web/features/packet-flow/lib/packet-step-save-feedback.ts` and `apps/web/features/packet-flow/components/packet-stage-step-card.tsx` still use generic save-state language such as `Draft saved.` and `Save step`, which means clarity work has to touch shared behavior, not just page intros.

The mobile packet-page strip does not need a custom tab system to feel deliberate. A native page picker inside `apps/web/features/packet-flow/components/progression/packet-stage-step-strip.tsx` keeps the small-screen layout calmer than a compressed chip row, while the desktop view can still borrow the lighter skill-rail feel through top borders, type rhythm, and horizontal overflow.

The first shared-shell pass did not require touching the save hook or field renderer. Flattening `PacketStageNav`, `PacketStageProgressPanel`, `PacketStageSidebar`, and `PacketVideoCard` inside `PacketStagePage` was enough to make the primary work surface read as dominant, which keeps Milestone 1 safely presentational and leaves the save CTA rewrite for Milestone 3 where it belongs.

The review unlock behavior was already isolated cleanly inside `apps/web/features/packet-flow/components/review/packet-review-download-bridge.tsx`. Hiding the full `Execute / Ship` section until the Starter Snapshot download moment only required changing the presentation boundary in `PacketReviewExecutePreview`; the unlock mutation, router push, and review download link contract all stayed intact.

`/start` did not need any new state or routing logic. Removing the top-level stage strip and stacking the intro above the shared video card was a pure presentation change in `PacketStartPage` and `start/packet-start-overview-card.tsx`, which means the Start cleanup can stay completely outside the packet save and readiness logic.

The workbench interaction change was smaller than it looked in the plan. Adding `Save and stay` did not require new route helpers or new readiness logic. The only behavior change was threading a save intent through `use-packet-stage-step-state.ts` so complete saves can either push forward or remain in place while reusing the same mutation and completion rules.

The stage-page media cleanup belonged in content, not layout. Changing `apps/web/features/packet-flow/lib/packet-stage-videos.ts` from `Packet video` and `L<n>` metadata to plain `Watch first`, `Read first`, and stage labels was enough to remove the remaining lesson-production jargon from the routed work pages without touching the shared video component again.

The sandbox browser lane is still environment-gated. Both Playwright commands exited cleanly but skipped every sandbox test because `shouldRunSandboxAuth` was false in `apps/web/tests/e2e/auth-state.ts`. That means the browser specs are updated for the new CTA copy and workbench language, but they were not exercised against a live sandbox stack in this run.

The browser QA pass surfaced one regression that the earlier test suite missed. When `useQuery(api.packet.getPacketWorkspaceState)` returned the same packet data with a fresh object identity, the draft-hydration effect in `use-packet-stage-step-state.ts` kept setting local draft state and produced a `Maximum update depth exceeded` console storm on the routed work pages. Guarding the hydration with a value equality check removed the loop, and the new integration test now covers that live-query churn path.

## Decision Log

Decision: Treat the packet run as one design system and remove pill navigation, habitual badge usage, nested card thinking, and uppercase eyebrow labels from the packet pages as a default rule rather than a one-off cleanup. Rationale: the user explicitly called out those patterns as anti-patterns, and the current code shows they are repeated by shared packet-flow components rather than isolated incidents. Date/Author: 2026-03-26 / Codex

Decision: Do not swap one stock UI trope for another. The distillation pass should not lean on shadcn `Badge`, pill tabs, or card stacks as the primary page architecture, even though those primitives remain available for rare utility cases. Rationale: the user's objection is not only to the current implementation details but to the broader "generic frontend starter kit" look; the plan must force hierarchy to come from layout, typography, spacing, copy, and a few deliberate dividers instead. Date/Author: 2026-03-26 / Codex

Decision: Layout hierarchy must be rebuilt before page-specific polish. The packet pages should stop reading like a stack of equal cards and instead use one dominant work surface, one quieter orientation strip, and one subordinate support area. Rationale: the current card-heavy composition makes every region feel equally important, which fights the premium, operational design direction. Date/Author: 2026-03-26 / Codex

Decision: Typography is a first-class part of the packet distillation pass. The packet run should reuse Ship by Sunday's existing display and body language, but stop relying on default `CardTitle`, uppercase eyebrow labels, and badge text as the primary hierarchy system. Rationale: the current packet pages feel generic less because of color or layout alone and more because every surface collapses into the same card-title-plus-muted-body cadence. The fix is stronger type roles, calmer metadata, controlled line lengths, and clearer title dominance. Date/Author: 2026-03-26 / Codex

Decision: Treat UX writing as part of the packet distillation work, not as a final polish pass. Rationale: much of the current packet friction comes from dashboard-style labels and internal workflow language such as `level`, `reward`, `required facts`, `packet video`, `L2 pending`, and `unlock after download`. The simplified UI must also speak more plainly so a serious weekend builder can tell what to do next without decoding product jargon. Date/Author: 2026-03-26 / Codex

Decision: Keep the packet contract unchanged. The stage IDs, route order, field keys, save mutation, readiness logic, and review download labels must remain intact while the presentation is simplified. Rationale: this request is about UI and UX distillation, not about changing the meaning of the packet or widening scope into compiler and backend changes. Date/Author: 2026-03-26 / Codex

Decision: Scope `/review` into this cleanup even though the user named `/start`, `/design`, `/build-plan`, and `/marketing` explicitly. Rationale: `/review` is still part of the packet run, it uses the same card-and-badge language, and leaving it untouched would preserve a major chunk of the same visual clutter. Date/Author: 2026-03-26 / Codex

Decision: Keep `/execute` out of the main scope unless a shared presentational primitive forces a tiny compatibility change. Rationale: the user asked for packet pages and packet forms. `/execute` is the optional post-review branch and should not silently absorb the packet cleanup unless the implementation proves that a shared component cannot be cleanly separated. Date/Author: 2026-03-26 / Codex

Decision: Preserve the welcome video on `/start` and simplify around it rather than reducing the page to text only. Rationale: the user explicitly wants the video on the same page as the text, and the saved design context favors momentum and serious guidance over ornamental minimalism. Date/Author: 2026-03-26 / Codex

Decision: This plan is blocked on completion of `docs/codex/2026-03-26-17-17-38-EDT-packet-video-page-funnel.md` and should not begin implementation against the pre-migration stage-only shell. Rationale: the dependency plan changes the route model, introduces packet-page video surfaces, and replaces local step switching with URL-driven packet pages. Distilling the old shell first would create throwaway work and the wrong final architecture. Date/Author: 2026-03-26 / Codex

Decision: On route-driven packet work pages, use two navigation layers: a quiet top-level stage strip and a clearer within-stage packet-page strip. Rationale: the top-level strip preserves full-funnel orientation, while the within-stage strip carries the real lesson-like progression after the video-funnel plan lands. Merging them would muddy the hierarchy, and removing one would weaken orientation. Date/Author: 2026-03-26 / Codex

Decision: Remove the top-level stage strip from `/start` once the packet pages become route-driven, but keep it on the core work pages and `/review`. Rationale: `/start` should have one obvious job and one primary action, while the later pages still need stable cross-stage orientation. Date/Author: 2026-03-26 / Codex

Decision: Show future locked stages in the top-level stage strip as quiet, non-clickable labels. Rationale: the user should still see the full journey, but future stages should not compete with the current page. Date/Author: 2026-03-26 / Codex

Decision: Borrow from the old lesson skill rail for the within-stage packet-page strip, but mount it near the top of the page body instead of as a footer rail. Rationale: this keeps the packet pages feeling lesson-like without reviving the old shell wholesale. Date/Author: 2026-03-26 / Codex

Decision: On mobile packet pages, keep the top-level stage strip visible and collapse the within-stage packet-page strip into a lighter control instead of showing both fully expanded. Rationale: this preserves orientation without letting two navigation layers crowd the small-screen layout. Date/Author: 2026-03-26 / Codex

Decision: Implement the mobile packet-page strip as a native page picker instead of a shadcn tab row or custom carousel. Rationale: the native control keeps the small-screen shell low-chrome, avoids reintroducing pill-like navigation, and still preserves direct route changes for any packet page in an unlocked stage. Date/Author: 2026-03-26 / Codex

Decision: On desktop, `/start` and `/review` stay stacked, while video-aware packet work pages use a split layout with video beside the working surface. Rationale: entry and checkpoint pages are narrative surfaces, while the core work pages benefit from the old lesson-style “watch and work” split. Date/Author: 2026-03-26 / Codex

Decision: On `/review`, keep only a one-line `Execute / Ship` mention before the Starter Snapshot download and reveal the full optional branch only after the download moment. Rationale: this keeps Review focused on its primary job and prevents the optional branch from competing too early. Date/Author: 2026-03-26 / Codex

Decision: Let `PacketReviewExecutePreview` return `null` until the Starter Snapshot download has been triggered or the optional branch is already unlocked. Rationale: the review download bridge already owns the download-trigger state, so hiding the full optional branch there is the smallest truthful way to enforce the page hierarchy the plan calls for. Date/Author: 2026-03-26 / Codex

Decision: Replace raw missing-fact key lists with a concise blocker summary plus human-readable field labels. Rationale: the distilled UI should stay actionable without leaking implementation-shaped strings. Date/Author: 2026-03-26 / Codex

Decision: The primary stage action becomes `Save and continue`, with a secondary “save and stay” option. Rationale: the current implicit auto-advance is too opaque for a distilled lesson-like flow, but requiring a second click after every save would weaken momentum. Date/Author: 2026-03-26 / Codex

Decision: Implement `Save and continue` and `Save and stay` as two intents on the existing `saveCurrentStep` path instead of forking the save mutation or duplicating the step-state hook. Rationale: the save contract was already correct; only the post-save navigation behavior needed to change. Date/Author: 2026-03-26 / Codex

Decision: On `/review`, flatten the supporting pack downloads into a simple vertical list beneath the primary Starter Snapshot section instead of keeping them as equal-weight artifact blocks. Rationale: the pack outputs should remain visible, but they should not compete with the checkpoint’s main outcome. Date/Author: 2026-03-26 / Codex

Decision: Drop the top-level stage strip from `/start` entirely and keep the page stacked. Rationale: `/start` now has one job only: orient the user, show the welcome video, and send them into the required packet run. Reusing the shared stage strip here only diluted that hierarchy. Date/Author: 2026-03-26 / Codex

Decision: Replace lesson-number metadata such as `L1` and `L13` on the visible packet-page media surfaces with plain stage labels and instruction cues. Rationale: the packet UI should speak in workbench language, not in recording inventory language. Date/Author: 2026-03-26 / Codex

Decision: Treat live-query draft hydration as a value-sync problem, not an identity-sync problem. Rationale: hosted Convex query results can arrive as fresh objects even when the facts have not changed, so the packet workbench must only reset local draft state when the actual draft values differ. Date/Author: 2026-03-26 / Codex

## Outcomes & Retrospective

Milestone 1 is complete. The routed packet work pages now have a quiet stage strip, a flatter within-stage page strip, calmer video framing, and a lower-chrome blocker/status area without touching packet save behavior. The stage-page integration proof stayed green after the rewrite, which means the shell can be simplified without disturbing the route-driven packet contract.

Milestone 2 is also complete. `/start` now reads as a single stacked kickoff with one primary CTA and no body-stage strip, while `/review` now treats the Starter Snapshot as the main outcome, demotes the supporting packs into a simple list, and delays the full `Execute / Ship` surface until the user reaches the actual download moment.

Milestone 3 is now complete too. The routed work pages no longer depend on a generic card-and-badge workbench. The page form surface is dominant, the save actions are explicit, the stay-put path exists for deliberate editing, and the shared feedback and media labels now read in user-facing packet language instead of internal lesson language.

Milestone 4 is complete as far as the current environment allows. The repository now passes the relevant packet unit and integration tests, repo lint, and repo build. The only missing live proof is sandbox browser execution, and that gap is explicit rather than hidden: the sandbox auth environment was inactive, so Playwright skipped the browser suite instead of exercising the updated packet flow.

The main residual risk is now only unrun environment-specific browser behavior, not the local packet workbench itself. The cleanup removed the generic chrome successfully, the live local browser pass caught and cleared the one real regression in the routed workbench hook, and the route-driven packet behavior is stable again in browser, test, lint, and build lanes. If a follow-up is needed, it should be a live sandbox/browser polish pass rather than another structural rewrite.

## Context and Orientation

The protected packet run lives under `apps/web/app/(workspace)/`. `apps/web/app/(workspace)/start/page.tsx` still renders `PacketStartPage`, and `apps/web/app/(workspace)/review/page.tsx` still renders `PacketReviewPage`, but the required work stages are no longer rendered directly from the stage-root routes. The stage-root files now redirect through `apps/web/features/packet-flow/server/packet-stage-route-data.ts`, and the real packet pages live under `apps/web/app/(workspace)/*/[stepId]/page.tsx`. Those nested route files load packet-page-specific state through the same server-provided `PacketWorkspaceState` boundary and then render the shared `PacketStagePage`.

The packet contract itself lives in `packages/packet-compiler/src/stages/stage-definitions.ts`. That file defines the only legal packet stages: `start`, `product`, `design`, `marketing`, `build-plan`, and `review`. It also defines the shared step structure for the form stages. `PacketStagePage` uses those stage definitions to render the current stage label, the active step, and the save behavior. Because the route wrappers are thin and the stage compiler is shared, visual simplification must happen in packet-flow components, not by forking four separate stage pages.

The current packet-flow presentation is concentrated in a small number of files inside `apps/web/features/packet-flow/`. `apps/web/features/packet-flow/components/packet-stage-nav.tsx` renders stage navigation and should evolve into the quiet top-level stage strip used on packet work pages and Review. `apps/web/features/packet-flow/components/progression/packet-stage-progress-panel.tsx` now represents the routed within-stage packet-page map and should give way to a simpler strip inspired by the old lesson skill rail. `apps/web/features/packet-flow/components/packet-stage-step-card.tsx` and `packet-stage-field.tsx` render the current form surface and remain the main write targets for the simplified workbench. `apps/web/features/packet-flow/components/video/packet-video-card.tsx` is now the shared video chrome boundary across Start, Review, and the routed packet work pages, so it belongs in the same simplification pass. `apps/web/features/packet-flow/components/review/packet-review-checkpoint-card.tsx`, `packet-review-execute-preview.tsx`, and `packet-review-artifact-grid.tsx` define the current Review structure and will need to be flattened. `apps/web/features/packet-flow/components/start/packet-start-overview-card.tsx` carries the bulk of the `/start` body and should stay stacked rather than adopting the split workbench layout.

The data and save boundaries must remain stable. `PacketStagePage` currently calls `api.packet.saveProjectDefinitionFacts` and builds its payload through `apps/web/features/packet-flow/lib/packet-field-helpers.ts`. After the dependency plan lands, the route-driven packet pages must still use the same mutation and field helper path even if the component tree changes. `PacketStageField` already maps canonical fact keys to labels and input kinds, and that helper should remain the canonical source for human-readable field labels in both the form itself and any blocker summary. None of that logic needs a redesign; the work is about presentation, layout, and hierarchy. That is important because it means this plan is safe to keep additive and testable without schema or migration work.

The shared copy and metadata boundaries matter as much as the visible components. `apps/web/features/packet-flow/lib/packet-stage-videos.ts` owns the orientation language for Start, Review, and the routed packet pages. `apps/web/features/packet-flow/lib/packet-step-save-feedback.ts` owns the save-state language for the workbench. Those files are part of the UI/UX scope because their strings currently expose lesson-production and dashboard wording that the user should never have to decode. Any clarity pass that ignores them will leave the new shell sounding as generic as the old one looked.

The typography pass should reuse the app’s existing language rather than inventing a packet-only font system. `apps/web/app/globals.css` already defines the project’s scoped display utilities, and components such as `apps/web/components/ui/alert.tsx`, `apps/web/components/ui/empty.tsx`, and `apps/web/features/auth/sign-in/auth-page-support-panel.tsx` show the existing preference for `text-balance`, controlled line length, and relaxed supporting copy. The packet run should borrow those habits while staying inside `apps/web/features/packet-flow/`.

The most relevant tests already exist in the route-driven system. `apps/web/tests/integration-ui/packet-start-page.test.tsx`, `packet-stage-page.test.tsx`, `packet-review-page.test.tsx`, and `packet-stage-sidebar.test.tsx` cover the main packet surfaces. `apps/web/tests/unit/packet-stage-routes.test.ts` covers the route helper contract. `apps/web/tests/e2e/auth-protection.sandbox.spec.ts` verifies that an entitled member can load `/start`, and `apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts` walks an entitled member through the routed packet run. Those tests should become the proof surface for the distilled layout rather than being replaced with a new harness.

## Plan of Work

This work now begins from a completed route-driven packet baseline. The implementer should start by reading `docs/codex/2026-03-26-17-17-38-EDT-packet-video-page-funnel.md` and then inspecting the live routed packet-flow files. The first step is no longer to wait for the migration. The first step is to avoid undoing it.

Once the dependency is present, the work should proceed from the most shared chrome to the most page-specific surfaces. Start by removing the repeated visual language that is currently making every packet page feel templated: badge pills, outlined status chips, card wrappers for every subsection, and uppercase eyebrow labels. Do that in the shared packet navigation and route-aware packet-page components first so the Product, Design, Marketing, and Build Plan pages change together and stay consistent.

As those shared surfaces are rewritten, treat "generic starter UI" as a failure mode, not a fallback. The target is not minimalism for its own sake and not a shadcn demo aesthetic. The target is a premium working surface where hierarchy comes from composition: stronger type rhythm, fewer containers, calmer separators, and one dominant action per page. If a proposed layout still reads like a stack of reusable marketing cards with labels pasted on top, it has missed the design goal even if the code is cleaner.

The execution order for the three named skill passes is deliberate. Start with `arrange` on the shared shell so the page stops reading as a dashboard of equal cards. Then run `typeset` on those same shared surfaces so hierarchy comes from one explicit title system, calmer metadata, and readable line lengths rather than from badge chips and card headers. Run `clarify` inside those same passes wherever the copy is structural, then finish the remaining UX-writing work on `/start`, `/review`, the shared video metadata, and the save-state messages after the visual hierarchy is stable.

The layout pass should follow the same rule. Do not treat every section as a peer container. Rebuild the packet surfaces around a clearer spatial hierarchy: a quiet top-level stage strip, a lighter within-stage page strip, one dominant work surface, and a visibly subordinate support region. Tighten spacing inside related groups, add more separation between distinct groups, and avoid equal-width, equal-emphasis card grids unless the content is truly peer-level.

Run a typography pass on the shared packet surfaces before final spacing polish is considered done. The packet workbench, shared video surface, review checkpoint, and navigation strip should all move onto one explicit type system: one dominant title per surface, a quieter sentence-case metadata line, and body copy that uses relaxed line-height with capped measure. Do not add new fonts for this slice; reuse the app’s existing display and body language, but apply it intentionally inside packet-flow instead of accepting the default shadcn card rhythm.

As the shared packet surfaces are flattened, rewrite the user-facing copy at the same time instead of preserving the current labels inside a cleaner shell. The copy pass should remove internal and dashboard-style language, make every major surface answer one clear question, and turn generic CTAs into action-specific ones. Progress panels should speak in terms of the next page and what unlocks next, save feedback should explain what changed and what remains, review should foreground the Starter Snapshot as the main outcome, and field labels or helper text should stop exposing raw schema language where that wording is not naturally user-facing.

Once the shared chrome is flatter, simplify `/start` and `/review` so the packet run begins and ends with the same calmer system. `/start` should read as a clean intro with one video, one explanation, one primary path forward, and no top-level stage strip in the body. `/review` should keep the same output contract but present it in a simpler hierarchy where the Starter Snapshot stays clearly primary, the supporting packs become a simple vertical list below it, and the optional next branch is reduced to a one-line mention until the download moment happens.

After the entry and checkpoint pages are aligned, distill the shared route-driven packet workbench. The current “progress panel plus form card plus sidebar card” split should be replaced with a calmer system: a quiet top-level stage strip, a clearer within-stage packet-page strip inspired by the skill rail, a split desktop layout on video-aware packet work pages, and a simpler single-column work surface below the video. The forms must remain editable in any order within the unlocked stage, and the next stage must remain gated by readiness, but the UI should stop making every sub-surface look equally loud.

Finish by validating the full packet run in both test and browser lanes, then update this plan with the concrete outcomes, any concessions, and any remaining debt that should be deferred rather than smuggled into the current slice.

## Milestones

### Milestone 0: Confirm the packet-video dependency is complete

At the end of this milestone, the working tree already matches the dependency contract in `docs/codex/2026-03-26-17-17-38-EDT-packet-video-page-funnel.md`: `/product`, `/design`, `/marketing`, and `/build-plan` route into nested packet pages, the packet-page video surfaces are wired where mappings exist, and the route-driven flow is testable. No distillation work should begin before that baseline is confirmed.

Success for this milestone means the dependency is no longer theoretical. A human can load the route-driven packet pages and see the expected video-aware packet-page model in place before any simplification work starts.

### Milestone 1: Distill the shared packet chrome

At the end of this milestone, the shared packet navigation system is materially simpler. `apps/web/features/packet-flow/components/packet-stage-nav.tsx` becomes a quiet top-level stage strip for packet work pages and Review, with future locked stages shown as non-clickable labels instead of pills. A new or refactored within-stage packet-page strip, likely replacing the current progression panel, borrows from the old lesson skill rail while living near the top of the page body instead of in a footer. On mobile, the top-level stage strip stays visible while the within-stage strip collapses into a lighter control.

This milestone also owns the shared spacing, composition, type, and terminology rules. `PacketStageNav` should become a low-chrome strip, `PacketStageProgressPanel` should collapse into a flatter route strip plus a short objective summary, and `PacketVideoCard` should stop using badge text and uppercase eyebrow labels as the main source of emphasis. Success here means the routed shell no longer depends on nested framed panels to create hierarchy, the page’s primary region is obvious at a glance, and a reviewer can identify the current stage, current objective, and video context from type and spacing alone before noticing any decorative UI treatment. The integration proof at this point should still leave the route-driven equivalent of `apps/web/tests/integration-ui/packet-stage-page.test.tsx` green.

### Milestone 2: Distill `/start` and `/review`

At the end of this milestone, `apps/web/features/packet-flow/components/packet-start-page.tsx` and the `apps/web/features/packet-flow/components/start/` files render a clean kickoff surface where the welcome video and introductory copy feel like one page, not two separate cards, and the page body no longer shows the top-level stage strip. `/review` is simplified through `apps/web/features/packet-flow/components/packet-review-page.tsx` and the `review/` components so the primary outcome is the Starter Snapshot, the supporting pack links become a simple vertical list, and `Execute / Ship` appears only as a one-line mention until the user triggers the download moment.

Give `/start` and `/review` a stronger opening and closing cadence than the work pages. The kickoff and checkpoint titles should feel like real page moments, not card headers, and the supporting paragraphs should be trimmed to readable measures so the pages feel premium and deliberate instead of instructional by default. Milestone 2 also owns the page-level clarity pass for kickoff and checkpoint copy: `/start` should have one obvious invitation into Product, and `/review` should make the Starter Snapshot primary while reducing `Execute / Ship` to a clear optional next branch. Success for this milestone means `/start` has one obvious next action, the video remains present, and the page no longer uses the old eyebrow-plus-card pattern. On `/review`, the same output labels remain visible, but the page reads as a checkpoint rather than a grid of equal-weight blocks. The focused proof here should keep the route-aware equivalents of `apps/web/tests/integration-ui/packet-start-page.test.tsx` and `apps/web/tests/integration-ui/packet-review-page.test.tsx` green.

### Milestone 3: Distill the route-driven packet work pages

At the end of this milestone, the Product, Design, Marketing, and Build Plan packet pages all feel like variations of one distilled video-plus-work system. On desktop, video-aware packet work pages use a split layout with video beside the work surface. Inside that work surface, the page layout becomes mostly single-column: the page strip near the top, the form in the middle, and a quieter status or next-action section below. The blocker display changes from raw fact keys to a short summary plus human-readable labels. The primary stage action becomes `Save and continue`, with a secondary “save and stay” affordance. If the refactor makes any component exceed the 150-line limit in `AGENTS.md`, extract feature-local pieces without widening the write set outside `apps/web/features/packet-flow/`.

The routed work pages should be composed asymmetrically. On desktop, video-aware pages may still use a split layout, but the form column must remain dominant and the support rail must feel secondary. On mobile, the same information should collapse into a single reading flow with the support content moving below the main work surface rather than competing beside it. Split step progress metadata from the current step title inside the workbench so the current step label becomes the dominant heading, while step count, save state, and objective context move into smaller supporting roles. Milestone 3 also includes a clarity sweep across the workbench strings before visual polish is considered done. Replace `level objective`, `reward unlocked`, `current run`, `required facts`, `optional details available`, and other dashboard-style labels with plain language that reflects the user's actual job. Success for this milestone means the user can still browse packet pages inside an unlocked stage, save any page, and understand what remains incomplete, but the page no longer feels like three separate cards stitched together. The route-aware packet integration tests must remain green, and a manual browser pass through Product, Design, Marketing, and Build Plan should show cleaner hierarchy without any route or save regression.

### Milestone 4: Validate the run and record the new system

At the end of this milestone, the changed packet pages have been proven through narrow integration tests, a full build, and at least one real browser pass through the packet run. This milestone should also update this plan’s living sections with the actual implementation outcome, the validation transcript, and any deferred follow-up work. If implementation touches docs or leaves a notable UX tradeoff unresolved, record it here rather than leaving it implicit.

Success for this milestone means the packet run is demonstrably simpler without losing functionality, and another coding agent could resume from this plan alone if more cleanup is needed later.

## Concrete Steps

Work from the repository root unless a step says otherwise.

Begin by reading the finalized dependency plan and inspecting the actual routed packet shell before changing any UI:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ sed -n '1,260p' docs/codex/2026-03-26-17-17-38-EDT-packet-video-page-funnel.md
    $ find apps/web/app/'(workspace)' -maxdepth 4 -type f | sort | rg '/(start|product|design|marketing|build-plan|review)/'
    $ find apps/web/features/packet-flow -maxdepth 4 -type f | sort

The expected observation is that the packet run already uses route-driven packet pages, packet-page video surfaces, and shared packet-flow route helpers. The distillation work should now start from those files rather than from pre-migration assumptions about stage-root route pages.

Once the dependency is confirmed, capture the anti-pattern concentration again in the new packet-flow surface:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ rg -n "Badge|CardHeader|CardContent|<Card|from \"@/components/ui/card\"|from \"@/components/ui/badge\"" apps/web/features/packet-flow/components apps/web/features/execute-ship/components -g '!**/node_modules/**'

The expected observation is a dense cluster of `Badge` and `Card` usage in `packet-stage-nav.tsx`, `packet-stage-progress-panel.tsx`, `packet-stage-sidebar.tsx`, the `/start` components, and the review components. That is the current evidence that the problem is centralized.

Inspect the shared copy and save-state boundaries before editing so the wording work stays centralized too:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ sed -n '1,260p' apps/web/features/packet-flow/lib/packet-stage-videos.ts
    $ sed -n '1,260p' apps/web/features/packet-flow/lib/packet-step-save-feedback.ts

The expected observation is that shared packet wording still exposes lesson-production and dashboard language such as `Packet video`, `Packet page`, `L2 pending`, `Level objective`, `Reward unlocked`, and generic save messages. That confirms the clarity pass belongs in shared packet-flow files, not only in page-specific intros.

Run the focused packet UI tests before editing:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/packet-start-page.test.tsx tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-review-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx
    $ bunx vitest run --project unit tests/unit/packet-stage-routes.test.ts

The expected observation is a green run before the cleanup starts. If one of these tests is already red, stop and record that fact in `Progress` before continuing.

During Milestone 1 and Milestone 3, rerun the narrow stage surface test after each shared-component change:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/packet-stage-page.test.tsx

During Milestone 2, rerun the kickoff and checkpoint tests together:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/packet-start-page.test.tsx tests/integration-ui/packet-review-page.test.tsx

Once the packet-flow surface is stable, run the broader repository checks:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ bun run lint
    $ bun run build

Then run the real browser packet proofs against the local stack:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bun run test:e2e:sandbox:default-ship
    $ bun run test:e2e:sandbox

The expected observation is that the default-ship lane proves the routed packet run and the full sandbox suite also covers auth-protection. If a browser lane fails only because visible copy changed, update the assertions narrowly. If it fails because route gating, nested-route protection, save behavior, or download behavior changed, treat that as a real regression and repair the UI before moving on.

## Validation and Acceptance

Acceptance is behavior-based and should be judged in the browser, not just in code review.

The first acceptance criterion is that the packet run remains functionally identical after the dependency plan lands. `/start`, the route-driven Product, Design, Marketing, and Build Plan packet pages, and `/review` must still load for an entitled user in the same order. The packet work pages must still save the same facts through `api.packet.saveProjectDefinitionFacts`. Review must still expose `Design Pack`, `Marketing Pack`, `Build Pack`, `Prompt Pack`, and `Download Starter Snapshot` with the same destinations.

The second acceptance criterion is that the repeated anti-patterns are gone from the packet run. A human reviewing the packet pages should no longer see pill-shaped stage chips, decorative badge labels everywhere, nested or stacked card framing as the default layout language, or uppercase eyebrow headings above every section. Progress, status, and hierarchy should be communicated through type, spacing, placement, and simple rules instead.

The third acceptance criterion is that the packet surfaces no longer read like stock starter UI. Even when built from existing shadcn primitives, the pages should avoid the common "badge row plus cards plus pills" look. A reviewer should be able to describe the interface in terms of one clear work surface, deliberate typography, and restrained structure rather than in terms of reusable chrome blocks.

The fourth acceptance criterion is that each page has one obvious job. `/start` should orient and send the user into the packet flow. The route-driven packet work pages should foreground the current packet page and the `Save and continue` action, while keeping a visible but quieter way to stay on the current page. `/review` should foreground the Starter Snapshot download, keep the supporting packs visibly subordinate, and show only a one-line `Execute / Ship` mention before download. If a page presents multiple equally loud surfaces with no dominant next move, the cleanup is not done.

The fifth acceptance criterion is that the product still feels premium rather than merely stripped down. The UI should be simpler, but not generic or dead. It should still align with the saved design context: serious, bold, expensive, operational, and forward-moving. On desktop, this includes stacked entry and checkpoint pages plus split video-plus-work packet pages. On mobile, this includes keeping the top-level stage strip visible while collapsing the within-stage packet-page strip into a lighter control.

The sixth acceptance criterion is a layout-specific squint test. A reviewer should be able to identify the primary task region, the current orientation cue, and the subordinate support area within two seconds on `/start`, any routed packet work page, and `/review`. If the page still reads as a grid of equal boxes or a stack of similarly weighted cards, the arrangement work is not complete.

The seventh acceptance criterion is a typography-specific hierarchy check. Every packet surface should have a clear three-level hierarchy: a dominant title, a quieter metadata layer, and readable supporting copy. A reviewer should no longer see uppercase eyebrow labels, badge chips, or default card headers carrying the page by themselves. Paragraph-length copy should stay within a comfortable reading measure, and the question or objective on each packet page should be obvious within two seconds.

The eighth acceptance criterion is a clarity pass in the browser. A reviewer should be able to move through `/start`, the routed packet pages, and `/review` without stumbling over internal jargon or needing to infer the next action from layout alone. Every major surface should make its primary action obvious in one read, field blockers should be phrased in human language, and no visible copy should depend on internal terms like `level`, `reward`, `required facts`, `packet-definition run`, or lesson-production metadata such as `L2 pending`.

The ninth acceptance criterion is that the focused integration tests, `apps/web/tests/integration-ui/packet-stage-sidebar.test.tsx`, `apps/web/tests/unit/packet-stage-routes.test.ts`, `bun run lint`, `bun run build`, `bun run test:e2e:sandbox:default-ship`, and ideally the full `bun run test:e2e:sandbox` all pass or have an explicitly documented reason for any temporary skip.

## Idempotence and Recovery

This plan is intentionally presentation-first and safe to rerun because it should not require schema changes, data migrations, or packet compiler contract changes beyond what the dependency plan already introduced. The safe recovery rule is to keep the packet compiler and Convex interfaces stable while iterating on the packet-flow components. If a cleanup pass breaks route gating, stage readiness, or save behavior, revert only the touched packet-flow presentation component and rerun the narrow test that covers that surface before attempting the next simplification.

If a component starts growing into a large mixed UI-and-logic file during the redesign, stop and extract a smaller feature-local subcomponent rather than pushing past the 150-line component rule. Keep those extractions inside `apps/web/features/packet-flow/` so the cleanup remains scoped. If a visual simplification proposal requires changing `packages/packet-compiler/` or the Convex schema, treat that as a sign the plan has drifted and update the `Decision Log` before continuing.

If the simplified UI becomes too flat or loses necessary orientation, reintroduce only the minimum structural cue needed, such as a divider, a sentence-case section label, or a subtle emphasis row. Do not fall back to badges and cards as the default recovery move. The recovery principle is measured hierarchy, not restoring the old chrome.

## Artifacts and Notes

Current evidence of the anti-pattern concentration:

    $ rg -n "Badge|CardHeader|CardContent|<Card|from \"@/components/ui/card\"|from \"@/components/ui/badge\"" apps/web/features/packet-flow/components apps/web/features/execute-ship/components -g '!**/node_modules/**'
    apps/web/features/packet-flow/components/packet-stage-nav.tsx:9:import { Badge } from "@/components/ui/badge";
    apps/web/features/packet-flow/components/progression/packet-stage-progress-panel.tsx:11:import { Badge } from "@/components/ui/badge";
    apps/web/features/packet-flow/components/packet-stage-sidebar.tsx:9:import { Badge } from "@/components/ui/badge";
    apps/web/features/packet-flow/components/packet-stage-step-card.tsx:4:import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
    apps/web/features/packet-flow/components/review/packet-review-checkpoint-card.tsx:3:import { Badge } from "@/components/ui/badge";
    apps/web/features/packet-flow/components/review/packet-review-execute-preview.tsx:5:import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

Current evidence that the forms themselves are already simple enough to preserve:

    apps/web/features/packet-flow/components/packet-stage-field.tsx
    Label -> Input or Textarea only, with no extra workflow state embedded in the field renderer

Current evidence that the live routed packet shell is now the right leverage point:

    apps/web/app/(workspace)/product/[stepId]/page.tsx
    apps/web/app/(workspace)/design/[stepId]/page.tsx
    apps/web/app/(workspace)/marketing/[stepId]/page.tsx
    apps/web/app/(workspace)/build-plan/[stepId]/page.tsx
    apps/web/features/packet-flow/components/packet-stage-page.tsx
    apps/web/features/packet-flow/components/video/packet-video-card.tsx

Those nested route files validate `stepId`, load `PacketWorkspaceState`, and all render the same shared packet-stage shell.

Current evidence that blocker-label cleanup is already complete:

    apps/web/features/packet-flow/components/packet-stage-sidebar.tsx
    apps/web/tests/integration-ui/packet-stage-sidebar.test.tsx

The sidebar already maps missing fact keys through `packetFieldLabel`.

Shared-shell validation after the first Milestone 1 implementation slice:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx

    Test Files  2 passed (2)
         Tests  7 passed (7)

Files that now define the shared routed packet chrome:

    apps/web/features/packet-flow/components/packet-stage-nav.tsx
    apps/web/features/packet-flow/components/progression/packet-stage-progress-panel.tsx
    apps/web/features/packet-flow/components/progression/packet-stage-step-strip.tsx
    apps/web/features/packet-flow/components/packet-stage-sidebar.tsx
    apps/web/features/packet-flow/components/video/packet-video-card.tsx
    apps/web/features/packet-flow/components/packet-stage-page.tsx

Milestone 2 validation after distilling `/start` and `/review`:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/packet-start-page.test.tsx tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-review-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx

    Test Files  4 passed (4)
         Tests  10 passed (10)

Files that now define the packet kickoff and checkpoint surfaces:

    apps/web/features/packet-flow/components/packet-start-page.tsx
    apps/web/features/packet-flow/components/start/packet-start-overview-card.tsx
    apps/web/features/packet-flow/components/packet-review-page.tsx
    apps/web/features/packet-flow/components/review/packet-review-checkpoint-card.tsx
    apps/web/features/packet-flow/components/review/packet-review-artifact-grid.tsx
    apps/web/features/packet-flow/components/review/packet-review-execute-preview.tsx
    apps/web/features/packet-flow/components/review/packet-review-download-bridge.tsx

Milestone 3 validation after distilling the routed workbench:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/packet-start-page.test.tsx tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-review-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx

    Test Files  4 passed (4)
         Tests  11 passed (11)

Files that now define the routed packet workbench interaction:

    apps/web/features/packet-flow/hooks/use-packet-stage-step-state.ts
    apps/web/features/packet-flow/components/packet-stage-step-card.tsx
    apps/web/features/packet-flow/lib/packet-step-save-feedback.ts
    apps/web/features/packet-flow/lib/packet-stage-videos.ts
    apps/web/tests/integration-ui/packet-stage-page.test.tsx
    apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts
    apps/web/tests/e2e/auth-protection.sandbox.spec.ts

Milestone 4 validation after the full packet distillation pass:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bunx vitest run --project unit tests/unit/packet-stage-routes.test.ts

    Test Files  1 passed (1)
         Tests  3 passed (3)

    $ bunx vitest run --project integration-ui tests/integration-ui/packet-start-page.test.tsx tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-review-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx

    Test Files  4 passed (4)
         Tests  11 passed (11)

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ bun run lint
    Found 0 warnings and 0 errors.

    $ bun run build
    next build
    ✓ Compiled successfully
    ✓ Generating static pages (68/68)

Sandbox browser validation status from this run:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bun run test:e2e:sandbox --grep @default_ship
    4 skipped

    $ bun run test:e2e:sandbox
    6 skipped

Live browser QA evidence after the follow-up regression fix:

    Local stack: bun run dev:full
    Web: http://localhost:3000
    Signed-in QA account: test-entitled@test.com
    Browser observation: /product/foundation now loads with 0 console errors after reload

Regression proof that guards the live-query identity churn path:

    apps/web/tests/integration-ui/packet-stage-page.test.tsx
    "does not loop when live workspace state arrives with new object identities"

## Interfaces and Dependencies

The packet compiler contract in `packages/packet-compiler/src/stages/stage-definitions.ts` must remain authoritative. The plan assumes the stage IDs, labels, routes, descriptions, and step field keys stay stable after `docs/codex/2026-03-26-17-17-38-EDT-packet-video-page-funnel.md` lands. Do not rename or remove packet stages as part of this cleanup.

`apps/web/features/packet-flow/lib/packet-workspace-types.ts` defines `PacketWorkspaceState` from `api.packet.getPacketWorkspaceState`. That type is the packet UI’s single source of truth for readiness, current stage, review state, and workflow unlock state. The cleanup should continue to consume that type rather than inventing parallel client-only models for the same data.

`apps/web/features/packet-flow/components/packet-stage-page.tsx`, `apps/web/features/packet-flow/hooks/use-packet-stage-step-state.ts`, and `apps/web/features/packet-flow/lib/packet-stage-routes.ts` are the current routed packet-page behavior boundary. They depend on `api.packet.saveProjectDefinitionFacts`, `buildStageDraftValues`, `buildSavePayload`, `PacketStageField`, and the route helper functions. Those interfaces must remain in place because they enforce save behavior, draft reconstruction, and route-aware movement. The cleanup may reorganize how the screen looks, but it should not change the mutation signature. The only planned interaction change is making the primary action explicitly `Save and continue`, with a separate stay-put option.

`apps/web/features/packet-flow/components/progression/packet-stage-progress-panel.tsx` and `apps/web/features/packet-flow/components/progression/packet-stage-step-strip.tsx` are now the shared routed packet navigation boundary inside a stage. The progress panel owns the objective framing copy, and the step strip owns the responsive packet-page navigation pattern: horizontal route links on desktop and a native page picker on mobile. Later milestones may change the wording and spacing, but this two-part boundary should remain the shared packet-page navigation contract unless the plan is explicitly revised.

`apps/web/features/packet-flow/hooks/use-packet-stage-step-state.ts` now exposes `handleSaveAndContinue` and `handleSaveAndStay` instead of a single opaque save action. `apps/web/features/packet-flow/components/packet-stage-step-card.tsx` is the only caller that should decide which save intent to use. The hook still owns save classification, field validation, mutation calls, and post-save focus behavior; the card only chooses whether a successful complete save should route forward.

`apps/web/features/packet-flow/components/review/packet-review-download-bridge.tsx` and the review child components must keep the current review contract intact. The archive GET routes remain pure downloads, and the optional post-review unlock must remain a separate action. The simplification plan is not permission to merge those actions or change the review labels. It is, however, expected to change when the optional branch becomes visibly large: only a one-line mention before download, then the real optional branch after the download moment.

`apps/web/features/packet-flow/components/packet-start-page.tsx` and `apps/web/features/packet-flow/components/start/packet-start-overview-card.tsx` now own the Start page hierarchy directly. `PacketStageNav` is no longer part of the `/start` body contract. The Start surface should stay stacked and route-light: one intro, one shared video card, and one dominant CTA into the next unlocked required packet stage.

`apps/web/features/packet-flow/components/video/packet-video-card.tsx` is now the shared video chrome boundary across Start, routed packet work pages, and Review. `apps/web/features/packet-flow/components/start/packet-start-welcome-video-card.tsx` is only a thin wrapper around that shared surface. The plan assumes that video reuse continues and that the same player is used across the packet run. If the cleanup changes the start or workbench layout, it must still use the packet-flow video system in place rather than hardcoding a new media source or duplicating video chrome per page.

The shadcn component library remains the primitive layer, not the design language. It is acceptable to keep using shadcn inputs, buttons, separators, and other base controls where they solve real interaction needs. It is not acceptable to let `Badge`, card stacks, or pill-like wrappers become the default organizational system for these packet pages. The plan depends on that distinction so the final UI feels custom to Ship by Sunday instead of like a starter template with new copy.

`apps/web/features/packet-flow/lib/packet-stage-videos.ts` and `apps/web/features/packet-flow/lib/packet-step-save-feedback.ts` are part of the UI contract for this slice. They are not just content helpers. Their wording shapes the shared video surface, review framing, and save-state feedback across the packet run, so they must be updated in step with the visual simplification. The intended output language is plain, operational, and user-facing: use `page` when referring to the current work surface, reserve `stage` for the top-level journey only when necessary, prefer `required answers` over `required facts` unless the product is explicitly teaching the data model, and favor explicit CTAs such as `Save and continue`, `Save and stay`, and `Download Design Pack` over generic actions such as `Save step` or `Open`.
