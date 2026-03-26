export function AccessRequiredHelpPanel({
	helpLeadCopy,
	helpItems,
}: {
	helpLeadCopy: string;
	helpItems: readonly string[];
}) {
	return (
		<aside className="rounded-[24px] border border-border/60 bg-background/80 px-5 py-5 sm:px-6">
			<div className="grid gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-8">
				<div className="space-y-3">
					<p className="text-[0.72rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
						What to do next
					</p>
					<div className="space-y-2">
						<h2 className="text-xl font-semibold tracking-tight text-foreground">
							Need help reconnecting access?
						</h2>
						<p className="text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
							{helpLeadCopy}
						</p>
					</div>
				</div>
				<ul className="grid gap-3">
					{helpItems.map((item, index) => (
						<li
							key={item}
							className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/35 px-4 py-3"
						>
							<span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-xs font-semibold text-foreground">
								{index + 1}
							</span>
							<span className="min-w-0 text-sm leading-6 text-foreground/85">
								{item}
							</span>
						</li>
					))}
				</ul>
			</div>
		</aside>
	);
}
