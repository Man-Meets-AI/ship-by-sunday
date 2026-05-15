"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Label({
	className,
	...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
	return (
		<LabelPrimitive.Root
			data-slot="label"
			className={cn(
				"inline-flex items-center gap-2 text-base/4.5 font-medium text-foreground sm:text-sm/4",
				className,
			)}
			{...props}
		/>
	);
}

export { Label };
