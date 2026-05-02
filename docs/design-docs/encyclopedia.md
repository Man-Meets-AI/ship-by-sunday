# Encyclopedia

This is the short repo glossary for agents and operators.

## Terms

### Blueprint

One stage-specific slice of the guided product-building flow. The product is blueprint-first, so blueprint stages are the main planning and UX unit.

### Stage-entry route

A stable top-level protected route such as `/product` or `/build-plan` that redirects into the canonical nested page for that stage.

### Ship by Sunday Blueprint

The single generated repo artifact exposed from `/review`. It is the public download contract.

### Review & Download

The terminal protected stage where the user verifies the generated materials and downloads the starter snapshot.

### Canonical fact

A durable, user-meaningful input that should survive across generation and downstream rendering. Canonical facts belong in the blueprint model, not in ad hoc workflow notes.

### Derived output

Anything generated from canonical facts, such as build docs, marketing copy, starter config, or prompt assets. Derived output should be regenerated, not hand-maintained as new intake.

### Compatibility redirect

An older route that still resolves but is no longer the primary product surface. Examples include `/mission`, `/lesson/[lessonKey]`, and `/artifacts`.

### Hosted Convex dev

The only supported Convex development mode in this repo. Local Convex mode is a non-goal.

### Sandbox E2E

The scheduled and manually runnable Playwright lane behind `bun run test:e2e:sandbox`. It is useful regression signal for sandbox browser behavior, but it is not the release gate.

### Hosted release proof

The release-owned proof path behind `bun run release:proof`. It runs against the target environment with release personas and is the browser proof surface for staging and production release confidence.

### ExecPlan

The long-horizon implementation plan format stored under `docs/exec-plans/`. Use it for complex, risky, or multi-milestone work.
