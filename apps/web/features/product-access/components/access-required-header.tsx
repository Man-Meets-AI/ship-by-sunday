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
			<div className="inline-flex items-center gap-2 self-start rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-muted-foreground">
				<span className="size-2 rounded-full bg-foreground/40" aria-hidden />
				Access Required
			</div>
		</header>
	);
}
