# Design Dependency Sprawl Research

This research pass captures lower-urgency but real design-system and dependency debt.

## Findings

The app pulls from several icon libraries and heavy visual packages even where the repository guidance prefers lucide-first, shadcn-vanilla components, and restrained product surfaces.

Marketing and preview surfaces contain heavy or random visual effects that can create hydration, performance, and bundle-size risk. Some visual modules appear unused and should be removed only after import and build checks prove they are dead.

Some app surfaces still lean toward nested cards and decorative layout patterns even where repeated operational workflows would benefit from denser, clearer scanning.

## Durable Implication

The sixth child ExecPlan should reduce dependency and design-system sprawl after higher-risk runtime and product-contract work lands. It should not start as a redesign.
