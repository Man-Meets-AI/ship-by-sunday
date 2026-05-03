"use client";

import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/blueprint-compiler";
import { FieldGroup } from "@/components/ui/field";
import { BlueprintPageSectionBadge } from "@/app/(workspace)/_components/blueprint-flow/blueprint-page-section-badge";
import { BlueprintSectionDraftAssistant } from "@/app/(workspace)/_components/blueprint-flow/blueprint-section-draft-assistant";
import { BlueprintStageStepField } from "@/app/(workspace)/_components/blueprint-flow/blueprint-stage-step-field";
import { blueprintPageSections } from "@/lib/blueprint-flow/blueprint-page-sections";
import {
	isBlueprintSectionDraftable,
	type BlueprintSectionDraftValues,
} from "@/lib/blueprint-flow/blueprint-section-draft-assistant";

type BlueprintPageSectionCardProps = {
	draftValues: Record<string, string>;
	facts: CanonicalProjectFactsDraft;
	fieldErrors: Record<string, string>;
	isComplete: boolean;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	section: (typeof blueprintPageSections)[number];
	sectionNumber: number;
};

export function BlueprintPageSectionCard({
	draftValues,
	facts,
	fieldErrors,
	isComplete,
	onChange,
	section,
	sectionNumber,
}: BlueprintPageSectionCardProps) {
	const draftableSectionId = isBlueprintSectionDraftable(section.id)
		? section.id
		: null;
	const applySectionDraftValues = (
		nextDraftValues: BlueprintSectionDraftValues,
	) => {
		for (const [fieldKey, nextValue] of Object.entries(nextDraftValues)) {
			onChange(fieldKey as CanonicalProjectFactKey, nextValue);
		}
	};

	return (
		<section
			id={section.id}
			className="scroll-mt-24 border-t border-border/40 pb-2 pt-8"
			data-testid={`blueprint-page-section-${section.id}`}
			data-complete={isComplete ? "true" : "false"}
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex min-w-0 items-start gap-3">
					<BlueprintPageSectionBadge
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
						<BlueprintSectionDraftAssistant
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
						<BlueprintStageStepField
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
