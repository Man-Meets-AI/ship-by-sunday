import type { WorkbenchField } from "@/lib/course/manifest";

import { inputBaseClass } from "../../fields/field-styles";
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

const rowInputClass = inputBaseClass.replace("mt-1.5 ", "");

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

	const updateRow = (rowIndex: number, nextValue: string) => {
		onChange(
			rows.map((row, currentRowIndex) =>
				currentRowIndex === rowIndex ? nextValue : row,
			),
		);
	};

	const removeRow = (rowIndex: number) => {
		if (items.length === 0) {
			onChange([]);
			return;
		}

		onChange(
			items.filter((_, currentRowIndex) => currentRowIndex !== rowIndex),
		);
	};

	const addRow = () => {
		onChange(items.length > 0 ? [...items, ""] : [""]);
	};

	return (
		<WorkbenchCard label={`${stepNumber}. ${field.label}`}>
			<div className="space-y-3">
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div className="max-w-2xl space-y-1">
						<p className="text-sm leading-relaxed text-product-text">
							{description}
						</p>
						<p className="text-[11px] leading-relaxed text-product-muted">
							{orderHint}
						</p>
					</div>
					<span
						className={`inline-flex items-center border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
							healthy
								? "border-product-accent/40 bg-product-accent/[0.08] text-product-accent"
								: "border-product-border bg-product-surface text-product-text"
						}`}
					>
						{countLabel}
					</span>
				</div>

				<ol className="space-y-2">
					{rows.map((item, index) => (
						<li key={`${field.id}-${index}`} className="flex items-start gap-2">
							<span className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-product-border bg-product-surface font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
								{String(index + 1).padStart(2, "0")}
							</span>
							<div className="flex-1">
								<input
									type="text"
									value={item}
									onChange={(event) => updateRow(index, event.target.value)}
									placeholder={rowPlaceholder}
									className={rowInputClass}
								/>
							</div>
							<button
								type="button"
								onClick={() => removeRow(index)}
								className="inline-flex h-9 shrink-0 items-center border border-product-border bg-product-surface px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-product-text transition-colors hover:border-product-accent hover:text-product-accent"
								aria-label={`Remove ${field.label} item ${index + 1}`}
							>
								Remove
							</button>
						</li>
					))}
				</ol>

				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={addRow}
						className="inline-flex items-center border border-product-border bg-product-surface px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-text transition-colors hover:border-product-accent hover:text-product-accent"
					>
						{addButtonLabel}
					</button>
					<p className="text-[11px] leading-relaxed text-product-muted">
						{supportText}
					</p>
				</div>

				{invalidMessage ? (
					<p className="text-[11px] font-medium leading-snug text-[#a83232]">
						{invalidMessage}
					</p>
				) : null}
			</div>
		</WorkbenchCard>
	);
}
