# Design Checklist

This checklist turns OpenAI's documented Codex and GPT-5.4 frontend design guidance into a repo-ready workflow.

Use this file together with:
- `design-checklist/AGENTS.md`
- `design-checklist/PLANS.md`
- `design-checklist/documentation.md`

## How to use this checklist

1. Start every meaningful UI task with a copy of `PLANS.md`.
2. Mark only the sections that apply to the surface you are building.
3. Treat existing product and design-system patterns as higher priority than generic defaults.
4. Do not call work done until desktop and mobile have both been verified.
5. Record major design decisions and follow-ups in `documentation.md`.

---

## 0. Task framing

- [ ] I identified the surface type: landing page, marketing page, app surface, dashboard, prototype, demo, or game UI.
- [ ] I wrote the task in terms of goal, context, constraints, and done-when.
- [ ] I chose a reasoning level intentionally; default is low or medium for simpler frontend tasks.
- [ ] I identified whether I am preserving an existing design system or creating/extending one.
- [ ] I collected the key repo files, components, tokens, and routes relevant to the task.
- [ ] I gathered real content, product context, or a concrete project goal.
- [ ] I attached screenshots, references, or a mood board when visual safeguards matter.
- [ ] I noted whether Playwright, screenshots, Figma, or other verification tools are available.

---

## 1. Design principles before coding

- [ ] I wrote a **visual thesis**: one sentence describing mood, material, and energy.
- [ ] I wrote a **content plan**: hero, support, detail, and final CTA or the equivalent product narrative.
- [ ] I wrote an **interaction thesis**: 2-3 motions or interaction ideas that materially improve the experience.
- [ ] I defined high-level constraints up front.
- [ ] I limited the page to one H1 unless there is a strong reason not to.
- [ ] I limited the experience to no more than six major sections unless the product truly requires more.
- [ ] I limited the design to two typefaces max unless the existing system already supports more.
- [ ] I defaulted to one accent color unless the product already has a mature multi-accent system.
- [ ] I chose one primary CTA above the fold when the surface is promotional or conversion-oriented.
- [ ] I started with composition, not components.
- [ ] I treated the first viewport like a poster, not a document.

---

## 2. Design system and tokens

- [ ] I defined or confirmed core tokens: `background`, `surface`, `primary text`, `muted text`, `accent`, and any needed `ring`, `border`, or elevation tokens.
- [ ] I defined or confirmed typography roles: `display`, `headline`, `body`, `caption`, and any product-specific variants.
- [ ] I decided whether the layout is full-bleed, constrained, split, editorial, workspace-first, or another named composition pattern.
- [ ] I used tokens first instead of hard-coded ad hoc colors.
- [ ] I used existing design-system components where they already solve the problem well.
- [ ] I only created new components or tokens when reuse would clearly weaken the result.
- [ ] I preserved the existing repo's patterns, structure, and visual language when working inside an established product.
- [ ] I used React + Tailwind as the default stack when the stack was otherwise open-ended.
- [ ] I followed the repo's React guidance instead of adding performance hooks by habit.
- [ ] I avoided `useMemo` and `useCallback` by default unless the repo already relies on them or a measured issue requires them.

---

## 3. Landing page and branded surface rules

Only apply this section when the task is a branded or promotional surface.

- [ ] The first viewport reads as **one composition**, not a dashboard.
- [ ] The brand or product name is a hero-level signal, not just nav text or an eyebrow.
- [ ] No headline overpowers the brand.
- [ ] The page passes the **brand test**: if I remove the nav, the first screen still feels specific to this product or brand.
- [ ] I defaulted to a full-bleed hero or dominant edge-to-edge visual plane.
- [ ] I avoided inset hero images, side-panel hero images, rounded media cards, tiled collages, and floating image blocks unless the existing system requires them.
- [ ] I kept the first-screen budget tight: brand, one headline, one short supporting sentence, one CTA group, and one dominant image.
- [ ] I did **not** put stats, schedules, metadata rows, address blocks, promos, or secondary marketing content in the first viewport by default.
- [ ] I did **not** place detached badges, floating labels, promo stickers, info chips, or callout boxes on top of hero media.
- [ ] I kept the headline to roughly 2-3 lines on desktop and readable in one glance on mobile.
- [ ] I kept the text column narrow and anchored to a calm area of the image.
- [ ] All text over imagery maintains strong contrast and clear tap targets.
- [ ] If a sticky or fixed header exists, I counted it against the hero budget.
- [ ] If I used `100vh` or `100svh`, I accounted for persistent header or app chrome.

