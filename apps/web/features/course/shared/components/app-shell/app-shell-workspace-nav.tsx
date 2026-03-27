import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";

import { routeConfig } from "@/config/product";

type AppShellWorkspaceNavProps = {
	lesson11Viewport?: boolean;
};

export function AppShellWorkspaceNav({
	lesson11Viewport: _lesson11Viewport = false,
}: AppShellWorkspaceNavProps) {
	return (
		<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
			<ProductBrand
				href={routeConfig.start}
				labelClassName={productWordmarkClassName}
			/>
		</div>
	);
}
