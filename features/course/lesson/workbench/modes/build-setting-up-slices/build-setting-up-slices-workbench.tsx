"use client";

import { Separator } from "@/components/ui/separator";
import { ArtifactContext } from "../../shared/artifact-context";
import { FocusInlineLessonVideo } from "../../shared/focus-inline-lesson-video";
import { WorkbenchContainer } from "../../shared/workbench-container";
import { WorkbenchHeader } from "../../shared/workbench-header";
import { WorkbenchMediaLayout } from "../../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../../types";

import { BUILD_SLICES_FIELD_IDS } from "./build-setting-up-slices-constants";
import { BuildSettingUpSlicesFields } from "./build-setting-up-slices-fields";
import { BuildSettingUpSlicesGuide } from "./build-setting-up-slices-guide";

export function BuildSettingUpSlicesWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	layoutMode,
}: WorkbenchModeProps) {
	const showSplitMedia =
		lesson.coachVideoPlacement === "workbench" &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";

	const inlineVideo = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);

	const mainColumn = (
		<div className="space-y-5">
			<BuildSettingUpSlicesGuide
				value={fieldValues[BUILD_SLICES_FIELD_IDS.planningPath]}
				onChange={(v) => onFieldChange(BUILD_SLICES_FIELD_IDS.planningPath, v)}
			/>
			<BuildSettingUpSlicesFields
				fields={lesson.workbenchFields ?? []}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
			/>
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
		</div>
	);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			{showSplitMedia ? (
				<WorkbenchMediaLayout media={inlineVideo}>
					{mainColumn}
				</WorkbenchMediaLayout>
			) : lesson.coachVideoPlacement === "workbench" ? (
				<>
					{inlineVideo}
					{mainColumn}
				</>
			) : (
				mainColumn
			)}
		</WorkbenchContainer>
	);
}
