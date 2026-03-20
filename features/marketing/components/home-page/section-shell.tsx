import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Primary section title—sans, sentence case; avoids stacked condensed display caps. */
export function SectionTitle({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<h2
			className={cn(
				"text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.35rem] lg:leading-snug",
				className,
			)}
		>
			{children}
		</h2>
	);
}

export function SectionLead({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<p
			className={cn(
				"max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg",
				className,
			)}
		>
			{children}
		</p>
	);
}

/** Subheads, column titles, and in-band groups—stays body type scale. */
export function SectionGroupHeading({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<h3
			className={cn(
				"text-xl font-semibold tracking-tight text-foreground sm:text-2xl",
				className,
			)}
		>
			{children}
		</h3>
	);
}

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
				"grid grid-cols-1 gap-6 py-8 sm:gap-8 sm:py-10",
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
			className="w-fit border-border/50 bg-transparent px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground"
		>
			{children}
		</Badge>
	);
}
