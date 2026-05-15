"use client";

import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function updateScrollAreaMetrics(
	viewport: HTMLDivElement,
	scrollFade: boolean,
) {
	const maxScrollTop = Math.max(
		0,
		viewport.scrollHeight - viewport.clientHeight,
	);
	const maxScrollLeft = Math.max(
		0,
		viewport.scrollWidth - viewport.clientWidth,
	);
	const scrollTop = Math.min(maxScrollTop, Math.max(0, viewport.scrollTop));
	const scrollLeft = Math.min(maxScrollLeft, Math.max(0, viewport.scrollLeft));

	viewport.toggleAttribute("data-has-overflow-y", maxScrollTop > 0);
	viewport.toggleAttribute("data-has-overflow-x", maxScrollLeft > 0);

	if (!scrollFade) {
		viewport.style.removeProperty("--scroll-area-overflow-y-start");
		viewport.style.removeProperty("--scroll-area-overflow-y-end");
		viewport.style.removeProperty("--scroll-area-overflow-x-start");
		viewport.style.removeProperty("--scroll-area-overflow-x-end");
		return;
	}

	viewport.style.setProperty(
		"--scroll-area-overflow-y-start",
		`${scrollTop}px`,
	);
	viewport.style.setProperty(
		"--scroll-area-overflow-y-end",
		`${Math.max(0, maxScrollTop - scrollTop)}px`,
	);
	viewport.style.setProperty(
		"--scroll-area-overflow-x-start",
		`${scrollLeft}px`,
	);
	viewport.style.setProperty(
		"--scroll-area-overflow-x-end",
		`${Math.max(0, maxScrollLeft - scrollLeft)}px`,
	);
}

function ScrollArea({
	className,
	children,
	scrollFade = false,
	scrollbarGutter = false,
	hideScrollbars = false,
	chainVerticalScroll = false,
	...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
	scrollFade?: boolean;
	scrollbarGutter?: boolean;
	hideScrollbars?: boolean;
	chainVerticalScroll?: boolean;
}) {
	const viewportRef = React.useRef<HTMLDivElement | null>(null);

	React.useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) {
			return;
		}

		const updateMetrics = () => updateScrollAreaMetrics(viewport, scrollFade);
		updateMetrics();
		viewport.addEventListener("scroll", updateMetrics, { passive: true });

		let resizeObserver: ResizeObserver | undefined;
		if (typeof ResizeObserver !== "undefined") {
			resizeObserver = new ResizeObserver(updateMetrics);
			resizeObserver.observe(viewport);
			if (viewport.firstElementChild instanceof Element) {
				resizeObserver.observe(viewport.firstElementChild);
			}
		}

		return () => {
			viewport.removeEventListener("scroll", updateMetrics);
			resizeObserver?.disconnect();
		};
	}, [scrollFade]);

	return (
		<ScrollAreaPrimitive.Root
			data-slot="scroll-area"
			data-scroll-fade={scrollFade ? "true" : undefined}
			className={cn(
				"relative size-full min-h-0 overflow-hidden rounded-[inherit]",
				className,
			)}
			{...props}
		>
			<ScrollAreaPrimitive.Viewport
				ref={viewportRef}
				data-slot="scroll-area-viewport"
				className={cn(
					"h-full max-h-[inherit] overflow-auto overscroll-contain rounded-[inherit] outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background data-has-overflow-x:overscroll-x-contain",
					chainVerticalScroll && "overscroll-y-auto",
					scrollFade &&
						"mask-t-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-y-start,0px)))] mask-b-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-y-end,0px)))] mask-l-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-x-start,0px)))] mask-r-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-x-end,0px)))] [--fade-size:1.5rem]",
					scrollbarGutter && "[scrollbar-gutter:stable]",
					hideScrollbars &&
						"[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				)}
			>
				{children}
			</ScrollAreaPrimitive.Viewport>
			<ScrollBar orientation="vertical" hidden={hideScrollbars} />
			<ScrollBar orientation="horizontal" hidden={hideScrollbars} />
			<ScrollAreaPrimitive.Corner
				data-slot="scroll-area-corner"
				hidden={hideScrollbars}
			/>
		</ScrollAreaPrimitive.Root>
	);
}

function ScrollBar({
	className,
	orientation = "vertical",
	...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
	return (
		<ScrollAreaPrimitive.ScrollAreaScrollbar
			data-slot="scroll-area-scrollbar"
			data-orientation={orientation}
			orientation={orientation}
			className={cn(
				"m-1 flex opacity-0 transition-opacity delay-300 data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-1.5 data-[state=visible]:opacity-100 data-[state=visible]:delay-0 data-[state=visible]:duration-100",
				className,
			)}
			{...props}
		>
			<ScrollAreaPrimitive.ScrollAreaThumb
				data-slot="scroll-area-thumb"
				className="relative flex-1 rounded-full bg-foreground/20"
			/>
		</ScrollAreaPrimitive.ScrollAreaScrollbar>
	);
}

export { ScrollArea, ScrollBar };
