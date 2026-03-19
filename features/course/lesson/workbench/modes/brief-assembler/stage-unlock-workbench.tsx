import { LessonVideoSurface } from "@/features/course/lesson/components/lesson-video-surface";
import type { StageUnlockSection } from "@/features/course/lesson/model/stage-unlock";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { WorkbenchContainer } from "../../shared/workbench-container";
import type { WorkbenchModeProps } from "../../types";
import { StageUnlockBridgeCard } from "./stage-unlock-bridge-card";
import { StageUnlockReviewCard } from "./stage-unlock-review-card";
import { StageUnlockSectionCard } from "./stage-unlock-section-card";

const neutralInsetClass =
	"rounded-lg border border-input bg-background text-card-foreground";

const neutralHeaderClass = "border-b border-border/60 px-4 py-3 sm:px-5";

const neutralBodyClass = "px-4 py-4 sm:px-5 sm:py-5";

const neutralLabelClass = "text-sm font-medium text-muted-foreground";

const neutralSupportCopyClass =
	"max-w-[68ch] text-[13px] leading-7 text-muted-foreground";

type StageUnlockWorkbenchProps = {
	lesson: WorkbenchModeProps["lesson"];
	lessonContent: WorkbenchModeProps["lessonContent"];
	fieldValues?: WorkbenchModeProps["fieldValues"];
	onFieldChange?: WorkbenchModeProps["onFieldChange"];
	invalidFieldIds?: WorkbenchModeProps["invalidFieldIds"];
	invalidFieldMessages?: WorkbenchModeProps["invalidFieldMessages"];
	stageUnlockSummary: WorkbenchModeProps["stageUnlockSummary"];
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
							<p className={neutralLabelClass}>{briefAssembler.heroEyebrow}</p>
							<h1
								className="text-balance text-3xl font-semibold text-foreground sm:text-4xl"
								style={{ textWrap: "balance" }}
							>
								{briefAssembler.heroTitle}
							</h1>
						</div>
						<p className={neutralSupportCopyClass}>{briefAssembler.heroBody}</p>
						<div className="space-y-1">
							<p className="text-sm font-medium text-foreground">
								Next: {briefAssembler.nextStepLabel}
							</p>
							<p
								className="max-w-sm text-sm leading-6 text-muted-foreground"
								style={{ textWrap: "balance" }}
							>
								{getNextStepSupportCopy(briefAssembler.preset)}
							</p>
						</div>
					</div>
					<div className={`${neutralInsetClass} min-w-[220px] px-4 py-4`}>
						<p className={neutralLabelClass}>Artifact locked next</p>
						<p
							className="mt-3 text-lg font-semibold leading-6 text-foreground"
							style={{ textWrap: "balance" }}
						>
							{artifact.label}
						</p>
						<p className="mt-3 text-sm leading-6 text-muted-foreground">
							{briefAssembler.artifactReadyCopy ??
								"You are not guessing anymore. The next block gets a real handoff now."}
						</p>
					</div>
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
				<div key={stat.label} className={`${neutralInsetClass} px-4 py-4`}>
					<p className={neutralLabelClass}>{stat.label}</p>
					<p
						className="mt-3 text-base font-medium leading-tight text-foreground"
						style={{ fontVariantNumeric: "tabular-nums" }}
					>
						{stat.value}
					</p>
				</div>
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
			<CardHeader className={neutralHeaderClass}>
				<h2 className="text-sm font-semibold leading-none text-foreground">
					{summary?.sectionHeading ?? "What you built"}
				</h2>
			</CardHeader>
			<CardContent className={neutralBodyClass}>
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
			<CardHeader className={neutralHeaderClass}>
				<h2 className="text-sm font-semibold leading-none text-foreground">
					Skills you flexed
				</h2>
			</CardHeader>
			<CardContent className={neutralBodyClass}>
				<div className="flex flex-wrap gap-2">
					{skills.map((skill) => (
						<span
							key={skill}
							className="inline-flex items-center rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-muted-foreground"
						>
							{skill}
						</span>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function StageUnlockWorkbench({
	lesson,
	lessonContent,
	fieldValues = {},
	onFieldChange = () => {},
	invalidFieldIds = new Set<string>(),
	invalidFieldMessages = new Map<string, string>(),
	stageUnlockSummary,
}: StageUnlockWorkbenchProps) {
	const briefAssembler = lesson.briefAssembler;

	if (!briefAssembler || briefAssembler.variant !== "stage_unlock") {
		return null;
	}

	const summary = stageUnlockSummary;
	const showLeadVideo = briefAssembler.leadVideo;
	const reviewField = lesson.workbenchFields?.find(
		(field) => field.id === "brief_review_checks",
	);

	return (
		<WorkbenchContainer>
			<div className="space-y-4">
				{showLeadVideo ? (
					<LessonVideoSurface
						coachContent={lessonContent.coach}
						variant="watch-shell"
					/>
				) : null}
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
		</WorkbenchContainer>
	);
}
