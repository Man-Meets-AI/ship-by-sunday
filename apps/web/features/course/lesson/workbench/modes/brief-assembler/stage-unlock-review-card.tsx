"use client";

import type { WorkbenchField } from "@/features/course/lesson/model/contracts";
import {
	ChecklistFieldRows,
	getChecklistFieldItems,
} from "@/features/course/lesson/workbench/fields/checklist-field-rows";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function StageUnlockReviewCard({
	field,
	value,
	onChange,
	invalid,
	invalidMessage,
}: {
	field: WorkbenchField;
	value: unknown;
	onChange: (value: unknown) => void;
	invalid: boolean;
	invalidMessage?: string;
}) {
	const checklistItems = getChecklistFieldItems({ field, value });
	const checkedCount = checklistItems.filter((item) => item.checked).length;

	return (
		<Card className="gap-0 py-0">
			<CardHeader className="border-b border-border/60 pb-4">
				<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Review and lock
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 py-4">
				<div className="space-y-1.5">
					<p className="max-w-2xl text-balance text-sm font-semibold leading-6 text-foreground">
						Confirm the brief reads like a real Design handoff before you unlock
						the next block.
					</p>
					<CardDescription className="max-w-prose text-sm leading-relaxed">
						Check every line only if the assembled brief is specific enough to
						guide reference gathering and screen decisions.
					</CardDescription>
				</div>
				<ChecklistFieldRows
					field={field}
					value={value}
					className="grid gap-2 lg:grid-cols-3"
					rowClassName="rounded-md border border-input"
					separator="none"
					onChange={onChange}
				/>
				<Alert variant={invalid ? "destructive" : "default"}>
					<AlertTitle>
						Ready checks {checkedCount}/{checklistItems.length}
					</AlertTitle>
					<AlertDescription className="max-w-xl">
						{invalidMessage ??
							"Lock Design only after the user, outcome, and scope still read as one small, credible v1."}
					</AlertDescription>
				</Alert>
			</CardContent>
		</Card>
	);
}
