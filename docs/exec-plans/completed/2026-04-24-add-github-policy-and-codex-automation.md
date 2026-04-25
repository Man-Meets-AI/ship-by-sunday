---
title: Add GitHub Policy And Codex Automation
status: complete
created_at: 2026-04-24
completed_at: 2026-04-24
summary: Add lightweight GitHub policy and Codex automation guidance so contributors and agents follow the new release model without recreating retired QA or CLI surfaces.
post_build_recap: GitHub PR and issue templates now capture target branch, proof, and release sensitivity; managed labels cover the new release model; and `.github/codex/release-policy.md` gives agents a concise GitHub-facing policy guide without changing CI/CD mechanics.
read_when:
  - Resuming the eighth child slice of the Codex release reset Program.
  - Editing GitHub PR templates, issue templates, labels, CODEOWNERS, or Codex automation prompts.
  - Checking boundaries before changing CI, CD, branch protection, tag rules, or final archive docs.
program_id: sbs-codex-release-reset
planning_brief: docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-8.md
---

# Add GitHub Policy And Codex Automation

This is a living execution plan. Keep it current as GitHub policy and Codex automation surfaces are inspected, changed, validated, and proven.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday now has a much cleaner release model: source-level CI, tag release identity, release-owned hosted proof, retired helper CLI, retired browser-smoke lane, and retired active QA control plane. The remaining GitHub-facing policy surfaces still need to teach that model so a maintainer, contributor, or Codex/GitHub agent does not reopen the old operating model by accident. After this plan is implemented, a pull request, issue, label set, and Codex policy prompt should route work toward `dev`, release PRs toward `main`, hotfixes from `main`, protected release tags through `release.json`, and proof through source tests plus release-owned hosted proof commands.

This is not a CI/CD rewrite. The observable outcome is small and concrete: `.github/` policy files and agent guidance describe the current model accurately, stale QA/CLI/browser-smoke policy references are absent, and validation proves the templates and workflow YAML are syntactically sound.

## Progress

- [x] 2026-04-24 EDT: Created this child ExecPlan from `docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-8.md`.
- [x] 2026-04-24 EDT: Read `AGENTS.md`, `docs/exec-plans/PLANS.md`, `planning-brief-8.md`, current `.github/` surfaces, and release docs references before freezing the plan.
- [x] 2026-04-24 EDT: Updated `.github/pull_request_template.md` to ask for target branch type, proof, release sensitivity, and base-branch alignment.
- [x] 2026-04-24 EDT: Updated bug and feature issue forms to capture auth, entitlement, billing, release/deploy, generated starter, and release-sensitivity information.
- [x] 2026-04-24 EDT: Extended `.github/workflows/issue-labels.yml` with a small managed label set for `auth`, `billing`, `docs`, `infrastructure`, and `release`.
- [x] 2026-04-24 EDT: Added `.github/codex/release-policy.md` as the Codex-facing GitHub policy guide.
- [x] 2026-04-24 EDT: Validated GitHub YAML, active stale-reference grep, markdown lint, plan lint, Program lint, and diff hygiene.

## Surprises & Discoveries

Initial inventory found that the repo already has GitHub issue templates at `.github/ISSUE_TEMPLATE/bug_report.yml` and `.github/ISSUE_TEMPLATE/feature_request.yml`, a short `.github/pull_request_template.md`, and a label sync workflow at `.github/workflows/issue-labels.yml`. There is no checked-in `CODEOWNERS`, `.github/codex/**`, `.github/copilot-instructions.md`, labeler config, stale workflow, or issue dedupe workflow in the current `.github/` tree.

The existing issue-label sync workflow is intentionally narrow. It manages only `bug`, `enhancement`, and `needs-triage`. That is a good default for this slice because broad automatic labeling would become another hidden control plane. If this plan adds labels, they should be few, stable, and directly tied to the new release workflow.

The current pull request template is too generic for the new branch model. It asks what changed and why, plus UI screenshots, but it does not distinguish feature PRs into `dev`, release PRs into `main`, hotfixes from `main`, or the proof surface expected for release-sensitive changes.

