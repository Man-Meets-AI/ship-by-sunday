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

The live packet contract is the canonical schema in `packages/packet-compiler/src/canonical-project-definition/schema.ts`, the stage grouping in `packages/packet-compiler/src/stages/stage-definitions.ts`, and the current renderers under `packages/packet-compiler/src/packets/`. Older planning variants that mentioned `starter_repo_github_username`, `implementation_plan`, `verification_plan`, `validation_commands`, `rollback_plan`, or custom prompt-pack files are historical notes, not active contract.

### Final generated docs tree inside the starter snapshot

```text
docs/
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
    execplan-execution-loop.md
    execplan-grill.md
    execplan-writer.md
```

The earlier generated `prompts/marketing.md`, `prompts/implementation.md`, `prompts/qa.md`, and `prompts/deploy.md` pack is deprecated. The shipped starter repo now carries the static ExecPlan prompt assets under `docs/prompts/`.

### Source packet files

These should be represented as literal customized files in the download:

- [docs/ship-by-sunday/design-pack/AGENTS.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/ship-by-sunday/design-pack/AGENTS.md)
- [docs/ship-by-sunday/design-pack/CHECKLIST.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/ship-by-sunday/design-pack/CHECKLIST.md)
- [docs/ship-by-sunday/design-pack/PLANS.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/ship-by-sunday/design-pack/PLANS.md)
- [docs/ship-by-sunday/design-pack/documentation.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/ship-by-sunday/design-pack/documentation.md)
- [docs/ship-by-sunday/marketing-pack/README.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/ship-by-sunday/marketing-pack/README.md)
- [docs/ship-by-sunday/marketing-pack/AGENTS.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/ship-by-sunday/marketing-pack/AGENTS.md)
- [docs/ship-by-sunday/marketing-pack/CHECKLIST.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/ship-by-sunday/marketing-pack/CHECKLIST.md)
- [docs/ship-by-sunday/marketing-pack/PLANS.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/ship-by-sunday/marketing-pack/PLANS.md)
- [docs/ship-by-sunday/marketing-pack/documentation.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/ship-by-sunday/marketing-pack/documentation.md)
- [docs/ship-by-sunday/build-pack/AGENTS.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/ship-by-sunday/build-pack/AGENTS.md)
- [docs/ship-by-sunday/build-pack/CHECKLIST.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/ship-by-sunday/build-pack/CHECKLIST.md)
- [docs/ship-by-sunday/build-pack/docs/prompt.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/ship-by-sunday/build-pack/docs/prompt.md)
- [docs/ship-by-sunday/build-pack/docs/plans.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/ship-by-sunday/build-pack/docs/plans.md)
- [docs/ship-by-sunday/build-pack/docs/implement.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/ship-by-sunday/build-pack/docs/implement.md)
- [docs/ship-by-sunday/build-pack/docs/documentation.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/ship-by-sunday/build-pack/docs/documentation.md)
- [docs/prompts/execplan-execution-loop.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/prompts/execplan-execution-loop.md)
- [docs/prompts/execplan-grill.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/prompts/execplan-grill.md)
- [docs/prompts/execplan-writer.md](/Users/parkerrex/Projects/manmeetsai-workspace/docs/prompts/execplan-writer.md)

The OpenAI baseline packs still live under `docs/openai/` as source templates, but the generated customer packet should now be customized from the Ship by Sunday pack layers under `docs/ship-by-sunday/`.

There is no reason to include `.DS_Store` files.

## File-by-File Fact Requirements

### `facts/project-definition.json`

This is the canonical source of truth the rest of the packet compiles from.

The CLI v1 should collect these schema-backed facts.

Product:
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
- `why_this_matters`
- `core_flow_summary`
- `scope_in`
- `scope_out`
- `non_goals`
- `v1_rationale`

Design:
- `screen_sequence`
- `must_have_capabilities`
- `surface_type`
- `design_references`
- `visual_thesis`
- `content_plan`
- `interaction_thesis`
- `design_tokens`
- `typography_direction`
- `imagery_direction`
- `layout_direction`
- `brand_assets`
- `existing_system_mode`
- `hero_goal`
- `primary_cta`
- `proof_strategy`
- `objections`
- `section_narrative`
- `copy_tone`

Marketing:
- `marketing_goals`
- `channel_scope`
- `campaign_types`
- `brand_voice_summary`
- `approved_claims`
- `do_not_say_rules`
- `workflow_map`
- `research_scope`
- `research_needs`
- `content_workflows`
- `analytics_needs`
- `proof_sources`
- `creative_spec`

Build Plan:
- `objective`
- `user_visible_outcome`
- `distribution_model`
- `install_destination`
- `buyer_ai_promise`
- `constraints`
- `deliverables`
- `done_when`
- `acceptance_criteria`
- `validation_plan`
- `demo_flow`
- `risks`
- `dependencies`
- `open_questions`
- `selected_next_slice`
- `pricing_model`
- `price_usd_cents`
- `price_display`
- `currency`

Placeholder-friendly optionals:
- `domain`
- `support_email`

`surface_type` defaults to `web_app` when omitted. `domain` and `support_email` remain optional placeholders and must not block repo generation.

### `README.md`

Purpose:
- human-readable entry point for the generated repo
- explain what the app is, what is included, and what to do first

Primary fact inputs:
- `product_name`
- `product_summary`
- `primary_user`
- `problem_statement`
- `outcome_statement`
- `distribution_model`
- `install_destination`

### `design/AGENTS.md`

Purpose:
- project-specific UI rules for Codex on this app

