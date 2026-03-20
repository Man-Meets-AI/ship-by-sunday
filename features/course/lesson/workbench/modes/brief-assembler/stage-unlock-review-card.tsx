import type { WorkbenchField } from "@/features/course/lesson/model/contracts";
import { ChecklistOptionRow } from "@/features/course/lesson/workbench/fields/checklist-option-row";
import { normalizeChecklistValue } from "@/features/course/lesson/workbench/fields/value-codecs";

import { CardDescription } from "@/components/ui/card";

import { WorkbenchCard } from "../../shared/workbench-card";

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
	const checklistItems = normalizeChecklistValue(value, field.options ?? []);
	const checkedCount = checklistItems.filter((item) => item.checked).length;

	return (
		<WorkbenchCard label="Review and lock">
			<div className="space-y-4">
				<div className="space-y-1.5">
					<p
						className="max-w-2xl text-sm font-semibold leading-6 text-foreground"
						style={{ textWrap: "balance" }}
					>
						Confirm the brief reads like a real Design handoff before you unlock
						the next block.
					</p>
					<CardDescription className="max-w-prose text-sm leading-relaxed">
						Check every line only if the assembled brief is specific enough to
						guide reference gathering and screen decisions.
					</CardDescription>
				</div>
				<div className="grid gap-2 lg:grid-cols-3">
					{checklistItems.map((item, index) => (
						<ChecklistOptionRow
							key={`${field.id}-${index}`}
							label={item.label}
							checked={item.checked}
							onChange={(checked) => {
								const nextItems = checklistItems.map((current, currentIndex) =>
									currentIndex === index ? { ...current, checked } : current,
								);
								onChange(nextItems);
							}}
						/>
					))}
				</div>
				<div
					className={`flex flex-wrap items-start justify-between gap-3 rounded-lg border px-3 py-3 text-sm leading-6 ${
						invalid
							? "border-destructive/30 bg-destructive/5"
							: "border-border bg-muted/20"
					}`}
				>
					<p
						className={`font-medium ${
							invalid ? "text-destructive" : "text-foreground"
						}`}
					>
						Ready checks {checkedCount}/{checklistItems.length}
					</p>
					<p className="max-w-xl text-muted-foreground">
						{invalidMessage ??
							"Lock Design only after the user, outcome, and scope still read as one small, credible v1."}
					</p>
				</div>
			</div>
		</WorkbenchCard>
	);
}
