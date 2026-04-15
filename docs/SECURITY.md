---
title: 'Security'
summary: 'Repo-wide secret, approval, and trust-boundary guidance for coding-agent work in this workspace.'
docType: 'guide'
status: 'active'
read_when:
  - 'A task touches secrets, approvals, connectors, or external tools.'
  - 'You need the repo-wide trust boundaries before running risky commands.'
---

# Security

This file owns the repo-wide security and safety expectations for working in the repository.

## Owns

- secret-handling rules for repo work
- approval and trust-boundary guidance for tools, connectors, and local state
- the high-level distinction between tracked docs, local runtime state, and local tooling surfaces

## Does Not Own

- provider-specific auth details that belong in runtime code or workflow docs
- deployment-machine policy that belongs in runtime operations docs
- live secret material or machine-local config

## Working Rules

- Never commit secrets, tokens, or copied local environment files.
- Treat `.runtime/assistant/` as local state, not a docs surface or a safe place to infer policy from.
- Treat `.codex/` as non-canonical local tooling/config state. Do not move durable repo truth there.
- Prefer the least-privileged command or tool path that can prove the change.
- When a task depends on a connector or approval policy, say exactly which boundary you relied on and what you could not verify locally.

## Next

- Use [AGENTS.md](/Users/parkerrex/Developer/worker/AGENTS.md) for the root execution contract.
- Use [apps/runtime/README.md](/Users/parkerrex/Developer/worker/apps/runtime/README.md) for the closest runtime-owned operations surface.
