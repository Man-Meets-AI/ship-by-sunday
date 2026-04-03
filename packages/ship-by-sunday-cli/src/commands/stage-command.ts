import { getBlueprintStageDefinition } from "../field-contract";
import {
	deriveLocalDraftStatus,
	ensureLocalDraft,
	saveLocalDraft,
} from "../draft/draft-store";
import type { EditableBlueprintStageId } from "../parse-cli-command";
import type { CliIo } from "../run-cli";
import type { StagePromptOutcome } from "../prompts/stage-prompt-session";

export type StagePrompter = (args: {
	projectRootPath: string;
	stageId: EditableBlueprintStageId;
	io: CliIo;
	saveDraft: ReturnType<typeof createDraftSaver>;
}) => Promise<StagePromptOutcome>;

function createDraftSaver(projectRootPath: string) {
	return async (draft: Awaited<ReturnType<typeof ensureLocalDraft>>) =>
		saveLocalDraft(projectRootPath, draft);
}

export async function handleStageCommand({
	io,
	projectRootPath,
	stageId,
	promptStage,
}: {
	io: CliIo;
	projectRootPath: string;
	stageId: EditableBlueprintStageId;
	promptStage?: StagePrompter;
}) {
	await ensureLocalDraft(projectRootPath);
	if (!promptStage) {
		io.write(
			`Stage ${getBlueprintStageDefinition(stageId).label} is available.`,
		);
		return 0;
	}

	const outcome = await promptStage({
		projectRootPath,
		stageId,
		io,
		saveDraft: createDraftSaver(projectRootPath),
	});
	if (outcome.kind === "interrupted") {
		io.write(outcome.message);
		return 0;
	}

	const nextDraft = await ensureLocalDraft(projectRootPath);
	const stageStatus = deriveLocalDraftStatus(nextDraft.facts);
	io.write(
		`${getBlueprintStageDefinition(stageId).label} saved. First incomplete stage: ${stageStatus.firstIncompleteStageId}`,
	);
	return 0;
}
