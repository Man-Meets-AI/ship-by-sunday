import Link from "next/link";

import { ProductBrand, productWordmarkClassName } from "@/components/product-brand";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import type { HomePageContent } from "@/features/marketing/content/home";

type Hero = HomePageContent["hero"];

export function HomeHeroTopBar({ hero }: { hero: Hero }) {
	return (
		<nav className="flex w-full items-center justify-between px-4 py-4">
			<ProductBrand href={routeConfig.home} labelClassName={productWordmarkClassName} />
			<div className="flex items-center gap-2">
				<Button variant="outline" size="sm" asChild>
					<Link href={routeConfig.docs}>{hero.docsLabel}</Link>
				</Button>
				<Button variant="ghost" size="sm" asChild>
					<Link href={routeConfig.signIn}>{hero.loginLabel}</Link>
				</Button>
			</div>
		</nav>
	);
}
