export function AccessRequiredHelpPanel({
	helpLeadCopy,
	helpItems,
}: {
	helpLeadCopy: string;
	helpItems: readonly string[];
}) {
	return (
		<aside className="border-t border-border/60 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
			<div className="grid max-w-prose gap-5">
				<div className="space-y-2">
					<h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
						What to do next
					</h2>
					<p className="text-sm leading-6 text-muted-foreground">
						{helpLeadCopy}
					</p>
				</div>
				<ol className="grid gap-3">
					{helpItems.map((item, index) => (
						<li
							key={item}
							className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2.5"
						>
							<span className="text-xs leading-6 text-muted-foreground font-number sm:text-sm">
								{index + 1}.
							</span>
							<span className="min-w-0 text-sm leading-6 text-muted-foreground">
								{item}
							</span>
						</li>
					))}
				</ol>
			</div>
		</aside>
	);
}
