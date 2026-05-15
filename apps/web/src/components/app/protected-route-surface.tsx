import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ProtectedRouteSummaryItem = {
	label: string;
	value: ReactNode;
	detail?: ReactNode;
	mono?: boolean;
};

export const protectedRoutePanelClassName =
	"relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xs/5 not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]";

export function ProtectedRoutePage({
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			data-slot="protected-route-page"
			className={cn(
				"mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-3 pb-12 pt-2 sm:px-4 lg:px-6",
				className,
			)}
			{...props}
		/>
	);
}

export function ProtectedRouteHeader({
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
			data-slot="protected-route-header"
			className={cn(
				"grid gap-4 border-b border-border/60 pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end",
				className,
			)}
			{...props}
		>
			<div className="min-w-0">{children}</div>
			{actions ? (
				<div
					data-slot="protected-route-header-actions"
					className={cn("min-w-0 lg:justify-self-end", actionsClassName)}
				>
					{actions}
				</div>
			) : null}
		</header>
	);
}

export function ProtectedRouteIcon({
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			data-slot="protected-route-icon"
			className={cn(
				"mb-4 flex size-9 items-center justify-center rounded-xl border border-border/70 bg-background/70 text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function ProtectedRouteEyebrow({
	className,
	...props
}: ComponentProps<"p">) {
	return (
		<p
			data-slot="protected-route-eyebrow"
			className={cn(
				"text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function ProtectedRouteTitle({
	className,
	...props
}: ComponentProps<"h1">) {
	return (
		<h1
			data-slot="protected-route-title"
			className={cn(
				"mt-2 text-2xl font-semibold leading-tight text-foreground sm:text-3xl",
				className,
			)}
			{...props}
		/>
	);
}

export function ProtectedRouteDescription({
	className,
	...props
}: ComponentProps<"p">) {
	return (
		<p
			data-slot="protected-route-description"
			className={cn(
				"mt-2 max-w-3xl text-sm leading-6 text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function ProtectedRoutePanel({
	className,
	...props
}: ComponentProps<"section">) {
	return (
		<section
			data-slot="protected-route-panel"
			className={cn(protectedRoutePanelClassName, className)}
			{...props}
		/>
	);
}

export function ProtectedRoutePanelHeader({
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			data-slot="protected-route-panel-header"
			className={cn(
				"relative flex flex-col gap-1.5 border-b border-border/60 px-4 py-3.5 sm:px-5",
				className,
			)}
			{...props}
		/>
	);
}

export function ProtectedRoutePanelTitle({
	className,
	...props
}: ComponentProps<"h2">) {
	return (
		<h2
			data-slot="protected-route-panel-title"
			className={cn("text-sm font-semibold text-foreground", className)}
			{...props}
		/>
	);
}

export function ProtectedRoutePanelDescription({
	className,
	...props
}: ComponentProps<"p">) {
	return (
		<p
			data-slot="protected-route-panel-description"
			className={cn("text-sm leading-6 text-muted-foreground", className)}
			{...props}
		/>
	);
}

export function ProtectedRoutePanelBody({
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			data-slot="protected-route-panel-body"
			className={cn("relative p-4 sm:p-5", className)}
			{...props}
		/>
	);
}

export function ProtectedRouteSummaryGrid({
	"aria-label": ariaLabel,
	className,
	heading,
	items,
	...props
}: ComponentProps<"section"> & {
	heading?: string;
	items: ProtectedRouteSummaryItem[];
}) {
	return (
		<section
			aria-label={ariaLabel ?? heading ?? "Route summary"}
			data-slot="protected-route-summary"
			className={cn(
				"relative grid min-w-0 gap-2 rounded-2xl border border-border/60 bg-card/70 p-3 text-xs text-card-foreground shadow-xs/5",
				className,
			)}
			{...props}
		>
			{heading ? (
				<p className="border-b border-border/60 pb-2 font-medium text-foreground">
					{heading}
				</p>
			) : null}
			<dl className="grid gap-1.5">
				{items.map((item, index) => (
					<div
						key={`${item.label}-${index}`}
						className="grid min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-3"
					>
						<dt className="pt-1 text-muted-foreground">{item.label}</dt>
						<dd
							className={cn(
								"min-w-0 break-words pt-1 text-right font-medium leading-5 text-foreground",
								item.mono ? "break-all font-mono text-[11px]" : null,
							)}
						>
							{item.value}
							{item.detail ? (
								<div className="mt-0.5 text-[11px] font-normal text-muted-foreground">
									{item.detail}
								</div>
							) : null}
						</dd>
					</div>
				))}
			</dl>
		</section>
	);
}
