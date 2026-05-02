# Research Pass: Product And UX

## Question

How should the product promise and onboarding change if Ship by Sunday becomes the agentic engineering operating system for both new repos and mature existing codebases?

## Findings

The strongest current promise is already close to an operating-system frame. `DESIGN.md` calls Ship by Sunday a durable operating system for shipping. `apps/web/app/_content/home-page.ts` uses language around worker layers, exec loops, role packets, channel handoffs, and QA. `apps/web/content/blog/the-operating-system-beats-the-prompt.mdx` explains that the product turns product truth into agent-ready packs and a repo-shaped path.

The current product flow is still one-lane in practice. Customers buy, complete `/blueprint`, reach `/review`, and download the generated repo. The generated repo opens at `START-HERE.md`, then guides core setup, auth setup, billing setup, verification, product identity changes, and first-slice work.

The mature-codebase lane is not yet a real product surface. Existing copy can imply it by talking about codebases, repo truth, worker layers, and operating systems, but there is no flow for connecting or auditing an existing repo, no adoption output contract, and no mature-repo-specific review proof.

The product should teach two lanes:

- New repo: product truth to generated repo to first agentic build loop.
- Existing repo: repo audit to adoption overlay to first safe agentic loop.

The current starter docs should not be treated as mature-repo docs. Pages such as `apps/web/content/docs/build-your-product.mdx`, `the-build-loop.mdx`, `parallel-agents.mdx`, and `prompting-patterns.mdx` are useful, but they assume the starter path. Product docs eventually need a two-lane top level.

There is still course-era language in some customer docs and review handoff surfaces. That language should be addressed in a later product/docs slice, not in the first compiler-owned source-contract slice.

## Recommended Direction

Use this product promise: Ship by Sunday turns product and repo truth into repeatable agent work.

The operating loop should be explained as:

    product truth -> worker role packet -> agent run -> review proof -> updated repo truth -> next loop

For generated repos, Ship by Sunday installs the operating layer inside the repo.

For mature repos, Ship by Sunday installs an adoption overlay around the existing repo. The output should preserve the customer's architecture, package manager, CI, issue tracker, and release policy.

## Watchpoints

Do not claim mature-repo transformation until the adoption lane exists. Do not imply the current generated-repo offer includes arbitrary existing-codebase ingestion. Do not make "operating system" mean full project management, deployment ownership, review automation, incident response, and multi-repo governance before those proof surfaces exist.
