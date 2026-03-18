import type { ElementType, ReactNode } from "react";

export const publicPrimaryActionClassName =
	"sbs-hover-lift sbs-press-feedback inline-flex items-center justify-center rounded-none border border-product-accent bg-product-accent px-6 py-4 font-display text-[2rem] uppercase tracking-[0.04em] text-product-bg transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent sm:text-3xl";

export const publicSecondaryActionClassName =
	"sbs-hover-lift sbs-press-feedback inline-flex items-center justify-center rounded-none border border-product-border bg-product-surface px-6 py-4 font-display text-[2rem] uppercase tracking-[0.04em] text-product-text transition-colors hover:bg-product-surface-alt focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent sm:text-3xl";

export const publicDividerGridClassName =
	"grid gap-[1px] border border-product-border/60 bg-product-border/35";

export function PublicPageFrame({
	children,
	className = "",
	contentClassName = "",
	maxWidthClassName = "max-w-[1280px]",
	centerContent = false,
}: {
	children: ReactNode;
	className?: string;
	contentClassName?: string;
	maxWidthClassName?: string;
	centerContent?: boolean;
}) {
	return (
		<main className={`bg-product-bg text-product-text ${className}`.trim()}>
			<div
				className={`mx-auto flex min-h-screen w-full ${maxWidthClassName} px-3 py-3 sm:px-5 sm:py-5 ${
					centerContent ? "items-center justify-center" : "flex-col gap-4"
				} ${contentClassName}`.trim()}
			>
				{children}
			</div>
		</main>
	);
}

export function PublicSurfaceCard({
	as,
	children,
	className = "",
	id,
}: {
	as?: ElementType;
	children: ReactNode;
	className?: string;
	id?: string;
}) {
	const Component = as ?? "section";

	return (
		<Component
			id={id}
			className={`rounded-none border border-product-border/70 bg-product-surface/78 shadow-panel backdrop-blur-xl ${className}`.trim()}
		>
			{children}
		</Component>
	);
}
