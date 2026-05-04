---
title: Product Language Normalized Pass
summary: Canonical vocabulary rules for current codebase language.
docType: program_normalized_pass
status: active
read_when:
  - Updating public copy, docs, review/download text, generated output labels, or readiness lint.
---

# Product Language Normalized Pass

The canonical noun is `codebase`.

## Public Vocabulary

Use `agent-ready codebase` as the primary public phrase.

Use `codebase` when the page already has enough context.

Use `generated codebase` when distinguishing a freshly spun-up repo from an existing customer repo.

Use `downloadable codebase` for the artifact when the text needs to name what Review & Download produces.

Use `spin up a codebase`, `create the codebase`, `generate the codebase`, or `prepare the codebase` for actions.

## Internal Vocabulary

Use `codebase` for files, folders, functions, components, packages, and tests that own the generated repo or agent-ready codebase experience.

Use `project facts`, `project definition`, or `product contract` for structured inputs. Do not use `codebase` when the value is only the input model.

Use `codebase generator` for the system that creates the downloaded repo.

Use `Codebase*` for TypeScript exports and React components where PascalCase is required.

## Avoided Vocabulary

Avoid product metaphors such as `scaffold`, `foundation`, `kit`, `recipe`, or `workspace` as the canonical noun.

Avoid `agent-ready packs` as the primary noun. It can describe contents, but it is not the thing the buyer gets.

Avoid preserving an older noun in current docs, Program packets, public copy, package docs, generated customer docs, or lint rules.

## Allowed Exceptions

Original transcripts, archived release evidence, and completed planning records may retain immutable wording when rewriting it would falsify provenance.

Route literals such as `/codebase` may appear in docs while the route exists, and surrounding nouns should still use `codebase`.
