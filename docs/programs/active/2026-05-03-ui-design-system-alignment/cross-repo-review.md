---
title: 'UI Design System Alignment Cross Repo Review'
summary: 'Risk review for keeping UI design-system alignment scoped, verifiable, and compatible with repo contracts.'
docType: 'program_review'
status: 'active'
read_when:
  - 'Reviewing risks before implementing a UI design-system slice.'
  - 'Checking what must not be widened during visual cleanup.'
---

# UI Design System Alignment Cross Repo Review

The main risk is scope bleed. A color pass can easily turn into a typography, layout, component, and homepage redesign pass. Child ExecPlans must name their slice boundary and defer adjacent cleanup unless it is required to make the current slice work.

The second risk is confusing app UI with marketing expression. Root `DESIGN.md` intentionally allows a neutral app system plus warmer editorial brand expression. A child slice should normalize protected app UI and shared primitives first. It should not remove intentional homepage art colors, integration logo colors, or pack illustration colors merely because they are hard-coded.

The homepage custom editorial sections are a hard exclusion, not just a soft exception. Do not restyle the `Install leverage` / `the loop repeats TOMORROW` hero, the `Exec Loops: OpenAI's WEAPON of choice` section, or the worker/how-workers-work graphics and type treatments while executing this Program.

The third risk is token-source drift. The app token source is `apps/web/app/globals.css`, while docs also mention docs-specific `product-*` roles. A child slice should not add a third hidden palette. New roles must be documented in the design library or mapped to existing semantic tokens.

The fourth risk is dark-mode regression. The screenshots show dark mode as a first-class target, not an inverted afterthought. Every color or component primitive change must be judged in both `.dark` and default light mode.

The fifth risk is noisy diffs in a dirty worktree. Current local state includes unrelated app UI changes and assets. Implementers must inspect `git status --short`, avoid reverting unrelated work, and keep patches tightly scoped to the child ExecPlan.

The sixth risk is overfitting to the Codex app screenshots. The screenshots are a reference for compact, neutral, readable app UI. They are not a requirement to clone the Codex product or navigation model exactly.