Primary fact inputs:
- `surface_type` when explicitly set, otherwise the default `web_app`
- `screen_sequence`
- `must_have_capabilities`
- `visual_thesis`
- `interaction_thesis`
- `existing_system_mode`

### `design/CHECKLIST.md`

Purpose:
- design quality gate customized to the product

Primary fact inputs:
- `surface_type` when explicitly set, otherwise the default `web_app`
- `visual_thesis`
- `content_plan`
- `interaction_thesis`
- `design_references`
- `proof_strategy`

### `design/PLANS.md`

Purpose:
- concrete design-task plan customized to the app

Primary fact inputs:
- `primary_user`
- `screen_sequence`
- `must_have_capabilities`
- `visual_thesis`
- `design_references`
- `scope_in`
- `non_goals`

### `design/documentation.md`

Purpose:
- completed or in-progress design rationale packet

Primary fact inputs:
- `visual_thesis`
- `design_tokens`
- `typography_direction`
- `imagery_direction`
- `layout_direction`
- `copy_tone`

### `marketing/README.md`

Purpose:
- explain what the marketing packet is for
- explain the included workflows and governance expectations

Primary fact inputs:
- `product_name`
- `product_summary`
- `marketing_goals`
- `channel_scope`
- `brand_voice_summary`

### `marketing/AGENTS.md`

Purpose:
- project-specific operating rules for reusable marketing GPTs, skills, and agent workflows

Primary fact inputs:
- `approved_claims`
- `do_not_say_rules`
- `channel_scope`

### `marketing/CHECKLIST.md`

Purpose:
- marketing capability and workflow checklist tailored to the app

Primary fact inputs:
- `workflow_map`
- `research_needs`

### `marketing/PLANS.md`

Purpose:
- rollout plan for marketing AI workflows and deliverables

Primary fact inputs:
- `content_workflows`
- `proof_sources`

### `marketing/documentation.md`

Purpose:
- document the shipped marketing workflows, prompts, and governance rules

Primary fact inputs:
- `creative_spec`
- `analytics_needs`

### `build/AGENTS.md`

Purpose:
- execution rules for long-horizon implementation on this exact product

Primary fact inputs:
- `objective`
- `user_visible_outcome`
- `deliverables`
- `acceptance_criteria`

### `build/CHECKLIST.md`

Purpose:
- long-horizon readiness and operating checklist

Primary fact inputs:
- `constraints`

### `build/docs/prompt.md`

Purpose:
- canonical task spec

Primary fact inputs:
- `validation_plan`

### `build/docs/plans.md`

Purpose:
- milestone plan

Primary fact inputs:
- `risks`
- `dependencies`

### `build/docs/implement.md`

Purpose:
- execution runbook

Primary fact inputs:
- `demo_flow`
- `selected_next_slice`

### `build/docs/documentation.md`

Purpose:
- status log / live handoff doc

Primary fact inputs:
- `open_questions`

### `prompts/execplan-execution-loop.md`

Purpose:
- shipped execution-loop prompt asset copied into the generated repo

Input:
- static file from `docs/prompts/execplan-execution-loop.md`

### `prompts/execplan-grill.md`

Purpose:
- shipped grill prompt asset copied into the generated repo

Input:
- static file from `docs/prompts/execplan-grill.md`

### `prompts/execplan-writer.md`

Purpose:
- shipped writer prompt asset copied into the generated repo

Input:
- static file from `docs/prompts/execplan-writer.md`

The earlier generated `prompts/marketing.md`, `prompts/implementation.md`, `prompts/qa.md`, and `prompts/deploy.md` pack is not part of the live packet contract anymore.

## Live Question Map

The CLI should reuse the live stage definitions in `packages/packet-compiler/src/stages/stage-definitions.ts`.

### Product

Foundation:
- `product_name`
- `product_summary`
- `primary_user`
- `why_this_matters`

Problem:
- `problem_statement`
- `problem_context_when`
- `problem_context_where`
- `problem_trigger`
- `problem_severity`
- `problem_urgency`

Outcome:
- `outcome_statement`
- `success_looks_like`
- `user_benefit`
- `evidence_summary`
- `core_flow_summary`

Scope:
- `scope_in`
- `scope_out`
- `non_goals`
- `v1_rationale`

### Design

Flow:
- `screen_sequence`
- `must_have_capabilities`
- `surface_type`

References:
- `design_references`
- `brand_assets`
- `existing_system_mode`

Direction:
- `visual_thesis`
- `content_plan`
- `interaction_thesis`
- `hero_goal`
- `primary_cta`
- `proof_strategy`
- `objections`
- `section_narrative`
- `copy_tone`

System:
- `design_tokens`
- `typography_direction`
- `imagery_direction`
- `layout_direction`

### Marketing

Operating System:
- `marketing_goals`
- `channel_scope`
- `campaign_types`
- `brand_voice_summary`
- `approved_claims`
- `do_not_say_rules`
- `proof_sources`
- `workflow_map`
- `research_scope`
- `research_needs`
- `content_workflows`
- `analytics_needs`
- `creative_spec`

### Build Plan

Delivery:
- `objective`
- `user_visible_outcome`
- `distribution_model`
- `install_destination`
- `buyer_ai_promise`
- `pricing_model`
- `price_usd_cents`
- `price_display`
- `currency`
- `domain`
- `support_email`

Plan:
- `constraints`
- `deliverables`
- `risks`
- `dependencies`
- `open_questions`
- `selected_next_slice`

Validation:
- `done_when`
- `acceptance_criteria`
- `validation_plan`
- `demo_flow`

### Review

Review adds no new canonical facts. It derives readiness from the Product, Design, Marketing, and Build Plan answers through `evaluatePacketReadiness()`.
