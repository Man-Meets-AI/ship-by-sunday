# Interface Polish Recipes

This reference paraphrases the implementation heuristics from [Details That Make Interfaces Feel Better](https://jakub.kr/writing/details-that-make-interfaces-feel-better). Use it as a small-fix recipe bank, not as a mandate to restyle the whole product.

## Table of Contents

- [Text and Numbers](#text-and-numbers)
- [Shape and Alignment](#shape-and-alignment)
- [Surface Treatment](#surface-treatment)
- [Light Interaction Polish](#light-interaction-polish)

## Text and Numbers

### Text Wrapping

Use when headings, card titles, or short descriptive copy break awkwardly and leave orphaned last words.

- Start with `text-wrap: balance` for short headlines and compact marketing copy.
- Use `text-wrap: pretty` only when you want similar behavior and the performance tradeoff is acceptable.
- Prefer this on headlines, labels, and short blurbs; do not assume every long body paragraph needs it.

### Crisp Text Rendering

Use when text feels heavier than intended, especially on macOS.

- Prefer app-wide `-webkit-font-smoothing: antialiased` or Tailwind's `antialiased` utility if the change helps the overall surface.
- Treat this as a global typography choice, not a one-off patch on random components.
- Verify light text, dense UI copy, and mixed-weight typography before keeping it.

### Tabular Numbers

Use when counters, timers, prices, stats, or dashboards shift as numbers update.

- Apply `font-variant-numeric: tabular-nums` or `tabular-nums`.
- Use it on numeric surfaces, not necessarily the whole app.
- Re-check the font after applying it because some typefaces change numeral styling noticeably.

## Shape and Alignment

### Concentric Border Radius

Use when nested cards, inputs, pills, or panels have radii that feel subtly mismatched.

- Keep the relationship `outer radius = inner radius + padding`.
- Apply the rule to nested shells, grouped cards, and framed media.
- Fix radius relationships before inventing other visual treatments.

### Optical Alignment

Use when geometry is technically centered but still looks off.

- Reduce padding slightly on the icon side of a button when text and icon combinations feel visually lopsided.
- Add small margin or padding adjustments for shapes that feel optically heavy.
- If the issue comes from the icon itself, prefer fixing the `svg` or view box instead of piling on layout hacks.

## Surface Treatment

### Shadows Instead of Borders

Use when a flat border looks harsh, especially in light mode or on mixed backgrounds.

- Prefer a layered low-alpha `box-shadow` over a single opaque border when you need depth.
- A good starting stack is:
  `0 0 0 1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06), 0 2px 4px 0 rgba(0, 0, 0, 0.04)`.
- Darken the same recipe slightly for hover and transition `box-shadow` directly.
- Use this especially on cards, floating panels, and UI placed over imagery or multiple background colors.

### Image Outlines

Use when images blend into the background or need the same edge definition as the rest of a design system.

- Add a `1px` outline at roughly `10%` opacity.
- In light mode use a black outline; in dark mode use a white outline.
- Use `outline-offset: -1px` so the outline hugs the image edge cleanly.
- Keep this subtle; the goal is depth and separation, not a visible frame.

## Light Interaction Polish

If the task turns into tooltip motion, route transitions, hover behavior, gestures, or broader interaction timing, switch to `ENG-practical-motion`.

### Contextual Icon Transitions

Use when an icon appears only in response to state, such as copy success, expand state, or inline confirmation.

- Animate the contextual icon with `opacity`, `scale`, and a small `blur`.
- Keep the animation on the icon or inner layer, not the whole control.
- Prefer spring motion if the existing stack already uses a motion library; otherwise keep the CSS transition subtle.

### Interruptible Interactions

Use when the user may reverse intent while an animation is still running.

- Prefer CSS transitions for interactive state changes because they retarget cleanly.
- Use keyframes for staged, run-once sequences rather than toggled controls.
- Treat interruptibility as a product requirement for menus, toggles, and other reversible interactions.

### Split and Stagger Entering Elements

Use when a whole block enters as one slab and feels heavy.

- Animate title, description, and actions separately rather than animating one large container.
- Start around `100ms` between sections.
- If splitting a short title into words, start around `80ms` between words.
- A solid enter recipe is `opacity`, `blur`, and `translateY(8px)`.
- Keep descriptions as a block unless there is a strong reason to split them further.

### Subtle Exits

Use when exits pull too much attention or feel heavier than entrances.

- Keep some directional cue, but reduce travel distance.
- Use a small fixed offset such as `-12px` instead of the full container height when the element is small.
- Exit motion should usually be softer and less attention-grabbing than enter motion.
