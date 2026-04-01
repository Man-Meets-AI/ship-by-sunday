import {
	createCanonicalProjectDefinitionDraft,
	isPacketArrayField,
	isPacketNumericField,
	normalizeProblemUrgencyValue,
	normalizeProblemSeverityValue,
	parseCanonicalProjectFactsDraft,
	type CanonicalProjectDefinitionDraft,
	type CanonicalProjectFactKey,
} from "@manmeetsai/packet-compiler";
import { createCliError } from "../cli-errors";
import { workspaceLauncherCommand } from "../command-surface";
import { ensureLocalDraft, loadLocalDraft } from "../draft/draft-store";
import type { EditablePacketStageId } from "../parse-cli-command";
import type { CliIo } from "../run-cli";
import {
	createReadlineStageSession,
	type ReadlineStageAnswer,
} from "./readline-stage-session";
import {
	createStagePromptSession,
	type StagePromptOutcome,
} from "./stage-prompt-session";

type DraftSaver = (draft: CanonicalProjectDefinitionDraft) => Promise<void>;

function createInvalidPromptStateError(stageId: EditablePacketStageId) {
	return createCliError(
		"invalid_state",
		`Interactive prompts require a real terminal. Re-run ${workspaceLauncherCommand} stage ${stageId} in a TTY, or use ${workspaceLauncherCommand} set/import/mutate with --json for automation.`,
		2,
	);
}

function createClosedPromptError(stageId: EditablePacketStageId) {
	return createCliError(
		"invalid_state",
		`The terminal closed before the current answer was completed. Re-run ${workspaceLauncherCommand} stage ${stageId} in a real terminal, or use ${workspaceLauncherCommand} set/import/mutate with --json for automation.`,
		2,
	);
}

function applyFieldValue(
	draft: CanonicalProjectDefinitionDraft,
	fieldKey: CanonicalProjectFactKey,
	value: string,
) {
	const nextFactsSource: Record<string, unknown> = { ...draft.facts };

	if (!value.trim()) {
		delete nextFactsSource[fieldKey];
	} else if (fieldKey === "problem_severity") {
		nextFactsSource[fieldKey] = normalizeProblemSeverityValue(value);
	} else if (fieldKey === "problem_urgency") {
		nextFactsSource[fieldKey] = normalizeProblemUrgencyValue(value);
	} else if (isPacketNumericField(fieldKey)) {
		nextFactsSource[fieldKey] = Number(value.trim());
	} else if (isPacketArrayField(fieldKey)) {
		nextFactsSource[fieldKey] = value
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean);
	} else {
		nextFactsSource[fieldKey] = value.trim();
	}

	const nextFacts = parseCanonicalProjectFactsDraft(nextFactsSource);

	return createCanonicalProjectDefinitionDraft({
		clerkUserId: draft.clerkUserId,
		productKey: draft.productKey,
		facts: nextFacts,
		placeholdersInUse: draft.placeholdersInUse,
		createdAt: draft.createdAt,
		updatedAt: Date.now(),
	});
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
	stageId: EditablePacketStageId;
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
