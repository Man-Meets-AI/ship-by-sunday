# Review prompt: dropdown and overlay width / wrapping

Paste the block below into a chat or PR review when you want a deliberate pass for **menus, popovers, and overlays** that end up **too narrow**, **clipped**, or with **labels wrapping** awkwardly.

---

## Prompt (copy from here)

Do a focused UI pass for **overlay width and text wrapping** in `apps/web` (and shared UI under `components/ui`).

**Goal:** Find places where dropdowns, navigation menus, popovers, tooltips, or sheets are sized from a **narrow trigger** or **default primitives**, so labels wrap onto multiple lines, truncate without ellipsis, or feel cramped compared to similar surfaces.

**Check these patterns:**

1. **Navigation menu (`NavigationMenuContent`)**
   - Our primitive sets `w-full` and `md:w-auto`. With `viewport={false}`, content is positioned under the trigger, so **`w-full` can mean “as wide as the trigger,”** not “as wide as the design.”
   - Any consumer that only sets `w-*` **without** a matching **`md:w-*` or `md:min-w-*`** may still collapse on **`md:`** because of **`md:w-auto`** on the primitive.
   - Search: `NavigationMenuContent`, `viewport={false}`, `data-slot="navigation-menu-content"`.

2. **Dropdown menu (`DropdownMenuContent`)**
   - Defaults often tie width to **`--radix-dropdown-menu-trigger-width`**. Confirm long items (user email, multi-word labels) still read cleanly; add **`min-w-*`**, **`w-auto`**, or a fixed width where needed.
   - Search: `DropdownMenuContent`, `dropdown-menu-content`.

3. **Popover / context menus / command palette**
   - Same idea: **`max-w-*` without `min-w-*`**, or **`w-` on inner content only**, can squeeze the panel.
   - Search: `PopoverContent`, `ContextMenuContent`, command menu surfaces.

4. **Consistency**
   - For the same product area (e.g. workspace chrome), menu widths should feel consistent; avoid one panel at trigger width and another at a comfortable reading width.

**Deliverable:**
- List files and components with risky sizing.
- For each, say whether it is **buggy today** or **defensive follow-up**, and the **smallest** fix (e.g. add `md:w-72` alongside `w-72`, or `min-w-*` on content).
- Prefer fixing **at the callsite** when only one menu needs it; consider **primitive defaults** only if many callsites share the same bug.

**Verification:**
- Note viewport sizes to spot **`md:`** regressions (mobile vs desktop).
- Run or point to existing **integration-ui** tests if the surface is covered; otherwise describe what to click in the app.

---

## When to use

- After changing **nav**, **shell**, or **radix-based** UI primitives.
- Before release when **workspace or auth chrome** changed.
- When someone reports **“menu too narrow”** or **“text wraps weirdly.”**
