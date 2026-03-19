import Link from "next/link";

import { ProductBrand } from "@/components/product-brand";
import { Button } from "@/components/ui/button";

import { productConfig, routeConfig } from "@/config/product";

type AppShellWorkspaceNavProps = {
	title?: string;
	subtitle?: string;
	lesson11Viewport?: boolean;
};

export function AppShellWorkspaceNav({
	title,
	subtitle,
	lesson11Viewport = false,
}: AppShellWorkspaceNavProps) {
	const wordmarkClassName =
		"[font-family:var(--font-bebas-neue),ui-sans-serif,system-ui,sans-serif] text-2xl font-normal leading-none tracking-wide text-foreground sm:text-3xl";

	return (
		<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
			{lesson11Viewport ? (
				<Button
					variant="link"
					asChild
					className="h-auto p-0 text-foreground no-underline hover:no-underline"
				>
					<Link
						href={routeConfig.mission}
						aria-label={productConfig.name}
						className={wordmarkClassName}
					>
						{productConfig.name.toUpperCase()}
					</Link>
				</Button>
			) : (
				<ProductBrand
					href={routeConfig.mission}
					showLogo={false}
					labelClassName={wordmarkClassName}
				/>
			)}

			{title ? (
				<div className="hidden min-w-0 items-center gap-2 border-l border-border/60 pl-3 xl:flex">
					<p className="truncate text-sm font-medium">{title}</p>
					{subtitle ? (
						<p className="max-w-md truncate text-xs text-muted-foreground">
							{subtitle}
						</p>
					) : null}
				</div>
			) : null}
		</div>
	);
}
