import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BonusRouteStatePanelProps = {
	eyebrow: string;
	title: string;
	description: string;
	actionHref: string;
	actionLabel: string;
	detail?: string;
};

export function BonusRouteStatePanel({
	eyebrow,
	title,
	description,
	actionHref,
	actionLabel,
	detail,
}: BonusRouteStatePanelProps) {
	return (
		<div className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-3xl items-center px-4 py-10">
			<Card className="w-full border-border/60 shadow-sm ring-1 ring-foreground/5">
				<CardHeader className="space-y-3">
					<p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
						{eyebrow}
					</p>
					<CardTitle className="text-3xl font-semibold tracking-tight leading-tight sm:text-4xl">
						{title}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-5">
					<div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
						<p className="max-w-[60ch] text-sm leading-7 text-muted-foreground sm:text-base">
							{description}
						</p>
						<Button asChild size="lg" className="gap-1.5 justify-self-start">
							<Link href={actionHref}>
								<span>{actionLabel}</span>
								<ArrowRight className="size-4" aria-hidden />
							</Link>
						</Button>
					</div>
					{detail ? (
						<p className="text-sm leading-6 text-muted-foreground/80">
							{detail}
						</p>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
}
