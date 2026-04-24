# Converged Decision Packet

This packet governs the Ship by Sunday codebase recovery initiative.

## Decisions

Decision: Treat the review findings as one Program instead of disconnected cleanup notes.
Rationale: The findings span release evidence, runtime reliability, product contract drift, feature complexity, data contracts, and design-system sprawl. Those slices need shared ordering and durable memory.
Date: 2026-04-23

Decision: Make CI/CD harness retirement and working-path codification the first slice.
Rationale: The Dub-style harness plan is the wrong direction. Recent remote evidence shows the existing `Dev Staging Proof`, `CI`, `Production Release Proof`, and `Convex Production Deploy` lanes are the release path to preserve before release/intake repair starts.
Date: 2026-04-24

Decision: Move release and intake correctness to the second slice.
Rationale: The release/intake layer still contains concrete dirty-work bugs, but it should be repaired after the rejected CI/CD direction is retired so the work preserves the proven release path.
Date: 2026-04-24

Decision: Keep runtime footguns separate from product route contract work.
Rationale: Runtime hardening should remove recurring incident classes without first deciding product IA or route copy.
Date: 2026-04-23

Decision: Reconcile route truth before deep blueprint and workbench refactors.
Rationale: Refactoring the main product surfaces is safer after docs, QA, navigation, and route behavior agree on what the product is.
Date: 2026-04-23

Decision: Delay design/dependency cleanup until correctness and contract work are underway.
Rationale: Dependency cleanup can improve the repo, but it should not distract from release evidence, runtime incidents, or core workflow complexity.
Date: 2026-04-23
