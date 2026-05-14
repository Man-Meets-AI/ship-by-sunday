"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Select as SelectPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import {
	CheckIcon,
	ChevronDownIcon,
	ChevronsUpDownIcon,
	ChevronUpIcon,
} from "lucide-react";

const selectTriggerVariants = cva(
	"relative inline-flex cursor-pointer select-none items-center justify-between gap-2 rounded-lg border text-left text-base outline-none transition-[color,box-shadow,background-color] data-disabled:pointer-events-none data-disabled:opacity-64 sm:text-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					"w-full min-w-36 border-input bg-background text-foreground shadow-xs/5 ring-ring/24 not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-data-disabled:not-focus-visible:not-aria-invalid:not-data-pressed:before:shadow-[0_1px_--theme(--color-black/4%)] pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 focus-visible:border-ring focus-visible:ring-[3px] aria-invalid:border-destructive/36 focus-visible:aria-invalid:border-destructive/64 focus-visible:aria-invalid:ring-destructive/16 dark:bg-input/32 dark:aria-invalid:ring-destructive/24 dark:not-data-disabled:not-focus-visible:not-aria-invalid:not-data-pressed:before:shadow-[0_-1px_--theme(--color-white/6%)] [&_svg:not([class*='opacity-'])]:opacity-80 [[data-disabled],:focus-visible,[aria-invalid],[data-pressed]]:shadow-none",
				ghost:
					"border-transparent text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring data-pressed:bg-accent [:hover,[data-pressed]]:bg-accent [:hover,[data-pressed]]:text-foreground/80",
			},
			size: {
				default: "min-h-9 px-[calc(--spacing(3)-1px)] sm:min-h-8",
				lg: "min-h-10 px-[calc(--spacing(3)-1px)] sm:min-h-9",
				sm: "min-h-8 gap-1.5 px-[calc(--spacing(2.5)-1px)] sm:min-h-7",
				xs: "h-7 gap-1 rounded-md px-[calc(--spacing(2)-1px)] text-sm before:rounded-[calc(var(--radius-md)-1px)] sm:h-6 sm:text-xs [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

const selectTriggerIconClassName = "-me-1 size-4.5 opacity-80 sm:size-4";

function Select({
	...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
	return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
	return (
		<SelectPrimitive.Group
			data-slot="select-group"
			className={cn("scroll-my-1", className)}
			{...props}
		/>
	);
}

function SelectValue({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
	return (
		<SelectPrimitive.Value
			data-slot="select-value"
			className={cn(
				"flex-1 truncate data-placeholder:text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function SelectButton({
	className,
	size = "default",
	variant = "default",
	children,
	type,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof selectTriggerVariants>) {
	return (
		<button
			data-slot="select-button"
			data-size={size}
			data-variant={variant}
			type={type ?? "button"}
			className={cn(
				selectTriggerVariants({ size, variant }),
				"min-w-none",
				className,
			)}
			{...props}
		>
			<span className="flex-1 truncate in-data-placeholder:text-muted-foreground/72">
				{children}
			</span>
			{variant === "ghost" ? (
				<ChevronDownIcon className="size-3 opacity-50" />
			) : (
				<ChevronsUpDownIcon className={selectTriggerIconClassName} />
			)}
		</button>
	);
}

function SelectTrigger({
	className,
	size = "default",
	variant = "default",
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
	size?: VariantProps<typeof selectTriggerVariants>["size"];
	variant?: VariantProps<typeof selectTriggerVariants>["variant"];
}) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			data-size={size}
			data-variant={variant}
			className={cn(
				selectTriggerVariants({ size, variant }),
				"whitespace-nowrap data-placeholder:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5",
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon asChild>
				<ChevronDownIcon
					data-slot="select-icon"
					className="pointer-events-none size-3 opacity-50"
				/>
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({
	className,
	children,
	position = "item-aligned",
	align = "center",
	...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				data-slot="select-content"
				data-align-trigger={position === "item-aligned"}
				className={cn(
					"relative z-50 max-h-(--radix-select-content-available-height) min-w-36 origin-(--radix-select-content-transform-origin) overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg/5 outline-none not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
					position === "popper" &&
						"min-w-(--radix-select-trigger-width) data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
					className,
				)}
				position={position}
				align={align}
				{...props}
			>
				<SelectScrollUpButton />
				<SelectPrimitive.Viewport
					data-position={position}
					data-slot="select-list"
					className={cn(
						"relative max-h-(--radix-select-content-available-height) overflow-y-auto p-1",
						"data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)",
					)}
				>
					{children}
				</SelectPrimitive.Viewport>
				<SelectScrollDownButton />
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}

function SelectLabel({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
	return (
		<SelectPrimitive.Label
			data-slot="select-label"
			className={cn(
				"px-2 py-1.5 font-medium text-muted-foreground text-xs",
				className,
			)}
			{...props}
		/>
	);
}

function SelectGroupLabel({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
	return (
		<SelectPrimitive.Label
			data-slot="select-group-label"
			className={cn(
				"px-2 py-1.5 font-medium text-muted-foreground text-xs",
				className,
			)}
			{...props}
		/>
	);
}

function SelectItem({
	className,
	children,
	hideIndicator = false,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & {
	hideIndicator?: boolean;
}) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				"grid min-h-8 cursor-default items-center gap-2 rounded-sm py-1 text-base outline-none select-none in-data-[side=none]:min-w-[calc(var(--radix-select-trigger-width)+1.25rem)] data-disabled:pointer-events-none data-disabled:opacity-64 data-highlighted:bg-accent data-highlighted:text-accent-foreground sm:min-h-7 sm:text-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
				hideIndicator
					? "grid-cols-[1fr] ps-3 pe-3"
					: "grid-cols-[1rem_1fr] ps-2 pe-4",
				className,
			)}
			{...props}
		>
			{hideIndicator ? null : (
				<SelectPrimitive.ItemIndicator
					data-slot="select-item-indicator"
					className="col-start-1"
				>
					<CheckIcon className="pointer-events-none" />
				</SelectPrimitive.ItemIndicator>
			)}
			<SelectPrimitive.ItemText
				data-slot="select-item-text"
				className={cn("min-w-0", hideIndicator ? "col-start-1" : "col-start-2")}
			>
				{children}
			</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	);
}

function SelectSeparator({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
	return (
		<SelectPrimitive.Separator
			data-slot="select-separator"
			className={cn("pointer-events-none mx-2 my-1 h-px bg-border", className)}
			{...props}
		/>
	);
}

function SelectScrollUpButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
	return (
		<SelectPrimitive.ScrollUpButton
			data-slot="select-scroll-up-button"
			className={cn(
				"top-0 z-50 flex h-6 w-full cursor-default items-center justify-center bg-popover before:pointer-events-none before:absolute before:inset-x-px before:top-px before:h-[200%] before:rounded-t-[calc(var(--radius-lg)-1px)] before:bg-linear-to-b before:from-50% before:from-popover [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			<ChevronUpIcon className="relative" />
		</SelectPrimitive.ScrollUpButton>
	);
}

function SelectScrollDownButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
	return (
		<SelectPrimitive.ScrollDownButton
			data-slot="select-scroll-down-button"
			className={cn(
				"bottom-0 z-50 flex h-6 w-full cursor-default items-center justify-center bg-popover before:pointer-events-none before:absolute before:inset-x-px before:bottom-px before:h-[200%] before:rounded-b-[calc(var(--radius-lg)-1px)] before:bg-linear-to-t before:from-50% before:from-popover [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			<ChevronDownIcon className="relative" />
		</SelectPrimitive.ScrollDownButton>
	);
}

export {
	Select,
	SelectButton,
	SelectContent,
	SelectGroup,
	SelectGroupLabel,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
	selectTriggerVariants,
};
