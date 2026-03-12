"use client";

import { LessonVideoSurface } from "@/components/lesson-video-surface";

import { FieldControl } from "../fields/field-control";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import { WorkbenchHeaderLabel } from "../shared/workbench-header-label";
import type { WorkbenchModeProps } from "../types";

function InvalidFieldMessage({ visible }: { visible: boolean }) {
	if (!visible) {
		return null;
	}

	return (
		<p className="mt-2 text-[11px] font-medium leading-snug text-[#a83232]">
			Upload one clean core-flow photo before you continue.
		</p>
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
	const uploadField = fields[0] ?? null;

	return (
		<WorkbenchContainer className="max-w-6xl">
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<WorkbenchCard label="Watch first">
				<LessonVideoSurface
					coachContent={lessonContent.coach}
					variant="watch-shell"
				/>
			</WorkbenchCard>
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<WorkbenchCard label="Do this now">
				<div className="space-y-3">
					<p className="text-sm leading-relaxed text-product-text">
						Draw the core flow off-screen with paper and pen. Keep it to 5-7
						steps, take one clear photo, and upload it here.
					</p>
					<ul className="space-y-1 text-sm leading-relaxed text-product-muted">
						{(lessonContent.workbench.teachingPoints ?? []).map((point) => (
							<li key={point}>- {point}</li>
						))}
					</ul>
				</div>
			</WorkbenchCard>
			{uploadField ? (
				<WorkbenchCard label="Upload the photo">
					<div className="space-y-3">
						<p className="text-xs leading-relaxed text-product-muted">
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
						/>
					</div>
				</WorkbenchCard>
			) : null}
			{pinnedArtifacts.length > 0 ? (
				<details className="rounded-none border border-product-border/70 bg-product-surface-strong/70">
					<summary className="cursor-pointer px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
						Need context?
					</summary>
					<div className="border-t border-product-border/60 px-3 py-3">
						<div className="grid gap-3 md:grid-cols-2">
							{pinnedArtifacts.map((artifact) => (
								<div
									key={artifact.artifactKey}
									className="rounded-none border border-product-border/70 bg-product-surface px-3 py-3"
								>
									<WorkbenchHeaderLabel>
										{artifact.contextTitle ?? artifact.artifactLabel}
									</WorkbenchHeaderLabel>
									<div className="mt-2 space-y-1 text-xs font-medium leading-relaxed text-product-text">
										{artifact.fields.slice(0, 2).map(([label, value]) => (
											<p key={label}>
												<span className="text-product-muted">{label}:</span>{" "}
												{String(value)}
											</p>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				</details>
			) : null}
		</WorkbenchContainer>
	);
}
