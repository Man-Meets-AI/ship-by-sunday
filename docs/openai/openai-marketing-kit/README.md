# OpenAI Marketing Repo Kit

This folder turns official OpenAI guidance into a repo-ready operating system for marketing, growth, content, lifecycle, brand, performance, product marketing, and adjacent GTM work.

## What is in here

- `CHECKLIST.md` — a large source-backed inventory of documented OpenAI marketing use cases, capabilities, best practices, setup steps, governance checks, and rollout actions.
- `AGENTS.md` — a template for defining reusable GPTs, skills, agents, and workflow automations for marketing.
- `PLANS.md` — a template for planning, prioritizing, and rolling out marketing AI use cases and multi-step workflows.
- `documentation.md` — a template for documenting each shipped capability or use case in a consistent way.

## Scope

This kit uses **official OpenAI sources only** and focuses on:

1. Marketing-specific OpenAI documentation.
2. OpenAI feature documentation that enables marketing workflows.
3. GTM-adjacent OpenAI examples that marketing teams often need in the same repo (sales, inbound lead response, product Q&A, customer insights, internal research).
4. Operational and governance guidance needed to turn prompts into repeatable team systems.

This is a **practical best-effort inventory**, not a literal archive of every sentence on every OpenAI page. It is meant to be useful in a working repo.

## Recommended repo structure

```text
/openai-marketing/
  CHECKLIST.md
  AGENTS.md
  PLANS.md
  documentation.md
  /agents/
  /plans/
  /docs/
  /prompts/
  /knowledge/
  /evals/
```

## Suggested workflow

1. Start in `CHECKLIST.md` and mark the use cases and capabilities you want.
2. For any repeatable workflow, create an entry in `AGENTS.md` or split it into `/agents/*.md`.
3. Use `PLANS.md` to prioritize by impact vs effort and define rollout and evaluation.
4. For every production workflow, create a real implementation doc from `documentation.md`.

## Source policy

All references inside these files were compiled on 2026-03-23. Re-verify current product details, plan availability, and policy details before production rollout.
