# OpenAI Domain Contract Reconciliation

Date: 2026-03-23
Mode: Planning only
Working source: [2026-03-23-openai-domain-ui-contracts.md](/Users/parkerrex/Projects/ship-by-sunday/.codex/plans/2026-03-23-openai-domain-ui-contracts.md)

Retirement note, 2026-05-04: the private starter repository invite path has been removed from the live product. `starterRepo` is no longer a current intake source; customers receive the generated Codebase through `/review`.

## How To Use This File

This is the working sheet for deciding what survives into the rebuilt funnel.

Each row from the domain-contract doc gets mapped to:
- codebase file(s)
- target bucket
- current repo coverage
- keep / combine / add / demote / delete action

### Buckets

- `fact`: belongs in canonical project definition
- `derived`: should be generated from facts + repo context
- `workflow`: app-only teaching/progress state
- `ephemeral`: session-only or secret/runtime state
- `split`: row contains more than one kind of thing and should be broken apart

### Actions

- `keep`: keep as-is as a canonical fact
- `combine`: merge multiple current inputs into one canonical fact
- `add`: currently missing; add a question
- `demote`: keep in product, but not as codebase fact
- `delete`: remove from the intake funnel

## Current Repo Source Legend

- `1.1` = welcome brief in [start-here.ts](/Users/parkerrex/Projects/ship-by-sunday/features/course/lesson/model/lessons/start-here.ts)
- `1.4` / `1.5` / `1.6` = CEO foundation in [ceo.ts](/Users/parkerrex/Projects/ship-by-sunday/features/course/lesson/model/lessons/ceo.ts)
- `2.1` = active Design intake in [design.ts](/Users/parkerrex/Projects/ship-by-sunday/features/course/lesson/model/lessons/design.ts)
- `3.x` = build/marketing inputs in [build.ts](/Users/parkerrex/Projects/ship-by-sunday/features/course/lesson/content/build.ts)
- `starterRepo` = retired GitHub username intake, removed from the live product on 2026-05-04

---

## Marketing Contract

| Contract field | Codebase file(s) | Target bucket | Current repo source(s) | Coverage | Action | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `metadata` | `marketing/README.md`, `marketing/documentation.md` | `derived` | none canonical | Missing | `add` | Owner/status/review metadata belongs to generated docs, not student facts. |
| `useCaseClassification` | `marketing/CHECKLIST.md`, `marketing/PLANS.md` | `fact` | weak proxies in `3.5`, `3.16` | Missing | `add` | Need explicit marketing workflow type and channel scope. |
| `businessContext` | `marketing/README.md`, `marketing/PLANS.md` | `fact` | `1.4`, `1.5`, `3.4`, `3.5` | Partial | `combine` | Reuse core user/problem/outcome instead of recollecting. |
| `stakeholders` | `marketing/documentation.md` | `split` | primary user from `1.4`; approver/SME/owner nowhere | Partial | `add` | Keep `primary_user` as fact; make approver/owner optional codebase metadata. |
| `audienceAndOutcome` | `marketing/README.md`, `marketing/PLANS.md`, `prompts/marketing.md` | `fact` | `1.4`, `1.5`, `3.5` | Partial | `combine` | Already mostly present upstream; `3.5` should consume, not recollect. |
| `prioritization` | `marketing/PLANS.md` | `derived` | none | Missing | `add` | Needed if marketing codebase includes workflow prioritization; likely later-stage marketing codebase data. |
| `workflowMap` | `marketing/PLANS.md`, `marketing/documentation.md` | `fact` | none | Missing | `add` | Need explicit repeatable marketing workflows if codebase is truly operational. |
| `executionMode` | `marketing/AGENTS.md`, `marketing/PLANS.md` | `derived` | none | Missing | `add` | Prompt/project/GPT/agent choice is codebase configuration, not student product fact. |
| `campaignBrief` | `prompts/marketing.md`, `marketing/PLANS.md` | `fact` | `3.4` marketing brief; `3.5` offer brief/copy fields | Partial | `combine` | Strong candidate for one canonical `marketing_brief`. |
| `brandVoiceRules` | `marketing/AGENTS.md`, `prompts/marketing.md` | `fact` | `3.1` brand strategy/design; `3.11` strategy prompt | Partial | `combine` | Current repo has fragments, not explicit rules. |
| `researchScope` | `marketing/CHECKLIST.md`, `marketing/PLANS.md` | `fact` | `1.6` research notes | Partial | `combine` | Normalize into reusable evidence/research scope instead of loose notes. |
| `analysisSpec` | `marketing/CHECKLIST.md`, `marketing/documentation.md` | `fact` | none | Missing | `add` | Only needed if you want analytics workflows inside the codebase. |
| `creativeSpec` | `prompts/marketing.md`, `marketing/PLANS.md` | `fact` | `2.1` brand path; `3.9` brand kit; `3.11` refs/mimic image | Partial | `combine` | Good candidate for the marketing-facing visual brief. |
| `knowledgeAndSources` | `marketing/AGENTS.md`, `marketing/documentation.md` | `split` | stable/fresh split not explicit | Missing | `add` | Needed if codebase includes reusable marketing agents. |
| `outputAndApproval` | `marketing/AGENTS.md`, `marketing/documentation.md` | `split` | CTA/copy exists; approval/publish path missing | Missing | `add` | Review/publish rules belong in codebase metadata. |
| `riskAndEvaluation` | `marketing/CHECKLIST.md`, `marketing/documentation.md` | `split` | no marketing eval model; some QA later | Missing | `add` | Needed for serious marketing operations, not for landing copy alone. |
| `rolloutAndMaintenance` | `marketing/PLANS.md`, `marketing/documentation.md` | `derived` | none | Missing | `add` | This is codebase governance, not lesson-local data. |

