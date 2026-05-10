---
title: "Standalone Telegram Chat Widget Normalized Architecture"
summary: "Normalized architecture for the owned standalone React package and host adapters."
docType: "normalized_pass"
status: "active"
read_when:
  - "Checking the intended package architecture before writing child ExecPlans."
  - "Resolving whether code belongs in the package, apps/web, or Convex."
---

# Standalone Telegram Chat Widget Normalized Architecture

The architecture is an owned React package with optional transports, not a backend component framework.

## Package Layers

Core layer:

- shared domain types
- message and thread state models
- attachment policy
- bug-report payload shape
- adapter result and error types

React layer:

- launcher and panel components
- message stream
- composer
- bug-report fields
- attachment chip
- accessible labels and keyboard behavior
- default styled experience

Adapter layer:

- fetch adapter for the current Ship by Sunday Next route bridge
- Convex adapter for direct realtime subscriptions and mutations
- future adapters only when a real host needs them

Testing layer:

- fixtures and render helpers for package tests and host integration tests

## Host Responsibilities

The host app owns:

- placement on homepage, workspace, or any other page
- auth provider wiring
- Convex provider wiring
- generated Convex API references
- fallback URLs
- analytics implementation
- PostHog masking configuration
- provider env setup
- Telegram bot setup
- docs and runbook links

## Backend Responsibilities

The existing Convex support backend remains the first backend runtime. It owns persistence, Telegram delivery, webhook handling, operator allowlists, retention, abuse controls, operations snapshots, and AI draft behavior.

Backend helper extraction is not part of the first slice. If later slices prove the backend helper surface should be reusable, it should be added deliberately after the frontend package and Ship by Sunday consumer migration are stable.

## Migration Strategy

First migrate shape, then behavior:

1. Create the package contract and scaffold.
2. Move UI and state orchestration into the package while preserving the current fetch bridge.
3. Make `apps/web` consume the package.
4. Add the Convex realtime adapter.
5. Decide whether anonymous direct Convex access uses a scoped browser-visible conversation capability or keeps a host bridge.
6. Move screenshot and bug-report handling fully behind adapter-safe contracts.

This keeps the package extraction reversible and testable at each step.
