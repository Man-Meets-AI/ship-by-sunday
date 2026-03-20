import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { LessonContent } from "@/features/course/lesson/model/manifest";

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
}: {
	lessonContent: LessonContent;
}) {
	const examples = (lessonContent.coach.examples ?? []).slice(0, 2);

	return (
		<Card className="gap-0 py-0">
			<CardHeader className="border-b border-border pb-4">
				<CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
					Quality bar
				</CardTitle>
				<CardDescription className="text-pretty text-foreground">
					Write three candidate pains that are grounded enough to carry into{" "}
					<span className="font-medium text-foreground">1.4</span>. Strong
					problems name a real person, a recurring headache, and a situation
					that person would recognize immediately.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 pt-4">
				{examples.length > 0 ? (
					<div className="space-y-3">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Examples that set the bar
						</p>
						<StartWithProblemExampleCards examples={examples} />
					</div>
				) : null}
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
	);
}
