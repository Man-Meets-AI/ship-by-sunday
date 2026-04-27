"use client";

import { useState } from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
	REPO_MAP_ENTRIES,
	REPO_ROUTE_EXAMPLES,
	type RepoMapBadge,
} from "@/lib/course/lesson/workbench/modes/repo-map-constants";

function mapBadgeVariant(badge: RepoMapBadge) {
	if (badge === "required") {
		return "default" as const;
	}
	if (badge === "nice") {
		return "secondary" as const;
	}
	return "outline" as const;
}

function mapBadgeLabel(badge: RepoMapBadge) {
	if (badge === "required") {
		return "Required";
	}
	if (badge === "nice") {
		return "Nice to know";
	}
	return "Advanced";
}

export function RepoMapProjectMapTab() {
	const [activeId, setActiveId] = useState("app");

	return (
		<div className="space-y-4">
			<Alert>
				<AlertTitle>Secrets stay private</AlertTitle>
				<AlertDescription className="text-sm leading-relaxed">
					Anything in <span className="font-mono text-foreground">.env</span> or{" "}
					<span className="font-mono text-foreground">.env.local</span> is a
					secret. Never share screenshots, paste values into chat, or commit
					them to GitHub.
				</AlertDescription>
			</Alert>
			<div className="grid gap-4 min-[480px]:grid-cols-[minmax(0,140px)_minmax(0,1fr)]">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">Explorer</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<ScrollArea className="h-[min(280px,40vh)]">
							<div className="flex flex-col gap-1 pr-3">
								{REPO_MAP_ENTRIES.map((entry) => (
									<Button
										key={entry.id}
										type="button"
										variant={activeId === entry.id ? "secondary" : "ghost"}
										size="sm"
										className="h-auto w-full justify-start py-1.5 font-mono text-xs"
										onMouseEnter={() => setActiveId(entry.id)}
										onFocus={() => setActiveId(entry.id)}
									>
										{entry.path}
									</Button>
								))}
							</div>
						</ScrollArea>
					</CardContent>
				</Card>
				<div className="min-w-0 space-y-3">
					<p className="text-xs text-muted-foreground">
						<code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
							app/api
						</code>{" "}
						holds route handlers that connect to services (for example Stripe
						webhooks or other server-only endpoints)—not generic “backend
						theory.”
					</p>
					{REPO_MAP_ENTRIES.map((entry) => (
						<Card key={entry.id} onMouseEnter={() => setActiveId(entry.id)}>
							<CardHeader>
								<div className="flex flex-wrap items-center gap-2">
									<CardTitle className="font-mono text-sm">
										{entry.path}
									</CardTitle>
									<Badge variant={mapBadgeVariant(entry.badge)}>
										{mapBadgeLabel(entry.badge)}
									</Badge>
								</div>
								<CardDescription className="text-sm leading-relaxed">
									{entry.summary}
								</CardDescription>
							</CardHeader>
						</Card>
					))}
				</div>
			</div>
			<Separator />
			<Card>
				<CardContent className="pt-6">
					<Accordion type="single" collapsible className="w-full">
						<AccordionItem value="routes">
							<AccordionTrigger className="text-sm font-medium">
								Route examples under <span className="font-mono">app/</span>
							</AccordionTrigger>
							<AccordionContent>
								<ul className="space-y-2 text-sm text-muted-foreground">
									{REPO_ROUTE_EXAMPLES.map((row) => (
										<li key={row.path}>
											<span className="font-mono text-foreground">
												{row.path}
											</span>
											<span className="mx-2 text-border">—</span>
											{row.note}
										</li>
									))}
								</ul>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</CardContent>
			</Card>
		</div>
	);
}
