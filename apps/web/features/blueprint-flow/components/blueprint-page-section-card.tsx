"use client";

import { CheckCircle2Icon } from "lucide-react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/blueprint-compiler";
import { FieldGroup } from "@/components/ui/field";
import { BlueprintStageStepField } from "@/features/blueprint-flow/components/blueprint-stage-step-field";
import { blueprintPageSections } from "@/features/blueprint-flow/lib/blueprint-page-sections";
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
	return (
		<section
			id={section.id}
			className="scroll-mt-24 border-t border-border/40 pb-2 pt-8"
		>
			<div className="flex items-start gap-3">
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
