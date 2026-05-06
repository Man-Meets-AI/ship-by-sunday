import {
	DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS,
	DOCS_SPINE_ADOPTION_WORKFLOW_ID,
	DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
} from "./manifest";
import {
	DOCS_SPINE_APPLY_WORKFLOW_ID,
	DOCS_SPINE_APPLY_WORKFLOW_VERSION,
} from "../docs-spine-apply-and-proof/manifest";
import type { DocsSpineRepoFacts } from "./schemas";

const REQUIRED_PROGRAM_PROMPT_REFS = [
	"docs/prompts/program-orchestrator.md",
	"docs/prompts/program-initialize.md",
	"docs/prompts/program-funnel.md",
	"docs/prompts/program-research-passes.md",
	"docs/prompts/program-normalize-pass.md",
	"docs/prompts/program-converged-decision-packet.md",
	"docs/prompts/program-dependency-graph.md",
	"docs/prompts/program-plan-split-recommendation.md",
	"docs/prompts/program-cross-repo-review.md",
	"docs/prompts/program-planning-brief.md",
	"docs/prompts/program-doc-synthesis.md",
	"docs/prompts/program-loop.md",
	"docs/prompts/program-docs-sync.md",
	"docs/prompts/program-planning-refresh.md",
	"docs/prompts/program-completion-review.md",
] as const;

const REQUIRED_EXEC_PLAN_PROMPT_REFS = [
	"docs/prompts/exec-plan-writer.md",
	"docs/prompts/exec-plan-grill.md",
	"docs/prompts/exec-plan-execute.md",
	"docs/prompts/exec-plan-validate.md",
] as const;

const REQUIRED_PROMPT_REFS = [
	"docs/prompts/program-create.md",
	...REQUIRED_PROGRAM_PROMPT_REFS,
	...REQUIRED_EXEC_PLAN_PROMPT_REFS,
] as const;

export type DocsSpineQualitySeverity = "error" | "warning";

export type DocsSpineQualityRuleResult = {
	ruleId: string;
	severity: DocsSpineQualitySeverity;
	status: "passed" | "failed";
	path: string;
	message: string;
	remediation: string;
};

export type DocsSpineQualityReport = {
	schemaVersion: "docs-spine-quality-report.v1";
	workflowId:
		| typeof DOCS_SPINE_ADOPTION_WORKFLOW_ID
		| typeof DOCS_SPINE_APPLY_WORKFLOW_ID;
	workflowVersion:
		| typeof DOCS_SPINE_ADOPTION_WORKFLOW_VERSION
		| typeof DOCS_SPINE_APPLY_WORKFLOW_VERSION;
	status: "passed" | "failed";
	score: number;
	passingScore: number;
	sourceArtifactRefs: string[];
	ruleResults: DocsSpineQualityRuleResult[];
	createdAt: number;
};

type DraftArtifact = {
	repoRelativePath: string;
	value: unknown;
};

export type DocsSpineMarkdownFile = {
	targetRef: string;
	markdown: string;
	sourceArtifactRef: string;
};

export function buildDocsSpineDraftQualityReport({
	draftArtifacts,
	repoFacts,
	now,
}: {
	draftArtifacts: DraftArtifact[];
	repoFacts: DocsSpineRepoFacts;
	now: number;
}): DocsSpineQualityReport {
	const draftRuleResults = draftArtifacts.flatMap((artifact) =>
		evaluateDraftArtifact(artifact),
	);
	const proposedFiles = draftArtifacts.flatMap((artifact) =>
		extractDraftMarkdownFiles(artifact.value, artifact.repoRelativePath),
	);
	return buildQualityReport({
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		workflowVersion: DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
		now,
		sourceArtifactRefs: [
			DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.repoFacts,
			...draftArtifacts.map((artifact) => artifact.repoRelativePath),
		],
		ruleResults: [
			...draftRuleResults,
			...evaluateDocsSpineMarkdownFiles({
				files: proposedFiles,
				repoFacts,
				now,
			}),
			...evaluateNativeGateDiscovery({
				repoFacts,
				files: proposedFiles,
			}),
		],
	});
}

export function buildDocsSpineApplyQualityReport({
	files,
	repoFacts,
	now,
}: {
	files: DocsSpineMarkdownFile[];
	repoFacts?: DocsSpineRepoFacts;
	now: number;
}): DocsSpineQualityReport {
	return buildQualityReport({
		workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
		workflowVersion: DOCS_SPINE_APPLY_WORKFLOW_VERSION,
		now,
		sourceArtifactRefs: files.map((file) => file.sourceArtifactRef),
		ruleResults: [
			...evaluateDocsSpineMarkdownFiles({ files, repoFacts, now }),
			...evaluateNativeGateDiscovery({ repoFacts, files }),
		],
	});
}

export function summarizeFailedQualityRules(report: DocsSpineQualityReport) {
	return report.ruleResults
		.filter((rule) => rule.status === "failed" && rule.severity === "error")
		.map((rule) => `${rule.path}: ${rule.ruleId}: ${rule.message}`);
}

