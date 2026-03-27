import Link from "next/link";
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
			<Card className="w-full border-border/70 shadow-sm">
				<CardHeader className="space-y-3">
					<p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
					<CardTitle className="text-2xl leading-tight sm:text-3xl">
						{title}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-5">
					<p className="text-sm leading-6 text-muted-foreground sm:text-base">
						{description}
					</p>
					{detail ? (
						<p className="text-sm leading-6 text-muted-foreground">{detail}</p>
					) : null}
					<Button asChild>
						<Link href={actionHref}>{actionLabel}</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
