"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	buildBlueprintStageRailItems,
	type BlueprintStageRailItem,
	type BlueprintStageRailStepItem,
} from "@/features/blueprint-flow/lib/blueprint-stage-rail-model";

function handleControlledNavigation(
	event: { defaultPrevented: boolean; preventDefault: () => void },
	href: string,
	onNavigate?: (href: string) => void,
) {
	if (event.defaultPrevented || !onNavigate) {
		return;
	}

	event.preventDefault();
	onNavigate(href);
}

function BlueprintStageRailStepLink({
	item,
	onLinkNavigate,
	onNavigate,
}: {
	item: BlueprintStageRailStepItem;
	onLinkNavigate?: (
		event: { preventDefault: () => void },
		href: string,
	) => void;
	onNavigate?: (href: string) => void;
}) {
	if (item.state === "locked") {
		return (
			<span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground/35">
				<span className="flex size-5 items-center justify-center rounded-md border border-border/50 bg-muted/30 text-[0.6rem] text-muted-foreground/35">
					{item.stepNumber}
				</span>
				{item.label}
			</span>
		);
	}

	return (
		<Link
			href={item.href}
			aria-current={item.state === "active" ? "page" : undefined}
			data-active={item.state === "active" ? "true" : undefined}
			onNavigate={(event) => onLinkNavigate?.(event, item.href)}
			onClick={(event) =>
				handleControlledNavigation(event, item.href, onNavigate)
			}
			className={cn(
				"flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
				item.state === "active" && "bg-muted/70 font-medium text-foreground",
				item.state === "complete" && "text-foreground/85 hover:bg-muted/60",
				item.state === "open" &&
					"text-muted-foreground hover:bg-muted/60 hover:text-foreground",
			)}
		>
			<span
				className={cn(
					"flex size-5 items-center justify-center rounded-md border text-[0.6rem] transition-colors",
					item.state === "active"
						? "border-foreground bg-foreground text-background shadow-sm"
						: item.state === "complete"
							? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600/80"
							: "border-border bg-muted/30 text-muted-foreground/60",
				)}
			>
				{item.state === "complete" ? (
					<Check className="size-3" strokeWidth={3} aria-label="Completed" />
				) : (
					item.stepNumber
				)}
			</span>
			<span className={cn(item.state === "active" && "font-medium")}>
				{item.label}
			</span>
		</Link>
	);
}

function BlueprintStageRailStage({
	item,
	onLinkNavigate,
	onNavigate,
}: {
	item: BlueprintStageRailItem;
	onLinkNavigate?: (
		event: { preventDefault: () => void },
		href: string,
	) => void;
	onNavigate?: (href: string) => void;
}) {
	const stageLinkClassName = cn(
		"inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition-colors",
		item.state === "active" && "bg-muted/70 text-foreground",
		item.state === "complete" && "text-foreground/85 hover:bg-muted/60",
		item.state === "available" &&
			"text-muted-foreground hover:bg-muted/60 hover:text-foreground",
		item.state === "locked" && "cursor-not-allowed text-muted-foreground/35",
	);

	return (
		<section className="space-y-2">
			{item.state === "locked" ? (
				<span className={stageLinkClassName}>{item.label}</span>
			) : (
				<Link
					href={item.route}
					aria-current={item.state === "active" ? "page" : undefined}
					data-active={item.state === "active" ? "true" : undefined}
					onNavigate={(event) => onLinkNavigate?.(event, item.route)}
					onClick={(event) =>
						handleControlledNavigation(event, item.route, onNavigate)
					}
					className={stageLinkClassName}
				>
					{item.label}
				</Link>
			)}

			{item.stepItems.length > 0 ? (
				<ul className="space-y-1 border-l border-border/60 pl-3">
					{item.stepItems.map((stepItem) => (
						<li key={stepItem.id}>
							<BlueprintStageRailStepLink
								item={stepItem}
								onLinkNavigate={onLinkNavigate}
								onNavigate={onNavigate}
							/>
						</li>
					))}
				</ul>
			) : null}
		</section>
	);
}

export function BlueprintStageRail({
	currentStageId,
	activeStepId,
	stageStatuses,
	onLinkNavigate,
	onNavigate,
}: {
	currentStageId: Parameters<
		typeof buildBlueprintStageRailItems
	>[0]["currentStageId"];
	activeStepId?: string;
	stageStatuses: Parameters<
		typeof buildBlueprintStageRailItems
	>[0]["stageStatuses"];
	onLinkNavigate?: (
		event: { preventDefault: () => void },
		href: string,
	) => void;
	onNavigate?: (href: string) => void;
}) {
	const railItems = buildBlueprintStageRailItems({
		currentStageId,
		activeStepId,
		stageStatuses,
	});

	return (
		<div className="space-y-6 text-sm leading-6 text-foreground/90">
			{railItems.map((item) => (
				<BlueprintStageRailStage
					key={item.id}
					item={item}
					onLinkNavigate={onLinkNavigate}
					onNavigate={onNavigate}
				/>
			))}
		</div>
	);
}
