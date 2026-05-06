import {
	DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS,
	DOCS_SPINE_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID,
	DOCS_SPINE_ADOPTION_WORKFLOW_ID,
	DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
} from "./manifest";
import type {
	DocsSpineDraftFamily,
	DocsSpineRepoFacts,
	DocsSpineScannerArtifact,
	DocsSpineSynthesisArtifact,
} from "./schemas";

type ScannerArtifactLookup = Record<string, unknown>;

const INITIAL_PROGRAM_ID = "docs-spine-adoption";

type InitialDocsSpineRefs = {
	programId: typeof INITIAL_PROGRAM_ID;
	createdAtDate: string;
	programRootRef: string;
	execPlanRef: string;
	planningBriefRef: string;
};

export function buildDocsSpineSynthesisArtifacts({
	repoFacts,
	scannerArtifacts,
	now,
}: {
	repoFacts: DocsSpineRepoFacts;
	scannerArtifacts: DocsSpineScannerArtifact[];
	now: number;
}): DocsSpineSynthesisArtifact[] {
	const scannerArtifactRefs = scannerArtifacts.map(
		(artifact) => artifact.repoRelativePath,
	);
	const scannerArtifactLookup = Object.fromEntries(
		scannerArtifacts.map((artifact) => [
			artifact.repoRelativePath,
			artifact.value,
		]),
	);
	const draftFamilies = buildDraftFamilies(
		repoFacts,
		scannerArtifactLookup,
		now,
	);

	return [
		artifact("codexSynthesisPacket", {
			schemaVersion: "docs-spine-codex-synthesis-packet.v1",
			workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
			workflowVersion: DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
			status: "ready_for_local_codex_synthesis",
			inputArtifactRefs: [
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.repoFacts,
				...scannerArtifactRefs,
			],
			privacyBoundary: {
				rawSourceIncluded: false,
				rawLogsIncluded: false,
				packageScriptBodiesIncluded: false,
				dependencyVersionsIncluded: false,
				docsDraftsApprovedForSync: false,
				codexTranscriptsIncluded: false,
				localAbsolutePathsIncluded: false,
			},
			authorityBoundary: {
				canApplyFiles: false,
				canMutatePackageScripts: false,
				canMutateCi: false,
				canPushBranches: false,
				canOpenPullRequests: false,
				canCallProviderCli: false,
			},
			draftFamilies: draftFamilies.map((family) => ({
				familyId: family.familyId,
				targetRefs: family.targetRefs,
				sourceArtifactRefs: family.sourceArtifactRefs,
				status: family.status,
				blockedReasons: family.blockedReasons,
			})),
			nextRecommendedWorkflowId:
				DOCS_SPINE_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID,
			createdAt: now,
		}),
		...draftFamilies.map((family) =>
			artifact(family.artifactKey, {
				schemaVersion: `docs-spine-${family.familyId}-draft.v1`,
				workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
				workflowVersion: DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
				familyId: family.familyId,
				status: family.status,
				targetRefs: family.targetRefs,
				sourceArtifactRefs: family.sourceArtifactRefs,
				blockedReasons: family.blockedReasons,
				applyInstructions: family.applyInstructions,
				proposedOperations: family.proposedOperations,
				proposedFiles: family.proposedFiles,
				privacyBoundary: {
					rawSourceIncluded: false,
					rawLogsIncluded: false,
					packageScriptBodiesIncluded: false,
					codexTranscriptIncluded: false,
				},
				createdAt: now,
			}),
		),
	];
}

