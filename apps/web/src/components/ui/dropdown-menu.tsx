"use client";

import * as React from "react";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

type DropdownMenuContentProps = React.ComponentProps<
	typeof DropdownMenuPrimitive.Content
>;

type DropdownMenuItemProps = React.ComponentProps<
	typeof DropdownMenuPrimitive.Item
> & {
	inset?: boolean;
	variant?: "default" | "destructive";
};

type DropdownMenuCheckboxItemProps = React.ComponentProps<
	typeof DropdownMenuPrimitive.CheckboxItem
> & {
	inset?: boolean;
	variant?: "default" | "switch";
};

type DropdownMenuRadioItemProps = React.ComponentProps<
	typeof DropdownMenuPrimitive.RadioItem
> & {
	inset?: boolean;
};

type DropdownMenuLabelProps = React.ComponentProps<
	typeof DropdownMenuPrimitive.Label
> & {
	inset?: boolean;
};

type DropdownMenuSubTriggerProps = React.ComponentProps<
	typeof DropdownMenuPrimitive.SubTrigger
> & {
	inset?: boolean;
};

function DropdownMenu({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
	return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
	return (
		<DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
	);
}

function DropdownMenuTrigger({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
	return (
		<DropdownMenuPrimitive.Trigger
			data-slot="dropdown-menu-trigger"
			{...props}
		/>
	);
}

function DropdownMenuContent({
	className,
	children,
	align = "start",
	sideOffset = 4,
	...props
}: DropdownMenuContentProps) {
	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				data-slot="dropdown-menu-content"
				sideOffset={sideOffset}
				align={align}
				className={cn(
					"relative z-50 flex max-h-(--radix-dropdown-menu-content-available-height) min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) rounded-lg border bg-popover text-popover-foreground shadow-lg/5 outline-none transition-[scale,opacity] not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
					className,
				)}
				{...props}
			>
				<div
					data-slot="menu-viewport"
					className="relative max-h-(--radix-dropdown-menu-content-available-height) w-full overflow-y-auto p-1"
				>
					{children}
				</div>
			</DropdownMenuPrimitive.Content>
		</DropdownMenuPrimitive.Portal>
	);
}

function DropdownMenuGroup({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
	return (
		<DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
	);
}

function DropdownMenuItem({
	className,
	inset,
	variant = "default",
	...props
}: DropdownMenuItemProps) {
	return (
		<DropdownMenuPrimitive.Item
			data-slot="dropdown-menu-item"
			data-inset={inset}
			data-variant={variant}
			className={cn(
				"[&>svg]:-mx-0.5 flex min-h-8 cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-base text-foreground outline-none focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:ps-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-64 sm:min-h-7 sm:text-sm [&>svg:not([class*='opacity-'])]:opacity-80 [&>svg:not([class*='size-'])]:size-4.5 sm:[&>svg:not([class*='size-'])]:size-4 [&>svg]:pointer-events-none [&>svg]:shrink-0",
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuCheckboxItem({
	className,
	children,
	checked,
	inset,
	variant = "default",
	...props
}: DropdownMenuCheckboxItemProps) {
	if (variant === "switch") {
		return (
			<DropdownMenuPrimitive.CheckboxItem
				data-slot="dropdown-menu-checkbox-item"
				data-inset={inset}
				className={cn(
					"grid min-h-8 cursor-default grid-cols-[1fr_auto] items-center gap-4 rounded-sm py-1 ps-2 pe-1.5 text-base text-foreground outline-none focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-64 sm:min-h-7 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
					className,
				)}
				checked={checked}
				{...props}
			>
				<span className="col-start-1">{children}</span>
				<span
					data-slot="dropdown-menu-checkbox-item-indicator"
					data-state={checked ? "checked" : "unchecked"}
					className="inline-flex h-[calc(var(--thumb-size)+2px)] w-[calc(var(--thumb-size)*2-2px)] shrink-0 items-center rounded-full p-px outline-none transition-[background-color,box-shadow] duration-200 [--thumb-size:--spacing(4)] data-[state=checked]:bg-primary data-[state=unchecked]:bg-input sm:[--thumb-size:--spacing(3)]"
				>
					<span
						data-state={checked ? "checked" : "unchecked"}
						className="pointer-events-none block aspect-square h-full origin-left rounded-(--thumb-size) bg-background shadow-sm/5 transition-[translate,border-radius,scale,transform-origin] data-[state=checked]:translate-x-[calc(var(--thumb-size)-4px)]"
					/>
				</span>
			</DropdownMenuPrimitive.CheckboxItem>
		);
	}

	return (
		<DropdownMenuPrimitive.CheckboxItem
			data-slot="dropdown-menu-checkbox-item"
			data-inset={inset}
			className={cn(
				"grid min-h-8 cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-sm py-1 ps-2 pe-4 text-base text-foreground outline-none focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:ps-8 data-disabled:pointer-events-none data-disabled:opacity-64 sm:min-h-7 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			checked={checked}
			{...props}
		>
			<DropdownMenuPrimitive.ItemIndicator
				className="col-start-1"
				data-slot="dropdown-menu-checkbox-item-indicator"
			>
				<CheckIcon />
			</DropdownMenuPrimitive.ItemIndicator>
			<span className="col-start-2">{children}</span>
		</DropdownMenuPrimitive.CheckboxItem>
	);
}

function DropdownMenuRadioGroup({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
	return (
		<DropdownMenuPrimitive.RadioGroup
			data-slot="dropdown-menu-radio-group"
			{...props}
		/>
	);
}

function DropdownMenuRadioItem({
	className,
	children,
	inset,
	...props
}: DropdownMenuRadioItemProps) {
	return (
		<DropdownMenuPrimitive.RadioItem
			data-slot="dropdown-menu-radio-item"
			data-inset={inset}
			className={cn(
				"grid min-h-8 cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-sm py-1 ps-2 pe-4 text-base text-foreground outline-none focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:ps-8 data-disabled:pointer-events-none data-disabled:opacity-64 sm:min-h-7 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			{...props}
		>
			<DropdownMenuPrimitive.ItemIndicator
				className="col-start-1"
				data-slot="dropdown-menu-radio-item-indicator"
			>
				<CheckIcon />
			</DropdownMenuPrimitive.ItemIndicator>
			<span className="col-start-2">{children}</span>
		</DropdownMenuPrimitive.RadioItem>
	);
}

function DropdownMenuLabel({
	className,
	inset,
	...props
}: DropdownMenuLabelProps) {
	return (
		<DropdownMenuPrimitive.Label
			data-slot="dropdown-menu-label"
			data-inset={inset}
			className={cn(
				"px-2 py-1.5 font-medium text-muted-foreground text-xs data-inset:ps-9 sm:data-inset:ps-8",
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuSeparator({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
	return (
		<DropdownMenuPrimitive.Separator
			data-slot="dropdown-menu-separator"
			className={cn("mx-2 my-1 h-px bg-border", className)}
			{...props}
		/>
	);
}

function DropdownMenuShortcut({
	className,
	...props
}: React.ComponentProps<"kbd">) {
	return (
		<kbd
			data-slot="dropdown-menu-shortcut"
			className={cn(
				"ms-auto font-medium font-sans text-muted-foreground/72 text-xs tracking-widest",
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuSub({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
	return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
	className,
	inset,
	children,
	...props
}: DropdownMenuSubTriggerProps) {
	return (
		<DropdownMenuPrimitive.SubTrigger
			data-slot="dropdown-menu-sub-trigger"
			data-inset={inset}
			className={cn(
				"flex min-h-8 cursor-default items-center gap-2 rounded-sm px-2 py-1 text-base text-foreground outline-none focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-inset:ps-8 data-disabled:pointer-events-none data-disabled:opacity-64 sm:min-h-7 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
				className,
			)}
			{...props}
		>
			{children}
			<ChevronRightIcon className="-me-0.5 ms-auto opacity-80" />
		</DropdownMenuPrimitive.SubTrigger>
	);
}

function DropdownMenuSubContent({
	className,
	children,
	sideOffset = 0,
	alignOffset,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
	return (
		<DropdownMenuPrimitive.SubContent
			data-slot="dropdown-menu-sub-content"
			sideOffset={sideOffset}
			alignOffset={alignOffset ?? -5}
			className={cn(
				"relative z-50 flex min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) rounded-lg border bg-popover text-popover-foreground shadow-lg/5 outline-none transition-[scale,opacity] not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
				className,
			)}
			{...props}
		>
			<div
				data-slot="menu-viewport"
				className="relative max-h-(--radix-dropdown-menu-content-available-height) w-full overflow-y-auto p-1"
			>
				{children}
			</div>
		</DropdownMenuPrimitive.SubContent>
	);
}

export {
	DropdownMenu,
	DropdownMenu as Menu,
	DropdownMenuPortal,
	DropdownMenuPortal as MenuPortal,
	DropdownMenuTrigger,
	DropdownMenuTrigger as MenuTrigger,
	DropdownMenuContent,
	DropdownMenuContent as MenuPopup,
	DropdownMenuGroup,
	DropdownMenuGroup as MenuGroup,
	DropdownMenuLabel,
	DropdownMenuLabel as MenuGroupLabel,
	DropdownMenuItem,
	DropdownMenuItem as MenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuCheckboxItem as MenuCheckboxItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioGroup as MenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuRadioItem as MenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSeparator as MenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuShortcut as MenuShortcut,
	DropdownMenuSub,
	DropdownMenuSub as MenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubTrigger as MenuSubTrigger,
	DropdownMenuSubContent,
	DropdownMenuSubContent as MenuSubPopup,
};
