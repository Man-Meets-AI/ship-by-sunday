import type { LessonHandoff } from "@/features/course/lesson/model/manifest";
import { Button } from "@/components/ui/button";
import { LessonChromeChip } from "@/features/course/lesson/shared/lesson-chrome-chip";

type CandidateProblem = {
	index: number;
	owner: string;
	statement: string;
};

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
	return (
		<>
			{selectedProblem ? (
				<div className="space-y-4">
					<div className="rounded-lg border border-primary/20 bg-primary/5">
						<div className="border-b border-border/60 px-4 py-3">
							<p className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
								Problem {selectedProblem.index}
							</p>
						</div>
						<div className="space-y-3 px-4 py-4 text-[12px] leading-relaxed text-foreground">
							<div>
								<p className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
									Chosen user
								</p>
								<p className="mt-1 text-sm font-semibold text-foreground">
									{selectedProblem.owner}
								</p>
							</div>
							<div>
								<p className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
									Chosen problem
								</p>
								<p className="mt-1 text-foreground">
									{selectedProblem.statement}
								</p>
							</div>
						</div>
						<div className="border-t border-border/60 px-4 py-3">
							<Button
								type="button"
								onClick={() => {
									onFieldChange(handoff.selectionFieldId, null);
									for (const field of persistedFields) {
										onFieldChange(field.targetFieldId, "");
									}
								}}
								variant="outline"
								size="sm"
							>
								Change selection
							</Button>
						</div>
					</div>
					<p className="text-[11px] leading-relaxed text-muted-foreground">
						{selectedCopy}
					</p>
				</div>
			) : candidateProblems.length > 0 ? (
				<div className="grid gap-3 lg:grid-cols-3">
					{candidateProblems.map((problem) => (
						<Button
							key={problem.index}
							type="button"
							onClick={() => {
								onFieldChange(handoff.selectionFieldId, problem.index);
								for (const field of persistedFields) {
									onFieldChange(
										field.targetFieldId,
										field.source === "owner"
											? problem.owner
											: problem.statement,
									);
								}
							}}
							variant="outline"
							size="sm"
							className="flex h-full w-full flex-col items-start px-4 py-4 text-left normal-case tracking-normal whitespace-normal"
						>
							<LessonChromeChip
								status="ready"
								label={`Problem ${problem.index}`}
							/>
							<p className="mt-3 text-sm font-semibold text-foreground">
								{problem.owner}
							</p>
							<p className="mt-3 flex-1 text-[12px] leading-relaxed text-foreground">
								{problem.statement}
							</p>
							<div className="mt-4 border-t border-border/60 pt-3">
								<LessonChromeChip status="ready" label="Use this problem" />
							</div>
						</Button>
					))}
				</div>
			) : (
				<div className="border border-dashed border-border bg-background px-4 py-4 text-[12px] leading-relaxed text-muted-foreground">
					The problems from the last lesson are not available yet. Go back to
					`1.3` and finish that page first.
				</div>
			)}
			{invalidSelection ? (
				<p className="text-[11px] font-medium leading-relaxed text-destructive">
					{invalidCopy}
				</p>
			) : null}
		</>
	);
}