## Design Contract

| Contract field | Codebase file(s) | Target bucket | Current repo source(s) | Coverage | Action | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `taskFraming` | `design/PLANS.md` | `split` | problem/goal from `1.4`, `1.5`, `2.1`; reasoning level missing | Partial | `combine` | Keep goal/problem/done-when as facts; reasoning level can be derived/configured. |
| `audienceContext` | `design/PLANS.md` | `fact` | `1.4`, `1.5`, `2.1` | Covered | `keep` | Strong upstream spine already exists. |
| `systemMode` | `design/AGENTS.md` | `fact` | none explicit | Missing | `add` | Need explicit preserve/extend/net-new choice. |
| `scopeTargets` | `design/PLANS.md`, `build/docs/prompt.md` | `split` | screen sequence in `2.1`; out-of-scope mostly missing | Partial | `combine` | Split into routes/screens/components facts and scope boundary facts. |
| `referenceSet` | `design/PLANS.md`, `design/CHECKLIST.md` | `fact` | late refs in `3.9`, `3.11`; none in active Design | Partial | `add` | Must move into `2.2` in rebuilt funnel. |
| `antiPatternsToAvoid` | `design/AGENTS.md`, `design/CHECKLIST.md` | `derived` | none explicit | Missing | `add` | Better generated from codebase, not asked as separate student questions. |
| `coreConstraints` | `design/PLANS.md` | `fact` | weak proxies in `2.1`, `3.5` | Missing | `add` | H1/sections/typeface/accent/CTA constraints are not explicitly asked today. |
| `visualThesis` | `design/PLANS.md`, `design/documentation.md` | `fact` | fragments in `core_brand_guide_notes`, `3.1`, `3.11` | Missing | `add` | Core blocker for high-quality design codebase. |
| `contentPlan` | `design/PLANS.md`, `design/documentation.md` | `fact` | some marketing copy structure in `3.5` only | Missing | `add` | Needs direct question, not inference from later copy tabs. |
| `interactionPlan` | `design/PLANS.md`, `design/documentation.md` | `fact` | none | Missing | `add` | Motion / interaction thesis does not exist in current intake. |
| `surfaceSpecificPlan` | `design/PLANS.md` | `fact` | partial in `2.1` and `3.10` | Partial | `add` | Need explicit landing/app branch logic. |
| `designSystemPlan` | `design/PLANS.md`, `design/AGENTS.md` | `fact` | `3.9` brand kit only | Partial | `combine` | Move token/system questions earlier into Design. |
| `componentStrategy` | `design/documentation.md`, `build/docs/plans.md` | `derived` | none explicit | Missing | `add` | Better derived from repo context + surface plan than directly asked. |
| `imageryPlan` | `design/PLANS.md`, `prompts/marketing.md` | `fact` | `3.11` refs/mimic image, `3.5` style URL | Partial | `combine` | Needs earlier, more explicit question. |
| `copyPlan` | `design/PLANS.md`, `prompts/marketing.md` | `fact` | `1.5`, `3.4`, `3.5` | Partial | `combine` | Marketing copy exists; design-side copy plan does not. |
| `verificationPlan` | `design/PLANS.md`, `design/CHECKLIST.md` | `fact` | late QA in `3.12`; no design-time verification plan | Partial | `add` | Need explicit viewport/reference/acceptance questions. |
| `deliveryNotes` | `design/documentation.md` | `derived` | none | Missing | `add` | This is generated/filled after work, not canonical student fact. |

## Build / Long-Horizon Contract

