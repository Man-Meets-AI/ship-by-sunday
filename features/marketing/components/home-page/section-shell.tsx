import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Flat section: spacing and optional top rule—no card ring. */
export function SectionStack({
	children,
	className = "",
	id,
	withTopRule = false,
}: {
	children: ReactNode;
	className?: string;
	id?: string;
	withTopRule?: boolean;
}) {
	return (
		<section
			id={id}
			className={cn(
				"grid grid-cols-1 gap-6 py-10 sm:gap-8 sm:py-12",
				withTopRule && "border-t border-border/30",
				className,
			)}
		>
			{children}
		</section>
	);
}

/** Emphasis surface (pricing CTA, rare callouts)—card + ring. */
export function SectionFrame({
	children,
	className = "",
	id,
}: {
	children: ReactNode;
	className?: string;
	id?: string;
}) {
	return (
		<Card id={id} className={cn("gap-6 p-6 sm:gap-8 sm:p-8", className)}>
			{children}
		</Card>
	);
}

export function SectionLabel({ children }: { children: ReactNode }) {
	return (
		<Badge
			variant="outline"
			className="w-fit text-xs font-medium uppercase tracking-wide text-muted-foreground"
		>
			{children}
		</Badge>
	);
}