function buildDraftFamilies(
	repoFacts: DocsSpineRepoFacts,
	scannerArtifactLookup: ScannerArtifactLookup,
	now: number,
) {
	const initialRefs = buildInitialDocsSpineRefs(now);
	const docsGapReport = readObjectArtifact(
		scannerArtifactLookup,
		DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.docsGapReport,
	);
	const missingSurfaceIds = readStringList(docsGapReport, "missingSurfaceIds");
	const fallbackMissingSurfaceIds = readSurfaceRows(docsGapReport)
		.filter((surface) => surface.status === "missing")
		.map((surface) => surface.surfaceId);
	const missingSurfaces = missingSurfaceIds.length
		? missingSurfaceIds
		: fallbackMissingSurfaceIds;
	const hasPromptIndex = repoFacts.docsSurface.promptRefs.some(
		(ref) => ref === "docs/prompts/README.md",
	);
	const hasDocsIndex = repoFacts.docsSurface.docsRefs.some(
		(ref) => ref === "docs/index.md",
	);
	const nativeGateScriptNames = readStringList(
		readObjectArtifact(
			scannerArtifactLookup,
			DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.validationSurfaceMap,
		),
		"nativeGateScriptNames",
	);
	const sourceTruthMap = readObjectArtifact(
		scannerArtifactLookup,
		DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.sourceTruthMap,
	);

	return [
		draftFamily({
			familyId: "docs-index",
			artifactKey: "docsIndexDraft",
			targetRefs: ["docs/index.md"],
			sourceArtifactRefs: [
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.sourceTruthMap,
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.docsGapReport,
			],
			blockedReasons: [],
			applyInstructions:
				"Draft docs/index.md routing updates from source-truth and docs-gap facts only.",
			proposedOperations: [
				{
					operation: hasDocsIndex ? "update_existing_doc" : "create_doc",
					targetRef: "docs/index.md",
					requiresApplyApproval: true,
				},
			],
			proposedFiles: [
				{
					targetRef: "docs/index.md",
					markdown: renderDocsIndexMarkdown({
						repoFacts,
						sourceTruthMap,
						missingSurfaces,
						nativeGateScriptNames,
					}),
				},
			],
		}),
		draftFamily({
			familyId: "program-packet",
			artifactKey: "programPacketDraft",
			targetRefs: [
				"docs/programs/PROGRAMS.md",
				"docs/programs/active/<program-id>/program.md",
			],
			sourceArtifactRefs: [
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.repoFacts,
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.sourceTruthMap,
			],
			blockedReasons: [],
			applyInstructions:
				"Draft Program packet structure while preserving detected repo conventions.",
			proposedOperations: [
				{
					operation: "draft_program_packet",
					targetRef: "docs/programs/active/<program-id>/program.md",
					requiresApplyApproval: true,
				},
			],
			proposedFiles: [
				{
					targetRef: "docs/programs/PROGRAMS.md",
					markdown: renderProgramContractMarkdown(repoFacts),
				},
				{
					targetRef: `${initialRefs.programRootRef}/program.md`,
					markdown: renderInitialProgramMarkdown({
						repoFacts,
						missingSurfaces,
						nativeGateScriptNames,
						initialRefs,
					}),
				},
				{
					targetRef: initialRefs.planningBriefRef,
					markdown: renderInitialPlanningBriefMarkdown({
						repoFacts,
						nativeGateScriptNames,
						initialRefs,
					}),
				},
			],
		}),
		draftFamily({
			familyId: "exec-plan",
			artifactKey: "execPlanDraft",
			targetRefs: [
				"docs/exec-plans/PLANS.md",
				"docs/exec-plans/active/<exec-plan-id>.md",
			],
			sourceArtifactRefs: [
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.repoFacts,
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.commandProofMap,
			],
			blockedReasons: [],
			applyInstructions:
				"Draft first child ExecPlan structure and validation commands from command-proof facts.",
			proposedOperations: [
				{
					operation: "draft_exec_plan",
					targetRef: "docs/exec-plans/active/<exec-plan-id>.md",
					requiresApplyApproval: true,
				},
			],
			proposedFiles: [
				{
					targetRef: "docs/exec-plans/PLANS.md",
					markdown: renderExecPlanContractMarkdown(repoFacts),
				},
				{
					targetRef: initialRefs.execPlanRef,
					markdown: renderInitialExecPlanMarkdown({
						repoFacts,
						nativeGateScriptNames,
						initialRefs,
					}),
				},
			],
		}),
		draftFamily({
			familyId: "agent-instructions",
			artifactKey: "agentInstructionsDraft",
			targetRefs: repoFacts.instructionSurface.agentInstructionRefs.length
				? repoFacts.instructionSurface.agentInstructionRefs
				: ["AGENTS.md"],
			sourceArtifactRefs: [
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.instructionSurfaceMap,
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.skillTriggerMap,
			],
			blockedReasons: repoFacts.instructionSurface.agentInstructionRefs.length
				? []
				: ["agent-instructions-missing"],
			applyInstructions:
				"Draft instruction routing updates without overwriting canonical local instruction ownership.",
			proposedOperations: [
				{
					operation: "draft_instruction_routing",
					targetRef:
						repoFacts.instructionSurface.agentInstructionRefs[0] ?? "AGENTS.md",
					requiresApplyApproval: true,
				},
			],
		}),
		draftFamily({
			familyId: "prompt-assets",
			artifactKey: "promptAssetsDraft",
			targetRefs: ["docs/prompts/README.md"],
			sourceArtifactRefs: [
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.sourceTruthMap,
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.generatedSurfaceMap,
			],
			blockedReasons: [],
			applyInstructions:
				"Draft prompt asset inventory and future workflow prompts from source-truth facts.",
			proposedOperations: [
				{
					operation: hasPromptIndex
						? "update_prompt_index"
						: "create_prompt_index",
					targetRef: "docs/prompts/README.md",
					requiresApplyApproval: true,
				},
			],
			proposedFiles: [
				{
					targetRef: "docs/prompts/README.md",
					markdown: renderPromptIndexMarkdown(repoFacts),
				},
			],
		}),
		draftFamily({
			familyId: "validation-proof",
			artifactKey: "validationProofNotes",
			targetRefs: ["docs/validation.md", "docs/proof.md"],
			sourceArtifactRefs: [
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.commandProofMap,
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.validationSurfaceMap,
			],
			blockedReasons: [],
			applyInstructions:
				"Draft validation/proof notes from script names and CI refs only; never include script bodies.",
			proposedOperations: nativeGateScriptNames.map((scriptName) => ({
				operation: "document_validation_command",
				scriptName,
				requiresApplyApproval: true,
			})),
			proposedFiles: [
				{
					targetRef: "docs/validation.md",
					markdown: renderValidationMarkdown({
						repoFacts,
						nativeGateScriptNames,
					}),
				},
				{
					targetRef: "docs/proof.md",
					markdown: renderProofMarkdown({
						repoFacts,
						nativeGateScriptNames,
					}),
				},
			],
		}),
		draftFamily({
			familyId: "quality-score",
			artifactKey: "qualityScoreNotes",
			targetRefs: ["docs/QUALITY_SCORE.md"],
			sourceArtifactRefs: [
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.qualityScoreBaseline,
			],
			blockedReasons: [],
			applyInstructions:
				"Draft quality-score notes as blocked evidence. Do not invent numeric scores.",
			proposedOperations: [
				{
					operation: "draft_quality_score_surface",
					targetRef: "docs/QUALITY_SCORE.md",
					requiresApplyApproval: true,
				},
			],
			proposedFiles: [
				{
					targetRef: "docs/QUALITY_SCORE.md",
					markdown: renderQualityScoreMarkdown(repoFacts),
				},
			],
		}),
		draftFamily({
			familyId: "parity-checklist",
			artifactKey: "parityChecklistDraft",
			targetRefs: [DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.parityChecklist],
			sourceArtifactRefs: [
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.docsGapReport,
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.validationSurfaceMap,
			],
			blockedReasons: missingSurfaces.length
				? missingSurfaces.map((surfaceId) => `missing:${surfaceId}`)
				: [],
			applyInstructions:
				"Draft parity checklist rows from missing docs-spine surfaces.",
			proposedOperations: missingSurfaces.map((surfaceId) => ({
				operation: "track_missing_surface",
				surfaceId,
				requiresApplyApproval: false,
			})),
		}),
	];
}

function buildInitialDocsSpineRefs(now: number): InitialDocsSpineRefs {
	const createdAtDate = new Date(now).toISOString().slice(0, 10);
	const programRootRef = `docs/programs/active/${createdAtDate}-${INITIAL_PROGRAM_ID}`;
	return {
		programId: INITIAL_PROGRAM_ID,
		createdAtDate,
		programRootRef,
		execPlanRef: `docs/exec-plans/active/${createdAtDate}-${INITIAL_PROGRAM_ID}-first-slice.md`,
		planningBriefRef: `${programRootRef}/planning-brief-1.md`,
	};
}

