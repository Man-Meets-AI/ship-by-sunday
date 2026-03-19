"use client";

import type { ReactNode } from "react";

import { CardTitle } from "@/components/ui/card";
import { LessonVideoSurface } from "@/features/course/lesson/components/lesson-video-surface";
import { CORE_FLOW_QUALITY_CHECKS_FIELD_ID } from "@/features/course/lesson/model/core-flow";
import { isLessonVideoReady } from "@/features/course/lesson/model/video";

import { FieldControl } from "../fields/field-control";
import { getUploadMetadata } from "../fields/value-codecs";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import type { WorkbenchModeProps } from "../types";

const insetPanelClassName = "rounded-lg border border-input bg-card px-3 py-3";
const altInsetPanelClassName =
	"rounded-lg border border-input bg-muted/30 px-3 py-3";
const chromeLabelClass =
	"text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground";

type CoachExample = {
	id: string;
	title: string;
	body: string;
};

function InvalidFieldMessage({
	visible,
	message,
}: {
	visible: boolean;
	message: string;
}) {
	if (!visible) {
		return null;
	}

	return (
		<p className="mt-2 text-[11px] font-medium leading-snug text-destructive">
			{message}
		</p>
	);
}

function findArtifactValue(
	pinnedArtifacts: WorkbenchModeProps["pinnedArtifacts"],
	artifactKey: string,
	fieldId: string,
) {
	return pinnedArtifacts.find(
		(artifact) => artifact.artifactKey === artifactKey,
	)?.fieldValues?.[fieldId];
}

function getStringValue(value: unknown) {
	return typeof value === "string" && value.trim().length > 0
		? value.trim()
		: null;
}

function InsetPanel({
	children,
	className = insetPanelClassName,
}: {
	children: ReactNode;
	className?: string;
}) {
	return <div className={className}>{children}</div>;
}

function FlowContextStrip({
	selectedUser,
	userPain,
	outcome,
}: {
	selectedUser: string;
	userPain: string;
	outcome: string;
}) {
	return (
		<div className="grid gap-3 md:grid-cols-2">
			<InsetPanel>
				<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
					User
				</CardTitle>
				<p className="mt-2 text-sm font-medium leading-relaxed text-foreground">
					{selectedUser}
				</p>
				<p className="mt-2 text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
					Start from the moment this hurts: {userPain}
				</p>
			</InsetPanel>
			<InsetPanel>
				<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
					Promise
				</CardTitle>
				<p className="mt-2 text-sm font-medium leading-relaxed text-foreground [text-wrap:pretty]">
					{outcome}
				</p>
				<p className="mt-2 text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
					Draw only the shortest believable path that gets this user here.
				</p>
			</InsetPanel>
		</div>
	);
}

function PendingVideoFallback({
	currentWorkaround,
	outcome,
	fallbackExamples,
}: {
	currentWorkaround: string;
	outcome: string;
	fallbackExamples: CoachExample[];
}) {
	return (
		<div className={`mt-3 space-y-3 ${insetPanelClassName}`}>
			<p className="text-sm leading-relaxed text-foreground [text-wrap:pretty]">
				Until the walkthrough lands, use one rule: draw the smallest believable
				path from {currentWorkaround} to {outcome}.
			</p>
			{fallbackExamples.length > 0 ? (
				<details className="group">
					<summary
						className={`${chromeLabelClass} cursor-pointer list-none transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden`}
					>
						Need an example?
					</summary>
					<div className="mt-3 grid gap-3 md:grid-cols-2">
						{fallbackExamples.map((example) => (
							<InsetPanel key={example.id} className={altInsetPanelClassName}>
								<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
									{example.title}
								</CardTitle>
								<p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
									{example.body}
								</p>
							</InsetPanel>
						))}
					</div>
				</details>
			) : null}
		</div>
	);
}

