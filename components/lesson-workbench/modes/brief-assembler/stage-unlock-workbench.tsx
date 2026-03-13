import type { CSSProperties } from "react";

import { LessonVideoSurface } from "@/components/lesson-video-surface";
import type { StageUnlockSection } from "@/lib/course/stage-unlock";

import type { WorkbenchModeProps } from "../../types";
import { WorkbenchCard } from "../../shared/workbench-card";
import { WorkbenchContainer } from "../../shared/workbench-container";
import { StageUnlockBridgeCard } from "./stage-unlock-bridge-card";
import { StageUnlockReviewCard } from "./stage-unlock-review-card";
import { StageUnlockSectionCard } from "./stage-unlock-section-card";

function getEmptyStateCopy(preset: "ceo" | "design" | "build") {
	switch (preset) {
		case "design":
			return "Finish the earlier Design work to generate the final Build handoff.";
		case "build":
			return "Finish the earlier Build work to generate the Ship handoff.";
		default:
			return "Finish the earlier CEO work to generate the final product brief.";
	}
}

function getNextStepSupportCopy(preset: "ceo" | "design" | "build") {
	switch (preset) {
		case "design":
			return "Build now starts from a real spec instead of scattered sketches.";
		case "build":
			return "Ship now starts from a real build instead of half-finished setup.";
		default:
			return "Design now starts from a real brief instead of loose notes.";
	}
}

function getSectionGridClass(section: StageUnlockSection) {
	if (section.galleryImageUrls?.length || section.value.length > 420) {
		return "lg:col-span-2";
	}

	return "lg:col-span-1";
}

export function StageUnlockWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
	invalidFieldMessages,
	stageUnlockSummary,
}: Pick<
	WorkbenchModeProps,
	| "lesson"
	| "lessonContent"
	| "fieldValues"
	| "onFieldChange"
	| "invalidFieldIds"
	| "invalidFieldMessages"
	| "stageUnlockSummary"
>) {
	if (lesson.briefAssembler?.variant !== "stage_unlock") {
		return null;
	}

	const summary = stageUnlockSummary;
	const showLeadVideo = lesson.briefAssembler.leadVideo;
	const reviewField = lesson.workbenchFields?.find(
		(field) => field.id === "brief_review_checks",
	);

	return (
		<WorkbenchContainer maxWidthClassName="max-w-5xl">
			<div className="space-y-4">
				{showLeadVideo ? (
					<LessonVideoSurface
						coachContent={lessonContent.coach}
						variant="watch-shell"
					/>
				) : null}
				<section className="sbs-stage-unlock-hero rounded-none border border-product-accent/30 bg-product-surface/78 px-5 py-5 shadow-panel backdrop-blur-xl sm:px-6 sm:py-6">
					<div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(240px,0.9fr)] lg:items-start">
						<div className="space-y-4">
							<div className="space-y-2">
								<p className="inline-flex border border-product-accent/30 bg-product-surface/84 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-product-accent shadow-[inset_0_0_0_1px_rgba(var(--product-accent),0.06)]">
									{lesson.briefAssembler.heroEyebrow}
								</p>
								<h1
									className="max-w-3xl font-display text-[2.2rem] uppercase leading-[0.88] tracking-[0.03em] text-product-text sm:text-[2.9rem]"
									style={{ textWrap: "balance" }}
								>
									{lesson.briefAssembler.heroTitle}
								</h1>
							</div>
							<p className="max-w-2xl text-sm leading-7 text-product-muted sm:text-[15px]">
								{lesson.briefAssembler.heroBody}
							</p>
							<div className="flex flex-wrap items-center gap-2.5">
								<div className="inline-flex border border-product-accent/30 bg-product-surface/84 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-product-accent shadow-[inset_0_0_0_1px_rgba(var(--product-accent),0.08)]">
									Next: {lesson.briefAssembler.nextStepLabel}
								</div>
								<p
									className="max-w-sm text-[11px] leading-relaxed text-product-muted"
									style={{ textWrap: "balance" }}
								>
									{getNextStepSupportCopy(lesson.briefAssembler.preset)}
								</p>
							</div>
						</div>
						<div className="sbs-stage-unlock-card min-w-[220px] bg-product-surface/80 px-4 py-4 shadow-[0_0_0_1px_rgba(var(--product-accent),0.16),0_14px_30px_rgba(var(--product-shadow),0.18)] backdrop-blur-xl">
							<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
								Artifact locked next
							</p>
							<p
								className="mt-3 font-display text-[1.25rem] uppercase leading-[0.92] tracking-[0.04em] text-product-text"
								style={{ textWrap: "balance" }}
							>
								{lesson.artifact.label}
							</p>
							<p className="mt-3 text-[12px] leading-6 text-product-muted">
								{lesson.briefAssembler.artifactReadyCopy ??
									"You are not guessing anymore. The next block gets a real handoff now."}
							</p>
						</div>
					</div>
				</section>

				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
					{summary?.stats.map((stat, index) => (
						<div
							key={stat.label}
							className="sbs-stage-unlock-card rounded-none border border-product-border/70 bg-product-surface/74 px-4 py-4 shadow-panel backdrop-blur-xl"
							style={
								{
									"--sbs-stage-unlock-delay": `${Math.min(index, 4) * 24}ms`,
								} as CSSProperties
							}
						>
							<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
								{stat.label}
							</p>
							<p
								className="mt-3 text-base font-medium leading-tight text-product-text sm:text-[15px]"
								style={{ fontVariantNumeric: "tabular-nums" }}
							>
								{stat.value}
							</p>
						</div>
					))}
				</div>

				<WorkbenchCard label={summary?.sectionHeading ?? "What you built"}>
					{summary?.sections.length ? (
						<div className="grid gap-3 lg:grid-cols-2">
							{summary.sections.map((section, index) => (
								<StageUnlockSectionCard
									key={section.label}
									className={getSectionGridClass(section)}
									section={section}
									index={index}
								/>
							))}
						</div>
					) : (
						<p className="text-[12px] leading-relaxed text-product-muted">
							{getEmptyStateCopy(lesson.briefAssembler.preset)}
						</p>
					)}
				</WorkbenchCard>

				{reviewField ? (
					<StageUnlockReviewCard
						field={reviewField}
						value={fieldValues[reviewField.id]}
						onChange={(value) => onFieldChange(reviewField.id, value)}
						invalid={invalidFieldIds.has(reviewField.id)}
						invalidMessage={invalidFieldMessages.get(reviewField.id)}
					/>
				) : null}

				{summary?.bridge ? (
					<StageUnlockBridgeCard bridge={summary.bridge} />
				) : null}

				<WorkbenchCard label="Skills you flexed">
					<div className="flex flex-wrap gap-2.5">
						{lesson.briefAssembler.skills.map((skill, index) => (
							<span
								key={skill}
								className="sbs-stage-unlock-chip inline-flex border border-product-accent/25 bg-product-surface/82 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent shadow-[inset_0_0_0_1px_rgba(var(--product-accent),0.06)] backdrop-blur-md"
								style={
									{
										"--sbs-stage-unlock-delay": `${Math.min(index, 4) * 24}ms`,
									} as CSSProperties
								}
							>
								{skill}
							</span>
						))}
					</div>
				</WorkbenchCard>
			</div>
		</WorkbenchContainer>
	);
}