function draftFamily({
	familyId,
	artifactKey,
	targetRefs,
	sourceArtifactRefs,
	blockedReasons,
	applyInstructions,
	proposedOperations,
	proposedFiles = [],
}: {
	familyId: DocsSpineDraftFamily;
	artifactKey: Exclude<
		keyof typeof DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS,
		| "workflowPacket"
		| "proof"
		| "syncPreview"
		| "manifest"
		| "repoFacts"
		| "sourceTruthMap"
		| "commandProofMap"
		| "docsGapReport"
		| "architectureSignals"
		| "securitySignals"
		| "qualityScoreBaseline"
		| "instructionSurfaceMap"
		| "skillTriggerMap"
		| "generatedSurfaceMap"
		| "validationSurfaceMap"
		| "performanceTimings"
		| "parityChecklist"
		| "codexSynthesisPacket"
	>;
	targetRefs: string[];
	sourceArtifactRefs: string[];
	blockedReasons: string[];
	applyInstructions: string;
	proposedOperations: Array<Record<string, unknown>>;
	proposedFiles?: Array<{ targetRef: string; markdown: string }>;
}) {
	return {
		familyId,
		artifactKey,
		targetRefs,
		sourceArtifactRefs,
		blockedReasons,
		applyInstructions,
		proposedOperations,
		proposedFiles,
		status: blockedReasons.length
			? "blocked_pending_codex_context"
			: "ready_for_codex_draft",
	};
}

function artifact(
	key: Exclude<
		keyof typeof DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS,
		| "workflowPacket"
		| "proof"
		| "syncPreview"
		| "manifest"
		| "repoFacts"
		| "sourceTruthMap"
		| "commandProofMap"
		| "docsGapReport"
		| "architectureSignals"
		| "securitySignals"
		| "qualityScoreBaseline"
		| "instructionSurfaceMap"
		| "skillTriggerMap"
		| "generatedSurfaceMap"
		| "validationSurfaceMap"
		| "performanceTimings"
		| "parityChecklist"
	>,
	value: unknown,
): DocsSpineSynthesisArtifact {
	return {
		repoRelativePath: DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS[key],
		value,
	};
}

function readObjectArtifact(
	scannerArtifactLookup: ScannerArtifactLookup,
	repoRelativePath: string,
) {
	const value = scannerArtifactLookup[repoRelativePath];
	if (value && typeof value === "object" && !Array.isArray(value)) {
		return value as Record<string, unknown>;
	}
	return {};
}

function readStringList(value: Record<string, unknown>, key: string) {
	const maybeList = value[key];
	if (!Array.isArray(maybeList)) {
		return [];
	}
	return maybeList.filter(
		(entry): entry is string => typeof entry === "string",
	);
}

function readSurfaceRows(value: Record<string, unknown>) {
	const maybeRows = value.surfaces;
	if (!Array.isArray(maybeRows)) {
		return [];
	}
	return maybeRows
		.map((row) => {
			if (!row || typeof row !== "object") {
				return null;
			}
			const record = row as Record<string, unknown>;
			if (
				typeof record.surfaceId !== "string" ||
				typeof record.status !== "string"
			) {
				return null;
			}
			return {
				surfaceId: record.surfaceId,
				status: record.status,
			};
		})
		.filter(
			(row): row is { surfaceId: string; status: string } => row !== null,
		);
}

function renderDocsIndexMarkdown({
	repoFacts,
	sourceTruthMap,
	missingSurfaces,
	nativeGateScriptNames,
}: {
	repoFacts: DocsSpineRepoFacts;
	sourceTruthMap: Record<string, unknown>;
	missingSurfaces: string[];
	nativeGateScriptNames: string[];
}) {
	const docsRefs = limitRefs([
		...repoFacts.docsSurface.docsRefs,
		...repoFacts.docsSurface.programRefs,
		...repoFacts.docsSurface.execPlanRefs,
		...repoFacts.docsSurface.promptRefs,
	]);
	const canonicalInstructionRefs =
		repoFacts.instructionSurface.agentInstructionRefs;
	const shimRefs = repoFacts.instructionSurface.assistantShimRefs;
	const rootReadmeRefs = readStringList(sourceTruthMap, "rootReadmeRefs");
	return [
		"---",
		"title: Docs Index",
		"summary: First-hop documentation route map for this repository.",
		"docType: readme",
		"status: active",
		"read_when:",
		"  - Starting repo work.",
		"  - Deciding which docs-spine surface owns a rule or follow-up.",
		"---",
		"",
		"# Docs Index",
		"",
		"`docs/` is the first-hop documentation spine for this repository. Start here, then follow the owning doc for the surface you are changing.",
		"",
		"## Owns",
		"",
		"- first-hop routing for agent-facing repository docs",
		"- links between root instructions, canonical docs, Programs, ExecPlans, prompts, validation, proof, and quality scoring",
		"- the rule that hidden historical files and local skills are not primary docs routes",
		"",
		"## Does Not Own",
		"",
		"- runtime implementation details that belong beside the code",
		"- package scripts, CI workflows, provider configuration, or root instructions",
		"- local skill trigger bodies; those are inventoried separately from primary repo guidance",
		"- historical audit artifacts, generated caches, or scratch assistant folders",
		"",
		"## How Codex loads repo guidance",
		"",
		"Load the canonical instruction file first, then this docs index, then the nearest nested owner docs for the files being changed.",
		"",
		"- Canonical instruction refs: " +
			formatRefs(limitRefs(canonicalInstructionRefs)),
		"- Root or assistant shim refs: " + formatRefs(limitRefs(shimRefs)),
		"- README refs: " + formatRefs(limitRefs(rootReadmeRefs)),
		"",
		"## First Hop",
		"",
		"- Architecture: `docs/ARCHITECTURE.md`",
		"- Reliability and validation policy: `docs/RELIABILITY.md`",
		"- Security and trust boundaries: `docs/SECURITY.md`",
		"- Frontend or UI rules when present: `docs/FRONTEND.md` and `docs/DESIGN.md`",
		"- Product judgment when present: `docs/PRODUCT_SENSE.md`",
		"- Quality score: `docs/QUALITY_SCORE.md`",
		"- Program contract and inventory: `docs/programs/PROGRAMS.md` and `docs/programs/active/`",
		"- ExecPlan contract and inventory: `docs/exec-plans/PLANS.md` and `docs/exec-plans/active/`",
		"- Prompt inventory: `docs/prompts/README.md`",
		"- Validation commands: `docs/validation.md`",
		"- Proof notes: `docs/proof.md`",
		"",
		"## Native Gates",
		"",
		"- Package manager: `" + repoFacts.repositoryShape.packageManager + "`",
		"- Broad gate candidates: " + formatRefs(nativeGateScriptNames),
		"- Package script names: " +
			formatRefs(limitRefs(repoFacts.repositoryShape.packageScripts)),
		"",
		"## Existing Docs",
		"",
		"- Existing docs refs: " + formatRefs(docsRefs),
		"",
		"## Missing Surfaces",
		"",
		...formatList(missingSurfaces),
		"",
		"## Next",
		"",
		"- Read the canonical instruction file before editing.",
		"- Read `docs/validation.md` before claiming proof.",
		"- Use `docs/programs/PROGRAMS.md` for multi-slice initiatives.",
		"- Use `docs/exec-plans/PLANS.md` for one bounded implementation slice.",
		"- Use `docs/QUALITY_SCORE.md` for quality-score audits and blocked score evidence.",
		"",
	].join("\n");
}

