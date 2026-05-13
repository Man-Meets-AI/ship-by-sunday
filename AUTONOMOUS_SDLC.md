# Autonomous SDLC Vision

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
