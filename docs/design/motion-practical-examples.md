# Practical Motion Examples Library

Last updated: 2026-03-11

## Purpose

Create a larger internal reference in the same spirit as the terse scenario-to-solution examples shown in the reference image and the practical, implementation-first teaching style used by [animations.dev](https://animations.dev/).

This is not a motion-theory essay.

It is a fast problem-solving document for common UI motion issues:

- what feels off
- the smallest fix that usually helps
- the implementation detail worth remembering

## What this document borrows from the reference

- start from the product problem, not from an animation trend
- keep examples concrete and short
- prefer fixes that can ship today
- bias toward interaction feedback, overlays, lists, loading states, and polish
- treat motion as clarity and responsiveness, not decoration

## Working defaults

Use these as starting points, not rigid rules.

| Pattern                  | Good default                                                    |
| ------------------------ | --------------------------------------------------------------- |
| Hover feedback           | `120ms - 180ms`, usually `ease-out`                             |
| Press / tap feedback     | `80ms - 140ms`, immediate response matters more than flourish   |
| Tooltip / menu / popover | `160ms - 220ms`, anchored to the trigger                        |
| Modal / dialog           | `180ms - 260ms`, pair panel motion with a faster backdrop fade  |
| Drawer / sheet           | `220ms - 320ms`, distance depends on travel                     |
| Toast                    | `180ms - 240ms`, enter from nearby edge, exit faster            |
| Large page transition    | `280ms - 420ms`, keep it simpler than you think                 |
| Stagger interval         | `20ms - 40ms`, usually cap visible stagger to first `4-8` items |

## Core heuristics

- Prefer `transform` and `opacity` over layout-affecting properties.
- Start close to the final state. `scale(0.96)` usually feels better than `scale(0)`.
- Exit motion should usually be faster than enter motion.
- Anchor overlays to the trigger with `transform-origin`.
- Motion that breaks input, readability, or performance is not polish.
- Gate hover-only patterns with `@media (hover: hover) and (pointer: fine)`.
- Respect `prefers-reduced-motion`.

## 1. Buttons, Links, and Direct Feedback

| Scenario                                        | Solution                                                                                                 |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Button feels dead on click                      | Add `:active { transform: scale(0.98) translateY(1px); }` and reduce shadow at the same time             |
| Button press feels rubbery                      | Shorten press feedback to `80ms - 120ms`; long press transitions feel laggy                              |
| Hover state feels floaty                        | Use `120ms - 160ms` with `ease-out`; long hover animations feel decorative instead of responsive         |
| Button label jitters during hover               | Animate an inner wrapper, not the button box that defines layout                                         |
| Button grows and pushes nearby content          | Use `transform: scale()` instead of changing padding, border width, or font size                         |
| Icon wiggles separately from the button         | Move label and icon inside one animated wrapper so they share the same transform                         |
| Pressed button snaps back too hard              | Use a slightly slower release than press, or remove the transform on `pointerup` with a short `ease-out` |
| Loading button changes width                    | Reserve width up front or keep both states in a fixed-width wrapper                                      |
| Spinner makes text jump left                    | Absolutely position the spinner or fade between label states instead of inserting inline                 |
| Hover effect looks stronger than click feedback | Keep hover subtle; press state should feel like the decisive response                                    |
| Link underline feels abrupt                     | Animate `background-size` or a pseudo-element width, not text metrics                                    |
| CTA hover causes flicker near edges             | Keep the hover hit area stable; do not animate the container in a way that moves the pointer off target  |

## 2. Cards, Tiles, and Surface Hover States

| Scenario                                                | Solution                                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Card hover feels too loud                               | Use `translateY(-2px)` to `translateY(-4px)` or a slight shadow lift, not a dramatic float  |
| Card text becomes blurry on hover                       | Avoid scaling text-heavy surfaces; animate a child overlay, border, or shadow instead       |
| Hover effect looks like a bug on touch laptops          | Gate hover transforms behind `@media (hover: hover) and (pointer: fine)`                    |
| Grid of cards feels noisy when all animate              | Keep movement tiny and consistent; reserve bigger reveals for the hovered card content only |
| Card reveal makes layout jump                           | Fade and translate internal content without changing the card's outer dimensions            |
| Hover state flickers when moving across nested children | Put the hover trigger on the parent and animate children via `.group:hover` or equivalent   |
| Border animation feels choppy                           | Animate `opacity` on a second border layer instead of switching border widths               |
| Card highlight feels disconnected from cursor           | Keep origin and motion centered on the hovered surface unless direction matters             |
| Two hover effects compete                               | Pick one dominant signal: position, glow, or content reveal, not all three                  |
| Card hover enters fine but exit drags                   | Make exit shorter than enter, or remove delays from exit entirely                           |

## 3. Modals, Drawers, Sheets, and Dialogs

| Scenario                                            | Solution                                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Modal appears from nowhere                          | Start at `opacity: 0` plus `scale(0.98)` or `translateY(8px)`, not `scale(0)`                                 |
| Modal feels detached from the action that opened it | If possible, animate from the trigger zone or at least set `transform-origin` toward it                       |
| Backdrop feels heavier than the dialog              | Fade backdrop faster and to a lower opacity than you first expect                                             |
| Dialog close feels sluggish                         | Make exit `15% - 30%` faster than enter                                                                       |
| Sheet movement feels too far on desktop             | Reduce travel distance when the viewport is large; full-height mobile motion often feels excessive on desktop |
| Dialog content pops before container is ready       | Sequence it: panel first, then inner content `20ms - 40ms` later                                              |
| Closing dialog still catches clicks                 | Set `pointer-events: none` as soon as the close state starts                                                  |
| Nested dialog stack feels chaotic                   | Keep background dialogs static or dimmer; only the top layer should animate noticeably                        |
| Drawer content stretches during slide-in            | Animate the drawer container with `transform`; avoid animating width during the same motion                   |
| Full-screen mobile sheet feels abrupt               | Add a slight top-corner radius transition or subtle content fade to reduce the hard slab effect               |

## 4. Tooltips, Popovers, Menus, and Anchored UI

| Scenario                                                          | Solution                                                                                                  |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Tooltip scales from the wrong point                               | Set `transform-origin` based on placement: top, bottom, left, or right of the trigger                     |
| Tooltip flickers when moving from trigger to content              | Animate the tooltip panel, not the hover target, and keep the gap tiny or bridged                         |
| Popover feels slow when moving through multiple targets           | Remove or shrink the delay after the first open                                                           |
| Context menu feels behind the cursor                              | Open immediately with a small opacity/scale transition, not a delayed dramatic motion                     |
| Menu looks like it drops from the viewport instead of the trigger | Use a small `translateY(4px - 8px)` plus origin at the trigger edge                                       |
| Popover content appears before position is correct                | Compute placement first, then animate in; do not animate from an unpositioned state                       |
| Large menu feels mushy                                            | Animate the container lightly, then stagger menu items with a very short interval                         |
| Cascading submenus are hard to use                                | Add directional intent delay instead of a generic delay on every hover                                    |
| Tooltip arrow lags behind the panel                               | Keep arrow inside the same transformed layer as the tooltip body                                          |
| Menu exit feels sticky                                            | Remove exit delay and shorten duration; users are usually already done with it                            |
| Anchored panel jumps when content size changes                    | Animate inner content opacity and height separately instead of recomputing the panel transform mid-flight |
| Combobox menu opens from the center                               | Set `transform-origin: top` and start from a near-final scale like `scaleY(0.98)` or a short `translateY` |

## 5. Accordions, Expanding Sections, and Height Changes

| Scenario                                             | Solution                                                                                        |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Accordion snaps open harshly                         | Animate height with measured values, `grid-template-rows`, or `max-height` plus content fade    |
| Accordion content clips awkwardly                    | Fade inner content slightly after the container starts expanding                                |
| Closing accordion feels slower than opening          | Reverse the timing; exit should usually feel quicker                                            |
| Expanding section causes whole page to jump          | Scroll the region into view only after expansion if it would otherwise leave the heading behind |
| Divider lines wobble while height animates           | Keep dividers outside the height-animated inner wrapper                                         |
| Rich text inside accordion feels laggy               | Animate the shell and opacity only; avoid animating many nested children individually           |
| FAQ list feels mechanical                            | Add a small icon rotation or subtle label color shift instead of over-animating the whole row   |
| Expanding one section collapses another too abruptly | Offset the close and open timings slightly so they read as one coordinated change               |

## 6. Lists, Sorting, Reordering, and Layout Motion

| Scenario                                     | Solution                                                                                                 |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Reordered list looks chaotic                 | Use a FLIP-style transform animation so items move from old to new positions smoothly                    |
| One item changes height and everything jumps | Animate the changed item's internals while letting the list reposition via transforms                    |
| Sort transition feels like teleporting       | Fade non-moving chrome slightly and animate the moved items, not every child indiscriminately            |
| New list item shoves content down too hard   | Insert with reserved space when possible, then animate opacity and a small translate                     |
| Removing an item leaves a visual snap        | Fade and collapse the leaving item before the rest of the list closes the gap                            |
| Staggered list reveal feels too slow         | Stagger only the first visible items and let the rest appear together                                    |
| Notification feed feels busy                 | Keep feed motion directional and consistent; avoid mixing scale, slide, blur, and stagger in one pattern |
| Kanban card drag reorder feels unstable      | Keep dragged item on its own promoted layer and animate placeholders, not the dragged card's layout box  |
| Numeric badges in a list cause width shifts  | Use `font-variant-numeric: tabular-nums` and a minimum width wrapper                                     |
| Filtered results flash too much              | Animate opacity and vertical offset lightly; do not rebuild the whole grid with giant entrances          |

## 7. Tabs, Segmented Controls, and Selection Changes

| Scenario                                   | Solution                                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Tab switch feels abrupt                    | Crossfade content and move an active indicator rather than animating the whole panel stack dramatically |
| Active pill jumps width                    | Measure the active indicator separately and animate the indicator, not the label layout                 |
| Selected tab feels laggy                   | Move the indicator immediately, then let content catch up a moment later                                |
| Tab content reset looks like a page reload | Preserve panel height where possible and animate child content instead of collapsing the whole region   |
| Icon tabs feel twitchy                     | Animate color or background first; reserve motion for the active indicator                              |
| Segmented control thumb looks detached     | Put thumb and label inside a stable container and animate the thumb with transforms                     |
| Mobile tabs swipe and tap compete          | Lock one primary interaction per breakpoint or device mode                                              |
| Repeated tab changes feel overly animated  | Remove entrance motion after the first load or when switching rapidly between known states              |

## 8. Forms, Validation, and Inline Guidance

| Scenario                                                 | Solution                                                                                            |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Error message appears too late to notice                 | Fade and slide it in from `4px - 6px` below the field with no delay                                 |
| Invalid field shake looks gimmicky                       | Prefer border, helper text, and icon feedback; if shaking, keep it extremely brief and tiny         |
| Focus state feels invisible                              | Animate focus ring opacity or scale over `100ms - 150ms`, not instantly with no transition          |
| Success checkmark shifts field layout                    | Reserve the status icon slot from the start                                                         |
| Helper text jumps the form                               | Reserve vertical space or animate the helper region height                                          |
| Multi-step form feels like separate pages                | Keep a persistent shell and animate step content inside it                                          |
| Submit spinner suggests nothing is happening             | Pair spinner with status text like `Saving...` or `Creating your workspace...`                      |
| Autosave feedback feels noisy                            | Use a quiet fade for `Saved` and remove it automatically rather than animating it every few seconds |
| Password reveal toggle feels janky                       | Animate icon opacity or rotation only; do not resize the input or move caret position               |
| Inline validation fires while typing and feels punishing | Delay visual emphasis until blur or until the input reaches a meaningful threshold                  |

## 9. Navigation, Page Transitions, and Route Changes

| Scenario                                        | Solution                                                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Route change feels like a hard flash            | Keep global chrome stable and animate only the content region                                        |
| Page transition feels over-produced             | Use one main change: crossfade, slight translate, or scale, not a full cinematic sequence            |
| New page loads from the wrong direction         | Use directional transitions only when direction has product meaning like forward/back                |
| Content shifts while header/footer stay fixed   | Animate content inside the stable frame instead of moving the whole viewport                         |
| Skeleton disappears too suddenly                | Crossfade from skeleton to real content while preserving rough dimensions                            |
| Sidebar nav selection feels vague               | Animate an indicator bar or background fill instead of moving the whole label row                    |
| Breadcrumb or stepper changes are easy to miss  | Add a small color and position transition to the active state                                        |
| Back navigation feels identical to forward      | If you use directional transitions, reverse them consistently for back actions                       |
| Frequent page loads feel slower with motion     | Skip or reduce route animation after the first load or on repeated fast transitions                  |
| Navigation drawer steals attention from content | Keep drawer motion functional; reserve stronger animation for the destination content or primary CTA |

## 10. Loading, Async States, and Progress

| Scenario                                          | Solution                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Spinner-only state feels empty                    | Pair the spinner with a useful status label or staged progress copy                               |
| Skeleton does not resemble final content          | Match the real layout structure instead of using generic bars everywhere                          |
| Shimmer feels cheap or distracting                | Slow it down and reduce contrast; the skeleton should disappear into the background               |
| Async result pops in abruptly                     | Fade from placeholder to content while keeping the container dimensions stable                    |
| Progress bar feels dishonest                      | Move quickly at first, slow near the end, but do not fake completion before the actual done state |
| Long-running job feels frozen                     | Add heartbeat updates, changing labels, or step indicators instead of one endless spinner         |
| Image loads and shifts everything                 | Reserve aspect ratio with `aspect-ratio` or explicit dimensions before the image appears          |
| Loading cards feel like duplicated content        | Keep placeholder density lower than final density so the transition reads clearly                 |
| Empty state turns into content without continuity | Crossfade the empty-state illustration/text out as content fades in                               |
| Batch action has no completion moment             | Animate success confirmation briefly so the user can register that the async action finished      |

## 11. Toasts, Banners, and Temporary Notices

| Scenario                                    | Solution                                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Toast feels like it came from nowhere       | Slide it in `12px - 20px` from the nearest screen edge plus opacity                      |
| Toast stack becomes chaotic                 | Stagger slightly and keep travel direction consistent for every item                     |
| Toast exit is easy to miss                  | Fade and move it out faster than it entered                                              |
| Success banner steals too much focus        | Use softer motion than error banners; not every notice needs the same intensity          |
| Dismiss action feels disconnected           | Keep dismiss icon inside the animated layer so the whole unit moves together             |
| Toast causes layout jump in the page        | Render it in an overlay layer instead of pushing document flow                           |
| Multiple banners compete with sticky header | Keep the banner reveal short and predictable; avoid chained sticky motion on both layers |
| Auto-dismiss feels abrupt                   | Animate a progress affordance or delay the exit slightly after interaction stops         |

## 12. Scroll, Reveal, and Viewport-Based Motion

| Scenario                                                   | Solution                                                                                     |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Scroll reveals feel noisy                                  | Reveal once, not every time the element re-enters view unless there is a strong reason       |
| Content starts animating before it is meaningfully visible | Trigger later in the viewport, not at the very first pixel intersection                      |
| Page feels slow because everything reveals                 | Reserve reveal motion for high-value sections, not every paragraph and list item             |
| Scroll-linked motion stutters                              | Keep the animated properties cheap and the number of linked elements low                     |
| Sticky header resize feels jumpy                           | Interpolate height, padding, or blur gently instead of snapping between two states           |
| Parallax hurts readability                                 | Move background layers slowly and keep text layers comparatively stable                      |
| Scroll-to-anchor lands abruptly                            | Use smooth scrolling plus a brief highlight or target pulse to confirm destination           |
| Section reveal uses giant vertical travel                  | Keep travel small, usually `8px - 24px`; large offsets feel like content is floating in late |
| Opacity reveal makes text hard to read mid-motion          | Pair with a tiny translate and finish quickly so text spends little time half-legible        |
| Repeated viewport reveals on mobile feel broken            | Avoid re-triggering reveal motion during small scroll corrections                            |

## 13. Drag, Swipe, and Gesture-Driven Motion

| Scenario                                            | Solution                                                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Dragging feels sticky                               | Promote the dragged item to its own layer and update with transforms, not layout changes                  |
| Dragged card disappears into the list               | Add a slight scale, shadow, or elevation change while dragging                                            |
| Drop target is hard to read                         | Animate placeholder space or highlight the receiving region, not just the dragged item                    |
| Swipe action triggers accidentally                  | Use a clear threshold and lock the gesture direction early                                                |
| Swipe action feels too binary                       | Map motion to progress so the action affordance fills or reveals proportionally                           |
| Snap-back after failed drag feels harsh             | Use a spring or eased return instead of an instant reset                                                  |
| Drag preview lags behind finger                     | Reduce shadows, filters, and expensive repaints on the dragged layer                                      |
| Reordering on touch feels chaotic                   | Keep siblings moving smoothly while the active item stays under the finger without extra flourish         |
| Pull-to-refresh looks disconnected from the gesture | Tie indicator progress directly to drag distance before release                                           |
| Resizable panel feels jittery                       | Update a lightweight preview in real time and commit expensive layout changes after release when possible |

## 14. Numbers, Counters, and Text Motion

| Scenario                                       | Solution                                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Number counter changes width and shifts layout | Use `font-variant-numeric: tabular-nums` and a fixed-width wrapper                       |
| Animated number rolls too far                  | Only animate changed digits or use a short crossfade for small metrics                   |
| Headline blur-in makes text unreadable         | Keep blur low, usually under `8px`, and finish quickly                                   |
| Character-by-character reveal feels gimmicky   | Reveal by word or line unless the interface is explicitly terminal-like                  |
| Label swap causes jump                         | Stack both labels in the same box and crossfade between them                             |
| Typewriter effect feels slow                   | Use it sparingly and only when the fiction of typing matters to the product              |
| Text scaling feels fuzzy                       | Avoid scaling large text blocks; animate opacity, clip, mask, or parent movement instead |
| Badge text wraps during animation              | Set a minimum width or keep text on one line before animating the container              |

## 15. Icons, SVG, and Decorative Micro-Motion

| Scenario                                     | Solution                                                                                  |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Spinner looks generic and cheap              | Use a partial arc or subtle stroke motion rather than a default full border spinner       |
| SVG morph feels mushy                        | Match path complexity carefully or crossfade between icons instead of forcing a bad morph |
| Line-draw animation feels slow               | Shorten the stroke duration and keep line length reasonable                               |
| Icon bounce feels toy-like                   | Use tiny movement or rotation; icons usually need restraint                               |
| Decorative sparkles compete with the real UI | Lower opacity and keep them behind the functional layer                                   |
| Animated logo steals focus from the CTA      | Reduce loop frequency or stop after the first cycle                                       |
| Status icon pulse feels alarming             | Use pulse for urgent or active states only, not every success state                       |
| Rotating icon looks off-center               | Verify transform origin and viewBox centering before tuning easing                        |

## 16. Performance, Rendering, and Stability Fixes

| Scenario                                           | Solution                                                                                      |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Animation looks shaky on low-end devices           | Add `will-change: transform` sparingly to the specific moving layer                           |
| Large blur kills frame rate                        | Reduce blur radius or move the blur to a smaller pseudo-element                               |
| Box-shadow animation stutters                      | Animate opacity on a pre-rendered shadow layer instead of animating shadow values directly    |
| Filter animation is expensive                      | Favor transform and opacity over `filter`, especially on large surfaces                       |
| Many elements animate at once and tank performance | Reduce concurrency, remove unnecessary stagger, or animate wrappers instead of every child    |
| Subpixel movement makes UI look fuzzy              | Snap travel distances to small whole-pixel values when visual sharpness matters               |
| Text becomes blurry during scale                   | Keep text scale ranges tight like `0.98 - 1.02`, or animate a parent background instead       |
| Overflow clipping causes pop-in during motion      | Ensure animated elements have enough bleed area or move clipping to a deeper wrapper          |
| Fixed and transformed layers interact strangely    | Avoid unnecessary transforms on ancestor elements of fixed-position UI                        |
| Jank appears only during opening                   | Precompute layout and avoid animating from `display: none` into a measured layout-heavy state |

## 17. Accessibility and Input Safety

| Scenario                                                  | Solution                                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Hover behavior triggers on mobile                         | Gate with `@media (hover: hover) and (pointer: fine)`                                             |
| Reduced-motion users still get full transitions           | Use `@media (prefers-reduced-motion: reduce)` to shorten or remove non-essential motion           |
| Auto-playing animation distracts from reading             | Stop looping, slow it down, or only play once on first view                                       |
| Error shake could harm comfort                            | Replace it with color, icon, outline, and concise copy where possible                             |
| Motion hides state changes from keyboard users            | Keep focus states and state changes visible without relying on hover-only motion                  |
| Exit animation blocks assistive workflows                 | Update semantic state immediately even if the visual exit continues briefly                       |
| Touch target looks small even if technically large enough | Expand hit area with a pseudo-element, not visible padding that breaks alignment                  |
| Sequential reveals delay comprehension                    | Prioritize readable structure over cinematic pacing, especially in instructional or form-heavy UI |

## 18. Useful Patterns to Reuse

| Pattern        | Starting point                                                 |
| -------------- | -------------------------------------------------------------- |
| Press feedback | `scale(0.98)` + shorter shadow + `80ms - 120ms`                |
| Tooltip        | `opacity` + `translateY(4px)` + origin from trigger            |
| Menu / popover | `opacity` + `scale(0.98)` or `translateY(6px)` + no long delay |
| Modal          | `opacity` + `scale(0.98)` + faster backdrop fade               |
| Toast          | `opacity` + `translateY(12px)` or edge slide                   |
| List insertion | reserve space + `opacity` + `translateY(8px)`                  |
| List reorder   | FLIP transform                                                 |
| Tab switch     | active indicator move + content crossfade                      |
| Error reveal   | `opacity` + `translateY(4px)`                                  |
| Route change   | stable chrome + content crossfade / small translate            |

## Final filter

Before shipping a motion detail, ask:

1. Does it make the UI feel faster, clearer, or easier to understand?
2. Does it stay sharp under repeated real use, not just on first impression?
3. Does it still work on touch, keyboard, low-power devices, and reduced-motion settings?

If the answer is no, remove it or simplify it.