function renderProgramContractMarkdown(repoFacts: DocsSpineRepoFacts) {
	return [
		"---",
		"title: Programs",
		"summary: Contract for durable Program packets in this repository.",
		"docType: guide",
		"status: active",
		"read_when:",
		"  - Starting a multi-slice initiative.",
		"  - Creating or validating a Program packet.",
		"---",
		"",
		"# Programs",
		"",
		"Programs are the initiative-level operating record for work that spans more than one implementation slice. A Program keeps the big picture, current decision state, child ExecPlan ledger, and next planning brief in the repository instead of in chat history.",
		"",
		"## What A Program Is",
		"",
		"- A Program owns strategy, sequencing, cross-slice decisions, and handoff state.",
		"- A Program does not own detailed implementation steps for a single bounded slice; those belong in child ExecPlans.",
		"- A Program remains active until every required child slice is complete, validated, and reflected in the outcome record.",
		"",
		"Use a Program when the work needs research, normalization, multiple child plans, cross-repo or cross-package coordination, release sequencing, or durable planning briefs.",
		"",
		"## Storage And Lifecycle",
		"",
		"- Active Programs live at `docs/programs/active/<created_at>-<program_id>/program.md`.",
		"- Completed Programs move to `docs/programs/completed/<created_at>-<program_id>/program.md` without changing `program_id` or `created_at`.",
		"- Planning briefs live inside the Program packet as `planning-brief-<N>.md` and must be immutable once a child ExecPlan uses them.",
		"- `current-planning-brief.txt` points at the latest active planning brief for the Program.",
		"- Keep active and completed indexes current when this repository has `docs/programs/active/index.md` or `docs/programs/completed/index.md`.",
		"",
		"## Frontmatter",
		"",
		"Every `program.md` must start with YAML frontmatter containing:",
		"",
		"- `program_id`: stable lowercase slug that matches the packet folder suffix.",
		"- `title`: human-readable initiative name.",
		"- `status`: `active` or `completed`.",
		"- `created_at`: `YYYY-MM-DD`, matching the packet folder prefix.",
		"- `completed_at`: `YYYY-MM-DD` only after completion, otherwise `null`.",
		"- `summary`: one sentence describing the initiative outcome target.",
		"- `post_build_recap`: `null` while active, then the completion summary.",
		"- `read_when`: concrete situations where future agents should load the Program.",
		"",
		"## Required Structure",
		"",
		"Every Program packet should include these artifacts when the initiative needs them:",
		"",
		"- `program.md` for the durable initiative record.",
		"- one or more research passes when external or codebase context was gathered.",
		"- one or more normalized passes when raw research is distilled into decisions.",
		"- `converged-decision-packet.md` when the Program resolves competing approaches.",
		"- `dependency-graph.md` when ordering, coupling, or blocked work matters.",
		"- `plan-split-recommendation.md` when child ExecPlans need explicit boundaries.",
		"- `cross-repo-review.md` when more than one repository or package boundary is affected.",
		"- one or more `planning-brief-<N>.md` files for child ExecPlan inputs.",
		"- `current-planning-brief.txt` when one brief is the active next slice.",
		"",
		"Every `program.md` must include these sections in order:",
		"",
		"- Purpose / Big Picture",
		"- Program Inputs",
		"- Current State",
		"- Progress",
		"- Decision Log",
		"- Slice Ledger",
		"- Next Slice",
		"- Risks and Watchpoints",
		"- Outcomes & Retrospective",
		"- Validation and Acceptance",
		"- Artifacts and Notes",
		"- Interfaces and Dependencies",
		"",
		"## Prompt Contract",
		"",
		"Prompt assets that move a Program through research, normalization, planning, execution, docs sync, review, and completion should live under `docs/prompts/`.",
		"",
		"Every Program prompt must state the packet it reads, the artifact it writes, the exact section contract it preserves, and the quality gate it runs before returning. Prompts must not rely on chat-only context for Program state.",
		"",
		"## Section Expectations",
		"",
		"- Purpose / Big Picture explains why the initiative exists and what success looks like.",
		"- Program Inputs lists source docs, issues, PRs, generated artifacts, external setup, and constraints that shape the work.",
		"- Current State summarizes what is true now without pretending unresolved research is settled.",
		"- Progress uses checkboxes only for durable, verifiable state transitions.",
		"- Decision Log records decision, rationale, date, and owner or source evidence.",
		"- Slice Ledger links active and completed child ExecPlans by repo-relative path.",
		"- Next Slice names one concrete next brief or states that no follow-up remains.",
		"- Risks and Watchpoints records blockers, coupling, rollout concerns, and verification gaps.",
		"- Outcomes & Retrospective is filled only after completion evidence exists.",
		"- Validation and Acceptance names the Program-level checks and acceptance conditions.",
		"- Artifacts and Notes links packet artifacts that future workers need.",
		"- Interfaces and Dependencies names owned code, docs, providers, repos, packages, and handoffs.",
		"",
		"## Relationship To ExecPlans",
		"",
		"A Program plans the initiative; an ExecPlan executes one bounded slice. Program-linked ExecPlans must include `program_id` and `planning_brief` frontmatter pointing at an immutable `planning-brief-<N>.md` in the Program packet.",
		"",
		"Do not let a child ExecPlan silently change Program scope. When execution changes the initiative shape, update the Program Decision Log and Next Slice before creating the next child plan.",
		"",
		"## Promotion Guidance",
		"",
		"Move a Program from active to completed only after every required child ExecPlan is completed, validation evidence is recorded, unresolved risks are either closed or accepted, and the Outcomes & Retrospective section reflects the actual result.",
		"",
		"## Completion Guidance",
		"",
		"Completion is a repo state, not a chat statement. The completed packet should preserve final decisions, child plan links, validation evidence, remaining known risks, and any external setup that future workers must understand.",
		"",
		"## Validation",
		"",
		"Run `bun run programs:lint` when this repository provides that command. If the repo uses another package manager, run the equivalent package-manager command for `programs:lint`.",
		"",
		"Before calling a Program packet ready, confirm the active/completed path matches frontmatter, planning briefs are immutable, child ExecPlan links are repo-relative, and no generated placeholder text is left as the source of truth.",
		"",
		"Repo convention refs detected by the docs-spine scanner: " +
			formatRefs(limitRefs(repoFacts.docsSurface.programRefs)),
		"",
	].join("\n");
}

