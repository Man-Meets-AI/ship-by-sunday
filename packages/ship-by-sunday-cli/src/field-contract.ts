import {
	canonicalProjectFactKeys,
	getPacketStageDefinition,
	packetFieldPromptKind,
	packetStageDefinitions,
	placeholderFriendlyFactKeys,
	type CanonicalProjectFactKey,
} from "@manmeetsai/packet-compiler";
import { packetFieldLabel } from "@manmeetsai/packet-presentation";
import type {
	EditablePacketStageId,
	ReviewablePacketStageId,
} from "./parse-cli-command";
import { createCliError } from "./cli-errors";

export type FieldDescriptor = {
	fieldKey: CanonicalProjectFactKey;
	label: string;
	promptKind: ReturnType<typeof packetFieldPromptKind>;
	stageId: EditablePacketStageId;
	stageLabel: string;
	stepId: string;
	stepLabel: string;
	required: boolean;
	placeholderFriendly: boolean;
};

const editableStageDefinitions = packetStageDefinitions.filter(
	(
		stage,
	): stage is (typeof packetStageDefinitions)[number] & {
		id: EditablePacketStageId;
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
			label: packetFieldLabel(fieldKey),
			promptKind: packetFieldPromptKind(fieldKey),
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

function isEditableStageId(value: string): value is EditablePacketStageId {
	return editableStageDefinitions.some((stage) => stage.id === value);
}

export function getFieldDescriptor(fieldKey: CanonicalProjectFactKey) {
	const descriptor = fieldDescriptorByKey.get(fieldKey);
	if (!descriptor) {
		throw createCliError("invalid_args", `Unknown field key "${fieldKey}".`, 2);
	}
	return descriptor;
}

export function listFieldDescriptors(stageId?: EditablePacketStageId) {
	if (!stageId) {
		return fieldDescriptors;
	}
	return fieldDescriptors.filter(
		(descriptor) => descriptor.stageId === stageId,
	);
}

export function listStageDescriptors() {
	return packetStageDefinitions
		.filter(
			(
				stage,
			): stage is (typeof packetStageDefinitions)[number] & {
				id: ReviewablePacketStageId;
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
				`Field "${fieldKey}" belongs to ${descriptor.stageLabel}, not ${getPacketStageDefinition(maybeStageId).label}.`,
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
