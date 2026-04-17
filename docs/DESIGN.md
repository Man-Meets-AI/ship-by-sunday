---
title: 'Design'
summary: 'Cross-cutting visual and interaction doctrine for browser-facing surfaces in this repository.'
docType: 'guide'
status: 'active'
read_when:
  - 'You are making design or interaction decisions that should survive one feature branch.'
  - 'You need the repo-wide design doctrine before changing a user-facing surface.'
---

# Design

This file owns the cross-cutting visual and interaction doctrine for the repo. It should stay thinner than feature docs, but durable enough that design rules are not buried in chat history.

## Owns

- visual and interaction doctrine that should apply across more than one feature
- routing to durable design notes
- the distinction between design doctrine and frontend implementation rules

## Does Not Own

- component structure or code organization rules
- product prioritization or requirements
- one-off visual directions that are still specific to one thread

## Current Stance

- Prefer interfaces that feel intentional and legible over generic default scaffolds.
- Use motion to explain state change or hierarchy, not as decoration.
- Keep operator surfaces dense only when the density improves decision quality.
- Promote recurring design rules into durable docs instead of hiding them in reviews or chat.

## Next

- Use [docs/design-docs/index.md](/Users/parkerrex/Developer/worker/docs/design-docs/index.md) for the current catalog of durable design notes.
- Use [docs/FRONTEND.md](/Users/parkerrex/Developer/worker/docs/FRONTEND.md) for frontend implementation rules.
