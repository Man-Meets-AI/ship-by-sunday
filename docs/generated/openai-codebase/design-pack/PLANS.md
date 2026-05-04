# Canonical Design Plan

Use this file to plan meaningful frontend design work before broad UI changes.

## 1. Task framing

- **Surface type:** {{landing page | marketing page | app surface | dashboard | prototype | demo}}
- **Goal:** {{what outcome this screen or flow should create}}
- **User / audience:** {{who this is for}}
- **Job to be done:** {{what the user is trying to accomplish}}
- **Existing system or new surface:** {{preserve existing system | extend existing system | net new surface}}
- **Primary route / screen / component(s):** {{files or routes affected}}
- **References:** {{screenshots, Figma links, examples, mood board, none}}
- **Reasoning level:** {{low | medium | high}} and why
- **Definition of done:** {{what must be true before this is complete}}

## 2. Constraints

Fill in the constraints you are choosing for this task.

- **H1 rule:** {{one H1 or justified exception}}
- **Max major sections:** {{number}}
- **Typeface limit:** {{number and names if known}}
- **Accent color strategy:** {{single accent by default unless existing system says otherwise}}
- **Primary CTA above fold:** {{yes/no and what it is}}
- **Hard constraints from product or brand:**
  - {{constraint 1}}
  - {{constraint 2}}
  - {{constraint 3}}

## 3. Visual thesis

Write one sentence describing the intended mood, material, and energy.

> {{visual thesis}}

## 4. Content plan

Describe the narrative structure. For product UI, replace hero/support/detail/CTA with the equivalent operational structure.

| Section | Purpose | Headline / label | Supporting copy | Primary action | Dominant visual idea |
|---|---|---|---|---|---|
| 1 | {{hero / workspace / overview}} | {{...}} | {{...}} | {{...}} | {{...}} |
| 2 | {{support / detail / proof / workflow}} | {{...}} | {{...}} | {{...}} | {{...}} |
| 3 | {{detail / proof / secondary workflow}} | {{...}} | {{...}} | {{...}} | {{...}} |
| 4 | {{final CTA / next action / inspector / status}} | {{...}} | {{...}} | {{...}} | {{...}} |

## 5. Interaction thesis

List 2-3 motions or interaction ideas that materially improve the feel of the page.

1. {{interaction idea 1}}
2. {{interaction idea 2}}
3. {{interaction idea 3}}

## 6. Surface-specific rules

### If this is a landing or branded page

- **Brand signal:** {{how the brand/product becomes unmistakable in the first screen}}
- **Hero composition:** {{full-bleed, split, editorial, etc.}}
- **Hero budget:** {{headline / sentence / CTA group / image}}
- **Hero exclusions:** {{what will NOT appear above the fold}}

### If this is an app, dashboard, or workspace

- **Primary workspace:** {{main operating surface}}
- **Navigation model:** {{sidebar, top nav, tabs, etc.}}
- **Secondary context:** {{inspector, detail pane, filters, status, etc.}}
- **Utility-copy principle:** {{how headings and labels will stay operational}}
- **Card policy:** {{where cards are truly necessary, if anywhere}}

## 7. Design system plan

- **Tokens to use or define:**
  - `background`: {{...}}
  - `surface`: {{...}}
  - `primary text`: {{...}}
  - `muted text`: {{...}}
  - `accent`: {{...}}
  - `ring/border/elevation`: {{...}}
- **Typography roles:**
  - `display`: {{...}}
  - `headline`: {{...}}
  - `body`: {{...}}
  - `caption`: {{...}}
- **Layout system:** {{grid, gutters, max widths, breakpoints, density}}
- **Components to reuse:**
  - {{component 1}}
  - {{component 2}}
- **New components or tokens to add:**
  - {{component/token 1}}
  - {{component/token 2}}

## 8. Imagery plan

- **Imagery role:** {{narrative anchor | product proof | atmosphere | none}}
- **Source:** {{uploaded image | generated image | existing asset library | external approved reference}}
- **Key visual attributes:** {{style, palette, composition, mood}}
- **Text-safe area:** {{where text will sit relative to image}}
- **Failure modes to avoid:** {{signage clutter, weak anchor, collage, etc.}}

## 9. Copy plan

- **Tone:** {{clear, premium, editorial, operational, playful, etc.}}
- **Copy source:** {{real copy | supplied product context | tightly scoped placeholder}}
- **What the user should understand after scanning headings only:**
  - {{point 1}}
  - {{point 2}}
  - {{point 3}}
- **What will be aggressively removed:**
  - {{filler copy}}
  - {{redundant taglines}}
  - {{generic section repetition}}

## 10. Implementation plan

List the concrete implementation steps.

1. {{step 1}}
2. {{step 2}}
3. {{step 3}}
4. {{step 4}}

## 11. Verification plan

- **Desktop viewports to check:** {{sizes}}
- **Mobile viewports to check:** {{sizes}}
- **Validation tools available:** {{Playwright, screenshots, tests, build, lint, typecheck, none}}
- **Reference comparison method:** {{screenshot compare, Figma review, manual review, none}}
- **Checklist sections that must pass before merge:**
  - {{section 1}}
  - {{section 2}}
  - {{section 3}}

## 12. Acceptance criteria

- [ ] The result matches the chosen visual thesis.
- [ ] The result matches the chosen content plan.
- [ ] The result matches the chosen interaction thesis.
- [ ] Desktop and mobile both work.
- [ ] The screen can be understood quickly.
- [ ] The design system remains coherent.
- [ ] The implementation fits the repo's architecture.
- [ ] Known tradeoffs are documented.

## 13. Risks, unknowns, and follow-ups

- **Known risks:**
  - {{risk 1}}
  - {{risk 2}}
- **Open questions:**
  - {{question 1}}
  - {{question 2}}
- **Follow-up ideas intentionally deferred:**
  - {{follow-up 1}}
  - {{follow-up 2}}

## 14. Completion notes

Fill this in after implementation.

- **What changed:** {{summary}}
- **What deviated from plan and why:** {{summary}}
- **What still needs work:** {{summary}}
- **Documentation updated:** {{yes/no and path}}
