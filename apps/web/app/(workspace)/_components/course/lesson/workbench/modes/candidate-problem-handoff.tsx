import type { LessonHandoff } from "@/lib/course/lesson/model/manifest";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getCandidateProblemOptions } from "@/lib/course/lesson/model/registry";
import type { WorkbenchModeProps } from "../types";
import { CandidateProblemHandoffContent } from "./candidate-problem-handoff-content";

const HANDOFF_TITLE = "Your three problem candidates";
const HANDOFF_HELPER_COPY =
	"Select exactly one to carry forward. You can change your mind until you finish the lesson.";
const HANDOFF_SELECTED_COPY =
	"Use the fields below to qualify this problem—when it happens, where it shows up, what triggers it, and how painful it is.";
const HANDOFF_INVALID_COPY = "Select one problem before continuing.";

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
		selectedProblemIndex !== null && Number.isFinite(selectedProblemIndex)
			? candidateProblems.find(
					(problem) => problem.index === selectedProblemIndex,
				)
			: null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{HANDOFF_TITLE}</CardTitle>
				<CardDescription>{HANDOFF_HELPER_COPY}</CardDescription>
			</CardHeader>
			<CardContent>
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
