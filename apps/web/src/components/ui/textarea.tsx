import * as React from "react";

import { cn } from "@/lib/utils";

type TextareaProps = Omit<React.ComponentProps<"textarea">, "className"> & {
	className?: string;
	controlClassName?: string;
	size?: "sm" | "default" | "lg" | number;
	textareaClassName?: string;
	unstyled?: boolean;
};

function Textarea({
	className,
	controlClassName,
	size = "default",
	textareaClassName,
	unstyled = false,
	...props
}: TextareaProps) {
	return (
		<span
			data-size={size}
			data-slot="textarea-control"
			className={
				cn(
					!unstyled &&
						"relative inline-flex w-full rounded-lg border border-input bg-background text-base text-foreground shadow-xs/5 ring-ring/24 transition-shadow not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:has-aria-invalid:border-destructive/64 has-focus-visible:has-aria-invalid:ring-destructive/16 has-aria-invalid:border-destructive/36 has-[:disabled,:focus-visible,[aria-invalid]]:shadow-none has-disabled:opacity-64 not-has-disabled:has-not-focus-visible:not-has-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] sm:text-sm dark:bg-input/32 dark:has-aria-invalid:ring-destructive/24 dark:not-has-disabled:has-not-focus-visible:not-has-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]",
					className,
					controlClassName,
				) || undefined
			}
		>
			<textarea
				data-slot="textarea"
				className={cn(
					"field-sizing-content min-h-17.5 w-full rounded-[inherit] px-[calc(--spacing(3)-1px)] py-[calc(--spacing(1.5)-1px)] outline-none max-sm:min-h-20.5",
					size === "sm" &&
						"min-h-16.5 px-[calc(--spacing(2.5)-1px)] py-[calc(--spacing(1)-1px)] max-sm:min-h-19.5",
					size === "lg" &&
						"min-h-18.5 py-[calc(--spacing(2)-1px)] max-sm:min-h-21.5",
					textareaClassName,
				)}
				{...props}
			/>
		</span>
	);
}

export { Textarea, type TextareaProps };
