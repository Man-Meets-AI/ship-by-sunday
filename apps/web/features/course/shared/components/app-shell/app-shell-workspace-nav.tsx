import { ProductBrand, productWordmarkClassName } from "@/components/product-brand";

import { routeConfig } from "@/config/product";

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
	return (
		<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
			<ProductBrand
				href={routeConfig.start}
				labelClassName={productWordmarkClassName}
			/>

			{title && !lesson11Viewport ? (
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
