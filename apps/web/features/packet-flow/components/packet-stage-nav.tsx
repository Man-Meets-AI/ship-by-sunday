"use client";

import Link from "next/link";
import { type PacketStageId, type PacketStageStatus } from "@packet-compiler";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
	buildPacketStageNavItems,
	type PacketStageNavItem,
	type PacketStageNavStepItem,
} from "@/features/packet-flow/lib/packet-stage-nav-model";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const stageNavLabelClassName =
	"inline-flex items-baseline gap-2 rounded-md px-2 py-1 text-sm font-medium transition-colors";

const stageNavTriggerClassName = cn(
	stageNavLabelClassName,
	"h-auto rounded-none bg-transparent px-0 py-0 shadow-none hover:bg-transparent focus:bg-transparent",
);

const stageNavLinkClassName = cn(
	stageNavLabelClassName,
	"rounded-none bg-transparent px-0 py-0 shadow-none hover:bg-transparent focus:bg-transparent",
);

const stageNavStepLinkClassName =
	"flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground";

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

function PacketStageNavStepLink({
	item,
	onLinkNavigate,
	onNavigate,
}: {
	item: PacketStageNavStepItem;
	onLinkNavigate?: (
		event: { preventDefault: () => void },
		href: string,
	) => void;
	onNavigate?: (href: string) => void;
}) {
	return (
		<NavigationMenuLink asChild>
			<Link
				href={item.href}
				aria-current={item.state === "active" ? "page" : undefined}
				data-active={item.state === "active" ? "true" : undefined}
				onNavigate={(event) => onLinkNavigate?.(event, item.href)}
				onClick={(event) =>
					handleControlledNavigation(event, item.href, onNavigate)
				}
				className={cn(
					stageNavStepLinkClassName,
					item.state === "active" && "text-foreground",
					item.state === "complete" && "text-foreground/85 hover:bg-muted/70",
					item.state === "open" && "text-muted-foreground",
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
				<span className={cn(item.state === "active" && "font-semibold")}>
					{item.label}
				</span>
			</Link>
		</NavigationMenuLink>
	);
}

function PacketStageNavStageLink({
	item,
	onLinkNavigate,
	onNavigate,
}: {
	item: PacketStageNavItem;
	onLinkNavigate?: (
		event: { preventDefault: () => void },
		href: string,
	) => void;
	onNavigate?: (href: string) => void;
}) {
	if (!item.isOpen) {
		return (
			<NavigationMenuItem>
				<span
					aria-disabled="true"
					className={cn(
						stageNavLinkClassName,
						"cursor-not-allowed text-muted-foreground/30",
					)}
				>
					{item.label}
				</span>
			</NavigationMenuItem>
		);
	}

	return (
		<NavigationMenuItem>
			<NavigationMenuLink asChild>
				<Link
					href={item.route}
					aria-current={item.isCurrent ? "page" : undefined}
					data-active={item.isCurrent ? "true" : undefined}
					onNavigate={(event) => onLinkNavigate?.(event, item.route)}
					onClick={(event) =>
						handleControlledNavigation(event, item.route, onNavigate)
					}
					className={cn(
						stageNavLinkClassName,
						item.isCurrent && "font-semibold text-foreground",
						item.isComplete && !item.isCurrent && "text-foreground/65",
						!item.isComplete && !item.isCurrent && "text-muted-foreground/75",
						item.isOpen &&
							!item.isCurrent &&
							"hover:bg-muted/60 hover:text-foreground",
					)}
				>
					<span>{item.label}</span>
				</Link>
			</NavigationMenuLink>
		</NavigationMenuItem>
	);
}

function PacketStageNavStageDropdown({
	item,
	onLinkNavigate,
	onNavigate,
}: {
	item: PacketStageNavItem;
	onLinkNavigate?: (
		event: { preventDefault: () => void },
		href: string,
	) => void;
	onNavigate?: (href: string) => void;
}) {
	return (
		<NavigationMenuItem>
			<NavigationMenuTrigger
				disabled={!item.isOpen}
				className={cn(
					stageNavTriggerClassName,
					item.isCurrent && "font-semibold text-foreground",
					item.isComplete && !item.isCurrent && "text-foreground/65",
					!item.isComplete && !item.isCurrent && "text-muted-foreground/75",
					item.isOpen &&
						!item.isCurrent &&
						"hover:bg-muted/60 hover:text-foreground",
				)}
			>
				{item.label}
			</NavigationMenuTrigger>
			{item.isOpen ? (
				<NavigationMenuContent className="w-72 p-2">
					<ul className="grid gap-1">
						{item.stepItems.map((stepItem) => (
							<li key={stepItem.id}>
								<PacketStageNavStepLink
									item={stepItem}
									onLinkNavigate={onLinkNavigate}
									onNavigate={onNavigate}
								/>
							</li>
						))}
					</ul>
				</NavigationMenuContent>
			) : null}
		</NavigationMenuItem>
	);
}

export function PacketStageNav({
	currentStageId,
	activeStepId,
	onLinkNavigate,
	stageStatuses,
	onNavigate,
}: {
	currentStageId: PacketStageId;
	activeStepId?: string;
	onLinkNavigate?: (
		event: { preventDefault: () => void },
		href: string,
	) => void;
	stageStatuses: PacketStageStatus[];
	onNavigate?: (href: string) => void;
}) {
	const stageItems = buildPacketStageNavItems({
		activeStepId,
		currentStageId,
		stageStatuses,
	});

	return (
		<nav aria-label="Packet stages">
			<NavigationMenu
				viewport={false}
				className="w-full max-w-none justify-start"
			>
				<NavigationMenuList className="flex flex-wrap items-center justify-start gap-x-6 gap-y-3">
					{stageItems.map((item) =>
						item.stepItems.length > 0 ? (
							<PacketStageNavStageDropdown
								key={item.id}
								item={item}
								onLinkNavigate={onLinkNavigate}
								onNavigate={onNavigate}
							/>
						) : (
							<PacketStageNavStageLink
								key={item.id}
								item={item}
								onLinkNavigate={onLinkNavigate}
								onNavigate={onNavigate}
							/>
						),
					)}
				</NavigationMenuList>
			</NavigationMenu>
		</nav>
	);
}
