"use client";

import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/codebase-compiler";
import { FieldGroup } from "@/components/ui/field";
import { CodebasePageSectionBadge } from "@/app/(protected)/_components/codebase-flow/codebase-page-section-badge";
import { CodebaseSectionDraftAssistant } from "@/app/(protected)/_components/codebase-flow/codebase-section-draft-assistant";
import { CodebaseStageStepField } from "@/app/(protected)/_components/codebase-flow/codebase-stage-step-field";
import { codebasePageSections } from "@/lib/codebase-flow/codebase-page-sections";
import {
	isCodebaseSectionDraftable,
	type CodebaseSectionDraftValues,
} from "@/lib/codebase-flow/codebase-section-draft-assistant";

type CodebasePageSectionCardProps = {
	draftValues: Record<string, string>;
	facts: CanonicalProjectFactsDraft;
	fieldErrors: Record<string, string>;
	isComplete: boolean;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	section: (typeof codebasePageSections)[number];
	sectionNumber: number;
};

export function CodebasePageSectionCard({
	draftValues,
	facts,
	fieldErrors,
	isComplete,
	onChange,
	section,
	sectionNumber,
}: CodebasePageSectionCardProps) {
	const draftableSectionId = isCodebaseSectionDraftable(section.id)
		? section.id
		: null;
	const applySectionDraftValues = (
		nextDraftValues: CodebaseSectionDraftValues,
	) => {
		for (const [fieldKey, nextValue] of Object.entries(nextDraftValues)) {
			onChange(fieldKey as CanonicalProjectFactKey, nextValue);
		}
	};

	return (
		<section
			id={section.id}
			className="scroll-mt-24 border-t border-border/40 pb-2 pt-8"
			data-testid={`codebase-page-section-${section.id}`}
			data-complete={isComplete ? "true" : "false"}
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex min-w-0 items-start gap-3">
					<CodebasePageSectionBadge
						sectionId={section.id}
						sectionNumber={sectionNumber}
						isComplete={isComplete}
					/>
					<div className="min-w-0">
						<h2 className="text-base font-semibold tracking-tight">
							{section.label}
						</h2>
						<p className="mt-1.5 text-[13.5px] leading-6 text-muted-foreground">
							{section.description}
						</p>
					</div>
				</div>
				{draftableSectionId ? (
					<div className="pl-9 sm:pl-0">
						<CodebaseSectionDraftAssistant
							sectionId={draftableSectionId}
							sectionLabel={section.label}
							facts={facts}
							draftValues={draftValues}
							onApplyDraftValues={applySectionDraftValues}
						/>
					</div>
				) : null}
			</div>
			<div className="mt-6 pl-9">
				<FieldGroup className="gap-6">
					{section.fieldKeys.map((fieldKey) => (
						<CodebaseStageStepField
							key={fieldKey}
							fieldKey={fieldKey}
							facts={facts}
							draftValues={draftValues}
							step={section}
							value={draftValues[fieldKey] ?? ""}
							errorMessage={fieldErrors[fieldKey]}
							onChange={onChange}
						/>
					))}
				</FieldGroup>
			</div>
		</section>
	);
}
