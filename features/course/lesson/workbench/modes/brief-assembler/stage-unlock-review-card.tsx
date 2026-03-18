import type { WorkbenchField } from "@/features/course/lesson/model/contracts";
import { CheckboxRow } from "@/features/course/lesson/workbench/fields/checkbox-row";
import { normalizeChecklistValue } from "@/features/course/lesson/workbench/fields/value-codecs";

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
						className="max-w-2xl text-sm font-medium leading-6 text-product-text"
						style={{ textWrap: "balance" }}
					>
						Confirm the brief reads like a real Design handoff before you unlock
						the next block.
					</p>
					<p className="text-[12px] leading-6 text-product-muted">
						Check every line only if the assembled brief is specific enough to
						guide reference gathering and screen decisions.
					</p>
				</div>
				<div className="grid gap-2 lg:grid-cols-3">
					{checklistItems.map((item, index) => (
						<CheckboxRow
							key={item.label}
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
					className={`flex flex-wrap items-center justify-between gap-2 rounded-none border px-3 py-2 text-[11px] leading-5 ${
						invalid
							? "border-danger/45 bg-danger/[0.08] text-danger-soft"
							: "border-product-border/60 bg-product-surface/72 text-product-muted"
					}`}
				>
					<p className="font-mono uppercase tracking-[0.16em]">
						Ready checks {checkedCount}/{checklistItems.length}
					</p>
					<p className="max-w-xl text-right">
						{invalidMessage ??
							"Lock Design only after the user, outcome, and scope still read as one small, credible v1."}
					</p>
				</div>
			</div>
		</WorkbenchCard>
	);
}
