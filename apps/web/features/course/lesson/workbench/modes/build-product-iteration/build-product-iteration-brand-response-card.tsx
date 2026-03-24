"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { copyCoursePromptToClipboard } from "@/features/course/lesson/lib/copy-course-prompt";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

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
					<div className="space-y-2">
						<Label htmlFor={strategyField.id}>{strategyField.label}</Label>
						<Textarea
							id={strategyField.id}
							rows={strategyField.rows ?? 6}
							placeholder={strategyField.placeholder}
							value={strategyVal}
							onChange={(event) =>
								onFieldChange(strategyField.id, event.target.value)
							}
							className={
								invalidFieldIds.has(strategyField.id)
									? "border-destructive"
									: undefined
							}
						/>
						{fieldMessage(strategyField.id) ? (
							<p className="text-sm text-destructive">
								{fieldMessage(strategyField.id)}
							</p>
						) : null}
					</div>
				) : null}
				{designField ? (
					<div className="space-y-2">
						<Label htmlFor={designField.id}>{designField.label}</Label>
						<Textarea
							id={designField.id}
							rows={designField.rows ?? 6}
							placeholder={designField.placeholder}
							value={designVal}
							onChange={(event) =>
								onFieldChange(designField.id, event.target.value)
							}
							className={
								invalidFieldIds.has(designField.id)
									? "border-destructive"
									: undefined
							}
						/>
						{fieldMessage(designField.id) ? (
							<p className="text-sm text-destructive">
								{fieldMessage(designField.id)}
							</p>
						) : null}
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
