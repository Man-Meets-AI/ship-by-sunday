"use client";

import { Separator } from "@/components/ui/separator";
import { ArtifactContext } from "@/features/course/lesson/workbench/shared/artifact-context";
import { FocusInlineLessonVideo } from "@/features/course/lesson/workbench/shared/focus-inline-lesson-video";
import { WorkbenchContainer } from "@/features/course/lesson/workbench/shared/workbench-container";
import { WorkbenchHeader } from "@/features/course/lesson/workbench/shared/workbench-header";
import { WorkbenchMediaLayout } from "@/features/course/lesson/workbench/shared/workbench-media-layout";
import type { WorkbenchModeProps } from "@/features/course/lesson/workbench/types";

import { CoreFlowSketchTabs } from "./core-flow-sketch-tabs";

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

	const inlineVideo = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);

	const tabBody = (
		<CoreFlowSketchTabs
			briefFields={briefFields}
			execution={execution}
			sketchNotes={sketchNotes}
			namedScreens={namedScreens}
			brandPath={brandPath}
			brandNotes={brandNotes}
			fieldValues={fieldValues}
			onFieldChange={onFieldChange}
			pinnedArtifacts={pinnedArtifacts}
			invalidFieldIds={invalidFieldIds}
		/>
	);

	const main = (
		<div className="space-y-4">
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
			{tabBody}
		</div>
	);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			{showSplitMedia ? (
				<WorkbenchMediaLayout media={inlineVideo}>{main}</WorkbenchMediaLayout>
			) : (
				<>
					{inlineVideo}
					{main}
				</>
			)}
		</WorkbenchContainer>
	);
}
