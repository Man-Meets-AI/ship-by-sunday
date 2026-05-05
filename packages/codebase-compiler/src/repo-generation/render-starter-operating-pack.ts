import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import type { RenderedCodebaseFile } from "../codebases/render-types";
import { buildRepoGenerationManifest } from "./build-repo-generation-manifest";

type OperatingPackPaths = {
	activeExecPlanPath: string;
	activeProgramFolderPath: string;
	activeProgramPath: string;
	currentPlanningBriefPath: string;
	planningBriefPath: string;
	programId: string;
};

function formatDate(timestamp: number) {
	return new Date(timestamp).toISOString().slice(0, 10);
}

function renderProgramContract() {
	return [
		"---",
		"title: Programs",
		"summary: Customer-safe contract for durable Program packets in this generated Codebase.",
		"status: active",
		"read_when:",
		"  - Starting a multi-slice product initiative.",
		"  - Refreshing the generated Program packet.",
		"  - Checking why an ExecPlan belongs to a larger Program.",
		"---",
		"",
		"# Programs",
		"",
		"A Program is the initiative-level source of truth for product work that spans more than one ExecPlan. It records the product goal, current state, progress, decisions, child ExecPlans, next slice, risks, validation expectations, and artifacts a later agent needs to resume without chat memory.",
		"",
		"Use `docs/programs/active/` for active Programs and `docs/programs/completed/` after the initiative is finished. Do not copy private planning history from another repo into this Codebase.",
		"",
		"## Required Program Shape",
		"",
		"A Program packet should include `program.md`, one or more planning briefs, and `current-planning-brief.txt`. The active generated packet in this Codebase is intentionally small so it can grow with the product.",
		"",
		"Every `program.md` should include these sections: Purpose / Big Picture, Program Inputs, Current State, Progress, Decision Log, Slice Ledger, Next Slice, Risks and Watchpoints, Outcomes & Retrospective, Validation and Acceptance, Artifacts and Notes, and Interfaces and Dependencies.",
		"",
		"## Validation",
		"",
		"Run `bun run programs:lint` from the repo root to check the generated Program packet structure.",
	].join("\n");
}

function renderExecPlanContract() {
	return [
		"---",
		"title: ExecPlans",
		"summary: Customer-safe contract for execution plans in this generated Codebase.",
		"status: active",
		"read_when:",
		"  - Writing a new product slice plan.",
		"  - Resuming implementation from an existing plan.",
		"  - Checking whether a feature is ready to call complete.",
		"---",
		"",
		"# ExecPlans",
		"",
		"An ExecPlan is the execution-level source of truth for one bounded product slice. It should be specific enough that an agent can inspect the repo, make the change, run validation, and update the plan without relying on chat history.",
		"",
		"Keep unfinished plans under `docs/exec-plans/active/` and move completed plans to `docs/exec-plans/completed/`. Use dated filenames such as `2026-05-05-first-product-slice.md` for new plans.",
		"",
		"## Required ExecPlan Shape",
		"",
		"Every ExecPlan should include front matter with title, status, created_at, completed_at, summary, post_build_recap, and read_when. Program-linked ExecPlans should also include program_id and planning_brief.",
		"",
		"Every ExecPlan should include these sections: Purpose / Big Picture, Progress, Surprises & Discoveries, Decision Log, Outcomes & Retrospective, Context and Orientation, Plan of Work, Milestones, Concrete Steps, Validation and Acceptance, Idempotence and Recovery, Artifacts and Notes, and Interfaces and Dependencies.",
		"",
		"## Validation",
		"",
		"Run `bun run plans:lint` from the repo root to check active ExecPlans, or `bun run plans:lint -- --plan docs/exec-plans/active/<plan>.md` to check one plan.",
	].join("\n");
}

function renderProgramIndex(paths: OperatingPackPaths) {
	return [
		"# Active Programs",
		"",
		"- [`Product Operating System`](" +
			`./${paths.activeProgramFolderPath.split("/").at(-1)}/program.md` +
			")",
	].join("\n");
}

function renderCompletedIndex(title: string) {
	return [`# ${title}`, "", "No completed entries yet."].join("\n");
}

