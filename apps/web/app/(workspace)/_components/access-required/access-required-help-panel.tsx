export function AccessRequiredHelpPanel({
	helpLeadCopy,
	helpItems,
}: {
	helpLeadCopy: string;
	helpItems: readonly string[];
}) {
	return (
		<aside className="border-t border-border/60 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
			<div className="grid gap-5">
				<div className="space-y-2">
					<h2 className="text-xl font-semibold tracking-tight text-foreground">
						What to do next
					</h2>
					<p className="text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
						{helpLeadCopy}
					</p>
				</div>
				<ol className="grid gap-4">
					{helpItems.map((item, index) => (
						<li
							key={item}
							className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3"
						>
							<span className="text-sm leading-6 text-muted-foreground">
								{index + 1}.
							</span>
							<span className="min-w-0 text-sm leading-6 text-foreground/85">
								{item}
							</span>
						</li>
					))}
				</ol>
			</div>
		</aside>
	);
}
