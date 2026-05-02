import Link from "next/link";

import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { routeConfig } from "@/config/product";

export function BlueprintDemoTopBar() {
	return (
		<div className="flex items-center justify-between gap-4 py-2">
			<ProductBrand
				href={routeConfig.home}
				labelClassName={productWordmarkClassName}
			/>
			<nav
				className="flex items-center gap-3 text-sm"
				aria-label="Homepage navigation"
			>
				<Link
					href={routeConfig.docs}
					className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline"
				>
					Docs
				</Link>
				<Link
					href={routeConfig.signIn}
					className="text-muted-foreground transition-colors hover:text-foreground"
				>
					Sign in
				</Link>
			</nav>
		</div>
	);
}