function renderExecPlanIndex(paths: OperatingPackPaths) {
	return [
		"# Active ExecPlans",
		"",
		"- [`First Product Slice`](./" +
			`${paths.activeExecPlanPath.split("/").at(-1)}` +
			")",
	].join("\n");
}

function renderPlanningBrief(
	projectDefinition: CanonicalProjectDefinition,
	paths: OperatingPackPaths,
) {
	const { facts } = projectDefinition;

	return [
		"---",
		"title: Product Operating System Planning Brief 1",
		`program_id: ${paths.programId}`,
		"brief_version: 1",
		"status: active",
		`summary: Plan the first customer-visible product slice for ${facts.product_name}.`,
		"read_when:",
		"  - Writing or refreshing the first generated ExecPlan.",
		"  - Choosing the next product slice after setup is stable.",
		"---",
		"",
		"# Product Operating System Planning Brief 1",
		"",
		"## Planning Context",
		"",
		`${facts.product_name} is a generated Codebase for ${facts.primary_user}. The current product promise is: ${facts.outcome_statement}`,
		"",
		"The generated Build Pack already contains implementation context, readiness notes, validation commands, and review guidance. This Program should use those files as source truth instead of relying on chat memory.",
		"",
		"## Next Plan Recommendation",
		"",
		"Exact next plan title: `First Product Slice`.",
		"",
		`Exact target path: \`${paths.activeExecPlanPath}\`.`,
		"",
		"Exact scope: implement the first customer-visible product slice after setup is stable. Start from product identity, homepage copy, and the smallest behavior that proves the product promise.",
		"",
		"Exact boundaries: preserve auth, billing, provider setup, generated design tokens, and protected route contracts unless the slice explicitly names them.",
		"",
		"## Success Criteria",
		"",
		"The slice succeeds when the repo has a focused implementation diff, validation evidence, updated docs where behavior changed, and a clear next recommendation.",
	].join("\n");
}

function renderProgram(
	projectDefinition: CanonicalProjectDefinition,
	paths: OperatingPackPaths,
	date: string,
) {
	const { facts } = projectDefinition;

	return [
		"---",
		`program_id: ${paths.programId}`,
		"title: Product Operating System",
		"status: active",
		`created_at: ${date}`,
		"completed_at: null",
		`summary: Coordinate product work for ${facts.product_name} across durable ExecPlans, validation, and proof.`,
		"post_build_recap: null",
		"read_when:",
		"  - Planning more than one product slice.",
		"  - Choosing the next customer-visible implementation step.",
		"  - Refreshing source truth after validation.",
		"---",
		"",
		"# Product Operating System",
		"",
		"This is a living initiative document for the generated Codebase.",
		"",
		"This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.",
		"",
		"## Purpose / Big Picture",
		"",
		`${facts.product_name} should become a real product, not just a generated starter. This Program keeps the product goal, implementation slices, proof, and next recommendation in one durable place so agents can work across sessions.`,
		"",
		"## Program Inputs",
		"",
		`The canonical product facts live in \`docs/facts/project-definition.json\`. The generated design source of truth is \`DESIGN.md\` plus \`docs/facts/design-system.json\`. The Build Pack lives under \`docs/build/\`. The current planning brief is \`${paths.planningBriefPath}\`, with \`${paths.currentPlanningBriefPath}\` pointing at it.`,
		"",
		"## Current State",
		"",
		`The repo currently contains a generated app, generated product facts, generated design guidance, starter setup skills, prompt assets, and this operating pack. The first product work should preserve setup stability while moving ${facts.product_name} toward: ${facts.success_looks_like}`,
		"",
		"## Progress",
		"",
		`- [x] ${date}: Generated the initial customer-safe Program and first ExecPlan operating pack.`,
		"- [ ] Complete the first customer-visible product slice.",
		"",
		"## Decision Log",
		"",
		"Decision: Use generated Program and ExecPlan files as the durable operating layer.",
		"Rationale: Product work should survive chat handoffs and should be validated through checked-in files and package scripts.",
		`Date: ${date}`,
		"",
		"## Slice Ledger",
		"",
		"Active child ExecPlans:",
		"",
		`- \`${paths.activeExecPlanPath}\``,
		"",
		"Completed child ExecPlans:",
		"",
		"- None yet.",
		"",
		"## Next Slice",
		"",
		`The next slice is \`${paths.activeExecPlanPath}\`. It should implement the first customer-visible product improvement after setup is stable, using the Build Pack and generated product facts as source truth.`,
		"",
		"## Risks and Watchpoints",
		"",
		"Do not rewrite auth, billing, provider setup, or generated design tokens unless a specific ExecPlan names those surfaces. Do not rely on chat memory when `docs/facts/project-definition.json`, `DESIGN.md`, and `docs/build/` already contain durable product truth.",
		"",
		"## Outcomes & Retrospective",
		"",
		"This Program is active. Fill this section after the product operating loop has proven several slices and no required next slice remains.",
		"",
		"## Validation and Acceptance",
		"",
		"Program-level work is acceptable when each completed slice has validation evidence, docs updates where behavior changed, and a next recommendation. Run `bun run agentic:check` before handoff.",
		"",
		"## Artifacts and Notes",
		"",
		"Start with `START-HERE.md`, `docs/index.md`, `docs/build/docs/readiness.md`, and `docs/build/docs/prompt.md` before editing product code.",
		"",
		"## Interfaces and Dependencies",
		"",
		"This Program depends on the generated app under `apps/web/`, product facts under `docs/facts/`, Build Pack docs under `docs/build/`, prompt assets under `docs/prompts/`, and starter skills under `.agents/skills/`.",
	].join("\n");
}

