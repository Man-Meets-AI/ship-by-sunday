import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function BlueprintDemoSectionCard({
	sectionId,
	sectionNumber,
	label,
	description,
	children,
	tone = "interactive",
	hideDescription = false,
}: {
	readonly sectionId: string;
	readonly sectionNumber: number;
	readonly label: string;
	readonly description: string;
	readonly children: ReactNode;
	readonly tone?: "interactive" | "locked";
	readonly hideDescription?: boolean;
}) {
	return (
		<section
			id={`blueprint-demo-${sectionId}`}
			data-testid={`blueprint-demo-section-${sectionId}`}
			className={cn(
				"rounded-xl border bg-background p-5 sm:p-6",
				tone === "interactive"
					? "border-border/70 shadow-sm shadow-foreground/5"
					: "border-dashed border-border/60 bg-muted/15",
			)}
		>
			<div className="flex items-start gap-3">
				<span
					className={cn(
						"mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-medium",
						tone === "interactive"
							? "border border-border/80 text-muted-foreground"
							: "border border-dashed border-border/60 text-muted-foreground/80",
					)}
				>
					{sectionNumber}
				</span>
				<div className="min-w-0 flex-1">
					<h2
						className={cn(
							"text-base font-semibold tracking-tight",
							tone === "locked" && "text-foreground/80",
						)}
					>
						{label}
					</h2>
					{hideDescription ? null : (
						<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
							{description}
						</p>
					)}
				</div>
			</div>
			<div className={cn(hideDescription ? "mt-3" : "mt-5")}>{children}</div>
		</section>
	);
}
