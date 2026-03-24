# OpenAI Domain UI Contracts

## Initiative

Translate the local OpenAI canon in `docs/OpenAI/` into structured data contracts and concrete shadcn/React affordances for three domains:

1. marketing
2. design
3. build / long-horizon execution

## Goal

Replace generic freeform textareas with domain-specific fields, grouped editors, and repeatable tables that match the real structure implied by the local OpenAI docs.

## Method

- Reviewed the three local source sets under `docs/OpenAI/`.
- Used one `gpt-5.4` high sub-agent per domain to extract candidate structured fields.
- Normalized and de-duplicated the outputs in a main-agent pass.
- Filled the main gaps the sub-agents underweighted:
  - marketing: `prioritization`, `rolloutAndMaintenance`
  - design: `reasoningLevel`
  - long horizon: `durableMemorySetup`

## Source Sets

### Marketing

- `docs/OpenAI/openai-marketing-kit/README.md`
- `docs/OpenAI/openai-marketing-kit/CHECKLIST.md`
- `docs/OpenAI/openai-marketing-kit/AGENTS.md`
- `docs/OpenAI/openai-marketing-kit/PLANS.md`
- `docs/OpenAI/openai-marketing-kit/documentation.md`

### Design

- `docs/OpenAI/design-checklist/CHECKLIST.md`
- `docs/OpenAI/design-checklist/AGENTS.md`
- `docs/OpenAI/design-checklist/PLANS.md`
- `docs/OpenAI/design-checklist/documentation.md`

### Build / Long Horizon

- `docs/OpenAI/codex_long_horizon_templates/CHECKLIST.md`
- `docs/OpenAI/codex_long_horizon_templates/AGENTS.md`
- `docs/OpenAI/codex_long_horizon_templates/docs/prompt.md`
- `docs/OpenAI/codex_long_horizon_templates/docs/plans.md`
- `docs/OpenAI/codex_long_horizon_templates/docs/implement.md`
- `docs/OpenAI/codex_long_horizon_templates/docs/documentation.md`

## Contract Conventions

- Prefer `enum`, `boolean`, and checklist editors for fixed policy or known states.
- Prefer `object` for grouped sections that should be edited together.
- Prefer `object[]` for repeatable rows like steps, risks, logs, and milestones.
- Reserve `longText` for thesis, rationale, summary, or open narrative.
- Use custom editors when the user needs structure, preview, or guided composition.

## Marketing Contract

Base record name: `marketingWorkflow`

| fieldId | type | UI affordance | Captures |
|---|---|---|---|
| `metadata` | `object` | `Card` with `Input`, `Select`, `DatePicker`, `TagInput` | Title, owner, team, status, dates, tags, related plan/agent/doc |
| `useCaseClassification` | `object` | `Combobox` + badge multi-select | Marketing category plus OpenAI primitives |
| `businessContext` | `object` | Sectioned `Textarea` card | Problem, current workflow, pain points, AI value |
| `stakeholders` | `object` | `RoleAssignmentEditor` | Primary user, secondary users, approver, SME, technical owner |
| `audienceAndOutcome` | `object` | `AudienceSegmentEditor` + `OutcomeTargetEditor` | Persona, funnel stage, region, language, business result, quality/time/adoption targets, risk tolerance |
| `prioritization` | `object` | Numeric inputs + `RadioGroup` | Impact, effort, pursue/defer/self-service/escalate |
| `workflowMap` | `object[]` | `WorkflowStepTable` | Step, primitive, owner, candidate AI support |
| `executionMode` | `object` | Checkbox card grid | Prompt/project/GPT/skill/scheduled/agent/connected workflow plus capabilities |
| `campaignBrief` | `object` | `CampaignBriefEditor` | Goal, offer, CTA, channels, dates, constraints, asset list |
| `brandVoiceRules` | `object` | `BrandVoiceRuleBuilder` | Messaging pillars, proof points, objections, lexical preferences, do-not-say, approved examples |
| `researchScope` | `object` | `ResearchScopeEditor` | Question, competitor/topic set, geography, date range, citation mode, claims-vs-evidence |
| `analysisSpec` | `object` | `MetricsAndChartSpecEditor` | Datasets, metric refs, segments, thresholds, table/chart requirements, confidence note |
| `creativeSpec` | `object` | `CreativeBriefEditor` | Asset type, mood/style, composition, aspect ratio, typography/text requirements, accessibility/legal review |
| `knowledgeAndSources` | `object` | `KnowledgeBoundaryEditor` + `SourcePolicyMatrix` | Stable knowledge vs fresh inputs vs connected systems, approved/disallowed sources, current-fact path, cutoff date |
| `outputAndApproval` | `object` | `OutputContractEditor` + `ApprovalGatesMatrix` | Deliverables, required sections, format/tone/length, citations, human review, publish/rollback path |
| `riskAndEvaluation` | `object` | `RiskRegisterTable` + `EvaluationPlanEditor` | Risk types, mitigations, baseline, test prompts, pass criteria, success metrics, sampling cadence |
| `rolloutAndMaintenance` | `object` | Phased editor + `Card` | Prototype/pilot/production plan, review cadence, update owner, refresh method, sunset criteria, changelog link |

