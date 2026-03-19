import type { LessonHandoff } from "@/features/course/lesson/model/manifest";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCandidateProblemOptions } from "@/features/course/lesson/model/registry";
import type { WorkbenchModeProps } from "../types";
import { CandidateProblemHandoffContent } from "./candidate-problem-handoff-content";

const HANDOFF_TITLE = "Pick the problem to carry forward";
const HANDOFF_HELPER_COPY =
	"Pick one of the three problems you just wrote. This becomes your working direction for the next CEO lessons.";
const HANDOFF_SELECTED_COPY =
	"The selected problem owner is your user. Now ground this direction in a real moment, a current workaround, and a path to reach them.";
const HANDOFF_INVALID_COPY =
	"Pick the problem to carry forward before continuing.";

export function CandidateProblemHandoff({
	handoff,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
}: {
	handoff: LessonHandoff;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: WorkbenchModeProps["pinnedArtifacts"];
	invalidFieldIds: Set<string>;
}) {
	const sourceArtifact = pinnedArtifacts.find(
		(artifact) => artifact.artifactKey === handoff.sourceArtifactKey,
	);
	const candidateProblems = getCandidateProblemOptions(
		handoff,
		sourceArtifact?.fieldValues,
	);
	const persistedFields = handoff.persistedFields ?? [];
	const selectedProblemIndex =
		typeof fieldValues[handoff.selectionFieldId] === "number"
			? (fieldValues[handoff.selectionFieldId] as number)
			: typeof fieldValues[handoff.selectionFieldId] === "string"
				? Number(fieldValues[handoff.selectionFieldId])
				: null;
	const selectedProblem =
		selectedProblemIndex !== null
			? candidateProblems.find(
					(problem) => problem.index === selectedProblemIndex,
				)
			: null;

	return (
		<Card className="gap-0 py-0">
			<CardHeader className="border-b border-border/60 px-4 py-3">
				<h2 className="text-base font-semibold leading-snug text-foreground">
					{HANDOFF_TITLE}
				</h2>
				<p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
					{HANDOFF_HELPER_COPY}
				</p>
			</CardHeader>
			<CardContent className="space-y-4 px-4 py-4">
				<CandidateProblemHandoffContent
					handoff={handoff}
					candidateProblems={candidateProblems}
					selectedProblem={selectedProblem}
					persistedFields={persistedFields}
					onFieldChange={onFieldChange}
					selectedCopy={HANDOFF_SELECTED_COPY}
					invalidSelection={invalidFieldIds.has(handoff.selectionFieldId)}
					invalidCopy={HANDOFF_INVALID_COPY}
				/>
			</CardContent>
		</Card>
	);
}
