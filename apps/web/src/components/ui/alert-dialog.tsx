"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AlertDialogPopupProps = React.ComponentProps<
	typeof AlertDialogPrimitive.Content
> & {
	bottomStickOnMobile?: boolean;
	"data-slot"?: string;
	size?: "default" | "sm";
};

type AlertDialogFooterProps = React.ComponentProps<"div"> & {
	variant?: "default" | "bare";
};

function AlertDialog({
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
	return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
	return (
		<AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
	);
}

function AlertDialogPortal({
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
	return (
		<AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
	);
}

function AlertDialogBackdrop({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
	return (
		<AlertDialogPrimitive.Overlay
			data-slot="alert-dialog-backdrop"
			className={cn(
				"fixed inset-0 z-50 transition-all duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-ending-style:opacity-0 data-starting-style:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogViewport({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-dialog-viewport"
			className={cn(
				"fixed inset-0 z-50 grid grid-rows-[1fr_auto_3fr] justify-items-center bg-white/48 p-4 backdrop-blur-[2px] dark:bg-black/28",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogPopup({
	className,
	children,
	bottomStickOnMobile = true,
	forceMount,
	size = "default",
	"data-slot": dataSlot,
	...props
}: AlertDialogPopupProps) {
	return (
		<AlertDialogPortal forceMount={forceMount}>
			<AlertDialogBackdrop />
			<AlertDialogViewport
				className={cn(
					bottomStickOnMobile &&
						"max-sm:grid-rows-[1fr_auto] max-sm:p-0 max-sm:pt-12",
				)}
			>
				<AlertDialogPrimitive.Content
					forceMount={forceMount}
					data-size={size}
					data-slot={dataSlot ?? "alert-dialog-popup"}
					className={cn(
						"-translate-y-[calc(1.25rem*var(--nested-dialogs))] relative row-start-2 flex max-h-full min-h-0 w-full min-w-0 scale-[calc(1-0.1*var(--nested-dialogs))] flex-col rounded-2xl border bg-popover text-popover-foreground opacity-[calc(1-0.1*var(--nested-dialogs))] shadow-lg/5 outline-none transition-[scale,opacity,translate] duration-200 ease-in-out will-change-transform not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[size=default]:max-w-lg data-[size=sm]:max-w-sm data-nested:data-ending-style:translate-y-8 data-nested:data-starting-style:translate-y-8 data-nested-dialog-open:origin-top data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
						bottomStickOnMobile &&
							"max-sm:max-w-none max-sm:rounded-none max-sm:border-x-0 max-sm:border-t max-sm:border-b-0 max-sm:opacity-[calc(1-min(var(--nested-dialogs),1))] max-sm:data-ending-style:translate-y-4 max-sm:data-starting-style:translate-y-4 max-sm:before:hidden max-sm:before:rounded-none",
						className,
					)}
					{...props}
				>
					{children}
				</AlertDialogPrimitive.Content>
			</AlertDialogViewport>
		</AlertDialogPortal>
	);
}

function AlertDialogHeader({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-dialog-header"
			className={cn(
				"flex flex-col gap-2 p-6 text-center max-sm:pb-4 sm:text-left",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogFooter({
	className,
	variant = "default",
	...props
}: AlertDialogFooterProps) {
	return (
		<div
			data-slot="alert-dialog-footer"
			className={cn(
				"flex flex-col-reverse gap-2 px-6 sm:flex-row sm:justify-end sm:rounded-b-[calc(var(--radius-2xl)-1px)]",
				variant === "default" && "border-t bg-muted/72 py-4",
				variant === "bare" && "pb-6",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogPanel({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-dialog-panel"
			className={cn(
				"min-h-0 flex-1 p-6 pt-1 in-[[data-slot=alert-dialog-popup]:has([data-slot=alert-dialog-footer]:not(.border-t))]:pb-1",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogMedia({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-dialog-media"
			className={cn(
				"mx-auto mb-2 inline-flex size-10 items-center justify-center rounded-lg border bg-muted/72 text-muted-foreground sm:mx-0 *:[svg:not([class*='size-'])]:size-5",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogTitle({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
	return (
		<AlertDialogPrimitive.Title
			data-slot="alert-dialog-title"
			className={cn(
				"font-heading font-semibold text-xl leading-none",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogDescription({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
	return (
		<AlertDialogPrimitive.Description
			data-slot="alert-dialog-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

function AlertDialogAction({
	className,
	variant = "default",
	size = "default",
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
	Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
	return (
		<Button variant={variant} size={size} asChild>
			<AlertDialogPrimitive.Action
				data-slot="alert-dialog-action"
				className={cn(className)}
				{...props}
			/>
		</Button>
	);
}

function AlertDialogCancel({
	className,
	variant = "outline",
	size = "default",
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
	Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
	return (
		<Button variant={variant} size={size} asChild>
			<AlertDialogPrimitive.Cancel
				data-slot="alert-dialog-cancel"
				className={cn(className)}
				{...props}
			/>
		</Button>
	);
}

function AlertDialogClose({
	className,
	...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
	return (
		<AlertDialogPrimitive.Cancel
			data-slot="alert-dialog-close"
			className={cn(className)}
			{...props}
		/>
	);
}

export {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBackdrop,
	AlertDialogCancel,
	AlertDialogClose,
	AlertDialogPopup as AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogBackdrop as AlertDialogOverlay,
	AlertDialogPanel,
	AlertDialogPopup,
	AlertDialogPortal,
	AlertDialogTitle,
	AlertDialogTrigger,
	AlertDialogViewport,
};