function renderFirstExecPlan(
	projectDefinition: CanonicalProjectDefinition,
	paths: OperatingPackPaths,
	date: string,
) {
	const { facts } = projectDefinition;

	return [
		"---",
		"title: First Product Slice",
		"status: active",
		`created_at: ${date}`,
		"completed_at: null",
		`summary: Implement the first customer-visible product improvement for ${facts.product_name} after generated setup is stable.`,
		"post_build_recap: null",
		`program_id: ${paths.programId}`,
		`planning_brief: ${paths.planningBriefPath}`,
		"read_when:",
		"  - Starting the first real product implementation slice.",
		"  - Replacing generated identity or homepage behavior.",
		"  - Validating the first product handoff.",
		"---",
		"",
		"# First Product Slice",
		"",
		"This is a living execution plan for the first product slice in this generated Codebase.",
		"",
		"This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.",
		"",
		"## Purpose / Big Picture",
		"",
		`${facts.product_name} needs one focused product improvement after setup is stable. The first slice should make the product feel less like a generated starter and more like the promised outcome: ${facts.outcome_statement}`,
		"",
		"## Progress",
		"",
		`- [x] ${date}: Generated this initial ExecPlan from the Codebase operating pack.`,
		"- [ ] Inspect the app, product facts, design system, and Build Pack before editing.",
		"- [ ] Implement the smallest customer-visible slice.",
		"- [ ] Run focused validation and update this plan.",
		"",
		"## Surprises & Discoveries",
		"",
		"No implementation discoveries have been recorded yet.",
		"",
		"## Decision Log",
		"",
		"Decision: Preserve setup stability while implementing the first product slice.",
		"Rationale: The generated repo already includes auth, billing, provider, and design-system contracts. The first product slice should create visible value without destabilizing setup.",
		`Date: ${date}`,
		"",
		"## Outcomes & Retrospective",
		"",
		"This plan is active. Fill this section after implementation with what changed, what validation passed, and the next recommended slice.",
		"",
		"## Context and Orientation",
		"",
		"Read `START-HERE.md`, `DESIGN.md`, `docs/facts/project-definition.json`, `docs/build/docs/readiness.md`, and `docs/build/docs/prompt.md` before editing. The main app lives under `apps/web/`.",
		"",
		"### In Scope",
		"",
		"The first slice may update product identity, homepage copy, visible product content, and docs that explain the changed behavior.",
		"",
		"### Out Of Scope",
		"",
		"Do not rewrite auth, billing, provider setup, database schema, or generated design tokens unless this plan is first revised to name those surfaces and validation commands.",
		"",
		"## Plan of Work",
		"",
		"Inspect the product facts and Build Pack, choose the smallest visible change, edit the owning files, update docs if behavior changes, and run narrow validation before broader checks.",
		"",
		"## Milestones",
		"",
		"The first milestone is source inspection. It is complete when the current app and generated product facts have been read and the exact target files are named in Progress.",
		"",
		"The second milestone is implementation. It is complete when the visible product improvement exists in the app.",
		"",
		"The third milestone is validation and handoff. It is complete when tests or checks pass, docs are current, and this plan records the outcome.",
		"",
		"## Concrete Steps",
		"",
		"Work from the repo root:",
		"",
		"    bun run agentic:check",
		"    bun run lint",
		"    bun run typecheck",
		"",
		"Add narrower commands for the files you actually edit.",
		"",
		"## Validation and Acceptance",
		"",
		"The slice is acceptable when the customer-visible change works, source truth is updated, and validation evidence is recorded in this plan.",
		"",
		"### Test Commands",
		"",
		"Run these baseline commands before completion:",
		"",
		"    bun run agentic:check",
		"    bun run lint",
		"    bun run typecheck",
		"",
		"## Idempotence and Recovery",
		"",
		"Keep edits scoped. If validation fails, fix the failing surface and rerun the narrow command before broad checks.",
		"",
		"## Artifacts and Notes",
		"",
		`The owning Program is \`${paths.activeProgramPath}\`.`,
		"",
		"## Interfaces and Dependencies",
		"",
		"This plan depends on the generated app, product facts, design system, Build Pack docs, starter skills, and package scripts in this repo.",
	].join("\n");
}

