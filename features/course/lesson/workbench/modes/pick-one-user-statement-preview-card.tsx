import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { LessonHandoff } from "@/features/course/lesson/model/manifest";
import { getCandidateProblemOptions } from "@/features/course/lesson/model/registry";
import { cn } from "@/lib/utils";
import type { WorkbenchModeProps } from "../types";
import { buildPreviewRows } from "./pick-one-user/pick-one-user-utils";

export function PickOneUserStatementPreviewCard({
	handoff,
	fieldValues,
	pinnedArtifacts,
}: {
	handoff: LessonHandoff;
	fieldValues: Record<string, unknown>;
	pinnedArtifacts: WorkbenchModeProps["pinnedArtifacts"];
}) {
	const sourceArtifact = pinnedArtifacts.find(
		(artifact) => artifact.artifactKey === handoff.sourceArtifactKey,
	);
	const candidateProblems = getCandidateProblemOptions(
		handoff,
		sourceArtifact?.fieldValues,
	);
	const rawSelection = fieldValues[handoff.selectionFieldId];
	const rawIndex =
		typeof rawSelection === "number"
			? rawSelection
			: typeof rawSelection === "string"
				? Number(rawSelection)
				: null;
	const selectedProblem =
		rawIndex !== null && Number.isFinite(rawIndex)
			? candidateProblems.find((problem) => problem.index === rawIndex)
			: undefined;
	const previewRows = buildPreviewRows(fieldValues, selectedProblem);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Selected user problem brief</CardTitle>
				<CardDescription>
					Lesson 1.5 will build on this brief—one committed problem and how you
					qualified it.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{previewRows.map((row, index) => (
					<div key={row.label}>
						{index > 0 ? <Separator className="my-4" /> : null}
						<div className="space-y-1.5">
							<Label className="text-sm font-medium text-muted-foreground">
								{row.label}
							</Label>
							<p
								className={cn(
									"text-sm leading-relaxed",
									row.filled ? "text-foreground" : "text-muted-foreground",
								)}
							>
								{row.value}
							</p>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
