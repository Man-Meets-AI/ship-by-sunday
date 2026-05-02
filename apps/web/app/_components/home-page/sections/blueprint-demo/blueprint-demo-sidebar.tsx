import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type BlueprintDemoSidebarSection = {
	id: string;
	label: string;
	status: "interactive" | "locked";
};

export function BlueprintDemoSidebar({
	sections,
}: {
	readonly sections: readonly BlueprintDemoSidebarSection[];
}) {
	return (
		<aside className="rounded-xl border border-border/60 bg-muted/25 p-4">
			<div className="flex items-center justify-between">
				<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Blueprint sections
				</p>
				<Badge variant="outline">demo</Badge>
			</div>
			<ol
				className="mt-3 space-y-1.5"
				aria-label="Canonical Blueprint sections"
				data-testid="blueprint-demo-sidebar"
			>
				{sections.map((section, index) => (
					<li
						key={section.id}
						data-testid={`blueprint-demo-sidebar-section-${section.id}`}
						className={cn(
							"flex items-center gap-3 rounded-md px-2 py-1.5 text-sm",
							section.status === "interactive"
								? "text-foreground"
								: "text-muted-foreground",
						)}
					>
						<span
							className={cn(
								"flex size-5 items-center justify-center rounded-full border text-[0.65rem]",
								section.status === "interactive"
									? "border-foreground/40"
									: "border-border/60",
							)}
						>
							{index + 1}
						</span>
						<span className="flex-1 truncate">{section.label}</span>
						{section.status === "locked" ? (
							<span className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
								Locked
							</span>
						) : null}
					</li>
				))}
			</ol>
		</aside>
	);
}
