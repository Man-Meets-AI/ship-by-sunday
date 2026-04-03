import { getBlueprintStageDefinition } from "@manmeetsai/blueprint-compiler";
import { writeJsonResult } from "../cli-json";
import { applyDraftPatchFromFile } from "../draft/draft-store";
import type { EditableBlueprintStageId } from "../parse-cli-command";
import type { CliIo } from "../run-cli";

export async function handleApplyCommand({
	io,
	projectRootPath,
	stageId,
	filePath,
	json,
}: {
	io: CliIo;
	projectRootPath: string;
	stageId: EditableBlueprintStageId;
	filePath: string;
	json: boolean;
}) {
	const stage = getBlueprintStageDefinition(stageId);
	const draft = await applyDraftPatchFromFile(projectRootPath, stage, filePath);
	if (json) {
		writeJsonResult(io, "apply", {
			stageId,
			stageLabel: stage.label,
			filePath,
			productName: draft.facts.product_name ?? null,
		});
		return 0;
	}
	io.write(`Applied ${stage.label} patch from ${filePath}`);
	return 0;
}
