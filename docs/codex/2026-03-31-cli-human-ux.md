---
summary: Improve the Ship by Sunday CLI human-facing experience without changing the blueprint contract or breaking JSON and non-TTY automation. Rework the no-arg entry surface, startup banner, help system, prompt flow, and regression coverage around the existing Bun CLI blueprint.
read_when: Open this plan when changing how a human discovers, starts, navigates, or safely exits `bun run sbs` from a real terminal.
plan_status: done
---

# Sharpen the Ship by Sunday CLI Human UX

This is a living execution plan for the Ship by Sunday CLI human-facing UX slice. Keep it updated as implementation progresses so a new contributor can complete the work from this file alone without relying on chat history.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

Today a human who runs `bun run sbs` gets the same hardcoded help dump they would get from `bun run sbs --help`, plus a large banner in TTY mode. The command technically works, but it does not feel intentional, it does not orient a first-time operator well, and it does not expose recommended workflows cleanly. Subcommand help is also unreliable: `bun run sbs review --help` executes the review command instead of showing help, and `bun run sbs stage --help` fails as an invalid stage selector.

The goal of this slice is to make the CLI feel legitimate and trustworthy to a human operator while preserving the existing automation contract. After this work, a human running `bun run sbs` in a terminal should see a clear entry surface with the repository identity, a one-line explanation of what the CLI does, and obvious next moves. Help should be grouped around real workflows instead of one flat dump. Interactive stage prompts should explain where the user is, how far they have progressed, how to leave safely, and how to continue later. JSON and non-TTY usage must remain predictable, banner-free, and machine-safe.

The user-visible proof is straightforward. In a real terminal, `bun run sbs`, `bun run sbs --help`, and `bun run sbs stage product` should all feel oriented and deliberate. In a non-interactive shell, commands such as `bun run sbs schema --json` and `bun run sbs export --out -` should still emit clean machine-readable output with no themed banner or prompt behavior mixed in.

## Progress

- [x] 2026-03-31 10:55 EDT — Read `/Users/parkerrex/.agents/docs/prompts/exec-plan-writer.md`, `AGENTS.md`, and `docs/codex/PLANS.md`, then inspected the live CLI entrypoint, parser, banner renderer, prompt implementation, README usage notes, and blueprint-local tests before drafting this ExecPlan.
- [x] 2026-03-31 11:02 EDT — Grilled the plan against the live CLI blueprint, removed the optional no-arg menu branch, froze the startup and help contract, and pinned the prompt exit and non-TTY behavior to the existing save-after-each-field durability model.
- [x] 2026-03-31 12:13 EDT — Implemented the command catalog, workflow-oriented help renderer, lightweight version trust surface, and the no-arg TTY startup surface with repository identity and recommended next commands.
- [x] 2026-03-31 12:13 EDT — Refactored the interactive stage prompt into a pure session controller plus readline adapter, added `:clear` and `:quit`, and turned closed or cancelled prompts into explicit outcomes instead of the old `readline was closed` failure path.
- [x] 2026-03-31 12:13 EDT — Added regression coverage for startup routing, help/version behavior, prompt control flow, non-TTY safeguards, and repository entry-surface content, then updated the README and CLI docs to match the new contract.
- [x] 2026-03-31 12:16 EDT — Ran the full blueprint validation set (`test`, `typecheck`, `lint`, and `format:check`) and completed manual terminal proof for the human startup surface, grouped help, version output, JSON cleanliness, non-TTY prompt rejection, and `:quit` exit flow.

## Surprises & Discoveries

The current no-arg experience is not a real entry surface. `packages/ship-by-sunday-cli/src/parse-cli-command.ts` returns `{ kind: "help" }` when no command is provided, and `packages/ship-by-sunday-cli/src/cli.ts` prints the startup banner before `packages/ship-by-sunday-cli/src/run-cli.ts` emits the same static help text used for `--help`. That means no-arg startup and explicit help are currently identical except for the TTY banner.

