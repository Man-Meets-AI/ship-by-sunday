"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { copyCoursePromptToClipboard } from "@/features/course/lesson/lib/copy-course-prompt";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { BuildProductIterationTextareaField } from "./build-product-iteration-textarea-field";

type Props = {
	strategyField: WorkbenchField | undefined;
	designField: WorkbenchField | undefined;
	strategyVal: string;
	designVal: string;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
	fieldMessage: (fieldId: string) => string | null;
};

export function BuildProductIterationBrandResponseCard({
	strategyField,
	designField,
	strategyVal,
	designVal,
	onFieldChange,
	invalidFieldIds,
	fieldMessage,
}: Props) {
	const copyText = (label: string, text: string) => {
		void copyCoursePromptToClipboard(text, `Copied ${label}.`);
	};

	return (
		<Card>
			<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
				<div className="space-y-1">
					<CardTitle className="text-base">Saved ChatGPT response</CardTitle>
					<CardDescription>
						Paste the two core artifacts from the model: brand strategy and
						brand design instructions.
					</CardDescription>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={() => copyText("brand strategy", strategyVal)}
					>
						Copy strategy
					</Button>
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={() => copyText("brand design", designVal)}
					>
						Copy design
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{strategyField ? (
					<BuildProductIterationTextareaField
						field={strategyField}
						value={strategyVal}
						onChange={(next) => onFieldChange(strategyField.id, next)}
						invalid={invalidFieldIds.has(strategyField.id)}
						message={fieldMessage(strategyField.id)}
					/>
				) : null}
				{designField ? (
					<BuildProductIterationTextareaField
						field={designField}
						value={designVal}
						onChange={(next) => onFieldChange(designField.id, next)}
						invalid={invalidFieldIds.has(designField.id)}
						message={fieldMessage(designField.id)}
					/>
				) : null}
			</CardContent>
		</Card>
	);
}
