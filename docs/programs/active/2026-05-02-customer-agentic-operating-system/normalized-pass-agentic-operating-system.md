# Normalized Pass: Customer Agentic Operating System

## Decision Tracks

The initiative has two customer lanes and one shared infrastructure lane.

The new-repo lane installs the agentic operating system into every generated customer repo. It owns generalized Program and ExecPlan contracts, indexes, templates, prompt assets, thin skills, root scripts, generated onboarding, and clean-room materialization tests.

The mature-repo lane creates an adoption workflow for existing codebases. It owns repo audit inputs, maturity/readiness scoring, adoption Program generation, patch or artifact delivery, and non-invasive validation. It must preserve customer conventions instead of assuming the Ship by Sunday starter stack.

The shared infrastructure lane owns customer-safe packaging, validation, prompt and skill versioning, docs mirrors, product narrative, and review proof across both lanes.

## Decisions

Decision: Ship generalized customer-safe Program and ExecPlan contracts instead of exposing internal Ship by Sunday planning archives.
Rationale: Customers need the operating model, not our historical work product. The current snapshot exclusions are protecting the right boundary.
Date: 2026-05-02

Decision: Make the first implementation slice a generated-repo source-contract reconciliation.
Rationale: Generated repos already have a controlled package manager, docs structure, starter skills, prompt pack, Build Pack readiness model, and clean-room replay tests, but the current guidance has prompt naming drift and skill trigger drift. The first slice should stabilize the customer-safe source contract before adding the full operating pack.
Date: 2026-05-02

Decision: Treat mature-repo adoption as a separate product lane, not as an option inside the generated starter bootstrap.
Rationale: Mature repos need read-only audit, convention preservation, and patch review. They should not inherit greenfield assumptions such as Bun, Convex, Stripe, Next.js, or the generated starter route map.
Date: 2026-05-02

Decision: Avoid hidden bootstrap mutations.
Rationale: A `postinstall` or silent bootstrap step that creates Programs would surprise customers and can dirty a repo before review. The correct command should be explicit, such as `bun run agentic:bootstrap`, and should explain what it will write.
Date: 2026-05-02

Decision: Keep Build Pack readiness as the first generated-repo source of truth for first-slice confidence.
Rationale: `docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/` already made readiness deterministic. The new operating pack should connect to that model rather than duplicate blockers and validation truth in another document.
Date: 2026-05-02

## Open Questions

The Program should decide later whether customer-safe Program prompt assets are copied from `docs/prompts/program-*.md`, generated from templates, or rendered from a smaller source pack.

The Program should decide later whether generated repos should always include a seed Program packet or create it only after the explicit `agentic:bootstrap` command.

The Program should decide later how mature repo audits are uploaded, run, and returned in the product. The first Program slice should not require that product surface.

The Program should decide later how the public offer names the two lanes. The current product is truthful for generated repos and not yet truthful for arbitrary mature-repo transformation.
