import { Check, Circle, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type BlueprintDemoSidebarSection = {
	id: string;
	label: string;
	status: "interactive" | "locked";
};

export type BlueprintDemoSidebarProgressStatus =
	| "empty"
	| "started"
	| "complete";

export type BlueprintDemoSidebarProgressEntry = {
	id: string;
	status: BlueprintDemoSidebarProgressStatus;
};

export function BlueprintDemoSidebar({
	sections,
	progress,
}: {
	readonly sections: readonly BlueprintDemoSidebarSection[];
	readonly progress?: readonly BlueprintDemoSidebarProgressEntry[];
}) {
	const progressById = new Map(
		(progress ?? []).map((entry) => [entry.id, entry.status]),
	);

	return (
		<nav
			className="rounded-xl border border-border/60 bg-muted/25 p-4"
			aria-label="Blueprint sections"
		>
			<div className="flex items-center justify-between">
				<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Blueprint sections
				</p>
				<Badge variant="outline">demo</Badge>
			</div>
			<ol className="mt-3 space-y-1.5" data-testid="blueprint-demo-sidebar">
				{sections.map((section, index) => {
					const interactiveProgress =
						section.status === "interactive"
							? (progressById.get(section.id) ?? "empty")
							: null;
					return (
						<li
							key={section.id}
							data-testid={`blueprint-demo-sidebar-section-${section.id}`}
							className={cn(
								"flex items-center gap-3 rounded-md px-2 py-1.5 text-sm",
								section.status === "interactive"
									? "text-foreground"
									: "text-muted-foreground/85",
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
							{interactiveProgress ? (
								<SidebarProgressIndicator
									sectionId={section.id}
									status={interactiveProgress}
								/>
							) : null}
							{section.status === "locked" ? (
								<span
									className="inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-wide text-muted-foreground/80"
									aria-label="Locked"
								>
									<Lock className="size-3" aria-hidden />
									Locked
								</span>
							) : null}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}

function SidebarProgressIndicator({
	sectionId,
	status,
}: {
	readonly sectionId: string;
	readonly status: BlueprintDemoSidebarProgressStatus;
}) {
	if (status === "complete") {
		return (
			<span
				data-testid={`blueprint-demo-sidebar-progress-${sectionId}`}
				data-progress="complete"
				className="inline-flex size-4 items-center justify-center rounded-full bg-foreground text-background"
				aria-label="Section complete"
			>
				<Check className="size-2.5" aria-hidden />
			</span>
		);
	}
	if (status === "started") {
		return (
			<span
				data-testid={`blueprint-demo-sidebar-progress-${sectionId}`}
				data-progress="started"
				className="inline-flex size-3 items-center justify-center rounded-full border-2 border-foreground/70"
				aria-label="Section in progress"
			>
				<span className="size-1.5 rounded-full bg-foreground/70" aria-hidden />
			</span>
		);
	}
	return (
		<span
			data-testid={`blueprint-demo-sidebar-progress-${sectionId}`}
			data-progress="empty"
			className="inline-flex size-3 items-center justify-center text-muted-foreground/60"
			aria-label="Section not started"
		>
			<Circle className="size-3" aria-hidden />
		</span>
	);
}
