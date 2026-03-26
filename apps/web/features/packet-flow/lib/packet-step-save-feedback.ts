import type {
	CanonicalProjectFactKey,
	PacketStepDefinition,
} from "@packet-compiler";
import { packetFieldLabel } from "./packet-field-helpers";

type PacketStepValue = string | number | string[] | undefined;

export type PacketStepDraftValues = Partial<
	Record<CanonicalProjectFactKey, string>
>;

export type PacketStepSavePayload = {
	clearedFieldKeys: string[];
	factsPatch: Record<string, string | number | string[]>;
};

export type PacketStepSaveState =
	| "blank"
	| "partial"
	| "complete"
	| "cleared_to_incomplete";

export type PacketStepSaveFeedback = {
	state: PacketStepSaveState;
	requiredFieldKeys: readonly CanonicalProjectFactKey[];
	missingRequiredFieldKeys: CanonicalProjectFactKey[];
	firstMissingRequiredFieldKey: CanonicalProjectFactKey | null;
	clearedSavedFieldKeys: CanonicalProjectFactKey[];
};

export type PacketStepInlineFeedbackTone =
	| "default"
	| "warning"
	| "success"
	| "destructive";

export type PacketStepInlineFeedback = {
	tone: PacketStepInlineFeedbackTone;
	title: string;
	description: string;
};

function formatPacketFieldLabelList(fieldKeys: CanonicalProjectFactKey[]) {
	const labels = fieldKeys.map((fieldKey) => packetFieldLabel(fieldKey));
	if (labels.length <= 1) {
		return labels[0] ?? "";
	}
	if (labels.length === 2) {
		return `${labels[0]} and ${labels[1]}`;
	}

	return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
}

export function getPacketStageFieldInputId(
	stepId: string,
	fieldKey: CanonicalProjectFactKey,
) {
	return `packet-stage-field-${stepId}-${fieldKey}`;
}

function isMissingPacketStepValue(
	fieldKey: CanonicalProjectFactKey,
	value: PacketStepValue,
) {
	if (fieldKey === "surface_type") {
		return value === undefined;
	}
	if (typeof value === "string") {
		return value.trim().length === 0;
	}
	if (typeof value === "number") {
		return !Number.isFinite(value);
	}
	if (Array.isArray(value)) {
		return value.length === 0;
	}
	return value === undefined;
}

function getPacketStepRequiredFieldKeys(step: PacketStepDefinition) {
	return step.requiredFieldKeys ?? step.fieldKeys;
}

function getNextPacketStepValue(
	fieldKey: CanonicalProjectFactKey,
	existingSavedValues: PacketStepDraftValues,
	payload: PacketStepSavePayload,
): PacketStepValue {
	if (payload.clearedFieldKeys.includes(fieldKey)) {
		return undefined;
	}
	if (Object.prototype.hasOwnProperty.call(payload.factsPatch, fieldKey)) {
		return payload.factsPatch[fieldKey];
	}
	return existingSavedValues[fieldKey];
}

export function classifyPacketStepSave(
	step: PacketStepDefinition,
	_draftValues: PacketStepDraftValues,
	existingSavedValues: PacketStepDraftValues,
	payload: PacketStepSavePayload,
): PacketStepSaveFeedback {
	const requiredFieldKeys = getPacketStepRequiredFieldKeys(step);
	const clearedSavedFieldKeys = payload.clearedFieldKeys.filter((fieldKey) => {
		const canonicalFieldKey = fieldKey as CanonicalProjectFactKey;
		return !isMissingPacketStepValue(
			canonicalFieldKey,
			existingSavedValues[canonicalFieldKey],
		);
	}) as CanonicalProjectFactKey[];
	const missingRequiredFieldKeys = requiredFieldKeys.filter((fieldKey) =>
		isMissingPacketStepValue(
			fieldKey,
			getNextPacketStepValue(fieldKey, existingSavedValues, payload),
		),
	);
	const firstMissingRequiredFieldKey = missingRequiredFieldKeys[0] ?? null;
	const isComplete = missingRequiredFieldKeys.length === 0;

	if (isComplete) {
		return {
			state: "complete",
			requiredFieldKeys,
			missingRequiredFieldKeys,
			firstMissingRequiredFieldKey,
			clearedSavedFieldKeys,
		};
	}

	const wasCompleteBeforeSave = requiredFieldKeys.every(
		(fieldKey) =>
			!isMissingPacketStepValue(fieldKey, existingSavedValues[fieldKey]),
	);
	if (wasCompleteBeforeSave && clearedSavedFieldKeys.length > 0) {
		return {
			state: "cleared_to_incomplete",
			requiredFieldKeys,
			missingRequiredFieldKeys,
			firstMissingRequiredFieldKey,
			clearedSavedFieldKeys,
		};
	}

	const hasMeaningfulContentAfterSave = step.fieldKeys.some(
		(fieldKey) =>
			!isMissingPacketStepValue(
				fieldKey,
				getNextPacketStepValue(fieldKey, existingSavedValues, payload),
			),
	);
	if (!hasMeaningfulContentAfterSave && clearedSavedFieldKeys.length === 0) {
		return {
			state: "blank",
			requiredFieldKeys,
			missingRequiredFieldKeys,
			firstMissingRequiredFieldKey,
			clearedSavedFieldKeys,
		};
	}

	return {
		state: "partial",
		requiredFieldKeys,
		missingRequiredFieldKeys,
		firstMissingRequiredFieldKey,
		clearedSavedFieldKeys,
	};
}

export function buildPacketStepSaveInlineFeedback(
	stepLabel: string,
	saveFeedback: Pick<
		PacketStepSaveFeedback,
		"state" | "missingRequiredFieldKeys"
	>,
): PacketStepInlineFeedback | null {
	switch (saveFeedback.state) {
		case "blank":
			return {
				tone: "default",
				title: `${stepLabel} is still blank.`,
				description: "Add at least one answer before saving this step.",
			};
		case "partial": {
			const missingFieldList = formatPacketFieldLabelList(
				saveFeedback.missingRequiredFieldKeys,
			);

			return {
				tone: "default",
				title: "Draft saved.",
				description: missingFieldList
					? `Finish ${missingFieldList} before this step can complete.`
					: "This step still needs its required answers before it can complete.",
			};
		}
		case "cleared_to_incomplete": {
			const missingFieldList = formatPacketFieldLabelList(
				saveFeedback.missingRequiredFieldKeys,
			);

			return {
				tone: "warning",
				title: "Step cleared.",
				description: missingFieldList
					? `This checkpoint is incomplete again. Finish ${missingFieldList} before it can complete.`
					: "This checkpoint is incomplete again.",
			};
		}
		case "complete":
			return {
				tone: "success",
				title: "Step saved.",
				description: `${stepLabel} is complete.`,
			};
		default:
			return null;
	}
}

export function buildPacketStepSaveErrorInlineFeedback(): PacketStepInlineFeedback {
	return {
		tone: "destructive",
		title: "We could not save this step right now.",
		description: "Your draft is still here, so try again.",
	};
}
