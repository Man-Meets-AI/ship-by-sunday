import {
	deriveStageStatus,
	getPacketStageDefinition,
} from "@manmeetsai/packet-compiler";
import { ensureLocalDraft, saveLocalDraft } from "../draft/draft-store";
import type { EditablePacketStageId } from "../parse-cli-command";
import type { CliIo } from "../run-cli";
import type { StagePromptOutcome } from "../prompts/stage-prompt-session";

export type StagePrompter = (args: {
	projectRootPath: string;
	stageId: EditablePacketStageId;
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
	stageId: EditablePacketStageId;
	promptStage?: StagePrompter;
}) {
	await ensureLocalDraft(projectRootPath);
	if (!promptStage) {
		io.write(`Stage ${getPacketStageDefinition(stageId).label} is available.`);
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
	const stageStatus = deriveStageStatus(nextDraft.facts);
	io.write(
		`${getPacketStageDefinition(stageId).label} saved. First incomplete stage: ${stageStatus.firstIncompleteStageId}`,
	);
	return 0;
}