Subcommand help does not exist today. The parser only recognizes `help`, `--help`, and `-h` before the first command token. Repository inspection and live runs showed two concrete regressions that this slice must eliminate:

    $ bun run sbs review --help
    Ship by Sunday draft review
    ...

    $ bun run sbs stage --help
    Unknown stage "--help". Expected one of product, design, marketing, build-plan.

The interactive prompt is tightly coupled to real process stdin and stdout through `node:readline/promises` in `packages/ship-by-sunday-cli/src/prompts/prompt-stage.ts`. It currently supports only two affordances: an empty answer keeps the existing value and `!clear` removes it. It does not show stage progress, it does not advertise a safe exit path, and closed stdin does not degrade well. A live prompt run with a temporary repo root surfaced `readline was closed` after an incomplete multiline interaction, and a closed stdin run could stall on the first question instead of failing fast with a clear message.

The existing automation contract is already narrow and valuable. `packages/ship-by-sunday-cli/src/cli.ts` suppresses themed output only for `--json` or `export --out -`. `packages/ship-by-sunday-cli/src/cli-json.ts` always includes the blueprint version in JSON responses, and the blueprint-local test suite already proves field mutation, import and export, review filtering, and help output. This slice should build on those seams rather than invent a new transport.

The blueprint already has the right injection seam for a prompt refactor. `packages/ship-by-sunday-cli/src/commands/stage-command.ts` and `packages/ship-by-sunday-cli/src/commands/resume-command.ts` accept a `promptStage` function and only own routing plus the final “saved” message. The plan should preserve that seam and move prompt orchestration behind it rather than widening command responsibilities.

Implementation also confirmed one parser edge and one prompt edge. `--version` needed to become its own parsed command kind so the handler layer could skip command execution entirely, and the prompt layer needed to return a structured interrupted outcome so `:quit` and Ctrl+C could stay success-path exits with a resume hint.

## Decision Log

2026-03-31 — Decision: treat TTY and non-TTY execution as separate UX modes, with any no-arg menu or interactive affordance available only when stdin and stdout are both attached to a real terminal. Rationale: the CLI must feel polished for humans without risking hangs, banners, or prompts in automation.

2026-03-31 — Decision: do not ship a no-arg interactive menu in this slice. Replace the current no-arg TTY behavior with a static entry surface plus grouped commands, and reserve menus for a future plan if operators still need them after this cleanup. Rationale: the repository has no prompt framework beyond readline, the current task is to make the CLI feel intentional without widening scope, and a menu would add interaction complexity before the core help and prompt regressions are fixed.

2026-03-31 — Decision: centralize command metadata so one source of truth can drive parsing, top-level help, subcommand help, recommended workflow grouping, and version or about surfaces. Rationale: the current hardcoded help dump in `packages/ship-by-sunday-cli/src/run-cli.ts` has already drifted from the parser contract.

2026-03-31 — Decision: add `--version` support as the lightweight trust surface for this slice and do not add a separate `about` subcommand unless implementation uncovers a real orientation gap that cannot fit inside the new help and startup surfaces. Rationale: JSON payloads already expose the version, and a simple human-readable version surface is materially useful while keeping scope tight.

2026-03-31 — Decision: keep global `--json` out of scope for this UX slice and leave JSON mode attached to concrete commands only. Rationale: the documented automation paths are all command-scoped already, and inventing a top-level JSON help payload would widen scope beyond first-impression and day-to-day human usability.

2026-03-31 — Decision: `bun run sbs` with no arguments will have two exact behaviors. In a real terminal where both `process.stdin.isTTY` and `process.stdout.isTTY` are true, it renders a human entry surface and exits `0`. In every other context, it prints the plain top-level help text and exits `0`. Rationale: this preserves script safety while still giving humans a deliberate landing surface.

