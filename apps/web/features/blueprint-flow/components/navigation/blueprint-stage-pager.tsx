"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

function BlueprintStagePagerButton({
	href,
	ariaLabel,
	icon: Icon,
	onLinkNavigate,
	onNavigate,
}: {
	href: string;
	ariaLabel: string;
	icon: typeof ChevronLeft;
	onLinkNavigate?: (
		event: { preventDefault: () => void },
		href: string,
	) => void;
	onNavigate?: (href: string) => void;
}) {
	return (
		<Button asChild variant="outline" size="icon-sm" className="rounded-full">
			<Link
				href={href}
				aria-label={ariaLabel}
				onNavigate={(event) => onLinkNavigate?.(event, href)}
				onClick={(event) => handleControlledNavigation(event, href, onNavigate)}
			>
				<Icon className="size-4" aria-hidden="true" />
			</Link>
		</Button>
	);
}

export function BlueprintStagePager({
	previousHref,
	nextHref,
	onLinkNavigate,
	onNavigate,
}: {
	previousHref?: string;
	nextHref?: string;
	onLinkNavigate?: (
		event: { preventDefault: () => void },
		href: string,
	) => void;
	onNavigate?: (href: string) => void;
}) {
	if (!previousHref && !nextHref) {
		return null;
	}

	return (
		<div className="hidden items-center gap-2 xl:flex">
			{previousHref ? (
				<BlueprintStagePagerButton
					href={previousHref}
					ariaLabel="Previous blueprint page"
					icon={ChevronLeft}
					onLinkNavigate={onLinkNavigate}
					onNavigate={onNavigate}
				/>
			) : (
				<div className="size-8" />
			)}
			{nextHref ? (
				<BlueprintStagePagerButton
					href={nextHref}
					ariaLabel="Next blueprint page"
					icon={ChevronRight}
					onLinkNavigate={onLinkNavigate}
					onNavigate={onNavigate}
				/>
			) : (
				<div className="size-8" />
			)}
		</div>
	);
}
