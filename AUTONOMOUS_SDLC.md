# Autonomous SDLC Vision
- [ ] Look at the Cursor SDLC video to infer different roles and how this plays out.
   - [ ] EM role
   - [ ] PM role
   - [ ] Bug bot role

This note describes the target operating model for turning the current manual Program and ExecPlan workflow into a programmatic software delivery loop.

## Level 1: Automate The Current Pain

This is the first automation target.

The human still owns the high-judgment parts:

- notice the problem
- think through the value
- decide the work matters
- approve the Program
- say `begin`

Then the system handles the repetitive execution loop:

- pick the next ExecPlan
- execute it
- prove it
- generate a fresh review prompt from live context
- run a fresh review pass
- fix real findings
- re-run proof
- sync docs
- checkpoint state
- continue to the next ExecPlan

This removes the babysitting without changing the creative process.

## Shell Control Plane

The zsh layer should be the operator cockpit for the same loop, not a second
automation system. Shell commands are valuable when they expose state, create
handoff context, checkpoint completed work, or invoke the same runner phases a
human would otherwise paste between Codex sessions.

The stack should stay simple:

1. zsh commands provide short human-facing verbs.
2. The local runner owns the state machine, receipts, proof policy, review
   policy, retry caps, and docs sync.
3. `codex exec` provides fresh execution, review, repair, and summarization
   contexts.
4. Program and ExecPlan docs remain durable truth.
5. Ignored local run artifacts keep raw prompts, logs, review JSON, proof
   captures, and handoff prompts inspectable without turning them into product
   docs.

| Command idea | Human moment | SDLC phase | Runner relationship | Boundary |
| --- | --- | --- | --- | --- |
| `yeet` | Finished a coherent local slice and wants a clean checkpoint | Checkpoint after proof/review | Can stay a manual convenience, or later call the runner's checkpoint summary | Must not replace proof or review; should fail fast on missing git identity, no staged changes, or no branch |
| `wip` | Wants to know "where am I and what matters next?" | State tracking and next action | Read-only view over git status, active Program docs, current ExecPlan, and latest `.sbs/program-runs` state | Must not mutate; should surface blockers and unproven changes plainly |
| `programs` | Wants a dashboard of active delivery work | Program selection and Future UX | CLI version of Programs by state: ready, running, blocked, in review, ready to ship, complete | Should summarize, not decide hidden priorities |
| `nextplan` | Has an approved Program or rough goal and needs the next concrete slice | Level 2 planning assistant | Should read the Program packet/current planning brief and produce an ExecPlan or one-question planning prompt | Should ask only non-discoverable questions and keep Parker's customer/agent/developer rubric first-class |
| `prove` | Wants local confidence before review, checkpoint, or handoff | Proof and reproof | Should delegate to repo proof contracts, ExecPlan test commands, and package scripts | Must not invent generic tests when the repo already states the proof path |
| `reviewme` | Wants a fresh reviewer without manually building the prompt | Fresh review prompt and review | Should share prompt/schema contracts with `program:run-slice`'s `write_review_prompt` and `review` phases | Should review live git state, proof output, Program context, and exact risks, not chat memory |
| `fixreview` | Has structured findings and wants the real issues fixed | Fix findings and reproof | Manual entry point for the runner's repair phase | Should consume structured findings, cap attempts, and block instead of looping forever |
| `handoff` | Context is risky, work is blocked, or a fresh session should continue | Checkpoint, blocked state, resume | Should produce the same durable handoff context the runner writes under local run artifacts | Should include facts, files, proof, findings, blockers, and next action without raw secret-bearing logs |
| `reviewhead` | Wants branch-level confidence before PR, push, or ship | Final review / PR review | Fresh Codex review of HEAD or current branch against base using the Program review rubric | Should complement, not bypass, the per-slice review/fix/proof loop |

This gives the autonomous loop a friendly command surface without hiding the
actual state machine in shell functions. If a zsh command starts needing
receipts, retries, structured findings, or docs updates, that behavior belongs
in the runner and the shell command should become a thin wrapper.

## Level 2: Programmatic Planning Assistant

The next layer automates the prep work around human judgment.

The user can say something rough, such as:

```txt
I think we need to improve onboarding for generated repos.
Trace the journey and tell me whether this is a Program or ExecPlan.
```

The system responds by:

- tracing the current user journey
- inspecting the codebase and docs
- identifying customer, coding-agent, and developer pain
- recommending Program versus ExecPlan
- drafting the decision tree
- asking one question at a time
- answering discoverable questions by exploring the repo instead of asking
- updating docs as answers converge
- producing the Program packet or ExecPlan

The human still makes the core calls. The system becomes much better at setting up the board.

This formalizes the current grill-session prompt:

```txt
Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time.

If a question can be answered by exploring the codebase, explore the codebase instead.
```

It also formalizes the quality rubric:

```txt
Whatever makes the most sense for:
1. the best customer experience
2. the best coding-agent experience
3. the best developer experience
```

## Level 3: Full Product SDLC Loop

The future system becomes a real product-development operating system.

The full loop looks like this:

1. Problem intake
2. Customer journey trace
3. "Oh shit this was easy, awesome, or valuable" moment definition
4. Affordance breadboard
5. Design or moodboard pass
6. Program or ExecPlan decision
7. Relentless interview
8. Plan synthesis
9. Execution loop
10. Review, fix, and proof loop
11. Browser polish
12. Taxonomy and content pass
13. Release proof
14. Usage instrumentation
15. Post-ship monitoring
16. Retrospective

At that point, a Program is not just plans and docs. It is the durable state object for the whole SDLC.

## Future UX

The dashboard could show Programs by state:

```txt
Needs decision
Ready to execute
Running
Blocked
In review
Needs polish
Ready to ship
Monitoring
Complete
```

Each Program could expose:

- customer promise
- target "oh shit" moment
- current slice
- last proof
- last review
- open decisions
- browser screenshots
- usage metric
- release status
- next recommended action

The interaction could feel like this:

```txt
Start discovery on generated repo onboarding.
```

The system traces the repo, writes a journey map, finds gaps, and asks the first important question.

Then:

```txt
Promote this to a Program.
```

It creates the Program packet.

Then:

```txt
Begin.
```

It runs the ExecPlan loop.

Then after shipping:

```txt
Watch this feature for one week.
```

It checks events, errors, support messages, and product usage. It reports whether anyone touched the new thing, where they got stuck, and whether the feature is producing the intended behavior.

## Automation Boundary

Do not automate taste too early.

The system should automate:

- research
- state tracking
- question ordering
- artifact generation
- proof
- review
- fix loops
- browser checks
- taxonomy checks
- instrumentation checks
- handoffs

The human should keep control over:

- what matters
- what feels valuable
- what the customer promise is
- what tradeoffs are acceptable
- whether the thing is actually good

The near-term win is not replacing product judgment. The near-term win is removing the clipboard work between agents.