function renderProgramsLintScript() {
	return [
		"#!/usr/bin/env bun",
		"import { existsSync, readFileSync, readdirSync } from 'node:fs';",
		"import path from 'node:path';",
		"",
		"const requiredHeadings = [",
		"  '## Purpose / Big Picture',",
		"  '## Program Inputs',",
		"  '## Current State',",
		"  '## Progress',",
		"  '## Decision Log',",
		"  '## Slice Ledger',",
		"  '## Next Slice',",
		"  '## Risks and Watchpoints',",
		"  '## Outcomes & Retrospective',",
		"  '## Validation and Acceptance',",
		"  '## Artifacts and Notes',",
		"  '## Interfaces and Dependencies',",
		"];",
		"",
		"function fail(message) {",
		"  console.error(message);",
		"  process.exitCode = 1;",
		"}",
		"",
		"function assertIncludes(content, needle, filePath) {",
		"  if (!content.includes(needle)) fail(`${filePath} missing ${needle}`);",
		"}",
		"",
		"const activeRoot = path.join('docs', 'programs', 'active');",
		"if (!existsSync('docs/programs/PROGRAMS.md')) fail('Missing docs/programs/PROGRAMS.md');",
		"if (!existsSync(activeRoot)) fail('Missing docs/programs/active');",
		"",
		"for (const entry of readdirSync(activeRoot, { withFileTypes: true })) {",
		"  if (!entry.isDirectory()) continue;",
		"  const programPath = path.join(activeRoot, entry.name, 'program.md');",
		"  if (!existsSync(programPath)) {",
		"    fail(`Missing ${programPath}`);",
		"    continue;",
		"  }",
		"  const content = readFileSync(programPath, 'utf8');",
		"  for (const heading of requiredHeadings) assertIncludes(content, heading, programPath);",
		"  assertIncludes(content, 'program_id:', programPath);",
		"  assertIncludes(content, 'status: active', programPath);",
		"}",
		"",
		"if (process.exitCode) process.exit(process.exitCode);",
		"console.log('Program packet ok');",
	].join("\n");
}

