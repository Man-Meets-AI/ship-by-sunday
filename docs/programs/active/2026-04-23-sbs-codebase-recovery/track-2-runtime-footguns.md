# Runtime Footguns Research

This research pass captures the recurring runtime failure classes found in the review.

## Findings

Client observability still has a path where a failed browser report can surface as another unhandled client error. Prior runtime incidents showed that telemetry must never generate the same noise it is trying to report.

Bonus lesson viewed tracking still depends on a client Convex mutation during a timing-sensitive Clerk and Convex hydration window. The durable shape is a server-authenticated write path or same-origin API boundary, not a mount-time client mutation.

Several API route handlers still rely on fragile dynamic import patterns for the Codex app server. The healthy failure mode for those routes should be normal auth or request errors, not bundling or module-resolution crashes.

Public metadata routes still pull a heavier blog/docs dependency graph than needed. The docs catch-all route also needs explicit static behavior so public route proof is not tied to hidden Next.js defaults.

## Durable Implication

The second child ExecPlan should remove known runtime incident classes in one bounded pass. It should stay focused on runtime stability, not product route redesign or structural UI cleanup.
