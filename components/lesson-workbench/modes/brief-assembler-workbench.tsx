import type { WorkbenchModeProps } from "../types";
import { DefaultBriefAssemblerWorkbench } from "./brief-assembler/default-brief-assembler-workbench";
import { StageUnlockWorkbench } from "./brief-assembler/stage-unlock-workbench";

export function BriefAssemblerWorkbench(props: WorkbenchModeProps) {
	if (props.lesson.briefAssembler?.variant === "stage_unlock") {
		return (
			<StageUnlockWorkbench
				lesson={props.lesson}
				stageUnlockSummary={props.stageUnlockSummary}
			/>
		);
	}

	return <DefaultBriefAssemblerWorkbench {...props} />;
}