2026-03-31 — Decision: explicit help and version commands must never be prefixed by the large startup banner. `bun run sbs --help`, `bun run sbs help`, `bun run sbs help <command>`, `<command> --help`, and `bun run sbs --version` should route through dedicated help or version rendering and exit before any command side effect. Rationale: help is reference material, not a startup ceremony, and the current global banner write in `cli.ts` is the hidden dependency that makes the surfaces blur together.

2026-03-31 — Decision: the new prompt control tokens are `:clear` and `:quit`. An empty answer still keeps the current value. `:clear` removes the current field value. `:quit` exits cleanly with code `0` after preserving all previously saved fields, and it is recognized only when typed as the first line of a field prompt. Rationale: colon-prefixed control words read like command affordances, avoid overloading normal prose input, and match the existing save-after-each-field durability seam.

2026-03-31 — Decision: non-interactive prompt attempts and broken prompt stdin should raise an `invalid_state` CLI error with exit code `2` and actionable guidance to run the command in a real terminal or use JSON and file-based commands instead. Rationale: prompt commands are valid commands, but the environment is not valid for interactive execution; making that explicit is more accurate than treating it as an unknown failure.

2026-03-31 — Decision: human-readable `--version` output will be exactly one line in the form `Ship by Sunday CLI v<blueprint-version>`. Rationale: this reuses the same version source as JSON mode and gives operators a stable string that is easy to read and easy to assert in tests.

2026-03-31 — Decision: split prompt orchestration into a pure session/controller module and a readline adapter, instead of keeping all question formatting and signal handling inside `prompt-stage.ts`. Rationale: the interactive flow needed to be testable at the control-token level without mixing it with Node-specific readline mechanics.

2026-03-31 — Decision: keep the no-arg startup surface static and banner-backed, not interactive. Rationale: the repo needed a trustworthy human landing surface, but not another navigation model, and the TTY/no-TTY split already covers the current UX gap.

## Outcomes & Retrospective

The scoped UX cleanup is complete. `bun run sbs` now has a deliberate TTY landing surface, help and version routing are trustable and side-effect free, and the interactive stage flow clearly explains how to continue, clear, quit, or recover without leaking readline errors.

The most useful lesson from the slice is that the CLI needed a small command catalog and a session/controller split more than it needed new UI chrome. Once those seams existed, the rest of the work stayed narrow: no blueprint contract changes, no draft storage changes, and no JSON regressions. The remaining follow-up is only opportunistic copy tuning if future operator feedback shows a gap.

## Context and Orientation

The relevant code starts at the repository root `package.json`, which exposes `bun run sbs` and delegates into `packages/ship-by-sunday-cli/package.json`. The blueprint entrypoint is `packages/ship-by-sunday-cli/src/cli.ts`. That file builds render options, decides whether the banner should be suppressed, writes the banner in TTY mode, and then calls `runCli()` from `packages/ship-by-sunday-cli/src/run-cli.ts`.

`packages/ship-by-sunday-cli/src/run-cli.ts` is the current human-facing hub. It contains the static `printHelp()` function, parses argv by calling `packages/ship-by-sunday-cli/src/parse-cli-command.ts`, resolves the repository root through `resolveRepoRootPath()` from `@shipbysunday/blueprint-compiler`, dispatches command handlers, and normalizes errors through `packages/ship-by-sunday-cli/src/cli-errors.ts`. This is the best place to move from a one-off help dump to a command catalog and workflow-aware renderer. The new contract should keep `runCli()` as the place that decides whether a parsed command becomes help, version, or a real handler call.

The banner and themed line formatting live in `packages/ship-by-sunday-cli/src/theme/render-banner.ts` and `packages/ship-by-sunday-cli/src/theme/render-theme.ts`. The banner already has the visual treatment; it lacks orientation details. This slice should keep the visual style subordinate to clarity, which means improving what the banner says before making it fancier. The current global write in `packages/ship-by-sunday-cli/src/cli.ts` is too blunt. It must be replaced with a startup renderer that is invoked only for the no-arg TTY entry surface, not for every command.

