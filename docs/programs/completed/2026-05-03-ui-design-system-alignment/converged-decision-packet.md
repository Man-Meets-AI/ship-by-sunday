---
title: 'UI Design System Alignment Decision Packet'
summary: 'Final initiative decision for splitting UI consistency work into a Program and color-first ExecPlan.'
docType: 'program_decision'
status: 'active'
read_when:
  - 'Checking why this Program exists instead of one broad refactor.'
  - 'Deciding whether a UI cleanup belongs in color, typography, spacing, controls, or proof.'
---

# UI Design System Alignment Decision Packet

The initiative will run as a Program because it spans several bounded implementation slices. The durable objective is not one visual patch. The objective is to make Ship by Sunday app UI consistently use the same color roles, type roles, spacing rhythm, and control geometry across light and dark modes.

The first child ExecPlan is color token alignment. Color is the biggest first return because it is visible on every surface, it is centralized enough to change safely, and it establishes the semantic roles that later typography and spacing passes can use without fighting ad hoc class names.

The Program will not start by rewriting every component. Existing shadcn primitives are already close to the desired compact UI language. The first implementation should add or refine semantic color roles in `apps/web/app/globals.css`, migrate high-value app surfaces away from hard-coded neutrals where needed, and leave intentional marketing/editorial colors alone.

Marketing exceptions remain valid. The homepage leverage hero, codebase branch, integration logo colors, illustration pack colors, and Open Graph images can keep intentional brand colors when those colors are content or art. They should not become precedent for protected app shells, settings, codebase, checkout handoff, or review surfaces.

The Program must specifically ignore the custom homepage graphics, font treatments, and styles for `Install leverage` / `the loop repeats TOMORROW`, `Exec Loops: OpenAI's WEAPON of choice`, and worker/how-workers-work sections. Those sections are intentional editorial surfaces, not design-system drift to be normalized.

The Program will use docs and browser proof as quality gates. Every child ExecPlan must keep the design library and relevant docs accurate, run focused checks before broad gates, and verify representative light and dark UI visually before being called complete.
