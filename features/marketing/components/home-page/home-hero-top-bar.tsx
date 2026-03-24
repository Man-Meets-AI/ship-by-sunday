import Link from "next/link";

import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import type { HomePageContent } from "@/features/marketing/content/home";
import { isStarterModuleEnabled } from "@/features/starter/lib/starter-selectors";

type Hero = HomePageContent["hero"];

export function HomeHeroTopBar({ hero }: { hero: Hero }) {
	const docsEnabled = isStarterModuleEnabled("docs");

	return (
		<nav className="flex w-full items-center justify-between px-4 py-4">
			<ProductBrand
				href={routeConfig.home}
				labelClassName={productWordmarkClassName}
			/>
			<div className="flex items-center gap-2">
				{docsEnabled ? (
					<Button variant="outline" size="sm" asChild>
						<Link href={routeConfig.docs}>{hero.docsLabel}</Link>
					</Button>
				) : null}
				<Button variant="ghost" size="sm" asChild>
					<Link href={routeConfig.signIn}>{hero.loginLabel}</Link>
				</Button>
			</div>
		</nav>
	);
}