---

## 4. App, dashboard, and workspace rules

Only apply this section when the task is product UI rather than a promotional surface.

- [ ] I defaulted to calm hierarchy, strong typography, sparse color use, and minimal chrome.
- [ ] The UI is organized around a primary workspace, navigation, secondary context or inspector, and one clear accent for action or state.
- [ ] I used utility copy rather than marketing copy.
- [ ] I started with the working surface itself: KPIs, charts, filters, tables, task context, status, or decision support.
- [ ] I did **not** introduce a hero section unless it was explicitly requested.
- [ ] Section headings say what the user can see, monitor, or do.
- [ ] Supporting text explains scope, behavior, freshness, or decision value in one short sentence.
- [ ] I avoided dashboard-card mosaics, thick borders on every region, decorative gradients behind routine product UI, and ornamental icons.
- [ ] If a panel could become plain layout without losing meaning, I removed the card treatment.
- [ ] If a section does not help someone operate, monitor, or decide, I removed it.
- [ ] If an operator scanned only headings, labels, numbers, and actions, the page would still make sense.

---

## 5. Cards, chrome, and visual restraint

- [ ] I defaulted to **no cards**.
- [ ] I used cards only when they are the container for a user interaction or materially improve understanding.
- [ ] If removing border, shadow, radius, or background did not hurt the design, I removed that chrome.
- [ ] I used spacing, typography, alignment, contrast, scale, and cropping before adding decorative chrome.
- [ ] I avoided pill clusters, stat strips, icon rows, boxed promos, and multiple competing micro-elements unless they were essential.
- [ ] I kept each section focused on one dominant idea.
- [ ] No section depends on many tiny UI devices to explain itself.

---

## 6. Imagery and visual anchors

- [ ] I created or gathered a mood board or several visual options before locking final direction when imagery matters.
- [ ] I explicitly described the qualities I wanted the imagery to capture: style, color palette, composition, and mood.
- [ ] I defaulted to uploaded or pre-generated images first.
- [ ] Otherwise, I used image generation rather than random web images unless external images were explicitly requested.
- [ ] I used at least one strong, real-looking image for brands, venues, editorial pages, or lifestyle products when imagery carries the story.
- [ ] I preferred in-situ photography over abstract gradients or fake 3D objects when a real scene better supports the narrative.
- [ ] I chose or cropped images so text sits on a stable tonal area.
- [ ] I avoided imagery with signage, embedded logos, or typographic clutter that fights the UI.
- [ ] I did not use images with built-in UI frames, splits, cards, or panels.
- [ ] If I needed multiple moments, I used multiple images instead of one collage.
- [ ] The first viewport has a real visual anchor; decorative texture alone does not count.

---

## 7. Copy and section structure

- [ ] Every section has one job: explain, prove, deepen, or convert.
- [ ] Every section has one headline and usually one short supporting sentence.
- [ ] I wrote in product language, not design commentary.
- [ ] The headline carries the meaning.
- [ ] Supporting copy is short enough to scan in seconds.
- [ ] I used real content or believable task-specific placeholder copy instead of generic filler.
- [ ] I cut repetition between sections aggressively.
- [ ] I removed any sentence that sounded like prompt language rather than UI copy.
- [ ] If deleting 30% of the copy improved the page, I kept deleting.
- [ ] For marketing pages, the sequence follows a narrative rather than a pile of features.

---

## 8. Typography, color, and atmosphere

- [ ] I used expressive, purposeful typography rather than default-safe stacks when the task required a distinctive branded surface.
- [ ] I chose a clear visual direction.
- [ ] I avoided generic purple-on-white and generic dark-mode bias unless the product already lives there.
- [ ] I used gradients, images, texture, or subtle patterning to create atmosphere when appropriate.
- [ ] I did not rely on a flat single-color background when the design called for a strong emotional impression.
- [ ] I kept the palette disciplined.
- [ ] I used color to guide hierarchy and action rather than to decorate every region.

---

## 9. Motion and layered interactions

