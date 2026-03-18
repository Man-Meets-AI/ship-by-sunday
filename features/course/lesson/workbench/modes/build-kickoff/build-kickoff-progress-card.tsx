import { WorkbenchCard } from "../../shared/workbench-card";

type BuildKickoffProgressCardProps = {
	items: Array<{
		id: string;
		label: string;
		complete: boolean;
	}>;
};

export function BuildKickoffProgressCard({
	items,
}: BuildKickoffProgressCardProps) {
	return (
		<WorkbenchCard label="Progress checklist">
			<p className="text-xs leading-relaxed text-product-muted">
				Make 3 decisions. Then generate a build-ready prompt.
			</p>
			<ul className="mt-3 space-y-1.5">
				{items.map((item) => (
					<li
						key={item.id}
						className="flex items-center justify-between gap-3 border border-product-border/60 bg-product-surface px-3 py-2"
					>
						<p className="text-[12px] leading-relaxed text-product-text">
							{item.label}
						</p>
						<span
							className={`font-mono text-[9px] uppercase tracking-[0.18em] ${
								item.complete ? "text-product-accent" : "text-product-muted"
							}`}
						>
							{item.complete ? "Done" : "Pending"}
						</span>
					</li>
				))}
			</ul>
		</WorkbenchCard>
	);
}
