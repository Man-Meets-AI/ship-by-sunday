import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type {
	LessonContent,
	WorkbenchField,
} from "@/features/course/lesson/model/manifest";
import {
	getStartWithProblemCandidate,
	getStartWithProblemSignals,
} from "@/features/course/lesson/workbench/lib/start-with-problem-support";

import { CompareCandidatesSection } from "./compare-candidates-section";

const QUALITY_TIPS = [
	"Name a real person or group, not a market.",
	"Describe the pain that keeps happening.",
	"Anchor it in life or work, not a startup idea.",
] as const;

function StartWithProblemExampleCards({
	examples,
}: {
	examples: NonNullable<LessonContent["coach"]["examples"]>;
}) {
	return (
		<div className="grid gap-3 lg:grid-cols-2">
			{examples.map((example) => (
				<Card key={example.id} className="gap-0 py-0">
					<CardHeader className="border-b border-border pb-3">
						<CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							{example.title}
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-3">
						<p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
							{example.body}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export function StartWithProblemSupport({
	lessonContent,
	fieldValues,
	fields,
	onFieldChange,
	invalidFieldIds,
}: {
	lessonContent: LessonContent;
	fieldValues: Record<string, unknown>;
	fields: WorkbenchField[];
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
}) {
	const examples = (lessonContent.coach.examples ?? []).slice(0, 2);
	const compareRows = ([1, 2, 3] as const).map((index) => {
		const candidate = getStartWithProblemCandidate(fieldValues, index);
		return {
			...candidate,
			signals: getStartWithProblemSignals(candidate),
		};
	});

	return (
		<div className="space-y-3">
			<Card className="gap-0 py-0">
				<CardHeader className="border-b border-border pb-4">
					<CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Quality bar
					</CardTitle>
					<CardDescription className="text-foreground">
						Write three candidate pains that are grounded enough to carry into{" "}
						<span className="font-medium text-foreground">1.4</span>. Strong
						problems name a real person, a recurring headache, and a situation
						that person would recognize immediately.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 pt-4">
					<ul className="list-disc space-y-2 pl-5 text-sm leading-snug text-foreground">
						{QUALITY_TIPS.map((tip) => (
							<li key={tip}>{tip}</li>
						))}
					</ul>
					<Alert>
						<AlertTitle>Next lesson handoff</AlertTitle>
						<AlertDescription>
							You will choose one of these three problems to carry into{" "}
							<span className="font-medium text-foreground">
								1.4 Pick One User
							</span>
							.
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
			{examples.length > 0 ? (
				<Card className="gap-0 py-0">
					<CardHeader className="border-b border-border pb-4">
						<CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Examples that set the bar
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-4">
						<StartWithProblemExampleCards examples={examples} />
					</CardContent>
				</Card>
			) : null}
			<CompareCandidatesSection
				rows={compareRows}
				fields={fields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				invalidFieldIds={invalidFieldIds}
			/>
		</div>
	);
}
