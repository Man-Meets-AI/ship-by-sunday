# Packet Contract And Question Map

Date: 2026-03-23
Mode: Planning only

## Product Definition

The downloadable packet is the product output.

The lesson questions are only the intake pipeline for generating that packet.

That means the governing rule is:

- if a question customizes a file in the packet, keep it
- if a question should customize a file in the packet but we do not ask it yet, add it
- if a question does not customize the packet, demote it to workflow state or ephemeral runtime
- if a question duplicates another packet fact, combine it

This is the architecture:

- `facts`: stable truths about the student’s app
- `derived docs`: generated packet files
- `workflow state`: teaching scaffolding only
- `ephemeral runtime`: local/session-only state only

## Packet Contract

My recommendation is to keep the packet literal and file-shaped, not flatten it into one mega-doc.

### Final packet tree

```text
packet/
  README.md
  facts/
    project-definition.json
  design/
    AGENTS.md
    CHECKLIST.md
    PLANS.md
    documentation.md
  marketing/
    README.md
    AGENTS.md
    CHECKLIST.md
    PLANS.md
    documentation.md
  build/
    AGENTS.md
    CHECKLIST.md
    docs/
      prompt.md
      plans.md
      implement.md
      documentation.md
  prompts/
    marketing.md
    implementation.md
    qa.md
    deploy.md
```

### Source packet files

These should be represented as literal customized files in the download:

- [docs/openai/design-checklist/AGENTS.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/design-checklist/AGENTS.md)
- [docs/openai/design-checklist/CHECKLIST.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/design-checklist/CHECKLIST.md)
- [docs/openai/design-checklist/PLANS.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/design-checklist/PLANS.md)
- [docs/openai/design-checklist/documentation.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/design-checklist/documentation.md)
- [docs/openai/openai-marketing-kit/README.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/openai-marketing-kit/README.md)
- [docs/openai/openai-marketing-kit/AGENTS.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/openai-marketing-kit/AGENTS.md)
- [docs/openai/openai-marketing-kit/CHECKLIST.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/openai-marketing-kit/CHECKLIST.md)
- [docs/openai/openai-marketing-kit/PLANS.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/openai-marketing-kit/PLANS.md)
- [docs/openai/openai-marketing-kit/documentation.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/openai-marketing-kit/documentation.md)
- [docs/openai/codex_long_horizon_templates/AGENTS.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/codex_long_horizon_templates/AGENTS.md)
- [docs/openai/codex_long_horizon_templates/CHECKLIST.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/codex_long_horizon_templates/CHECKLIST.md)
- [docs/openai/codex_long_horizon_templates/docs/prompt.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/codex_long_horizon_templates/docs/prompt.md)
- [docs/openai/codex_long_horizon_templates/docs/plans.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/codex_long_horizon_templates/docs/plans.md)
- [docs/openai/codex_long_horizon_templates/docs/implement.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/codex_long_horizon_templates/docs/implement.md)
- [docs/openai/codex_long_horizon_templates/docs/documentation.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/codex_long_horizon_templates/docs/documentation.md)

There is no reason to include `.DS_Store` files.

## File-by-File Fact Requirements

### `facts/project-definition.json`

This is the canonical source of truth the rest of the packet compiles from.

Required facts:
- `product_name`
- `product_summary`
- `primary_user`
- `problem_statement`
- `problem_context_when`
- `problem_context_where`
- `problem_trigger`
- `problem_severity`
- `problem_urgency`
- `outcome_statement`
- `success_looks_like`
- `user_benefit`
- `evidence_summary`
- `core_flow_summary`
- `screen_sequence`
- `must_have_capabilities`
- `scope_in`
- `scope_out`
- `non_goals`
- `v1_rationale`
- `visual_thesis`
- `content_plan`
- `interaction_thesis`
- `design_references`
- `design_tokens`
- `typography_direction`
- `imagery_direction`
- `layout_direction`
- `marketing_goals`
- `channel_scope`
- `brand_voice_summary`
- `approved_claims`
- `do_not_say_rules`
- `distribution_model`
- `install_destination`
- `buyer_ai_promise`
- `implementation_plan`
- `acceptance_criteria`
- `validation_plan`
- `demo_flow`
- `risks`
- `dependencies`
- `domain`
- `support_email`
- `starter_repo_github_username`