The interactive stage flow lives in `packages/ship-by-sunday-cli/src/prompts/prompt-stage.ts`. It reads and writes the canonical local draft through `packages/ship-by-sunday-cli/src/draft/draft-store.ts`, which persists one file at `.ship-by-sunday/draft.json` under the resolved repository root. Stage structure, step labels, field labels, helper text, and readiness all come from `@shipbysunday/blueprint-compiler`, especially `deriveStageStatus`, `getBlueprintStageDefinition`, `buildStepDraftValues`, `blueprintFieldLabel`, `blueprintFieldHelperText`, and `blueprintFieldPromptKind`. This slice must keep those compiler-driven semantics intact and only improve the operator-facing presentation and flow control around them.

The test surface is already blueprint-local. `packages/ship-by-sunday-cli/tests/cli-help.test.ts` covers top-level help and unknown commands. `packages/ship-by-sunday-cli/tests/stage-command.test.ts` proves `resume` and `stage` routing. `packages/ship-by-sunday-cli/tests/agent-workflows.test.ts` proves JSON-first and file-based automation workflows. These tests are the right foundation for regression coverage; the main missing piece is a testable abstraction around the prompt session itself.

The README is the only current human-facing CLI doc surface. The relevant section is `README.md` under “CLI Blueprint Intake”. It enumerates commands but does not describe a human-first startup story. Update that section only after the runtime contract is frozen.

The current shape is small enough to keep the refactor local. The relevant files today are:

    packages/ship-by-sunday-cli/src/
      cli.ts
      run-cli.ts
      parse-cli-command.ts
      theme/render-banner.ts
      theme/render-theme.ts
      prompts/prompt-stage.ts
      draft/draft-store.ts

The target structure after this slice should stay close to the current blueprint but separate human-facing concerns by feature:

    packages/ship-by-sunday-cli/src/
      cli.ts
      run-cli.ts
      command-catalog.ts
      help/
        render-help.ts
      startup/
        render-entry-surface.ts
        resolve-human-mode.ts
      prompts/
        prompt-stage.ts
        stage-prompt-session.ts
        readline-stage-session.ts
      theme/
        render-banner.ts
        render-theme.ts

These file names are prescriptive. The point is to separate command metadata, help rendering, startup routing, and prompt session logic so the CLI stays skimmable and testable. Do not add a menu module in this slice.

## Plan of Work

Start by freezing the CLI contract for human-facing startup and help before changing copy or rendering. That means naming exactly what `bun run sbs`, `bun run sbs --help`, `bun run sbs help <command>`, `<command> --help`, and `bun run sbs --version` do in both TTY and non-TTY contexts. The implementation should not guess at that behavior midway through the refactor. Write the contract into a central command catalog and make `runCli()` depend on it.

Once the contract is fixed, rebuild the startup surface and help surfaces around the catalog. The startup work should stay in the existing visual language but add the missing orientation: which repository this is, what the CLI does in one sentence, and the most useful first commands for a human. The no-arg TTY surface is static in this slice: no menu, no cursor movement, and no key handling beyond standard terminal output. At the same time, replace the hardcoded help dump with grouped help text driven by the catalog so top-level help and subcommand help cannot drift.

After startup and help are stable, refactor the stage prompt into a controller plus a terminal adapter. Keep the canonical field ordering, helper text, draft persistence, and blank-or-clear semantics, but change the clear token to `:clear` and add `:quit`. The operator should know which stage they are in, which step they are answering, how many steps remain, how to clear a field, how to keep the current value, and how to leave safely and resume later. Closed stdin and Ctrl+C should become explicit, recoverable behaviors rather than accidental runtime failures.

Finish by adding regression tests and small README updates that prove both modes still work: human TTY usage and machine-safe non-TTY or JSON usage. Keep the changes scoped to `packages/ship-by-sunday-cli/` and the relevant README section unless implementation reveals a real cross-blueprint requirement.

## Milestones

### Milestone 1: Freeze the startup and help contract

