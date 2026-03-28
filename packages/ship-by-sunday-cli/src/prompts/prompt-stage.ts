import {
	buildStepDraftValues,
	createCanonicalProjectDefinitionDraft,
	getPacketFieldScaleDefinition,
	getPacketStepLabel,
	getPacketStageDefinition,
	isPacketArrayField,
	isPacketNumericField,
	normalizeProblemUrgencyValue,
	normalizeProblemSeverityValue,
	parseCanonicalProjectFactsDraft,
	packetFieldHelperText,
	packetFieldLabel,
	packetFieldPromptKind,
	type CanonicalProjectDefinitionDraft,
	type CanonicalProjectFactKey,
} from "@manmeetsai/packet-compiler";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { ensureLocalDraft, loadLocalDraft } from "../draft/draft-store";
import type { EditablePacketStageId } from "../parse-cli-command";
import type { CliIo } from "../run-cli";

type DraftSaver = (draft: CanonicalProjectDefinitionDraft) => Promise<void>;

async function promptText({
	question,
	currentValue,
	rl,
}: {
	question: string;
	currentValue: string;
	rl: ReturnType<typeof createInterface>;
}) {
	const suffix = currentValue ? ` [current: ${currentValue}]` : "";
	const answer = await rl.question(`${question}${suffix}\n> `);

	if (!answer.trim()) {
		return currentValue;
	}
	if (answer.trim() === "!clear") {
		return "";
	}
	return answer.trim();
}

async function promptMultiline({
	question,
	currentValue,
	rl,
}: {
	question: string;
	currentValue: string;
	rl: ReturnType<typeof createInterface>;
}) {
	output.write(`${question}\n`);
	if (currentValue) {
		output.write(`Current value:\n${currentValue}\n`);
	}
	output.write(
		'Enter one or more lines. Submit an empty line to finish, or type "!clear" to remove it.\n',
	);

	const firstLine = await rl.question("> ");
	if (!firstLine.trim()) {
		return currentValue;
	}
	if (firstLine.trim() === "!clear") {
		return "";
	}

	const lines = [firstLine];
	while (true) {
		const nextLine = await rl.question("> ");
		if (!nextLine.trim()) {
			break;
		}
		lines.push(nextLine);
	}

	return lines.join("\n");
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

export async function promptStage({
	repoRootPath,
	stageId,
	io,
	saveDraft,
}: {
	repoRootPath: string;
	stageId: EditablePacketStageId;
	io: CliIo;
	saveDraft: DraftSaver;
}) {
	const stage = getPacketStageDefinition(stageId);
	let draft =
		(await loadLocalDraft(repoRootPath)) ??
		(await ensureLocalDraft(repoRootPath));
	const rl = createInterface({ input, output });

	try {
		io.write(`${stage.label}\n${stage.description}`);

		for (const step of stage.steps) {
			io.write(
				`\n${stage.label} / ${getPacketStepLabel(stageId, step.id) ?? step.label}`,
			);
			const draftValues = buildStepDraftValues(draft.facts, step);

			for (const fieldKey of step.fieldKeys) {
				const currentValue = draftValues[fieldKey] ?? "";
				const label = packetFieldLabel(fieldKey, draft.facts);
				const helperText = packetFieldHelperText(fieldKey, draft.facts);
				const promptKind = packetFieldPromptKind(fieldKey);
				const scaleDefinition = getPacketFieldScaleDefinition(fieldKey);
				const nextValue =
					promptKind === "list" || promptKind === "long_text"
						? await promptMultiline({
								question: helperText ? `${label}\n${helperText}` : label,
								currentValue,
								rl,
							})
						: await promptText({
								question:
									promptKind === "scale" && scaleDefinition
										? `${helperText ? `${label}\n${helperText}` : label} (${scaleDefinition.options.map((option) => option.label).join(" / ")})`
										: helperText
											? `${label}\n${helperText}`
											: label,
								currentValue,
								rl,
							});

				draft = applyFieldValue(draft, fieldKey, nextValue);
				await saveDraft(draft);
			}
		}
	} finally {
		rl.close();
	}
}
