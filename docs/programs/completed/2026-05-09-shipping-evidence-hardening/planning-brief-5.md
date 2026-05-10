---
title: Shipping Evidence Generated Repo Command Contract Planning Brief 5
program_id: shipping-evidence-hardening
brief_version: 5
status: current
summary: Fifth planning brief for proving generated customer repos can resolve their workspace and run the advertised low-cost command contract in a clean-room fixture.
read_when:
  - Writing or resuming the generated customer repo command-contract child ExecPlan.
  - Changing Codebase snapshot package scripts, generated operating-pack scripts, workspace package inclusion, or generated CI examples.
---

# Shipping Evidence Generated Repo Command Contract Planning Brief 5

Create the next child ExecPlan for generated customer repo command-contract proof. This is the final required Shipping Evidence Hardening slice. The slice should materialize a generated customer repo into a temporary clean-room directory, verify the generated workspace can resolve with its shipped lockfile and workspace package set, and run the low-cost generated commands that the snapshot tells a buyer or agent to run before product implementation.

The problem to close is not a missing unit assertion. The current tests prove generated docs point at package script names, but they do not prove a downloaded repo can actually execute those commands outside the source checkout. A probe already showed `bun run agentic:check` passes from a materialized snapshot, while `bun install --lockfile-only --frozen-lockfile` fails because the generated `apps/web/package.json` depends on `@shipbysunday/codebase-presentation` and the snapshot only ships `packages/codebase-compiler`.

Keep the proof focused on the generated customer artifact. Include every workspace package required for dependency resolution and app imports, but do not leak internal release docs, source instruction packs, generated mirrors, local runner internals, provider secrets, machine-local files, or historical Program archives into the snapshot. The clean-room proof should run the no-provider contract commands: lockfile-only frozen install, generated Program lint, generated ExecPlan lint, their aggregate `agentic:check`, and the generated Codebase contract check if one is added. Hosted browser, Stripe, Clerk, Convex, and full app build proof remain outside this slice unless implementation proves a generated command advertises them as pre-setup requirements.

Update generated docs, generated CI examples, root package scripts, and compiler tests only as needed so command names match runnable proof. If the Build Pack currently advertises a command that the generated repo cannot run without omitted internal tests or templates, either make the command customer-safe and runnable or stop advertising it as a baseline generated command. Do not hide the gap by broadening the test to merely check string presence.

The result should answer: which commands are safe to run in a clean generated repo before provider setup, which workspace packages must ship for the snapshot to install, which commands intentionally require a later dependency or provider setup step, and which test catches command-contract drift before release.
