"use client";

import { Collapsible as CollapsiblePrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Collapsible({
	...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
	return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
	className,
	...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
	return (
		<CollapsiblePrimitive.CollapsibleTrigger
			data-slot="collapsible-trigger"
			className={cn("cursor-pointer", className)}
			{...props}
		/>
	);
}

function CollapsiblePanel({
	className,
	...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
	return (
		<CollapsiblePrimitive.CollapsibleContent
			data-slot="collapsible-panel"
			className={cn(
				"overflow-hidden transition-[height] duration-200 data-[state=closed]:h-0 data-[state=open]:h-(--radix-collapsible-content-height)",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Collapsible,
	CollapsibleTrigger,
	CollapsiblePanel,
	CollapsiblePanel as CollapsibleContent,
};
