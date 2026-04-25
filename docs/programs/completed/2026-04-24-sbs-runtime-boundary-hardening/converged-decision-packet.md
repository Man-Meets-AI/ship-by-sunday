# Converged Decision Packet

This packet governs the Ship by Sunday runtime boundary hardening Program.

## Decisions

Decision: Supersede the oversized runtime-footguns ExecPlan with a Program.
Rationale: The source plan contains useful findings, but its implementation scope spans browser transport, server-authenticated course tracking, Codex process boundaries, and public metadata routes. Those are separate execution surfaces with separate proof.
Date: 2026-04-24

Decision: Keep `docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md` as the retired source brief instead of deleting it.
Rationale: The repo contract supports completed planning artifacts, and the old plan is not the implementation owner anymore. It should remain available as source context until the child Program slices land.
Date: 2026-04-24

Decision: Create child ExecPlans now.
Rationale: The Program contract supports child ExecPlans once a packet and immutable planning brief exist, and the four runtime slices are already concrete enough to be self-contained.
Date: 2026-04-24

Decision: Start with client observability transport.
Rationale: It is the smallest isolated write set, proves the best-effort telemetry invariant, and reduces noise before later runtime slices rely on observability evidence.
Date: 2026-04-24

Decision: Preserve Codex reference findings as boundary guidance.
Rationale: Codex separates protocol schema, transport, dispatch, lifecycle ownership, telemetry, and process execution. Ship by Sunday should copy that separation, not treat runtime hardening as one broad cleanup.
Date: 2026-04-24

## Outcome

The Program owns the runtime boundary initiative. The old ExecPlan is a source brief. The child ExecPlans own implementation.