Validation found that `docs/release-workflow.md` still contains two historical `browser-smoke` mentions. They describe stale external contexts and cleanup instructions, not active policy. The active `.github`, `AGENTS.md`, and `README.md` stale-reference grep is clean.

Markdown lint accepts the ExecPlan and silently ignores `.github` Markdown files that are outside the metadata-backed docs families. That is acceptable for this slice because the GitHub files are validated by YAML parsing where applicable and by diff hygiene.

## Decision Log

Decision: Keep Plan 8 descriptive and low-risk instead of changing workflow mechanics.
Rationale: Earlier child plans already changed CI, release workflows, helper CLI, browser proof, and QA proof. Plan 8 should make GitHub policy explain those surfaces, not move them again.
Date: 2026-04-24

Decision: Do not add broad labeler, stale issue, auto-close, or merge automation in this slice.
Rationale: The Program explicitly warns against creating another control plane. Transparent templates and minimal labels are easier to audit than hidden automation.
Date: 2026-04-24

Decision: Treat CODEOWNERS as optional, not assumed.
Rationale: A CODEOWNERS file is useful only if ownership can be truthful and low-maintenance. A vague catch-all owner would add noise without improving release safety.
Date: 2026-04-24

Decision: Do not add CODEOWNERS in this slice.
Rationale: The current repo does not have a small, truthful ownership map distinct from the existing branch and review workflow. The PR template and Codex policy guidance cover the needed behavior without creating fake ownership.
Date: 2026-04-24

## Outcomes & Retrospective

This plan is complete. It added lightweight GitHub policy and Codex guidance without changing CI/CD mechanics or live GitHub repository policy.

Changed files:

- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/workflows/issue-labels.yml`
- `.github/codex/release-policy.md`

The PR template now asks contributors to name whether the PR is a feature PR into `dev`, a release PR from `dev` into `main`, or a hotfix from `main`; list focused proof; and call out release-sensitive areas. Issue forms now capture release sensitivity before triage. Managed labels remain small and descriptive. Codex-facing guidance now tells agents to use the current release model, source tests, and release-owned proof commands, while avoiding live GitHub policy mutation unless explicitly requested.

No CODEOWNERS file was added because no truthful low-maintenance ownership map exists yet. No live GitHub settings, branch protection, tag rulesets, or CI/CD workflows were mutated.

## Context and Orientation

The GitHub policy surface in this repo is intentionally small. `.github/pull_request_template.md` is the text every PR author sees. `.github/ISSUE_TEMPLATE/bug_report.yml` and `.github/ISSUE_TEMPLATE/feature_request.yml` define structured GitHub issue forms. `.github/workflows/issue-labels.yml` creates or updates the small managed label set. The release and branch model is documented in `docs/release-workflow.md`, while `AGENTS.md` defines local contributor rules and the default multi-agent PR review prompt.

The current release model is this: feature branches target `dev`; reviewed `dev` release candidates promote to `main`; P0/P1 hotfixes branch from `main` and then reconcile back to `dev`; stable releases are tagged as `vMAJOR.MINOR.PATCH` according to `release.json`; source CI required contexts are `static` and `integration`; hosted release proof lives in `Dev Staging Proof`, `Production Release Proof`, `Convex Production Deploy`, and `Tag Release`; release-owned proof commands are `bun run release:proof -- --proof=default_ship` and `QA_ALLOW_BILLING_INTEGRATION=1 bun run release:proof -- --proof=billing_integration`.

GitHub live branch protection and tag rules are outside this plan's write scope. Earlier research found visible repository rulesets empty and documented branch-protection cleanup commands in `docs/release-workflow.md`, but this plan must not run mutating `gh api` commands. It may read local files and, if needed, inspect remote policy read-only.

### In Scope

In scope is updating `.github/pull_request_template.md` so PR authors choose the right base branch and list proof in the language of the current release model. In scope is updating the bug and feature issue templates so issue intake can capture affected area, environment, release sensitivity, and whether the issue touches billing, auth, entitlement, release, or deployment. In scope is updating `.github/workflows/issue-labels.yml` only to add a minimal set of stable labels that match the templates and release model. In scope is adding a small `.github/codex/` prompt or policy file if it gives Codex/GitHub agents a single source for branch, PR, proof, and release behavior.

In scope is documenting CODEOWNERS as deliberately absent if inspection shows no maintainable ownership map. If a minimal CODEOWNERS file is added, it must be narrow, truthful, and backed by the smallest available syntax proof.

### Out Of Scope

Out of scope is changing `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `.github/workflows/convex-production-deploy.yml`, release scripts, release evidence schemas, `release.json`, live branch protection, live tag rulesets, or GitHub repository settings.

