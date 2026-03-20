import type { ReactNode } from "react";

import type { StageUnlockSection } from "@/features/course/lesson/model/stage-unlock";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { WorkbenchModeProps } from "../../types";
import { StageUnlockBridgeCard } from "./stage-unlock-bridge-card";
import { StageUnlockReviewCard } from "./stage-unlock-review-card";
import { StageUnlockSectionCard } from "./stage-unlock-section-card";

const sectionShellHeaderClass = "border-b border-border/60 px-4 py-3 sm:px-5";

const sectionShellBodyClass = "px-4 py-4 sm:px-5 sm:py-5";

type StageUnlockWorkbenchProps = {
	lesson: WorkbenchModeProps["lesson"];
	fieldValues?: WorkbenchModeProps["fieldValues"];
	onFieldChange?: WorkbenchModeProps["onFieldChange"];
	invalidFieldIds?: WorkbenchModeProps["invalidFieldIds"];
	invalidFieldMessages?: WorkbenchModeProps["invalidFieldMessages"];
	stageUnlockSummary: WorkbenchModeProps["stageUnlockSummary"];
	videoSlot?: ReactNode;
};

type StageUnlockBriefAssembler = Extract<
	NonNullable<WorkbenchModeProps["lesson"]["briefAssembler"]>,
	{ variant: "stage_unlock" }
>;

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

function StageUnlockHeroPanel({
	briefAssembler,
	artifact,
}: {
	briefAssembler: StageUnlockBriefAssembler;
	artifact: WorkbenchModeProps["lesson"]["artifact"];
}) {
	return (
		<Card className="gap-0 py-0">
			<CardContent className="p-0">
				<div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(240px,0.9fr)] lg:items-start">
					<div className="space-y-4">
						<div className="space-y-2">
							<p className="text-sm font-medium text-muted-foreground">
								{briefAssembler.heroEyebrow}
							</p>
							<CardTitle className="text-balance text-3xl font-semibold sm:text-4xl">
								{briefAssembler.heroTitle}
							</CardTitle>
						</div>
						<CardDescription className="max-w-[68ch] text-[13px] leading-7">
							{briefAssembler.heroBody}
						</CardDescription>
						<div className="space-y-1">
							<p className="text-sm font-medium text-foreground">
								Next: {briefAssembler.nextStepLabel}
							</p>
							<p className="max-w-sm text-sm leading-6 text-muted-foreground">
								{getNextStepSupportCopy(briefAssembler.preset)}
							</p>
						</div>
					</div>
					<Card className="min-w-[220px] gap-0 py-4 shadow-none ring-1 ring-border">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Artifact locked next
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 pt-0">
							<p className="text-lg font-semibold leading-6 text-foreground">
								{artifact.label}
							</p>
							<CardDescription className="text-sm leading-6">
								{briefAssembler.artifactReadyCopy ??
									"You are not guessing anymore. The next block gets a real handoff now."}
							</CardDescription>
						</CardContent>
					</Card>
				</div>
			</CardContent>
		</Card>
	);
}

function StageUnlockStatsGrid({
	summary,
}: {
	summary: StageUnlockWorkbenchProps["stageUnlockSummary"];
}) {
	return (
		<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
			{summary?.stats.map((stat) => (
				<Card
					key={stat.label}
					className="gap-0 py-4 shadow-none ring-1 ring-border"
				>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							{stat.label}
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<p className="text-base font-medium leading-tight text-foreground tabular-nums">
							{stat.value}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function StageUnlockSectionsCard({
	summary,
	preset,
}: {
	summary: StageUnlockWorkbenchProps["stageUnlockSummary"];
	preset: "ceo" | "design" | "build";
}) {
	return (
		<Card className="gap-0 py-0">
			<CardHeader className={sectionShellHeaderClass}>
				<CardTitle className="text-sm font-semibold leading-none">
					{summary?.sectionHeading ?? "What you built"}
				</CardTitle>
			</CardHeader>
			<CardContent className={sectionShellBodyClass}>
				{summary?.sections.length ? (
					<div className="grid gap-3 lg:grid-cols-2">
						{summary.sections.map((section) => (
							<StageUnlockSectionCard
								key={section.label}
								className={getSectionGridClass(section)}
								section={section}
							/>
						))}
					</div>
				) : (
					<p className="max-w-2xl text-sm leading-7 text-muted-foreground">
						{getEmptyStateCopy(preset)}
					</p>
				)}
			</CardContent>
		</Card>
	);
}

function StageUnlockSkillsCard({ skills }: { skills: string[] }) {
	return (
		<Card className="gap-0 py-0">
			<CardHeader className={sectionShellHeaderClass}>
				<CardTitle className="text-sm font-semibold leading-none">
					Skills you flexed
				</CardTitle>
			</CardHeader>
			<CardContent className={sectionShellBodyClass}>
				<div className="flex flex-wrap gap-2">
					{skills.map((skill) => (
						<Badge key={skill} variant="secondary" className="font-normal">
							{skill}
						</Badge>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function StageUnlockWorkbench({
	lesson,
	fieldValues = {},
	onFieldChange = () => {},
	invalidFieldIds = new Set<string>(),
	invalidFieldMessages = new Map<string, string>(),
	stageUnlockSummary,
	videoSlot = null,
}: StageUnlockWorkbenchProps) {
	const briefAssembler = lesson.briefAssembler;

	if (!briefAssembler || briefAssembler.variant !== "stage_unlock") {
		return null;
	}

	const summary = stageUnlockSummary;
	const reviewField = lesson.workbenchFields?.find(
		(field) => field.id === "brief_review_checks",
	);

	return (
		<div className="w-full space-y-4 pb-1">
			<div className="space-y-4">
				{videoSlot}
				<StageUnlockHeroPanel
					artifact={lesson.artifact}
					briefAssembler={briefAssembler}
				/>

				<StageUnlockStatsGrid summary={summary} />

				<StageUnlockSectionsCard
					summary={summary}
					preset={briefAssembler.preset}
				/>

				{reviewField ? (
					<StageUnlockReviewCard
						field={reviewField}
						value={fieldValues?.[reviewField.id]}
						onChange={(value) => onFieldChange(reviewField.id, value)}
						invalid={invalidFieldIds.has(reviewField.id)}
						invalidMessage={invalidFieldMessages.get(reviewField.id)}
					/>
				) : null}

				{summary?.bridge ? (
					<StageUnlockBridgeCard bridge={summary.bridge} />
				) : null}

				<StageUnlockSkillsCard skills={briefAssembler.skills} />
			</div>
		</div>
	);
}
