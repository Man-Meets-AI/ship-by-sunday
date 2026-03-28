import { deriveStageStatus } from "@manmeetsai/packet-compiler";
import { ensureLocalDraft } from "../draft/draft-store";
import type { CliIo } from "../run-cli";
import { writeJsonResult } from "../cli-json";

export async function handleValidateCommand({
	io,
	repoRootPath,
	json,
}: {
	io: CliIo;
	repoRootPath: string;
	json: boolean;
}) {
	const draft = await ensureLocalDraft(repoRootPath);
	const stageStatus = deriveStageStatus(draft.facts);
	const result = {
		reviewReady: stageStatus.packetReadiness.review.isReady,
		firstIncompleteStageId: stageStatus.firstIncompleteStageId,
		stageStatuses: stageStatus.stageStatuses,
		packetReadiness: stageStatus.packetReadiness,
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