function evaluateDraftArtifact(
	artifact: DraftArtifact,
): DocsSpineQualityRuleResult[] {
	const draft = toRecord(artifact.value);
	if (!draft) {
		return [
			failedRule({
				ruleId: "draft.valid-json-object",
				path: artifact.repoRelativePath,
				message: "Draft artifact is not a JSON object.",
				remediation: "Write draft artifacts as structured JSON objects.",
			}),
		];
	}
	const proposedFiles = Array.isArray(draft.proposedFiles)
		? draft.proposedFiles
		: [];
	const blockedReasons = readStringArray(draft.blockedReasons);
	const status = typeof draft.status === "string" ? draft.status : "";
	if (
		proposedFiles.length > 0 &&
		(status.startsWith("blocked") || blockedReasons.length > 0)
	) {
		return [
			failedRule({
				ruleId: "draft.blocked-proposed-files",
				path: artifact.repoRelativePath,
				message:
					"Blocked docs-spine drafts must not include apply-ready proposedFiles.",
				remediation:
					"Remove proposedFiles until the blocked reasons are resolved, or mark the draft ready only after evidence-backed synthesis passes.",
			}),
		];
	}
	return [
		passedRule({
			ruleId: "draft.blocked-proposed-files",
			path: artifact.repoRelativePath,
			message: "Draft blocked state is consistent with apply readiness.",
			remediation: "No action required.",
		}),
	];
}

function evaluateDocsSpineMarkdownFiles({
	files,
	repoFacts,
	now,
}: {
	files: DocsSpineMarkdownFile[];
	repoFacts?: DocsSpineRepoFacts;
	now?: number;
}): DocsSpineQualityRuleResult[] {
	const results: DocsSpineQualityRuleResult[] = [];
	const createdAtDate =
		typeof now === "number" ? new Date(now).toISOString().slice(0, 10) : null;
	for (const file of files) {
		if (file.targetRef.endsWith(".md")) {
			results.push(...evaluateCommonMarkdownRules(file, createdAtDate));
		}
		if (file.targetRef === "docs/index.md") {
			results.push(...evaluateDocsIndex(file, repoFacts));
		} else if (file.targetRef === "docs/QUALITY_SCORE.md") {
			results.push(...evaluateQualityScore(file));
		} else if (file.targetRef === "docs/programs/PROGRAMS.md") {
			results.push(...evaluateProgramContract(file));
		} else if (
			file.targetRef.startsWith("docs/programs/active/") &&
			file.targetRef.endsWith("/program.md")
		) {
			results.push(...evaluateActiveProgram(file));
		} else if (
			/^docs\/programs\/(?:active|completed)\/\d{4}-\d{2}-\d{2}-[^/]+\/planning-brief-\d+\.md$/.test(
				file.targetRef,
			)
		) {
			results.push(...evaluatePlanningBrief(file));
		} else if (
			/^docs\/programs\/(?:active|completed)\/\d{4}-\d{2}-\d{2}-[^/]+\/current-planning-brief\.txt$/.test(
				file.targetRef,
			)
		) {
			results.push(...evaluateCurrentPlanningBriefPointer(file));
		} else if (file.targetRef === "docs/exec-plans/PLANS.md") {
			results.push(...evaluateExecPlanContract(file));
		} else if (
			/^docs\/exec-plans\/active\/\d{4}-\d{2}-\d{2}-[^/]+\.md$/.test(
				file.targetRef,
			)
		) {
			results.push(...evaluateActiveExecPlan(file));
		} else if (file.targetRef === "docs/prompts/README.md") {
			results.push(...evaluatePromptsIndex(file));
		} else if (file.targetRef === "docs/prompts/program-create.md") {
			results.push(...evaluateProgramCreatePrompt(file));
		} else if (
			file.targetRef === "docs/validation.md" ||
			file.targetRef === "docs/proof.md"
		) {
			results.push(...evaluateValidationProof(file));
		}
	}
	results.push(...evaluateProgramAuthoringPromptCoverage(files));
	results.push(...evaluatePromptAssetCoverage(files));
	results.push(...evaluateProgramPacketArtifactCoverage(files));
	return results;
}

