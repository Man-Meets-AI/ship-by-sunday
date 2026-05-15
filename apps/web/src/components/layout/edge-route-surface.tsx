import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const edgeRoutePanelClassName =
	"relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xs/5 not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]";

export function EdgeRoutePage({ className, ...props }: ComponentProps<"main">) {
	return (
		<main
			data-slot="edge-route-page"
			className={cn(
				"min-h-dvh bg-background text-foreground tracking-normal",
				className,
			)}
			{...props}
		/>
	);
}

export function EdgeRouteContainer({
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			data-slot="edge-route-container"
			className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}
			{...props}
		/>
	);
}

export function EdgeRouteHeader({
	actions,
	actionsClassName,
	children,
	className,
	...props
}: ComponentProps<"header"> & {
	actions?: ReactNode;
	actionsClassName?: string;
}) {
	return (
		<header
			data-slot="edge-route-header"
			className={cn(
				"grid gap-4 border-b border-border/60 pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end",
				className,
			)}
			{...props}
		>
			<div className="min-w-0">{children}</div>
			{actions ? (
				<div
					data-slot="edge-route-header-actions"
					className={cn("min-w-0 lg:justify-self-end", actionsClassName)}
				>
					{actions}
				</div>
			) : null}
		</header>
	);
}

export function EdgeRouteEyebrow({ className, ...props }: ComponentProps<"p">) {
	return (
		<p
			data-slot="edge-route-eyebrow"
			className={cn(
				"text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function EdgeRouteTitle({
	as: Title = "h1",
	className,
	...props
}: ComponentProps<"h1"> & {
	as?: "h1" | "h2";
}) {
	return (
		<Title
			data-slot="edge-route-title"
			className={cn(
				"mt-2 text-2xl font-semibold leading-tight text-foreground sm:text-3xl",
				className,
			)}
			{...props}
		/>
	);
}

export function EdgeRouteDescription({
	className,
	...props
}: ComponentProps<"p">) {
	return (
		<p
			data-slot="edge-route-description"
			className={cn(
				"mt-2 max-w-3xl text-sm leading-6 text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function EdgeRoutePanel({
	className,
	...props
}: ComponentProps<"section">) {
	return (
		<section
			data-slot="edge-route-panel"
			className={cn(edgeRoutePanelClassName, className)}
			{...props}
		/>
	);
}

export function EdgeRoutePanelHeader({
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			data-slot="edge-route-panel-header"
			className={cn(
				"relative flex flex-col gap-1.5 border-b border-border/60 px-4 py-3.5 sm:px-5",
				className,
			)}
			{...props}
		/>
	);
}

export function EdgeRoutePanelTitle({
	as: Title = "h2",
	className,
	...props
}: ComponentProps<"h2"> & {
	as?: "h2" | "h3" | "h4";
}) {
	return (
		<Title
			data-slot="edge-route-panel-title"
			className={cn("text-sm font-semibold text-foreground", className)}
			{...props}
		/>
	);
}

export function EdgeRoutePanelDescription({
	className,
	...props
}: ComponentProps<"p">) {
	return (
		<p
			data-slot="edge-route-panel-description"
			className={cn("text-sm leading-6 text-muted-foreground", className)}
			{...props}
		/>
	);
}

export function EdgeRoutePanelBody({
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			data-slot="edge-route-panel-body"
			className={cn("relative p-4 sm:p-5", className)}
			{...props}
		/>
	);
}

export function EdgeRoutePanelFooter({
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			data-slot="edge-route-panel-footer"
			className={cn(
				"relative flex flex-wrap items-center gap-3 border-t border-border/60 px-4 py-3.5 sm:px-5",
				className,
			)}
			{...props}
		/>
	);
}

export function EdgeRouteActionRow({
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			data-slot="edge-route-action-row"
			className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap", className)}
			{...props}
		/>
	);
}

export function EdgeRouteStatusList({
	className,
	...props
}: ComponentProps<"ul">) {
	return (
		<ul
			data-slot="edge-route-status-list"
			className={cn("grid gap-2.5", className)}
			{...props}
		/>
	);
}

export function EdgeRouteStatusItem({
	className,
	...props
}: ComponentProps<"li">) {
	return (
		<li
			data-slot="edge-route-status-item"
			className={cn(
				"grid grid-cols-[1rem_minmax(0,1fr)] gap-2.5 text-sm leading-6 text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}
