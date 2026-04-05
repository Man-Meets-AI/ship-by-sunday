import {
	getBlueprintStageDefinition,
	isBlueprintArrayField,
	blueprintFieldPromptKind,
	blueprintFieldHelperText,
	blueprintFieldLabel,
	formatCliFactValue,
	type CliBlueprintFactsDraft,
	type CliBlueprintFactKey,
} from "../field-contract";
import type { EditableBlueprintStageId } from "../parse-cli-command";

export type StagePromptOutcome =
	| { kind: "completed" }
	| {
			kind: "interrupted";
			message: string;
			reason: "cancelled" | "quit";
	  };

export type StagePromptExitReason = "cancelled" | "quit";

export type StageFieldAction =
	| { kind: "keep" }
	| { kind: "clear" }
	| { kind: "quit"; reason: "cancelled" | "quit" }
	| { kind: "value"; value: string };

export function createStagePromptSession({
	stageId,
}: {
	stageId: EditableBlueprintStageId;
}) {
	const stage = getBlueprintStageDefinition(stageId);

	function formatIntroLines() {
		return [
			stage.label,
			stage.description,
			"",
			"Controls: press Enter to keep the current value, type :clear to erase it, or type :quit to save and exit.",
		];
	}

	function formatStepHeader(stepIndex: number, fieldCount: number) {
		const step = stage.steps[stepIndex];
		const stepLabel = step.label;
		return `${stage.label} / ${stepLabel} • Step ${stepIndex + 1} of ${stage.steps.length} • ${fieldCount} fields`;
	}

	function formatFieldPrompt({
		draft,
		fieldKey,
		stepIndex,
		fieldIndex,
		fieldCount,
	}: {
		draft: { facts: CliBlueprintFactsDraft };
		fieldKey: CliBlueprintFactKey;
		stepIndex: number;
		fieldIndex: number;
		fieldCount: number;
	}) {
		const label = blueprintFieldLabel(fieldKey);
		const helperText = blueprintFieldHelperText(fieldKey);
		const promptKind = blueprintFieldPromptKind(fieldKey);
		const currentValue = draft.facts[fieldKey];
		const currentValueIsEmpty =
			currentValue === undefined ||
			currentValue === null ||
			currentValue === "" ||
			(Array.isArray(currentValue) && currentValue.length === 0);
		const formattedCurrentValue = formatCliFactValue(draft.facts, fieldKey);
		const currentValueText = currentValueIsEmpty
			? `Current value: ${formattedCurrentValue || "empty"}`
			: isBlueprintArrayField(fieldKey)
				? `Current value:\n${formattedCurrentValue}`
				: `Current value: ${formattedCurrentValue}`;
		const lines = [
			`Step ${stepIndex + 1} of ${stage.steps.length} • Field ${fieldIndex + 1} of ${fieldCount}`,
			label,
		];

		if (helperText) {
			lines.push(helperText);
		}

		lines.push(currentValueText);

		if (promptKind === "list" || promptKind === "long_text") {
			lines.push(
				"Enter one or more lines. Submit an empty line to finish. Type :clear on the first line to erase the field or :quit on the first line to save and exit.",
			);
			return { mode: "multiline" as const, prompt: `${lines.join("\n")}\n> ` };
		}

		lines.push(
			"Press Enter to keep the current value. Type :clear to erase it or :quit to save and exit.",
		);
		return { mode: "single-line" as const, prompt: `${lines.join("\n")}\n> ` };
	}

	function resolveFieldAction({
		answerLines,
		fieldKey,
	}: {
		answerLines: string[];
		fieldKey: CliBlueprintFactKey;
	}): StageFieldAction {
		const firstLine = answerLines[0] ?? "";
		const trimmedFirstLine = firstLine.trim();

		if (!trimmedFirstLine) {
			return { kind: "keep" };
		}

		if (trimmedFirstLine === ":quit") {
			return { kind: "quit", reason: "quit" };
		}

		if (trimmedFirstLine === ":clear") {
			return { kind: "clear" };
		}

		if (answerLines.length === 1 || !isBlueprintArrayField(fieldKey)) {
			return { kind: "value", value: trimmedFirstLine };
		}

		return {
			kind: "value",
			value: [trimmedFirstLine, ...answerLines.slice(1)].join("\n"),
		};
	}

	function formatExitMessage(reason: StagePromptExitReason) {
		if (reason === "cancelled") {
			return "Interrupted. Saved answers so far. Resume with bun run sbs resume.";
		}

		return "Exited. Saved answers so far. Resume with bun run sbs resume.";
	}

	return {
		formatExitMessage,
		formatFieldPrompt,
		formatIntroLines,
		formatStepHeader,
		resolveFieldAction,
		stage,
	};
}
