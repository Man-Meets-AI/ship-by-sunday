import type { CSSProperties } from "react";

import { LessonVideoSurface } from "@/components/lesson-video-surface";

import type { WorkbenchModeProps } from "../../types";
import { WorkbenchCard } from "../../shared/workbench-card";
import { WorkbenchContainer } from "../../shared/workbench-container";
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

export function StageUnlockWorkbench({
	lesson,
	lessonContent,
	stageUnlockSummary,
}: Pick<
	WorkbenchModeProps,
	"lesson" | "lessonContent" | "stageUnlockSummary"
>) {
	if (lesson.briefAssembler?.variant !== "stage_unlock") {
		return null;
	}

	const summary = stageUnlockSummary;
	const showLeadVideo = lesson.briefAssembler.leadVideo;

	return (
		<WorkbenchContainer>
			<div className="space-y-3">
				{showLeadVideo ? (
					<LessonVideoSurface
						coachContent={lessonContent.coach}
						variant="watch-shell"
					/>
				) : null}
				<section className="sbs-stage-unlock-hero rounded-none border border-product-accent/25 bg-product-accent/[0.06] px-4 py-4 shadow-[0_0_0_1px_rgba(var(--product-accent),0.12),0_18px_40px_rgba(var(--product-shadow),0.12)]">
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div className="space-y-3">
							<div className="space-y-1">
								<p className="font-mono text-[10px] uppercase tracking-[0.24em] text-product-accent">
									{lesson.briefAssembler.heroEyebrow}
								</p>
								<h1 className="font-display text-[2rem] uppercase leading-none tracking-[0.06em] text-product-text sm:text-[2.4rem]">
									{lesson.briefAssembler.heroTitle}
								</h1>
							</div>
							<p className="max-w-3xl text-[13px] leading-relaxed text-product-text">
								{lesson.briefAssembler.heroBody}
							</p>
							<div className="inline-flex border border-product-accent/30 bg-product-surface/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-product-accent">
								Next: {lesson.briefAssembler.nextStepLabel}
							</div>
						</div>
						<div className="min-w-[180px] border border-product-accent/20 bg-product-surface/78 px-3 py-3">
							<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
								Artifact locked next
							</p>
							<p className="mt-2 font-display text-base uppercase tracking-[0.05em] text-product-text">
								{lesson.artifact.label}
							</p>
							<p className="mt-2 text-[11px] leading-relaxed text-product-muted">
								{lesson.briefAssembler.artifactReadyCopy ??
									"You are not guessing anymore. The next block gets a real handoff now."}
							</p>
						</div>
					</div>
				</section>

				<div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
					{summary?.stats.map((stat, index) => (
						<div
							key={stat.label}
							className="sbs-stage-unlock-card rounded-none border border-product-border/70 bg-product-surface-strong/78 px-3 py-3"
							style={
								{
									"--sbs-stage-unlock-delay": `${Math.min(index, 4) * 24}ms`,
								} as CSSProperties
							}
						>
							<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
								{stat.label}
							</p>
							<p className="mt-2 text-sm font-medium leading-snug text-product-text">
								{stat.value}
							</p>
						</div>
					))}
				</div>

				<WorkbenchCard label={summary?.sectionHeading ?? "What you built"}>
					{summary?.sections.length ? (
						<div className="grid gap-2 lg:grid-cols-2">
							{summary.sections.map((section, index) => (
								<StageUnlockSectionCard
									key={section.label}
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

				<WorkbenchCard label="Skills you flexed">
					<div className="flex flex-wrap gap-2">
						{lesson.briefAssembler.skills.map((skill, index) => (
							<span
								key={skill}
								className="sbs-stage-unlock-chip inline-flex border border-product-accent/25 bg-product-chip px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent"
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
