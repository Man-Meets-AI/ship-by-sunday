# Homepage Cleanup Example

- **Doc type:** completed post-ship note
- **Surface type:** landing page
- **Status:** shipped
- **Plan used:** `docs/codex/2026-03-27-homepage-tight-type-flat-surfaces-execplan.md`

## 1. Summary

The homepage was tightened to feel more editorial and less assembled. Standalone eyebrow rows were removed, passive card chrome was flattened, and the footer was simplified so the page reads through hierarchy and whitespace instead of marketing widgets.

## 2. Problem and goal

- **Problem:** The page still felt airy, tracked out, and too dependent on badges, chips, and framed surfaces.
- **Goal:** Preserve the same offer and CTA path while making the page read tighter, flatter, and more deliberate.
- **Audience / user:** Knowledge workers evaluating a weekend shipping system.
- **Surface type:** landing page

## 3. Final outcome

- The hero still carries the main promise and CTA.
- The section order and anchors stayed intact.
- The durability, sprint-path, and footer regions now rely on divider-led structure instead of passive cards.

## 4. Design direction

- **Visual thesis:** Premium editorial minimalism with strong type, calm spacing, and almost no decorative chrome.
- **Content plan:** Brand signal first, promise second, proof and system details next, then conversion and footer.
- **Interaction thesis:** Keep the primary buttons strong, let the rest of the page stay quiet, and avoid motion that reads like decoration.

## 5. Scope of work

### Routes / screens / components changed

- `apps/web/app/_components/home-page/sections/hero-sections.tsx`
- `apps/web/app/_components/home-page/sections/durability-section.tsx`
- `apps/web/app/_components/home-page/sections/pricing-footer-sections.tsx`

### Out of scope

- Render-model logic
- Structured data logic

## 6. Design-system decisions

### Typography decisions

- Kept the hero display headline as the primary uppercase brand moment.
- Tightened body copy to use normal, readable line-height instead of loose paragraph rhythm.

### Layout and composition decisions

- Removed standalone eyebrow rows.
- Replaced framed durability cards with border-top rows.
- Removed the footer theme-pill wrapper so the toggle reads as a control, not a decorative chip.

### Component reuse vs new work

- **Reused:** existing CTA, theme toggle, and proof components
- **New:** none
- **Why:** the problem was composition and chrome, not missing primitives

## 7. Imagery and content decisions

- **Imagery source:** existing product assets
- **Why this imagery works:** the founder proof and system visuals already carried the narrative; they just needed less competing chrome around them.
- **Copy strategy:** keep the offer and proof intact, but stop repeating them as separate label rows.
- **What was removed:** badge-era labels, pill wrappers, and overly framed content blocks

## 8. Motion and interaction

1. Kept the hero CTA and secondary link visually strong.
2. Kept the theme toggle interactive without a decorative wrapper.
3. Reduced visual noise around proof surfaces so hover and focus states matter more.

## 9. Responsive behavior

- **Desktop checks:** hero, system, proof, FAQ, pricing, and footer all read cleanly on a wide viewport.
- **Mobile checks:** the headline remains readable, CTAs stay accessible, and the page does not collapse into a dashboard-like stack.
- **Layout safety notes:** no overflow issues were introduced by removing card wrappers.

## 10. Verification

- **Manual review:** checked the page in light and dark mode at `/?marketing=1`
- **Automated checks:** lint, format check, unit tests, CTA integration-ui, build
- **Reference comparison:** existing product patterns and the repo's homepage contract
- **Checklist status:** landing-page rules, restraint rules, and verification rules passed
- **Blueprint-first status:** homepage anchors, CTA contract, section order, and truthful structured data were preserved

## 11. Tradeoffs and deviations

- Kept the hero headline uppercase because it remains the product's strongest brand signal.
- Left the main CTA buttons visually prominent because the brief explicitly wanted them to stay strong.

## 12. Known issues

- The footer wordmark still reads large by design.
- Some intentional uppercase/tracking remains in the hero and control surfaces.

## 13. Follow-ups

- Reuse the same no-cards approach on any adjacent marketing surface that still feels over-framed.
- Convert this example into a reusable template if another homepage cleanup lands later.

## 14. Screenshots and references

- **Before:** existing homepage implementation in the repo
- **After:** live page at `http://localhost:3000/?marketing=1`
- **Plan used:** `docs/codex/2026-03-27-homepage-tight-type-flat-surfaces-execplan.md`
- **Additional references:** `docs/openai/design-pack/CHECKLIST.md`, `docs/ship-by-sunday/design-pack/CHECKLIST.md`

## 15. Source guidance

This example was guided by:

- `docs/openai/design-pack/AGENTS.md`
- `docs/openai/design-pack/CHECKLIST.md`
- `docs/ship-by-sunday/design-pack/AGENTS.md`
- `docs/ship-by-sunday/design-pack/CHECKLIST.md`
- `docs/ship-by-sunday/design-pack/PLANS.md`
