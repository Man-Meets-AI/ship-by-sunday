# Review Route Build Slice Example

- **Doc type:** custom build-codebase example
- **Surface or slice:** review-route to starter-snapshot handoff
- **Status:** example
- **Baseline source:** `docs/openai/codex_long_horizon_templates/`

## Objective

Turn a completed review route into a reliable starter-snapshot handoff with the generated build docs, validation steps, and final download codebase intact.

## Why this matters

The downloadable codebase is the product output. If the review route does not hand off a coherent build codebase and codebase, the customer leaves with scattered context instead of an executable next step.

## In scope

- wiring the review route to the final starter-snapshot codebase
- generating or refreshing the build codebase under `docs/build/`
- validating the final download path and the build doc tree
- documenting the demo flow for a fresh reviewer

## Out of scope

- redefining product facts gathered earlier in the funnel
- rewriting design or marketing codebases
- speculative roadmap work beyond the review-route handoff

## User-visible outcome

After reaching Review & Download, the customer can download a codebase that includes a coherent build codebase and enough validation/run instructions to continue implementation without rebuilding context from scratch.

## Required facts

- `objective`
- `scope_in`
- `scope_out`
- `implementation_plan`
- `acceptance_criteria`
- `validation_plan`
- `demo_flow`
- `dependencies`

## Deliverables

- build codebase files under `docs/build/`
- implementation changes required for handoff
- validation commands and results
- updated run or demo instructions

## Done when

- the review route still works
- the codebase includes the expected build docs
- the validation and demo flow are documented
- the handoff is understandable to a fresh reader