| Contract field | Codebase file(s) | Target bucket | Current repo source(s) | Coverage | Action | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `taskIdentity` | `build/docs/prompt.md`, `build/docs/plans.md` | `split` | initiative/task title not explicit | Missing | `add` | Product name exists; task title/initiative does not. |
| `goalFrame` | `build/docs/prompt.md` | `fact` | `1.5`, `2.1`, `3.10` | Partial | `combine` | Need explicit objective + user-visible outcome + why this matters. |
| `scopeBoundary` | `build/docs/prompt.md`, `build/docs/plans.md` | `fact` | weak proxies in `3.4`, `3.8`, `3.10` | Missing | `add` | Needs explicit in/out/non-goals. |
| `durableMemorySetup` | `build/AGENTS.md`, `build/CHECKLIST.md` | `derived` | templates exist only | Partial | `add` | Do not ask students; generate from codebase compiler. |
| `constraints` | `build/docs/prompt.md` | `fact` | stack hints in `3.7`, `3.10`, `3.14` | Partial | `combine` | Needs explicit grouped constraints. |
| `contextPack` | `build/docs/prompt.md` | `split` | refs/screenshots/route notes scattered | Partial | `combine` | Some context is fact, some is Codebase context. |
| `deliverables` | `build/docs/prompt.md` | `fact` | implied, not explicit | Missing | `add` | Need direct question. |
| `successCriteria` | `build/docs/prompt.md`, `build/docs/plans.md` | `fact` | weak proxies in QA/deploy checklists | Missing | `add` | Major long-horizon blocker. |
| `demoPlan` | `build/docs/prompt.md`, `build/docs/documentation.md` | `fact` | QA report and deploy checks only | Missing | `add` | Should be explicit. |
| `setupPrerequisites` | `build/CHECKLIST.md`, `build/docs/implement.md` | `split` | `3.0`, `3.14`, generated Codebase handoff | Partial | `combine` | Keep core setup facts; generate the runbook steps. |
| `architectureIntent` | `build/docs/plans.md` | `fact` | `3.10` plan affected areas + slice codebase | Partial | `combine` | Existing plan fragments can seed it. |
| `milestonePlan` | `build/docs/plans.md` | `derived` | `3.8`/`3.10` fragments only | Partial | `add` | Should be generated from plan facts, not directly stored as many freeform fields. |
| `workIsolationPlan` | `build/docs/plans.md` | `derived` | none | Missing | `add` | Repo execution rule, not student fact. |
| `risksAndUnknowns` | `build/docs/prompt.md`, `build/docs/plans.md` | `fact` | `3.10` risks/dependencies | Covered | `keep` | One of the stronger long-horizon facts already present. |
| `rollbackEscapeHatch` | `build/docs/plans.md` | `fact` | none | Missing | `add` | Needs explicit question or derived starter. |
| `openQuestions` | `build/docs/prompt.md` | `fact` | none | Missing | `add` | Good candidate for final planning intake. |
| `statusBlock` | `build/docs/documentation.md` | `workflow` | app state/checklists | Missing | `demote` | Generated/updated during execution, not part of student intake. |
| `decisionLog` | `build/docs/documentation.md` | `derived` | none | Missing | `add` | Generated during execution or seeded from major upfront decisions. |
| `validationLog` | `build/docs/documentation.md` | `workflow` | QA/deploy evidence only | Missing | `demote` | Runtime/implementation output, not intake. |
| `knownIssuesFollowups` | `build/docs/documentation.md` | `workflow` | QA report partly | Partial | `demote` | Better execution output than intake fact. |
| `changeLog` | `build/docs/documentation.md` | `workflow` | none | Missing | `demote` | Generated during execution. |

## Most Important Judgments

### Keep as codebase facts

- selected user/problem from `1.4`
- outcome from `1.5`
- core flow from `2.1`
- distribution/install/AI promise from `3.10`
- risks/dependencies from `3.10`
- operational deploy context from `3.4` / `3.14`
- generated Codebase handoff state

### Combine aggressively

- product naming across `1.1`, `3.5`, `3.9`, `3.14`
- marketing brief across `3.4` and `3.5`
- design direction across `2.1`, `3.1`, `3.9`, `3.11`
- implementation planning across `3.7`, `3.8`, `3.10`, `3.11`
- domain capture across `3.4`, `3.9`, `3.14`

### Add because the codebases require them

- visual thesis
- content plan
- interaction thesis
- reference set in the active Design block
- design token plan
- scope boundary
- non-goals
- why this v1 is enough
- deliverables
- done-when
- success criteria
- validation / demo flow
- rollback / escape hatch
- open questions
- marketing goals
- channel scope
- brand voice rules

### Demote out of codebase truth

- almost all lesson progress checklists
- copied-prompt confirmations
- live QA status fields
- secret entry fields

## Best Next Step

This file is now the right collaboration surface.

The next pass should not be another essay.

It should be:
- row-by-row edits to the `Action` and `Notes` columns
- especially the `split` rows
- until we can lock:
  - final codebase facts
  - final generated docs
  - final workflow-only state
  - final ephemeral/runtime state
