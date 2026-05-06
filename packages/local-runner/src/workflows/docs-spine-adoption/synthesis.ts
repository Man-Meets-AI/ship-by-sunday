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

const PROGRAM_PROMPT_REFS = [
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

const EXEC_PLAN_PROMPT_REFS = [
	"docs/prompts/exec-plan-writer.md",
	"docs/prompts/exec-plan-grill.md",
	"docs/prompts/exec-plan-execute.md",
	"docs/prompts/exec-plan-validate.md",
] as const;

const PROMPT_ASSET_REFS = [
	"docs/prompts/README.md",
	"docs/prompts/AGENTS.md",
	"docs/prompts/program-create.md",
	...PROGRAM_PROMPT_REFS,
	...EXEC_PLAN_PROMPT_REFS,
] as const;

const REQUIRED_PLANNING_SCRIPT_NAMES = [
	"programs:lint",
	"plans:lint",
	"markdown:lint",
	"docs:validate",
	"program:write-child-plan",
] as const;

type InitialDocsSpineRefs = {
	programId: typeof INITIAL_PROGRAM_ID;
	createdAtDate: string;
	programRootRef: string;
	researchPassRef: string;
	normalizedPassRef: string;
	convergedDecisionRef: string;
	dependencyGraphRef: string;
	planSplitRef: string;
	crossRepoReviewRef: string;
	execPlanRef: string;
	planningBriefRef: string;
	currentPlanningBriefRef: string;
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
	const hasPromptAgents = repoFacts.docsSurface.promptRefs.some(
		(ref) => ref === "docs/prompts/AGENTS.md",
	);
	const hasProgramsReadme = repoFacts.docsSurface.programRefs.some(
		(ref) => ref === "docs/programs/README.md",
	);
	const hasProgramsAgents = repoFacts.docsSurface.programRefs.some(
		(ref) => ref === "docs/programs/AGENTS.md",
	);
	const hasActiveProgramsIndex = repoFacts.docsSurface.programRefs.some(
		(ref) => ref === "docs/programs/active/index.md",
	);
	const hasCompletedProgramsIndex = repoFacts.docsSurface.programRefs.some(
		(ref) => ref === "docs/programs/completed/index.md",
	);
	const hasExecPlansIndex = repoFacts.docsSurface.execPlanRefs.some(
		(ref) => ref === "docs/exec-plans/index.md",
	);
	const hasExecPlansAgents = repoFacts.docsSurface.execPlanRefs.some(
		(ref) => ref === "docs/exec-plans/AGENTS.md",
	);
	const hasActiveExecPlansIndex = repoFacts.docsSurface.execPlanRefs.some(
		(ref) => ref === "docs/exec-plans/active/index.md",
	);
	const hasCompletedExecPlansIndex = repoFacts.docsSurface.execPlanRefs.some(
		(ref) => ref === "docs/exec-plans/completed/index.md",
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
				...(hasProgramsReadme ? [] : ["docs/programs/README.md"]),
				...(hasProgramsAgents ? [] : ["docs/programs/AGENTS.md"]),
				"docs/programs/PROGRAMS.md",
				...(hasActiveProgramsIndex ? [] : ["docs/programs/active/index.md"]),
				...(hasCompletedProgramsIndex
					? []
					: ["docs/programs/completed/index.md"]),
				"docs/programs/active/<program-id>/program.md",
				"docs/programs/active/<program-id>/track-1-<slug>.md",
				"docs/programs/active/<program-id>/normalized-track-1.md",
				"docs/programs/active/<program-id>/converged-decision-packet.md",
				"docs/programs/active/<program-id>/dependency-graph.md",
				"docs/programs/active/<program-id>/plan-split-recommendation.md",
				"docs/programs/active/<program-id>/cross-repo-review.md",
				"docs/programs/active/<program-id>/planning-brief-1.md",
				"docs/programs/active/<program-id>/current-planning-brief.txt",
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
				...(hasProgramsReadme
					? []
					: [
							{
								targetRef: "docs/programs/README.md",
								markdown: renderProgramReadmeMarkdown(initialRefs),
							},
						]),
				...(hasProgramsAgents
					? []
					: [
							{
								targetRef: "docs/programs/AGENTS.md",
								markdown: renderProgramAgentsMarkdown(),
							},
						]),
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
					targetRef: initialRefs.researchPassRef,
					markdown: renderInitialResearchPassMarkdown({
						repoFacts,
						nativeGateScriptNames,
						initialRefs,
					}),
				},
				{
					targetRef: initialRefs.normalizedPassRef,
					markdown: renderInitialNormalizedPassMarkdown({
						repoFacts,
						missingSurfaces,
						nativeGateScriptNames,
						initialRefs,
					}),
				},
				{
					targetRef: initialRefs.convergedDecisionRef,
					markdown: renderInitialConvergedDecisionMarkdown({
						repoFacts,
						initialRefs,
					}),
				},
				{
					targetRef: initialRefs.dependencyGraphRef,
					markdown: renderInitialDependencyGraphMarkdown(initialRefs),
				},
				{
					targetRef: initialRefs.planSplitRef,
					markdown: renderInitialPlanSplitMarkdown(initialRefs),
				},
				{
					targetRef: initialRefs.crossRepoReviewRef,
					markdown: renderInitialCrossRepoReviewMarkdown(initialRefs),
				},
				{
					targetRef: initialRefs.planningBriefRef,
					markdown: renderInitialPlanningBriefMarkdown({
						repoFacts,
						nativeGateScriptNames,
						initialRefs,
					}),
				},
				{
					targetRef: initialRefs.currentPlanningBriefRef,
					markdown: "planning-brief-1.md\n",
				},
				...(hasActiveProgramsIndex
					? []
					: [
							{
								targetRef: "docs/programs/active/index.md",
								markdown: renderActiveProgramsIndexMarkdown(initialRefs),
							},
						]),
				...(hasCompletedProgramsIndex
					? []
					: [
							{
								targetRef: "docs/programs/completed/index.md",
								markdown: renderCompletedProgramsIndexMarkdown(),
							},
						]),
			],
		}),
		draftFamily({
			familyId: "exec-plan",
			artifactKey: "execPlanDraft",
			targetRefs: [
				...(hasExecPlansIndex ? [] : ["docs/exec-plans/index.md"]),
				...(hasExecPlansAgents ? [] : ["docs/exec-plans/AGENTS.md"]),
				"docs/exec-plans/PLANS.md",
				...(hasActiveExecPlansIndex ? [] : ["docs/exec-plans/active/index.md"]),
				...(hasCompletedExecPlansIndex
					? []
					: ["docs/exec-plans/completed/index.md"]),
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
				...(hasExecPlansIndex
					? []
					: [
							{
								targetRef: "docs/exec-plans/index.md",
								markdown: renderExecPlansIndexMarkdown(),
							},
						]),
				...(hasExecPlansAgents
					? []
					: [
							{
								targetRef: "docs/exec-plans/AGENTS.md",
								markdown: renderExecPlansAgentsMarkdown(),
							},
						]),
				{
					targetRef: "docs/exec-plans/PLANS.md",
					markdown: renderExecPlanContractMarkdown(repoFacts),
				},
				...(hasActiveExecPlansIndex
					? []
					: [
							{
								targetRef: "docs/exec-plans/active/index.md",
								markdown: renderActiveExecPlansIndexMarkdown(),
							},
						]),
				...(hasCompletedExecPlansIndex
					? []
					: [
							{
								targetRef: "docs/exec-plans/completed/index.md",
								markdown: renderCompletedExecPlansIndexMarkdown(),
							},
						]),
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
			targetRefs: [...PROMPT_ASSET_REFS],
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
				...(hasPromptAgents
					? []
					: [
							{
								targetRef: "docs/prompts/AGENTS.md",
								markdown: renderPromptAgentsMarkdown(),
							},
						]),
				{
					targetRef: "docs/prompts/program-create.md",
					markdown: renderProgramCreatePromptMarkdown(repoFacts),
				},
				...renderPromptAssetMarkdownFiles(repoFacts),
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
		researchPassRef: `${programRootRef}/track-1-docs-spine-surfaces.md`,
		normalizedPassRef: `${programRootRef}/normalized-track-1.md`,
		convergedDecisionRef: `${programRootRef}/converged-decision-packet.md`,
		dependencyGraphRef: `${programRootRef}/dependency-graph.md`,
		planSplitRef: `${programRootRef}/plan-split-recommendation.md`,
		crossRepoReviewRef: `${programRootRef}/cross-repo-review.md`,
		execPlanRef: `docs/exec-plans/active/${createdAtDate}-${INITIAL_PROGRAM_ID}-first-slice.md`,
		planningBriefRef: `${programRootRef}/planning-brief-1.md`,
		currentPlanningBriefRef: `${programRootRef}/current-planning-brief.txt`,
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

function listMissingPlanningScriptNames(repoFacts: DocsSpineRepoFacts) {
	const scriptNames = new Set(repoFacts.repositoryShape.packageScripts);
	return REQUIRED_PLANNING_SCRIPT_NAMES.filter(
		(scriptName) => !scriptNames.has(scriptName),
	);
}

function formatPlanningScriptReadiness(repoFacts: DocsSpineRepoFacts) {
	const missingScripts = listMissingPlanningScriptNames(repoFacts);
	if (missingScripts.length === 0) {
		return "- Planning primitive scripts: all expected Program, ExecPlan, Markdown, docs validation, and child-plan scripts were detected.";
	}
	return (
		"- Missing planning primitive scripts: " +
		formatRefs(missingScripts) +
		". Record blocked proof and create a separate tooling slice before relying on automated Program or ExecPlan generation at scale."
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
	const docsRefs = limitRefs(
		[
			...repoFacts.docsSurface.docsRefs,
			...repoFacts.docsSurface.programRefs,
			...repoFacts.docsSurface.execPlanRefs,
			...repoFacts.docsSurface.promptRefs,
		].filter(isPrimaryDocsRouteRef),
	);
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
		formatPlanningScriptReadiness(repoFacts),
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

function renderProgramReadmeMarkdown(initialRefs: InitialDocsSpineRefs) {
	return [
		"---",
		"title: Programs",
		"summary: Landing lane for durable multi-slice initiative docs that sit above individual ExecPlans.",
		"docType: readme",
		"status: active",
		"read_when:",
		"  - Starting or resuming a multi-ExecPlan initiative.",
		"  - Deciding whether work belongs in a Program or an ExecPlan.",
		"---",
		"",
		"# Programs",
		"",
		"`docs/programs/` is the canonical landing lane for durable initiative memory that coordinates several child ExecPlans.",
		"",
		"## Owns",
		"",
		"- Program contracts, active and completed Program lanes, and Program packet folders.",
		"- The checked-in Program Funnel from research passes to immutable planning briefs.",
		"- The split between initiative-level Program truth and execution-level ExecPlan truth.",
		"- The mutable `current-planning-brief.txt` pointer and immutable `planning-brief-<N>.md` provenance model.",
		"",
		"## Does Not Own",
		"",
		"- Single-slice implementation instructions that belong in `docs/exec-plans/`.",
		"- Runtime implementation details, package scripts, provider setup, or CI configuration.",
		"",
		"## Program Funnel",
		"",
		"The Program Funnel is the one-way shaping path from rough initiative to durable Program packet:",
		"",
		"1. Initialize the Program root and honest `program.md`.",
		"2. Promote stable research passes into `track-<N>-<slug>.md` files.",
		"3. Normalize each track into `normalized-track-<N>.md`.",
		"4. Write the converged decision packet, dependency graph, plan split recommendation, and cross-repo review.",
		"5. Write `planning-brief-1.md` and point `current-planning-brief.txt` at it.",
		"6. Write one child ExecPlan from the immutable planning brief, validate that slice, then refresh the Program with the next versioned brief.",
		"",
		"## Canonical Program Shape",
		"",
		"Each Program lives under `docs/programs/<active|completed>/<YYYY-MM-DD-program-id>/`.",
		"",
		"The enforced minimum packet is:",
		"",
		"- `program.md`",
		"- at least one `track-<N>-<slug>.md` or `research-pass-<slug>.md`",
		"- at least one `normalized-track-<N>.md` or `normalized-pass-<slug>.md`",
		"- `converged-decision-packet.md`",
		"- `dependency-graph.md`",
		"- `plan-split-recommendation.md`",
		"- `cross-repo-review.md`",
		"- one or more immutable `planning-brief-<N>.md` files",
		"- `current-planning-brief.txt` containing exactly one planning brief filename",
		"",
		"## Program-Aware Child ExecPlans",
		"",
		"Child ExecPlans must record `program_id` and `planning_brief` frontmatter. The `planning_brief` value must point at an immutable `planning-brief-<N>.md`, never at `current-planning-brief.txt`.",
		"",
		"When this repository provides it, run:",
		"",
		"```bash",
		"bun run program:write-child-plan -- --program-id <program-id> --plan docs/exec-plans/active/YYYY-MM-DD-slice.md",
		"```",
		"",
		"If that script is missing, use `docs/prompts/exec-plan-writer.md` and record the missing script as blocked proof until the repo installs its planning automation.",
		"",
		"## Validation",
		"",
		"Use these repo-owned proof surfaces when present:",
		"",
		"```bash",
		"bun run programs:lint",
		"bun run markdown:lint -- --paths docs/programs",
		"bun run docs:validate",
		"```",
		"",
		"## Current Starter Program",
		"",
		"- `" + initialRefs.programRootRef + "/`",
		"",
		"## Next",
		"",
		"- Read `docs/programs/PROGRAMS.md` before authoring a Program packet.",
		"- Use `docs/programs/active/index.md` for in-flight Program folders.",
		"- Use `docs/programs/completed/index.md` for finished Program folders.",
		"- Use `docs/exec-plans/index.md` for one-slice execution work.",
		"",
	].join("\n");
}

function renderProgramAgentsMarkdown() {
	return [
		"---",
		"title: Programs",
		"summary: Subtree guidance for Program docs and Program packet folders under `docs/programs/`.",
		"docType: guide",
		"status: active",
		"read_when:",
		"  - Creating, refreshing, validating, or completing a Program.",
		"  - Changing Program packet folders or Program prompt contracts.",
		"---",
		"",
		"# Programs",
		"",
		"This subtree owns durable multi-slice initiative docs that sit above child ExecPlans.",
		"",
		"## Critical Rules",
		"",
		"- Keep Programs above implementation slices. Child ExecPlans own execution details.",
		"- Keep one Program per folder under `docs/programs/active/` or `docs/programs/completed/`.",
		"- A Program packet must keep `program.md`, research passes, normalized passes, convergence artifacts, immutable planning briefs, and a one-line `current-planning-brief.txt` pointer.",
		"- Advancing `current-planning-brief.txt` must not rewrite existing ExecPlan provenance.",
		"- Do not move a Program to `completed/` until initiative-level evidence and retrospective are complete.",
		"",
		"## Change Triggers",
		"",
		"- If a Program packet is created, include the required packet artifacts or clearly leave the Program in an incomplete active state.",
		"- If a planning brief is refreshed, write a new `planning-brief-<N>.md` and update `current-planning-brief.txt` to that filename.",
		"- If a child ExecPlan lands, update the Program slice ledger, next slice, risks, and planning brief only when initiative-level truth changed.",
		"- If Program prompt contracts change, keep `PROGRAMS.md`, `README.md`, and prompt assets aligned.",
		"",
		"## Verification",
		"",
		"- Run `bun run programs:lint` when present.",
		"- Run `bun run markdown:lint -- --paths docs/programs` when present.",
		"- For child ExecPlan linkage changes, also run `bun run plans:lint -- --plan <repo-relative-plan-path>` when present.",
		"- If a required script is missing, record blocked proof instead of inventing a pass.",
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
		"- `status`: `active` or `complete`.",
		"- `created_at`: `YYYY-MM-DD`, matching the packet folder prefix.",
		"- `completed_at`: `YYYY-MM-DD` only after completion, otherwise `null`.",
		"- `summary`: one sentence describing the initiative outcome target.",
		"- `post_build_recap`: `null` while active, then the completion summary.",
		"- `read_when`: concrete situations where future agents should load the Program.",
		"- The `title` value must match the H1 exactly.",
		"",
		"## Required Structure",
		"",
		"Every complete Program packet must include these artifacts:",
		"",
		"- `program.md` for the durable initiative record.",
		"- one or more research passes named `track-<N>-<slug>.md` or `research-pass-<slug>.md`.",
		"- one or more normalized passes named `normalized-track-<N>.md` or `normalized-pass-<slug>.md`.",
		"- `converged-decision-packet.md` for the accepted direction.",
		"- `dependency-graph.md` for ordering, coupling, and blocked work.",
		"- `plan-split-recommendation.md` for child ExecPlan boundaries.",
		"- `cross-repo-review.md` for risk review across repo, package, or system boundaries.",
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
		"The canonical Program prompt families are:",
		"",
		...PROGRAM_PROMPT_REFS.map((ref) => `- \`${ref}\``),
		...EXEC_PLAN_PROMPT_REFS.map((ref) => `- \`${ref}\``),
		"",
		"Use `bun run program:write-child-plan -- --program-id <program-id> --plan <plan-path>` when this repository provides it. That command resolves `current-planning-brief.txt` once, writes one child ExecPlan, and stamps `program_id` plus the immutable `planning_brief` path.",
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
			formatRefs(limitPrimaryDocsRefs(repoFacts.docsSurface.programRefs)),
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
		"- Research pass: `" + initialRefs.researchPassRef + "`",
		"- Normalized pass: `" + initialRefs.normalizedPassRef + "`",
		"- Converged decision packet: `" + initialRefs.convergedDecisionRef + "`",
		"- Dependency graph: `" + initialRefs.dependencyGraphRef + "`",
		"- Plan split recommendation: `" + initialRefs.planSplitRef + "`",
		"- Cross-repo review: `" + initialRefs.crossRepoReviewRef + "`",
		"- Planning brief: `" + initialRefs.planningBriefRef + "`",
		"- Canonical instruction refs: " +
			formatRefs(limitRefs(repoFacts.instructionSurface.agentInstructionRefs)),
		"- Instruction shim refs: " +
			formatRefs(limitRefs(repoFacts.instructionSurface.assistantShimRefs)),
		"- Package manager: `" + repoFacts.repositoryShape.packageManager + "`",
		"- Native gate candidates: " + formatRefs(nativeGateScriptNames),
		formatPlanningScriptReadiness(repoFacts),
		"",
		"## Current State",
		"",
		"- Package manager: `" + repoFacts.repositoryShape.packageManager + "`",
		"- Workspace packages: " +
			formatRefs(limitRefs(repoFacts.repositoryShape.workspacePackageRefs)),
		"- Agent instructions: " +
			formatRefs(repoFacts.instructionSurface.agentInstructionRefs),
		"- Native gate candidates: " + formatRefs(nativeGateScriptNames),
		formatPlanningScriptReadiness(repoFacts),
		"",
		"## Progress",
		"",
		"- [x] Created the initial docs-spine adoption Program packet artifacts.",
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
		formatPlanningScriptReadiness(repoFacts),
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
		"- Initial Program packet artifacts are listed in Program Inputs.",
		"- `current-planning-brief.txt` points at `planning-brief-1.md`.",
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

function renderInitialResearchPassMarkdown({
	repoFacts,
	nativeGateScriptNames,
	initialRefs,
}: {
	repoFacts: DocsSpineRepoFacts;
	nativeGateScriptNames: string[];
	initialRefs: InitialDocsSpineRefs;
}) {
	return [
		"# Research Pass: Docs Spine Surfaces",
		"",
		"## Research Question",
		"",
		"What repository facts must the docs-spine adoption packet preserve so future agents can start from checked-in guidance instead of chat history?",
		"",
		"## Source Inputs",
		"",
		"- Canonical instruction refs: " +
			formatRefs(limitRefs(repoFacts.instructionSurface.agentInstructionRefs)),
		"- Instruction shim refs: " +
			formatRefs(limitRefs(repoFacts.instructionSurface.assistantShimRefs)),
		"- Existing primary docs refs: " +
			formatRefs(limitPrimaryDocsRefs(repoFacts.docsSurface.docsRefs)),
		"- Program refs: " +
			formatRefs(limitPrimaryDocsRefs(repoFacts.docsSurface.programRefs)),
		"- ExecPlan refs: " +
			formatRefs(limitPrimaryDocsRefs(repoFacts.docsSurface.execPlanRefs)),
		"- Prompt refs: " +
			formatRefs(limitPrimaryDocsRefs(repoFacts.docsSurface.promptRefs)),
		"- Native gate candidates: " + formatRefs(nativeGateScriptNames),
		"",
		"## Findings",
		"",
		"The repository needs a first-hop docs index, Program contract, ExecPlan contract, prompt inventory, validation notes, proof notes, and quality-score contract that use repo-relative paths and preserve existing instruction ownership.",
		"",
		"The docs-spine runner must not treat package scripts, dependencies, CI, providers, runtime code, root instructions, hidden assistant folders, source files, tests, public assets, or generated caches as docs-spine outputs.",
		"",
		"## Acceptance Criteria From This Track",
		"",
		"- Generated docs route future agents through durable docs surfaces.",
		"- Program and ExecPlan contracts are available before implementation slices begin.",
		"- Native gates are run or blocked honestly with setup-shaped evidence.",
		"- The initial planning brief remains immutable once a child ExecPlan references it.",
		"- Program root: `" + initialRefs.programRootRef + "`",
		"",
	].join("\n");
}

function renderInitialNormalizedPassMarkdown({
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
		"# Normalized Pass: Docs Spine Adoption",
		"",
		"## Stable Direction",
		"",
		"Install the docs spine as a bounded documentation operating packet. The first slice should review the generated docs, fill any repo-specific gaps, and run or block the native gate without changing runtime code.",
		"",
		"## Normalized Facts",
		"",
		"- Package manager: `" + repoFacts.repositoryShape.packageManager + "`",
		"- Native gates: " + formatRefs(nativeGateScriptNames),
		"- Missing docs-spine surfaces: " + formatRefs(missingSurfaces),
		"- Program packet: `" + initialRefs.programRootRef + "`",
		"- Planning brief: `" + initialRefs.planningBriefRef + "`",
		"",
		"## Boundaries",
		"",
		"- In scope: docs-spine Markdown, Program packet artifacts, ExecPlan contract, prompt inventory, validation/proof notes, and quality-score contract.",
		"- Out of scope: package scripts, dependency manifests, lockfiles, CI, providers, root instructions, runtime code, generated mirrors, and branch pushes.",
		"",
		"## First Slice",
		"",
		"The first child ExecPlan should review the installed docs spine and prove the repository's native gate or record the exact setup blocker.",
		"",
	].join("\n");
}

function renderInitialConvergedDecisionMarkdown({
	repoFacts,
	initialRefs,
}: {
	repoFacts: DocsSpineRepoFacts;
	initialRefs: InitialDocsSpineRefs;
}) {
	return [
		"# Converged Decision Packet",
		"",
		"## Program Decision",
		"",
		"Adopt a repo-specific docs spine through checked-in Program and ExecPlan contracts rather than relying on one-off chat instructions.",
		"",
		"## Source-Of-Truth Decision",
		"",
		"Repository instruction files remain the authority for agent behavior. The docs index becomes the first-hop route after those instructions. Program packets own initiative-level memory. ExecPlans own one bounded implementation slice.",
		"",
		"## Validation Decision",
		"",
		"Use the repository's native package manager, `" +
			repoFacts.repositoryShape.packageManager +
			"`, and record native gate results in proof. Missing local setup is blocked proof, not a docs-spine quality pass or failure.",
		"",
		"## First Slice Decision",
		"",
		`Write the first child ExecPlan from \`${initialRefs.planningBriefRef}\` and keep it bounded to docs review and validation proof.`,
		"",
	].join("\n");
}

function renderInitialDependencyGraphMarkdown(
	initialRefs: InitialDocsSpineRefs,
) {
	return [
		"# Dependency Graph",
		"",
		"## Nodes",
		"",
		"- Node A: Review generated docs-spine Markdown.",
		"- Node B: Fill repo-specific blanks in docs-spine surfaces.",
		"- Node C: Run or block native validation with exact evidence.",
		"- Node D: Update the Program and child ExecPlan with final proof.",
		"",
		"## Order",
		"",
		"1. Node A must happen before edits so generated gaps are visible.",
		"2. Node B must happen before native validation so proof reflects the intended docs state.",
		"3. Node C must happen before the Program can be called reviewed.",
		"4. Node D closes the handoff state.",
		"",
		"## Current Planning Brief",
		"",
		`- \`${initialRefs.planningBriefRef}\``,
		"",
	].join("\n");
}

function renderInitialPlanSplitMarkdown(initialRefs: InitialDocsSpineRefs) {
	return [
		"# Plan Split Recommendation",
		"",
		"## Recommended First Child ExecPlan",
		"",
		"Create one bounded ExecPlan for docs-spine review and proof.",
		"",
		"## Scope",
		"",
		"- Review the installed docs index, Program, ExecPlan, prompt, validation, proof, and quality-score files.",
		"- Fill only repo-specific docs-spine gaps.",
		"- Run or block the native gate with exact evidence.",
		"",
		"## Out Of Scope",
		"",
		"- Runtime code changes.",
		"- Package script, dependency, lockfile, or CI edits.",
		"- Provider setup or root instruction rewrites.",
		"",
		"## Brief To Use",
		"",
		`- \`${initialRefs.planningBriefRef}\``,
		"",
	].join("\n");
}

function renderInitialCrossRepoReviewMarkdown(
	initialRefs: InitialDocsSpineRefs,
) {
	return [
		"# Cross-Repo Review",
		"",
		"## Review Scope",
		"",
		"This initial docs-spine Program is repository-local. It should not assume that conventions from Worker, Ship by Sunday, or another customer repo apply unless the scanner found matching repo-local evidence.",
		"",
		"## Risks",
		"",
		"- Overwriting owner-written docs instead of preserving managed sections.",
		"- Treating missing native setup as proof success.",
		"- Routing future agents through source files, tests, hidden folders, or generated caches as primary docs guidance.",
		"- Creating implementation scope before the customer approves a code-writing workflow.",
		"",
		"## Correction",
		"",
		"Keep this Program at initiative level. Use the first child ExecPlan only for docs review and proof unless a separate approval widens authority.",
		"",
		"## Planning Brief",
		"",
		`- \`${initialRefs.planningBriefRef}\``,
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
		"title: 'Planning Brief 1: Docs Spine Adoption'",
		`program_id: ${initialRefs.programId}`,
		"brief_version: 1",
		"status: current",
		"summary: First planning brief for reviewing the installed docs spine and proving the native repository gate.",
		"read_when:",
		"  - Writing the first docs-spine adoption child ExecPlan.",
		"  - Checking the first review and proof slice for the installed docs spine.",
		"---",
		"",
		"# Planning Brief 1: Docs Spine Adoption",
		"",
		"Install the first docs-spine slice for this repository and keep the result aligned with the repository's native instructions, docs, and validation gate.",
		"",
		"## Program",
		"",
		"Program id: `" + initialRefs.programId + "`",
		"",
		"Program packet: `" + initialRefs.programRootRef + "/`",
		"",
		"## Goal",
		"",
		"Review the installed docs spine, fill only repo-specific docs gaps, and prove the native repository gate or record the exact setup blocker.",
		"",
		"## Converged Decisions",
		"",
		"- Review the generated docs index, Program, ExecPlan, prompt, validation, proof, and quality-score files.",
		"- Fill any missing repo-specific context without changing runtime code, package scripts, CI, or provider setup.",
		"- Run or honestly block the repo-native gate with exact evidence.",
		"",
		"## Open Questions",
		"",
		"- Which missing docs-spine surfaces should the repository owner fill now versus defer to later implementation work?",
		"",
		"## Final Plan Split",
		"",
		"1. Review docs-spine Markdown and source-truth routing.",
		"2. Fill repo-specific docs gaps inside the approved docs-spine surface.",
		"3. Run native proof or record setup-shaped blocked proof.",
		"",
		"## Final Dependency Order",
		"",
		"1. Read instructions and docs-spine contracts.",
		"2. Inspect generated docs-spine files.",
		"3. Edit only approved docs-spine files.",
		"4. Run proof commands.",
		"5. Update Program and ExecPlan outcomes.",
		"",
		"## First ExecPlan To Write",
		"",
		"- Title: Adopt Docs Spine First Slice",
		"- Scope: Review and prove the installed docs spine.",
		"- Boundaries: no runtime code, package script, dependency, CI, provider, or root instruction edits.",
		"",
		"## Why This First",
		"",
		"The docs spine should become trusted repo memory before it drives implementation work.",
		"",
		"## Inputs",
		"",
		"- Package manager: `" + repoFacts.repositoryShape.packageManager + "`",
		"- Canonical instruction refs: " +
			formatRefs(limitRefs(repoFacts.instructionSurface.agentInstructionRefs)),
		"- Native gate candidates: " + formatRefs(nativeGateScriptNames),
		formatPlanningScriptReadiness(repoFacts),
		"",
		"## Acceptance",
		"",
		"- Applied Markdown passes the docs-spine quality report.",
		"- The Program and ExecPlan remain linked through this immutable planning brief.",
		"- Native gate proof is either passed or blocked with the exact setup reason.",
		"",
	].join("\n");
}

function renderActiveProgramsIndexMarkdown(initialRefs: InitialDocsSpineRefs) {
	const activeProgramIndexLink = initialRefs.programRootRef.replace(
		"docs/programs/active/",
		"",
	);
	return [
		"---",
		"title: Active Programs",
		"summary: Index of active Program packets in this repository.",
		"docType: index",
		"status: active",
		"read_when:",
		"  - Finding active multi-slice initiatives.",
		"  - Creating or updating a Program packet.",
		"---",
		"",
		"# Active Programs",
		"",
		"Keep this index current when adding, completing, or moving Program packets.",
		"",
		"## Programs",
		"",
		`- [Docs Spine Adoption](${activeProgramIndexLink}/program.md) - initial docs-spine operating-system adoption packet.`,
		"",
	].join("\n");
}

function renderCompletedProgramsIndexMarkdown() {
	return [
		"---",
		"title: Completed Programs",
		"summary: Index of completed Program packets in this repository.",
		"docType: index",
		"status: active",
		"read_when:",
		"  - Looking for completed initiative history.",
		"  - Moving an active Program to completed.",
		"---",
		"",
		"# Completed Programs",
		"",
		"Move completed Program packet links here only after the Program outcome record and validation evidence are complete.",
		"",
		"## Programs",
		"",
		"- None yet.",
		"",
	].join("\n");
}

function renderExecPlansIndexMarkdown() {
	return [
		"---",
		"title: ExecPlans",
		"summary: Canonical docs-first landing page for ExecPlan contract, active plans, completed plans, and planning follow-ups.",
		"docType: index",
		"status: active",
		"read_when:",
		"  - Orienting to the canonical ExecPlan surface.",
		"  - Finding the contract, active plans, or completed plans.",
		"---",
		"",
		"# ExecPlans",
		"",
		"`docs/exec-plans/` is the canonical ExecPlan surface for this repository.",
		"",
		"Use `docs/exec-plans/PLANS.md` as the contract for authoring, revising, linting, and executing ExecPlans.",
		"",
		"Keep unfinished work under `docs/exec-plans/active/` and move finished plans into `docs/exec-plans/completed/` only after `status: complete`, `completed_at`, `post_build_recap`, validation evidence, and the retrospective are real.",
		"",
		"## Lanes",
		"",
		"- Active plans: `docs/exec-plans/active/index.md`.",
		"- Completed plans: `docs/exec-plans/completed/index.md`.",
		"- Contract: `docs/exec-plans/PLANS.md`.",
		"",
		"## Program Linkage",
		"",
		"Program-owned ExecPlans must include both `program_id` and `planning_brief` frontmatter. The planning brief must be a repo-relative immutable `planning-brief-<N>.md` path, never `current-planning-brief.txt`.",
		"",
		"## Validation",
		"",
		"Use these repo-owned proof surfaces when present:",
		"",
		"```bash",
		"bun run plans:lint -- --plan docs/exec-plans/active/YYYY-MM-DD-slice.md",
		"bun run markdown:lint -- --paths docs/exec-plans/active/YYYY-MM-DD-slice.md",
		"bun run docs:validate",
		"```",
		"",
	].join("\n");
}

function renderExecPlansAgentsMarkdown() {
	return [
		"---",
		"title: ExecPlans",
		"summary: Subtree guidance for active and completed ExecPlans under `docs/exec-plans/`.",
		"docType: guide",
		"status: active",
		"read_when:",
		"  - Creating, grilling, executing, validating, completing, or moving an ExecPlan.",
		"  - Changing files under `docs/exec-plans/`.",
		"---",
		"",
		"# ExecPlans",
		"",
		"This subtree owns active and completed ExecPlan files. The contract is `docs/exec-plans/PLANS.md`.",
		"",
		"## Critical Rules",
		"",
		"- Read `PLANS.md` before writing or revising an ExecPlan.",
		"- Use dated filenames in `YYYY-MM-DD-<slug>.md` form for new plans.",
		"- Keep active plans under `docs/exec-plans/active/` and move complete plans to `docs/exec-plans/completed/` only when the retrospective and validation evidence are done.",
		"- Do not churn completed archives unless the active task directly touches that plan.",
		"- Program-linked plans must pair `program_id` with an immutable `planning_brief` path, never `current-planning-brief.txt`.",
		"- Keep `### Test Commands` runnable and specific to the touched slice.",
		"",
		"## Change Triggers",
		"",
		"- If a plan is created or materially revised, inspect the real repo surfaces before freezing scope.",
		"- If a plan is executed, keep `Progress`, discoveries, decisions, and validation receipts current as reality changes.",
		"- If a plan becomes complete, fill `completed_at`, `post_build_recap`, and `Outcomes & Retrospective` before moving it.",
		"- If Program linkage changes, update the owning Program packet only when initiative-level truth changed.",
		"",
		"## Verification",
		"",
		"- Run `bun run plans:lint -- --plan <repo-relative-plan-path>` when present.",
		"- Run `bun run markdown:lint -- --paths <repo-relative-plan-path>` when present.",
		"- If the ExecPlan contract itself changes, run representative active and completed plan lint checks when the repo provides them.",
		"- If a required script is missing, record blocked proof instead of inventing a pass.",
		"",
	].join("\n");
}

function renderActiveExecPlansIndexMarkdown() {
	return [
		"---",
		"title: Active ExecPlans",
		"summary: Entry point for unfinished ExecPlans that still have implementation, validation, or follow-up work left.",
		"docType: index",
		"status: active",
		"read_when:",
		"  - Starting implementation from an unfinished ExecPlan.",
		"  - Choosing the canonical path for a new ExecPlan.",
		"---",
		"",
		"# Active ExecPlans",
		"",
		"Keep new and unfinished ExecPlans in this directory.",
		"",
		"Every plan in `docs/exec-plans/active/` must satisfy `docs/exec-plans/PLANS.md`, keep its living sections current, and stay in `status: active` until the work is actually complete.",
		"",
	].join("\n");
}

function renderCompletedExecPlansIndexMarkdown() {
	return [
		"---",
		"title: Completed ExecPlans",
		"summary: Archive lane for finished ExecPlans whose work, validation, and retrospective are complete.",
		"docType: index",
		"status: active",
		"read_when:",
		"  - Reviewing finished migrations or feature deliveries.",
		"  - Checking how a prior ExecPlan concluded.",
		"---",
		"",
		"# Completed ExecPlans",
		"",
		"Move an ExecPlan into this directory only after the work is complete.",
		"",
		"Every plan in `docs/exec-plans/completed/` must satisfy `docs/exec-plans/PLANS.md`, use `status: complete`, fill in `completed_at`, and include a meaningful `Outcomes & Retrospective`.",
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
		"- `status`: `active` or `complete`.",
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
			formatRefs(limitPrimaryDocsRefs(repoFacts.docsSurface.execPlanRefs)),
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
		formatPlanningScriptReadiness(repoFacts),
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
		"- Program creation and repair: `docs/prompts/program-create.md`.",
		...PROGRAM_PROMPT_REFS.map((ref) => `- Program funnel: \`${ref}\`.`),
		...EXEC_PLAN_PROMPT_REFS.map((ref) => `- ExecPlan loop: \`${ref}\`.`),
		"- Review prompt assets for branch review, risk review, and docs-spine quality review.",
		"- Synthesis prompts for turning scanner facts into repo-specific Markdown drafts.",
		"",
		"## Usage",
		"",
		"Use prompt files for durable workflow prompts, review prompts, synthesis prompts, and adoption prompts that should survive beyond one chat session. Every prompt that produces a durable artifact should include a quality gate before returning.",
		"",
		"Detected prompt refs: " +
			formatRefs(limitPrimaryDocsRefs(repoFacts.docsSurface.promptRefs)),
		"",
	].join("\n");
}

function renderPromptAgentsMarkdown() {
	return [
		"---",
		"title: Prompts",
		"summary: Subtree guidance for reusable Program and ExecPlan prompt contracts.",
		"docType: guide",
		"status: active",
		"read_when:",
		"  - Creating or revising workflow prompts.",
		"  - Checking prompt quality gates before using Program or ExecPlan automation.",
		"---",
		"",
		"# Prompts",
		"",
		"This subtree owns reusable prompt contracts. Prompt files are source-of-truth handoff assets, not examples to copy loosely.",
		"",
		"## Critical Rules",
		"",
		"- Every prompt that writes a durable artifact must name the input docs it reads, the artifact it writes, and the quality gate it runs before returning.",
		"- Program prompts must preserve the Program packet model from `docs/programs/PROGRAMS.md`.",
		"- ExecPlan prompts must preserve the section and frontmatter contract from `docs/exec-plans/PLANS.md`.",
		"- Prompts must use repo-relative paths and must not rely on chat-only context for durable state.",
		"",
		"## Verification",
		"",
		"- Run `bun run markdown:lint -- --paths docs/prompts` when present.",
		"- Run `bun run programs:lint` when prompt changes affect Program packet contracts and the repo provides that script.",
		"- Run `bun run plans:lint -- --plan <repo-relative-plan-path>` for any touched ExecPlan generated from a changed prompt.",
		"- If a required script is missing, record blocked proof instead of inventing a pass.",
		"",
	].join("\n");
}

function renderProgramCreatePromptMarkdown(repoFacts: DocsSpineRepoFacts) {
	return [
		"---",
		"title: Program Create Prompt",
		"summary: Agent prompt for creating or updating durable Program packets.",
		"docType: prompt",
		"status: active",
		"read_when:",
		"  - Creating a new multi-slice Program.",
		"  - Reviewing whether Program packet structure is complete.",
		"---",
		"",
		"# Program Create Prompt",
		"",
		"Use this prompt when an agent needs to create a new Program packet or repair an incomplete Program packet.",
		"",
		"## Load Order",
		"",
		"- Read the nearest applicable instruction file before writing Program docs.",
		"- Start with canonical instruction refs: " +
			formatRefs(limitRefs(repoFacts.instructionSurface.agentInstructionRefs)),
		"- Then read `docs/index.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `docs/validation.md`, and `docs/proof.md`.",
		"- Read existing Program indexes when present: `docs/programs/active/index.md` and `docs/programs/completed/index.md`.",
		"",
		"## Inputs",
		"",
		"- User request or issue statement.",
		"- Relevant existing docs, code paths, PRs, issues, provider setup notes, and validation constraints.",
		"- Package manager: `" + repoFacts.repositoryShape.packageManager + "`",
		"- Native package scripts detected by scanner: " +
			formatRefs(limitRefs(repoFacts.repositoryShape.packageScripts)),
		"",
		"## Creation Steps",
		"",
		"1. Choose a lowercase `program_id` slug that names the initiative, not the implementation tactic.",
		"2. Create `docs/programs/active/<YYYY-MM-DD>-<program_id>/program.md` with the frontmatter required by `docs/programs/PROGRAMS.md`.",
		"3. Add every required Program section in the documented order.",
		"4. Create at least one durable research pass named `track-<N>-<slug>.md` or `research-pass-<slug>.md`.",
		"5. Create at least one normalized pass named `normalized-track-<N>.md` or `normalized-pass-<slug>.md`.",
		"6. Create `converged-decision-packet.md`, `dependency-graph.md`, `plan-split-recommendation.md`, and `cross-repo-review.md` in the same packet.",
		"7. Create `planning-brief-1.md` with the repository's planning-brief frontmatter and create `current-planning-brief.txt` containing exactly `planning-brief-1.md`.",
		"8. Link child ExecPlans to the immutable brief with `program_id` and `planning_brief` frontmatter only after the Program packet exists.",
		"9. Update `docs/programs/active/index.md` when it exists. If no index exists, create one with frontmatter and a link to the new Program.",
		"10. Do not edit package scripts, dependencies, CI, provider settings, runtime code, or root instructions unless a separate approved task explicitly authorizes that change.",
		"",
		"## Required Packet Outputs",
		"",
		"- `program.md`",
		"- one or more `track-<N>-<slug>.md` or `research-pass-<slug>.md` files",
		"- one or more `normalized-track-<N>.md` or `normalized-pass-<slug>.md` files",
		"- `converged-decision-packet.md`",
		"- `dependency-graph.md`",
		"- `plan-split-recommendation.md`",
		"- `cross-repo-review.md`",
		"- `planning-brief-1.md`",
		"- `current-planning-brief.txt`",
		"",
		"## Quality Gate",
		"",
		"- Confirm every Required Packet Output exists in the Program root.",
		"- Confirm `program.md` has frontmatter keys: `program_id`, `title`, `status`, `created_at`, `completed_at`, `summary`, `post_build_recap`, and `read_when`.",
		"- Confirm the packet folder date and slug match `created_at` and `program_id`.",
		"- Confirm `planning-brief-1.md` has the repository's required planning-brief frontmatter and an H1 matching its title.",
		"- Confirm `current-planning-brief.txt` contains exactly `planning-brief-1.md`.",
		"- Confirm all child ExecPlans use repo-relative links and the matching planning brief.",
		"- Run `programs:lint` when the repository provides it.",
		"- Run `markdown:lint`, `docs:validate`, or the nearest repo-native docs check when present.",
		"- If no Program or Markdown lint script exists, record that as blocked proof in the Program Validation and Acceptance section instead of inventing a pass.",
		"",
		"## Output",
		"",
		"- A complete Program packet under `docs/programs/active/`.",
		"- Updated active Program index when the repo has one.",
		"- Validation notes naming the exact commands run or the exact missing-script blocker.",
		"",
	].join("\n");
}

function renderPromptAssetMarkdownFiles(repoFacts: DocsSpineRepoFacts) {
	return [
		...PROGRAM_PROMPT_REFS.map((targetRef) => ({
			targetRef,
			markdown: renderProgramPromptMarkdown(targetRef, repoFacts),
		})),
		...EXEC_PLAN_PROMPT_REFS.map((targetRef) => ({
			targetRef,
			markdown: renderExecPlanPromptMarkdown(targetRef, repoFacts),
		})),
	];
}

function renderProgramPromptMarkdown(
	targetRef: (typeof PROGRAM_PROMPT_REFS)[number],
	repoFacts: DocsSpineRepoFacts,
) {
	const prompt = getProgramPromptDefinition(targetRef);
	return [
		"---",
		`title: ${prompt.title}`,
		`summary: ${prompt.summary}`,
		"docType: prompt",
		"status: active",
		"read_when:",
		`  - ${prompt.readWhen}`,
		"---",
		"",
		`# ${prompt.title}`,
		"",
		prompt.usage,
		"",
		"## Prompt",
		"",
		"```text",
		"Read the nearest applicable instruction file first and follow it.",
		"",
		"Read `docs/index.md`, `docs/programs/README.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, and `docs/prompts/README.md` before writing Program artifacts.",
		"",
		`You are running the ${prompt.title} step for one Program packet. Do not implement runtime code, edit package scripts, change dependencies, touch CI, or rewrite root instructions unless a separate approved task explicitly authorizes that work.`,
		"",
		"Use this Program root:",
		"<program_root>",
		"docs/programs/active/YYYY-MM-DD-program-id/",
		"</program_root>",
		"",
		"Inputs to read:",
		...prompt.inputs.map((input) => `- ${input}`),
		"",
		"Artifact to write:",
		...prompt.outputs.map((output) => `- ${output}`),
		"",
		"Rules:",
		...prompt.rules.map((rule) => `- ${rule}`),
		"",
		"Quality gate before returning:",
		...prompt.qualityGate.map((rule) => `- ${rule}`),
		"- Run `bun run programs:lint` when the repository provides it.",
		"- Run `bun run markdown:lint -- --paths docs/programs docs/prompts` when the repository provides it.",
		"- If a required script is missing, record the exact missing-script blocker as blocked proof.",
		"",
		"Return:",
		"- artifact paths written",
		"- key decisions or unresolved watchpoints",
		"- validation commands and results or blocked proof",
		"```",
		"",
		"## Repo Facts",
		"",
		"- Package manager: `" + repoFacts.repositoryShape.packageManager + "`",
		"- Detected package scripts: " +
			formatRefs(limitRefs(repoFacts.repositoryShape.packageScripts)),
		"",
	].join("\n");
}

function getProgramPromptDefinition(
	targetRef: (typeof PROGRAM_PROMPT_REFS)[number],
) {
	const sharedQualityGate = [
		"Confirm the Program root uses `docs/programs/active/YYYY-MM-DD-program-id/`.",
		"Confirm visible paths are repo-relative.",
		"Confirm the packet can be resumed without chat history.",
	];
	const definitions: Record<
		(typeof PROGRAM_PROMPT_REFS)[number],
		{
			title: string;
			summary: string;
			readWhen: string;
			usage: string;
			inputs: string[];
			outputs: string[];
			rules: string[];
			qualityGate: string[];
		}
	> = {
		"docs/prompts/program-orchestrator.md": {
			title: "Program Orchestrator",
			summary:
				"Prompt asset for choosing the next correct Program Funnel or refresh step from checked-in Program state.",
			readWhen:
				"Resuming a Program and deciding which Program prompt should run next.",
			usage:
				"Use this when the next Program action is unclear and the repo state must choose the next prompt.",
			inputs: [
				"`program.md`",
				"`current-planning-brief.txt` when present",
				"packet artifact list",
				"active child ExecPlan list",
			],
			outputs: ["the next prompt path and the reason it is next"],
			rules: [
				"Do not write packet artifacts during orchestration.",
				"Choose exactly one next prompt unless the Program is complete.",
			],
			qualityGate: [
				...sharedQualityGate,
				"Confirm the chosen next step follows the Program Funnel order.",
			],
		},
		"docs/prompts/program-initialize.md": {
			title: "Program Initialize",
			summary:
				"Prompt asset for creating the minimum checked-in Program root before packet artifacts are promoted.",
			readWhen: "Starting a new Program before packet artifacts exist.",
			usage:
				"Use this before the Program Funnel when the Program folder does not exist yet.",
			inputs: ["user objective", "known constraints", "known source docs"],
			outputs: ["`program.md`"],
			rules: [
				"Create only the Program root and honest skeletal `program.md`.",
				"Do not create placeholder packet files that would mislead `programs:lint`.",
				"Do not create `current-planning-brief.txt` until `planning-brief-1.md` exists.",
			],
			qualityGate: [
				...sharedQualityGate,
				"Confirm `program.md` states the packet is not complete yet.",
			],
		},
		"docs/prompts/program-funnel.md": {
			title: "Program Funnel",
			summary:
				"Controller prompt for turning a rough initiative into a complete Program packet.",
			readWhen: "Running the first packet funnel for a multi-slice initiative.",
			usage:
				"Use this as the controller for the initial Program packet creation sequence.",
			inputs: [
				"Program root",
				"initiative objective",
				"available durable inputs",
			],
			outputs: ["complete Program packet artifact checklist"],
			rules: [
				"Run funnel steps in order from research through planning brief.",
				"Do not skip convergence artifacts because the user phrased the initiative briefly.",
			],
			qualityGate: [
				...sharedQualityGate,
				"Confirm the packet includes every required artifact before declaring it complete.",
			],
		},
		"docs/prompts/program-research-passes.md": {
			title: "Program Research Passes",
			summary:
				"Prompt asset for promoting stable source research into track files inside a Program packet.",
			readWhen: "Capturing durable research inputs for a Program.",
			usage: "Use this to create one or more track files before normalization.",
			inputs: ["source docs", "repo inspection notes", "user request"],
			outputs: [
				"`track-1-<slug>.md` and additional `track-<N>-<slug>.md` files when needed",
			],
			rules: [
				"Keep unresolved scratch outside the Program root until it is stable.",
				"Record evidence and uncertainty without pretending decisions have converged.",
			],
			qualityGate: [
				...sharedQualityGate,
				"Confirm at least one research pass exists before normalization.",
			],
		},
		"docs/prompts/program-normalize-pass.md": {
			title: "Program Normalize Pass",
			summary:
				"Prompt asset for turning one research track into one normalized decision memo.",
			readWhen: "Normalizing Program research into stable track memos.",
			usage: "Run this once per research track that should feed convergence.",
			inputs: ["one `track-<N>-<slug>.md` file"],
			outputs: ["matching `normalized-track-<N>.md` file"],
			rules: [
				"Normalize one track at a time.",
				"Do not merge cross-track decisions until the converged decision packet step.",
			],
			qualityGate: [
				...sharedQualityGate,
				"Confirm each normalized memo points back to the research track it normalized.",
			],
		},
		"docs/prompts/program-converged-decision-packet.md": {
			title: "Program Converged Decision Packet",
			summary:
				"Prompt asset for writing the accepted Program direction after normalized tracks exist.",
			readWhen:
				"Converging normalized Program tracks into one accepted direction.",
			usage:
				"Use this after normalized passes exist and before dependency ordering.",
			inputs: ["all `normalized-track-<N>.md` files", "`program.md`"],
			outputs: ["`converged-decision-packet.md`"],
			rules: [
				"Separate accepted decisions from open questions.",
				"Name why rejected alternatives were not chosen when that matters to later slices.",
			],
			qualityGate: [
				...sharedQualityGate,
				"Confirm every accepted direction traces to normalized inputs.",
			],
		},
		"docs/prompts/program-dependency-graph.md": {
			title: "Program Dependency Graph",
			summary:
				"Prompt asset for ordering Program work and naming coupling before child plan splitting.",
			readWhen: "Mapping Program dependencies and blocked work.",
			usage:
				"Use this after the converged decision packet and before plan splitting.",
			inputs: ["`converged-decision-packet.md`", "normalized passes"],
			outputs: ["`dependency-graph.md`"],
			rules: [
				"Name sequencing constraints, parallelizable work, and hard blockers.",
				"Keep dependency nodes at initiative level, not line-by-line implementation steps.",
			],
			qualityGate: [
				...sharedQualityGate,
				"Confirm the graph explains what must happen before the first child ExecPlan.",
			],
		},
		"docs/prompts/program-plan-split-recommendation.md": {
			title: "Program Plan Split Recommendation",
			summary:
				"Prompt asset for choosing child ExecPlan boundaries from Program decisions and dependencies.",
			readWhen: "Splitting a Program into executable child plans.",
			usage: "Use this after dependency ordering and before cross-repo review.",
			inputs: ["`converged-decision-packet.md`", "`dependency-graph.md`"],
			outputs: ["`plan-split-recommendation.md`"],
			rules: [
				"Recommend bounded child ExecPlans with concrete validation paths.",
				"Put later slices out of scope for the first child plan.",
			],
			qualityGate: [
				...sharedQualityGate,
				"Confirm the first recommended child ExecPlan is small enough to validate.",
			],
		},
		"docs/prompts/program-cross-repo-review.md": {
			title: "Program Cross-Repo Review",
			summary:
				"Prompt asset for reviewing Program plan boundaries across repo, package, provider, or system edges.",
			readWhen: "Checking Program splits for cross-surface risks.",
			usage:
				"Use this after the plan split recommendation and before writing the planning brief.",
			inputs: [
				"`plan-split-recommendation.md`",
				"`dependency-graph.md`",
				"repo instruction docs",
			],
			outputs: ["`cross-repo-review.md`"],
			rules: [
				"Name boundaries that could cause hidden scope expansion.",
				"Correct the first child slice when dependency or ownership review changes it.",
			],
			qualityGate: [
				...sharedQualityGate,
				"Confirm cross-surface risks are either assigned to a slice or explicitly deferred.",
			],
		},
		"docs/prompts/program-planning-brief.md": {
			title: "Program Planning Brief",
			summary:
				"Prompt asset for writing the first immutable Program planning brief and current pointer.",
			readWhen: "Creating `planning-brief-1.md` for a Program.",
			usage:
				"Use this after convergence, dependency ordering, split recommendation, and cross-repo review.",
			inputs: [
				"`converged-decision-packet.md`",
				"`dependency-graph.md`",
				"`plan-split-recommendation.md`",
				"`cross-repo-review.md`",
			],
			outputs: ["`planning-brief-1.md`", "`current-planning-brief.txt`"],
			rules: [
				"`current-planning-brief.txt` must contain exactly `planning-brief-1.md`.",
				"The brief frontmatter must include `title`, `program_id`, `brief_version`, `status`, `summary`, and `read_when`.",
				"The brief H1 must match frontmatter title exactly.",
			],
			qualityGate: [
				...sharedQualityGate,
				"Confirm the first child ExecPlan title, scope, and boundaries are exact.",
			],
		},
		"docs/prompts/program-doc-synthesis.md": {
			title: "Program Doc Synthesis",
			summary:
				"Prompt asset for refreshing `program.md` from the complete packet artifacts.",
			readWhen:
				"Synthesizing or refreshing a Program document after packet artifacts exist.",
			usage:
				"Use this after packet artifacts are complete or after a refresh changes initiative truth.",
			inputs: ["all packet artifacts", "active and completed child ExecPlans"],
			outputs: ["refreshed `program.md`"],
			rules: [
				"Keep `program.md` at initiative level.",
				"Do not duplicate child ExecPlan implementation details.",
			],
			qualityGate: [
				...sharedQualityGate,
				"Confirm `program.md` lists the durable packet artifacts and next slice truthfully.",
			],
		},
		"docs/prompts/program-loop.md": {
			title: "Program Loop",
			summary:
				"Controller prompt for repeating child ExecPlan generation, execution, validation, and Program refresh.",
			readWhen:
				"Continuing a Program after at least one planning brief exists.",
			usage: "Use this to route one complete Program child-plan loop.",
			inputs: [
				"`program.md`",
				"`current-planning-brief.txt`",
				"latest child ExecPlan state",
			],
			outputs: ["next action in the child ExecPlan loop"],
			rules: [
				"Resolve `current-planning-brief.txt` once before writing a child ExecPlan.",
				"After a child plan validates, refresh Program truth before writing the next brief.",
			],
			qualityGate: [
				...sharedQualityGate,
				"Confirm the loop step preserves immutable brief provenance.",
			],
		},
		"docs/prompts/program-docs-sync.md": {
			title: "Program Docs Sync",
			summary:
				"Prompt asset for syncing durable docs after a child ExecPlan changes repository truth.",
			readWhen:
				"Updating docs after Program-owned implementation changes land.",
			usage:
				"Use this after child ExecPlan validation and before planning refresh.",
			inputs: ["completed child ExecPlan", "changed docs and code refs"],
			outputs: ["updated durable docs refs"],
			rules: [
				"Sync only docs that changed truthfully because of validated work.",
				"Do not rewrite Program history or planning briefs used by prior ExecPlans.",
			],
			qualityGate: [
				...sharedQualityGate,
				"Confirm docs changes have validation receipts from the child ExecPlan.",
			],
		},
		"docs/prompts/program-planning-refresh.md": {
			title: "Program Planning Refresh",
			summary:
				"Prompt asset for writing the next immutable planning brief after a child slice validates.",
			readWhen: "Refreshing a Program after a child ExecPlan finishes.",
			usage:
				"Use this after validation and docs sync to choose the next slice.",
			inputs: [
				"`program.md`",
				"completed child ExecPlan",
				"current packet artifacts",
			],
			outputs: [
				"next `planning-brief-<N>.md`",
				"updated `current-planning-brief.txt`",
				"refreshed `program.md`",
			],
			rules: [
				"Never rewrite an existing planning brief that an ExecPlan used.",
				"Advance the pointer only after the new brief exists.",
			],
			qualityGate: [
				...sharedQualityGate,
				"Confirm the next brief version increments exactly once.",
			],
		},
		"docs/prompts/program-completion-review.md": {
			title: "Program Completion Review",
			summary:
				"Prompt asset for deciding whether a Program can move from active to completed.",
			readWhen: "Checking whether initiative-level work is actually complete.",
			usage:
				"Use this before moving a Program packet to `docs/programs/completed/`.",
			inputs: ["`program.md`", "slice ledger", "validation receipts", "risks"],
			outputs: ["completion decision and updated Program retrospective"],
			rules: [
				"Move a Program only when no required next slice remains.",
				"Use `status: complete`, a real `completed_at`, and a non-empty `post_build_recap` only after the retrospective is meaningful.",
			],
			qualityGate: [
				...sharedQualityGate,
				"Confirm `Next Slice` starts with no required next slice remains before completion.",
			],
		},
	};
	return definitions[targetRef];
}

function renderExecPlanPromptMarkdown(
	targetRef: (typeof EXEC_PLAN_PROMPT_REFS)[number],
	repoFacts: DocsSpineRepoFacts,
) {
	const prompt = getExecPlanPromptDefinition(targetRef);
	return [
		"---",
		`title: ${prompt.title}`,
		`summary: ${prompt.summary}`,
		"docType: prompt",
		"status: active",
		"read_when:",
		`  - ${prompt.readWhen}`,
		"---",
		"",
		`# ${prompt.title}`,
		"",
		prompt.usage,
		"",
		"## Prompt",
		"",
		"```text",
		"Read the nearest applicable instruction file first and follow it.",
		"",
		"Read `docs/index.md` and `docs/exec-plans/PLANS.md`. If the work belongs to a Program, also read `docs/programs/PROGRAMS.md`, the owning `program.md`, `current-planning-brief.txt`, and the exact immutable planning brief revision.",
		"",
		`You are running the ${prompt.title} step for one bounded ExecPlan slice.`,
		"",
		"Inputs to read:",
		...prompt.inputs.map((input) => `- ${input}`),
		"",
		"Artifact to write or update:",
		...prompt.outputs.map((output) => `- ${output}`),
		"",
		"Rules:",
		...prompt.rules.map((rule) => `- ${rule}`),
		"",
		"Quality gate before returning:",
		...prompt.qualityGate.map((rule) => `- ${rule}`),
		"- Run `bun run plans:lint -- --plan <repo-relative-plan-path>` when the repository provides it.",
		"- Run `bun run markdown:lint -- --paths <repo-relative-plan-path>` when the repository provides it.",
		"- If a required script is missing, record the exact missing-script blocker as blocked proof.",
		"",
		"Return:",
		"- target ExecPlan path",
		"- scope and validation summary",
		"- validation commands and results or blocked proof",
		"```",
		"",
		"## Repo Facts",
		"",
		"- Package manager: `" + repoFacts.repositoryShape.packageManager + "`",
		"- Detected package scripts: " +
			formatRefs(limitRefs(repoFacts.repositoryShape.packageScripts)),
		"",
	].join("\n");
}

function getExecPlanPromptDefinition(
	targetRef: (typeof EXEC_PLAN_PROMPT_REFS)[number],
) {
	const definitions: Record<
		(typeof EXEC_PLAN_PROMPT_REFS)[number],
		{
			title: string;
			summary: string;
			readWhen: string;
			usage: string;
			inputs: string[];
			outputs: string[];
			rules: string[];
			qualityGate: string[];
		}
	> = {
		"docs/prompts/exec-plan-writer.md": {
			title: "ExecPlan Writer",
			summary:
				"Prompt asset for writing one self-contained child ExecPlan from approved scope or a Program planning brief.",
			readWhen: "Writing a new active ExecPlan.",
			usage:
				"Use this when feature work is scoped enough to formalize but implementation must not start yet.",
			inputs: [
				"approved feature outline or immutable Program planning brief",
				"real repo surfaces touched by the slice",
			],
			outputs: ["one `docs/exec-plans/active/YYYY-MM-DD-<slug>.md` file"],
			rules: [
				"Inspect real code and docs before freezing scope.",
				"Use the exact required section order from `docs/exec-plans/PLANS.md`.",
				"Pair `program_id` and `planning_brief` when the plan belongs to a Program.",
				"`planning_brief` must point at a versioned `planning-brief-<N>.md`, never the pointer file.",
			],
			qualityGate: [
				"Confirm the plan is self-contained for a fresh coding agent.",
				"Confirm `### In Scope`, `### Out Of Scope`, and `### Test Commands` exist.",
				"Confirm the Test Commands list contains at least one runnable command.",
			],
		},
		"docs/prompts/exec-plan-grill.md": {
			title: "ExecPlan Grill",
			summary:
				"Prompt asset for stress-testing an ExecPlan before implementation starts.",
			readWhen: "Checking whether an ExecPlan is ready to execute.",
			usage: "Use this after writing a plan and before coding from it.",
			inputs: ["target ExecPlan", "nearest relevant source and docs"],
			outputs: ["revised ExecPlan or explicit blocker list"],
			rules: [
				"Find hidden assumptions, missing files, impossible validation, and scope bleed.",
				"Patch the plan directly when fixes are clear and inside scope.",
			],
			qualityGate: [
				"Confirm every open question is either resolved or marked as a blocker.",
				"Confirm validation commands prove the intended behavior.",
			],
		},
		"docs/prompts/exec-plan-execute.md": {
			title: "ExecPlan Execute",
			summary:
				"Prompt asset for implementing an approved ExecPlan in validated increments.",
			readWhen: "Executing code changes from an approved ExecPlan.",
			usage:
				"Use this when the plan is approved and the next step is implementation.",
			inputs: [
				"target ExecPlan",
				"files named by the plan",
				"validation commands",
			],
			outputs: ["code/docs changes plus updated living ExecPlan sections"],
			rules: [
				"Do not ask for next steps when the ExecPlan already defines them.",
				"Keep Progress, discoveries, decisions, and validation receipts current.",
				"Do not silently absorb out-of-scope adjacent work.",
			],
			qualityGate: [
				"Confirm implementation changed the behavior the plan promised.",
				"Confirm the plan reflects the actual final state at the stopping point.",
			],
		},
		"docs/prompts/exec-plan-validate.md": {
			title: "ExecPlan Validate",
			summary:
				"Prompt asset for proving an ExecPlan outcome and preparing completion updates.",
			readWhen: "Validating a finished or nearly finished ExecPlan slice.",
			usage:
				"Use this after implementation and before moving a plan to completed.",
			inputs: ["target ExecPlan", "changed files", "validation outputs"],
			outputs: ["validation summary and updated Outcomes & Retrospective"],
			rules: [
				"Run the commands in `### Test Commands` or explain exact blockers.",
				"Fill `completed_at`, `post_build_recap`, and retrospective only when proof is complete.",
			],
			qualityGate: [
				"Confirm every required validation command passed or has blocked proof.",
				"Confirm the retrospective compares the actual result against the original purpose.",
			],
		},
	};
	return definitions[targetRef];
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
		formatPlanningScriptReadiness(repoFacts),
		"",
		"## Planning Primitive Scripts",
		"",
		"The full Program and ExecPlan loop expects these package scripts when the repository supports package scripts:",
		"",
		"- `programs:lint` validates Program documents, packet artifacts, planning briefs, and current-brief pointers.",
		"- `plans:lint` validates one touched ExecPlan with `-- --plan <repo-relative-plan-path>`.",
		"- `markdown:lint` validates frontmatter and Markdown structure for touched docs paths.",
		"- `docs:validate` runs the repository's docs validation aggregate.",
		"- `program:write-child-plan` resolves `current-planning-brief.txt` once and writes one Program-linked child ExecPlan.",
		"",
		"If any script is missing, record that as blocked proof and create a separate tooling slice before relying on automated Program or ExecPlan generation at scale.",
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
		formatPlanningScriptReadiness(repoFacts),
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

function limitPrimaryDocsRefs(refs: string[]) {
	return limitRefs(refs.filter(isPrimaryDocsRouteRef));
}

function isPrimaryDocsRouteRef(ref: string) {
	if (LOCAL_ABSOLUTE_PATH_PATTERN.test(ref)) {
		return false;
	}
	if (PRIOR_DOCS_SPINE_ADOPTION_REF_PATTERN.test(ref)) {
		return false;
	}
	if (SOURCE_TEST_ASSET_REF_PATTERN.test(ref)) {
		return false;
	}
	if (DOCS_ASSET_REF_PATTERN.test(ref)) {
		return false;
	}
	return true;
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

const SOURCE_TEST_ASSET_REF_PATTERN =
	/(?:^|\/)(?:src|test|tests|__tests__|assets|public|static)\//;
const DOCS_ASSET_REF_PATTERN =
	/\.(?:avif|gif|jpeg|jpg|mov|mp4|pdf|png|svg|webm)$/i;
const LOCAL_ABSOLUTE_PATH_PATTERN =
	/^(?:\/Users\/|\/home\/|\/private\/var\/|[A-Za-z]:\\)/;
const PRIOR_DOCS_SPINE_ADOPTION_REF_PATTERN =
	/^docs\/(?:programs|exec-plans)\/active\/\d{4}-\d{2}-\d{2}-docs-spine-adoption(?:\/|(?:-[^/]+\.md$))/;
