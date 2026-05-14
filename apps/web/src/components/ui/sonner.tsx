"use client";

import type { CSSProperties } from "react";
import { useTheme } from "next-themes";
import {
	CheckIcon,
	CircleAlertIcon,
	CircleCheckIcon,
	InfoIcon,
	LoaderCircleIcon,
	TriangleAlertIcon,
	XIcon,
} from "lucide-react";
import {
	Toaster as Sonner,
	type ToastClassnames,
	type ToasterProps,
} from "sonner";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const toastRootClassName = cn(
	"relative overflow-visible rounded-lg border bg-popover text-popover-foreground shadow-lg/5 not-dark:bg-clip-padding",
	"before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)]",
	"dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
);

const toastContentClassName = "min-w-0 gap-0.5 text-sm";

const toastTitleClassName = "min-w-0 wrap-break-word font-medium";

const toastDescriptionClassName =
	"min-w-0 wrap-break-word text-muted-foreground";

const toastIconClassName =
	"flex h-lh w-4 shrink-0 items-center justify-center [&_svg]:size-4 [&_svg]:shrink-0";

const toastCloseButtonClassName = cn(
	"absolute z-20 -top-1.5 -right-1.5 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/60 bg-popover/92 text-muted-foreground shadow-sm outline-none backdrop-blur-sm",
	"transition-[color,background-color,box-shadow] hover:bg-popover hover:text-foreground",
	"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
);

const toastActionButtonClassName = cn(
	buttonVariants({ size: "xs", variant: "default" }),
	"shrink-0",
);

const toastCancelButtonClassName = cn(
	buttonVariants({ size: "xs", variant: "outline" }),
	"shrink-0",
);

const toastLoaderClassName =
	"[&_.sonner-loader]:size-4 [&_svg]:size-4 [&_svg]:animate-spin [&_svg]:opacity-80";

const toastClassNames = {
	actionButton: toastActionButtonClassName,
	cancelButton: toastCancelButtonClassName,
	closeButton: toastCloseButtonClassName,
	content: toastContentClassName,
	default: toastRootClassName,
	description: toastDescriptionClassName,
	error: "[&_[data-icon]]:text-destructive",
	icon: toastIconClassName,
	info: "[&_[data-icon]]:text-info",
	loader: toastLoaderClassName,
	loading: "[&_[data-icon]]:opacity-80",
	success: "[&_[data-icon]]:text-success",
	title: toastTitleClassName,
	toast: toastRootClassName,
	warning: "[&_[data-icon]]:text-warning",
} satisfies ToastClassnames;

const toastStyle = {
	"--normal-bg": "var(--popover)",
	"--normal-text": "var(--popover-foreground)",
	"--normal-border": "var(--border)",
	"--border-radius": "var(--radius-lg)",
} as CSSProperties;

const toastIcons = {
	close: <XIcon className="size-3" strokeWidth={2.25} />,
	error: <CircleAlertIcon className="size-4" />,
	info: <InfoIcon className="size-4" />,
	loading: <LoaderCircleIcon className="size-4 animate-spin" />,
	success: <CircleCheckIcon className="size-4" />,
	warning: <TriangleAlertIcon className="size-4" />,
};

const richToastIcons = {
	...toastIcons,
	success: <CheckIcon className="size-4" />,
};

const Toaster = ({
	className,
	closeButton = true,
	icons,
	position = "bottom-right",
	style,
	toastOptions,
	...props
}: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			position={position}
			closeButton={closeButton}
			className={cn("toaster group", className)}
			icons={{
				...toastIcons,
				...icons,
			}}
			style={{
				...toastStyle,
				...style,
			}}
			toastOptions={{
				...toastOptions,
				className: cn("cn-toast", toastOptions?.className),
				classNames: {
					...toastClassNames,
					...toastOptions?.classNames,
				},
			}}
			{...props}
		/>
	);
};

export {
	Toaster,
	richToastIcons,
	toastActionButtonClassName,
	toastCancelButtonClassName,
	toastClassNames,
	toastCloseButtonClassName,
	toastContentClassName,
	toastDescriptionClassName,
	toastIconClassName,
	toastRootClassName,
	toastStyle,
	toastTitleClassName,
};
