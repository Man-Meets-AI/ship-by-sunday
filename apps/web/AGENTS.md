# apps/web/AGENTS.md

## Ship by Sunday — web app rules

- This product is packet-first, not course-first.
- Required funnel:
  Start -> Product -> Design -> Marketing -> Build Plan -> Review & Download
- Optional post-download library:
  Execute / Ship
- Do not preserve old CEO / Design / Build / Ship framing if it conflicts with packet-first logic.
- Do not turn workflow or ephemeral state into canonical intake.
- Preserve unlock logic exactly:
  - design packet after Design
  - marketing packet after Marketing
  - build packet after Build Plan
  - full repo zip at Review & Download

## Source reading order

Before planning or implementation, read:

1. `docs/ship-by-sunday/packet-contract-and-question-map-2026-03-23.md`
2. `docs/ship-by-sunday/input-architecture-keep-kill-combine-2026-03-23.md`
3. `docs/ship-by-sunday/curriculum-reset-funnel-2026-03-23.md`
4. `docs/ship-by-sunday/repo-input-audit-2026-03-23.md`
5. `docs/ship-by-sunday/openai-domain-contract-reconciliation-2026-03-23.md`

Use original transcripts and planning docs only to salvage useful teaching beats, examples, and voice.

## Planning behavior

- For major IA, lesson, or funnel work, create an ExecPlan before coding.
- Explicitly separate fact / workflow / derived / ephemeral.
- Call out contradictions instead of papering over them.

## Convex-backed state

- Convex-backed product state is the source of truth in `apps/web`.
- Do not mirror `useQuery` results or server-loaded workspace state into React `useState` just to drive normal rendering.
- Keep local React state only when the reason is clearly UX-only:
  - editable draft buffer
  - inline validation or save feedback
  - optimistic mutation state
  - client-only acknowledgement that Convex should not store
- If local state would survive long enough to compete with Convex truth across refresh, route change, or save, remove it.