function renderExecPlansLintScript() {
	return [
		"#!/usr/bin/env bun",
		"import { existsSync, readFileSync, readdirSync } from 'node:fs';",
		"import path from 'node:path';",
		"",
		"const requiredHeadings = [",
		"  '## Purpose / Big Picture',",
		"  '## Progress',",
		"  '## Surprises & Discoveries',",
		"  '## Decision Log',",
		"  '## Outcomes & Retrospective',",
		"  '## Context and Orientation',",
		"  '### In Scope',",
		"  '### Out Of Scope',",
		"  '## Plan of Work',",
		"  '## Milestones',",
		"  '## Concrete Steps',",
		"  '## Validation and Acceptance',",
		"  '### Test Commands',",
		"  '## Idempotence and Recovery',",
		"  '## Artifacts and Notes',",
		"  '## Interfaces and Dependencies',",
		"];",
		"",
		"function fail(message) {",
		"  console.error(message);",
		"  process.exitCode = 1;",
		"}",
		"",
		"function planArgs() {",
		"  const index = process.argv.indexOf('--plan');",
		"  if (index === -1) return [];",
		"  return process.argv[index + 1] ? [process.argv[index + 1]] : [];",
		"}",
		"",
		"function activePlans() {",
		"  const activeRoot = path.join('docs', 'exec-plans', 'active');",
		"  if (!existsSync(activeRoot)) return [];",
		"  return readdirSync(activeRoot, { withFileTypes: true })",
		"    .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md')",
		"    .map((entry) => path.join(activeRoot, entry.name));",
		"}",
		"",
		"function checkPlan(planPath) {",
		"  if (!existsSync(planPath)) {",
		"    fail(`Missing ${planPath}`);",
		"    return;",
		"  }",
		"  const content = readFileSync(planPath, 'utf8');",
		"  for (const heading of requiredHeadings) {",
		"    if (!content.includes(heading)) fail(`${planPath} missing ${heading}`);",
		"  }",
		"  for (const key of ['title:', 'status:', 'created_at:', 'completed_at:', 'summary:', 'post_build_recap:', 'read_when:']) {",
		"    if (!content.includes(key)) fail(`${planPath} missing ${key}`);",
		"  }",
		"}",
		"",
		"if (!existsSync('docs/exec-plans/PLANS.md')) fail('Missing docs/exec-plans/PLANS.md');",
		"const plans = planArgs().length > 0 ? planArgs() : activePlans();",
		"if (plans.length === 0) fail('No active ExecPlans found');",
		"for (const planPath of plans) checkPlan(planPath);",
		"",
		"if (process.exitCode) process.exit(process.exitCode);",
		"console.log('ExecPlans ok');",
	].join("\n");
}

export function buildOperatingPackPaths(
	projectDefinition: CanonicalProjectDefinition,
): OperatingPackPaths {
	const manifest = buildRepoGenerationManifest(projectDefinition);
	const date = formatDate(projectDefinition.createdAt);
	const programId = `${manifest.repoName}-operating-system`;
	const activeProgramFolderPath = `docs/programs/active/${date}-${programId}`;

	return {
		activeExecPlanPath: `docs/exec-plans/active/${date}-first-product-slice.md`,
		activeProgramFolderPath,
		activeProgramPath: `${activeProgramFolderPath}/program.md`,
		currentPlanningBriefPath: `${activeProgramFolderPath}/current-planning-brief.txt`,
		planningBriefPath: `${activeProgramFolderPath}/planning-brief-1.md`,
		programId,
	};
}

export function renderStarterOperatingPackFiles(
	projectDefinition: CanonicalProjectDefinition,
): RenderedCodebaseFile[] {
	const paths = buildOperatingPackPaths(projectDefinition);
	const date = formatDate(projectDefinition.createdAt);

	return [
		{
			path: "docs/programs/PROGRAMS.md",
			content: renderProgramContract(),
		},
		{
			path: "docs/programs/active/index.md",
			content: renderProgramIndex(paths),
		},
		{
			path: "docs/programs/completed/index.md",
			content: renderCompletedIndex("Completed Programs"),
		},
		{
			path: paths.currentPlanningBriefPath,
			content: "planning-brief-1.md\n",
		},
		{
			path: paths.planningBriefPath,
			content: renderPlanningBrief(projectDefinition, paths),
		},
		{
			path: paths.activeProgramPath,
			content: renderProgram(projectDefinition, paths, date),
		},
		{
			path: "docs/exec-plans/PLANS.md",
			content: renderExecPlanContract(),
		},
		{
			path: "docs/exec-plans/active/index.md",
			content: renderExecPlanIndex(paths),
		},
		{
			path: "docs/exec-plans/completed/index.md",
			content: renderCompletedIndex("Completed ExecPlans"),
		},
		{
			path: paths.activeExecPlanPath,
			content: renderFirstExecPlan(projectDefinition, paths, date),
		},
		{
			path: "scripts/agentic/check-programs.mjs",
			content: renderProgramsLintScript(),
		},
		{
			path: "scripts/agentic/check-exec-plans.mjs",
			content: renderExecPlansLintScript(),
		},
	];
}
