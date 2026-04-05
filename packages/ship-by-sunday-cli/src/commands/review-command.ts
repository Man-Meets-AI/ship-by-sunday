import {
	blueprintFieldLabel,
	deriveLocalDraftStatus,
	type CliBlueprintFactKey,
} from "../field-contract";
import { writeJsonResult } from "../cli-json";
import { requireLocalDraft } from "../draft/draft-store";
import type { ReviewableBlueprintStageId } from "../parse-cli-command";
import type { CliIo } from "../run-cli";

function formatMissingFieldList(fieldKeys: readonly CliBlueprintFactKey[]) {
	return fieldKeys.map((fieldKey) => blueprintFieldLabel(fieldKey)).join(", ");
}

export async function handleReviewCommand({
	io,
	projectRootPath,
	json,
	missingOnly,
	stageId,
}: {
	io: CliIo;
	projectRootPath: string;
	json: boolean;
	missingOnly: boolean;
	stageId?: ReviewableBlueprintStageId;
}) {
	const draft = await requireLocalDraft(projectRootPath);

	const stageStatus = deriveLocalDraftStatus(draft.facts);
	const visibleStageStatuses = stageStatus.stageStatuses.filter((stage) => {
		if (stageId) {
			return stage.stageId === stageId;
		}
		if (missingOnly) {
			return !stage.isComplete;
		}
		return true;
	});
	if (json) {
		writeJsonResult(io, "review", {
			firstIncompleteStageId: stageStatus.firstIncompleteStageId,
			blueprintReadiness: stageStatus.blueprintReadiness,
			stageStatuses: visibleStageStatuses,
			stageId: stageId ?? null,
			missingOnly,
		});
		return 0;
	}

	const lines = [
		"Ship by Sunday draft review",
		"",
		`First incomplete stage: ${stageStatus.firstIncompleteStageId}`,
		"",
	];

	for (const stage of visibleStageStatuses) {
		lines.push(
			`${stage.stageLabel}: ${stage.isComplete ? "ready" : "missing facts"}`,
		);
		if (stage.missingFactKeys.length > 0) {
			lines.push(`  Missing: ${formatMissingFieldList(stage.missingFactKeys)}`);
		}
	}

	io.write(lines.join("\n"));
	return 0;
}
