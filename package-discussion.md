# Ship by Sunday Package Discussion

Notes from the discussion about evolving Ship by Sunday from a one-time generated SaaS starter into an upgradeable, paid, agent-native framework for AI-built software.

## Strategic Thesis

Ship by Sunday should become the upgrade channel for agent-built SaaS apps.

Not just a starter. Not just prompt packs. Not just a framework. The clearest product is:

> An agent-native SaaS framework that generates the first repo, then keeps that repo current through paid migrations, prompt packs, production patterns, and upgrade PRs.

The durable value is not "we scaffolded your app once." It is "your AI-built app does not rot."

## Strongest Product Framing

Position Ship by Sunday as Rails for agent-built SaaS, but with a different center of gravity:

- Rails owns conventions, generators, migrations, and runtime framework APIs.
- shadcn owns copyable components and registry updates.
- Ship by Sunday owns product codebase -> generated repo -> agent instructions -> production proof -> upgrade path.

The phrase to keep:

> Ship by Sunday is the agent-native SaaS framework and update channel for founders building software with AI.

## What Should Be Open Source

Open source:

- Core generated starter
- CLI shell: `sbs doctor`, `sbs update --check`
- Public migration format
- Basic docs and prompt conventions
- Example migrations
- Framework package interfaces

Paid:

- Update registry access
- Premium migrations: PostHog, Next.js upgrades, billing hardening, auth flows, production proof
- Prompt pack refreshes
- Agent instruction packs
- Generated upgrade PRs
- Hosted dashboard
- Private reference implementations
- Support and enterprise custom migrations

Recurring value comes from changes customers cannot track alone: framework churn, AI-agent best practices, SaaS infra patterns, analytics, observability, Stripe, Clerk, Convex, deployment changes, and better prompts.

## Customer Lifecycle

Week 1 pain:

- "How do I customize this without breaking it?"
- "Which files are generated, which are mine?"
- "How do I deploy, test, and prove checkout works?"
- Needs: `sbs doctor`, clean docs, agent-safe boundaries, first production proof.

Month 1 pain:

- "I changed the app and now I do not know if I am still aligned with the framework."
- "The prompts are stale."
- "I want analytics, better onboarding, better billing, better emails."
- Needs: module migrations, prompt refreshes, generated PRs, confidence reports.

Month 6 pain:

- "Next.js changed, packages changed, my app drifted, and my agents made weird edits."
- "I need observability, auditability, billing recovery, and upgrade guidance."
- Needs: compatibility checks, migration graph, rollback, framework releases, support.

Trust comes from Ship by Sunday behaving like a senior engineer: detect first, explain, patch narrowly, preserve edits, run proof, and write a report.

## Update System

The update system should behave more like a senior migration assistant than a template overwrite.

Command shape:

```bash
sbs doctor
sbs update --check
sbs update
sbs migrate posthog-observability
sbs migrate next-16-app-router
sbs prompts update
sbs report
```

It should handle:

- Framework package upgrades
- Repo file migrations
- Next.js, Convex, Stripe, Clerk, and PostHog changes
- Prompt pack updates
- `AGENTS.md`, Claude, and Gemini instruction updates
- Docs and runbook updates
- Generated code changes
- Customer-edited files
- Git conflicts
- Rollback
- Validation
- Release notes

Important rule: migrations do not overwrite customer files blindly. They classify every target:

```text
unchanged-managed: patch automatically
modified-managed: 3-way merge
unknown-file: create only if absent
customer-owned: suggest patch, require approval
conflict: write report and stop
```

Migration output should include:

- `sbs-update-report.md`
- changed files
- skipped files
- conflicts
- required env vars
- proof commands
- rollback commands
- agent-readable follow-up plan

## Technical Architecture

Add a customer repo manifest:

```json
{
  "schemaVersion": 1,
  "sbsVersion": "0.4.0",
  "projectId": "sbs_abc123",
  "modules": {
    "web": "next-app-router",
    "auth": "clerk",
    "backend": "convex",
    "payments": "stripe",
    "analytics": "none",
    "observability": "convex"
  },
  "installedMigrations": [
    "2026-05-03-codebase-review-download-v1"
  ],
  "managedFiles": {
    "AGENTS.md": "hash",
    "apps/web/config/product.ts": "hash"
  }
}
```

Possible repo/package structure:

```text
packages/sbs-cli/
packages/sbs-core/
packages/sbs-migrations/
packages/sbs-registry-client/
packages/sbs-codemods/

registry/
  index.json
  migrations/
    posthog-observability/
      recipe.json
      detect.ts
      plan.md
      codemod.ts
      files/
      validation.json
      rollback.md
      release-notes.md
```

