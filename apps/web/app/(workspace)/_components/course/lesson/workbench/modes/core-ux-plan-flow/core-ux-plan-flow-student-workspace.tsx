"use client";

import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import type { WorkbenchModeProps } from "../../types";

import { CORE_UX_PLAN_STUDENT_FIELD_IDS } from "@/lib/course/lesson/workbench/modes/core-ux-plan-flow/core-ux-plan-flow-constants";
import { CoreUxPlanFlowShadcnFields } from "./core-ux-plan-flow-shadcn-fields";

function pickStudentFields(props: WorkbenchModeProps) {
	const set = new Set(CORE_UX_PLAN_STUDENT_FIELD_IDS);
	return props.fields.filter((f) => set.has(f.id));
}

export function CoreUxPlanFlowStudentWorkspace(props: WorkbenchModeProps) {
	const studentFields = pickStudentFields(props);

	return (
		<TabsContent value="yours" className="mt-4 space-y-4">
			<p className="text-sm text-muted-foreground">
				Mirror the same clarifying questions for your build. Keep answers short;
				you will expand into a plan brief below.
			</p>
			<Separator />
			{studentFields.length > 0 ? (
				<CoreUxPlanFlowShadcnFields
					fields={studentFields}
					fieldValues={props.fieldValues}
					onFieldChange={props.onFieldChange}
					pinnedArtifacts={props.pinnedArtifacts}
					invalidFieldIds={props.invalidFieldIds}
					invalidFieldMessages={props.invalidFieldMessages}
				/>
			) : (
				<p className="text-sm text-muted-foreground">
					Student fields are not configured for this lesson.
				</p>
			)}
		</TabsContent>
	);
}
