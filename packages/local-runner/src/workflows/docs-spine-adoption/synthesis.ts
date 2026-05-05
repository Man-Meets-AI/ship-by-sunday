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
	const draftFamilies = buildDraftFamilies(repoFacts, scannerArtifactLookup);

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
) {
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
	const hasProgramContract = repoFacts.docsSurface.programRefs.some(
		(ref) => ref === "docs/programs/PROGRAMS.md",
	);
	const hasExecPlanContract = repoFacts.docsSurface.execPlanRefs.some(
		(ref) => ref === "docs/exec-plans/PLANS.md",
	);
	const hasPromptIndex = repoFacts.docsSurface.promptRefs.some(
		(ref) => ref === "docs/prompts/README.md",
	);
	const hasDocsIndex = repoFacts.docsSurface.docsRefs.some(
		(ref) => ref === "docs/index.md",
	);
	const hasQualityScore = repoFacts.docsSurface.docsRefs.some((ref) =>
		ref.toLowerCase().includes("quality_score"),
	);
	const nativeGateScriptNames = readStringList(
		readObjectArtifact(
			scannerArtifactLookup,
			DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.validationSurfaceMap,
		),
		"nativeGateScriptNames",
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
			blockedReasons: hasDocsIndex ? [] : ["docs-index-missing"],
			applyInstructions:
				"Draft docs/index.md routing updates from source-truth and docs-gap facts only.",
			proposedOperations: [
				{
					operation: hasDocsIndex ? "update_existing_doc" : "create_doc",
					targetRef: "docs/index.md",
					requiresApplyApproval: true,
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
			blockedReasons: hasProgramContract ? [] : ["program-contract-missing"],
			applyInstructions:
				"Draft Program packet structure while preserving detected repo conventions.",
			proposedOperations: [
				{
					operation: "draft_program_packet",
					targetRef: "docs/programs/active/<program-id>/program.md",
					requiresApplyApproval: true,
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
			blockedReasons: hasExecPlanContract ? [] : ["exec-plan-contract-missing"],
			applyInstructions:
				"Draft first child ExecPlan structure and validation commands from command-proof facts.",
			proposedOperations: [
				{
					operation: "draft_exec_plan",
					targetRef: "docs/exec-plans/active/<exec-plan-id>.md",
					requiresApplyApproval: true,
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
			blockedReasons: hasPromptIndex ? [] : ["prompt-index-missing"],
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
		}),
		draftFamily({
			familyId: "validation-proof",
			artifactKey: "validationProofNotes",
			targetRefs: ["docs/validation.md", "docs/proof.md"],
			sourceArtifactRefs: [
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.commandProofMap,
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.validationSurfaceMap,
			],
			blockedReasons: nativeGateScriptNames.length
				? []
				: ["native-gate-missing"],
			applyInstructions:
				"Draft validation/proof notes from script names and CI refs only; never include script bodies.",
			proposedOperations: nativeGateScriptNames.map((scriptName) => ({
				operation: "document_validation_command",
				scriptName,
				requiresApplyApproval: true,
			})),
		}),
		draftFamily({
			familyId: "quality-score",
			artifactKey: "qualityScoreNotes",
			targetRefs: ["docs/QUALITY_SCORE.md"],
			sourceArtifactRefs: [
				DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.qualityScoreBaseline,
			],
			blockedReasons: hasQualityScore
				? ["quality-score-evidence-blocked"]
				: ["quality-score-surface-missing", "quality-score-evidence-blocked"],
			applyInstructions:
				"Draft quality-score notes as blocked evidence. Do not invent numeric scores.",
			proposedOperations: [
				{
					operation: hasQualityScore
						? "document_blocked_quality_score"
						: "draft_quality_score_surface",
					targetRef: "docs/QUALITY_SCORE.md",
					requiresApplyApproval: true,
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

function draftFamily({
	familyId,
	artifactKey,
	targetRefs,
	sourceArtifactRefs,
	blockedReasons,
	applyInstructions,
	proposedOperations,
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
}) {
	return {
		familyId,
		artifactKey,
		targetRefs,
		sourceArtifactRefs,
		blockedReasons,
		applyInstructions,
		proposedOperations,
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
