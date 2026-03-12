export function WorkbenchCard({
	title,
	children,
	eyebrow,
}: {
	title: string;
	children: React.ReactNode;
	eyebrow?: string;
}) {
	return (
		<div className="rounded-none border border-product-border/70 bg-product-surface-strong/70">
			<div className="flex items-baseline gap-2 border-b border-product-border/60 px-3 py-1.5">
				{eyebrow ? (
					<span className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
						{eyebrow}
					</span>
				) : null}
				<span className="font-display text-sm uppercase tracking-[0.04em] text-product-text">
					{title}
				</span>
			</div>
			<div className="px-3 py-3">{children}</div>
		</div>
	);
}