At the end of this milestone, the repository has one explicit description of what the human-facing CLI does for no-arg startup, top-level help, subcommand help, version output, and TTY versus non-TTY behavior. The implementation may still render old text, but the routing contract is fixed and encoded in code rather than scattered string literals.

Touch `packages/ship-by-sunday-cli/src/parse-cli-command.ts`, `packages/ship-by-sunday-cli/src/run-cli.ts`, and add `packages/ship-by-sunday-cli/src/command-catalog.ts`. Add only the smallest startup helpers needed to distinguish no-arg TTY startup from explicit help and version routing. Keep JSON command parsing intact and preserve the existing handler-facing command union.

Run `bun run sbs`, `bun run sbs --help`, `bun run sbs help review`, `bun run sbs review --help`, `bun run sbs stage --help`, `bun run sbs --version`, and `bun run sbs schema --json` from the repository root while this milestone is in progress. Success looks like the routing rules being deliberate and testable, even before the final copy and prompt polish are complete.

### Milestone 2: Ship the entry surface, sharper banner, and workflow-oriented help

At the end of this milestone, a human running `bun run sbs` in a terminal sees an intentional entry surface instead of a raw help dump. The entry surface includes the repository identity, a one-line explanation, and a short orientation story. Help is organized around recommended workflows such as start or resume, inspect state, edit facts, review or share state, and generate output. `bun run sbs --help`, `bun run sbs help review`, and `bun run sbs review --help` all return consistent help text without side effects. `bun run sbs --version` prints the one-line `Ship by Sunday CLI v<version>` trust surface.

Touch `packages/ship-by-sunday-cli/src/cli.ts`, `packages/ship-by-sunday-cli/src/run-cli.ts`, `packages/ship-by-sunday-cli/src/theme/render-banner.ts`, `packages/ship-by-sunday-cli/src/theme/render-theme.ts`, and add the help and startup renderer files named in the target structure. Expand `packages/ship-by-sunday-cli/tests/cli-help.test.ts` or split it into smaller focused test files if line count or clarity demands it. Move the banner write out of the unconditional top-level `cli.ts` path so only the no-arg TTY route can invoke it.

Run the help commands above plus `script -q /dev/null bun run sbs` from the repository root. Success looks like the TTY view feeling guided while the non-TTY view stays plain and script-friendly.

### Milestone 3: Rebuild the interactive stage prompt for orientation and safe exits

At the end of this milestone, `bun run sbs stage product` and `bun run sbs resume` present a clearer question flow. The prompt shows the stage label, the current step label, explicit progress such as step count, current value hints, and the available control commands. The session supports the documented control commands `:clear` and `:quit`. `:quit` preserves all answers that were already saved before the current field and exits `0` with a resume hint. Ctrl+C follows the same durability boundary. A non-interactive invocation of a prompt command fails fast with an actionable `invalid_state` error instead of hanging.

Touch `packages/ship-by-sunday-cli/src/prompts/prompt-stage.ts`, add `packages/ship-by-sunday-cli/src/prompts/stage-prompt-session.ts`, add `packages/ship-by-sunday-cli/src/prompts/readline-stage-session.ts`, and update `packages/ship-by-sunday-cli/src/commands/stage-command.ts` plus `packages/ship-by-sunday-cli/src/commands/resume-command.ts` as needed. Keep `packages/ship-by-sunday-cli/src/draft/draft-store.ts` unchanged unless a real persistence bug is discovered. The existing save-after-each-field behavior should remain the durability boundary.

Run `script -q /dev/null bun run sbs stage product` for the TTY proof and one non-TTY prompt proof such as `bun run sbs stage product < /dev/null`. Success looks like a human being able to understand the flow immediately and a script receiving a quick, actionable failure instead of a stalled process.

### Milestone 4: Lock the behavior with regression tests and README notes

At the end of this milestone, the blueprint test suite covers the new startup routing, help behavior, version output, prompt exit semantics, and automation guards. The README explains the human-first startup flow without obscuring the documented JSON-first command set for agents and scripts.