function renderInitialProgramMarkdown({
	repoFacts,
	missingSurfaces,
	nativeGateScriptNames,
	initialRefs,
}: {
	repoFacts: DocsSpineRepoFacts;
	missingSurfaces: string[];
	nativeGateScriptNames: string[];
	initialRefs: InitialDocsSpineRefs;
}) {
	return [
		"---",
		`program_id: ${initialRefs.programId}`,
		"title: Docs Spine Adoption",
		"status: active",
		`created_at: ${initialRefs.createdAtDate}`,
		"completed_at: null",
		"summary: Adopt a repo-specific docs spine with Programs, ExecPlans, validation, proof, prompts, and quality-score tracking.",
		"post_build_recap: null",
		"read_when:",
		"  - Resuming docs-spine adoption.",
		"  - Creating the first follow-up ExecPlan after runner install.",
		"---",
		"",
		"# Docs Spine Adoption",
		"",
		"This Program is a living initiative document for adopting the docs spine in this repository.",
		"",
		"This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.",
		"",
		"## Purpose / Big Picture",
		"",
		"Install a repo-specific operating spine that future agents can use without relying on chat history. The spine should preserve the repository's own instructions, package manager, native gates, docs, and topology while adding durable Program, ExecPlan, prompt, validation, proof, and quality-score routes.",
		"",
		"## Program Inputs",
		"",
		"- Canonical instruction refs: " +
			formatRefs(limitRefs(repoFacts.instructionSurface.agentInstructionRefs)),
		"- Instruction shim refs: " +
			formatRefs(limitRefs(repoFacts.instructionSurface.assistantShimRefs)),
		"- Package manager: `" + repoFacts.repositoryShape.packageManager + "`",
		"- Native gate candidates: " + formatRefs(nativeGateScriptNames),
		"",
		"## Current State",
		"",
		"- Package manager: `" + repoFacts.repositoryShape.packageManager + "`",
		"- Workspace packages: " +
			formatRefs(limitRefs(repoFacts.repositoryShape.workspacePackageRefs)),
		"- Agent instructions: " +
			formatRefs(repoFacts.instructionSurface.agentInstructionRefs),
		"- Native gate candidates: " + formatRefs(nativeGateScriptNames),
		"",
		"## Progress",
		"",
		"- [ ] Review applied docs-spine files.",
		"- [ ] Fill repo-specific Program details.",
		"- [ ] Run the broad repo gate or record blocked proof.",
		"",
		"## Decision Log",
		"",
		"Decision: Use checked-in docs-spine files as durable operating memory.",
		"Rationale: Future agents need source truth in the repo instead of chat history.",
		`Date: ${initialRefs.createdAtDate}`,
		"",
		"## Slice Ledger",
		"",
		"Active child ExecPlans:",
		"",
		`- \`${initialRefs.execPlanRef}\``,
		"",
		"Completed child ExecPlans:",
		"",
		"- None yet.",
		"",
		"## Next Slice",
		"",
		"Review the installed docs spine, fill any repo-specific gaps, and run or block the native gate with exact evidence.",
		"",
		"## Risks and Watchpoints",
		"",
		"Do not mutate root instructions, package scripts, CI, dependencies, provider configuration, or runtime code without a separate authority boundary. Do not invent quality scores before an evidence-bound audit.",
		"",
		"## Outcomes & Retrospective",
		"",
		"This Program is active. Fill the retrospective after docs-spine adoption has been reviewed and no required follow-up slice remains.",
		"",
		"## Validation and Acceptance",
		"",
		"Acceptance requires the docs index, Program and ExecPlan contracts, prompt inventory, validation notes, proof notes, and quality-score contract to be present and aligned with the repo-native gate.",
		"",
		"## Artifacts and Notes",
		"",
		"## Missing Surfaces",
		"",
		...formatList(missingSurfaces),
		"",
		"## Interfaces and Dependencies",
		"",
		"This Program depends on the repository's canonical instruction files, package metadata, docs tree, local runner `.sbs` artifacts, and native validation commands.",
		"",
	].join("\n");
}

