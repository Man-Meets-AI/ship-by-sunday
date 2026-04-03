import {
	canonicalProjectFactKeys,
	getBlueprintStageDefinition,
	blueprintFieldPromptKind,
	blueprintStageDefinitions,
	placeholderFriendlyFactKeys,
	type CanonicalProjectFactKey,
} from "@manmeetsai/blueprint-compiler";
import { blueprintFieldLabel } from "@shipbysunday/blueprint-presentation";
import type {
	EditableBlueprintStageId,
	ReviewableBlueprintStageId,
} from "./parse-cli-command";
import { createCliError } from "./cli-errors";

export type FieldDescriptor = {
	fieldKey: CanonicalProjectFactKey;
	label: string;
	promptKind: ReturnType<typeof blueprintFieldPromptKind>;
	stageId: EditableBlueprintStageId;
	stageLabel: string;
	stepId: string;
	stepLabel: string;
	required: boolean;
	placeholderFriendly: boolean;
};

const editableStageDefinitions = blueprintStageDefinitions.filter(
	(
		stage,
	): stage is (typeof blueprintStageDefinitions)[number] & {
		id: EditableBlueprintStageId;
	} => stage.id !== "start" && stage.id !== "review",
);
const placeholderFriendlyFieldKeySet = new Set<CanonicalProjectFactKey>(
	placeholderFriendlyFactKeys as readonly CanonicalProjectFactKey[],
);

function getRequiredFieldKeys(
	step: (typeof editableStageDefinitions)[number]["steps"][number],
): readonly CanonicalProjectFactKey[] {
	return "requiredFieldKeys" in step && step.requiredFieldKeys
		? [...step.requiredFieldKeys]
		: [...step.fieldKeys];
}

const fieldDescriptors = editableStageDefinitions.flatMap((stage) =>
	stage.steps.flatMap((step) =>
		step.fieldKeys.map((fieldKey) => ({
			fieldKey,
			label: blueprintFieldLabel(fieldKey),
			promptKind: blueprintFieldPromptKind(fieldKey),
			stageId: stage.id,
			stageLabel: stage.label,
			stepId: step.id,
			stepLabel: step.label,
			required: getRequiredFieldKeys(step).includes(fieldKey),
			placeholderFriendly: placeholderFriendlyFieldKeySet.has(fieldKey),
		})),
	),
);

const fieldDescriptorByKey = new Map(
	fieldDescriptors.map((descriptor) => [descriptor.fieldKey, descriptor]),
);

function isEditableStageId(value: string): value is EditableBlueprintStageId {
	return editableStageDefinitions.some((stage) => stage.id === value);
}

export function getFieldDescriptor(fieldKey: CanonicalProjectFactKey) {
	const descriptor = fieldDescriptorByKey.get(fieldKey);
	if (!descriptor) {
		throw createCliError("invalid_args", `Unknown field key "${fieldKey}".`, 2);
	}
	return descriptor;
}

export function listFieldDescriptors(stageId?: EditableBlueprintStageId) {
	if (!stageId) {
		return fieldDescriptors;
	}
	return fieldDescriptors.filter(
		(descriptor) => descriptor.stageId === stageId,
	);
}

export function listStageDescriptors() {
	return blueprintStageDefinitions
		.filter(
			(
				stage,
			): stage is (typeof blueprintStageDefinitions)[number] & {
				id: ReviewableBlueprintStageId;
			} => stage.id !== "start",
		)
		.map((stage) => ({
			stageId: stage.id,
			label: stage.label,
			description: stage.description,
			route: stage.route,
			stepCount: stage.steps.length,
			steps: stage.steps.map((step) => ({
				stepId: step.id,
				label: step.label,
				fieldKeys: [...step.fieldKeys],
				requiredFieldKeys: [...getRequiredFieldKeys(step)],
			})),
		}));
}

export function parseFieldSelector(selector: string) {
	const [maybeStageId, maybeFieldKey, extraSegment] = selector.split(".");
	if (extraSegment) {
		throw createCliError(
			"invalid_args",
			`Invalid field selector "${selector}". Use "<fieldKey>" or "<stageId>.<fieldKey>".`,
			2,
		);
	}

	if (maybeFieldKey && isEditableStageId(maybeStageId)) {
		const fieldKey = maybeFieldKey as CanonicalProjectFactKey;
		const descriptor = getFieldDescriptor(fieldKey);
		if (descriptor.stageId !== maybeStageId) {
			throw createCliError(
				"invalid_stage",
				`Field "${fieldKey}" belongs to ${descriptor.stageLabel}, not ${getBlueprintStageDefinition(maybeStageId).label}.`,
				2,
			);
		}
		return descriptor;
	}

	return getFieldDescriptor(maybeStageId as CanonicalProjectFactKey);
}

export function listSchemaDescriptor() {
	return {
		schemaVersion: 1,
		fieldCount: canonicalProjectFactKeys.length,
		placeholderFriendlyFields: [...placeholderFriendlyFactKeys],
		fields: fieldDescriptors,
	};
}
