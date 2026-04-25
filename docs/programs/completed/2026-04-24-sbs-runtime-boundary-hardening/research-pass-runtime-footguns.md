# Research Pass: Runtime Footguns

## Source

This pass preserves the durable findings from `docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md`.

## Findings

Ship by Sunday has four related runtime boundary risks that should not remain bundled in one implementation contract. Browser observability currently risks turning failed error reporting into another unhandled browser failure. Bonus lesson viewed tracking is client-triggered and depends on Convex auth hydration timing. Codex app-server routes have route-level dynamic imports into a spawn-capable runtime module. Public metadata routes can pull heavier dependency graphs than their public route responsibilities require.

The Codex reference findings in the source ExecPlan are the boundary model for this Program. Codex keeps protocol schema, transport parsing, request dispatch, lifecycle ownership, telemetry, and process execution in separate modules. Codex also treats analytics and observability as best-effort side channels with bounded sends and warning-only failures. Ship by Sunday should copy that boundary discipline instead of treating runtime hardening as one broad cleanup.

## Evidence Surfaces

The Ship by Sunday surfaces to inspect while authoring child plans are:

- `apps/web/features/observability/lib/client-error-report.ts`
- `apps/web/tests/unit/observability-client-report.test.ts`
- `apps/web/features/execute-ship/components/bonus-lesson-view-tracker.tsx`
- `apps/web/tests/integration-ui/bonus-lesson-view-tracker.test.tsx`
- `apps/web/app/api/codex/`
- `apps/web/features/codex/server/`
- `apps/web/app/sitemap.ts`
- `apps/web/app/docs/[[...mdxPath]]/page.tsx`

The Codex reference surfaces already recorded in the source ExecPlan are:

- `/Users/parkerrex/Developer/Codex/codex-rs/app-server-protocol/src/jsonrpc_lite.rs`
- `/Users/parkerrex/Developer/Codex/codex-rs/app-server-protocol/src/protocol/common.rs`
- `/Users/parkerrex/Developer/Codex/codex-rs/app-server/src/lib.rs`
- `/Users/parkerrex/Developer/Codex/codex-rs/app-server/src/transport/mod.rs`
- `/Users/parkerrex/Developer/Codex/codex-rs/app-server/src/codex_message_processor.rs`
- `/Users/parkerrex/Developer/Codex/codex-rs/app-server/src/bespoke_event_handling.rs`
- `/Users/parkerrex/Developer/Codex/codex-rs/analytics/src/client.rs`
- `/Users/parkerrex/Developer/Codex/codex-rs/analytics/src/events.rs`
- `/Users/parkerrex/Developer/Codex/sdk/typescript/src/exec.ts`
- `/Users/parkerrex/Developer/Codex/sdk/typescript/src/thread.ts`

## Program Implication

The right split is four child ExecPlans. Each child should own one runtime boundary and prove that boundary with focused tests or route probes. The Program should prevent scope bleed between browser transport, authenticated server writes, Codex runtime process ownership, and public metadata route dependency control.