function FlowMappingCard({
	selectedUser,
	userPain,
	currentWorkaround,
	outcome,
	successLooksLike,
	showContext,
}: {
	selectedUser: string;
	userPain: string;
	currentWorkaround: string;
	outcome: string;
	successLooksLike: string;
	showContext: boolean;
}) {
	return (
		<div className="space-y-3">
			{showContext ? (
				<FlowContextStrip
					selectedUser={selectedUser}
					userPain={userPain}
					outcome={outcome}
				/>
			) : null}
			<p className="text-sm leading-relaxed text-foreground [text-wrap:pretty]">
				Draw it on paper in 5-7 steps. Make the moment where the promise becomes
				real easy to spot.
			</p>
			<div className="grid gap-3 md:grid-cols-3">
				<InsetPanel>
					<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
						Start
					</CardTitle>
					<p className="mt-2 text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
						{selectedUser} shows up with {currentWorkaround}.
					</p>
				</InsetPanel>
				<InsetPanel>
					<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
						Value moment
					</CardTitle>
					<p className="mt-2 text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
						The user can see a usable result and knows the promise is real.
					</p>
				</InsetPanel>
				<InsetPanel>
					<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
						End
					</CardTitle>
					<p className="mt-2 text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
						{successLooksLike}
					</p>
				</InsetPanel>
			</div>
		</div>
	);
}

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
	const selectedUser =
		getStringValue(
			findArtifactValue(
				pinnedArtifacts,
				"user_statement",
				"selected_problem_owner",
			),
		) ?? "your chosen user";
	const userPain =
		getStringValue(
			findArtifactValue(pinnedArtifacts, "user_statement", "pain_moment"),
		) ??
		getStringValue(
			findArtifactValue(
				pinnedArtifacts,
				"user_statement",
				"selected_problem_statement",
			),
		) ??
		"the exact moment the problem becomes painful";
	const currentWorkaround =
		getStringValue(
			findArtifactValue(pinnedArtifacts, "user_statement", "current_solution"),
		) ?? "the messy workaround they use today";
	const outcome =
		getStringValue(
			findArtifactValue(pinnedArtifacts, "outcome_statement", "outcome"),
		) ?? "the promised result";
	const successLooksLike =
		getStringValue(
			findArtifactValue(
				pinnedArtifacts,
				"outcome_statement",
				"success_looks_like",
			),
		) ?? "what the user can review, send, or use when the product works";
	const fallbackExamples = (lessonContent.coach.examples ?? []).slice(0, 2);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<WorkbenchCard label="Watch first">
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
			</WorkbenchCard>
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<WorkbenchCard label="Map the flow">
				<FlowMappingCard
					selectedUser={selectedUser}
					userPain={userPain}
					currentWorkaround={currentWorkaround}
					outcome={outcome}
					successLooksLike={successLooksLike}
					showContext={pinnedArtifacts.length > 0}
				/>
			</WorkbenchCard>
			{uploadField ? (
				<WorkbenchCard label="Upload the map">
					<div className="space-y-3">
						<p className="text-sm leading-relaxed text-foreground [text-wrap:pretty]">
							Upload one legible photo. Paper is preferred, but a tablet or
							digital screenshot still counts.
						</p>
						<FieldControl
							field={uploadField}
							value={fieldValues[uploadField.id]}
							onChange={(value) => onFieldChange(uploadField.id, value)}
							pinnedArtifacts={pinnedArtifacts}
							showLabel={false}
						/>
						<InvalidFieldMessage
							visible={invalidFieldIds.has(uploadField.id)}
							message="Upload one clean core-flow photo before you continue."
						/>
						{upload?.fileName ? (
							<div className="rounded-lg border border-input bg-card px-3 py-3">
								<p className={chromeLabelClass}>Next up in 1.6</p>
								<p className="mt-2 text-sm leading-relaxed text-foreground [text-wrap:pretty]">
									You will use this map as the cut line for what belongs in v1.
								</p>
								<p className="mt-2 text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
									Replace it now if the steps are blurry or too crowded to
									follow.
								</p>
							</div>
						) : null}
					</div>
				</WorkbenchCard>
			) : null}
			{qualityField ? (
				<WorkbenchCard label="Ready for 1.6?">
					<div className="space-y-3">
						<p className="text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
							Before you lock the lesson, confirm the map is focused enough to
							use as the scope cut line in `1.6`.
						</p>
						<InsetPanel>
							<FieldControl
								field={qualityField}
								value={fieldValues[qualityField.id]}
								onChange={(value) => onFieldChange(qualityField.id, value)}
								pinnedArtifacts={pinnedArtifacts}
							/>
						</InsetPanel>
						<InvalidFieldMessage
							visible={invalidFieldIds.has(qualityField.id)}
							message="Confirm the uploaded flow stays focused, shows the value moment, and is clear enough for someone else to follow."
						/>
					</div>
				</WorkbenchCard>
			) : null}
		</WorkbenchContainer>
	);
}