Out of scope is adding broad automatic issue triage, stale issue closure, PR auto-merge, labeler path routing, release publication bots, security policy enforcement, or CODEOWNERS that assigns the whole repo to a vague owner. Out of scope is final docs/archive cleanup; that belongs to Plan 9. Out of scope is reopening the retired QA control plane, helper CLI, or browser-smoke lane.

## Plan of Work

Start by freezing the local inventory. Read `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/bug_report.yml`, `.github/ISSUE_TEMPLATE/feature_request.yml`, `.github/workflows/issue-labels.yml`, `docs/release-workflow.md`, and `AGENTS.md`. Search `.github/`, active docs, and release docs for stale QA, CLI, and browser-smoke policy references. Record whether CODEOWNERS or Codex prompt files already exist.

Then update the PR template. The template should make authors state the target branch type: feature branch to `dev`, release PR `dev -> main`, or hotfix from `main`. It should ask for scope, proof, release sensitivity, and any hosted proof expectation. It should not contain a long duplicate release checklist; instead it should point to `docs/release-workflow.md` for release details.

Then update issue intake and labels. Add only labels that are stable and useful for triage, such as release, billing, auth, docs, and infrastructure, if they match issue form options. Keep `needs-triage`. Issue forms should ask whether a report touches checkout, auth, entitlement, release/deploy, docs, or app behavior without forcing users to know internal system names.

Then add Codex automation guidance if the repo lacks it. Prefer a short `.github/codex/release-policy.md` file that states branch targets, proof commands, review posture, and forbidden actions. The file should tell Codex agents to avoid mutating live GitHub policy unless explicitly asked, and to use release-owned proof commands rather than retired QA or CLI commands.

Finally validate the policy surfaces. Parse YAML, grep for stale retired-policy references, run markdown lint where applicable, run Program and plan lint, and run diff hygiene. If no CODEOWNERS is added, record that decision in the plan.

## Milestones

Milestone 1 maps the policy surface. At the end, this plan records the existing templates, label workflow, absent or present CODEOWNERS, absent or present Codex prompt files, and any stale release-model references. Success means the implementation edits are clearly bounded.

Milestone 2 updates human GitHub intake. At the end, the PR and issue templates ask for branch target, scope, proof, release sensitivity, and affected area in terms that match the current model. Success means a contributor can fill them out without seeing retired QA, helper CLI, or browser-smoke references.

Milestone 3 updates minimal machine-managed labels. At the end, `issue-labels.yml` creates only the labels that the issue forms and release model actually use. Success means the YAML parses and the managed set remains small.

Milestone 4 adds Codex-facing policy guidance if needed. At the end, `.github/codex/` or equivalent GitHub agent guidance explains the current branch, proof, review, and release boundaries. Success means a coding agent can read one file before GitHub-facing work and avoid retired surfaces.

Milestone 5 validates and closes the plan. At the end, YAML parsing, stale-reference grep, markdown lint, plan lint, Program lint, and diff hygiene pass, and this ExecPlan records the outcome.

## Concrete Steps

1. Confirm the current Program pointer and repo state:

       cd /Users/parkerrex/Developer/ship-by-sunday
       test "$(cat docs/programs/completed/2026-04-24-sbs-codex-release-reset/current-planning-brief.txt)" = "planning-brief-8.md"
       git status --short --branch

   Expect a large dirty tree from prior Program slices. Do not revert unrelated changes.

