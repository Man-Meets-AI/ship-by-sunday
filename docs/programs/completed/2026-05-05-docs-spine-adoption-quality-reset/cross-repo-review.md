---
title: Docs Spine Quality Reset Cross Repo Review
summary: Risk review for rebuilding docs-spine adoption against Worker, Ship by Sunday, and Arena CRM.
docType: program_cross_repo_review
status: active
read_when:
  - Reviewing cross-repo risks before implementing docs-spine reset slices.
---

# Docs Spine Quality Reset Cross Repo Review

## Worker

Worker has the strongest docs-spine validator and quality-score precedent. The reset should borrow its concepts: first-class docs, required route links, root instruction routing, stale-path checks, Program and ExecPlan linting, and quality-score review semantics.

Risk: copying Worker-specific paths into customer repos would create false authority. The correct move is to encode the contract and adapt path names to the target repo.

## Ship by Sunday

Ship by Sunday has the local-runner workflows, generated operating-pack renderer, Program and ExecPlan prompt loop, and current customer-agentic setup contract. The reset should reuse those renderers and validators where possible instead of maintaining weak parallel templates.

Risk: Ship by Sunday-specific docs such as release proof, Convex, Stripe, Clerk, or Vercel rules can leak into repos where they do not apply. The scanner must make those conditional on evidence.

## Arena CRM

Arena is the pilot and should remain the primary acceptance fixture. It has a root `AGENTS.md` shim, `.codex/AGENTS.md` as canonical instructions, Bun/Turbo scripts, `bun run gate`, and repo-local skills. The v1 output failed because it did not understand those facts.

Risk: the native gate currently has environment/tooling blockers. The docs-spine proof should record those blockers precisely, but it should not hide docs quality failures behind them.

## Customer Repos

Customer repos will not share one stack. The reset must preserve package manager, commands, CI, docs structure, and instructions. It should install agentic operating contracts without pretending every repo is Ship by Sunday.

Risk: overfitting to Arena would produce a better pilot but a brittle product. Evals need fixture families, not only one repo.

## Conclusion

The cross-repo standard is adaptive parity: the installed docs must be as useful and validated as Worker/SBS docs, while remaining truthful to the target repo.
