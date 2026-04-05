import {
	isBlueprintArrayField,
	normalizeCliFactValue,
	type CliBlueprintFactKey,
} from "../field-contract";
import { createCliError } from "../cli-errors";
import { workspaceLauncherCommand } from "../command-surface";
import {
	ensureLocalDraft,
	loadLocalDraft,
	type LocalDraftEnvelope,
} from "../draft/draft-store";
import type { EditableBlueprintStageId } from "../parse-cli-command";
import type { CliIo } from "../run-cli";
import {
	createReadlineStageSession,
	type ReadlineStageAnswer,
} from "./readline-stage-session";
import {
	createStagePromptSession,
	type StagePromptOutcome,
} from "./stage-prompt-session";

type DraftSaver = (draft: LocalDraftEnvelope) => Promise<void>;

function createInvalidPromptStateError(stageId: EditableBlueprintStageId) {
	return createCliError(
		"invalid_state",
		`Interactive prompts require a real terminal. Re-run ${workspaceLauncherCommand} stage ${stageId} in a TTY, or use ${workspaceLauncherCommand} set/import/mutate with --json for automation.`,
		2,
	);
}

function createClosedPromptError(stageId: EditableBlueprintStageId) {
	return createCliError(
		"invalid_state",
		`The terminal closed before the current answer was completed. Re-run ${workspaceLauncherCommand} stage ${stageId} in a real terminal, or use ${workspaceLauncherCommand} set/import/mutate with --json for automation.`,
		2,
	);
}

function applyFieldValue(
	draft: LocalDraftEnvelope,
	fieldKey: CliBlueprintFactKey,
	value: string,
) {
	const nextFactsSource: Record<string, unknown> = { ...draft.facts };

	if (!value.trim()) {
		if (fieldKey === "scope_in" || fieldKey === "scope_out") {
			nextFactsSource[fieldKey] = [];
		} else {
			delete nextFactsSource[fieldKey];
		}
	} else if (isBlueprintArrayField(fieldKey)) {
		const normalizedValue = normalizeCliFactValue(fieldKey, value.split("\n"));
		if (normalizedValue === undefined) {
			delete nextFactsSource[fieldKey];
		} else {
			nextFactsSource[fieldKey] = normalizedValue;
		}
	} else {
		const normalizedValue = normalizeCliFactValue(fieldKey, value);
		if (normalizedValue === undefined) {
			delete nextFactsSource[fieldKey];
		} else {
			nextFactsSource[fieldKey] = normalizedValue;
		}
	}

	return {
		...draft,
		facts: nextFactsSource,
		updatedAt: Date.now(),
	};
}

async function readFieldLines({
	readlineSession,
	prompt,
	mode,
}: {
	readlineSession: ReturnType<typeof createReadlineStageSession>;
	prompt: string;
	mode: "single-line" | "multiline";
}): Promise<ReadlineStageAnswer | { kind: "answer"; lines: string[] }> {
	const firstAnswer = await readlineSession.ask(prompt);
	if (firstAnswer.kind !== "answer") {
		return firstAnswer;
	}

	if (mode === "single-line") {
		return { kind: "answer", lines: [firstAnswer.value] };
	}

	const firstLine = firstAnswer.value;
	if (!firstLine.trim()) {
		return { kind: "answer", lines: [firstLine] };
	}

	if (firstLine.trim() === ":clear" || firstLine.trim() === ":quit") {
		return { kind: "answer", lines: [firstLine] };
	}

	const lines = [firstLine];
	while (true) {
		const nextLine = await readlineSession.ask("> ");
		if (nextLine.kind !== "answer") {
			return nextLine;
		}
		if (!nextLine.value.trim()) {
			break;
		}
		lines.push(nextLine.value);
	}

	return { kind: "answer", lines };
}

async function readFieldLines({
	readlineSession,
	prompt,
	mode,
}: {
	readlineSession: ReturnType<typeof createReadlineStageSession>;
	prompt: string;
	mode: "single-line" | "multiline";
}): Promise<ReadlineStageAnswer | { kind: "answer"; lines: string[] }> {
	const firstAnswer = await readlineSession.ask(prompt);
	if (firstAnswer.kind !== "answer") {
		return firstAnswer;
	}

	if (mode === "single-line") {
		return { kind: "answer", lines: [firstAnswer.value] };
	}

	const firstLine = firstAnswer.value;
	if (!firstLine.trim()) {
		return { kind: "answer", lines: [firstLine] };
	}

	if (firstLine.trim() === ":clear" || firstLine.trim() === ":quit") {
		return { kind: "answer", lines: [firstLine] };
	}

	const lines = [firstLine];
	while (true) {
		const nextLine = await readlineSession.ask("> ");
		if (nextLine.kind !== "answer") {
			return nextLine;
		}
		if (!nextLine.value.trim()) {
			break;
		}
		lines.push(nextLine.value);
	}

	return { kind: "answer", lines };
}

export async function promptStage({
	projectRootPath,
	stageId,
	io,
	saveDraft,
}: {
	projectRootPath: string;
	stageId: EditableBlueprintStageId;
	io: CliIo;
	saveDraft: DraftSaver;
}): Promise<StagePromptOutcome> {
	if (!process.stdin.isTTY || !process.stdout.isTTY) {
		throw createInvalidPromptStateError(stageId);
	}

	const stageSession = createStagePromptSession({ stageId });
	let draft =
		(await loadLocalDraft(projectRootPath)) ??
		(await ensureLocalDraft(projectRootPath));
	const readlineSession = createReadlineStageSession();

	try {
		io.write(stageSession.formatIntroLines().join("\n"));

		for (const [stepIndex, step] of stageSession.stage.steps.entries()) {
			io.write(
				`\n${stageSession.formatStepHeader(stepIndex, step.fieldKeys.length)}`,
			);

			for (const [fieldIndex, fieldKey] of step.fieldKeys.entries()) {
				const fieldPrompt = stageSession.formatFieldPrompt({
					draft,
					fieldKey,
					stepIndex,
					fieldIndex,
					fieldCount: step.fieldKeys.length,
				});
				const answer = await readFieldLines({
					readlineSession,
					prompt: fieldPrompt.prompt,
					mode: fieldPrompt.mode,
				});

				if (answer.kind === "cancelled") {
					return {
						kind: "interrupted",
						message: stageSession.formatExitMessage("cancelled"),
						reason: "cancelled",
					};
				}

				if (answer.kind === "closed") {
					throw createClosedPromptError(stageId);
				}

				const answerLines = "lines" in answer ? answer.lines : [answer.value];
				const action = stageSession.resolveFieldAction({
					answerLines,
					fieldKey,
				});

				if (action.kind === "quit") {
					return {
						kind: "interrupted",
						message: stageSession.formatExitMessage("quit"),
						reason: "quit",
					};
				}

				if (action.kind === "keep") {
					continue;
				}

				const nextValue = action.kind === "clear" ? "" : action.value;
				draft = applyFieldValue(draft, fieldKey, nextValue);
				await saveDraft(draft);
			}
		}

		return { kind: "completed" };
	} finally {
		readlineSession.close();
	}
}