function renderInitialPlanningBriefMarkdown({
	repoFacts,
	nativeGateScriptNames,
	initialRefs,
}: {
	repoFacts: DocsSpineRepoFacts;
	nativeGateScriptNames: string[];
	initialRefs: InitialDocsSpineRefs;
}) {
	return [
		"---",
		`program_id: ${initialRefs.programId}`,
		"title: Docs Spine Adoption Planning Brief 1",
		"status: active",
		`created_at: ${initialRefs.createdAtDate}`,
		"---",
		"",
		"# Docs Spine Adoption Planning Brief 1",
		"",
		"Install the first docs-spine slice for this repository and keep the result aligned with the repository's native instructions, docs, and validation gate.",
		"",
		"## Scope",
		"",
		"- Review the generated docs index, Program, ExecPlan, prompt, validation, proof, and quality-score files.",
		"- Fill any missing repo-specific context without changing runtime code, package scripts, CI, or provider setup.",
		"- Run or honestly block the repo-native gate with exact evidence.",
		"",
		"## Inputs",
		"",
		"- Package manager: `" + repoFacts.repositoryShape.packageManager + "`",
		"- Canonical instruction refs: " +
			formatRefs(limitRefs(repoFacts.instructionSurface.agentInstructionRefs)),
		"- Native gate candidates: " + formatRefs(nativeGateScriptNames),
		"",
		"## Acceptance",
		"",
		"- Applied Markdown passes the docs-spine quality report.",
		"- The Program and ExecPlan remain linked through this immutable planning brief.",
		"- Native gate proof is either passed or blocked with the exact setup reason.",
		"",
	].join("\n");
}

function renderExecPlanContractMarkdown(repoFacts: DocsSpineRepoFacts) {
	return [
		"---",
		"title: ExecPlans",
		"summary: Contract for execution plans in this repository.",
		"docType: plan_contract",
		"status: active",
		"read_when:",
		"  - Writing a new bounded implementation plan.",
		"  - Resuming work from an existing plan.",
		"---",
		"",
		"# ExecPlans",
		"",
		"An ExecPlan is a self-contained implementation record for one bounded slice of work. It must contain enough context, steps, decisions, and validation evidence for another agent or maintainer to resume without chat history.",
		"",
		"## Repo-specific conventions",
		"",
		"- Follow the nearest repository instruction file before editing files named by an ExecPlan.",
		"- Use the package manager and validation commands documented in this repository, not commands copied from another repo.",
		"- Keep one ExecPlan scoped to one bounded implementation slice.",
		"- Update the ExecPlan as work happens. Do not leave it as a stale proposal after implementation changes reality.",
		"",
		"## How to use ExecPlans",
		"",
		"Read this contract before creating, reviewing, or resuming an ExecPlan. Then read the active plan, the nearest code and docs it names, and any Program planning brief linked in frontmatter.",
		"",
		"Active plans live under `docs/exec-plans/active/`. Completed plans live under `docs/exec-plans/completed/`. Program-linked plans should use dated slugs that make the owning Program and slice clear.",
		"",
		"## When to use an ExecPlan",
		"",
		"Use an ExecPlan for complex features, migrations, risky integrations, long-running work, multi-step repairs, release-sensitive changes, or any slice where future resumption needs durable context.",
		"",
		"Do not create an ExecPlan for a trivial one-file change unless the repository instructions, Program packet, or user explicitly require one.",
		"",
		"## Non-negotiable requirements",
		"",
		"- The plan must describe the real current state after inspecting the codebase.",
		"- The plan must include concrete steps that can be executed from the repository root.",
		"- The plan must record surprises, decisions, validation, and recovery notes as they occur.",
		"- The plan must separate implementation scope from validation scope.",
		"- The plan must not hide blockers behind vague wording.",
		"",
		"## Formatting rules",
		"",
		"- Use Markdown headings for every required section.",
		"- Keep repo-relative paths in backticks.",
		"- Use checkboxes only for Progress items that can be verified.",
		"- Prefer short direct paragraphs over long narrative blocks.",
		"- Keep command examples runnable from the repository root unless the plan states another working directory.",
		"",
		"## Front Matter",
		"",
		"Every ExecPlan must start with YAML frontmatter containing:",
		"",
		"- `title`: human-readable slice name.",
		"- `status`: `active` or `completed`.",
		"- `created_at`: `YYYY-MM-DD`.",
		"- `completed_at`: `YYYY-MM-DD` only after completion, otherwise `null`.",
		"- `summary`: one sentence naming the intended result.",
		"- `post_build_recap`: `null` while active, then the final recap.",
		"- `read_when`: concrete situations where future agents should load the plan.",
		"- `program_id`: required only when a Program owns the slice.",
		"- `planning_brief`: required only when `program_id` is present.",
		"",
		"## Required Structure",
		"",
		"Every ExecPlan must include these sections in order:",
		"",
		"- Purpose / Big Picture",
		"- Progress",
		"- Surprises & Discoveries",
		"- Decision Log",
		"- Outcomes & Retrospective",
		"- Context and Orientation",
		"- Plan of Work",
		"- Milestones",
		"- Concrete Steps",
		"- Validation and Acceptance",
		"- Idempotence and Recovery",
		"- Artifacts and Notes",
		"- Interfaces and Dependencies",
		"",
		"## Section Expectations",
		"",
		"- Purpose / Big Picture explains the user-visible or operator-visible outcome.",
		"- Progress records durable checkboxes as the work advances.",
		"- Surprises & Discoveries captures facts found while reading or validating.",
		"- Decision Log records decision, rationale, date, and source evidence.",
		"- Outcomes & Retrospective is filled after implementation and validation finish.",
		"- Context and Orientation explains the owning files, APIs, and constraints.",
		"- Plan of Work states the intended technical approach and boundaries.",
		"- Milestones break the work into observable phases.",
		"- Concrete Steps lists the exact edits and checks expected for the slice.",
		"- Validation and Acceptance names commands, probes, expected outcomes, and blocked proof rules.",
		"- Idempotence and Recovery explains rerun safety, rollback, and partial-failure handling.",
		"- Artifacts and Notes links generated output, screenshots, proof, or external setup docs.",
		"- Interfaces and Dependencies names touched modules, external systems, and cross-plan dependencies.",
		"",
		"## Living plans and design decisions",
		"",
		"An ExecPlan is a living artifact while active. Update it when implementation discovers a new constraint, a validation command changes, a milestone completes, or a decision changes the path.",
		"",
		"Do not rewrite history after completion. Append the final state, validation evidence, and retrospective instead.",
		"",
		"## Implementation discipline",
		"",
		"Keep the diff within the plan's scope. When the work reveals a new slice, record it in Artifacts and Notes or the owning Program rather than silently expanding the current plan.",
		"",
		"## Validation and Acceptance",
		"",
		"Run `bun run plans:lint` when this repository provides that command. If the repo uses another package manager, run the equivalent package-manager command for `plans:lint`.",
		"",
		"Before calling an ExecPlan complete, run the narrow command that exercises the touched behavior, run the relevant repo gate when required, update Progress and Outcomes & Retrospective, and record any blocked check with the exact reason.",
		"",
		"Repo convention refs detected by the docs-spine scanner: " +
			formatRefs(limitRefs(repoFacts.docsSurface.execPlanRefs)),
		"",
	].join("\n");
}

