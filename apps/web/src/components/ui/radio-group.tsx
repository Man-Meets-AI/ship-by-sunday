"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function RadioGroup({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
	return (
		<RadioGroupPrimitive.Root
			data-slot="radio-group"
			className={cn("flex flex-col gap-3", className)}
			{...props}
		/>
	);
}

function Radio({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
	return (
		<RadioGroupPrimitive.Item
			data-slot="radio"
			className={cn(
				"relative inline-flex size-4.5 shrink-0 items-center justify-center rounded-full border border-input bg-background shadow-xs/5 ring-ring transition-shadow outline-none not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-full not-data-disabled:not-data-checked:not-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:aria-invalid:border-destructive/64 focus-visible:aria-invalid:ring-destructive/48 aria-invalid:border-destructive/36 data-disabled:opacity-64 data-disabled:shadow-none data-checked:shadow-none aria-invalid:shadow-none sm:size-4 dark:not-data-checked:bg-input/32 dark:aria-invalid:ring-destructive/24 dark:not-data-disabled:not-data-checked:not-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]",
				className,
			)}
			{...props}
		>
			<RadioGroupPrimitive.Indicator
				data-slot="radio-indicator"
				className="-inset-px absolute flex size-4.5 items-center justify-center rounded-full before:size-2 before:rounded-full before:bg-primary-foreground data-checked:bg-primary data-unchecked:hidden sm:size-4 sm:before:size-1.5"
			/>
		</RadioGroupPrimitive.Item>
	);
}

export { RadioGroup, Radio, Radio as RadioGroupItem };