Touch `packages/ship-by-sunday-cli/tests/cli-help.test.ts`, add prompt-session tests under `packages/ship-by-sunday-cli/tests/`, update `packages/ship-by-sunday-cli/tests/stage-command.test.ts` as needed, and update the CLI section in `README.md`. Do not broaden documentation work beyond those surfaces in this slice.

Run blueprint-local `test`, `typecheck`, `lint`, and `format:check`, then rerun the manual TTY and non-TTY walkthroughs from the repository root. Success looks like a fresh operator being able to follow the README and verify both human and automation behavior without guessing.

## Concrete Steps

1. From the repository root, capture the current behavior before changing code. Run `bun run sbs`, `bun run sbs --help`, `bun run sbs help review`, `bun run sbs review --help`, `bun run sbs stage --help`, `bun run sbs --version`, and `bun run sbs schema --json`. Save the most important snippets in this plan’s `Artifacts and Notes` section as the baseline that the new UX must improve.

2. Before any manual prompt testing, protect existing local CLI state. From the repository root, run:

       if [ -f .ship-by-sunday/draft.json ]; then cp .ship-by-sunday/draft.json .ship-by-sunday/draft.json.cli-human-ux-backup; fi

   The expected observation is silence. After the manual walkthrough, restore the file with:

       if [ -f .ship-by-sunday/draft.json.cli-human-ux-backup ]; then mv .ship-by-sunday/draft.json.cli-human-ux-backup .ship-by-sunday/draft.json; fi

3. Add `packages/ship-by-sunday-cli/src/command-catalog.ts` and move command descriptions, usage strings, workflow groupings, help summaries, and the human-readable version label into it. Update `packages/ship-by-sunday-cli/src/run-cli.ts` so help rendering depends on the catalog, not a hardcoded array of strings. Update `packages/ship-by-sunday-cli/src/parse-cli-command.ts` so `help <command>` and `<command> --help` resolve to help mode without executing the command, and so `--version` resolves before any command side effect.

4. Add startup helpers under `packages/ship-by-sunday-cli/src/startup/` and update `packages/ship-by-sunday-cli/src/cli.ts` so only no-arg TTY usage can render the entry surface. Require both stdin and stdout to be TTY before taking the human entry path. Non-TTY no-arg behavior must print the plain grouped top-level help with no banner and no interactive affordance.

5. Replace the current unconditional banner prelude with a startup renderer that composes the banner plus the new entry surface. Show the resolved repository root basename, a muted path line, a one-line explanation of the CLI, and exactly three recommended next commands: `bun run sbs resume`, `bun run sbs next --json`, and `bun run sbs review --json`. Keep the existing color treatment, but do not add extra ornament. Add `--version` handling through the catalog and `runCli()` so a human can confirm which CLI build they are using.

6. Split `packages/ship-by-sunday-cli/src/prompts/prompt-stage.ts` into a pure session controller and a readline adapter. The controller should decide what question comes next, what progress label to show, how `:clear` and `:quit` work, and what exit message to print. The adapter should own only Node readline calls and signal handling. Preserve the current field order, helper text, and save-after-each-field persistence. Add a fast non-TTY guard before entering interactive mode, and treat EOF or closed readline before a completed answer as the same `invalid_state` path.

7. Add focused tests before final manual verification. At minimum, cover no-arg startup routing, top-level help, subcommand help, `--version`, help side-effect prevention, prompt progress text, `:quit`, Ctrl+C or explicit cancellation handling at the controller level, closed-stdin handling, and JSON cleanliness for commands that already support it. Then run:

       bun run --cwd packages/ship-by-sunday-cli test
       bun run --cwd packages/ship-by-sunday-cli typecheck
       bun run --cwd packages/ship-by-sunday-cli lint
       bun run --cwd packages/ship-by-sunday-cli format:check

   The expected observation is that all four commands exit successfully.

