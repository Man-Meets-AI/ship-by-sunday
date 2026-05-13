"use client";

import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type CodebasePageSidebarSectionProgress =
	| "empty"
	| "started"
	| "complete";

export function CodebasePageProgressSidebarItem({
	sectionId,
	sectionLabel,
	sectionNumber,
	progress,
	isActive,
}: {
	sectionId: string;
	sectionLabel: string;
	sectionNumber: number;
	progress: CodebasePageSidebarSectionProgress;
	isActive: boolean;
}) {
	const isComplete = progress === "complete";

	return (
		<Link
			href={`#${sectionId}`}
			data-active={isActive ? "true" : undefined}
			aria-current={isActive ? "location" : undefined}
			className={cn(
				"flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors hover:bg-muted/60 motion-reduce:transition-none",
				isComplete
					? "text-foreground"
					: "text-muted-foreground hover:text-foreground",
				isActive && "bg-muted/60 text-foreground",
			)}
		>
			<span
				className={cn(
					"flex size-5 shrink-0 items-center justify-center rounded-md text-[11px] font-medium",
					isComplete
						? "bg-foreground text-background"
						: "border border-border/80 text-muted-foreground",
					isActive && !isComplete && "border-foreground/70 text-foreground",
				)}
			>
				{isComplete ? <CheckCircle2Icon className="size-3" /> : sectionNumber}
			</span>
			<span className={cn("flex-1 truncate", isComplete && "font-medium")}>
				{sectionLabel}
			</span>
			<SidebarProgressIndicator sectionId={sectionId} progress={progress} />
		</Link>
	);
}

function SidebarProgressIndicator({
	sectionId,
	progress,
}: {
	sectionId: string;
	progress: CodebasePageSidebarSectionProgress;
}) {
	if (progress === "complete") {
		return (
			<span
				data-testid={`codebase-page-progress-${sectionId}`}
				data-progress="complete"
				className="sr-only"
			>
				Complete
			</span>
		);
	}
	if (progress === "started") {
		return (
			<span
				data-testid={`codebase-page-progress-${sectionId}`}
				data-progress="started"
				className="inline-flex size-2.5 items-center justify-center rounded-full border-2 border-foreground/60"
				aria-label="Section in progress"
			>
				<span className="size-1 rounded-full bg-foreground/60" aria-hidden />
			</span>
		);
	}
	return (
		<span
			data-testid={`codebase-page-progress-${sectionId}`}
			data-progress="empty"
			className="inline-flex size-3 items-center justify-center text-muted-foreground/50"
			aria-label="Section not started"
		>
			<CircleIcon className="size-2.5" aria-hidden />
		</span>
	);
}
