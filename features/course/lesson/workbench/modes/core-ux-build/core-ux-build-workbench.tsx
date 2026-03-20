"use client";

import { Separator } from "@/components/ui/separator";
import { FocusInlineLessonVideo } from "../../shared/focus-inline-lesson-video";
import { WorkbenchContainer } from "../../shared/workbench-container";
import { WorkbenchHeader } from "../../shared/workbench-header";
import { WorkbenchMediaLayout } from "../../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../../types";

import { CoreUxBuildMainColumn } from "./core-ux-build-main-column";
import { useCoreUxBuildFieldSeeds } from "./core-ux-build-use-field-seeds";

export function CoreUxBuildWorkbench({
	lesson,
	lessonContent,
	fields,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	layoutMode,
	invalidFieldIds = new Set<string>(),
	invalidFieldMessages = new Map<string, string>(),
	fieldValuesReady = true,
}: WorkbenchModeProps) {
	useCoreUxBuildFieldSeeds({
		fieldValuesReady,
		fieldValues,
		onFieldChange,
	});

	const showInlineVideo = lesson.coachVideoPlacement === "workbench";
	const showSplitWorkbenchMedia =
		showInlineVideo &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";

	const inlineVideoCard = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);

	const mainColumn = (
		<CoreUxBuildMainColumn
			fields={fields}
			fieldValues={fieldValues}
			onFieldChange={onFieldChange}
			pinnedArtifacts={pinnedArtifacts}
			invalidFieldIds={invalidFieldIds}
			invalidFieldMessages={invalidFieldMessages}
		/>
	);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			{showSplitWorkbenchMedia ? (
				<WorkbenchMediaLayout media={inlineVideoCard}>
					{mainColumn}
				</WorkbenchMediaLayout>
			) : showInlineVideo ? (
				<>
					{inlineVideoCard}
					{mainColumn}
				</>
			) : (
				mainColumn
			)}
		</WorkbenchContainer>
	);
}
