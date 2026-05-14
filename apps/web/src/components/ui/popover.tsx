"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Popover({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverPortal({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Portal>) {
	return <PopoverPrimitive.Portal data-slot="popover-portal" {...props} />;
}

function PopoverAnchor({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
	return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverPopup({
	children,
	className,
	forceMount,
	side = "bottom",
	align = "center",
	sideOffset = 4,
	alignOffset = 0,
	tooltipStyle = false,
	viewportClassName,
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
	tooltipStyle?: boolean;
	viewportClassName?: string;
}) {
	return (
		<PopoverPrimitive.Portal forceMount={forceMount}>
			<PopoverPrimitive.Content
				data-slot="popover-popup"
				forceMount={forceMount}
				side={side}
				align={align}
				sideOffset={sideOffset}
				alignOffset={alignOffset}
				className={cn(
					"relative z-50 max-h-(--radix-popover-content-available-height) min-w-32 origin-(--radix-popover-content-transform-origin) overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg/5 outline-none transition-[scale,opacity] not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
					tooltipStyle &&
						"w-fit text-balance rounded-md text-xs shadow-md/5 before:rounded-[calc(var(--radius-md)-1px)]",
					className,
				)}
				{...props}
			>
				<div
					data-slot="popover-viewport"
					className={cn(
						"relative size-full max-h-(--radix-popover-content-available-height) overflow-clip px-(--viewport-inline-padding) py-4 [--viewport-inline-padding:--spacing(4)] has-data-[slot=calendar]:p-2",
						tooltipStyle
							? "py-1 [--viewport-inline-padding:--spacing(2)]"
							: "overflow-y-auto",
						viewportClassName ?? className,
					)}
				>
					{children}
				</div>
			</PopoverPrimitive.Content>
		</PopoverPrimitive.Portal>
	);
}

function PopoverClose({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Close>) {
	return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
	return (
		<h2
			data-slot="popover-title"
			className={cn("font-semibold text-lg leading-none", className)}
			{...props}
		/>
	);
}

function PopoverDescription({
	className,
	...props
}: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="popover-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

export {
	Popover,
	PopoverAnchor,
	PopoverClose,
	PopoverPopup as PopoverContent,
	PopoverDescription,
	PopoverPopup,
	PopoverPortal,
	PopoverTitle,
	PopoverTrigger,
};
