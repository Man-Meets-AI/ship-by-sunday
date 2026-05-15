"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type SheetSide = "top" | "right" | "bottom" | "left";
type SheetVariant = "default" | "inset";

type SheetPopupProps = React.ComponentProps<typeof SheetPrimitive.Content> & {
	side?: SheetSide;
	showCloseButton?: boolean;
	keepMounted?: boolean;
	variant?: SheetVariant;
};

type SheetViewportProps = React.ComponentProps<"div"> & {
	side?: SheetSide;
	variant?: SheetVariant;
};

type SheetFooterProps = React.ComponentProps<"div"> & {
	variant?: "default" | "bare";
};

type SheetPanelProps = React.ComponentProps<"div"> & {
	scrollFade?: boolean;
};

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
	return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
	return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
	return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
	return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetBackdrop({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
	return (
		<SheetPrimitive.Overlay
			data-slot="sheet-backdrop"
			className={cn(
				"fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-all duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-ending-style:opacity-0 data-starting-style:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

function SheetViewport({
	className,
	side = "right",
	variant = "default",
	...props
}: SheetViewportProps) {
	return (
		<div
			data-slot="sheet-viewport"
			className={cn(
				"fixed inset-0 z-50 grid",
				side === "bottom" && "grid-rows-[1fr_auto] pt-12",
				side === "top" && "grid-rows-[auto_1fr] pb-12",
				side === "left" && "flex justify-start",
				side === "right" && "flex justify-end",
				variant === "inset" && "sm:p-4",
				className,
			)}
			{...props}
		/>
	);
}

function SheetPopup({
	className,
	children,
	side = "right",
	showCloseButton = true,
	keepMounted = false,
	variant = "default",
	forceMount,
	...props
}: SheetPopupProps) {
	const radixForceMount = forceMount ?? (keepMounted ? true : undefined);

	return (
		<SheetPortal forceMount={radixForceMount}>
			<SheetBackdrop />
			<SheetViewport side={side} variant={variant}>
				<SheetPrimitive.Content
					forceMount={radixForceMount}
					data-slot="sheet-popup"
					data-side={side}
					className={cn(
						"relative flex max-h-full min-h-0 w-full min-w-0 flex-col bg-popover text-popover-foreground shadow-lg/5 outline-none transition-[opacity,translate] duration-200 ease-in-out will-change-transform not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:shadow-[0_1px_--theme(--color-black/4%)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-ending-style:opacity-0 data-starting-style:opacity-0 max-sm:before:hidden dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
						side === "bottom" &&
							"row-start-2 border-t data-[state=closed]:slide-out-to-bottom-8 data-[state=open]:slide-in-from-bottom-8 data-ending-style:translate-y-8 data-starting-style:translate-y-8",
						side === "top" &&
							"border-b data-[state=closed]:slide-out-to-top-8 data-[state=open]:slide-in-from-top-8 data-ending-style:-translate-y-8 data-starting-style:-translate-y-8",
						side === "left" &&
							"w-[calc(100%-(--spacing(12)))] max-w-md border-e data-[state=closed]:slide-out-to-left-8 data-[state=open]:slide-in-from-left-8 data-ending-style:-translate-x-8 data-starting-style:-translate-x-8",
						side === "right" &&
							"col-start-2 w-[calc(100%-(--spacing(12)))] max-w-md border-s data-[state=closed]:slide-out-to-right-8 data-[state=open]:slide-in-from-right-8 data-ending-style:translate-x-8 data-starting-style:translate-x-8",
						variant === "inset" &&
							"before:hidden sm:rounded-2xl sm:border sm:before:rounded-[calc(var(--radius-2xl)-1px)] sm:**:data-[slot=sheet-footer]:rounded-b-[calc(var(--radius-2xl)-1px)]",
						className,
					)}
					{...props}
				>
					{children}
					{showCloseButton && (
						<SheetPrimitive.Close data-slot="sheet-close" asChild>
							<Button
								aria-label="Close"
								variant="ghost"
								className="absolute end-2 top-2"
								size="icon"
							>
								<XIcon />
								<span className="sr-only">Close</span>
							</Button>
						</SheetPrimitive.Close>
					)}
				</SheetPrimitive.Content>
			</SheetViewport>
		</SheetPortal>
	);
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-header"
			className={cn(
				"flex flex-col gap-2 p-6 in-[[data-slot=sheet-popup]:has([data-slot=sheet-panel])]:pb-3 max-sm:pb-4",
				className,
			)}
			{...props}
		/>
	);
}

function SheetFooter({
	className,
	variant = "default",
	...props
}: SheetFooterProps) {
	return (
		<div
			data-slot="sheet-footer"
			className={cn(
				"flex flex-col-reverse gap-2 px-6 sm:flex-row sm:justify-end",
				variant === "default" && "border-t bg-muted/72 py-4",
				variant === "bare" &&
					"in-[[data-slot=sheet-popup]:has([data-slot=sheet-panel])]:pt-3 pt-4 pb-6",
				className,
			)}
			{...props}
		/>
	);
}

function SheetTitle({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
	return (
		<SheetPrimitive.Title
			data-slot="sheet-title"
			className={cn(
				"font-heading font-semibold text-xl leading-none",
				className,
			)}
			{...props}
		/>
	);
}

function SheetDescription({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
	return (
		<SheetPrimitive.Description
			data-slot="sheet-description"
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

function SheetPanel({
	className,
	scrollFade = true,
	...props
}: SheetPanelProps) {
	return (
		<ScrollArea
			scrollFade={scrollFade}
			className="min-h-0 flex-1 rounded-[inherit]"
		>
			<div
				data-slot="sheet-panel"
				className={cn(
					"p-6 in-[[data-slot=sheet-popup]:has([data-slot=sheet-header])]:pt-1 in-[[data-slot=sheet-popup]:has([data-slot=sheet-footer]:not(.border-t))]:pb-1",
					className,
				)}
				{...props}
			/>
		</ScrollArea>
	);
}

export {
	Sheet,
	SheetBackdrop,
	SheetClose,
	SheetPopup as SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetBackdrop as SheetOverlay,
	SheetPanel,
	SheetPopup,
	SheetPortal,
	SheetTitle,
	SheetTrigger,
	SheetViewport,
};
