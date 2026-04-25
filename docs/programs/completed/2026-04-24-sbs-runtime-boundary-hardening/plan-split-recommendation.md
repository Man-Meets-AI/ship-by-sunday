# Plan Split Recommendation

This initiative should split into four child ExecPlans.

## Slice 1

Path: `docs/exec-plans/active/2026-04-24-harden-client-observability-transport.md`

Goal: make browser client error reporting best-effort and catch rejected fallback fetches.

This slice should update only the client observability transport and focused tests. It should not redesign observability storage or release intake exports.

## Slice 2

Path: `docs/exec-plans/active/2026-04-24-server-own-bonus-lesson-view-tracking.md`

Goal: move bonus lesson viewed tracking behind a server-authenticated boundary.

This slice should remove client Convex auth hydration as the owner of the write. It should not redesign the lesson experience or entitlement model.

## Slice 3

Path: `docs/exec-plans/active/2026-04-24-split-codex-app-server-route-boundary.md`

Goal: separate lightweight Codex protocol, error, and service contracts from the spawn-capable runtime client.

This slice should remove route-level `importCodexAppServer` helpers and `turbopackIgnore` dynamic imports. It should not rewrite the whole Codex app-server runtime.

## Slice 4

Path: `docs/exec-plans/active/2026-04-24-harden-public-metadata-routes.md`

Goal: slim sitemap and docs route dependencies and make docs catch-all behavior explicit.

This slice should preserve public route behavior while shrinking route dependency risk. It should not change marketing copy or product route strategy.
