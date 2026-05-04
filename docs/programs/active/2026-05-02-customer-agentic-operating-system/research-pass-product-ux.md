# Research Pass: Product And UX

## Question

How should the product promise and onboarding change if Ship by Sunday becomes the agentic engineering operating system for both new repos and mature existing codebases?

## Findings

The strongest current promise is already close to an operating-system frame. `DESIGN.md` calls Ship by Sunday a durable operating system for shipping. `apps/web/app/_content/home-page.ts` uses language around worker layers, exec loops, role packets, channel handoffs, and QA. `apps/web/content/blog/the-operating-system-beats-the-prompt.mdx` explains that the product turns product truth into agent-ready packs and a repo-shaped path.

The strongest buyer frame is worker-first. Customers do not wake up wanting "agentic engineering methodology"; they want workers that can reliably pick up product work, understand the codebase, produce proof, and keep moving without losing the thread. In this frame, an agent is a raw capability and a worker is the packaged operating unit: role, scope, repo instructions, source truth, ExecPlan, validation loop, review standard, and memory.

Programs and ExecPlans are therefore not separate products competing with workers. They are how Ship by Sunday makes workers real. ExecPlans are the unit of bounded execution, Programs are cross-slice initiative memory, and loops are the recurrence pattern that turns each completed pass into better source truth for the next pass.

The current product flow is still one-lane in practice. Customers buy, complete `/codebase`, reach `/review`, and download the generated repo. The generated repo opens at `START-HERE.md`, then guides core setup, auth setup, billing setup, verification, product identity changes, and first-slice work.

The mature-codebase lane is not yet a real product surface. Existing copy can imply it by talking about codebases, repo truth, worker layers, and operating systems, but there is no flow for connecting or auditing an existing repo, no adoption output contract, and no mature-repo-specific review proof.

The product should teach two lanes:

- New repo: product truth to generated repo to first agentic build loop.
- Existing repo: repo audit to adoption overlay to first safe agentic loop.

Top-of-funnel messaging should make both lanes legible without pretending both are equally implemented today:

- New codebase lane: codebase intake to generated repo to `START-HERE.md` to Build Pack readiness to first worker loop.
- Existing codebase lane: repo audit to source-truth map to adoption Program to first child ExecPlan to safe worker loop.

The new-codebase lane sells speed from idea to working repo. The existing-codebase lane sells leverage on a repo the customer already values. Both should ladder up to the same worker-layer promise, but they need different proof, onboarding, and risk language.

The current starter docs should not be treated as mature-repo docs. Pages such as `apps/web/content/docs/build-your-product.mdx`, `the-build-loop.mdx`, `parallel-agents.mdx`, and `prompting-patterns.mdx` are useful, but they assume the starter path. Product docs eventually need a two-lane top level.

There is still course-era language in some customer docs and review handoff surfaces. That language should be addressed in a later product/docs slice, not in the first compiler-owned source-contract slice.

## Recommended Direction

Use this product promise: Ship by Sunday turns product and repo truth into reliable engineering workers.

The operating loop should be explained as:

    product or repo truth -> worker role packet -> ExecPlan -> agent run -> review proof -> updated source truth -> next loop

For generated repos, Ship by Sunday installs the operating layer inside the repo.

For mature repos, Ship by Sunday installs an adoption overlay around the existing repo. The output should preserve the customer's architecture, package manager, CI, issue tracker, and release policy.

The homepage should eventually stop making customers infer whether their path is supported. It should expose a clear lane choice near the first product explanation: create a new worker-ready codebase, or bring an existing codebase under a worker operating layer. Pricing and checkout should stay honest about which lane is live, beta, or concierge.

## Watchpoints

Do not claim mature-repo transformation until the adoption lane exists. Do not imply the current generated-repo offer includes arbitrary existing-codebase ingestion. Do not make "operating system" mean full project management, deployment ownership, review automation, incident response, and multi-repo governance before those proof surfaces exist.

Do not let the worker framing collapse back into generic agent copy. A worker has a durable job, source truth, plan state, validation standards, and a loop. If those pieces are absent, the product should call it an agent run or an assisted pass, not a worker.
