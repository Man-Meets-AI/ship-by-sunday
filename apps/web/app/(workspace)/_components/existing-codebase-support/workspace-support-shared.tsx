import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function WorkspaceSupportMetric({
	label,
	value,
}: {
	label: string;
	value: number;
}) {
	return (
		<div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
			<span className="text-muted-foreground">{label}</span>
			<span className="min-w-0 truncate text-right font-mono text-xs font-medium text-foreground">
				{value}
			</span>
		</div>
	);
}

export function WorkspaceSupportDenseText({
	label,
	value,
	mono,
}: {
	label: string;
	value: string;
	mono?: boolean;
}) {
	return (
		<div className="grid min-w-0 grid-cols-[6rem_minmax(0,1fr)] gap-2 lg:block">
			<span className="text-xs font-medium text-muted-foreground lg:hidden">
				{label}
			</span>
			<span
				className={
					mono
						? "break-words font-mono text-xs text-foreground"
						: "break-words text-sm text-foreground"
				}
			>
				{value}
			</span>
		</div>
	);
}

export function WorkspaceSupportFact({
	label,
	value,
	mono,
}: {
	label: string;
	value: string;
	mono?: boolean;
}) {
	return (
		<div className="min-w-0">
			<p className="text-xs font-medium text-muted-foreground">{label}</p>
			<p
				className={
					mono
						? "mt-1 break-words font-mono text-xs text-foreground"
						: "mt-1 break-words text-sm text-foreground"
				}
			>
				{value}
			</p>
		</div>
	);
}

export function WorkspaceSupportEmptyState({
	title,
	description,
	href,
	action,
}: {
	title: string;
	description: ReactNode;
	href: string;
	action: string;
}) {
	return (
		<section className="rounded-xl border border-border/60 bg-background p-5">
			<h2 className="text-base font-semibold text-foreground">{title}</h2>
			<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
				{description}
			</p>
			<Button asChild className="mt-4" size="sm">
				<Link href={href}>{action}</Link>
			</Button>
		</section>
	);
}
