# Normalized Pass: Runtime Boundary Hardening

## Facts

The old `Remove Runtime Footguns` ExecPlan combined four distinct implementation seams. Each seam has different owners, tests, and failure modes. Keeping them together makes the plan harder to execute and easier to widen into broad cleanup.

Browser observability is a client transport problem. It should be best-effort and must catch rejected fallback fetches so error reporting cannot create another unhandled error.

Bonus lesson viewed tracking is an authenticated write problem. The server should own the authority to mark a lesson viewed, and the client component should only trigger the lifecycle event.

Codex app-server route hardening is a route boundary problem. Protocol and error contracts should be lightweight imports, while process execution and runtime clients stay behind server-owned modules that routes do not import casually.

Public metadata hardening is a dependency graph and route behavior problem. Sitemap and docs catch-all routes should be explicit and should not depend on heavy rendering or private runtime graphs.

## Recommendation

Create one Program with four child ExecPlans:

- harden client observability transport
- server-own bonus lesson view tracking
- split Codex app-server route boundary
- harden public metadata routes

The first child should be client observability transport because it is the smallest, safest runtime fix and proves the Program's "best-effort side channel" rule before higher-risk server and route slices.

## Boundaries

Do not combine child slices during implementation. Do not use the Codex reference as a literal port. Copy its boundary discipline: protocol schema, transport, dispatch, lifecycle ownership, telemetry, and process execution stay separate.

## Risks

The main risk is converting this Program into a broad runtime cleanup initiative. The child plans should keep write sets narrow and should update the Program after each slice lands.
