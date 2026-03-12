import type { CSSProperties } from "react";

import type { ArtifactPreview } from "@/lib/course/registry";

import type { WorkbenchModeProps } from "../types";
import { FieldList } from "../fields/field-list";
import { ArtifactContext } from "../shared/artifact-context";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";

function getCountLabel(count: number, singular: string, plural = `${singular}s`) {
	return `${count} ${count === 1 ? singular : plural}`;
}

function getStageUnlockStats(resolvedArtifactPreview: ArtifactPreview | null) {
	const values = resolvedArtifactPreview?.fieldValues ?? {};
	const userCount =
		typeof values.user_locked_count === "number" ? values.user_locked_count : 0;
	const outcomeCount =
		typeof values.outcome_defined_count === "number"
			? values.outcome_defined_count
			: 0;
	const researchSignalCount =
		typeof values.research_signal_count === "number"
			? values.research_signal_count
			: 0;
	const flowStepCount =
		typeof values.flow_step_count === "number" ? values.flow_step_count : 0;
	const scopeCutCount =
		typeof values.scope_cut_count === "number" ? values.scope_cut_count : 0;

	return [
		{ label: "Who", value: `${getCountLabel(userCount, "user")} locked` },
		{
			label: "Outcome",
			value: `${getCountLabel(outcomeCount, "outcome")} defined`,
		},
		{
			label: "Research",
			value: `${getCountLabel(researchSignalCount, "research signal")}`,
		},
		{ label: "Flow", value: `${getCountLabel(flowStepCount, "step")} flow` },
		{ label: "Scope", value: `${getCountLabel(scopeCutCount, "cut")} made` },
	];
}

function StageUnlockBriefAssembler({
	lesson,
	resolvedArtifactPreview,
}: Pick<WorkbenchModeProps, "lesson" | "resolvedArtifactPreview">) {
	if (lesson.briefAssembler?.variant !== "stage_unlock") {
		return null;
	}

	const stats = getStageUnlockStats(resolvedArtifactPreview ?? null);
	const sections = resolvedArtifactPreview?.fields ?? [];
	const flowImageUrl =
		typeof resolvedArtifactPreview?.fieldValues.flow_image_url === "string"
			? resolvedArtifactPreview.fieldValues.flow_image_url
			: null;

	return (
		<div className="space-y-3">
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
							You are not guessing anymore. Design gets a real handoff now.
						</p>
					</div>
				</div>
			</section>

			<div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
				{stats.map((stat, index) => (
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

			<WorkbenchCard label="What you built">
				{sections.length > 0 ? (
					<div className="grid gap-2 lg:grid-cols-2">
						{sections.map(([title, body], index) => (
							<div
								key={title}
								className="sbs-stage-unlock-card rounded-none border border-product-border/70 bg-product-surface px-3 py-3"
								style={
									{
										"--sbs-stage-unlock-delay": `${Math.min(index + 1, 4) * 24}ms`,
									} as CSSProperties
								}
							>
								<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
									{title}
								</p>
								<p className="mt-2 whitespace-pre-line text-[12px] leading-relaxed text-product-text">
									{String(body)}
								</p>
								{title === "Flow" && flowImageUrl ? (
									<div className="mt-3 overflow-hidden border border-product-border/70 bg-product-surface-strong">
										<img
											src={flowImageUrl}
											alt="Saved core flow map"
											className="h-32 w-full object-cover"
										/>
									</div>
								) : null}
							</div>
						))}
					</div>
				) : (
					<p className="text-[12px] leading-relaxed text-product-muted">
						Finish the earlier CEO work to generate the final product brief.
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
	);
}

export function BriefAssemblerWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	fields,
	objectiveTasks,
	completedTaskCount,
	resolvedArtifactPreview = null,
}: WorkbenchModeProps) {
	if (lesson.briefAssembler?.variant === "stage_unlock") {
		return (
			<WorkbenchContainer>
				<StageUnlockBriefAssembler
					lesson={lesson}
					resolvedArtifactPreview={resolvedArtifactPreview}
				/>
			</WorkbenchContainer>
		);
	}

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
			<FieldList
				fields={fields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				className="space-y-2"
			/>
		</WorkbenchContainer>
	);
}
