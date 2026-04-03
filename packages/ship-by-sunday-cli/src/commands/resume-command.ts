import { deriveStageStatus } from "@manmeetsai/blueprint-compiler";
import { ensureLocalDraft } from "../draft/draft-store";
import type { CliIo } from "../run-cli";
import { handleStageCommand, type StagePrompter } from "./stage-command";

export async function handleResumeCommand({
	io,
	projectRootPath,
	promptStage,
}: {
	io: CliIo;
	projectRootPath: string;
	promptStage?: StagePrompter;
}) {
	const draft = await ensureLocalDraft(projectRootPath);
	const stageStatus = deriveStageStatus(draft.facts);

	if (stageStatus.firstIncompleteStageId === "review") {
		io.write("Draft is already review-ready.");
		return 0;
	}
	if (stageStatus.firstIncompleteStageId === "start") {
		throw new Error("Unexpected start-stage resume target.");
	}

	return handleStageCommand({
		io,
		projectRootPath,
		stageId: stageStatus.firstIncompleteStageId,
		promptStage,
	});
}
