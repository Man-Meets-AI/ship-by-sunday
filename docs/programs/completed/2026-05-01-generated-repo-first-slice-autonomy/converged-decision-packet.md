# Generated Repo Autonomy Converged Decision Packet

## Decisions

Decision: Use a Program for generated-repo autonomy.

Rationale: The roadmap spans several compiler, generated-doc, QA, replay-proof, and regression-test slices. A single ExecPlan would either be too broad or would lose initiative-level truth after the first slice.

Decision: Make the Build Pack Readiness Manifest the first child slice.

Rationale: The current handoff gap is not missing prose; it is missing a deterministic readiness report and typed validation manifest. This can be derived from existing facts and tested without changing runtime surfaces.

Decision: Do not add new canonical schema fields in the first slice.

Rationale: Existing facts already provide first-slice identity, scope, acceptance, validation, demo proof, placeholders, open questions, and weak-fact signals. Adding required intake fields would widen the slice and risk blocking repo generation.

Decision: Preserve placeholder-friendly facts as allowed generation inputs while surfacing them as customer-input work.

Rationale: `domain`, `contact_email`, and `support_email` are intentionally placeholder-friendly. The generated repo should make their production-readiness impact visible without treating them as compiler blockers.

Decision: Classify validation entries as `runnable`, `manual`, or `blocked`.

Rationale: The current shell-comment fallback hides unknown validation steps. Typed entries let the generated docs distinguish command proof, manual proof, and customer-input blockers.

## First Slice Acceptance

The first child ExecPlan is accepted when the generated blueprint tree and materialized repo both include `docs/build/docs/readiness.md`, agent handoff points to readiness before the copy-ready prompt, validation entries are typed, placeholder and weak-fact work is visible, and focused compiler validation passes.
