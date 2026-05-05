# Update Channel Contract

This is the implementation-facing contract for future Ship by Sunday package and update-channel work. It exists to keep the strategy useful without turning it into silent update authority.

This contract adds no external setup. There are no provider projects, GitHub Apps, OAuth apps, registries, secrets, environment variables, repository secrets, webhooks, callbacks, dependency installs, migrations, CI permissions, hosted executors, package scripts, manifests, or generated repo files to create for this slice.

## Product Boundary

The update channel is a future trust layer, not current execution. Its purpose is to help customer repos stay current through approved migrations, prompt-pack refreshes, production patterns, validation recipes, and reviewable upgrade handoffs.

The current contract is:

- detect drift before proposing updates
- explain what changed and why it matters
- preview exact touched areas before writes
- classify managed, modified-managed, unknown, customer-owned, and conflict files
- require explicit customer approval before source, dependency, provider, migration, PR, or hosted execution work
- prove results with named commands or blocked proof
- leave rollback instructions and next recommendations

This contract does not authorize an updater, registry, migration runner, package manager command, dependency upgrade, provider setup, branch push, pull request, CI rerun, hosted executor, raw-source sync, raw-log sync, or generated-starter rewrite.

## Demand Trigger

Do not implement update-channel mechanics until at least one demand trigger is true and recorded in the active Program or a new planning brief:

- repeated customers ask for the same framework, prompt-pack, production-proof, or provider migration after doctor pass or Work-phase loops
- generated repos have enough installed operating-pack evidence to benefit from a versioned manifest
- mature repos have adoption audits proving ownership boundaries and validation commands
- a specific migration has a bounded recipe, clear rollback, and narrow proof commands
- support burden is high enough that a repeatable update report would replace repeated custom work

If none of those triggers is true, keep update-channel work at contract, research, or concierge-plan level.

## Repo Modes

Generated repos and mature repos need different update contracts.

Generated repos can eventually carry SBS-owned metadata earlier because Ship by Sunday controls the generated output. A future generated repo manifest may identify the SBS version, generated modules, installed migrations, generated prompt-pack version, generated validator version, managed file hashes, and customer-owned boundaries. Generated repos may support first-party validator scripts and generated update docs if the compiler renders them with tests.

Mature repos must start from adoption artifacts, not generated assumptions. The first source of truth is the local `.sbs/mature-repo/adoption-audit.json`, adoption Program draft, first ExecPlan draft, command map, source-truth docs, package-manager detection, and customer-approved ownership mapping. A mature repo update cannot assume Bun, Next.js, Convex, Stripe, Clerk, PostHog, Vercel, Linear, Ship by Sunday package scripts, generated docs, or root agent instructions unless the adoption audit or a later approved workflow packet proves that boundary.

Broken-app and high-risk repos should default to diagnostic or plan-only update work until the failure is reproduced, rollback is obvious, and the customer approves the mutation surface.

## Manifest Concept

A future manifest such as `ship-by-sunday.json` is allowed only after a child ExecPlan defines its schema, renderer, validation, ownership, and rollback behavior.

A manifest may eventually record:

- schema version
- SBS framework or operating-pack version
- generated or adopted repo mode
- installed modules and migrations
- prompt-pack version
- validator version
- managed file hashes
- customer-owned file declarations
- last proof command names and statuses
- local `.sbs` artifact refs

A manifest must not store secrets, provider tokens, local absolute paths, raw source excerpts, full logs, Codex transcripts, or hosted dashboard contents. It must not become an implied permission grant. It is evidence for detection and planning, not authority to write.

## Provenance

Every future update must name provenance before it can be applied:

- source package, recipe, migration, or prompt-pack id
- version or immutable digest
- publisher or owning team
- required repo mode and prerequisites
- expected touch targets
- proof commands
- rollback instructions
- release notes or rationale
- whether the artifact is OSS, paid registry, concierge-authored, or customer-authored

Paid registry provenance must be stronger than a URL. Future implementation should consider signed manifests, immutable digests, or pinned release artifacts before automated use. Until that exists, paid or private recipes should be concierge-reviewed and plan-only by default.

## File Ownership

Future update planners must classify each target before proposing a patch:

- `unchanged-managed`: generated or previously managed file still matches the stored hash; eligible for automatic patch after approval
- `modified-managed`: managed file changed by the customer or their agents; requires a 3-way merge plan or manual review
- `unknown-file`: not in the manifest or adoption map; create only if absent or require explicit approval
- `customer-owned`: owned by the customer; suggest a patch, but require explicit approval and clear rollback
- `conflict`: update cannot apply safely; stop and write blocked proof

