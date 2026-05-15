"use client";

import { motion } from "motion/react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/codebase-compiler";
import { useCodebasePageReducedMotion } from "@/app/(app)/_components/codebase-flow/codebase-page-motion";
import { CodebasePageOverview } from "@/app/(app)/_components/codebase-flow/codebase-page-overview";
import { CodebasePageProgressSidebar } from "@/app/(app)/_components/codebase-flow/codebase-page-progress-sidebar";
import { CodebasePageSaveBar } from "@/app/(app)/_components/codebase-flow/codebase-page-save-bar";
import { CodebasePageSectionCard } from "@/app/(app)/_components/codebase-flow/codebase-page-section-card";
import { ProtectedRoutePage } from "@/components/app/protected-route-surface";
import type { CodebasePageSectionStatus } from "@/app/(app)/_hooks/codebase-flow/use-codebase-page-state";
import { codebasePageSections } from "@/lib/codebase-flow/codebase-page-sections";
import type { CodebaseStepInlineFeedback } from "@/lib/codebase-flow/codebase-step-save-feedback";

const SECTION_MOUNT_STAGGER_SECONDS = 0.03;

export function CodebasePageBody({
	currentDraftValues,
	currentFacts,
	currentFieldErrors,
	currentSectionStatuses,
	feedback,
	handleFieldChange,
	handleSaveAndContinue,
	isReviewReady,
	isSaving,
	lastSavedAt,
}: {
	currentDraftValues: Record<string, string>;
	currentFacts: CanonicalProjectFactsDraft;
	currentFieldErrors: Record<string, string>;
	currentSectionStatuses: CodebasePageSectionStatus[];
	feedback: CodebaseStepInlineFeedback | null;
	handleFieldChange: (
		fieldKey: CanonicalProjectFactKey,
		nextValue: string,
	) => void;
	handleSaveAndContinue: () => void | Promise<void>;
	isReviewReady: boolean;
	isSaving: boolean;
	lastSavedAt: number | null;
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
	const prefersReducedMotion = useCodebasePageReducedMotion();

	return (
		<ProtectedRoutePage className="max-w-5xl flex-row gap-8 pb-20 pt-4 lg:gap-10 xl:gap-12">
			<div className="hidden w-48 shrink-0 xl:block">
				<div className="sticky top-20">
					<CodebasePageProgressSidebar
						sectionStatuses={currentSectionStatuses}
					/>
				</div>
			</div>
			<div className="mx-auto flex w-full min-w-0 max-w-2xl flex-1 flex-col xl:mx-0">
				<CodebasePageOverview
					completedSectionCount={completedSectionCount}
					totalSectionCount={currentSectionStatuses.length}
				/>
				{codebasePageSections.map((section, index) => {
					const sectionStatus = sectionStatusById.get(section.id);
					if (!sectionStatus) {
						throw new Error(
							`Missing codebase page section status for ${section.id}`,
						);
					}

					return (
						<motion.div
							key={section.id}
							initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							transition={
								prefersReducedMotion
									? { duration: 0 }
									: {
											duration: 0.18,
											delay: index * SECTION_MOUNT_STAGGER_SECONDS,
											ease: "easeOut",
										}
							}
						>
							<CodebasePageSectionCard
								draftValues={currentDraftValues}
								facts={currentFacts}
								fieldErrors={currentFieldErrors}
								isComplete={sectionStatus.isComplete}
								onChange={handleFieldChange}
								section={section}
								sectionNumber={index + 1}
							/>
						</motion.div>
					);
				})}
				<CodebasePageSaveBar
					feedback={feedback}
					isReviewReady={isReviewReady}
					isSaving={isSaving}
					lastSavedAt={lastSavedAt}
					onSaveAndContinue={handleSaveAndContinue}
				/>
			</div>
		</ProtectedRoutePage>
	);
}