### `README.md`

Purpose:
- human-readable entry point for the packet
- explain what the app is, what is included, what to do first

Required facts:
- `product_name`
- `product_summary`
- `primary_user`
- `problem_statement`
- `outcome_statement`
- `distribution_model`
- `install_destination`
- `domain`
- starter-template reference
- packet file overview

### `design/AGENTS.md`

Purpose:
- project-specific UI rules for Codex on this app

Required facts:
- `surface_type`
- `existing_system_mode`
- `visual_thesis`
- `interaction_thesis`
- `design_tokens`
- `typography_direction`
- `imagery_direction`
- `layout_direction`

### `design/CHECKLIST.md`

Purpose:
- design quality gate customized to the product

Required facts:
- `surface_type`
- `visual_thesis`
- `content_plan`
- `interaction_thesis`
- `design_references`
- `design_tokens`
- `layout_direction`
- `imagery_direction`
- `acceptance_criteria`

### `design/PLANS.md`

Purpose:
- concrete design-task plan customized to the app

Required facts:
- `surface_type`
- `primary_user`
- `job_to_be_done`
- `visual_thesis`
- `content_plan`
- `interaction_thesis`
- `design_tokens`
- `design_references`
- `acceptance_criteria`
- `verification_plan`

### `design/documentation.md`

Purpose:
- completed or in-progress design rationale packet

Required facts:
- `visual_thesis`
- `content_plan`
- `interaction_thesis`
- `design_tokens`
- `imagery_direction`
- `acceptance_criteria`
- `verification_plan`
- `tradeoffs`

### `marketing/README.md`

Purpose:
- explain what the marketing packet is for
- explain included workflows, prompts, and governance expectations

Required facts:
- `product_name`
- `product_summary`
- `primary_user`
- `problem_statement`
- `outcome_statement`
- `marketing_goals`
- `channel_scope`
- `brand_voice_summary`

### `marketing/AGENTS.md`

Purpose:
- project-specific operating rules for reusable marketing GPTs, skills, and agent workflows

Required facts:
- `brand_voice_summary`
- `approved_claims`
- `do_not_say_rules`
- `channel_scope`
- `human_review_rules`
- `current_facts_policy`

### `marketing/CHECKLIST.md`

Purpose:
- marketing capability and workflow checklist tailored to the app

Required facts:
- `marketing_goals`
- `channel_scope`
- `campaign_types`
- `research_needs`
- `content_workflows`
- `analytics_needs`
- `brand_risks`
- `review_rules`

### `marketing/PLANS.md`

Purpose:
- rollout plan for marketing AI workflows, agents, and deliverables

Required facts:
- `marketing_goals`
- `workflow_map`
- `stable_knowledge`
- `fresh_inputs`
- `output_contract`
- `approval_rules`
- `evaluation_plan`
- `impact_effort_priorities`

### `marketing/documentation.md`

Purpose:
- document the shipped marketing workflows, prompts, and governance rules

Required facts:
- `marketing_workflow_inventory`
- `stable_knowledge`
- `fresh_inputs`
- `output_contract`
- `review_rules`
- `metrics`
- `risks`
- `source_basis`

### `build/AGENTS.md`

Purpose:
- execution rules for long-horizon implementation on this exact product

Required facts:
- `objective`
- `scope_in`
- `scope_out`
- `non_goals`
- `risks`
- `dependencies`
- `validation_plan`
- `demo_flow`

### `build/CHECKLIST.md`

Purpose:
- long-horizon readiness and operating checklist

Required facts:
- `objective`
- `deliverables`
- `done_when`
- `constraints`
- `validation_plan`
- `rollback_plan`

### `build/docs/prompt.md`

Purpose:
- canonical task spec

Required facts:
- `objective`
- `why_this_matters`
- `scope_in`
- `scope_out`
- `user_visible_outcome`
- `constraints`
- `deliverables`
- `done_when`
- `validation_plan`
- `demo_flow`
- `risks`
- `open_questions`

### `build/docs/plans.md`

Purpose:
- milestone plan

Required facts:
- `implementation_plan`
- `milestones`
- `acceptance_criteria`
- `validation_commands`
- `architecture_intent`
- `risks`
- `dependencies`
- `rollback_plan`

