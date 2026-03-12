import { WorkbenchHeaderLabel } from "./workbench-header-label";

export function WorkbenchCard({
	label,
	children,
}: {
	label?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-none border border-product-border/70 bg-product-surface-strong/70">
			{label ? (
				<div className="border-b border-product-border/60 px-3 py-1.5">
					<WorkbenchHeaderLabel>{label}</WorkbenchHeaderLabel>
				</div>
			) : null}
			<div className="px-3 py-3">{children}</div>
		</div>
	);
}
