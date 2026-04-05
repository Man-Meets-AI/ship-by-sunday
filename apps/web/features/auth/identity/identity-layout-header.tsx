import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { routeConfig } from "@/config/product";

export function IdentityLayoutHeader() {
	return (
		<header className="absolute inset-x-0 top-0 z-10">
			<div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				<ProductBrand
					href={routeConfig.home}
					labelClassName={productWordmarkClassName}
				/>
				<Button asChild variant="outline" size="sm">
					<Link href={routeConfig.home}>Home</Link>
				</Button>
			</div>
		</header>
	);
}