function renderInitialExecPlanMarkdown({
	repoFacts,
	nativeGateScriptNames,
	initialRefs,
}: {
	repoFacts: DocsSpineRepoFacts;
	nativeGateScriptNames: string[];
	initialRefs: InitialDocsSpineRefs;
}) {
	return [
		"---",
		"title: Adopt Docs Spine First Slice",
		"status: active",
		`created_at: ${initialRefs.createdAtDate}`,
		"completed_at: null",
		"summary: Review the installed docs spine, fill repo-specific gaps, and prove the native repository gate.",
		"post_build_recap: null",
		`program_id: ${initialRefs.programId}`,
		`planning_brief: ${initialRefs.planningBriefRef}`,
		"read_when:",
		"  - Reviewing docs-spine adoption output.",
		"  - Running the first native gate after runner install.",
		"---",
		"",
		"# Adopt Docs Spine First Slice",
		"",
		"This is a living execution plan for the first human-reviewed follow-up after the docs-spine workflow applies the initial operating files.",
		"",
		"This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.",
		"",
		"## Purpose / Big Picture",
		"",
		"Review the generated docs-spine files, fill in repo-specific details, and prove the repository still passes its native gate.",
		"",
		"## Progress",
		"",
		"- [ ] Review docs index, Program, ExecPlan, prompt, validation, proof, and quality-score surfaces.",
		"- [ ] Run or block the native gate.",
		"",
		"## Surprises & Discoveries",
		"",
		"Record any repo-specific instruction routing, command, or docs ownership surprises here as they are discovered.",
		"",
		"## Decision Log",
		"",
		"Decision: Treat docs-spine adoption as a reviewed repo change, not a silent generated artifact.",
		"Rationale: The installed spine should be trusted by future agents.",
		`Date: ${initialRefs.createdAtDate}`,
		"",
		"## Outcomes & Retrospective",
		"",
		"This ExecPlan is active. Fill this section after the first docs-spine review and native gate proof complete.",
		"",
		"## Context and Orientation",
		"",
		"The docs-spine files live under `docs/`. Local runner evidence lives under `.sbs/docs-spine-adoption/` and `.sbs/runs/`.",
		"",
		"### In Scope",
		"",
		"Review and refine docs-spine Markdown, then run or honestly block native validation.",
		"",
		"### Out Of Scope",
		"",
		"Do not mutate package scripts, CI, dependencies, providers, runtime code, or root instructions without separate approval.",
		"",
		"## Plan of Work",
		"",
		"Read the canonical instruction refs, inspect the generated docs files, fill repo-specific blanks, run focused docs checks when available, then run the native gate or record the exact blocker.",
		"",
		"## Milestones",
		"",
		"The first milestone is docs review. The second milestone is validation proof. The third milestone is Program and ExecPlan update.",
		"",
		"## Concrete Steps",
		"",
		"Start from the repository root and inspect the installed docs spine before editing.",
		"",
		"## Validation",
		"",
		"- Package manager: `" + repoFacts.repositoryShape.packageManager + "`",
		"- Native gate candidates: " + formatRefs(nativeGateScriptNames),
		"",
		"## Validation and Acceptance",
		"",
		"Acceptance requires the docs-spine files to be reviewed, missing repo facts to be documented, and the native gate to be run or blocked with exact evidence.",
		"",
		"### Test Commands",
		"",
		...formatNativeGateCommands(
			repoFacts.repositoryShape.packageManager,
			nativeGateScriptNames,
		),
		"",
		"## Idempotence and Recovery",
		"",
		"If validation fails, record the blocker and repair only the owned docs-spine surface. Keep unrelated worktree changes out of this slice.",
		"",
		"## Artifacts and Notes",
		"",
		"Local runner proof artifacts live under `.sbs/runs/` and `.sbs/docs-spine-adoption/`.",
		"",
		"## Interfaces and Dependencies",
		"",
		"This ExecPlan depends on the installed docs spine, canonical instructions, package manager, and native validation commands.",
		"",
	].join("\n");
}

function renderPromptIndexMarkdown(repoFacts: DocsSpineRepoFacts) {
	return [
		"---",
		"title: Prompts",
		"summary: Inventory for durable prompt assets used by repeatable repo workflows.",
		"docType: readme",
		"status: active",
		"read_when:",
		"  - Looking for reusable workflow prompts.",
		"  - Adding a new Program, ExecPlan, review, or synthesis prompt.",
		"---",
		"",
		"# Prompts",
		"",
		"Prompt assets live here when a repeatable workflow needs a stable instruction packet.",
		"",
		"## Prompt Inventory",
		"",
		"- Program orchestration prompts for research, normalization, planning, docs sync, and completion.",
		"- ExecPlan prompts for writing, grilling, executing, validating, and reviewing one bounded implementation slice.",
		"- Review prompt assets for branch review, risk review, and docs-spine quality review.",
		"- Synthesis prompts for turning scanner facts into repo-specific Markdown drafts.",
		"",
		"## Usage",
		"",
		"Use prompt files for durable workflow prompts, review prompts, synthesis prompts, and adoption prompts that should survive beyond one chat session. Every prompt that produces a durable artifact should include a quality gate before returning.",
		"",
		"Detected prompt refs: " +
			formatRefs(limitRefs(repoFacts.docsSurface.promptRefs)),
		"",
	].join("\n");
}