The classification must appear in the update report before writes. Missing hashes, missing adoption data, ambiguous ownership, or unparseable manifests should degrade to plan-only or blocked proof, not broad write authority.

## Permission Boundary

Detection can be read-only when it stays within sync-safe metadata: package manager, dependency names, script names, file refs, migration ids, prompt-pack ids, manifest fields, Git branch, and prior `.sbs` artifacts.

Planning can produce local artifacts under `.sbs` without source mutation when the customer approves the workflow packet.

Writing source, docs, package manifests, lockfiles, migrations, provider configuration, generated folders, root agent instructions, CI files, or package scripts requires a separate approved workflow packet that names touch targets, branch, profile, write lease, proof commands, stop conditions, and rollback.

Running package manager commands, tests, builds, migrations, provider CLIs, background services, CI reruns, or deployment commands requires explicit command-level approval. Do not smuggle these actions into an update check.

Branch pushes, pull requests, managed GitHub execution, hosted execution, raw-source sharing, raw-log sharing, screenshots, source maps, dashboard inspection, and Codex transcript sharing each need visible customer approval and the matching execution-surface contract.

## Lifecycle

A future update should move through these states:

```text
detected -> planned -> previewed -> approved -> applied -> validated -> delivered
                                -> blocked
                                -> manual-review
                                -> rolled-back
```

`detected` means the updater found an applicable recipe or drift signal. `planned` means it produced a local, reviewable plan. `previewed` means the customer can see touch targets, file ownership classes, commands, proof, rollback, and risks. `approved` means the customer accepted one concrete workflow packet. `applied` means writes occurred inside the approved boundary. `validated` means proof commands passed or blocked proof was recorded. `delivered` means local proof, local branch, or explicitly approved PR handoff exists.

Skipping directly from detection to application is not allowed.

## Proof And Rollback

Every future update must produce local proof or blocked proof. The proof should include:

- update id and version
- provenance
- repo mode
- branch and base branch when applicable
- touched files grouped by ownership class
- created artifacts
- proof commands run
- proof command status
- skipped files
- conflicts
- required but missing approvals
- required but missing env or provider setup
- rollback commands or manual rollback steps
- next recommended workflow

Rollback must be specific. For local branches, name the branch deletion path. For source patches, name the files and reverse patch or Git operation. For package or migration work, name lockfile, dependency, migration, and data rollback boundaries. If rollback cannot be automated, the proof must say so before writes are approved.

## Customer Review Handoff

The default handoff is local: `.sbs` report, local branch when approved, diff summary, proof JSON, and a customer-readable Markdown report.

Opening a pull request is a second explicit action. A future PR handoff must show title, base branch, head branch, pushed refs, changed files, proof status, CI expectations, raw-source visibility, audit log, and revocation behavior before the push or PR occurs.

Hosted or managed handoff must follow `docs/internal/execution-surfaces.md`. The update-channel contract does not create hosted source access.

## Failure Modes

Stop and write blocked proof when:

- demand trigger is not recorded
- repo mode is unknown
- manifest is missing, invalid, or untrusted and adoption data cannot fill the gap
- file ownership cannot be classified
- recipe provenance is missing or mutable
- worktree state conflicts with the packet policy
- write lease expires
- required approval is missing
- package manager, provider, migration, test, build, CI, PR, or hosted execution would be needed but was not approved
- proof command fails
- rollback is unclear for the requested write
- raw source, raw logs, transcripts, source maps, screenshots, or dashboards would need to leave local mode without explicit sharing approval

Failure should create a report and a next recommendation. It should never fall back to broader authority.

## Future Implementation Checklist

Before any child ExecPlan implements update mechanics, it must answer:

- Which demand trigger is active?
- Is this generated-repo, mature-repo, or broken-app mode?
- What manifest or adoption artifact proves the starting state?
- What is the recipe or prompt-pack provenance?
- What files are managed, modified-managed, unknown, customer-owned, or conflicted?
- What exact writes are requested?
- What commands will run?
- What execution surface owns the work?
- What syncs to the hosted app?
- What stays local?
- What approvals are required?
- What proof commands prove the update?
- What rollback path exists?
- What happens when each prerequisite is missing?

If the answer is not concrete, the slice should stay plan-only.
