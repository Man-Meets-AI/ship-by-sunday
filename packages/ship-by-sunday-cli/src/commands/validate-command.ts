import { deriveLocalDraftStatus } from "../field-contract";
import { requireLocalDraft } from "../draft/draft-store";
import type { CliIo } from "../run-cli";
import { writeJsonResult } from "../cli-json";

export async function handleValidateCommand({
	io,
	projectRootPath,
	json,
}: {
	io: CliIo;
	projectRootPath: string;
	json: boolean;
}) {
	const draft = await requireLocalDraft(projectRootPath);
	const stageStatus = deriveLocalDraftStatus(draft.facts);
	const result = {
		reviewReady: stageStatus.blueprintReadiness.review.isReady,
		firstIncompleteStageId: stageStatus.firstIncompleteStageId,
		stageStatuses: stageStatus.stageStatuses,
		blueprintReadiness: stageStatus.blueprintReadiness,
	};

	if (json) {
		writeJsonResult(io, "validate", result);
		return 0;
	}

	io.write(
		[
			"Validation",
			"",
			`Review ready: ${result.reviewReady ? "yes" : "no"}`,
			`First incomplete stage: ${result.firstIncompleteStageId}`,
		].join("\n"),
	);
	return 0;
}
