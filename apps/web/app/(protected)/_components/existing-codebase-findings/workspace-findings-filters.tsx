import type {
	WorkspaceFindingsFilterOption,
	WorkspaceFindingsFilterState,
} from "@/app/(protected)/_lib/workspace-findings-read-model";

export function WorkspaceFindingsFilters({
	categoryOptions,
	statusOptions,
	value,
	onChange,
}: {
	categoryOptions: WorkspaceFindingsFilterOption[];
	statusOptions: WorkspaceFindingsFilterOption[];
	value: WorkspaceFindingsFilterState;
	onChange: (value: WorkspaceFindingsFilterState) => void;
}) {
	return (
		<div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
			<div className="min-w-0">
				<h2 className="text-sm font-semibold text-foreground">
					Ranked findings
				</h2>
				<p className="mt-1 text-sm leading-6 text-muted-foreground">
					Filter the approved doctor-pass output without changing local reports.
				</p>
			</div>
			<div className="grid gap-2 sm:grid-cols-2">
				<label className="grid gap-1 text-xs font-medium text-muted-foreground">
					Category
					<select
						className="h-8 min-w-44 rounded-lg border border-input bg-background px-2 text-sm font-normal text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
						value={value.category}
						onChange={(event) =>
							onChange({
								...value,
								category: event.target
									.value as WorkspaceFindingsFilterState["category"],
							})
						}
					>
						{categoryOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label} ({option.count})
							</option>
						))}
					</select>
				</label>
				<label className="grid gap-1 text-xs font-medium text-muted-foreground">
					Status
					<select
						className="h-8 min-w-40 rounded-lg border border-input bg-background px-2 text-sm font-normal text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
						value={value.status}
						onChange={(event) =>
							onChange({
								...value,
								status: event.target
									.value as WorkspaceFindingsFilterState["status"],
							})
						}
					>
						{statusOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label} ({option.count})
							</option>
						))}
					</select>
				</label>
			</div>
		</div>
	);
}
