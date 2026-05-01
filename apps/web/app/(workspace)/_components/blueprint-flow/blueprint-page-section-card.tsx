"use client";

import { CheckCircle2Icon } from "lucide-react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/blueprint-compiler";
import { FieldGroup } from "@/components/ui/field";
import { BlueprintSectionDraftAssistant } from "@/app/(workspace)/_components/blueprint-flow/blueprint-section-draft-assistant";
import { BlueprintStageStepField } from "@/app/(workspace)/_components/blueprint-flow/blueprint-stage-step-field";
import { blueprintPageSections } from "@/lib/blueprint-flow/blueprint-page-sections";
import {
	isBlueprintSectionDraftable,
	type BlueprintSectionDraftValues,
} from "@/lib/blueprint-flow/blueprint-section-draft-assistant";
import { cn } from "@/lib/utils";

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
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex min-w-0 items-start gap-3">
					<span
						className={cn(
							"mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-medium",
							isComplete
								? "bg-foreground text-background"
								: "border border-border/80 text-muted-foreground",
						)}
					>
						{isComplete ? (
							<CheckCircle2Icon className="size-3.5" />
						) : (
							sectionNumber
						)}
					</span>
					<div className="min-w-0">
						<h2 className="text-base font-semibold tracking-tight">
							{section.label}
						</h2>
						<p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
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
