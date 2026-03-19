import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkbenchCard } from "../../shared/workbench-card";

type ScopeListEditorCardProps = {
	field: WorkbenchField;
	items: string[];
	stepNumber: number;
	description: string;
	orderHint: string;
	addButtonLabel: string;
	rowPlaceholder: string;
	countLabel: string;
	supportText: string;
	healthy: boolean;
	invalidMessage?: string;
	onChange: (value: string[]) => void;
};

export function ScopeListEditorCard({
	field,
	items,
	stepNumber,
	description,
	orderHint,
	addButtonLabel,
	rowPlaceholder,
	countLabel,
	supportText,
	healthy,
	invalidMessage,
	onChange,
}: ScopeListEditorCardProps) {
	const rows = items.length > 0 ? items : [""];
	const rowKeyCounts = new Map<string, number>();

	const updateRow = (rowIndex: number, nextValue: string) => {
		onChange(
			rows.map((row, currentRowIndex) =>
				currentRowIndex === rowIndex ? nextValue : row,
			),
		);
	};

	const removeRow = (rowIndex: number) => {
		onChange(
			items.filter((_, currentRowIndex) => currentRowIndex !== rowIndex),
		);
	};

	const addRow = () => {
		onChange([...items, ""]);
	};

	return (
		<WorkbenchCard label={`${stepNumber}. ${field.label}`}>
			<div className="space-y-3">
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div className="max-w-2xl space-y-1">
						<p className="text-sm leading-relaxed text-foreground">
							{description}
						</p>
						<p className="text-[11px] leading-relaxed text-muted-foreground">
							{orderHint}
						</p>
					</div>
					<span
						className={`inline-flex items-center border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
							healthy
								? "border-primary/30 bg-primary/5 text-primary"
								: "border-border bg-background text-foreground"
						}`}
					>
						{countLabel}
					</span>
				</div>

				<ol className="space-y-2">
					{rows.map((item, index) => {
						const keyBase = item.trim().length > 0 ? item : "blank";
						const occurrence = rowKeyCounts.get(keyBase) ?? 0;
						rowKeyCounts.set(keyBase, occurrence + 1);

						return (
							<li
								key={`${field.id}-${keyBase}-${occurrence}`}
								className="flex items-start gap-2"
							>
								<span className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-background font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
									{String(index + 1).padStart(2, "0")}
								</span>
								<div className="flex-1">
									<Input
										type="text"
										value={item}
										onChange={(event) => updateRow(index, event.target.value)}
										placeholder={rowPlaceholder}
										className="py-2"
									/>
								</div>
								<Button
									type="button"
									onClick={() => removeRow(index)}
									variant="outline"
									size="sm"
									aria-label={`Remove ${field.label} item ${index + 1}`}
								>
									Remove
								</Button>
							</li>
						);
					})}
				</ol>

				<div className="flex flex-wrap items-center gap-2">
					<Button type="button" onClick={addRow} variant="outline" size="sm">
						{addButtonLabel}
					</Button>
					<p className="text-[11px] leading-relaxed text-muted-foreground">
						{supportText}
					</p>
				</div>

				{invalidMessage ? (
					<p className="text-[11px] font-medium leading-snug text-destructive">
						{invalidMessage}
					</p>
				) : null}
			</div>
		</WorkbenchCard>
	);
}
