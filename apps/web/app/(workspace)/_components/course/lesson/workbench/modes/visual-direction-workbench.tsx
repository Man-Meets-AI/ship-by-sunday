import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { LessonVideoSurface } from "@/app/(workspace)/_components/course/lesson/components/lesson-video-surface";

import { FieldControl } from "../fields/field-control";
import { ArtifactContext } from "../shared/artifact-context";
import { PromptImportCard } from "../shared/prompt-import-card";
import { renderLessonTitle } from "../shared/workbench-header";
import type { WorkbenchModeProps } from "../types";

function VisualDirectionLessonHeader({
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

function VisualDirectionLessonStatusGrid({
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

function RequiredFieldAlert({ visible }: { visible: boolean }) {
	if (!visible) {
		return null;
	}

	return (
		<Alert variant="destructive" className="mt-2 py-2">
			<AlertDescription className="text-xs font-medium leading-snug">
				This step is required before you can complete the lesson.
			</AlertDescription>
		</Alert>
	);
}

export function VisualDirectionWorkbench({
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
	const notesField = fields.find(
		(field) => field.id === "visual_direction_notes",
	);
	const markdownField = fields.find(
		(field) => field.id === "visual_guide_markdown",
	);

	return (
		<div className="w-full space-y-4 pb-1">
			<VisualDirectionLessonHeader
				lesson={lesson}
				lessonContent={lessonContent}
			/>
			<VisualDirectionLessonStatusGrid
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<div className="grid gap-3 xl:grid-cols-[minmax(280px,0.92fr)_minmax(0,1.08fr)]">
				<Card className="gap-0 py-0">
					<CardHeader className="border-b border-border/60 pb-4">
						<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Watch lesson
						</CardTitle>
					</CardHeader>
					<CardContent className="py-4">
						<LessonVideoSurface coachContent={lessonContent.coach} />
					</CardContent>
				</Card>
				<Card className="gap-0 py-0">
					<CardHeader className="border-b border-border/60 pb-4">
						<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Screen context
						</CardTitle>
					</CardHeader>
					<CardContent className="py-4">
						<div className="space-y-3">
							<p className="text-sm font-medium leading-relaxed text-muted-foreground">
								Use your rough screens to lock the visual direction before you
								ask a coding agent for `visualguide.md`.
							</p>
							<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
						</div>
					</CardContent>
				</Card>
			</div>
			<Card className="gap-0 py-0">
				<CardHeader className="border-b border-border/60 pb-4">
					<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Follow this order
					</CardTitle>
				</CardHeader>
				<CardContent className="py-4">
					<ol className="space-y-2 text-sm leading-relaxed text-foreground">
						<li>1. Review the lesson video and your rough screens together.</li>
						<li>2. Write the visual changes or direction you want to push.</li>
						<li>
							3. Copy the generated prompt into your preferred coding agent.
						</li>
						<li>
							4. Paste the returned `visualguide.md` back here and save it.
						</li>
					</ol>
				</CardContent>
			</Card>
			{notesField ? (
				<Card className="gap-0 py-0">
					<CardHeader className="border-b border-border/60 pb-4">
						<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Direction note
						</CardTitle>
					</CardHeader>
					<CardContent className="py-4">
						<FieldControl
							field={notesField}
							value={fieldValues[notesField.id]}
							onChange={(value) => onFieldChange(notesField.id, value)}
							pinnedArtifacts={pinnedArtifacts}
							showLabel={false}
						/>
						<RequiredFieldAlert visible={invalidFieldIds.has(notesField.id)} />
					</CardContent>
				</Card>
			) : null}
			{lesson.promptImport ? (
				<PromptImportCard
					lesson={lesson}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					fieldValues={fieldValues}
				/>
			) : null}
			{markdownField ? (
				<Card className="gap-0 py-0">
					<CardHeader className="border-b border-border/60 pb-4">
						<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Saved visualguide.md
						</CardTitle>
					</CardHeader>
					<CardContent className="py-4">
						<FieldControl
							field={markdownField}
							value={fieldValues[markdownField.id]}
							onChange={(value) => onFieldChange(markdownField.id, value)}
							pinnedArtifacts={pinnedArtifacts}
							showLabel={false}
						/>
						<RequiredFieldAlert
							visible={invalidFieldIds.has(markdownField.id)}
						/>
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}
