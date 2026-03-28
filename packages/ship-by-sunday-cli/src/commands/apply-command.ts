import { getPacketStageDefinition } from "@manmeetsai/packet-compiler";
import { writeJsonResult } from "../cli-json";
import { applyDraftPatchFromFile } from "../draft/draft-store";
import type { EditablePacketStageId } from "../parse-cli-command";
import type { CliIo } from "../run-cli";

export async function handleApplyCommand({
	io,
	repoRootPath,
	stageId,
	filePath,
	json,
}: {
	io: CliIo;
	repoRootPath: string;
	stageId: EditablePacketStageId;
	filePath: string;
	json: boolean;
}) {
	const stage = getPacketStageDefinition(stageId);
	const draft = await applyDraftPatchFromFile(repoRootPath, stage, filePath);
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