function evaluateCommonMarkdownRules(
	file: DocsSpineMarkdownFile,
	createdAtDate: string | null,
): DocsSpineQualityRuleResult[] {
	const results: DocsSpineQualityRuleResult[] = [];
	if (!/^#\s+\S+/m.test(file.markdown)) {
		results.push(
			failedRule({
				ruleId: "markdown.top-level-heading",
				path: file.targetRef,
				message: "Markdown file is missing a top-level heading.",
				remediation: "Add one H1 that names the document.",
			}),
		);
	} else {
		results.push(
			passedRule({
				ruleId: "markdown.top-level-heading",
				path: file.targetRef,
				message: "Markdown file has a top-level heading.",
				remediation: "No action required.",
			}),
		);
	}
	const hiddenNoisePattern =
		/(?:^|[\s`("'[/])(?:\.agents\/daily-audit|\.ai\/|\.claude\/|\.codex\/skills\/)/m;
	if (hiddenNoisePattern.test(file.markdown)) {
		results.push(
			failedRule({
				ruleId: "content.hidden-noise-primary-route",
				path: file.targetRef,
				message:
					"Generated docs route hidden audit, AI, Claude, or skill folders as primary guidance.",
				remediation:
					"Route canonical docs, root instructions, package manifests, CI, and app topology first; keep hidden historical artifacts out of first-hop docs.",
			}),
		);
	}
	if (SOURCE_TEST_ASSET_ROUTE_PATTERN.test(file.markdown)) {
		results.push(
			failedRule({
				ruleId: "content.source-test-asset-primary-route",
				path: file.targetRef,
				message:
					"Generated docs route source, test, public, static, or asset files as docs-spine guidance.",
				remediation:
					"Use docs-spine refs such as docs/index.md, docs/programs/PROGRAMS.md, docs/exec-plans/PLANS.md, docs/QUALITY_SCORE.md, and docs/prompts/README.md as first-hop routes.",
			}),
		);
	}
	if (LOCAL_ABSOLUTE_PATH_PATTERN.test(file.markdown)) {
		results.push(
			failedRule({
				ruleId: "content.no-local-absolute-paths",
				path: file.targetRef,
				message:
					"Generated docs include local absolute paths that are not portable or sync-safe.",
				remediation:
					"Use repo-relative paths only and keep machine-local paths out of generated customer docs.",
			}),
		);
	}
	if (findStaleDocsSpineAdoptionRoute(file.markdown, createdAtDate)) {
		results.push(
			failedRule({
				ruleId: "content.no-stale-docs-spine-routes",
				path: file.targetRef,
				message:
					"Generated docs route a prior dated docs-spine adoption packet as current guidance.",
				remediation:
					"Render current docs-spine target refs from the active workflow date and keep prior adoption packets out of first-hop guidance.",
			}),
		);
	}
	return results;
}

function evaluateDocsIndex(
	file: DocsSpineMarkdownFile,
	repoFacts?: DocsSpineRepoFacts,
) {
	const required = [
		{
			ruleId: "docs-index.frontmatter",
			pattern: /^---\n[\s\S]*?\n---\n/,
			message: "docs/index.md is missing YAML frontmatter.",
			remediation:
				"Add frontmatter with title, summary, docType, status, and read_when.",
		},
		{
			ruleId: "docs-index.owns",
			pattern: /^## Owns$/m,
			message: "docs/index.md is missing an Owns section.",
			remediation: "Add `## Owns` to define the docs index ownership.",
		},
		{
			ruleId: "docs-index.does-not-own",
			pattern: /^## Does Not Own$/m,
			message: "docs/index.md is missing a Does Not Own section.",
			remediation:
				"Add `## Does Not Own` so agents do not treat the index as every contract.",
		},
		{
			ruleId: "docs-index.codex-guidance",
			pattern: /^## How Codex loads repo guidance$/m,
			message: "docs/index.md does not explain how Codex loads repo guidance.",
			remediation:
				"Add `## How Codex loads repo guidance` with root and nested instruction routing.",
		},
		{
			ruleId: "docs-index.first-hop",
			pattern: /^## First Hop$/m,
			message: "docs/index.md is missing a First Hop section.",
			remediation:
				"Add `## First Hop` with canonical routes to architecture, reliability, security, Programs, ExecPlans, prompts, validation, proof, and quality score.",
		},
		{
			ruleId: "docs-index.next",
			pattern: /^## Next$/m,
			message: "docs/index.md is missing a Next section.",
			remediation: "Add `## Next` with the next reading path for agents.",
		},
	];
	const results = required.map((rule) =>
		testPattern({
			...rule,
			path: file.targetRef,
			markdown: file.markdown,
		}),
	);
	if (
		repoFacts?.instructionSurface.assistantShimRefs.length &&
		!repoFacts.instructionSurface.agentInstructionRefs.some((ref) =>
			file.markdown.includes(ref),
		)
	) {
		results.push(
			failedRule({
				ruleId: "docs-index.instruction-shim-routing",
				path: file.targetRef,
				message:
					"docs/index.md does not route the detected assistant instruction shim to a canonical instruction file.",
				remediation:
					"Name the root or assistant shim and at least one canonical instruction file explicitly, such as `.codex/AGENTS.md` for Arena-style repos or `AGENTS.md` for root-owned repos.",
			}),
		);
	}
	return results;
}

function evaluateQualityScore(file: DocsSpineMarkdownFile) {
	const results = [
		testPattern({
			ruleId: "quality-score.frontmatter",
			path: file.targetRef,
			markdown: file.markdown,
			pattern: /^---\n[\s\S]*?\n---\n/,
			message: "QUALITY_SCORE.md is missing YAML frontmatter.",
			remediation: "Add frontmatter and make the quality-score owner clear.",
		}),
		testPattern({
			ruleId: "quality-score.owns",
			path: file.targetRef,
			markdown: file.markdown,
			pattern: /^## Owns$/m,
			message: "QUALITY_SCORE.md is missing an Owns section.",
			remediation: "Add `## Owns` for the scorecard contract.",
		}),
		...evaluateRequiredSections(file, "quality-score.scorecard-contract", [
			"Product Domains",
			"Architectural Layers",
			"Current Findings",
			"Severity Framework",
			"QUALITY_SCORE.review",
		]),
	];
	const currentScore = readSectionBody(file.markdown, "Current Score");
	if (currentScore && /\b\d{1,3}\s*(?:\/\s*100|%)?\b/.test(currentScore)) {
		results.push(
			failedRule({
				ruleId: "quality-score.no-invented-numeric-score",
				path: file.targetRef,
				message:
					"QUALITY_SCORE.md includes a numeric current score before evidence-bound review exists.",
				remediation:
					"Use `not scored` until a quality audit records evidence refs, reviewer, date, and score rationale.",
			}),
		);
	}
	if (
		/Quality score evidence is blocked until/i.test(file.markdown) &&
		!/(Product Domains|Architectural Layers|Current Findings|QUALITY_SCORE\.review)/.test(
			file.markdown,
		)
	) {
		results.push(
			failedRule({
				ruleId: "quality-score.placeholder-only",
				path: file.targetRef,
				message:
					"QUALITY_SCORE.md is only a placeholder and has no usable scorecard contract.",
				remediation:
					"Keep blocked scoring evidence if needed, but include the full scorecard structure and review process.",
			}),
		);
	}
	return results;
}

