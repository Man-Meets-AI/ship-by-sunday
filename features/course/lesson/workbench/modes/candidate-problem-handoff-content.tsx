"use client";

import type { LessonHandoff } from "@/features/course/lesson/model/manifest";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardDescription } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CircleAlertIcon } from "lucide-react";
import { CandidateProblemHandoffSelected } from "./candidate-problem-handoff-selected";

type CandidateProblem = {
	index: number;
	owner: string;
	statement: string;
};

function commitSelection(
	handoff: LessonHandoff,
	problem: CandidateProblem,
	persistedFields: NonNullable<LessonHandoff["persistedFields"]>,
	onFieldChange: (fieldId: string, value: unknown) => void,
) {
	onFieldChange(handoff.selectionFieldId, problem.index);
	for (const field of persistedFields) {
		onFieldChange(
			field.targetFieldId,
			field.source === "owner" ? problem.owner : problem.statement,
		);
	}
}

export function CandidateProblemHandoffContent({
	handoff,
	candidateProblems,
	selectedProblem,
	persistedFields,
	onFieldChange,
	selectedCopy,
	invalidSelection,
	invalidCopy,
}: {
	handoff: LessonHandoff;
	candidateProblems: CandidateProblem[];
	selectedProblem: CandidateProblem | null | undefined;
	persistedFields: NonNullable<LessonHandoff["persistedFields"]>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	selectedCopy: string;
	invalidSelection: boolean;
	invalidCopy: string;
}) {
	const toggleValue =
		selectedProblem !== null && selectedProblem !== undefined
			? String(selectedProblem.index)
			: "";

	const otherProblems = selectedProblem
		? candidateProblems.filter((p) => p.index !== selectedProblem.index)
		: [];

	return (
		<div className="space-y-4">
			<Alert>
				<CircleAlertIcon />
				<AlertTitle>Commitment step</AlertTitle>
				<AlertDescription>
					This is a commitment step, not a full product strategy exercise. Pick
					one problem and qualify it enough to move on.
				</AlertDescription>
			</Alert>

			{selectedProblem ? (
				<CandidateProblemHandoffSelected
					handoff={handoff}
					selectedProblem={selectedProblem}
					otherProblems={otherProblems}
					persistedFields={persistedFields}
					onFieldChange={onFieldChange}
					selectedCopy={selectedCopy}
				/>
			) : null}

			{!selectedProblem && candidateProblems.length > 0 ? (
				<div className="space-y-2">
					<CardDescription>
						Choose one problem. Your three candidates from the previous lesson are
						below.
					</CardDescription>
					<ToggleGroup
						type="single"
						className="w-full flex-col"
						value={toggleValue}
						onValueChange={(value) => {
							if (!value) {
								return;
							}
							const index = Number(value);
							const problem = candidateProblems.find((p) => p.index === index);
							if (problem) {
								commitSelection(
									handoff,
									problem,
									persistedFields,
									onFieldChange,
								);
							}
						}}
					>
						{candidateProblems.map((problem) => (
							<ToggleGroupItem
								key={problem.index}
								value={String(problem.index)}
								aria-label={`Problem ${problem.index}: ${problem.owner}`}
								className="h-auto min-h-0 w-full flex-col items-start gap-1 py-3 whitespace-normal"
							>
								<span className="font-medium">Problem {problem.index}</span>
								<span className="text-left text-muted-foreground">
									{problem.owner}
								</span>
								<span className="text-left text-sm text-muted-foreground">
									{problem.statement}
								</span>
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>
			) : null}

			{candidateProblems.length === 0 ? (
				<CardDescription>
					The problems from the last lesson are not available yet. Go back to
					lesson 1.3 and finish that page first.
				</CardDescription>
			) : null}

			{invalidSelection ? (
				<Alert variant="destructive">
					<CircleAlertIcon />
					<AlertTitle>Selection required</AlertTitle>
					<AlertDescription>{invalidCopy}</AlertDescription>
				</Alert>
			) : null}
		</div>
	);
}
