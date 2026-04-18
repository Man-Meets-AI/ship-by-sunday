# Canonical Design Checklist

This checklist turns the OpenAI design-checklist source docs into a reusable baseline workflow for design and implementation work.

Use this file together with:

- `docs/openai/design-pack/AGENTS.md`
- `docs/openai/design-pack/PLANS.md`
- `docs/openai/design-pack/documentation.md`
- the matching surface doc under `docs/openai/design-pack/surfaces/`

## 0. Task framing

- [ ] I identified the surface type: landing page, marketing page, app surface, dashboard, prototype, or demo.
- [ ] I wrote the task in terms of goal, context, constraints, and done-when.
- [ ] I chose a reasoning level intentionally; default is low or medium for simpler frontend tasks.
- [ ] I identified whether I am preserving an existing design system or creating/extending one.
- [ ] I collected the key product files, components, tokens, and routes relevant to the task.
- [ ] I gathered real content, product context, screenshots, or a concrete project goal.
- [ ] I noted whether browser verification, screenshots, or Figma references are available.

## 1. Design thesis before coding

- [ ] I wrote a visual thesis in one sentence.
- [ ] I wrote a content plan that covers the opening, support, detail, and final CTA or equivalent operational flow.
- [ ] I wrote an interaction thesis with 2-3 motions or interaction ideas that materially improve the result.
- [ ] I defined high-level constraints up front.
- [ ] I limited the page to one H1 unless there is a strong reason not to.
- [ ] I limited the experience to no more than six major sections unless the product truly requires more.
- [ ] I limited the design to two typefaces max unless the existing system already supports more.
- [ ] I defaulted to one accent color unless the product already has a mature multi-accent system.
- [ ] I chose one primary CTA above the fold when the surface is promotional or conversion-oriented.

## 2. Surface-type rules

### Landing and marketing pages

- [ ] The first viewport reads as one composition, not a dashboard.
- [ ] The brand or product name is a hero-level signal, not just nav text or an eyebrow.
- [ ] The hero budget is tight: brand, one headline, one short supporting sentence, one CTA group, and one dominant image.
- [ ] I did not put stats, schedules, metadata rows, promos, or secondary marketing content in the hero by default.
- [ ] I did not place detached badges, floating labels, promo stickers, or callout boxes on top of hero media.
- [ ] I kept the text column narrow and anchored to a calm area of the image.
- [ ] I used cards only when they materially improve understanding or are the interaction container.

### App surfaces and dashboards

- [ ] I defaulted to calm hierarchy, strong typography, sparse color use, and minimal chrome.
- [ ] The UI is organized around a primary workspace, navigation, secondary context, and one clear accent for action or state.
- [ ] I used utility copy rather than marketing copy.
- [ ] I started with the working surface itself: KPIs, charts, filters, tables, task context, status, or decision support.
- [ ] I did not introduce a hero section unless it was explicitly requested.
- [ ] If a panel could become plain layout without losing meaning, I removed the card treatment.
- [ ] If a section does not help someone operate, monitor, or decide, I removed it.

## 3. Design system and tokens

- [ ] I defined or confirmed core tokens: `background`, `surface`, `primary text`, `muted text`, `accent`, and any needed `ring`, `border`, or `elevation` tokens.
- [ ] I defined or confirmed typography roles: `display`, `headline`, `body`, `caption`, and any product-specific variants.
- [ ] I decided whether the layout is full-bleed, constrained, split, editorial, workspace-first, or another named composition pattern.
- [ ] I used tokens first instead of hard-coded ad hoc colors.
- [ ] I reused existing components where they already solve the problem well.
- [ ] I only created new components or tokens when reuse would clearly weaken the result.
- [ ] I followed the product's existing component, token, and CSS architecture.

## 4. Cards, chrome, and restraint

- [ ] I defaulted to no cards.
- [ ] I used cards only when they are the container for a user interaction or materially improve comprehension.
- [ ] If removing border, shadow, radius, or background did not hurt the design, I removed that chrome.
- [ ] I used spacing, typography, alignment, contrast, scale, and cropping before adding decorative chrome.
- [ ] I avoided pill clusters, stat strips, icon rows, boxed promos, and multiple competing micro-elements unless they were essential.
- [ ] I kept each section focused on one dominant idea.

## 5. Copy, imagery, and motion

- [ ] Every section has one job: explain, prove, deepen, or convert.
- [ ] Every section has one headline and usually one short supporting sentence.
- [ ] I wrote in product language, not design commentary.
- [ ] I used real content or believable task-specific placeholder copy instead of generic filler.
- [ ] I removed repetition aggressively.
- [ ] I used imagery that does narrative work when imagery is central to the experience.
- [ ] I avoided imagery with embedded logos, signage clutter, or UI-like frames fighting the layout.
- [ ] Motion improves presence and hierarchy rather than adding noise.
- [ ] I did not add ornamental-only motion.

## 6. Responsive and visual safety

- [ ] The layout loads and reads correctly on both desktop and mobile.
- [ ] Primary actions remain visible and tappable on small screens.
- [ ] Hero or primary workspace content fits common viewport sizes without accidental clipping.
- [ ] Text does not collide with decorative layers or media.
- [ ] The design remains coherent if the viewport gets shorter, narrower, or denser than expected.
- [ ] I checked at least one desktop size and one mobile size with the real rendered UI.

## 7. Verification and documentation

- [ ] I created or updated a task plan using `PLANS.md` before making broad UI changes.
- [ ] I used Playwright or an equivalent tool to inspect rendered UI when available.
- [ ] I ran lint, tests, build, and typecheck as appropriate before finalizing.
- [ ] I reviewed the final diff for both visual quality and architectural fit.
- [ ] I updated product-facing documentation using `documentation.md` when the work changed the user-facing experience in a meaningful way.

## 8. Exception policy

- [ ] If I intentionally broke a default, I recorded the reason in the plan and post-ship notes.
- [ ] If I used a second typeface, a second accent, extra sections, a hero card, or another exception, I documented why the exception was necessary.
- [ ] If a control looked too flat to read as interactive, I restored the minimum necessary affordance instead of reintroducing decorative chrome.
- [ ] If a section still felt generic after removing cards, I solved it with composition, type, spacing, or imagery before adding new containers.

## 9. Final litmus checks

- [ ] The brand or product is unmistakable in the first screen.
- [ ] There is one strong visual anchor.
- [ ] The page can be understood by scanning headlines only.
- [ ] Each section has one job.
- [ ] Cards are truly necessary where used.
- [ ] Motion improves hierarchy or atmosphere.
- [ ] The implemented result matches the intended tone, not just the rough structure.
