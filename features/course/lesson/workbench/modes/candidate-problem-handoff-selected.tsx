"use client";

import type { LessonHandoff } from "@/features/course/lesson/model/manifest";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";

type CandidateProblem = {
	index: number;
	owner: string;
	statement: string;
};

export function CandidateProblemHandoffSelected({
	handoff,
	selectedProblem,
	otherProblems,
	persistedFields,
	onFieldChange,
	selectedCopy,
}: {
	handoff: LessonHandoff;
	selectedProblem: CandidateProblem;
	otherProblems: CandidateProblem[];
	persistedFields: NonNullable<LessonHandoff["persistedFields"]>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	selectedCopy: string;
}) {
	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<CardTitle>Problem {selectedProblem.index}</CardTitle>
				<CardDescription>{selectedProblem.owner}</CardDescription>
				<p className="text-sm text-muted-foreground">
					{selectedProblem.statement}
				</p>
			</div>
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => {
					onFieldChange(handoff.selectionFieldId, null);
					for (const field of persistedFields) {
						onFieldChange(field.targetFieldId, "");
					}
				}}
			>
				Change selection
			</Button>
			{otherProblems.length > 0 ? (
				<Accordion type="multiple" className="w-full">
					{otherProblems.map((problem) => (
						<AccordionItem
							key={problem.index}
							value={`candidate-${problem.index}`}
						>
							<AccordionTrigger>
								Other candidate · Problem {problem.index}
							</AccordionTrigger>
							<AccordionContent>
								<div className="space-y-2">
									<p className="text-sm font-medium">{problem.owner}</p>
									<p className="text-sm text-muted-foreground">
										{problem.statement}
									</p>
								</div>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			) : null}
			<p className="text-sm text-muted-foreground">{selectedCopy}</p>
		</div>
	);
}
