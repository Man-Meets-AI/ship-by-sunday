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
		<div className="flex shrink-0 items-center">
			<ProductBrand
				href={routeConfig.blueprint}
				labelClassName={productWordmarkClassName}
			/>
		</div>
	);
}
