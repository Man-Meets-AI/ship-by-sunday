import {
	deriveStageStatus,
	getPacketStageDefinition,
} from "@manmeetsai/packet-compiler";
import { ensureLocalDraft, saveLocalDraft } from "../draft/draft-store";
import type { EditablePacketStageId } from "../parse-cli-command";
import type { CliIo } from "../run-cli";

export type StagePrompter = (args: {
	repoRootPath: string;
	stageId: EditablePacketStageId;
	io: CliIo;
	saveDraft: ReturnType<typeof createDraftSaver>;
}) => Promise<void>;

function createDraftSaver(repoRootPath: string) {
	return async (draft: Awaited<ReturnType<typeof ensureLocalDraft>>) =>
		saveLocalDraft(repoRootPath, draft);
}

export async function handleStageCommand({
	io,
	repoRootPath,
	stageId,
	promptStage,
}: {
	io: CliIo;
	repoRootPath: string;
	stageId: EditablePacketStageId;
	promptStage?: StagePrompter;
}) {
	await ensureLocalDraft(repoRootPath);
	if (!promptStage) {
		io.write(`Stage ${getPacketStageDefinition(stageId).label} is available.`);
		return 0;
	}

	await promptStage({
		repoRootPath,
		stageId,
		io,
		saveDraft: createDraftSaver(repoRootPath),
	});
	const nextDraft = await ensureLocalDraft(repoRootPath);
	const stageStatus = deriveStageStatus(nextDraft.facts);
	io.write(
		`${getPacketStageDefinition(stageId).label} saved. First incomplete stage: ${stageStatus.firstIncompleteStageId}`,
	);
	return 0;
}
