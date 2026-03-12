import { WorkbenchCard } from "../../shared/workbench-card";

export function BuildOverviewCard({
	items,
}: {
	items: string[];
}) {
	if (items.length === 0) {
		return null;
	}

	return (
		<WorkbenchCard label="What I cover in this block">
			<ul className="space-y-2 text-[12px] leading-relaxed text-product-text">
				{items.map((item, index) => (
					<li key={item} className="flex gap-2">
						<span className="font-mono text-product-muted">
							{String(index + 1).padStart(2, "0")}
						</span>
						<span>{item}</span>
					</li>
				))}
			</ul>
		</WorkbenchCard>
	);
}