2. Inventory current GitHub policy surfaces:

       find .github -maxdepth 3 -type f | sort
       find .github -maxdepth 2 \( -name 'CODEOWNERS' -o -name '*codex*' -o -name '*copilot*' -o -name 'labeler.yml' -o -name 'labels.yml' \) -print
       sed -n '1,220p' .github/pull_request_template.md
       sed -n '1,220p' .github/ISSUE_TEMPLATE/bug_report.yml
       sed -n '1,220p' .github/ISSUE_TEMPLATE/feature_request.yml
       sed -n '1,180p' .github/workflows/issue-labels.yml

   Expected observation in the starting tree: PR template, bug report template, feature request template, and issue-labels workflow exist; CODEOWNERS and Codex prompt files do not.

3. Run the stale policy grep before edits:

       rg -n "qa:|qa/|qa_control_plane|browser-smoke|helper CLI|ship-by-sunday-cli|sbs:|bin/sbs|qa-team" .github AGENTS.md README.md --glob '!docs/archive/**' --glob '!docs/codex/**'
       rg -n "qa:|qa/|qa_control_plane|browser-smoke|helper CLI|ship-by-sunday-cli|sbs:|bin/sbs|qa-team" docs/release-workflow.md --glob '!docs/archive/**' --glob '!docs/codex/**'

   Active GitHub policy files should not point to retired QA, CLI, or browser-smoke surfaces. Historical mentions in release docs may describe stale external contexts but must not instruct contributors to use retired commands.

4. Edit `.github/pull_request_template.md`. Include short sections for target branch, scope, proof, release sensitivity, UI evidence, and release notes. Keep it concise and avoid copying the entire release runbook.

5. Edit issue templates. Keep them valid GitHub issue forms. Add or adjust options for areas that map to the current repo, such as app, Convex, billing, release/deploy, docs, and generated starter. Add a release-sensitivity question that asks whether the issue touches auth, entitlement, checkout, billing, release, deployment, or production data.

6. Edit `.github/workflows/issue-labels.yml` only if the forms now reference additional managed labels. Keep the list small and stable. Do not add path labeler logic.

7. Add `.github/codex/release-policy.md` if no equivalent Codex/GitHub agent guidance exists. It should explain branch targets, proof commands, review expectations, and forbidden live-policy mutations. It should link to `docs/release-workflow.md` rather than duplicating the full runbook.

8. Validate YAML:

       ruby -e 'require "yaml"; Dir[".github/**/*.yml"].each { |file| YAML.load_file(file) }; puts "github yaml ok"'

   A local Ruby extension warning is acceptable if the command exits zero and prints `github yaml ok`.

9. Validate stale references and docs:

       rg -n "qa:|qa/|qa_control_plane|browser-smoke|helper CLI|ship-by-sunday-cli|sbs:|bin/sbs|qa-team" .github AGENTS.md README.md --glob '!docs/archive/**' --glob '!docs/codex/**'
       rg -n "qa:|qa/|qa_control_plane|browser-smoke|helper CLI|ship-by-sunday-cli|sbs:|bin/sbs|qa-team" docs/release-workflow.md --glob '!docs/archive/**' --glob '!docs/codex/**'
       bun run markdown:lint -- --paths .github/pull_request_template.md .github/codex docs/exec-plans/completed/2026-04-24-add-github-policy-and-codex-automation.md
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-add-github-policy-and-codex-automation.md
       bun run programs:lint
       git diff --check -- .github docs/exec-plans/completed/2026-04-24-add-github-policy-and-codex-automation.md

   If markdown lint ignores `.github` files because they are not metadata-backed docs, record that exact output and still run diff hygiene.

## Validation and Acceptance

This slice is accepted when the GitHub-facing policy surfaces tell the truth about the current release model without reintroducing retired QA, CLI, or browser-smoke proof. The PR template must distinguish feature, release, and hotfix PRs. Issue templates must capture affected area and release sensitivity. Managed labels must match the forms without becoming a broad automation layer. Any Codex guidance must point agents at source tests, release-owned proof commands, and `docs/release-workflow.md`.

