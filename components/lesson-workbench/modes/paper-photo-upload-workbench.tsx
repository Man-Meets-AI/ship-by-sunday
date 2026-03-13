"use client";

import { LessonVideoSurface } from "@/components/lesson-video-surface";
import { CORE_FLOW_QUALITY_CHECKS_FIELD_ID } from "@/lib/course/core-flow";

import { FieldControl } from "../fields/field-control";
import { getUploadMetadata } from "../fields/value-codecs";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import { WorkbenchHeaderLabel } from "../shared/workbench-header-label";
import type { WorkbenchModeProps } from "../types";

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
		<p className="mt-2 text-[11px] font-medium leading-snug text-[#a83232]">
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
	const hasReadyVideo = Boolean(
		lessonContent.coach.video?.status === "ready" &&
		lessonContent.coach.video?.url,
	);
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
		<WorkbenchContainer className="max-w-6xl">
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			{pinnedArtifacts.length > 0 ? (
				<WorkbenchCard label="Anchor the flow">
					<div className="grid gap-3 md:grid-cols-2">
						<div className="rounded-none border border-product-border/60 bg-product-surface px-3 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.05)]">
							<WorkbenchHeaderLabel>User</WorkbenchHeaderLabel>
							<p className="mt-2 text-sm font-medium leading-relaxed text-product-text">
								{selectedUser}
							</p>
							<p className="mt-2 text-xs leading-relaxed text-product-muted [text-wrap:pretty]">
								Start from the moment this hurts: {userPain}
							</p>
						</div>
						<div className="rounded-none border border-product-border/60 bg-product-surface px-3 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.05)]">
							<WorkbenchHeaderLabel>Promise</WorkbenchHeaderLabel>
							<p className="mt-2 text-sm font-medium leading-relaxed text-product-text [text-wrap:pretty]">
								{outcome}
							</p>
							<p className="mt-2 text-xs leading-relaxed text-product-muted [text-wrap:pretty]">
								Draw only the shortest believable path that gets this user here.
							</p>
						</div>
					</div>
				</WorkbenchCard>
			) : null}
			<WorkbenchCard label="Watch first">
				<LessonVideoSurface
					coachContent={lessonContent.coach}
					variant="watch-shell"
					emptyState={{
						eyebrow: "Walkthrough pending",
						title: "Map it anyway",
						body: "The walkthrough is still being attached. Use the quick standard below and draw only the shortest path from the user's messy starting point to the promised result.",
					}}
				/>
				{!hasReadyVideo ? (
					<div className="mt-3 space-y-3 rounded-none border border-product-border/60 bg-product-surface px-3 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.05)]">
						<div className="space-y-1.5">
							<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
								Quick standard
							</p>
							<p className="text-sm leading-relaxed text-product-text [text-wrap:pretty]">
								A core flow is the smallest sequence that gets {selectedUser}{" "}
								from {currentWorkaround} to {outcome}.
							</p>
						</div>
						<div className="grid gap-3 md:grid-cols-2">
							{fallbackExamples.map((example) => (
								<div
									key={example.id}
									className="rounded-none border border-product-border/60 bg-product-surface-strong/80 px-3 py-3"
								>
									<WorkbenchHeaderLabel>{example.title}</WorkbenchHeaderLabel>
									<p className="mt-2 text-xs leading-relaxed text-product-muted whitespace-pre-line [text-wrap:pretty]">
										{example.body}
									</p>
								</div>
							))}
						</div>
					</div>
				) : null}
			</WorkbenchCard>
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<WorkbenchCard label="Before you step away">
				<div className="space-y-3">
					<p className="text-sm leading-relaxed text-product-text [text-wrap:pretty]">
						Draw the core flow off-screen with paper and pen. Keep it to 5-7
						steps and make the value moment easy to spot.
					</p>
					<div className="grid gap-3 md:grid-cols-3">
						<div className="rounded-none border border-product-border/60 bg-product-surface px-3 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.05)]">
							<WorkbenchHeaderLabel>Start</WorkbenchHeaderLabel>
							<p className="mt-2 text-xs leading-relaxed text-product-muted [text-wrap:pretty]">
								{selectedUser} shows up with {currentWorkaround}.
							</p>
						</div>
						<div className="rounded-none border border-product-border/60 bg-product-surface px-3 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.05)]">
							<WorkbenchHeaderLabel>Value moment</WorkbenchHeaderLabel>
							<p className="mt-2 text-xs leading-relaxed text-product-muted [text-wrap:pretty]">
								The user can see a usable result and knows the promise is real.
							</p>
						</div>
						<div className="rounded-none border border-product-border/60 bg-product-surface px-3 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.05)]">
							<WorkbenchHeaderLabel>End</WorkbenchHeaderLabel>
							<p className="mt-2 text-xs leading-relaxed text-product-muted [text-wrap:pretty]">
								{successLooksLike}
							</p>
						</div>
					</div>
					<div className="rounded-none border border-product-border/60 bg-product-surface-strong/80 px-3 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.05)]">
						<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
							Default shape
						</p>
						<p className="mt-2 text-sm leading-relaxed text-product-text [font-variant-numeric:tabular-nums]">
							input -&gt; generate result -&gt; review -&gt; share -&gt; done
						</p>
					</div>
				</div>
			</WorkbenchCard>
			{uploadField ? (
				<WorkbenchCard label="Upload the photo">
					<div className="space-y-3">
						<p className="text-xs leading-relaxed text-product-muted [text-wrap:pretty]">
							Paper is the default. If you already mapped it on a tablet or in a
							digital tool, one clean screenshot still counts.
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
							<div className="rounded-none border border-product-accent/35 bg-product-chip/35 px-3 py-3 shadow-[0_0_0_1px_rgba(var(--product-accent),0.12),0_1px_2px_rgba(0,0,0,0.05)]">
								<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent">
									What happens next
								</p>
								<p className="mt-2 text-sm leading-relaxed text-product-text [text-wrap:pretty]">
									Next lesson, you will cut everything that does not belong in
									this core flow.
								</p>
								<p className="mt-2 text-xs leading-relaxed text-product-muted [text-wrap:pretty]">
									If the photo is blurry or too crowded to follow, replace it
									before you complete the lesson.
								</p>
							</div>
						) : null}
					</div>
				</WorkbenchCard>
			) : null}
			{qualityField ? (
				<WorkbenchCard label="Check the upload">
					<div className="space-y-3">
						<p className="text-xs leading-relaxed text-product-muted [text-wrap:pretty]">
							Before you lock the lesson, make sure the flow is tight enough to
							cut scope in `1.6`.
						</p>
						<div className="rounded-none border border-product-border/60 bg-product-surface px-3 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.05)]">
							<FieldControl
								field={qualityField}
								value={fieldValues[qualityField.id]}
								onChange={(value) => onFieldChange(qualityField.id, value)}
								pinnedArtifacts={pinnedArtifacts}
							/>
						</div>
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
