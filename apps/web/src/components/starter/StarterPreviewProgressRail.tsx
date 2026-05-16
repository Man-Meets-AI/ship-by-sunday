import { Check, Circle, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { StarterPreviewSectionRow } from "./StarterPreviewTypes";

type ProgressEntry = {
	id: string;
	status: "empty" | "started" | "complete";
};

export function StarterPreviewProgressRail({
	sections,
	progress,
}: {
	readonly sections: readonly StarterPreviewSectionRow[];
	readonly progress: readonly ProgressEntry[];
}) {
	const progressById = new Map(
		progress.map((entry) => [entry.id, entry.status]),
	);

	return (
		<nav
			className="rounded-lg border border-border/70 bg-background/60 p-3"
			aria-label="Starter preview path"
		>
			<div className="flex items-center justify-between gap-3">
				<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
					Preview path
				</p>
				<Badge variant="outline">Starter</Badge>
			</div>
			<ol className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
				{sections.map((section, index) => {
					const interactiveStatus =
						section.status === "interactive"
							? (progressById.get(section.id) ?? "empty")
							: null;

					return (
						<li
							key={section.id}
							data-testid={`codebase-demo-sidebar-section-${section.id}`}
							className={cn(
								"flex min-w-0 items-center gap-2 rounded-md border px-2.5 py-2 text-sm",
								section.status === "interactive"
									? "border-border/50 bg-muted/15 text-foreground"
									: "border-dashed border-border/50 text-muted-foreground",
							)}
						>
							<span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border/70 font-mono text-[0.65rem] text-muted-foreground">
								{index + 1}
							</span>
							<span className="min-w-0 flex-1 truncate">{section.label}</span>
							{interactiveStatus ? (
								<ProgressDot
									sectionId={section.id}
									status={interactiveStatus}
								/>
							) : (
								<span
									className="inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-wide text-muted-foreground/80"
									aria-label="Locked"
								>
									<Lock className="size-3" aria-hidden />
									Locked
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}

function ProgressDot({
	sectionId,
	status,
}: {
	readonly sectionId: string;
	readonly status: ProgressEntry["status"];
}) {
	if (status === "complete") {
		return (
			<span
				data-testid={`codebase-demo-sidebar-progress-${sectionId}`}
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
				data-testid={`codebase-demo-sidebar-progress-${sectionId}`}
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
			data-testid={`codebase-demo-sidebar-progress-${sectionId}`}
			data-progress="empty"
			className="inline-flex size-3 items-center justify-center text-muted-foreground/60"
			aria-label="Section not started"
		>
			<Circle className="size-3" aria-hidden />
		</span>
	);
}
