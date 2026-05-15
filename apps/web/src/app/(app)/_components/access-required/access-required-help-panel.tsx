import {
	ProtectedRoutePanel,
	ProtectedRoutePanelBody,
	ProtectedRoutePanelDescription,
	ProtectedRoutePanelHeader,
	ProtectedRoutePanelTitle,
} from "@/components/app/protected-route-surface";

export function AccessRequiredHelpPanel({
	helpLeadCopy,
	helpItems,
}: {
	helpLeadCopy: string;
	helpItems: readonly string[];
}) {
	return (
		<aside>
			<ProtectedRoutePanel>
				<ProtectedRoutePanelHeader>
					<ProtectedRoutePanelTitle>What to do next</ProtectedRoutePanelTitle>
					<ProtectedRoutePanelDescription>
						{helpLeadCopy}
					</ProtectedRoutePanelDescription>
				</ProtectedRoutePanelHeader>
				<ProtectedRoutePanelBody>
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
				</ProtectedRoutePanelBody>
			</ProtectedRoutePanel>
		</aside>
	);
}
