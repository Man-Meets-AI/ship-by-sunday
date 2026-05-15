"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";
import { Dialog as CommandDialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Command({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive>) {
	return (
		<CommandPrimitive
			data-slot="command"
			className={cn("flex h-full w-full flex-col overflow-hidden", className)}
			{...props}
		/>
	);
}

function CommandDialog({
	...props
}: React.ComponentProps<typeof CommandDialogPrimitive.Root>) {
	return <CommandDialogPrimitive.Root data-slot="command-dialog" {...props} />;
}

function CommandDialogPortal({
	...props
}: React.ComponentProps<typeof CommandDialogPrimitive.Portal>) {
	return (
		<CommandDialogPrimitive.Portal
			data-slot="command-dialog-portal"
			{...props}
		/>
	);
}

function CommandDialogTrigger({
	...props
}: React.ComponentProps<typeof CommandDialogPrimitive.Trigger>) {
	return (
		<CommandDialogPrimitive.Trigger
			data-slot="command-dialog-trigger"
			{...props}
		/>
	);
}

function CommandDialogTitle({
	className,
	...props
}: React.ComponentProps<typeof CommandDialogPrimitive.Title>) {
	return (
		<CommandDialogPrimitive.Title
			data-slot="command-dialog-title"
			className={cn(
				"font-heading font-semibold text-xl leading-none",
				className,
			)}
			{...props}
		/>
	);
}

function CommandDialogDescription({
	className,
	...props
}: React.ComponentProps<typeof CommandDialogPrimitive.Description>) {
	return (
		<CommandDialogPrimitive.Description
			data-slot="command-dialog-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

function CommandDialogBackdrop({
	className,
	...props
}: React.ComponentProps<typeof CommandDialogPrimitive.Overlay>) {
	return (
		<CommandDialogPrimitive.Overlay
			data-slot="command-dialog-backdrop"
			className={cn(
				"fixed inset-0 z-50 bg-background/60 transition-all duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-ending-style:opacity-0 data-starting-style:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

function CommandDialogViewport({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="command-dialog-viewport"
			className={cn(
				"pointer-events-none fixed inset-0 z-50 flex flex-col items-center px-4 py-[max(--spacing(4),4vh)] sm:py-[10vh]",
				className,
			)}
			{...props}
		/>
	);
}

function CommandDialogPopup({
	className,
	children,
	forceMount,
	onBackdropPointerDown,
	...props
}: React.ComponentProps<typeof CommandDialogPrimitive.Content> & {
	onBackdropPointerDown?: React.PointerEventHandler<HTMLDivElement>;
}) {
	return (
		<CommandDialogPortal forceMount={forceMount}>
			<CommandDialogBackdrop onPointerDown={onBackdropPointerDown} />
			<CommandDialogViewport>
				<CommandDialogPrimitive.Content
					forceMount={forceMount}
					data-slot="command-dialog-popup"
					className={cn(
						"pointer-events-auto -translate-y-[calc(1.25rem*var(--nested-dialogs))] relative row-start-2 flex max-h-105 min-h-0 w-full min-w-0 max-w-xl scale-[calc(1-0.1*var(--nested-dialogs))] flex-col rounded-2xl border bg-popover text-popover-foreground opacity-[calc(1-0.1*var(--nested-dialogs))] shadow-lg/5 outline-none transition-[scale,opacity,translate] duration-200 ease-in-out will-change-transform not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:bg-muted/72 before:shadow-[0_1px_--theme(--color-black/4%)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-nested:data-ending-style:translate-y-8 data-nested:data-starting-style:translate-y-8 data-nested-dialog-open:origin-top data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0 **:data-[slot=scroll-area-viewport]:data-has-overflow-y:pe-1 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
						className,
					)}
					{...props}
				>
					{children}
				</CommandDialogPrimitive.Content>
			</CommandDialogViewport>
		</CommandDialogPortal>
	);
}

function CommandInput({
	className,
	wrapperClassName,
	placeholder,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & {
	wrapperClassName?: string | undefined;
}) {
	return (
		<div
			data-slot="command-input-wrapper"
			className={cn("px-2.5 py-1.5", wrapperClassName)}
		>
			<div className="relative flex items-center gap-2">
				<SearchIcon
					className="ms-2 size-4 shrink-0 text-muted-foreground"
					aria-hidden
				/>
				<CommandPrimitive.Input
					data-slot="command-input"
					className={cn(
						"h-10 min-w-0 flex-1 border-transparent bg-transparent px-0 text-base text-foreground outline-none placeholder:text-muted-foreground shadow-none focus:ring-0 sm:text-sm",
						className,
					)}
					placeholder={placeholder}
					{...props}
				/>
			</div>
		</div>
	);
}

function CommandList({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
	return (
		<CommandPrimitive.List
			data-slot="command-list"
			className={cn(
				"max-h-72 overflow-y-auto not-empty:scroll-py-2 not-empty:p-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:text-xs",
				className,
			)}
			{...props}
		/>
	);
}

function CommandEmpty({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
	return (
		<CommandPrimitive.Empty
			data-slot="command-empty"
			className={cn(
				"not-empty:py-6 text-center text-muted-foreground text-sm",
				className,
			)}
			{...props}
		/>
	);
}

function CommandPanel({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="command-panel"
			className={cn(
				"-mx-px not-has-[+[data-slot=command-footer]]:-mb-px relative min-h-0 overflow-hidden rounded-t-xl not-has-[+[data-slot=command-footer]]:rounded-b-2xl border border-b-0 bg-popover bg-clip-padding shadow-xs/5 [clip-path:inset(0_1px)] not-has-[+[data-slot=command-footer]]:[clip-path:inset(0_1px_1px_1px_round_0_0_calc(var(--radius-2xl)-1px)_calc(var(--radius-2xl)-1px))] before:pointer-events-none before:absolute before:inset-0 before:rounded-t-[calc(var(--radius-xl)-1px)] **:data-[slot=scroll-area-scrollbar]:mt-2 [touch-action:pan-y]",
				className,
			)}
			{...props}
		/>
	);
}

function CommandGroup({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
	return (
		<CommandPrimitive.Group
			data-slot="command-group"
			className={cn("overflow-hidden p-1 text-foreground", className)}
			{...props}
		/>
	);
}

function CommandGroupLabel({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="command-group-label"
			className={cn(
				"px-2 py-1.5 font-medium text-muted-foreground text-xs",
				className,
			)}
			{...props}
		/>
	);
}

function CommandCollection({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
	return (
		<CommandPrimitive.List
			data-slot="command-collection"
			className={className}
			{...props}
		/>
	);
}

function CommandItem({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
	return (
		<CommandPrimitive.Item
			data-slot="command-item"
			className={cn(
				"flex min-h-8 min-w-0 cursor-default select-none items-start gap-2 rounded-sm px-2 py-1.5 text-base text-foreground outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-64 sm:min-h-7 sm:text-sm [&_svg]:mt-0.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		/>
	);
}

function CommandSeparator({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
	return (
		<CommandPrimitive.Separator
			data-slot="command-separator"
			className={cn("my-2 h-px bg-border", className)}
			{...props}
		/>
	);
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"kbd">) {
	return (
		<kbd
			data-slot="command-shortcut"
			className={cn(
				"ms-auto font-medium font-sans text-muted-foreground/72 text-xs tracking-widest",
				className,
			)}
			{...props}
		/>
	);
}

function CommandFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="command-footer"
			className={cn(
				"flex items-center justify-between gap-2 rounded-b-[calc(var(--radius-2xl)-1px)] border-t px-5 py-3 text-muted-foreground text-xs",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Command,
	CommandCollection,
	CommandDialog,
	CommandDialogBackdrop,
	CommandDialogDescription,
	CommandDialogPopup,
	CommandDialogPortal,
	CommandDialogTitle,
	CommandDialogTrigger,
	CommandDialogViewport,
	CommandEmpty,
	CommandFooter,
	CommandGroup,
	CommandGroupLabel,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPanel,
	CommandSeparator,
	CommandShortcut,
};
