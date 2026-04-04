"use client";

import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/blueprint-compiler";
import { FieldGroup } from "@/components/ui/field";
import { BlueprintStageStepField } from "@/features/blueprint-flow/components/blueprint-stage-step-field";
import { blueprintPageSections } from "@/features/blueprint-flow/lib/blueprint-page-sections";

type BlueprintPageSectionCardProps = {
	draftValues: Record<string, string>;
	facts: CanonicalProjectFactsDraft;
	fieldErrors: Record<string, string>;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	section: (typeof blueprintPageSections)[number];
};

export function BlueprintPageSectionCard({
	draftValues,
	facts,
	fieldErrors,
	onChange,
	section,
}: BlueprintPageSectionCardProps) {
	return (
		<section
			id={section.id}
			className="scroll-mt-24 border-t border-border/40 pt-8 pb-2"
		>
			<h2 className="text-lg font-semibold tracking-tight">
				{section.description}
			</h2>
			<div className="mt-5">
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