### Highest-leverage custom editors

- `CampaignBriefEditor`
- `WorkflowStepTable`
- `KnowledgeBoundaryEditor`
- `SourcePolicyMatrix`
- `OutputContractEditor`

## Design Contract

Base record name: `designTaskContract`

| fieldId | type | UI affordance | Captures |
|---|---|---|---|
| `taskFraming` | `object` | `GoalFramingEditor` + `Select` + `RadioGroup` | Surface type, reasoning level, problem, goal, done-when |
| `audienceContext` | `object` | `AudienceJobEditor` | Audience, user, job to be done |
| `systemMode` | `enum` | `RadioGroup` | Preserve existing, extend existing, or net-new surface |
| `scopeTargets` | `object` | `TagsInput` + repeater | Routes, screens, components, out-of-scope items |
| `referenceSet` | `object[]` | `ReferenceList` | Screenshots, Figma links, mood boards, before/after refs, examples |
| `antiPatternsToAvoid` | `enum[]` | `CheckboxGroup` + freeform add-on | Generic card grid, weak brand signal, busy imagery, purposeless carousel, stacked cards, filler copy |
| `coreConstraints` | `object` | `ConstraintsEditor` | H1 rule, max sections, typeface limit, accent strategy, primary CTA, hard constraints |
| `visualThesis` | `string` | One-sentence `Textarea` | Mood, material, energy |
| `contentPlan` | `object[]` | `ContentPlanTable` | Section, purpose, headline, supporting copy, primary action, dominant visual |
| `interactionPlan` | `object[]` | `InteractionIdeasTable` | Entrance, scroll/sticky/depth, hover/reveal/layout transitions |
| `surfaceSpecificPlan` | `object` | `SurfacePlanEditor` | Landing hero composition/budget/exclusions or app workspace/nav/secondary context/card policy |
| `designSystemPlan` | `object` | `DesignSystemPlanEditor` | Tokens, typography roles, composition pattern, grid/gutters/max widths/breakpoints/density |
| `componentStrategy` | `object` | `ComponentStrategyEditor` | Reused components, new variants, justification |
| `imageryPlan` | `object` | `ImageryPlanEditor` | Role, source, visual attributes, text-safe area, failure modes |
| `copyPlan` | `object` | `CopyPlanEditor` | Tone, copy source, heading-only takeaways, content to cut |
| `verificationPlan` | `object` | `VerificationMatrix` | Desktop/mobile viewports, tools, reference comparison, checklist sections, pass/fail notes |
| `deliveryNotes` | `object` | `DeliveryNotesEditor` | Final outcome, tradeoffs, known issues, follow-ups, references, docs updated |

### Design-system sub-affordances

Inside `designSystemPlan`, use specific editors instead of a single note field:

- color tokens: `ColorPicker`
- typography roles: `Select` or font picker
- composition pattern: `Select`
- spacing, gutters, density: numeric `Input` or `Slider`
- breakpoints/max width: numeric `Input`

