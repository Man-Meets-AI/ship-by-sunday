"use client";

import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { assert } from "@/lib/assert";
import { copyCoursePromptToClipboard } from "@/features/course/lesson/lib/copy-course-prompt";
import { inputWidthClass } from "@/features/course/lesson/workbench/fields/field-styles";

import { BRAND_GUIDE_META_PROMPT } from "./core-flow-sketch-copy";
import { CoreFlowSketchField } from "./core-flow-sketch-fields";

const NEED_GUIDE_OPTION = "I need to create a brand guide first";

type CoreFlowSketchBrandSectionProps = {
	brandPathField: WorkbenchField;
	brandNotesField: WorkbenchField;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
};

export function CoreFlowSketchBrandSection({
	brandPathField,
	brandNotesField,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
}: CoreFlowSketchBrandSectionProps) {
	const pathValue =
		typeof fieldValues[brandPathField.id] === "string"
			? (fieldValues[brandPathField.id] as string)
			: "";
	assert(
		brandPathField.options,
		`Radio group field "${brandPathField.id}" is missing options.`,
	);
	const options = brandPathField.options;
	const showGuide = pathValue === NEED_GUIDE_OPTION;
	const widthClass = inputWidthClass(brandPathField);
	const pathHelp = brandPathField.helpText ? (
		<FieldDescription>{brandPathField.helpText}</FieldDescription>
	) : null;

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">Brand setup path</CardTitle>
				<CardDescription>
					Pick the path that matches you—no wrong answer.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Field className={widthClass}>
					<FieldLabel>{brandPathField.label}</FieldLabel>
					{pathHelp}
					<FieldContent>
						<RadioGroup
							value={pathValue}
							onValueChange={(next) => onFieldChange(brandPathField.id, next)}
						>
							{options.map((option, index) => {
								const optionId = `${brandPathField.id}-${index}`;
								return (
									<div key={option} className="flex items-center gap-2">
										<RadioGroupItem value={option} id={optionId} />
										<Label
											htmlFor={optionId}
											className="cursor-pointer font-normal"
										>
											{option}
										</Label>
									</div>
								);
							})}
						</RadioGroup>
					</FieldContent>
				</Field>
				{showGuide ? (
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-base">Brand guide helper</CardTitle>
							<CardDescription>
								Copy this meta-prompt into ChatGPT to draft a one-page brand
								guide, then paste your notes below if you want.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
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
							<CoreFlowSketchField
								field={brandNotesField}
								value={fieldValues[brandNotesField.id]}
								onChange={(v) => onFieldChange(brandNotesField.id, v)}
								invalid={invalidFieldIds.has(brandNotesField.id)}
							/>
						</CardContent>
					</Card>
				) : null}
			</CardContent>
		</Card>
	);
}
