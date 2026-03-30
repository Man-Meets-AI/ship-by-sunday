"use client";

import Link from "next/link";
import type { PacketStageId } from "@packet-compiler";
import {
	buildPacketStageNavItems,
	type PacketStageNavItem,
	type PacketStageNavState,
} from "@/features/packet-flow/lib/packet-stage-nav-model";
import { cn } from "@/lib/utils";

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

function getStateClassName(state: PacketStageNavState) {
	switch (state) {
		case "active":
			return "bg-muted/70 font-semibold text-foreground";
		case "complete":
			return "text-foreground/80 hover:bg-muted/60 hover:text-foreground";
		case "available":
			return "text-muted-foreground hover:bg-muted/60 hover:text-foreground";
		case "locked":
			return "cursor-not-allowed text-muted-foreground/35";
	}
}

function PacketStageNavLink({
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
	const linkClassName = cn(
		"inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
		getStateClassName(item.state),
	);

	if (item.state === "locked") {
		return <span className={linkClassName}>{item.label}</span>;
	}

	return (
		<Link
			href={item.route}
			aria-current={item.state === "active" ? "page" : undefined}
			data-active={item.state === "active" ? "true" : undefined}
			onNavigate={(event) => onLinkNavigate?.(event, item.route)}
			onClick={(event) =>
				handleControlledNavigation(event, item.route, onNavigate)
			}
			className={linkClassName}
		>
			{item.label}
		</Link>
	);
}

export function PacketStageNav({
	currentStageId,
	onLinkNavigate,
	stageStatuses,
	onNavigate,
}: {
	currentStageId?: PacketStageId;
	onLinkNavigate?: (
		event: { preventDefault: () => void },
		href: string,
	) => void;
	stageStatuses: Parameters<
		typeof buildPacketStageNavItems
	>[0]["stageStatuses"];
	onNavigate?: (href: string) => void;
}) {
	const stageItems = buildPacketStageNavItems({
		currentStageId,
		stageStatuses,
	});

	return (
		<nav aria-label="Packet stages" className="shrink-0">
			<div className="flex items-center gap-2">
				{stageItems.map((item) => (
					<PacketStageNavLink
						key={item.id}
						item={item}
						onLinkNavigate={onLinkNavigate}
						onNavigate={onNavigate}
					/>
				))}
			</div>
		</nav>
	);
}
