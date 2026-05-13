"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { HomePageContent } from "@/app/_content/home-page";

import { CodebaseDemoSavedLocally } from "./codebase-demo-saved-locally";
import { CodebaseDemoSectionCard } from "./codebase-demo-section-card";
import type { HomePageCodebaseDraftFields } from "./home-page-codebase-draft-storage";

const PRODUCT_SUMMARY_SOFT_LIMIT = 120;

type FoundationContent = HomePageContent["productPreviewSection"]["foundation"];

export type CodebaseDemoFoundationFieldKey =
	| "product_name"
	| "product_summary"
	| "primary_user";

const foundationFieldOrder: ReadonlyArray<{
	contentKey: keyof FoundationContent["fields"];
	stateKey: CodebaseDemoFoundationFieldKey;
	inputKind: "input" | "textarea";
}> = [
	{
		contentKey: "productName",
		stateKey: "product_name",
		inputKind: "input",
	},
	{
		contentKey: "productSummary",
		stateKey: "product_summary",
		inputKind: "textarea",
	},
	{
		contentKey: "primaryUser",
		stateKey: "primary_user",
		inputKind: "input",
	},
];

export function CodebaseDemoFoundationCard({
	sectionNumber,
	label,
	description,
	foundation,
	fields,
	lastSavedAt,
	onFoundationFieldChange,
}: {
	readonly sectionNumber: number;
	readonly label: string;
	readonly description: string;
	readonly foundation: FoundationContent;
	readonly fields: HomePageCodebaseDraftFields;
	readonly lastSavedAt: number | null;
	readonly onFoundationFieldChange: (
		fieldKey: CodebaseDemoFoundationFieldKey,
		nextValue: string,
	) => void;
}) {
	return (
		<CodebaseDemoSectionCard
			sectionId="foundation"
			sectionNumber={sectionNumber}
			label={label}
			description={description}
		>
			<div className="space-y-4">
				<p className="text-sm leading-6 text-muted-foreground">
					{foundation.intro}
				</p>
				{foundationFieldOrder.map(({ contentKey, stateKey, inputKind }) => {
					const fieldCopy = foundation.fields[contentKey];
					const fieldId = `codebase-demo-${stateKey}`;
					const helperId = `${fieldId}-help`;
					const value = fields[stateKey];
					const showSummaryBudget =
						stateKey === "product_summary" &&
						value.length > PRODUCT_SUMMARY_SOFT_LIMIT;
					return (
						<div key={stateKey} className="space-y-1.5">
							<label
								htmlFor={fieldId}
								className="text-sm font-medium text-foreground"
							>
								{fieldCopy.label}
							</label>
							{inputKind === "textarea" ? (
								<Textarea
									id={fieldId}
									data-testid={`codebase-demo-input-${stateKey}`}
									value={value}
									placeholder={fieldCopy.placeholder}
									onChange={(event) =>
										onFoundationFieldChange(stateKey, event.target.value)
									}
									aria-describedby={helperId}
									rows={3}
								/>
							) : (
								<Input
									id={fieldId}
									data-testid={`codebase-demo-input-${stateKey}`}
									value={value}
									placeholder={fieldCopy.placeholder}
									onChange={(event) =>
										onFoundationFieldChange(stateKey, event.target.value)
									}
									aria-describedby={helperId}
								/>
							)}
							<p
								id={helperId}
								className="text-xs leading-5 text-muted-foreground"
							>
								{fieldCopy.helperText}
								{showSummaryBudget ? (
									<span
										className="ml-1 text-foreground/70"
										data-testid="codebase-demo-product-summary-budget"
									>
										{value.length} characters - aim for one tight sentence.
									</span>
								) : null}
							</p>
						</div>
					);
				})}
				<CodebaseDemoSavedLocally
					lastSavedAt={lastSavedAt}
					scope="foundation"
				/>
			</div>
		</CodebaseDemoSectionCard>
	);
}
