import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const publicRoutePanelClassName =
	"relative overflow-hidden rounded-lg border border-border/70 bg-card text-card-foreground shadow-xs/5";

export function PublicRoutePage({
	className,
	...props
}: ComponentProps<"main">) {
	return (
		<main
			data-slot="public-route-page"
			className={cn("min-h-screen bg-background text-foreground", className)}
			{...props}
		/>
	);
}

export function PublicRouteSection({
	className,
	tone = "default",
	...props
}: ComponentProps<"section"> & {
	tone?: "default" | "muted";
}) {
	return (
		<section
			data-slot="public-route-section"
			className={cn(
				"border-b border-border/60",
				tone === "muted" ? "bg-muted/20" : null,
				className,
			)}
			{...props}
		/>
	);
}

export function PublicRouteContainer({
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			data-slot="public-route-container"
			className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
			{...props}
		/>
	);
}

export function PublicRouteHeader({
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			data-slot="public-route-header"
			className={cn("max-w-3xl", className)}
			{...props}
		/>
	);
}

export function PublicRouteEyebrow({
	className,
	...props
}: ComponentProps<"p">) {
	return (
		<p
			data-slot="public-route-eyebrow"
			className={cn(
				"text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function PublicRouteTitle({
	className,
	...props
}: ComponentProps<"h1">) {
	return (
		<h1
			data-slot="public-route-title"
			className={cn(
				"mt-3 text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl",
				className,
			)}
			{...props}
		/>
	);
}

export function PublicRouteSectionTitle({
	className,
	...props
}: ComponentProps<"h2">) {
	return (
		<h2
			data-slot="public-route-section-title"
			className={cn(
				"mt-3 text-2xl font-semibold leading-tight text-foreground sm:text-3xl",
				className,
			)}
			{...props}
		/>
	);
}

export function PublicRouteDescription({
	className,
	...props
}: ComponentProps<"p">) {
	return (
		<p
			data-slot="public-route-description"
			className={cn(
				"mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg",
				className,
			)}
			{...props}
		/>
	);
}

export function PublicRoutePanel({
	className,
	...props
}: ComponentProps<"section">) {
	return (
		<section
			data-slot="public-route-panel"
			className={cn(publicRoutePanelClassName, className)}
			{...props}
		/>
	);
}

export function PublicRouteIcon({
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			data-slot="public-route-icon"
			className={cn(
				"flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function PublicRoutePanelTitle({
	as: Title = "h2",
	className,
	...props
}: ComponentProps<"h2"> & {
	as?: "h2" | "h3" | "h4";
}) {
	return (
		<Title
			data-slot="public-route-panel-title"
			className={cn("text-base font-semibold text-foreground", className)}
			{...props}
		/>
	);
}

export function PublicRoutePanelDescription({
	className,
	...props
}: ComponentProps<"p">) {
	return (
		<p
			data-slot="public-route-panel-description"
			className={cn("mt-2 text-sm leading-6 text-muted-foreground", className)}
			{...props}
		/>
	);
}

export function PublicRoutePanelBody({
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			data-slot="public-route-panel-body"
			className={cn("p-5", className)}
			{...props}
		/>
	);
}

export function PublicRouteListItem({
	className,
	...props
}: ComponentProps<"li">) {
	return (
		<li
			data-slot="public-route-list-item"
			className={cn(
				publicRoutePanelClassName,
				"flex items-start gap-3 p-4 text-sm leading-6 text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function PublicRouteListPanel({
	className,
	...props
}: ComponentProps<"li">) {
	return (
		<li
			data-slot="public-route-list-panel"
			className={cn(publicRoutePanelClassName, className)}
			{...props}
		/>
	);
}

export function PublicRouteStepMarker({
	className,
	...props
}: ComponentProps<"span">) {
	return (
		<span
			data-slot="public-route-step-marker"
			className={cn(
				"flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-xs font-semibold text-background",
				className,
			)}
			{...props}
		/>
	);
}