- [ ] Motion improves presence and hierarchy rather than adding noise.
- [ ] For visually led work, I shipped at least 2-3 intentional motions.
- [ ] I included one entrance sequence or first-impression motion where appropriate.
- [ ] I included one scroll-linked, sticky, depth, or progression effect where appropriate.
- [ ] I included one hover, reveal, or layout transition that sharpens affordance where appropriate.
- [ ] Motion is noticeable in a quick recording, but still restrained.
- [ ] Motion is smooth on mobile.
- [ ] Motion is consistent across the page.
- [ ] I removed ornamental-only motion.
- [ ] Fixed, floating, or decorative layers do not overlap text, buttons, or key content across breakpoints.

---

## 10. Responsiveness and layout safety

- [ ] The layout loads and reads correctly on both desktop and mobile.
- [ ] Primary actions remain visible and tappable on small screens.
- [ ] Hero or primary workspace content fits common viewport sizes without accidental clipping.
- [ ] Fixed or floating elements sit in safe areas across breakpoints.
- [ ] Text does not collide with decorative layers or media.
- [ ] The design remains coherent if the viewport gets shorter, narrower, or denser than expected.
- [ ] I checked at least one desktop size and one mobile size with the real rendered UI.

---

## 11. Codex workflow and verification

- [ ] I updated or created a task plan using `design-checklist/PLANS.md` before making broad UI changes.
- [ ] I told Codex what good looks like in terms of goal, context, constraints, and done-when.
- [ ] I included relevant files, errors, screenshots, or other inputs needed for the task.
- [ ] I broke large changes into reviewable steps when the task was broad or ambiguous.
- [ ] I used Playwright or an equivalent tool to inspect rendered UI when available.
- [ ] I verified multiple viewports when the task changed layout or interaction.
- [ ] I used screenshots or visual comparison when matching an existing reference.
- [ ] I ran lint, typecheck, tests, or other repo-standard validation before finalizing.
- [ ] I reviewed the final diff for visual and structural quality rather than only functional correctness.
- [ ] I updated project documentation after completing the work.

---

## 12. Figma and external design workflows

Apply this section only when the task includes Figma or another external design tool.

- [ ] I used the exact frame or selection context instead of vaguely describing the design.
- [ ] I reused existing design-system components whenever possible.
- [ ] I extracted layout, style, and component information from the design source rather than recreating it from memory.
- [ ] After coding, I compared the running UI against the design source.
- [ ] If needed, I round-tripped refined code output back into editable design artifacts.
- [ ] I documented any intentional deviations from the source design.

---

## 13. Reject these failures

- [ ] I rejected the generic SaaS card grid as the first impression.
- [ ] I rejected beautiful imagery with weak brand presence.
- [ ] I rejected a strong headline with no clear action.
- [ ] I rejected busy imagery behind text.
- [ ] I rejected sections that repeat the same mood statement without advancing the story.
- [ ] I rejected carousels with no narrative purpose.
- [ ] I rejected app UI made of stacked cards instead of real layout.
- [ ] I rejected filler copy, redundant icons, and placeholder structure that looked polished but said little.

---

## 14. Final litmus checks

- [ ] The brand or product is unmistakable in the first screen.
- [ ] There is one strong visual anchor.
- [ ] The page can be understood by scanning headlines only.
- [ ] Each section has one job.
- [ ] Cards are truly necessary where used.
- [ ] Motion improves hierarchy or atmosphere.
- [ ] The design would still feel premium if decorative shadows were removed.
- [ ] The implemented result matches the intended tone, not just the rough structure.

---

## Official source references

These templates are derived from official OpenAI guidance, especially:

1. Designing delightful frontends with GPT-5.4
2. Building frontend UIs with Codex and Figma
3. Codex best practices
4. Codex prompting
5. AGENTS.md guidance for Codex
6. Codex customization guidance
7. Codex Prompting Guide cookbook
8. GPT-5.1 prompting guide sections on tokens-first frontend design
9. Frontend coding with GPT-5 cookbook

Suggested links to keep near this checklist:

- https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4
- https://developers.openai.com/blog/building-frontend-uis-with-codex-and-figma
- https://developers.openai.com/codex/learn/best-practices
- https://developers.openai.com/codex/prompting
- https://developers.openai.com/codex/guides/agents-md
- https://developers.openai.com/codex/concepts/customization
- https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide
- https://developers.openai.com/cookbook/examples/gpt-5/gpt-5-1_prompting_guide
- https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_frontend
