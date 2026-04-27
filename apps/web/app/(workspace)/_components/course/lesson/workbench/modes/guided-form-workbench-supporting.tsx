import type { ReactNode } from "react";

import type { PinnedArtifact } from "@/app/(workspace)/_components/course/lesson/shells/types";

import type { WorkbenchModeProps } from "../types";
import { CandidateProblemHandoff } from "./candidate-problem-handoff";
import { CeoSkillsCodexPanel } from "./ceo-skills-codex-panel";
import { DefineOutcomeSupport } from "./define-outcome-support";
import { GuidedFormArtifactGrid } from "./guided-form-workbench-chrome";
import { PickOneUserStatementPreviewCard } from "./pick-one-user-statement-preview-card";
import { StartWithProblemSupport } from "./start-with-problem-support";
import { WelcomeOrientationPanel } from "./welcome-orientation-panel";

export function GuidedFormSupportingContent({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	visiblePinnedArtifacts,
	workbenchCompletionSlot,
}: Pick<
	WorkbenchModeProps,
	| "lesson"
	| "lessonContent"
	| "fieldValues"
	| "onFieldChange"
	| "pinnedArtifacts"
	| "invalidFieldIds"
> & {
	visiblePinnedArtifacts: PinnedArtifact[];
	workbenchCompletionSlot: ReactNode;
}) {
	const showWelcomeOrientation = lesson.id === "1.1";
	const showCeoSkillsCodexPanel = lesson.id === "1.9";
	const showStartWithProblemSupport = lesson.id === "1.3";
	const showPickOneUserStatementPreview =
		lesson.id === "1.4" && lesson.handoff?.mode === "select_candidate_problem";
	const showDefineOutcomeSupport = lesson.id === "1.5";

	return (
		<>
			{showWelcomeOrientation ? (
				<WelcomeOrientationPanel
					lessonContent={lessonContent}
					workbenchCompletionSlot={workbenchCompletionSlot}
				/>
			) : null}
			{showCeoSkillsCodexPanel ? (
				<CeoSkillsCodexPanel
					lessonContent={lessonContent}
					workbenchCompletionSlot={workbenchCompletionSlot}
				/>
			) : null}
			{showStartWithProblemSupport ? (
				<StartWithProblemSupport lessonContent={lessonContent} />
			) : null}
			{lesson.handoff?.mode === "select_candidate_problem" ? (
				<>
					<CandidateProblemHandoff
						handoff={lesson.handoff}
						fieldValues={fieldValues}
						onFieldChange={onFieldChange}
						pinnedArtifacts={pinnedArtifacts}
						invalidFieldIds={invalidFieldIds}
					/>
					{showPickOneUserStatementPreview ? (
						<PickOneUserStatementPreviewCard
							handoff={lesson.handoff}
							fieldValues={fieldValues}
							pinnedArtifacts={pinnedArtifacts}
						/>
					) : null}
				</>
			) : null}
			{showDefineOutcomeSupport ? (
				<DefineOutcomeSupport fieldValues={fieldValues} />
			) : null}
			<GuidedFormArtifactGrid pinnedArtifacts={visiblePinnedArtifacts} />
		</>
	);
}
