# Build Pack Autonomy Normalized Pass

## Normalized Problem

The generated Build Pack is structurally complete but not yet reliable as an executable handoff for a fresh coding agent. It has a prompt, plans, implementation runbook, and documentation log, but it lacks a deterministic readiness manifest that states what can be run, what must be proven manually, what is blocked on customer input, and how confident the generated first slice is.

## Normalized Target

Every downloaded repo should contain a Build Pack that can be read without chat history. A fresh agent should be able to identify the first slice, stay inside scope, run accurate validation, document evidence, and know when to ask the customer instead of guessing.

## Normalized Slice Order

The first slice is the Build Pack Readiness Manifest because it creates the missing executable contract without changing the intake schema. Later slices can refine first-slice planning, command resolution, QA/review proof, weak-fact detection, clean-room replay, and regression snapshots.

## Normalized Boundaries

The first slice is compiler-only. It may change `packages/codebase-compiler/src/codebases`, add a readiness model under `packages/codebase-compiler/src`, update generated-doc path typing, and strengthen compiler tests. It must not change app runtime behavior, provider setup, Convex runtime, checkout, billing, generated mirrors, or required intake fields.

## Normalized Proof

The first slice is proved when `renderFullCodebaseTree()` includes `docs/build/docs/readiness.md`, the materialized repo snapshot includes the same customer-safe file, `agent-handoff.md` links to readiness before the copy-ready prompt, and tests cover complete plus reduced project definitions with typed validation entries and explicit customer-input work.
