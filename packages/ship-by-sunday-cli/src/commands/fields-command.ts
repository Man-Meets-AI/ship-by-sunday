import { listFieldDescriptors } from "../field-contract";
import type { EditableBlueprintStageId } from "../parse-cli-command";
import type { CliIo } from "../run-cli";
import { writeJsonResult } from "../cli-json";

export async function handleFieldsCommand({
	io,
	stageId,
	json,
}: {
	io: CliIo;
	stageId?: EditableBlueprintStageId;
	json: boolean;
}) {
	const fields = listFieldDescriptors(stageId);

	if (json) {
		writeJsonResult(io, "fields", {
			stageId: stageId ?? null,
			fields,
		});
		return 0;
	}

	const lines = [
		stageId ? `Fields for ${stageId}` : "Canonical blueprint fields",
		"",
	];

	for (const field of fields) {
		lines.push(`${field.fieldKey} (${field.stageLabel} / ${field.stepLabel})`);
		lines.push(
			`  ${field.label} • ${field.promptKind} • ${field.required ? "required" : "optional"}${field.placeholderFriendly ? " • placeholder-friendly" : ""}`,
		);
	}

	io.write(lines.join("\n"));
	return 0;
}
