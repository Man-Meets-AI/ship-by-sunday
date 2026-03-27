# Review Route Build Slice Example

- **Doc type:** custom build-packet example
- **Surface or slice:** review-route to starter-snapshot handoff
- **Status:** example
- **Baseline source:** `docs/openai/codex_long_horizon_templates/`

## Objective

Turn a completed review route into a reliable starter-snapshot handoff with the generated build docs, validation steps, and final download package intact.

## Why this matters

The downloadable packet is the product output. If the review route does not hand off a coherent build packet and starter snapshot, the customer leaves with scattered context instead of an executable next step.

## In scope

- wiring the review route to the final starter-snapshot package
- generating or refreshing the build packet under `docs/build/`
- validating the final download path and the build doc tree
- documenting the demo flow for a fresh reviewer

## Out of scope

- redefining product facts gathered earlier in the funnel
- rewriting design or marketing packets
- speculative roadmap work beyond the review-route handoff

## User-visible outcome

After reaching Review & Download, the customer can download a starter snapshot that includes a coherent build packet and enough validation/run instructions to continue implementation without rebuilding context from scratch.

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

- build packet files under `docs/build/`
- implementation changes required for handoff
- validation commands and results
- updated run or demo instructions

## Done when

- the review route still works
- the starter snapshot includes the expected build docs
- the validation and demo flow are documented
- the handoff is understandable to a fresh reader
