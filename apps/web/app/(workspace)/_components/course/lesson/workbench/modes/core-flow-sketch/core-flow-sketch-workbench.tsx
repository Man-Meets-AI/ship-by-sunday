"use client";

import type { WorkbenchModeProps } from "@/app/(workspace)/_components/course/lesson/workbench/types";

import { CoreFlowSketchTabs } from "./core-flow-sketch-tabs";
import { CoreFlowSketchWorkbenchShell } from "./core-flow-sketch-workbench-shell";

function pickField(props: WorkbenchModeProps, id: string) {
	return props.fields.find((field) => field.id === id) ?? null;
}

export function CoreFlowSketchWorkbench(props: WorkbenchModeProps) {
	const {
		lesson,
		lessonContent,
		fieldValues,
		onFieldChange,
		pinnedArtifacts,
		invalidFieldIds,
		layoutMode,
	} = props;

	const showSplitMedia =
		lesson.coachVideoPlacement === "workbench" &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";

	const problem = pickField(props, "core_problem");
	const audience = pickField(props, "core_audience");
	const transformation = pickField(props, "core_transformation");
	const outcome = pickField(props, "core_desired_outcome");
	const mustHaves = pickField(props, "core_must_have_features");
	const execution = pickField(props, "core_execution_checklist");
	const sketchNotes = pickField(props, "core_sketch_notes");
	const namedScreens = pickField(props, "core_named_screens");
	const brandPath = pickField(props, "core_brand_path");
	const brandNotes = pickField(props, "core_brand_guide_notes");

	const briefFields = [
		problem,
		audience,
		transformation,
		outcome,
		mustHaves,
	].filter((field): field is NonNullable<typeof field> => field != null);

	return (
		<CoreFlowSketchWorkbenchShell
			lesson={lesson}
			lessonContent={lessonContent}
			pinnedArtifacts={pinnedArtifacts}
			showSplitMedia={showSplitMedia}
		>
			<CoreFlowSketchTabs
				briefFields={briefFields}
				execution={execution}
				sketchNotes={sketchNotes}
				namedScreens={namedScreens}
				brandPath={brandPath}
				brandNotes={brandNotes}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				invalidFieldIds={invalidFieldIds}
			/>
		</CoreFlowSketchWorkbenchShell>
	);
}