Migration lifecycle:

```text
available -> detected -> planned -> applied -> validated -> committed
                         -> blocked -> manual-review
                         -> rolled-back
```

Example recipe contract:

```json
{
  "id": "posthog-observability",
  "from": { "observability": "convex" },
  "to": { "analytics": "posthog", "observability": "posthog" },
  "requires": ["next>=15", "convex>=1"],
  "touches": ["env", "middleware", "client", "server", "docs", "agents"],
  "validation": [
    "bun run lint",
    "bun run typecheck",
    "bun run --cwd apps/web test:unit -- tests/unit/observability*.test.ts"
  ]
}
```

Hosted flow later:

- Customer connects GitHub.
- Ship by Sunday scans the repo.
- Ship by Sunday opens a PR: "Upgrade to PostHog observability."
- The PR includes code, docs, prompt updates, a migration report, and a validation checklist.

## Business Model

Best model: open-source core plus paid update channel.

Pricing shape:

```text
Free OSS:
- core starter
- public CLI
- basic migrations
- docs

Pro: $29-$99/mo or $299-$999/yr
- private update registry
- premium migrations
- prompt pack updates
- production proof recipes
- generated upgrade PRs

Studio/Agency: $2k-$10k/yr
- multiple apps
- private framework packs
- priority support
- custom migrations

Enterprise:
- private registry
- internal framework licensing
- security review
- custom auth/billing/deploy patterns
```

Do not sell "more templates." Sell staying current.

## Competitive Advantage

Normal starters decay. Boilerplates are snapshots. shadcn gives components, not SaaS operations. Rails gives framework migrations, but not agent instructions or generated product context. Cursor and Codex prompt packs do not own runtime code. v0 generates UI, not durable production systems. Agencies deliver work, but not an upgradeable product substrate.

Ship by Sunday is defensible if it owns the full loop:

```text
Codebase -> repo -> agents -> production proof -> updates -> migration reports -> upgrade PRs
```

That loop is hard to copy because it combines product context, generated code, docs, prompts, SaaS infra, and release proof.

## Risks And Mitigations

Migration complexity:

- Mitigation: start with small, explicit migrations. No magical mega-updater.

Customer repo divergence:

- Mitigation: manifest hashes, 3-way merge, and managed/customer-owned file boundaries.

Support burden:

- Mitigation: `sbs doctor`, migration reports, paid tiers, and clear support scope.

Lock-in concerns:

- Mitigation: OSS core, plain Next.js/Convex/Stripe/PostHog, and readable migrations.

Open-source leakage:

- Mitigation: open CLI/spec/core; keep paid registry content and hosted PR service private.

Security and trust:

- Mitigation: signed registry, migration previews, no secret exfiltration, local-first mode.

Pricing resistance:

- Mitigation: show concrete paid updates: PostHog migration, Next.js upgrade, Stripe recovery hardening, and agent prompt refresh.

Framework maintenance cost:

- Mitigation: support fewer stacks. Do not support every auth, database, and deploy combination yet.

## Next-Day Roadmap

The immediate goal is not a perfect updater. It is establishing that Ship by Sunday repos are versioned, migratable, and connected to an update channel.

1. Create the concept.

- Add `docs/update-model.md`.
- Name the product: "Ship by Sunday Framework" or "SBS Update Channel."
- Define OSS vs paid.
- Define customer repo drift rules.

2. Add the manifest.

- Add `ship-by-sunday.json` to generated customer repos.
- Include `sbsVersion`, modules, installed migrations, and managed file hashes.

3. Stub the CLI contract.

- `sbs update --check`
- `sbs doctor`
- `sbs migrate <id> --plan`
- Even if implementation is thin, commands and output shape matter.

4. Create the first migration recipe.

- Use `posthog-observability`.
- Start as plan/report-only if needed.
- Detect current observability state.
- Print exact touched files, env vars, and test commands.

5. Update generated repo output.

- Ship `ship-by-sunday.json`.
- Ship update docs.
- Ship agent instructions explaining how future migrations work.

6. Write the paid registry story.

- Local public registry format.
- Private registry URL placeholder.
- Auth token model.
- Generated upgrade PRs as future hosted mode.

7. Add one customer-facing copy block.

- "Your repo keeps getting better."
- Explain updates, migrations, prompt packs, and production patterns.

## Short Version

Ship by Sunday is becoming the framework and update channel for agent-built SaaS.

The product promise should evolve from:

> Buy a generated SaaS starter.

To:

> Buy an agent-native SaaS framework that gives you the first repo and keeps it current as the stack, prompts, patterns, and production requirements change.
