"use client";

import Link from "next/link";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import type {
	WorkspacePrimaryNavActionId,
	WorkspacePrimaryNavItem,
	WorkspacePrimaryNavMenuEntry,
} from "../lib/build-primary-nav-model";

const topLevelClassName =
	"inline-flex items-center rounded-md px-2 py-1 text-sm font-medium transition-colors";
const menuEntryClassName =
	"flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground";

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

function getStateClassName(state: WorkspacePrimaryNavItem["state"]) {
	switch (state) {
		case "active":
			return "font-semibold text-foreground";
		case "complete":
			return "text-foreground/70";
		case "disabled":
			return "cursor-not-allowed text-muted-foreground/35";
		default:
			return "text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground";
	}
}

function MenuEntry({
	item,
	onAction,
	onLinkNavigate,
	onNavigate,
}: {
	item: WorkspacePrimaryNavMenuEntry;
	onAction?: (actionId: WorkspacePrimaryNavActionId) => void;
	onLinkNavigate?: (
		event: { preventDefault: () => void },
		href: string,
	) => void;
	onNavigate?: (href: string) => void;
}) {
	if (item.kind === "action") {
		return (
			<button
				type="button"
				disabled={item.state === "disabled"}
				onClick={() => onAction?.(item.actionId)}
				className={cn(
					menuEntryClassName,
					"text-left",
					getStateClassName(item.state),
				)}
			>
				{item.label}
			</button>
		);
	}

	if (item.state === "disabled") {
		return (
			<span className={cn(menuEntryClassName, getStateClassName(item.state))}>
				{item.label}
			</span>
		);
	}

	return (
		<NavigationMenuLink asChild>
			<Link
				href={item.href}
				aria-current={item.state === "active" ? "page" : undefined}
				onNavigate={(event) => onLinkNavigate?.(event, item.href)}
				onClick={(event) =>
					handleControlledNavigation(event, item.href, onNavigate)
				}
				className={cn(menuEntryClassName, getStateClassName(item.state))}
			>
				{item.label}
			</Link>
		</NavigationMenuLink>
	);
}

export function WorkspacePrimaryNav({
	items,
	onAction,
	onLinkNavigate,
	onNavigate,
}: {
	items: WorkspacePrimaryNavItem[];
	onAction?: (actionId: WorkspacePrimaryNavActionId) => void;
	onLinkNavigate?: (
		event: { preventDefault: () => void },
		href: string,
	) => void;
	onNavigate?: (href: string) => void;
}) {
	return (
		<NavigationMenu
			viewport={false}
			className="w-auto max-w-none shrink-0 justify-start"
		>
			<NavigationMenuList className="flex items-center justify-start gap-x-3">
				{items.map((item) =>
					item.kind === "link" ? (
						<NavigationMenuItem key={item.id}>
							{item.state === "disabled" ? (
								<span
									className={cn(
										topLevelClassName,
										getStateClassName(item.state),
									)}
								>
									{item.label}
								</span>
							) : (
								<NavigationMenuLink asChild>
									<Link
										href={item.href}
										aria-current={item.state === "active" ? "page" : undefined}
										onNavigate={(event) => onLinkNavigate?.(event, item.href)}
										onClick={(event) =>
											handleControlledNavigation(event, item.href, onNavigate)
										}
										className={cn(
											topLevelClassName,
											getStateClassName(item.state),
										)}
									>
										{item.label}
									</Link>
								</NavigationMenuLink>
							)}
						</NavigationMenuItem>
					) : (
						<NavigationMenuItem key={item.id}>
							<NavigationMenuTrigger
								disabled={item.state === "disabled"}
								className={cn(
									topLevelClassName,
									"h-auto rounded-none bg-transparent px-0 py-0 shadow-none hover:bg-transparent focus:bg-transparent",
									getStateClassName(item.state),
								)}
							>
								{item.label}
							</NavigationMenuTrigger>
							<NavigationMenuContent className="w-64 p-2">
								<ul className="grid gap-1">
									{item.items.map((entry) => (
										<li key={entry.id}>
											<MenuEntry
												item={entry}
												onAction={onAction}
												onLinkNavigate={onLinkNavigate}
												onNavigate={onNavigate}
											/>
										</li>
									))}
								</ul>
							</NavigationMenuContent>
						</NavigationMenuItem>
					),
				)}
			</NavigationMenuList>
		</NavigationMenu>
	);
}