### `build/docs/implement.md`

Purpose:
- execution runbook

Required facts:
- `milestones`
- `validation_commands`
- `stop_and_fix_rule`
- `documentation_expectations`

Most of this is derived from plan + repo rules, not directly asked.

### `build/docs/documentation.md`

Purpose:
- status log / live handoff doc

Required facts:
- `current_milestone`
- `validation_log`
- `known_issues`
- `next_step`
- `run_demo_instructions`

Mostly derived. Minimal direct asking needed.

### `prompts/marketing.md`

Purpose:
- generated prompt for marketing page / copy / style work

Required facts:
- `product_name`
- `product_summary`
- `primary_user`
- `problem_statement`
- `problem_urgency`
- `outcome_statement`
- `user_benefit`
- `visual_thesis`
- `content_plan`
- `imagery_direction`
- `marketing_brief`
- `design_references`

### `prompts/implementation.md`

Purpose:
- generated build prompt for Codex

Required facts:
- canonical project facts
- `implementation_plan`
- `next_slice`
- `acceptance_criteria`
- `validation_plan`
- `risks`
- `dependencies`
- starter-template context

### `prompts/qa.md`

Purpose:
- generated QA prompt

Required facts:
- `demo_flow`
- `success_criteria`
- `validation_plan`
- `distribution_model`
- `install_destination`
- `next_slice`

### `prompts/deploy.md`

Purpose:
- generated deploy handoff prompt

Required facts:
- `product_name`
- `domain`
- `support_email`
- `distribution_model`
- `starter_repo_github_username` if relevant
- deploy prerequisites

## Current Coverage Map

### Covered now

These already have strong live sources in the curriculum:

- `primary_user`
  - best current source: `1.4`
  - source fields: derived `selected_problem_owner`
  - refs: [ceo.ts](/Users/parkerrex/Projects/manmeetsai-workspace/features/course/lesson/model/lessons/ceo.ts)
- `problem_statement`
  - best current source: `1.4`
  - source fields: derived `selected_problem_statement`
  - refs: [ceo.ts](/Users/parkerrex/Projects/manmeetsai-workspace/features/course/lesson/model/lessons/ceo.ts)
- `problem_context_when`
- `problem_context_where`
- `problem_trigger`
- `problem_severity`
- `problem_urgency`
  - best current source: `1.4`
  - refs: [ceo.ts](/Users/parkerrex/Projects/manmeetsai-workspace/features/course/lesson/model/lessons/ceo.ts)
- `outcome_statement`
- `success_looks_like`
- `user_benefit`
  - best current source: `1.5`
  - refs: [ceo.ts](/Users/parkerrex/Projects/manmeetsai-workspace/features/course/lesson/model/lessons/ceo.ts)
- `core_flow_summary`
- `must_have_capabilities`
  - best current source: `2.1`
  - refs: [design.ts](/Users/parkerrex/Projects/manmeetsai-workspace/features/course/lesson/model/lessons/design.ts)
- `distribution_model`
- `install_destination`
- `buyer_ai_promise`
  - best current source: `3.10`
  - refs: [build.ts](/Users/parkerrex/Projects/manmeetsai-workspace/features/course/lesson/content/build.ts)

### Partial now

- `product_name` / `product_summary`
  - fragmented across `1.1`, `3.5`, `3.9`, `3.14`
  - refs: [start-here.ts](/Users/parkerrex/Projects/manmeetsai-workspace/features/course/lesson/model/lessons/start-here.ts), [build.ts](/Users/parkerrex/Projects/manmeetsai-workspace/features/course/lesson/content/build.ts)
- `evidence_summary`
  - current source: `1.6`
  - problem: too loose for packet use
- `screen_sequence`
  - current source: `2.1`
  - problem: strong enough for sequence, weak for actual screen spec
- `marketing_brief`
  - current source: `3.4` and `3.5`
  - problem: duplicated and recollected
- `implementation_plan`
  - current source: `3.7`, `3.8`, `3.10`
  - problem: fragmented across prompt controls, packet, and plan brief
- `acceptance_criteria` / `validation_plan` / `demo_flow`
  - closest source: `3.12` QA fields and `3.14` deploy success checklist
  - problem: execution evidence, not canonical planning facts
