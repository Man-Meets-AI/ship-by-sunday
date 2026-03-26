import Link from "next/link";

import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { routeConfig } from "@/config/product";

const homeLinkClassName =
	"inline-flex h-9 items-center rounded-full border border-border/70 bg-background/80 px-4 text-sm font-medium text-foreground/80 shadow-sm transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function IdentityLayoutHeader() {
	return (
		<header className="absolute inset-x-0 top-0 z-10">
			<div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				<ProductBrand
					href={routeConfig.home}
					labelClassName={productWordmarkClassName}
				/>
				<Link href={routeConfig.home} className={homeLinkClassName}>
					Home
				</Link>
			</div>
		</header>
	);
}
