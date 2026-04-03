import { listStageDescriptors } from "../field-contract";
import type { CliIo } from "../run-cli";
import { writeJsonResult } from "../cli-json";

export async function handleStagesCommand({
	io,
	json,
}: {
	io: CliIo;
	json: boolean;
}) {
	const stages = listStageDescriptors();

	if (json) {
		writeJsonResult(io, "stages", { stages });
		return 0;
	}

	const lines = ["Reduced blueprint stages", ""];

	for (const stage of stages) {
		lines.push(`${stage.label} (${stage.stageId})`);
		lines.push(`  ${stage.description}`);
		if (stage.steps.length > 0) {
			for (const step of stage.steps) {
				lines.push(
					`  - ${step.label} (${step.stepId}) • ${step.requiredFieldKeys.length} required fields`,
				);
			}
		}
	}

	io.write(lines.join("\n"));
	return 0;
}
