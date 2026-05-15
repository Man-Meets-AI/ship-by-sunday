import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = Omit<React.ComponentProps<"input">, "className" | "size"> & {
	className?: string;
	controlClassName?: string;
	inputClassName?: string;
	size?: "sm" | "default" | "lg" | number;
	unstyled?: boolean;
};

function Input({
	className,
	controlClassName,
	inputClassName,
	size = "default",
	type,
	unstyled = false,
	...props
}: InputProps) {
	return (
		<span
			data-size={size}
			data-slot="input-control"
			className={
				cn(
					!unstyled &&
						"relative inline-flex w-full rounded-lg border border-input bg-background text-base text-foreground shadow-xs/5 ring-ring/24 transition-shadow not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] has-autofill:bg-foreground/4 has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:has-aria-invalid:border-destructive/64 has-focus-visible:has-aria-invalid:ring-destructive/16 has-aria-invalid:border-destructive/36 has-[:disabled,:focus-visible,[aria-invalid]]:shadow-none has-disabled:opacity-64 not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] sm:text-sm dark:bg-input/32 dark:has-autofill:bg-foreground/8 dark:has-aria-invalid:ring-destructive/24 dark:not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]",
					className,
					controlClassName,
				) || undefined
			}
		>
			<input
				type={type}
				data-slot="input"
				size={typeof size === "number" ? size : undefined}
				className={cn(
					"h-8.5 w-full min-w-0 rounded-[inherit] px-[calc(--spacing(3)-1px)] leading-8.5 outline-none [transition:background-color_5000000s_ease-in-out_0s] placeholder:text-muted-foreground/72 sm:h-7.5 sm:leading-7.5",
					size === "sm" &&
						"h-7.5 px-[calc(--spacing(2.5)-1px)] leading-7.5 sm:h-6.5 sm:leading-6.5",
					size === "lg" && "h-9.5 leading-9.5 sm:h-8.5 sm:leading-8.5",
					type === "search" &&
						"[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
					type === "file" &&
						"text-muted-foreground file:me-3 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
					inputClassName,
				)}
				{...props}
			/>
		</span>
	);
}

export { Input, type InputProps };
