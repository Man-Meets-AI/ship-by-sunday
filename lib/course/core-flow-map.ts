import type { TableColumnConfig } from "./contracts";
import { getTableRows } from "./table";

export const CORE_FLOW_ACTORS_FIELD_ID = "flow_actors";
export const CORE_FLOW_STEPS_FIELD_ID = "flow_steps";
export const CORE_FLOW_ENDING_FIELD_ID = "flow_ending";
export const CORE_FLOW_IMAGE_FIELD_ID = "__core_flow_image_upload";

export const CORE_FLOW_MIN_STEPS = 5;
export const CORE_FLOW_MAX_STEPS = 7;
export const CORE_FLOW_MAX_ACTORS = 4;

export const CORE_FLOW_STEP_COLUMNS: TableColumnConfig[] = [
	{
		id: "actor",
		label: "Actor",
		kind: "select",
		width: "compact",
	},
	{
		id: "step",
		label: "Step",
		kind: "text",
		placeholder: "Describe what happens here",
		width: "wide",
	},
];

export const EMPTY_UPLOAD_FIELD_VALUE = {
	kind: "upload",
	status: "empty",
} as const;

export type CoreFlowPinnedArtifact = {
	artifactKey: string;
	fieldValues: Record<string, unknown>;
};

export type CoreFlowGraphNode = {
	id: string;
	kind: "actor" | "step" | "ending";
	x: number;
	y: number;
	label: string;
	eyebrow?: string;
	accent?: string;
	placeholder?: boolean;
	actorName?: string;
	index?: number;
};

export type CoreFlowGraphEdge = {
	id: string;
	source: string;
	target: string;
	kind: "actor" | "flow";
};

export type CoreFlowDraftState = {
	actorDrafts: string[];
	stepDrafts: string[][];
	endingDraft: string;
	validActorCount: number;
	filledStepCount: number;
	hasPartialStep: boolean;
	hasSavedImage: boolean;
};

function normalizeString(value: unknown) {
	return typeof value === "string" ? value.trim() : "";
}

export function getCoreFlowActorDrafts(value: unknown) {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.map((entry) => String(entry ?? ""));
}

export function getCoreFlowValidActors(value: unknown) {
	return getCoreFlowActorDrafts(value)
		.map((entry) => entry.trim())
		.filter(Boolean);
}

export function getCoreFlowStepDraftRows(value: unknown) {
	const rows = getTableRows(value, CORE_FLOW_STEP_COLUMNS).map((row) => [
		String(row[0] ?? ""),
		String(row[1] ?? ""),
	]);

	if (rows.length === 0) {
		return Array.from({ length: CORE_FLOW_MIN_STEPS }, () => ["", ""]);
	}

	return rows;
}

export function getCoreFlowFilledStepCount(value: unknown) {
	return getCoreFlowStepDraftRows(value).filter(
		([actor, step]) => actor.trim().length > 0 && step.trim().length > 0,
	).length;
}

export function coreFlowHasPartialSteps(value: unknown) {
	return getCoreFlowStepDraftRows(value).some(([actor, step]) => {
		const hasActor = actor.trim().length > 0;
		const hasStep = step.trim().length > 0;
		return hasActor !== hasStep;
	});
}

export function hasStoredUpload(value: unknown) {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return false;
	}

	return Boolean(
		"kind" in value &&
			(value as { kind?: string }).kind === "upload" &&
			("storageId" in value || "url" in value || "previewUrl" in value),
	);
}

export function getCoreFlowDraftState(
	fieldValues: Record<string, unknown> | null | undefined,
): CoreFlowDraftState {
	const values = fieldValues ?? {};
	const actorDrafts = getCoreFlowActorDrafts(values[CORE_FLOW_ACTORS_FIELD_ID]);
	const stepDrafts = getCoreFlowStepDraftRows(values[CORE_FLOW_STEPS_FIELD_ID]);
	const endingDraft = normalizeString(values[CORE_FLOW_ENDING_FIELD_ID]);

	return {
		actorDrafts,
		stepDrafts,
		endingDraft,
		validActorCount: actorDrafts.filter((actor) => actor.trim().length > 0).length,
		filledStepCount: stepDrafts.filter(
			([actor, step]) => actor.trim().length > 0 && step.trim().length > 0,
		).length,
		hasPartialStep: stepDrafts.some(([actor, step]) => {
			const hasActor = actor.trim().length > 0;
			const hasStep = step.trim().length > 0;
			return hasActor !== hasStep;
		}),
		hasSavedImage: hasStoredUpload(values[CORE_FLOW_IMAGE_FIELD_ID]),
	};
}

