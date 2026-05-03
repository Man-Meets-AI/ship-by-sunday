# Build Pack Autonomy Research Pass

## Scope

This research pass preserves the repo-grounded evidence for the generated-repo autonomy initiative. The initiative starts in `packages/blueprint-compiler` and the generated customer repo surface under `docs/build/`.

## Repo Evidence

`packages/blueprint-compiler/src/blueprints/render-build-blueprint.ts` currently derives validation commands from `facts.validation_plan` with keyword matching. Unknown steps become shell comments such as `# ${validationStep}`, which makes the generated plan look executable while silently skipping an unrecognized check.

The Build Pack already generates `docs/build/docs/agent-handoff.md`, `prompt.md`, `plans.md`, `implement.md`, and `documentation.md`. The pack tells an agent what to read and update, but it does not generate a deterministic readiness verdict or a typed validation manifest.

The compiler schema already includes enough source facts for a first readiness slice: `selected_next_slice`, `core_flow`, `must_have_capabilities`, `scope_in`, `scope_out`, `acceptance_criteria`, `validation_plan`, `demo_flow`, `proof_sources`, `open_questions`, and placeholder-friendly `domain`, `contact_email`, and `support_email`. No new canonical fields are required for the first slice.

`packages/blueprint-compiler/tests/blueprint-renderers.test.ts` and `packages/blueprint-compiler/tests/repo-generation.test.ts` mostly assert important sections and substrings. They should be strengthened to assert the generated readiness file, typed validation entries, explicit blockers, visible placeholder work, and customer-safe snapshot content.

## Constraints

The first implementation slice must not touch auth, billing, checkout, Convex runtime, app routes, provider setup, generated mirrors, or unrelated docs.

`domain`, `contact_email`, and `support_email` are placeholder-friendly. Missing or placeholder-like values should create readiness warnings or customer-input blockers, not prevent repo generation.

The generated repo must not claim autonomous build readiness until a clean-room replay proof exists in a later slice.

## First Slice Finding

The first slice should create a compiler-owned Build Pack readiness model and generated `docs/build/docs/readiness.md`. The model should derive from existing canonical facts, classify validation entries as `runnable`, `manual`, or `blocked`, surface placeholder and weak facts, and link readiness from `agent-handoff.md` before the copy-ready prompt.
