"use client";

import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@blueprint-compiler";
import { deriveBlueprintFacts } from "@blueprint-compiler";
import { FieldGroup } from "@/components/ui/field";
import { BlueprintStageStepField } from "@/features/blueprint-flow/components/blueprint-stage-step-field";
import type { BlueprintPageSectionId } from "@/features/blueprint-flow/lib/blueprint-page-sections";
import { blueprintPageSections } from "@/features/blueprint-flow/lib/blueprint-page-sections";

type BlueprintPageSectionCardProps = {
	draftValues: Record<string, string>;
	facts: CanonicalProjectFactsDraft;
	fieldErrors: Record<string, string>;
	isComplete: boolean;
	missingCount: number;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	section: (typeof blueprintPageSections)[number];
};

export function BlueprintPageSectionCard({
	draftValues,
	facts,
	fieldErrors,
	isComplete,
	missingCount,
	onChange,
	section,
}: BlueprintPageSectionCardProps) {
	return (
		<section
			id={section.id}
			className="scroll-mt-24 rounded-[24px] border border-border/60 bg-background p-6 shadow-sm"
		>
			<div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/50 pb-4">
				<div className="space-y-1">
					<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
						{section.label}
					</p>
					<h2 className="text-xl font-semibold tracking-tight">
						{section.description}
					</h2>
				</div>
				<SectionStatusPill
					isComplete={isComplete}
					missingCount={missingCount}
					sectionId={section.id}
				/>
			</div>
			<div className="pt-5">
				{section.fieldKeys.length === 0 ? (
					<GeneratedPreviewCard facts={facts} />
				) : (
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
				)}
			</div>
		</section>
	);
}

function SectionStatusPill({
	isComplete,
	missingCount,
	sectionId,
}: {
	isComplete: boolean;
	missingCount: number;
	sectionId: BlueprintPageSectionId;
}) {
	return (
		<div
			data-section-id={sectionId}
			data-section-status={isComplete ? "complete" : "incomplete"}
			className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground"
		>
			{isComplete
				? "Ready"
				: `${missingCount} blocker${missingCount === 1 ? "" : "s"}`}
		</div>
	);
}

function GeneratedPreviewCard({
	facts,
}: {
	facts: CanonicalProjectFactsDraft;
}) {
	const derivedFacts = deriveBlueprintFacts(facts);

	return (
		<div className="space-y-4 rounded-2xl border border-border/60 bg-muted/30 p-5">
			<div className="space-y-1">
				<h3 className="text-base font-semibold">Generated preview</h3>
				<p className="text-sm leading-6 text-muted-foreground">
					This section is compiler-owned. We derive the marketing defaults from
					your blueprint so you do not have to fill another form.
				</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-3">
				<PreviewList
					title="Marketing goals"
					items={derivedFacts.marketing_goals ?? []}
				/>
				<PreviewList
					title="Channels"
					items={derivedFacts.channel_scope ?? []}
				/>
				<PreviewList
					title="Do not say"
					items={derivedFacts.do_not_say_rules ?? []}
				/>
			</div>
		</div>
	);
}

function PreviewList({
	title,
	items,
}: {
	title: string;
	items: readonly string[];
}) {
	return (
		<div className="space-y-2">
			<p className="text-sm font-medium">{title}</p>
			<ul className="space-y-1 text-sm leading-6 text-muted-foreground">
				{items.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</div>
	);
}
