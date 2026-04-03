import { deriveLocalDraftStatus } from "../field-contract";
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
	const stageStatus = deriveLocalDraftStatus(draft.facts);

	switch (stageStatus.firstIncompleteStageId) {
		case "review":
			io.write("Draft is already review-ready.");
			return 0;
		case "marketing":
			throw new Error("Unexpected marketing-stage resume target.");
		case "product":
		case "design":
		case "build-plan":
			return handleStageCommand({
				io,
				projectRootPath,
				stageId: stageStatus.firstIncompleteStageId,
				promptStage,
			});
	}
}
