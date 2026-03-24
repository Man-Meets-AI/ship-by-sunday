"use client";

import { LessonVideoSurface } from "@/features/course/lesson/components/lesson-video-surface";
import { CORE_FLOW_QUALITY_CHECKS_FIELD_ID } from "@/features/course/lesson/model/core-flow";
import { isLessonVideoReady } from "@/features/course/lesson/model/video";

import { getUploadMetadata } from "../fields/value-codecs";
import type { WorkbenchModeProps } from "../types";
import { getPaperPhotoFlowContext } from "./paper-photo-upload-context-values";
import { PaperPhotoUploadFieldSections } from "./paper-photo-upload-field-sections";
import { FlowMappingCard } from "./paper-photo-upload-flow-mapping-card";
import { PendingVideoFallback } from "./paper-photo-upload-pending-video-card";
import {
	LessonWorkbenchLabeledCard,
	LessonWorkbenchPageHeader,
	LessonWorkbenchStatusCards,
} from "./lesson-workbench-shadcn-chrome";

export function PaperPhotoUploadWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	fields,
	objectiveTasks,
	completedTaskCount,
}: WorkbenchModeProps) {
	const uploadField =
		fields.find((field) => field.kind === "image_upload") ?? null;
	const qualityField =
		fields.find((field) => field.id === CORE_FLOW_QUALITY_CHECKS_FIELD_ID) ??
		null;
	const upload = uploadField
		? getUploadMetadata(fieldValues[uploadField.id])
		: null;
	const hasReadyVideo = isLessonVideoReady(lessonContent.coach.video);
	const {
		selectedUser,
		userPain,
		currentWorkaround,
		outcome,
		successLooksLike,
	} = getPaperPhotoFlowContext(pinnedArtifacts);
	const fallbackExamples = (lessonContent.coach.examples ?? []).slice(0, 2);

	return (
		<div className="w-full space-y-4 pb-1">
			<LessonWorkbenchPageHeader
				lesson={lesson}
				lessonContent={lessonContent}
			/>
			<LessonWorkbenchLabeledCard label="Watch first">
				<LessonVideoSurface
					coachContent={lessonContent.coach}
					variant="watch-shell"
					emptyState={{
						eyebrow: "Walkthrough pending",
						title: "",
						body: "The walkthrough is still being attached. Use the short rule below and keep the map to the smallest believable path.",
					}}
				/>
				{!hasReadyVideo ? (
					<PendingVideoFallback
						currentWorkaround={currentWorkaround}
						outcome={outcome}
						fallbackExamples={fallbackExamples}
					/>
				) : null}
			</LessonWorkbenchLabeledCard>
			<LessonWorkbenchStatusCards
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<LessonWorkbenchLabeledCard label="Map the flow">
				<FlowMappingCard
					selectedUser={selectedUser}
					userPain={userPain}
					currentWorkaround={currentWorkaround}
					outcome={outcome}
					successLooksLike={successLooksLike}
					showContext={pinnedArtifacts.length > 0}
				/>
			</LessonWorkbenchLabeledCard>
			<PaperPhotoUploadFieldSections
				uploadField={uploadField}
				qualityField={qualityField}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				upload={upload}
			/>
		</div>
	);
}
