import Link from "next/link";

import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { routeConfig } from "@/config/product";
import { ThemeToggleButton } from "@/app/_components/theme-toggle-button";

export function BlueprintDemoTopBar() {
	return (
		<div className="flex items-center justify-between gap-4 py-3">
			<ProductBrand
				href={routeConfig.home}
				labelClassName={productWordmarkClassName}
			/>
			<nav
				className="flex items-center gap-3 text-sm sm:gap-5"
				aria-label="Homepage navigation"
			>
				<Link
					href={routeConfig.docs}
					className="hidden text-muted-foreground transition-colors duration-200 hover:text-foreground sm:inline"
				>
					Docs
				</Link>
				<Link
					href={routeConfig.signIn}
					className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
				>
					Sign in
				</Link>
				<ThemeToggleButton className="border-border/70 bg-background/70" />
			</nav>
		</div>
	);
}