function renderValidationMarkdown({
	repoFacts,
	nativeGateScriptNames,
}: {
	repoFacts: DocsSpineRepoFacts;
	nativeGateScriptNames: string[];
}) {
	return [
		"---",
		"title: Validation",
		"summary: Native validation command map and blocked-proof rules for docs-spine adoption.",
		"docType: guide",
		"status: active",
		"read_when:",
		"  - Proving docs-spine adoption work.",
		"  - Deciding which native repo gate to run.",
		"---",
		"",
		"# Validation",
		"",
		"Use the repo-native commands below when proving docs-spine adoption work.",
		"",
		"## Native Gate",
		"",
		"- Package manager: `" + repoFacts.repositoryShape.packageManager + "`",
		"- Package scripts: " +
			formatRefs(limitRefs(repoFacts.repositoryShape.packageScripts)),
		"- Broad gate candidates: " + formatRefs(nativeGateScriptNames),
		"",
		"## Docs-Spine Checks",
		"",
		"- Docs index must include Owns, Does Not Own, Codex guidance, First Hop, and Next.",
		"- Program packets and ExecPlans must satisfy their contracts.",
		"- Quality score must include a scorecard contract even when numeric score evidence is blocked.",
		"",
		"## Blocked Gates",
		"",
		"When a native gate cannot run, record the exact command, missing dependency or configuration, and what must be fixed before claiming full proof.",
		"",
		"Do not add or rewrite package scripts without a separate approval.",
		"",
	].join("\n");
}

function renderProofMarkdown({
	repoFacts,
	nativeGateScriptNames,
}: {
	repoFacts: DocsSpineRepoFacts;
	nativeGateScriptNames: string[];
}) {
	return [
		"---",
		"title: Proof",
		"summary: Local proof notes for docs-spine adoption and native gate evidence.",
		"docType: guide",
		"status: active",
		"read_when:",
		"  - Recording validation evidence.",
		"  - Explaining a blocked native gate.",
		"---",
		"",
		"# Proof",
		"",
		"Record local proof for docs-spine adoption here when the workflow or a follow-up agent runs validation.",
		"",
		"## Required Evidence",
		"",
		"- Git diff and status are clean except for approved docs-spine files.",
		"- Markdown structure passes local review.",
		"- Native gate is run or blocked with a clear reason.",
		"",
		"## Native Gate",
		"",
		"- Package manager: `" + repoFacts.repositoryShape.packageManager + "`",
		...formatList(nativeGateScriptNames),
		"",
		"## Blocked Proof",
		"",
		"If a native gate is blocked, record the failed command, short error summary, and setup requirement. Do not call docs-spine adoption complete while this section contains unresolved proof blockers.",
		"",
	].join("\n");
}

function renderQualityScoreMarkdown(repoFacts: DocsSpineRepoFacts) {
	return [
		"---",
		"title: Quality Score",
		"summary: Scorecard contract and blocked-evidence ledger for repository quality audits.",
		"docType: guide",
		"status: active",
		"read_when:",
		"  - Running or reviewing a repo quality audit.",
		"  - Recording quality-score evidence or blockers.",
		"---",
		"",
		"# Quality Score",
		"",
		"This file defines the repository quality-score contract. Numeric scores are blocked until an evidence-bound quality audit runs, but the scorecard shape is installed now so future audits have a durable home.",
		"",
		"## Owns",
		"",
		"- repo-wide quality-score dimensions",
		"- `QUALITY_SCORE.review` audit notes and review cadence",
		"- blocked score evidence and follow-up routing",
		"- quality findings that should become Program or ExecPlan work",
		"",
		"## Does Not Own",
		"",
		"- feature-specific acceptance criteria",
		"- temporary branch review notes",
		"- invented scores without evidence",
		"",
		"## Current Score",
		"",
		"`not scored` until a separate evidence-bound quality audit runs.",
		"",
		"## Product Domains",
		"",
		"- Domain coverage is pending audit evidence.",
		"- Each future row should include domain name, score, evidence refs, and owner.",
		"",
		"## Architectural Layers",
		"",
		"- Layer coverage is pending audit evidence.",
		"- Each future row should include layer name, score, evidence refs, and owner.",
		"",
		"## Current Findings",
		"",
		"- No numeric findings are recorded yet.",
		"- Quality score evidence is blocked until the audit command and evidence refs exist.",
		"",
		"## Severity Framework",
		"",
		"- P0: correctness, data loss, security, or release-blocking issue.",
		"- P1: serious product, reliability, or maintainability issue with a clear user or operator impact.",
		"- P2: meaningful quality debt that should be scheduled.",
		"- P3: minor cleanup that should not distract from higher-priority work.",
		"",
		"## QUALITY_SCORE.review",
		"",
		"Future audits should record the command run, audit date, reviewer, evidence refs, findings, score changes, and follow-up Program or ExecPlan paths.",
		"",
		"## Next",
		"",
		"- Run an evidence-bound quality audit before assigning scores.",
		"- Route multi-step fixes into `docs/exec-plans/active/`.",
		"- Keep blocked score evidence visible until the audit exists.",
		"",
		"Detected quality-score refs: " +
			formatRefs(
				limitRefs(
					repoFacts.docsSurface.docsRefs.filter((ref) =>
						ref.toLowerCase().includes("quality_score"),
					),
				),
			),
		"",
	].join("\n");
}

function limitRefs(refs: string[]) {
	return refs.slice(0, 12);
}

function formatRefs(refs: string[]) {
	return refs.length ? refs.map((ref) => `\`${ref}\``).join(", ") : "`none`";
}

function formatList(values: string[]) {
	if (!values.length) {
		return ["- None detected."];
	}
	return values.map((value) => `- \`${value}\``);
}

function formatNativeGateCommands(
	packageManager: string,
	scriptNames: string[],
) {
	if (!scriptNames.length) {
		return [
			"- No native gate script was detected. Record that blocker explicitly.",
		];
	}
	return scriptNames.map(
		(scriptName) =>
			`- \`${formatPackageScriptCommand(packageManager, scriptName)}\``,
	);
}

function formatPackageScriptCommand(
	packageManager: string,
	scriptName: string,
) {
	if (packageManager === "bun") {
		return `bun run ${scriptName}`;
	}
	if (packageManager === "pnpm") {
		return `pnpm run ${scriptName}`;
	}
	if (packageManager === "yarn") {
		return `yarn ${scriptName}`;
	}
	return `npm run ${scriptName}`;
}