function evaluateProgramContract(file: DocsSpineMarkdownFile) {
	return [
		testPattern({
			ruleId: "program-contract.frontmatter",
			path: file.targetRef,
			markdown: file.markdown,
			pattern: /^---\n[\s\S]*?\n---\n/,
			message: "Program contract is missing YAML frontmatter.",
			remediation: "Add metadata frontmatter to the Program contract.",
		}),
		testPattern({
			ruleId: "program-contract.required-structure",
			path: file.targetRef,
			markdown: file.markdown,
			pattern: /## Required Structure[\s\S]*## Prompt Contract/,
			message:
				"Program contract does not define required structure and prompt contract.",
			remediation:
				"Use the full Program contract shape with required sections, prompt assets, packet artifacts, and lint instructions.",
		}),
		testPattern({
			ruleId: "program-contract.lint-command",
			path: file.targetRef,
			markdown: file.markdown,
			pattern: /programs:lint/,
			message: "Program contract does not name the Program lint command.",
			remediation: "Document the repo-local Program lint command.",
		}),
		...evaluateRequiredSections(file, "program-contract.example-bar", [
			"What A Program Is",
			"Storage And Lifecycle",
			"Frontmatter",
			"Section Expectations",
			"Relationship To ExecPlans",
			"Completion Guidance",
			"Validation",
		]),
	];
}

function evaluateActiveProgram(file: DocsSpineMarkdownFile) {
	return [
		...evaluateProgramPacketPath(file),
		...evaluateRequiredSections(file, "program.active-required-sections", [
			"Purpose / Big Picture",
			"Program Inputs",
			"Current State",
			"Progress",
			"Decision Log",
			"Slice Ledger",
			"Next Slice",
			"Risks and Watchpoints",
			"Outcomes & Retrospective",
			"Validation and Acceptance",
			"Artifacts and Notes",
			"Interfaces and Dependencies",
		]),
	];
}

