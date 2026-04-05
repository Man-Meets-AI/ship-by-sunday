# Ship by Sunday Design Documentation

Use this template for each shipped design task, UI workflow, or meaningful surface update. The goal is to make every implementation understandable, reviewable, and reusable.

## Required frontmatter

```md
---
doc_id:
title:
owner:
team:
surface_type:
status: draft / active / paused / retired
created:
last_reviewed:
review_cadence:
related_plan:
related_files: []
tags: []
---
```

## 1. Summary

What changed, for whom, and why it matters.

## 2. Problem and goal

- **Problem:** {{what was weak, unclear, or missing before}}
- **Goal:** {{what the new design is supposed to achieve}}
- **Audience / user:** {{who this serves}}
- **Surface type:** {{landing page | marketing page | app | dashboard | prototype | demo}}

## 3. Final outcome

Describe the result in user-facing terms.

- {{outcome 1}}
- {{outcome 2}}
- {{outcome 3}}

## 4. Design direction

- **Visual thesis:** {{final visual thesis}}
- **Content plan:** {{final narrative or operational structure}}
- **Interaction thesis:** {{motions or interaction ideas that shipped}}

## 5. Scope of work

### Routes / screens / components changed

- {{route or file 1}}
- {{route or file 2}}
- {{route or file 3}}

### Out of scope

- {{out-of-scope item 1}}
- {{out-of-scope item 2}}

## 6. Design-system decisions

### Tokens added or changed

- {{token change 1}}
- {{token change 2}}
- {{token change 3}}

### Typography decisions

- {{typography decision 1}}
- {{typography decision 2}}

### Layout and composition decisions

- {{layout decision 1}}
- {{layout decision 2}}
- {{layout decision 3}}

### Component reuse vs new work

- **Reused:** {{existing components or patterns reused}}
- **New:** {{new components, variants, or abstractions added}}
- **Why:** {{why new work was needed}}

## 7. Imagery and content decisions

- **Imagery source:** {{uploaded | generated | existing library | none}}
- **Why this imagery works:** {{summary}}
- **Copy strategy:** {{how copy was structured and why}}
- **What was removed:** {{filler copy, extra chrome, weak sections, etc.}}

## 8. Motion and interaction

List the meaningful motion or interaction work that shipped.

1. {{motion or interaction 1}}
2. {{motion or interaction 2}}
3. {{motion or interaction 3}}

## 9. Responsive behavior

- **Desktop checks:** {{what was verified}}
- **Mobile checks:** {{what was verified}}
- **Layout safety notes:** {{sticky headers, overlays, text-safe areas, tap targets, etc.}}

## 10. Verification

- **Manual review:** {{what was checked manually}}
- **Automated checks:** {{lint, tests, typecheck, build, Playwright, screenshot compare, etc.}}
- **Reference comparison:** {{Figma, screenshot, existing product patterns, none}}
- **Checklist status:** {{which sections of CHECKLIST.md were most relevant and whether they passed}}
- **Blueprint-first status:** {{what blueprint, funnel, or homepage invariants were preserved}}

## 11. Tradeoffs and deviations

Document intentional compromises.

- {{tradeoff 1}}
- {{tradeoff 2}}
- {{tradeoff 3}}

## 12. Known issues

- {{issue 1}}
- {{issue 2}}

## 13. Follow-ups

- {{follow-up 1}}
- {{follow-up 2}}
- {{follow-up 3}}

## 14. Screenshots and references

- **Before:** {{path or link}}
- **After:** {{path or link}}
- **Plan used:** {{path to task plan}}
- **Additional references:** {{links, notes, design files}}

## 15. Maintenance

- **Update owner:** {{who refreshes this doc}}
- **How stable knowledge is refreshed:** {{process}}
- **How often examples are re-baselined:** {{cadence}}
- **Sunset criteria:** {{when this doc should be retired or replaced}}

## 16. Source guidance

This work was guided by:

- `docs/openai/design-pack/AGENTS.md`
- `docs/openai/design-pack/CHECKLIST.md`
- `docs/ship-by-sunday/design-pack/AGENTS.md`
- `docs/ship-by-sunday/design-pack/CHECKLIST.md`
- `docs/ship-by-sunday/design-pack/PLANS.md`
- the task-specific plan derived from `docs/ship-by-sunday/design-pack/PLANS.md`

If helpful, also record the external official references used for the work:

- {{official reference 1}}
- {{official reference 2}}
- {{official reference 3}}
