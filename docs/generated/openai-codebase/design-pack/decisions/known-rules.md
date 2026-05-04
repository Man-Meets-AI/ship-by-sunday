# Canonical Design Rules

This file is the long-lived memory for baseline design defaults and exception policy.

## Canonical rules

- Default to no cards unless a card materially improves comprehension or is the interaction container.
- Use one accent color by default unless the existing system already has a mature multi-accent language.
- Limit the system to two typefaces max unless the existing design system already supports more.
- Keep the first viewport tight on landing and branded pages.
- Limit the surface to one H1 unless there is a strong reason not to.
- Verify desktop and mobile before a UI task is considered complete.
- Update documentation after meaningful user-facing changes.
- Preserve existing product and design-system patterns when they are already strong.

## Exception policy

- Any exception to the default rules must be documented in the plan.
- The plan should say why the exception exists, what it replaces, and why the standard rule would fail.
- If the exception changes user perception materially, record it again in the post-ship documentation.
- If a control looks too flat to read as interactive, restore the minimum necessary affordance instead of adding decorative chrome.

## Dated decisions

- **2026-03-27:** The canonical design pack is a workflow contract, not a style blog. It should standardize framing, surface rules, plans, verification, and post-ship documentation.
- **2026-03-27:** Landing-page and app/dashboard surfaces need different default rules. Do not force one surface model onto every UI.
- **2026-03-27:** The baseline visual direction for public surfaces is restraint, hierarchy, and calm composition over card-driven marketing chrome.
- **2026-03-27:** Exceptions are allowed, but only when the plan and post-ship note explain why the default would weaken the result.