8. Finish with manual proof from the repository root. Use a real terminal for human checks, or `script -q /dev/null ...` when you need a pseudo-terminal capture:

       script -q /dev/null bun run sbs
       script -q /dev/null bun run sbs --help
       script -q /dev/null bun run sbs help review
       script -q /dev/null bun run sbs stage product
       bun run sbs stage product < /dev/null
       bun run sbs schema --json
       bun run sbs --version
       bun run sbs export --out - | cat

   The expected observations are: the first four commands show the human-facing UX with no accidental command execution; `bun run sbs stage product < /dev/null` fails quickly with actionable guidance; and the last three commands emit plain machine-readable or one-line trust output with no banner or prompt text mixed in.

## Validation and Acceptance

Acceptance is behavioral. A human must be able to run `bun run sbs` from the repository root in a real terminal and immediately understand what the CLI is, which repository it is operating against, and which command to run next. The no-arg startup surface is a static, banner-backed entry surface in this slice. It does not include an interactive menu.

Top-level and subcommand help must be trustworthy. `bun run sbs --help`, `bun run sbs help review`, `bun run sbs review --help`, and `bun run sbs stage --help` must all exit with help output and zero side effects. In particular, `review --help` must not render a live review payload, and `stage --help` must not fail as an invalid stage. Explicit help and `--version` must not print the large startup banner.

The interactive prompt must make orientation and exit paths explicit. A prompt command such as `bun run sbs stage product` must show the user where they are, what step they are on, how to keep or clear a value, and how to quit safely. Re-running `bun run sbs resume` after a quit or interrupt must return the operator to the first incomplete stage without data loss beyond the current unsaved answer. `:quit` and Ctrl+C are success-path exits with code `0`; non-TTY prompt attempts are `invalid_state` failures with exit code `2`.

Automation must remain safe. Commands that already support JSON must still emit clean JSON with no banner and no ANSI formatting. Non-TTY prompt invocations must fail quickly with actionable guidance instead of hanging. `bun run sbs export --out -` must remain safe to pipe. No-arg non-TTY usage must behave like plain help, not like an interactive startup.

Before the work is considered complete, all of the following must pass from the repository root:

    bun run --cwd packages/ship-by-sunday-cli test
    bun run --cwd packages/ship-by-sunday-cli typecheck
    bun run --cwd packages/ship-by-sunday-cli lint
    bun run --cwd packages/ship-by-sunday-cli format:check

Manual proof must also be recorded in this file. Capture at least one short TTY transcript for the no-arg surface and one short transcript proving subcommand help no longer executes the command.

## Idempotence and Recovery

The safest implementation strategy is additive. Introduce the command catalog and new help renderer before deleting the existing help strings. Introduce the prompt session controller alongside the existing prompt code before switching `stage` and `resume` over. This makes it easy to validate one seam at a time and revert a small change if needed.

The local draft file at `.ship-by-sunday/draft.json` is user state, not disposable test output. Always back it up before manual prompt walkthroughs and restore it after. Do not change its schema or path in this slice. If a prompt refactor accidentally writes bad local state, restore the backup and rerun the prompt test after fixing the controller.

Keep JSON and streaming behavior stable. If a help or startup change accidentally adds banner output to JSON or stdout-streaming commands, back out that routing change immediately and reintroduce it behind the same suppression rules currently enforced in `packages/ship-by-sunday-cli/src/cli.ts`.

If a manual prompt test is interrupted, recovery should be simple. Re-run `bun run sbs resume` after restoring any backup draft file if necessary. If Ctrl+C handling is being implemented at the time of the interruption, validate that the CLI either exits with a clear resume hint or keeps the old behavior until the signal path is complete. Do not leave a half-implemented signal or EOF path merged without tests.

## Artifacts and Notes