The slice must not mutate remote GitHub settings, live branch protection, tag rulesets, or CI/CD workflow mechanics. If implementation discovers a live policy gap, record it as an operator follow-up rather than fixing it through remote API calls.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday` after implementation:

       ruby -e 'require "yaml"; Dir[".github/**/*.yml"].each { |file| YAML.load_file(file) }; puts "github yaml ok"'
       rg -n "qa:|qa/|qa_control_plane|browser-smoke|helper CLI|ship-by-sunday-cli|sbs:|bin/sbs|qa-team" .github AGENTS.md docs/release-workflow.md README.md --glob '!docs/archive/**' --glob '!docs/codex/**'
       bun run markdown:lint -- --paths .github/pull_request_template.md .github/codex docs/exec-plans/completed/2026-04-24-add-github-policy-and-codex-automation.md
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-add-github-policy-and-codex-automation.md
       bun run programs:lint
       git diff --check -- .github docs/exec-plans/completed/2026-04-24-add-github-policy-and-codex-automation.md

## Idempotence and Recovery

All edits in this plan are text or YAML policy files. They are safe to rerun and inspect with `git diff`. If YAML parsing fails, fix the issue form or workflow syntax before editing more files. If stale-reference grep finds a retired command in `.github/`, replace it with the current source-test or release-proof command. If the grep finds a historical note in `docs/release-workflow.md` that only describes stale external contexts, keep it only if the wording is clearly historical and not an instruction to use the retired surface.

If CODEOWNERS proves hard to make truthful, do not add it. Record the decision in this plan and leave ownership to the PR template and review prompt. If Codex guidance duplicates too much of `docs/release-workflow.md`, shorten it and link to the runbook instead.

Do not run mutating `gh api` commands in this plan. If branch protection or tag rules need live changes, record the exact read-only evidence and leave mutation for an explicit operator step or a later user request.

## Artifacts and Notes

Initial inventory:

       .github/ISSUE_TEMPLATE/bug_report.yml
       .github/ISSUE_TEMPLATE/feature_request.yml
       .github/pull_request_template.md
       .github/workflows/ci.yml
       .github/workflows/convex-production-deploy.yml
       .github/workflows/dev-staging-proof.yml
       .github/workflows/issue-labels.yml
       .github/workflows/production-release-proof.yml
       .github/workflows/release.yml
       .github/workflows/sandbox-e2e-nightly.yml

Initial absent surfaces:

       CODEOWNERS
       .github/codex/**
       .github/copilot-instructions.md
       .github/labeler.yml
       .github/labels.yml

Final validation receipts from 2026-04-24 EDT:

       ruby -e 'require "yaml"; Dir[".github/**/*.yml"].each { |file| YAML.load_file(file) }; puts "github yaml ok"': passed; Ruby printed local gem extension warnings before "github yaml ok"
       rg stale retired surfaces over .github, AGENTS.md, and README.md: passed with no matches
       rg stale retired surfaces over docs/release-workflow.md: returned the expected two historical browser-smoke references that document stale external contexts
       bun run markdown:lint -- --paths .github/pull_request_template.md .github/codex docs/exec-plans/completed/2026-04-24-add-github-policy-and-codex-automation.md: passed for the ExecPlan
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-add-github-policy-and-codex-automation.md: passed before completion move
       bun run programs:lint: passed
       git diff --check -- .github docs/exec-plans/completed/2026-04-24-add-github-policy-and-codex-automation.md: passed

## Interfaces and Dependencies

`.github/pull_request_template.md` is the human PR entrypoint. It should stay Markdown and should remain short enough that authors will actually fill it out.

`.github/ISSUE_TEMPLATE/bug_report.yml` and `.github/ISSUE_TEMPLATE/feature_request.yml` are GitHub issue form YAML files. They must remain valid GitHub issue forms with required fields only where the answer is necessary for triage.

`.github/workflows/issue-labels.yml` is the only existing label automation. It uses `actions/github-script@v7` and `issues: write` permission to create or update a managed label set. This plan may extend its label array, but must not turn it into broad issue routing.

`docs/release-workflow.md` remains the source of detailed release policy. GitHub templates and Codex prompts should link to it instead of duplicating long commands.

`AGENTS.md` remains the repo-local agent behavior contract. Plan 8 may leave it unchanged unless implementation discovers a GitHub-policy instruction that must be centralized there.
