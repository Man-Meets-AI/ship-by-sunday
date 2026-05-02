"use client";

import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/blueprint-compiler";
import { BlueprintPageOverview } from "@/app/(workspace)/_components/blueprint-flow/blueprint-page-overview";
import { BlueprintPageProgressSidebar } from "@/app/(workspace)/_components/blueprint-flow/blueprint-page-progress-sidebar";
import { BlueprintPageSaveBar } from "@/app/(workspace)/_components/blueprint-flow/blueprint-page-save-bar";
import { BlueprintPageSectionCard } from "@/app/(workspace)/_components/blueprint-flow/blueprint-page-section-card";
import type { BlueprintPageSectionStatus } from "@/app/(workspace)/_hooks/blueprint-flow/use-blueprint-page-state";
import { blueprintPageSections } from "@/lib/blueprint-flow/blueprint-page-sections";
import type { BlueprintStepInlineFeedback } from "@/lib/blueprint-flow/blueprint-step-save-feedback";

export function BlueprintPageBody({
	currentDraftValues,
	currentFacts,
	currentFieldErrors,
	currentSectionStatuses,
	feedback,
	handleFieldChange,
	handleSaveAndContinue,
	isReviewReady,
	isSaving,
}: {
	currentDraftValues: Record<string, string>;
	currentFacts: CanonicalProjectFactsDraft;
	currentFieldErrors: Record<string, string>;
	currentSectionStatuses: BlueprintPageSectionStatus[];
	feedback: BlueprintStepInlineFeedback | null;
	handleFieldChange: (
		fieldKey: CanonicalProjectFactKey,
		nextValue: string,
	) => void;
	handleSaveAndContinue: () => void | Promise<void>;
	isReviewReady: boolean;
	isSaving: boolean;
}) {
	const completedSectionCount = currentSectionStatuses.filter(
		(s) => s.isComplete,
	).length;
	const sectionStatusById = new Map(
		currentSectionStatuses.map((sectionStatus) => [
			sectionStatus.sectionId,
			sectionStatus,
		]),
	);

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-1 gap-8 px-4 pb-20 pt-4 lg:gap-10 xl:gap-12">
			<div className="hidden w-48 shrink-0 xl:block">
				<div className="sticky top-20">
					<BlueprintPageProgressSidebar
						sectionStatuses={currentSectionStatuses}
					/>
				</div>
			</div>
			<div className="mx-auto flex w-full min-w-0 max-w-2xl flex-1 flex-col xl:mx-0">
				<BlueprintPageOverview
					completedSectionCount={completedSectionCount}
					totalSectionCount={currentSectionStatuses.length}
				/>
				{blueprintPageSections.map((section, index) => {
					const sectionStatus = sectionStatusById.get(section.id);
					if (!sectionStatus) {
						throw new Error(
							`Missing blueprint page section status for ${section.id}`,
						);
					}

					return (
						<BlueprintPageSectionCard
							key={section.id}
							draftValues={currentDraftValues}
							facts={currentFacts}
							fieldErrors={currentFieldErrors}
							isComplete={sectionStatus.isComplete}
							onChange={handleFieldChange}
							section={section}
							sectionNumber={index + 1}
						/>
					);
				})}
				<BlueprintPageSaveBar
					feedback={feedback}
					isReviewReady={isReviewReady}
					isSaving={isSaving}
					onSaveAndContinue={handleSaveAndContinue}
				/>
			</div>
		</div>
	);
}