- `implementation_brief`
  - current source: `3.11`
  - problem: free text, not composed from facts + plan
- `domain`
- `support_email`
  - current source: `3.4`, `3.9`, `3.14`
  - problem: duplicated

### Missing now

These are the major packet blockers:

- `scope_in`
- `scope_out`
- `non_goals`
- `v1_rationale`
- `visual_thesis`
- `content_plan`
- `interaction_thesis`
- `design_references` in the active Design block
- `design_tokens`
- `typography_direction`
- `imagery_direction`
- `layout_direction`
- `marketing_goals`
- `channel_scope`
- `brand_voice_summary`
- `approved_claims`
- `do_not_say_rules`
- explicit `deliverables`
- explicit `done_when`
- explicit `validation_commands`
- explicit `rollback_plan`
- `open_questions`

These are directly implied by:
- [docs/openai/design-checklist/PLANS.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/design-checklist/PLANS.md)
- [docs/openai/design-checklist/CHECKLIST.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/design-checklist/CHECKLIST.md)
- [docs/openai/openai-marketing-kit/PLANS.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/openai-marketing-kit/PLANS.md)
- [docs/openai/openai-marketing-kit/CHECKLIST.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/openai-marketing-kit/CHECKLIST.md)
- [docs/openai/codex_long_horizon_templates/docs/prompt.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/codex_long_horizon_templates/docs/prompt.md)
- [docs/openai/codex_long_horizon_templates/docs/plans.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/openai/codex_long_horizon_templates/docs/plans.md)

## Keep / Combine / Add / Demote

### Keep as canonical facts

- selected user/problem from `1.4`
- problem context from `1.4`
- outcome and payoff from `1.5`
- core flow and screen sequence from `2.1`
- evidence summary from `1.6`, after normalization
- distribution / install / AI promise from `3.10`
- risks / dependencies from `3.10`
- starter-repo username from `starterRepoAccess`

### Combine

- `app_idea`
- `codex_marketing_product`
- `brand_kit_app_name`
- `deploy_handoff_product_name`

Combine into:
- `product_name`
- `product_summary`

- `build_ship_roadmap_marketing_brief` and `codex_marketing_*`

Combine into:
- one `marketing_brief`

- `fresh_template_plan_*`, `build_slices_*`, and `ux_plan_*`

Combine into:
- one `implementation_plan`

- all duplicated domain fields

Combine into:
- one `domain`

### Add

Add as explicit new fact questions:

- visual thesis
- content plan
- interaction thesis
- design references
- design-token plan
- typography direction
- imagery direction
- scope in
- scope out
- non-goals
- why this v1 is enough
- deliverables
- done-when
- validation / demo flow
- acceptance criteria
- rollback / escape hatch

### Demote out of the packet model

Workflow-only:
- lesson checklists
- setup checklists
- copied-prompt checklists
- onboarding checklists
- deploy steps checklists

Ephemeral:
- deploy secrets
- QA current-step fields
- browser-running toggle

## Best Lesson Placement

If the packet is supposed to become high-quality as early as possible, the clean lesson placement is:

- `1.1`: canonical product name + summary
- `1.4`: canonical user/problem
- `1.5`: outcome + success + payoff
- `1.6`: evidence summary
- `2.1`: core flow + screen sequence + must-haves
- `2.2`: scope boundary + design references + visual direction + design tokens
- `3.10`: implementation plan + acceptance + validation + demo flow + rollback
- `3.11`: optional refinement assets and implementation-brief polish

That placement keeps:
- design facts in Design
- long-horizon planning facts in late Build
- workflow state out of the packet

## Unlock Recommendation

Current repo:
- earliest plausible draft packet unlock: after `3.11`

Target repo:
- design packet can unlock after `2.2`
- full design + long-horizon + prompt packet can unlock after `3.10`
- `3.11` becomes optional refinement, not the first moment the packet is even possible

## Final Rule

The packet should drive the question set.

Not the other way around.

If a question does not customize:
- `README.md`
- `facts/project-definition.json`
- any file under `design/`
- any file under `build/`
- or a file under `prompts/`

then it is not packet data.

It is:
- workflow scaffolding
- ephemeral runtime
- or waste."}}
