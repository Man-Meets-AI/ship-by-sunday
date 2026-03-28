import {
	deriveStageStatus,
	packetFieldLabel,
} from "@manmeetsai/packet-compiler";
import { writeJsonResult } from "../cli-json";
import { loadLocalDraft } from "../draft/draft-store";
import type { ReviewablePacketStageId } from "../parse-cli-command";
import type { CliIo } from "../run-cli";

function formatMissingFieldList(fieldKeys: string[]) {
	return fieldKeys.map((fieldKey) => packetFieldLabel(fieldKey)).join(", ");
}

export async function handleReviewCommand({
	io,
	repoRootPath,
	json,
	missingOnly,
	stageId,
}: {
	io: CliIo;
	repoRootPath: string;
	json: boolean;
	missingOnly: boolean;
	stageId?: ReviewablePacketStageId;
}) {
	const draft = await loadLocalDraft(repoRootPath);
	if (!draft) {
		throw new Error("No local Ship by Sunday draft exists yet.");
	}

	const stageStatus = deriveStageStatus(draft.facts);
	const visibleStageStatuses = stageStatus.stageStatuses.filter((stage) => {
		if (stage.stageId === "start") {
			return false;
		}
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
			packetReadiness: stageStatus.packetReadiness,
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
		const stageLabel =
			stage.stageId === "build-plan"
				? "Build Plan"
				: packetFieldLabel(stage.stageId);
		lines.push(
			`${stageLabel}: ${stage.isComplete ? "ready" : "missing facts"}`,
		);
		if (stage.missingFactKeys.length > 0) {
			lines.push(`  Missing: ${formatMissingFieldList(stage.missingFactKeys)}`);
		}
	}

	io.write(lines.join("\n"));
	return 0;
}
