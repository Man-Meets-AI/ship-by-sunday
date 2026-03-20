"use client";

import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FieldControl } from "@/features/course/lesson/workbench/fields/field-control";
import { copyCoursePromptToClipboard } from "@/features/course/lesson/lib/copy-course-prompt";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { BRAND_GUIDE_META_PROMPT } from "./core-flow-sketch-copy";

const NEED_GUIDE_OPTION = "I need to create a brand guide first";

type CoreFlowSketchBrandSectionProps = {
	brandPathField: WorkbenchField;
	brandNotesField: WorkbenchField;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
	pinnedArtifacts: PinnedArtifact[];
};

export function CoreFlowSketchBrandSection({
	brandPathField,
	brandNotesField,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
	pinnedArtifacts,
}: CoreFlowSketchBrandSectionProps) {
	const pathValue =
		typeof fieldValues[brandPathField.id] === "string"
			? (fieldValues[brandPathField.id] as string)
			: "";
	const options = brandPathField.options ?? [];
	const showGuide = pathValue === NEED_GUIDE_OPTION;

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">Brand setup path</CardTitle>
				<CardDescription>
					Pick the path that matches you—no wrong answer.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<p className="text-sm font-medium">{brandPathField.label}</p>
					<ToggleGroup
						type="single"
						value={pathValue || undefined}
						onValueChange={(next) => {
							if (next) {
								onFieldChange(brandPathField.id, next);
							}
						}}
						className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap"
					>
						{options.map((option) => (
							<ToggleGroupItem
								key={option}
								value={option}
								className="h-auto flex-1 whitespace-normal px-3 py-2 text-left text-sm"
							>
								{option}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>
				{showGuide ? (
					<div className="space-y-3 rounded-md border border-border bg-muted/20 p-3">
						<p className="text-sm text-muted-foreground">
							Copy this meta-prompt into ChatGPT to draft a one-page brand
							guide, then paste your notes below if you want.
						</p>
						<Button
							type="button"
							size="sm"
							onClick={() => {
								void copyCoursePromptToClipboard(
									BRAND_GUIDE_META_PROMPT,
									"Copied brand guide prompt.",
								);
							}}
						>
							Copy brand guide prompt
						</Button>
						<FieldControl
							field={brandNotesField}
							value={fieldValues[brandNotesField.id]}
							onChange={(value) => onFieldChange(brandNotesField.id, value)}
							pinnedArtifacts={pinnedArtifacts}
							invalid={invalidFieldIds.has(brandNotesField.id)}
						/>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