export function getCoreFlowSeedValues(
	pinnedArtifacts: CoreFlowPinnedArtifact[],
) {
	const userArtifact = pinnedArtifacts.find(
		(artifact) => artifact.artifactKey === "user_statement",
	);
	const outcomeArtifact = pinnedArtifacts.find(
		(artifact) => artifact.artifactKey === "outcome_statement",
	);
	const actor = normalizeString(userArtifact?.fieldValues.selected_problem_owner);
	const ending = normalizeString(outcomeArtifact?.fieldValues.outcome);

	return {
		[CORE_FLOW_ACTORS_FIELD_ID]: actor ? [actor] : [],
		[CORE_FLOW_STEPS_FIELD_ID]: Array.from(
			{ length: CORE_FLOW_MIN_STEPS },
			() => ["", ""],
		),
		[CORE_FLOW_ENDING_FIELD_ID]: ending,
	};
}

export function coreFlowNeedsSeeding(
	fieldValues: Record<string, unknown> | null | undefined,
) {
	const values = fieldValues ?? {};
	return (
		getCoreFlowActorDrafts(values[CORE_FLOW_ACTORS_FIELD_ID]).length === 0 &&
		getCoreFlowFilledStepCount(values[CORE_FLOW_STEPS_FIELD_ID]) === 0 &&
		normalizeString(values[CORE_FLOW_ENDING_FIELD_ID]).length === 0
	);
}

export function getCoreFlowGraph(
	fieldValues: Record<string, unknown> | null | undefined,
): {
	nodes: CoreFlowGraphNode[];
	edges: CoreFlowGraphEdge[];
} {
	const values = fieldValues ?? {};
	const actorDrafts = getCoreFlowActorDrafts(values[CORE_FLOW_ACTORS_FIELD_ID]);
	const stepDrafts = getCoreFlowStepDraftRows(values[CORE_FLOW_STEPS_FIELD_ID]);
	const endingDraft = normalizeString(values[CORE_FLOW_ENDING_FIELD_ID]);
	const actorNodes = actorDrafts.length > 0 ? actorDrafts : [""];
	const nodes: CoreFlowGraphNode[] = [];

	actorNodes.forEach((actor, index) => {
		nodes.push({
			id: `actor:${index}`,
			kind: "actor",
			x: 32,
			y: 64 + index * 112,
			label: actor.trim() || `Actor ${index + 1}`,
			eyebrow: "Actor",
			placeholder: actor.trim().length === 0,
			index,
		});
	});

	stepDrafts.forEach(([actor, step], index) => {
		nodes.push({
			id: `step:${index}`,
			kind: "step",
			x: 248 + index * 232,
			y: 132,
			label: step.trim() || `Describe step ${index + 1}`,
			eyebrow: `Step ${index + 1}`,
			actorName: actor.trim() || undefined,
			placeholder: step.trim().length === 0,
			index,
		});
	});

	nodes.push({
		id: "ending",
		kind: "ending",
		x: 248 + stepDrafts.length * 232,
		y: 132,
		label: endingDraft || "Value moment",
		eyebrow: "Ending",
		accent: "ending",
		placeholder: endingDraft.length === 0,
	});

	const edges: CoreFlowGraphEdge[] = [];
	const firstStepId = stepDrafts.length > 0 ? "step:0" : "ending";

	actorNodes.forEach((actor, actorIndex) => {
		const normalizedActor = actor.trim();
		const matchingStepIndex = stepDrafts.findIndex(
			([stepActor]) =>
				stepActor.trim().length > 0 &&
				normalizedActor.length > 0 &&
				stepActor.trim() === normalizedActor,
		);
		const targetId =
			matchingStepIndex >= 0
				? `step:${matchingStepIndex}`
				: actorIndex === 0
					? firstStepId
					: null;

		if (!targetId) {
			return;
		}

		edges.push({
			id: `actor:${actorIndex}->${targetId}`,
			source: `actor:${actorIndex}`,
			target: targetId,
			kind: "actor",
		});
	});

	stepDrafts.forEach((_, index) => {
		edges.push({
			id: `step:${index}->${
				index === stepDrafts.length - 1 ? "ending" : `step:${index + 1}`
			}`,
			source: `step:${index}`,
			target: index === stepDrafts.length - 1 ? "ending" : `step:${index + 1}`,
			kind: "flow",
		});
	});

	return { nodes, edges };
}