### Highest-leverage custom editors

- `ContentPlanTable`
- `SurfacePlanEditor`
- `DesignSystemPlanEditor`
- `VerificationMatrix`
- `ImageryPlanEditor`

## Build / Long-Horizon Contract

Base record name: `longHorizonTask`

| fieldId | type | UI affordance | Captures |
|---|---|---|---|
| `taskIdentity` | `object` | `Card` with `Input` | Initiative name and task title |
| `goalFrame` | `object` | `GoalFrameEditor` | Objective, why this matters, user-visible outcome |
| `scopeBoundary` | `object` | Two-column list editor | In-scope vs out-of-scope / non-goals |
| `durableMemorySetup` | `object` | Checklist matrix | `AGENTS.md`, `prompt.md`, `plans.md`, `implement.md`, `documentation.md`, plus ownership of each |
| `constraints` | `object` | `Accordion` | Platform/stack, performance, UX, compatibility, safety/compliance, time/token/cost |
| `contextPack` | `object` | `ContextPackPicker` | Code paths, docs, screenshots/mocks, prior decisions, repro steps |
| `deliverables` | `enum[]` | `CheckboxGroup` | Code, tests, docs, demo, migration/rollout notes |
| `successCriteria` | `object[]` | Checklist editor | Done-when statements |
| `demoPlan` | `object` | Command list + ordered smoke-test steps | Local run and demo flow |
| `setupPrerequisites` | `object` | `Accordion` | Env vars, services, seed data, bootstrap commands, network need, forbidden ops |
| `architectureIntent` | `string` | `Textarea` | Intended solution shape |
| `milestonePlan` | `object[]` | `MilestoneBoardEditor` | Outcome, tasks, acceptance criteria, validation commands, status, notes, stop-and-fix rule |
| `workIsolationPlan` | `object` | `RadioGroup` + `Textarea` | Single branch vs worktree vs separate branch, merge/handoff expectations |
| `risksAndUnknowns` | `object[]` | Risk table | Severity, mitigation, revisit trigger |
| `rollbackEscapeHatch` | `object` | `RollbackPlanEditor` | Trigger, steps, blast radius |
| `openQuestions` | `object[]` | Question log | Unresolved questions with status |
| `statusBlock` | `object` | Status card | Current milestone, overall status, last updated, done so far, next steps, blockers |
| `decisionLog` | `object[]` | `DecisionLogEditor` | Date, decision, why, tradeoffs |
| `validationLog` | `object[]` | `ValidationRunLogger` | Checkpoint, commands, result, notes, skipped reason |
| `knownIssuesFollowups` | `object[]` | Issue/follow-up list editor | Remaining issues and next follow-ups |
| `changeLog` | `object[]` | Timeline editor | Milestone, summary, files changed, validation summary, next step |

### Highest-leverage custom editors

- `MilestoneBoardEditor`
- `ValidationRunLogger`
- `DecisionLogEditor`
- `ContextPackPicker`
- `RollbackPlanEditor`

## Cross-domain implementation notes

- Use discriminated unions at the top level so the UI can switch between `marketingWorkflow`, `designTaskContract`, and `longHorizonTask`.
- Avoid defaulting to one giant markdown field. The docs imply structured capture almost everywhere.
- The most common reusable primitive set is:
  - `Input`
  - `Textarea`
  - `Select`
  - `RadioGroup`
  - `CheckboxGroup`
  - `DatePicker`
  - `Combobox`
  - `TagsInput`
  - table/repeater editors
- The main custom editors worth building first are:
  - `KnowledgeBoundaryEditor`
  - `ContentPlanTable`
  - `MilestoneBoardEditor`
  - `VerificationMatrix`
  - `SourcePolicyMatrix`

## Recommended next step

Turn this plan into:

1. a `zod` contract for the three top-level records,
2. a shared field registry for shadcn form rendering,
3. three domain-specific editor shells,
4. a small library of reusable repeater/table editors.
