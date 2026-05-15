import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { routeConfig } from "@/config/product";

export function AccessRequiredHeader() {
	return (
		<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<ProductBrand
				href={routeConfig.home}
				labelClassName={`${productWordmarkClassName} tracking-[0.12em]`}
			/>
			<p className="max-w-xs text-sm leading-6 text-muted-foreground">
				Access Required
			</p>
		</header>
	);
}
