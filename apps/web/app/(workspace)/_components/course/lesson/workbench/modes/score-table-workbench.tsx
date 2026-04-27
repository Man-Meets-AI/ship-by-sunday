import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
	LessonConfig,
	LessonContent,
} from "@/lib/course/lesson/model/manifest";

import { FieldControl } from "../fields/field-control";
import { FieldList } from "../fields/field-list";
import { PromptImportCard } from "../shared/prompt-import-card";
import { renderLessonTitle } from "../shared/workbench-header";
import type { WorkbenchModeProps } from "../types";

const chromeLabelClass =
	"text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground";

function getPinnedTextValue(
	pinnedArtifacts: WorkbenchModeProps["pinnedArtifacts"],
	artifactKey: string,
	fieldId: string,
) {
	const artifact = pinnedArtifacts.find(
		(candidate) => candidate.artifactKey === artifactKey,
	);
	const value = artifact?.fieldValues?.[fieldId];
	if (typeof value !== "string") {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function ScoreTableLessonHeader({
	lesson,
	lessonContent,
}: {
	lesson: LessonConfig;
	lessonContent: LessonContent;
}) {
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-wrap items-center gap-2 text-muted-foreground">
					<Badge variant="secondary" className="text-xs font-medium">
						{lesson.id}
					</Badge>
					<Badge variant="outline" className="text-xs font-medium">
						{lesson.artifact.label}
					</Badge>
					{lessonContent.lessonMeta.runtimeLabel ? (
						<span className="text-xs font-medium text-muted-foreground">
							{lessonContent.lessonMeta.runtimeLabel}
						</span>
					) : null}
				</div>
				<CardTitle className="text-balance text-3xl font-semibold sm:text-4xl">
					{renderLessonTitle(lesson.title)}
				</CardTitle>
				<CardDescription className="max-w-prose pt-0.5 text-base leading-relaxed">
					{lessonContent.intro}
				</CardDescription>
			</CardHeader>
		</Card>
	);
}

function ScoreTableLessonStatusGrid({
	lessonContent,
	completedTaskCount,
	totalTaskCount,
}: {
	lessonContent: LessonContent;
	completedTaskCount: number;
	totalTaskCount: number;
}) {
	const progressValue =
		totalTaskCount > 0
			? Math.round((completedTaskCount / totalTaskCount) * 100)
			: 0;

	const rows: { label: string; body: string; lineClamp?: boolean }[] = [
		{
			label: "Do this now",
			body: lessonContent.actionCard.jobNow,
			lineClamp: true,
		},
		{ label: "Timebox", body: lessonContent.actionCard.timebox },
		{
			label: "Finish with",
			body: lessonContent.actionCard.comeBackWith,
			lineClamp: true,
		},
	];

	return (
		<div
			role="list"
			className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
		>
			{rows.map((row) => (
				<Card key={row.label} role="listitem" className="py-3">
					<CardHeader className="gap-1.5 px-4 py-0">
						<CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground">
							{row.label}
						</CardTitle>
						<CardDescription
							className={
								row.lineClamp
									? "line-clamp-4 text-foreground"
									: "text-foreground"
							}
						>
							{row.body}
						</CardDescription>
					</CardHeader>
				</Card>
			))}
			<Card role="listitem" className="py-3">
				<CardHeader className="gap-1.5 px-4 py-0">
					<CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground">
						Progress
					</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-2 pt-0">
					<p className="text-sm font-medium tabular-nums text-foreground">
						{completedTaskCount}/{totalTaskCount}
					</p>
					<Progress value={progressValue} className="h-1.5" />
				</CardContent>
			</Card>
		</div>
	);
}

export function ScoreTableWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
	fields,
	objectiveTasks,
	completedTaskCount,
}: WorkbenchModeProps) {
	const promptImport =
		lesson.promptImport?.promptTemplateId === "competitor_research"
			? lesson.promptImport
			: undefined;
	const tableField = promptImport
		? (fields.find((field) => field.id === promptImport.tableFieldId) ??
			fields[0])
		: fields[0];
	const restFields = promptImport
		? fields.filter((field) => field.id !== promptImport.tableFieldId)
		: fields.slice(1);
	const researchUser = getPinnedTextValue(
		pinnedArtifacts,
		"user_statement",
		"selected_problem_owner",
	);
	const researchProblem = getPinnedTextValue(
		pinnedArtifacts,
		"user_statement",
		"selected_problem_statement",
	);
	const promisedOutcome = getPinnedTextValue(
		pinnedArtifacts,
		"outcome_statement",
		"outcome_statement_body",
	);

	return (
		<div className="w-full space-y-4 pb-1">
			<ScoreTableLessonHeader lesson={lesson} lessonContent={lessonContent} />
			<ScoreTableLessonStatusGrid
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			{researchUser || promisedOutcome ? (
				<Card className="gap-0 py-0">
					<CardHeader className="border-b border-border/60 pb-4">
						<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Research target
						</CardTitle>
					</CardHeader>
					<CardContent className="py-4">
						<div className="space-y-2">
							<p className="text-[13px] leading-[1.7] text-muted-foreground">
								Look for evidence that this outcome matters and how current
								options handle it. Keep the research anchored to this exact bet.
							</p>
							<div className="grid gap-3 md:grid-cols-2">
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className={chromeLabelClass}>User</CardTitle>
									</CardHeader>
									<CardContent className="pt-0">
										<p className="text-[14px] leading-[1.55] text-foreground">
											{researchUser ?? "Use your saved user from 1.2."}
										</p>
										{researchProblem ? (
											<p className="mt-2 text-[13px] leading-[1.68] text-muted-foreground">
												Problem: {researchProblem}
											</p>
										) : null}
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className={chromeLabelClass}>
											Promise to pressure-test
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-0">
										<p className="text-[14px] leading-[1.55] text-foreground">
											{promisedOutcome ?? "Use your saved outcome from 1.3."}
										</p>
									</CardContent>
								</Card>
							</div>
						</div>
					</CardContent>
				</Card>
			) : null}
			{promptImport ? (
				<PromptImportCard
					lesson={lesson}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					fieldValues={fieldValues}
				/>
			) : null}
			{tableField ? (
				<Card className="gap-0 py-0">
					<CardHeader className="border-b border-border/60 pb-4">
						<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Research table
						</CardTitle>
					</CardHeader>
					<CardContent className="py-4">
						<div className="mb-3 space-y-1.5">
							<p className="text-[14px] leading-[1.7] text-foreground">
								Start with 2-3 quick scans of real alternatives or current
								workarounds.
							</p>
							<p className="text-[13px] leading-[1.7] text-muted-foreground">
								For each row, note one concrete surface you checked in{" "}
								<span className="text-foreground">Evidence Seen</span>. If you
								are inferring, say it briefly.
							</p>
						</div>
						<FieldControl
							field={tableField}
							value={fieldValues[tableField.id]}
							onChange={(value) => onFieldChange(tableField.id, value)}
							pinnedArtifacts={pinnedArtifacts}
							showLabel={false}
						/>
					</CardContent>
				</Card>
			) : null}
			<FieldList
				fields={restFields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				invalidFieldMessages={invalidFieldMessages}
				className={
					restFields.length > 1 ? "grid gap-4 md:grid-cols-2" : "space-y-4"
				}
			/>
		</div>
	);
}
