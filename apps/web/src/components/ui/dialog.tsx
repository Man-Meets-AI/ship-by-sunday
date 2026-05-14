"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type DialogPopupProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
	showCloseButton?: boolean;
	bottomStickOnMobile?: boolean;
};

type DialogFooterProps = React.ComponentProps<"div"> & {
	showCloseButton?: boolean;
	variant?: "default" | "bare";
};

type DialogPanelProps = React.ComponentProps<"div"> & {
	scrollFade?: boolean;
};

function Dialog({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogBackdrop({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			data-slot="dialog-backdrop"
			className={cn(
				"fixed inset-0 z-50 transition-all duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-ending-style:opacity-0 data-starting-style:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

function DialogViewport({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-viewport"
			className={cn(
				"fixed inset-0 z-50 grid grid-rows-[1fr_auto_3fr] justify-items-center bg-white/48 p-4 backdrop-blur-[2px] dark:bg-black/28",
				className,
			)}
			{...props}
		/>
	);
}

function DialogPopup({
	className,
	children,
	showCloseButton = true,
	bottomStickOnMobile = true,
	forceMount,
	...props
}: DialogPopupProps) {
	return (
		<DialogPortal forceMount={forceMount}>
			<DialogBackdrop />
			<DialogViewport
				className={cn(
					bottomStickOnMobile &&
						"max-sm:grid-rows-[1fr_auto] max-sm:p-0 max-sm:pt-12",
				)}
			>
				<DialogPrimitive.Content
					forceMount={forceMount}
					data-slot="dialog-popup"
					className={cn(
						"-translate-y-[calc(1.25rem*var(--nested-dialogs))] relative row-start-2 flex max-h-full min-h-0 w-full min-w-0 max-w-lg scale-[calc(1-0.1*var(--nested-dialogs))] flex-col rounded-2xl border bg-popover text-popover-foreground opacity-[calc(1-0.1*var(--nested-dialogs))] shadow-lg/5 outline-none transition-[scale,opacity,translate] duration-200 ease-in-out will-change-transform not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-nested:data-ending-style:translate-y-8 data-nested:data-starting-style:translate-y-8 data-nested-dialog-open:origin-top data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
						bottomStickOnMobile &&
							"max-sm:max-w-none max-sm:rounded-none max-sm:border-x-0 max-sm:border-t max-sm:border-b-0 max-sm:opacity-[calc(1-min(var(--nested-dialogs),1))] max-sm:data-ending-style:translate-y-4 max-sm:data-starting-style:translate-y-4 max-sm:before:hidden max-sm:before:rounded-none",
						className,
					)}
					{...props}
				>
					{children}
					{showCloseButton && (
						<DialogPrimitive.Close data-slot="dialog-close" asChild>
							<Button
								aria-label="Close"
								variant="ghost"
								className="absolute end-2 top-2"
								size="icon"
							>
								<XIcon />
								<span className="sr-only">Close</span>
							</Button>
						</DialogPrimitive.Close>
					)}
				</DialogPrimitive.Content>
			</DialogViewport>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-header"
			className={cn(
				"flex flex-col gap-2 p-6 in-[[data-slot=dialog-popup]:has([data-slot=dialog-panel])]:pb-3 max-sm:pb-4",
				className,
			)}
			{...props}
		/>
	);
}

function DialogFooter({
	className,
	showCloseButton = false,
	variant = "default",
	children,
	...props
}: DialogFooterProps) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				"flex flex-col-reverse gap-2 px-6 sm:flex-row sm:justify-end sm:rounded-b-[calc(var(--radius-2xl)-1px)]",
				variant === "default" && "border-t bg-muted/72 py-4",
				variant === "bare" &&
					"in-[[data-slot=dialog-popup]:has([data-slot=dialog-panel])]:pt-3 pt-4 pb-6",
				className,
			)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogPrimitive.Close asChild>
					<Button variant="outline">Close</Button>
				</DialogPrimitive.Close>
			)}
		</div>
	);
}

function DialogTitle({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			className={cn(
				"font-heading font-semibold text-xl leading-none",
				className,
			)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

function DialogPanel({
	className,
	scrollFade = true,
	...props
}: DialogPanelProps) {
	return (
		<ScrollArea
			data-scroll-fade={scrollFade ? "true" : undefined}
			className="min-h-0 flex-1 rounded-[inherit]"
		>
			<div
				data-slot="dialog-panel"
				className={cn(
					"p-6 in-[[data-slot=dialog-popup]:has([data-slot=dialog-header])]:pt-1 in-[[data-slot=dialog-popup]:has([data-slot=dialog-footer]:not(.border-t))]:pb-1",
					className,
				)}
				{...props}
			/>
		</ScrollArea>
	);
}

export {
	Dialog,
	DialogBackdrop,
	DialogPopup as DialogContent,
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogBackdrop as DialogOverlay,
	DialogPanel,
	DialogPopup,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
	DialogViewport,
};
