"use client";

import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

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
	return (
		<ScrollAreaPrimitive.Root
			data-slot="scroll-area"
			className={cn(
				"relative size-full min-h-0 overflow-hidden rounded-[inherit]",
				className,
			)}
			{...props}
		>
			<ScrollAreaPrimitive.Viewport
				data-slot="scroll-area-viewport"
				className={cn(
					"h-full max-h-[inherit] overflow-auto overscroll-contain rounded-[inherit] outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background data-[orientation=horizontal]:overscroll-x-contain",
					chainVerticalScroll && "overscroll-y-auto",
					scrollFade &&
						"mask-t-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-y-start)))] mask-b-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-y-end)))] mask-l-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-x-start)))] mask-r-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-x-end)))] [--fade-size:1.5rem]",
					scrollbarGutter && "[scrollbar-gutter:stable]",
					hideScrollbars &&
						"[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				)}
			>
				{children}
			</ScrollAreaPrimitive.Viewport>
			{!hideScrollbars && (
				<>
					<ScrollBar orientation="vertical" />
					<ScrollBar orientation="horizontal" />
					<ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
				</>
			)}
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