function evaluateExecPlanContract(file: DocsSpineMarkdownFile) {
	return [
		testPattern({
			ruleId: "exec-plan-contract.frontmatter",
			path: file.targetRef,
			markdown: file.markdown,
			pattern: /^---\n[\s\S]*?\n---\n/,
			message: "ExecPlan contract is missing YAML frontmatter.",
			remediation: "Add metadata frontmatter to the ExecPlan contract.",
		}),
		testPattern({
			ruleId: "exec-plan-contract.required-structure",
			path: file.targetRef,
			markdown: file.markdown,
			pattern:
				/(## Required Structure|## Plan of Work)[\s\S]*(## Validation|## Validation and Acceptance)/,
			message:
				"ExecPlan contract does not describe required implementation and validation structure.",
			remediation:
				"Use the full ExecPlan contract with purpose, progress, decisions, concrete steps, validation, recovery, and artifacts.",
		}),
		testPattern({
			ruleId: "exec-plan-contract.lint-command",
			path: file.targetRef,
			markdown: file.markdown,
			pattern: /plans:lint/,
			message: "ExecPlan contract does not name the ExecPlan lint command.",
			remediation: "Document the repo-local ExecPlan lint command.",
		}),
		...evaluateRequiredSections(file, "exec-plan-contract.example-bar", [
			"Repo-specific conventions",
			"How to use ExecPlans",
			"When to use an ExecPlan",
			"Non-negotiable requirements",
			"Formatting rules",
			"Front Matter",
			"Section Expectations",
			"Implementation discipline",
			"Validation and Acceptance",
		]),
	];
}

function evaluateActiveExecPlan(file: DocsSpineMarkdownFile) {
	return [
		...evaluateRequiredSections(file, "exec-plan.active-required-sections", [
			"Purpose / Big Picture",
			"Progress",
			"Surprises & Discoveries",
			"Decision Log",
			"Outcomes & Retrospective",
			"Context and Orientation",
			"Plan of Work",
			"Milestones",
			"Concrete Steps",
			"Validation and Acceptance",
			"Idempotence and Recovery",
			"Artifacts and Notes",
			"Interfaces and Dependencies",
		]),
		testPattern({
			ruleId: "exec-plan.test-commands",
			path: file.targetRef,
			markdown: file.markdown,
			pattern: /^### Test Commands$/m,
			message:
				"Active ExecPlan is missing the required Test Commands subsection.",
			remediation:
				"Add `### Test Commands` under `## Validation and Acceptance` with runnable proof commands.",
		}),
		...evaluateExecPlanPlanningBriefPath(file),
	];
}

function evaluatePromptsIndex(file: DocsSpineMarkdownFile) {
	return [
		testPattern({
			ruleId: "prompts-index.inventory",
			path: file.targetRef,
			markdown: file.markdown,
			pattern:
				/(Prompt Inventory|program-orchestrator|exec-plan|review prompt)/i,
			message: "Prompt README does not define a usable prompt inventory.",
			remediation:
				"List the durable prompt families and explain when agents should use them.",
		}),
		testPattern({
			ruleId: "prompts-index.program-create",
			path: file.targetRef,
			markdown: file.markdown,
			pattern: /docs\/prompts\/program-create\.md/,
			message: "Prompt README does not link the Program creation prompt.",
			remediation:
				"List `docs/prompts/program-create.md` as the prompt agents use to create Program packets.",
		}),
	];
}

function evaluateProgramCreatePrompt(file: DocsSpineMarkdownFile) {
	return [
		...evaluateRequiredSections(file, "program-create-prompt.sections", [
			"Load Order",
			"Inputs",
			"Creation Steps",
			"Required Packet Outputs",
			"Quality Gate",
			"Output",
		]),
		testPattern({
			ruleId: "program-create-prompt.lint-fallback",
			path: file.targetRef,
			markdown: file.markdown,
			pattern:
				/(programs:lint|markdown:lint|docs:validate)[\s\S]*(blocked proof|missing-script blocker|no Program or Markdown lint script)/i,
			message:
				"Program creation prompt does not define lint commands and missing-script fallback.",
			remediation:
				"Name repo-native Program/Markdown lint commands and require blocked proof when they are absent.",
		}),
		testPattern({
			ruleId: "program-create-prompt.agent-load-order",
			path: file.targetRef,
			markdown: file.markdown,
			pattern:
				/(instruction file|AGENTS\.md|canonical instruction refs)[\s\S]*docs\/index\.md[\s\S]*docs\/programs\/PROGRAMS\.md/i,
			message:
				"Program creation prompt does not route agents through instructions, docs index, and Program contract.",
			remediation:
				"Tell agents to load the nearest instructions, docs/index.md, and docs/programs/PROGRAMS.md before writing Program packets.",
		}),
	];
}

function evaluatePlanningBrief(file: DocsSpineMarkdownFile) {
	const requiredKeys = [
		"title",
		"program_id",
		"brief_version",
		"status",
		"summary",
		"read_when",
	];
	const missingKeys = requiredKeys.filter(
		(key) => !hasFrontmatterKey(file.markdown, key),
	);
	const title = readFrontmatterValue(file.markdown, "title");
	const h1 = file.markdown.match(/^#\s+(.+?)\s*$/m)?.[1] ?? null;
	const status = readFrontmatterValue(file.markdown, "status");
	const results: DocsSpineQualityRuleResult[] = [];
	if (
		missingKeys.length === 0 &&
		title &&
		h1 === title &&
		(status === "current" || status === "superseded") &&
		!/^created_at:/m.test(extractFrontmatterText(file.markdown))
	) {
		results.push(
			passedRule({
				ruleId: "program.planning-brief-frontmatter",
				path: file.targetRef,
				message:
					"Planning brief frontmatter matches the Program packet contract.",
				remediation: "No action required.",
			}),
		);
	} else {
		results.push(
			failedRule({
				ruleId: "program.planning-brief-frontmatter",
				path: file.targetRef,
				message:
					"Planning brief frontmatter must include title, program_id, brief_version, status, summary, and read_when; H1 must match title; status must be current or superseded; no extra created_at key is allowed.",
				remediation:
					"Use the Worker-compatible planning brief frontmatter contract and make the H1 match `title` exactly.",
			}),
		);
	}
	return results;
}

function evaluateCurrentPlanningBriefPointer(file: DocsSpineMarkdownFile) {
	const pointerLines = file.markdown
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line !== "");
	const pointerTarget = pointerLines[0] ?? "";
	if (
		pointerLines.length === 1 &&
		/^planning-brief-\d+\.md$/.test(pointerTarget)
	) {
		return [
			passedRule({
				ruleId: "program.current-planning-brief-pointer",
				path: file.targetRef,
				message:
					"Current planning brief pointer contains exactly one versioned brief filename.",
				remediation: "No action required.",
			}),
		];
	}
	return [
		failedRule({
			ruleId: "program.current-planning-brief-pointer",
			path: file.targetRef,
			message:
				"`current-planning-brief.txt` must contain exactly one `planning-brief-<N>.md` filename and no path.",
			remediation:
				"Write only the current versioned planning brief filename, for example `planning-brief-1.md`.",
		}),
	];
}

function evaluateProgramPacketArtifactCoverage(files: DocsSpineMarkdownFile[]) {
	const activeProgramFiles = files.filter((file) =>
		/^docs\/programs\/active\/\d{4}-\d{2}-\d{2}-[^/]+\/program\.md$/.test(
			file.targetRef,
		),
	);
	const results: DocsSpineQualityRuleResult[] = [];
	const targetRefs = new Set(files.map((file) => file.targetRef));
	for (const programFile of activeProgramFiles) {
		const programRoot = programFile.targetRef.replace(/\/program\.md$/, "");
		const requiredExactRefs = [
			`${programRoot}/converged-decision-packet.md`,
			`${programRoot}/dependency-graph.md`,
			`${programRoot}/plan-split-recommendation.md`,
			`${programRoot}/cross-repo-review.md`,
			`${programRoot}/planning-brief-1.md`,
			`${programRoot}/current-planning-brief.txt`,
		];
		const missingExactRefs = requiredExactRefs.filter(
			(ref) => !targetRefs.has(ref),
		);
		const hasResearchPass = files.some((file) =>
			new RegExp(
				`^${escapeRegExp(programRoot)}/(?:track-\\d+-.+|research-pass-.+)\\.md$`,
			).test(file.targetRef),
		);
		const hasNormalizedPass = files.some((file) =>
			new RegExp(
				`^${escapeRegExp(programRoot)}/(?:normalized-track-\\d+|normalized-pass-.+)\\.md$`,
			).test(file.targetRef),
		);
		const missingArtifactDescriptions = [
			...missingExactRefs,
			...(hasResearchPass ? [] : [`${programRoot}/track-<N>-<slug>.md`]),
			...(hasNormalizedPass ? [] : [`${programRoot}/normalized-track-<N>.md`]),
		];
		if (missingArtifactDescriptions.length === 0) {
			results.push(
				passedRule({
					ruleId: "program.packet-artifacts",
					path: programRoot,
					message: "Program packet includes required durable artifacts.",
					remediation: "No action required.",
				}),
			);
			continue;
		}
		results.push(
			failedRule({
				ruleId: "program.packet-artifacts",
				path: programRoot,
				message:
					"Program packet is missing required durable artifacts: " +
					missingArtifactDescriptions.join(", "),
				remediation:
					"Generate the full Program packet: program.md, research pass, normalized pass, decision packet, dependency graph, plan split, cross-repo review, planning brief, and current planning-brief pointer.",
			}),
		);
	}
	return results;
}

function evaluateProgramAuthoringPromptCoverage(
	files: DocsSpineMarkdownFile[],
) {
	const hasProgramContract = files.some(
		(file) => file.targetRef === "docs/programs/PROGRAMS.md",
	);
	if (!hasProgramContract) {
		return [];
	}
	const hasProgramCreatePrompt = files.some(
		(file) => file.targetRef === "docs/prompts/program-create.md",
	);
	if (hasProgramCreatePrompt) {
		return [
			passedRule({
				ruleId: "program.authoring-prompt",
				path: "docs-spine-output",
				message: "Generated docs include a Program creation prompt.",
				remediation: "No action required.",
			}),
		];
	}
	return [
		failedRule({
			ruleId: "program.authoring-prompt",
			path: "docs-spine-output",
			message:
				"Generated docs include a Program contract but no Program creation prompt.",
			remediation:
				"Generate `docs/prompts/program-create.md` so future agents can create Program packets from the contract.",
		}),
	];
}

function evaluatePromptAssetCoverage(files: DocsSpineMarkdownFile[]) {
	const targetRefs = new Set(files.map((file) => file.targetRef));
	const hasPromptIndex = targetRefs.has("docs/prompts/README.md");
	const hasProgramContract = targetRefs.has("docs/programs/PROGRAMS.md");
	if (!hasPromptIndex && !hasProgramContract) {
		return [];
	}
	const missingPromptRefs = REQUIRED_PROMPT_REFS.filter(
		(ref) => !targetRefs.has(ref),
	);
	if (missingPromptRefs.length === 0) {
		return [
			passedRule({
				ruleId: "prompts.required-family",
				path: "docs/prompts",
				message:
					"Generated docs include the required Program and ExecPlan prompt family.",
				remediation: "No action required.",
			}),
		];
	}
	return [
		failedRule({
			ruleId: "prompts.required-family",
			path: "docs/prompts",
			message:
				"Generated prompt assets are missing required Program or ExecPlan prompts: " +
				missingPromptRefs.join(", "),
			remediation:
				"Generate the Program Funnel prompts, Program refresh/completion prompts, and ExecPlan writer/grill/execute/validate prompts.",
		}),
	];
}

function evaluateValidationProof(file: DocsSpineMarkdownFile) {
	return [
		testPattern({
			ruleId: "validation-proof.native-gate",
			path: file.targetRef,
			markdown: file.markdown,
			pattern:
				/(Native Gate|Broad gate|bun run|npm run|pnpm|yarn|gate|check|proof)/i,
			message: "Validation/proof doc does not name repo-native gates.",
			remediation:
				"Document discovered native validation commands and how blocked gates are recorded.",
		}),
	];
}

function evaluateNativeGateDiscovery({
	repoFacts,
	files,
}: {
	repoFacts?: DocsSpineRepoFacts;
	files: DocsSpineMarkdownFile[];
}) {
	if (!repoFacts || repoFacts.repositoryShape.packageScripts.length === 0) {
		return [];
	}
	const hasGateLikeScript = repoFacts.repositoryShape.packageScripts.some(
		(scriptName) =>
			/^(gate|check|test|lint|typecheck|build|proof|ci)$/.test(scriptName),
	);
	const validationText = files
		.filter(
			(file) =>
				file.targetRef === "docs/validation.md" ||
				file.targetRef === "docs/proof.md" ||
				file.targetRef === "docs/index.md",
		)
		.map((file) => file.markdown)
		.join("\n");
	if (
		hasGateLikeScript &&
		!/(gate|check|test|lint|typecheck|build|proof|ci)/i.test(validationText)
	) {
		return [
			failedRule({
				ruleId: "source-truth.native-gate-routed",
				path: "docs-spine-output",
				message:
					"Generated docs do not route discovered repo-native gate scripts.",
				remediation:
					"Name the discovered native gate candidates in docs/index.md, docs/validation.md, or docs/proof.md.",
			}),
		];
	}
	return [
		passedRule({
			ruleId: "source-truth.native-gate-routed",
			path: "docs-spine-output",
			message: "Generated docs route discovered native gate candidates.",
			remediation: "No action required.",
		}),
	];
}

function evaluateProgramPacketPath(file: DocsSpineMarkdownFile) {
	const match = file.targetRef.match(
		/^docs\/programs\/active\/(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\/program\.md$/,
	);
	const programId = readFrontmatterValue(file.markdown, "program_id");
	const createdAt = readFrontmatterValue(file.markdown, "created_at");
	if (match && programId === match[2] && createdAt === match[1]) {
		return [
			passedRule({
				ruleId: "program.active-packet-path",
				path: file.targetRef,
				message: "Active Program path matches frontmatter date and program_id.",
				remediation: "No action required.",
			}),
		];
	}
	return [
		failedRule({
			ruleId: "program.active-packet-path",
			path: file.targetRef,
			message:
				"Active Program path must be docs/programs/active/<created_at>-<program_id>/program.md and match frontmatter.",
			remediation:
				"Move the Program into the dated packet folder and align `created_at` and `program_id` with the folder slug.",
		}),
	];
}

function evaluateExecPlanPlanningBriefPath(file: DocsSpineMarkdownFile) {
	const programId = readFrontmatterValue(file.markdown, "program_id");
	const planningBrief = readFrontmatterValue(file.markdown, "planning_brief");
	if (!programId && !planningBrief) {
		return [];
	}
	if (!programId || !planningBrief) {
		return [
			failedRule({
				ruleId: "exec-plan.planning-brief-link",
				path: file.targetRef,
				message:
					"Program-linked ExecPlan frontmatter must include both program_id and planning_brief.",
				remediation:
					"Add both linkage keys or remove both for a non-Program ExecPlan.",
			}),
		];
	}
	const expectedPattern = new RegExp(
		`^docs/programs/(?:active|completed)/\\d{4}-\\d{2}-\\d{2}-${escapeRegExp(
			programId,
		)}/planning-brief-\\d+\\.md$`,
	);
	if (expectedPattern.test(planningBrief)) {
		return [
			passedRule({
				ruleId: "exec-plan.planning-brief-link",
				path: file.targetRef,
				message:
					"ExecPlan planning_brief points at an immutable Program brief.",
				remediation: "No action required.",
			}),
		];
	}
	return [
		failedRule({
			ruleId: "exec-plan.planning-brief-link",
			path: file.targetRef,
			message:
				"ExecPlan planning_brief does not point at an immutable brief in the matching dated Program packet.",
			remediation:
				"Use docs/programs/(active|completed)/<YYYY-MM-DD-program_id>/planning-brief-<N>.md.",
		}),
	];
}

function readFrontmatterValue(markdown: string, key: string) {
	const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---\n/);
	if (!frontmatter) {
		return null;
	}
	const match = frontmatter[1].match(
		new RegExp(`^${escapeRegExp(key)}:\\s*(.+?)\\s*$`, "m"),
	);
	return match ? match[1].replace(/^["']|["']$/g, "") : null;
}

function extractFrontmatterText(markdown: string) {
	return markdown.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? "";
}

function hasFrontmatterKey(markdown: string, key: string) {
	return new RegExp(`^${escapeRegExp(key)}:`, "m").test(
		extractFrontmatterText(markdown),
	);
}

function readSectionBody(markdown: string, section: string) {
	const lines = markdown.split(/\r?\n/);
	const sectionStart = lines.findIndex((line) => line === `## ${section}`);
	if (sectionStart === -1) {
		return "";
	}
	const nextSection = lines.findIndex(
		(line, index) => index > sectionStart && line.startsWith("## "),
	);
	const sectionEnd = nextSection === -1 ? lines.length : nextSection;
	return lines
		.slice(sectionStart + 1, sectionEnd)
		.join("\n")
		.trim();
}

function evaluateRequiredSections(
	file: DocsSpineMarkdownFile,
	ruleId: string,
	sections: string[],
) {
	const missingSections = sections.filter(
		(section) =>
			!new RegExp(`^## ${escapeRegExp(section)}$`, "m").test(file.markdown),
	);
	if (
		missingSections.length === 0 &&
		/^---\n[\s\S]*?\n---\n/.test(file.markdown)
	) {
		return [
			passedRule({
				ruleId,
				path: file.targetRef,
				message: "Document includes required sections and frontmatter.",
				remediation: "No action required.",
			}),
		];
	}
	const missingFrontmatter = !/^---\n[\s\S]*?\n---\n/.test(file.markdown);
	return [
		failedRule({
			ruleId,
			path: file.targetRef,
			message: [
				missingFrontmatter ? "missing frontmatter" : "",
				missingSections.length
					? `missing sections: ${missingSections.join(", ")}`
					: "",
			]
				.filter(Boolean)
				.join("; "),
			remediation:
				"Use the full Program or ExecPlan packet contract before marking the draft apply-ready.",
		}),
	];
}

function extractDraftMarkdownFiles(
	draft: unknown,
	sourceArtifactRef: string,
): DocsSpineMarkdownFile[] {
	const record = toRecord(draft);
	if (!record || !Array.isArray(record.proposedFiles)) {
		return [];
	}
	return record.proposedFiles
		.map((file) => {
			const fileRecord = toRecord(file);
			if (
				!fileRecord ||
				typeof fileRecord.targetRef !== "string" ||
				typeof fileRecord.markdown !== "string"
			) {
				return null;
			}
			return {
				targetRef: fileRecord.targetRef,
				markdown: fileRecord.markdown,
				sourceArtifactRef,
			};
		})
		.filter((file): file is DocsSpineMarkdownFile => file !== null);
}

function buildQualityReport({
	workflowId,
	workflowVersion,
	now,
	sourceArtifactRefs,
	ruleResults,
}: {
	workflowId: DocsSpineQualityReport["workflowId"];
	workflowVersion: DocsSpineQualityReport["workflowVersion"];
	now: number;
	sourceArtifactRefs: string[];
	ruleResults: DocsSpineQualityRuleResult[];
}): DocsSpineQualityReport {
	const errorRules = ruleResults.filter((rule) => rule.severity === "error");
	const failedErrorRules = errorRules.filter(
		(rule) => rule.status === "failed",
	);
	const score =
		errorRules.length === 0
			? 100
			: Math.max(
					0,
					Math.round(
						((errorRules.length - failedErrorRules.length) /
							errorRules.length) *
							100,
					),
				);
	const passingScore = 90;
	return {
		schemaVersion: "docs-spine-quality-report.v1",
		workflowId,
		workflowVersion,
		status:
			failedErrorRules.length === 0 && score >= passingScore
				? "passed"
				: "failed",
		score,
		passingScore,
		sourceArtifactRefs: [...new Set(sourceArtifactRefs)].sort(),
		ruleResults,
		createdAt: now,
	};
}

function testPattern({
	ruleId,
	path,
	markdown,
	pattern,
	message,
	remediation,
}: {
	ruleId: string;
	path: string;
	markdown: string;
	pattern: RegExp;
	message: string;
	remediation: string;
}) {
	return pattern.test(markdown)
		? passedRule({
				ruleId,
				path,
				message: "Rule passed.",
				remediation: "No action required.",
			})
		: failedRule({ ruleId, path, message, remediation });
}

function failedRule({
	ruleId,
	path,
	message,
	remediation,
}: {
	ruleId: string;
	path: string;
	message: string;
	remediation: string;
}): DocsSpineQualityRuleResult {
	return {
		ruleId,
		severity: "error",
		status: "failed",
		path,
		message,
		remediation,
	};
}

function passedRule({
	ruleId,
	path,
	message,
	remediation,
}: {
	ruleId: string;
	path: string;
	message: string;
	remediation: string;
}): DocsSpineQualityRuleResult {
	return {
		ruleId,
		severity: "error",
		status: "passed",
		path,
		message,
		remediation,
	};
}

function readStringArray(value: unknown) {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter((entry): entry is string => typeof entry === "string");
}

function toRecord(value: unknown) {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return null;
	}
	return value as Record<string, unknown>;
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SOURCE_TEST_ASSET_ROUTE_PATTERN =
	/(?:^|[\s`("'[])(?:(?:apps|packages)\/[^`\s"'()]+\/(?:src|test|tests|__tests__|assets|public|static)\/[^`\s"')]+|(?:src|test|tests|__tests__|assets|public|static)\/[^`\s"')]+)/m;
const LOCAL_ABSOLUTE_PATH_PATTERN =
	/(?:^|[\s`("'[])(?:\/Users\/|\/home\/|\/private\/var\/|[A-Za-z]:\\)/m;
const PRIOR_DOCS_SPINE_ADOPTION_ROUTE_PATTERN =
	/docs\/(?:programs|exec-plans)\/active\/(\d{4}-\d{2}-\d{2})-docs-spine-adoption(?:\/|-[^`\s)]+)/g;

function findStaleDocsSpineAdoptionRoute(
	markdown: string,
	createdAtDate: string | null,
) {
	if (!createdAtDate) {
		return false;
	}
	for (const match of markdown.matchAll(
		PRIOR_DOCS_SPINE_ADOPTION_ROUTE_PATTERN,
	)) {
		if (match[1] !== createdAtDate) {
			return true;
		}
	}
	return false;
}