These are the post-implementation proof points gathered from live repository runs on 2026-03-31:

    $ script -q /dev/null bun run sbs
    Ship by Sunday CLI • local blueprint intake and blueprint generation
    Repository: ship-by-sunday
    Working root: /Users/parkerrex/Projects/ship-by-sunday
    Recommended next commands
      bun run sbs resume
      bun run sbs next --json
      bun run sbs review --json

    $ script -q /dev/null bun run sbs --help
    Ship by Sunday CLI
    ...
    Start or resume
      bun run sbs resume
      bun run sbs stage <product|design|marketing|build-plan>

    $ script -q /dev/null bun run sbs help review
    Ship by Sunday draft review
    Usage:
      bun run sbs review [--stage <stage>] [--missing-only] [--json]

    $ script -q /dev/null bun run sbs --version
    Ship by Sunday CLI v0.1.0

    $ bun run sbs stage product < /dev/null
    Interactive prompts require a real terminal. Re-run bun run sbs stage product in a TTY, or use bun run sbs set/import/mutate with --json for automation.

    $ bun run sbs stage product
    Product / Foundation • Step 1 of 4 • 4 fields
    > :quit
    Exited. Saved answers so far. Resume with bun run sbs resume.

    $ bun run sbs schema --json
    {
      "status": "ok",
      "command": "schema",
      "version": "0.1.0"
    }

    $ bun run sbs export --out - | cat
    {
      "clerkUserId": "local-cli-user",
      "productKey": "ship-by-sunday",
      ...
    }

## Interfaces and Dependencies

The execution path must continue to flow through `packages/ship-by-sunday-cli/src/cli.ts` into `packages/ship-by-sunday-cli/src/run-cli.ts`. Those two files are the routing boundary for banner suppression, TTY detection, and human versus machine mode decisions.

`packages/ship-by-sunday-cli/src/parse-cli-command.ts` remains the parser of record unless the command catalog completely subsumes it. Any refactor here must preserve the existing command kinds that other modules consume, especially `init`, `schema`, `stages`, `fields`, `next`, `validate`, `set`, `unset`, `append`, `remove`, `mutate`, `resume`, `stage`, `review`, `export`, `import`, `apply`, and `generate`.

The command catalog should be the human-facing metadata source, not a second parser. It must hold the workflow groups, one-line summaries, usage strings, example commands, JSON availability, and version label, while `parseCliCommand()` still produces the handler-facing command union. The catalog may add help-only entries such as `help` and `version`, but it must not silently redefine runtime command semantics.

The prompt flow depends on `node:readline/promises` today. That standard library module is acceptable for this slice and should be preferred. Do not bring in a new prompt dependency or menu framework for this work. If implementation uncovers a hard blocker inside readline, stop and update this plan before widening scope.

The canonical product and stage model lives in `@shipbysunday/blueprint-compiler`. The important dependencies are `deriveStageStatus`, `getBlueprintStageDefinition`, `buildStepDraftValues`, `getBlueprintStepLabel`, `blueprintFieldLabel`, `blueprintFieldHelperText`, `blueprintFieldPromptKind`, `normalizeProblemSeverityValue`, `normalizeProblemUrgencyValue`, and `resolveRepoRootPath`. This slice must not fork or duplicate stage metadata. Help grouping may describe workflows in human terms, but command behavior must still reflect the live compiler-backed stage contract.

Persistence depends on `packages/ship-by-sunday-cli/src/draft/draft-store.ts` and `packages/ship-by-sunday-cli/src/draft/draft-paths.ts`. Keep the draft directory `.ship-by-sunday/` and file name `draft.json` unchanged. The UX slice should change prompts, help, and trust signals, not storage internals.

Machine-readable output depends on `packages/ship-by-sunday-cli/src/cli-json.ts`, which already includes `version` in every JSON result. Human-readable version output should reuse the same blueprint version source. Error behavior depends on `packages/ship-by-sunday-cli/src/cli-errors.ts`; the prompt non-TTY guard and closed-stdin path should use `invalid_state` with exit code `2`, while `:quit` and Ctrl+C remain clean exit `0` paths that do not emit stack traces or unknown failures.
