---
title: Roadmap
summary: Product and platform priorities that should stay visible before new Program or ExecPlan work starts.
docType: roadmap
status: active
read_when:
  - Deciding what should happen after the Customer Agentic Operating System Program.
  - Planning managed GitHub, hosted execution, or recurring maintenance work.
---

# Roadmap

## Top Priority: Managed Execution Means SBS Compute

The next major CAOS decision is whether Ship by Sunday should become a hosted execution environment for customer repos. Actual managed GitHub execution is different from the privacy-first local runner: SBS-controlled compute would clone customer repositories, run probes or commands, create branches, apply patches, collect proof, and open PRs.

That unlocks the high-touch customer promise: "I do not want to set up or babysit a local runner; diagnose it and send me a reviewable PR." It also changes the risk profile. SBS would handle customer source code, logs, dependencies, test output, and possibly secrets depending on the approved scope. That requires sandboxing, customer isolation, retention policy, audit logs, access controls, revocation, queueing, retries, cost controls, and explicit customer consent.

The safe rollout should be staged:

1. Concierge GitHub PR mode: operator-triggered, tightly scoped GitHub App installation, selected repositories only, branch plus PR delivery, no production secrets, no deploys, no migrations.
2. Hosted read-only doctor pass: clone and inspect only, with static probes and structured findings before any hosted writes.
3. Hosted approved workflow runs: branch, patch, run approved proof commands, and open PRs for one approved finding at a time.
4. Managed maintenance and update channel: recurring upgrades, package/prompt/framework refreshes, migration PRs, proof, and rollback for customers who explicitly buy ongoing maintenance.

The current CAOS implementation intentionally stops before this line. Managed GitHub is consent and audit state only, the update channel is a contract only, and raw source or log sharing remains gated instead of automatic. Crossing this line should be a new Program or fresh CAOS continuation with explicit compute, security, storage, billing, and operator runbook design.

## CAOS Follow-On Questions

Before starting the next CAOS implementation slice, answer these:

- What is the first paid shape: concierge-only, self-serve premium, or internal beta?
- What compute substrate runs hosted repo work, and how is each customer isolated?
- What repository access model is acceptable: GitHub App selected repositories, fine-grained PAT, or customer-provided fork?
- What can hosted workers read, store, and retain by default?
- Which actions are always forbidden without a second approval: package installs, migrations, deploys, provider CLIs, CI reruns, branch pushes, PR opening, raw-source sharing, and secret access?
- What proof must every hosted run produce before a customer sees a PR?
- How do customers revoke access, delete stored artifacts, and audit every action?
- How does this become a priced product without making the local-runner lane feel obsolete?
