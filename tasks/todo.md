# Local Task Plan

Use this file for engineer-local execution checklists that support the repo work.

It does not replace the root `todo.md`, which remains the launch tracker and source of truth for launch operations.

## Active

- [x] Make the app-shell top bar and bottom skill rail edge-to-edge instead of floating panels
- [x] Remove the `Deliver` label from the student action-card metadata row
- [x] Sanitize generated lesson content so only student-facing intro and coach content reaches the product
- [x] Simplify the student action-card heading copy in the lesson workbench
- [x] Remove internal coach-panel watchout cards from the student-facing lesson UI
- [x] Remove internal lesson blueprint summary cards from the student-facing workbench UI
- [x] Remove the lesson objective panel collapse control and delete the supporting UI state / shell logic
- [x] Add root developer onboarding docs and architecture notes
- [x] Create local `tasks/` scaffolding referenced by `AGENTS.md`
- [x] Add lint, format, unit-test, smoke-test, and combined check scripts
- [x] Add typed env loaders for web, server, and Convex usage
- [x] Move the shared course source of truth out of `app/` and into `lib/course/`
- [x] Centralize lesson slugs and content resource metadata for runtime + generator use
- [x] Regenerate lesson content modules with generated-file markers
- [x] Verify the repo with lint, format check, unit tests, smoke tests, `typecheck`, and `check`

## Review

- Outcome: App-shell routes now use full-width top and bottom chrome instead of inset floating header/footer panels, while the main content remains centered and padded inside the viewport.
- Verification: `pnpm exec tsc --noEmit` and `pnpm exec eslint components/product-shell.tsx components/skill-rail.tsx`
- Follow-up: Visual QA the app-shell routes in both lesson split/focus layouts plus mission/settings/artifacts to confirm the chrome feels intentional at each breakpoint.
- Outcome: The lesson action row no longer prefixes the outcome text with `Deliver`, so lines like `A ready workspace with all four worksheets open.` read naturally.
- Verification: `pnpm exec tsc --noEmit`, `pnpm exec eslint components/lesson-workbench.tsx`, and `rg -n 'Deliver' components/lesson-workbench.tsx`
- Follow-up: Keep compact action metadata rows noun-free unless the label materially improves clarity.
- Outcome: Generated lesson intros now use student-facing opening lines, generic teacher-script coach cards are removed from generated content, and the lesson-content index enforces a student-safe runtime sanitization pass before render.
- Verification: `node scripts/build-lesson-content-from-blueprint.mjs`, `pnpm exec tsc --noEmit`, `pnpm exec eslint content/lessons/index.ts scripts/build-lesson-content-from-blueprint.mjs components/lesson-shells.tsx`, and targeted `rg` scans of generated lesson files for teacher-facing intro/example patterns.
- Follow-up: The content schema still contains internal fields like `lessonMeta.goal`, `lessonMeta.purpose`, `workbench.prompt`, and `sourceRefs`; keep them unrendered unless they are explicitly rewritten for students.
- Outcome: The lesson action card now uses a single student-facing heading instead of the awkward stacked `Action` + `Your job now` label.
- Verification: `pnpm exec tsc --noEmit` and `pnpm exec eslint components/lesson-workbench.tsx`
- Follow-up: Keep workbench card headers to one clear phrase unless a second label adds real learner value.
- Outcome: The student coach panel now strips internal `Avoid this` watchout cards, and the lesson-content generator no longer emits those cards from blueprint watchouts.
- Verification: `pnpm exec tsc --noEmit` and `pnpm exec eslint components/lesson-shells.tsx scripts/build-lesson-content-from-blueprint.mjs`
- Follow-up: If the generated lesson files are regenerated later, this cleanup will hold because the blueprint script no longer maps watchouts into coach examples.
- Outcome: The student-facing lesson workbench no longer renders internal blueprint summary surfaces such as `Purpose`, `Why this exists`, or `Workbench Prompt`.
- Verification: `pnpm exec tsc --noEmit` and `pnpm exec eslint components/lesson-workbench.tsx`
- Follow-up: If more internal blueprint fields leak later, keep them in content files but gate them behind an explicit internal-only renderer instead of the learner UI.
- Outcome: The lesson objective panel is now always open in the split lesson shell, and the collapse state, toggle handlers, and panel-default wiring for that control are removed.
- Verification: `pnpm exec tsc --noEmit` and `pnpm exec eslint components/lesson-page.tsx components/lesson-shells.tsx lib/course/manifest.ts`
- Follow-up: `pnpm run typecheck` still fails in the repo’s Next build pipeline because `.next/server/webpack-runtime.js` tries to load a missing `./76.js` chunk during page-data collection.
- Outcome: Developer onboarding, safety rails, and shared course metadata are now materially cleaner and more explicit.
- Verification: `pnpm run lint`, `pnpm run format:check`, `pnpm run test:unit`, `pnpm run test:smoke`, `pnpm run typecheck`, and `pnpm run check`
- Follow-up: Split `lib/course/manifest.ts` and the large lesson UI files after the launch-critical path is stable.
