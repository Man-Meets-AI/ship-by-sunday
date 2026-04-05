# apps/web/AGENTS.md

## Ship by Sunday — web app rules

- This product is blueprint-first, not course-first.
- Root `DESIGN.md` is the canonical visual source of truth for user-facing UI in this repo.
- Before changing layout, styling, theming, motion, docs chrome, or marketing presentation in `apps/web`, read root `DESIGN.md` and preserve that system unless the task explicitly changes it.
- Required funnel:
  Start -> Product -> Design -> Marketing -> Build Plan -> Review & Download
- Optional post-download library:
  Execute / Ship
- Do not preserve old CEO / Design / Build / Ship framing if it conflicts with blueprint-first logic.
- Do not turn workflow or ephemeral state into canonical intake.
- The public outcome is one Blueprint delivered at Review & Download.
- Do not reintroduce separate pre-review download artifacts or stage-pack contracts into the UI unless the live product changes first.
- For user-facing UI work, also follow `docs/ship-by-sunday/design-pack/` as the repo-specific frontend design workflow pack.

## Planning behavior

- For major IA, lesson, or funnel work, create an ExecPlan before coding.
- Explicitly separate fact / workflow / derived / ephemeral.
- Call out contradictions instead of papering over them.
- Use older `docs/ship-by-sunday/*.md` planning files only for background context when the live app code does not already answer the question.

## Convex-backed state

- Convex-backed product state is the source of truth in `apps/web`.
- Do not mirror `useQuery` results or server-loaded workspace state into React `useState` just to drive normal rendering.
- Keep local React state only when the reason is clearly UX-only:
  - editable draft buffer
  - inline validation or save feedback
  - optimistic mutation state
  - client-only acknowledgement that Convex should not store
- If local state would survive long enough to compete with Convex truth across refresh, route change, or save, remove it.
