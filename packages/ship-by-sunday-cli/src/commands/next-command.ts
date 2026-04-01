import {
	deriveStageStatus,
	getPacketStageDefinition,
} from "@manmeetsai/packet-compiler";
import { getFieldDescriptor } from "../field-contract";
import { requireLocalDraft } from "../draft/draft-store";
import type { CliIo } from "../run-cli";
import { writeJsonResult } from "../cli-json";
import { formatWorkspaceCommand } from "../command-surface";

export async function handleNextCommand({
	io,
	projectRootPath,
	json,
}: {
	io: CliIo;
	projectRootPath: string;
	json: boolean;
}) {
	const draft = await requireLocalDraft(projectRootPath);
	const stageStatus = deriveStageStatus(draft.facts);

	if (stageStatus.firstIncompleteStageId === "review") {
		const result = {
			nextStageId: "review",
			nextStepId: null,
			missingFields: [],
			suggestedCommand: formatWorkspaceCommand(
				"generate --out ./tmp/sbs-cli-repo --json",
			),
		};

		if (json) {
			writeJsonResult(io, "next", result);
			return 0;
		}

		io.write(
			[
				"Next action",
				"",
				"Draft is review-ready.",
				`Suggested command: ${result.suggestedCommand}`,
			].join("\n"),
		);
		return 0;
	}

	const nextStage = getPacketStageDefinition(
		stageStatus.firstIncompleteStageId,
	);
	const nextStageState = stageStatus.stageStatuses.find(
		(stage) => stage.stageId === nextStage.id,
	);
	const nextStep =
		nextStage.steps[nextStageState?.currentStepIndex ?? 0] ??
		nextStage.steps[0];
	const missingFieldDescriptors = (
		nextStep?.requiredFieldKeys ??
		nextStep?.fieldKeys ??
		[]
	)
		.filter((fieldKey) => nextStageState?.missingFactKeys.includes(fieldKey))
		.map((fieldKey) => getFieldDescriptor(fieldKey));
	const result = {
		nextStageId: nextStage.id,
		nextStepId: nextStep?.id ?? null,
		nextStepLabel: nextStep?.label ?? null,
		missingFields: missingFieldDescriptors,
		suggestedCommand: formatWorkspaceCommand(`stage ${nextStage.id}`),
	};

	if (json) {
		writeJsonResult(io, "next", result);
		return 0;
	}

	io.write(
		[
			"Next action",
			"",
			`Stage: ${nextStage.label}`,
			`Step: ${nextStep?.label ?? "None"}`,
			`Suggested command: ${result.suggestedCommand}`,
			...(missingFieldDescriptors.length > 0
				? [
						"",
						`Missing: ${missingFieldDescriptors.map((field) => field.label).join(", ")}`,
					]
				: []),
		].join("\n"),
	);
	return 0;
}
